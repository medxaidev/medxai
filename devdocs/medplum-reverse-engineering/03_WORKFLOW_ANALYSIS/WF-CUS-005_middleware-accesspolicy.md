# WF-CUS-005: 认证中间件与 AccessPolicy 执行引擎

## 1. 概述

本文档分析 Medplum 从 HTTP 请求到 Repository 操作的完整认证链，包括：
- 请求上下文中间件 (`context.ts`)
- Token 解析与 AuthState 构建 (`oauth/middleware.ts` → `oauth/utils.ts`)
- Repository 构建与 AccessPolicy 绑定 (`fhir/accesspolicy.ts`)
- AccessPolicy 在 Repository 中的四层执行机制

## 2. 请求上下文中间件

**文件**: `packages/server/src/context.ts`

### 2.1 中间件注册

`attachRequestContext` 作为 Express 全局中间件，在所有路由之前执行：

```
app.ts 中注册顺序:
  app.use(attachRequestContext)     ← 构建请求上下文
  app.use('/auth', authRouter)      ← 认证路由 (大部分不需要认证)
  app.use('/oauth2', oauthRouter)   ← OAuth2 路由
  app.use('/fhir/R4', authenticateRequest, fhirRouter)  ← FHIR 路由 (需认证)
  app.use('/admin', authenticateRequest, adminRouter)    ← Admin 路由 (需认证)
```

### 2.2 attachRequestContext 完整流程

```
attachRequestContext(req, res, next)
  │
  ├─ 生成 { requestId: UUID, traceId: UUID 或 header }
  │   ← 支持 x-trace-id, traceparent, x-amzn-trace-id
  │
  ├─ authenticateTokenImpl(req)
  │   │
  │   ├─ 解析 Authorization header:
  │   │   ├─ "Bearer <token>" → getLoginForAccessToken(req, token)
  │   │   ├─ "Basic <base64>"  → getLoginForBasicAuth(req, token)
  │   │   └─ 无 header / 其他  → undefined
  │   │
  │   └─ 返回 AuthState | undefined
  │
  ├─ 如果有 authState:
  │   ├─ getRepoForLogin(authState, isExtendedMode(req))
  │   │   → 构建 Repository (包含 AccessPolicy)
  │   └─ ctx = new AuthenticatedRequestContext(requestId, traceId, authState, repo)
  │       → 绑定 fhirRateLimiter (基于 project.systemSetting + userConfig)
  │       → 绑定 resourceCap (基于 project.systemSetting)
  │
  └─ 如果无 authState:
      └─ ctx = new RequestContext(requestId, traceId)
          → 未认证上下文

  → requestContextStore.run(ctx, () => next())
    // 使用 AsyncLocalStorage 在整个请求生命周期内传递上下文
```

### 2.3 AuthState 结构

```typescript
interface AuthState {
  login: Login;                              // 登录会话
  project: WithId<Project>;                  // 当前项目
  membership: WithId<ProjectMembership>;     // 当前成员身份
  userConfig: UserConfiguration;             // 用户配置
  accessToken?: string;                      // 原始 access_token

  onBehalfOf?: WithId<ProfileResource>;           // 委托人的 profile
  onBehalfOfMembership?: WithId<ProjectMembership>; // 委托人的 membership
}
```

### 2.4 AuthenticatedRequestContext 结构

```typescript
class AuthenticatedRequestContext extends RequestContext {
  authState: Readonly<AuthState>;
  repo: Repository;                  // 已绑定 AccessPolicy 的仓库实例
  isAsync: boolean;                  // 是否异步操作
  fhirRateLimiter?: FhirRateLimiter; // FHIR 操作速率限制器
  resourceCap?: ResourceCap;         // 资源配额限制器

  // 便捷访问器:
  get project()     → authState.project
  get membership()  → authState.onBehalfOfMembership ?? authState.membership
  get login()       → authState.login
  get profile()     → membership.profile
}
```

### 2.5 authenticateRequest 中间件

```typescript
// oauth/middleware.ts
function authenticateRequest(req, res, next) {
  const ctx = getRequestContext();
  if (ctx instanceof AuthenticatedRequestContext) {
    next();  // 已认证，放行
  } else {
    next(new OperationOutcomeError(unauthorized));  // 401
  }
}
```

**关键设计**: `attachRequestContext` 在所有路由前运行，**尽力认证**但不强制。`authenticateRequest` 是**强制认证**的守卫，仅用于需要认证的路由。

### 2.6 getLoginForAccessToken 详解

```
getLoginForAccessToken(req, accessToken)
  │
  ├─ 1. tryExternalAuth(req, accessToken)
  │     → 如果 config.externalAuthProviders 配置了外部认证
  │     → 检查 token 的 iss 是否匹配
  │     → Redis 缓存 / 外部 UserInfo 验证
  │     → 返回 AuthState 或 undefined
  │
  ├─ 2. verifyJwt(accessToken)
  │     → 验证签名、有效期、issuer
  │     → 返回 { payload: MedplumAccessTokenClaims }
  │
  ├─ 3. systemRepo.readResource<Login>(claims.login_id)
  │     → Login 不存在或无 membership 或 revoked → undefined
  │
  ├─ 4. systemRepo.readReference<ProjectMembership>(login.membership)
  │     → membership.active === false → undefined
  │
  ├─ 5. systemRepo.readReference<Project>(membership.project)
  │
  ├─ 6. getUserConfiguration(systemRepo, project, membership)
  │
  ├─ 7. 构建 AuthState { login, project, membership, userConfig, accessToken }
  │
  └─ 8. tryAddOnBehalfOf(req, authState)
        → 如果有 x-medplum-on-behalf-of header
```

---

## 3. Repository 构建与 AccessPolicy 绑定

**文件**: `packages/server/src/fhir/accesspolicy.ts`

### 3.1 getRepoForLogin — Repository 工厂

```
getRepoForLogin(authState, extendedMode?)
  │
  ├─ 确定 membership:
  │   └─ onBehalfOfMembership ?? realMembership
  │
  ├─ getAccessPolicyForLogin(authState)
  │   → 构建最终 AccessPolicy (详见 §3.2)
  │
  ├─ systemRepo.readReference(membership.project)
  │   → 当前项目
  │
  ├─ 构建 allowedProjects:
  │   ├─ [当前项目] (始终包含)
  │   └─ + project.link[] 中的关联项目
  │       → systemRepo.readReferences<Project>(linkedProjectRefs)
  │       → 忽略不存在的关联
  │
  └─ new Repository({
       projects: allowedProjects,          // 允许访问的项目列表
       currentProject: project,            // 当前项目 (用于功能检查)
       author: realMembership.profile,     // 写入时的 meta.author
       remoteAddress: login.remoteAddress,
       superAdmin: project.superAdmin,
       projectAdmin: membership.admin,
       accessPolicy,                       // 最终的 AccessPolicy
       strictMode: project.strictMode,
       extendedMode,                       // x-medplum: extended
       checkReferencesOnWrite: project.checkReferencesOnWrite,
       validateTerminology: project.features?.includes('validate-terminology'),
       onBehalfOf: authState.onBehalfOf ? ref(onBehalfOf) : undefined,
     })
```

### 3.2 getAccessPolicyForLogin — AccessPolicy 构建管线

```
getAccessPolicyForLogin(authState)
  │
  ├─ Step 1: buildAccessPolicy(membership)
  │   │
  │   ├─ 收集所有 AccessPolicy 源:
  │   │   ├─ membership.accessPolicy → [{ policy: ref }]
  │   │   └─ membership.access[] → [{ policy: ref, parameter: [...] }]
  │   │
  │   ├─ 对每个 access 条目:
  │   │   ├─ systemRepo.readReference(access.policy)
  │   │   │   → 读取 AccessPolicy 资源
  │   │   │
  │   │   ├─ 参数化替换:
  │   │   │   params = access.parameter + [
  │   │   │     { name:'profile', valueReference: membership.profile },
  │   │   │     { name:'patient', valueReference: membership.profile }
  │   │   │   ]
  │   │   │   → JSON.stringify(policy)
  │   │   │     .replaceAll('%profile.id', profileId)
  │   │   │     .replaceAll('%profile', profileRef)
  │   │   │     .replaceAll('%patient.id', patientId)
  │   │   │     .replaceAll('%patient', patientRef)
  │   │   │   → JSON.parse(result)
  │   │   │
  │   │   │   示例: criteria: "Patient?_id=%patient.id"
  │   │   │         → "Patient?_id=abc-123"
  │   │   │
  │   │   ├─ 收集 resource[] 条目
  │   │   │   → 如果 readonly=true 且无 interaction
  │   │   │     → 自动设置 interaction=['search','read','history','vread']
  │   │   │
  │   │   └─ 收集 ipAccessRule[]
  │   │
  │   ├─ 如果无任何 AccessPolicy:
  │   │   → 添加 { resourceType: '*' } (全权限)
  │   │
  │   └─ addDefaultResourceTypes(resourcePolicies)
  │       → 确保有 SearchParameter (readonly)
  │       → 确保有 StructureDefinition (readonly)
  │
  ├─ Step 2: applySmartScopes(accessPolicy, login.scope)
  │   │
  │   ├─ 解析 SMART scopes:
  │   │   "user/Patient.rs user/Observation.cruds"
  │   │   → [
  │   │       { permissionType:'user', resourceType:'Patient', scope:'rs' },
  │   │       { permissionType:'user', resourceType:'Observation', scope:'cruds' }
  │   │     ]
  │   │
  │   └─ 取交集: AccessPolicy ∩ SMART scopes
  │       → 只保留 SMART scope 中包含的资源类型
  │       → scope='rs' → readonly=true
  │       → scope 中含 criteria → 追加到 policy.criteria
  │
  └─ Step 3: applyProjectAdminAccessPolicy(project, membership, accessPolicy)
      │
      ├─ project.superAdmin:
      │   → 添加所有 projectAdminResourceTypes 的全权限
      │
      ├─ membership.admin:
      │   → 移除通配 projectAdminResourceTypes
      │   → 添加:
      │     Project:
      │       criteria: "Project?_id={projectId}"
      │       readonlyFields: ['features','link','systemSetting']
      │       hiddenFields: ['superAdmin','systemSecret','strictMode']
      │     Project (linked, readonly):
      │       hiddenFields: ['superAdmin','setting','systemSetting',
      │                      'secret','systemSecret','strictMode']
      │     ProjectMembership:
      │       readonlyFields: ['project','user']
      │     UserSecurityRequest:
      │       readonly: true
      │     User:
      │       hiddenFields: ['passwordHash','mfaSecret']
      │       readonlyFields: ['email','emailVerified','mfaEnrolled','project']
      │
      └─ 普通用户:
          → 移除所有 projectAdminResourceTypes
          → 普通用户无法访问 Project/User/ProjectMembership/UserSecurityRequest
```

---

## 4. AccessPolicy 四层执行机制

AccessPolicy 在 Repository (`packages/server/src/fhir/repo.ts`) 中通过四个层次执行：

### 4.1 Layer 1: 类型级前置检查 — supportsInteraction()

**调用时机**: CRUD 操作最开始，在读取任何数据之前。

```
repo.ts:2113-2121

supportsInteraction(interaction, resourceType): boolean
  │
  ├─ protectedResourceTypes.includes(resourceType) && !superAdmin
  │   → false (DomainConfiguration/JsonWebKey/Login)
  │
  ├─ 无 accessPolicy → true (无限制)
  │
  └─ accessPolicySupportsInteraction(accessPolicy, interaction, resourceType)
      │
      └─ accessPolicy.resource.some(policy =>
           shallowMatchesResourcePolicy(policy, resourceType, interaction))
         │
         ├─ policy.resourceType !== resourceType
         │   && (policy.resourceType !== '*'
         │       || projectAdminResourceTypes.includes(resourceType))
         │   → false
         │   // 注意: '*' 通配符不匹配 projectAdminResourceTypes
         │
         ├─ 无 interaction 列表 → 使用 readonly 判断
         │   → !readonly || readInteractions.includes(interaction)
         │
         └─ 有 interaction 列表 → policy.interaction.includes(interaction)
```

**性能意义**: 在数据库查询前快速拒绝无权限的操作。

### 4.2 Layer 2: 实例级检查 — canPerformInteraction()

**调用时机**: 读取资源后 / 写入前，检查具体资源实例。

```
repo.ts:2130-2146

canPerformInteraction(interaction, resource): AccessPolicyResource | undefined
  │
  ├─ protectedResourceTypes + !superAdmin → undefined
  │
  ├─ 项目归属检查 (非 superAdmin):
  │   ├─ 读操作: resource.meta.project ∈ context.projects[].id
  │   │   → 允许读取当前项目 + 关联项目的资源
  │   └─ 写操作: resource.meta.project === context.projects[0].id
  │       → 只允许写入当前(主)项目的资源
  │
  └─ satisfiedAccessPolicy(resource, interaction, accessPolicy)
      │
      └─ accessPolicy.resource.find(policy =>
           matchesAccessPolicyResourcePolicy(resource, interaction, policy))
         │
         ├─ shallowMatchesResourcePolicy (同上)
         │
         ├─ policy.compartment 检查 (@deprecated):
         │   → resource.meta.compartment 包含 policy.compartment
         │
         └─ policy.criteria 检查:
             → matchesSearchRequest(resource, parseSearchRequest(criteria))
             // 在内存中评估 FHIR 搜索条件是否匹配
             // 例: criteria="Patient?organization=Organization/123"
             //     检查 resource.organization === "Organization/123"
```

**返回值**: 匹配的 `AccessPolicyResource` (包含 hiddenFields/readonlyFields/writeConstraint) 或 `undefined`。

### 4.3 Layer 3: 搜索过滤 — addAccessPolicyFilters()

**调用时机**: 搜索操作时，将 AccessPolicy 转换为 SQL WHERE 条件。

```
repo.ts:1576-1634

addAccessPolicyFilters(builder, resourceType)
  │
  ├─ 无 accessPolicy → 跳过
  ├─ resourceType === 'Binary' → 跳过 (Binary 无搜索参数)
  │
  ├─ 遍历 accessPolicy.resource[]:
  │   │
  │   ├─ policy.resourceType !== resourceType && !== '*' → 跳过
  │   │
  │   ├─ policy.compartment → (deprecated)
  │   │   expressions.push(compartments ARRAY_OVERLAPS compartmentId)
  │   │
  │   ├─ policy.criteria 存在:
  │   │   ├─ 验证 criteria 格式: 必须以 "{resourceType}?" 开头
  │   │   ├─ 通配符处理: "*?..." → "{resourceType}?..."
  │   │   ├─ parseSearchRequest(criteria)
  │   │   └─ buildSearchExpression(searchRequest)
  │   │       → 转换为 SQL 条件
  │   │
  │   └─ 无 compartment 无 criteria → return (允许全部)
  │
  └─ 如果有条件:
      builder.predicate.push(new Disjunction(expressions))
      // 多个 AccessPolicy resource 条目之间是 OR 关系
```

**SQL 示例**:

```sql
-- AccessPolicy:
-- resource[0]: { resourceType:'Patient', criteria:'Patient?organization=Organization/123' }
-- resource[1]: { resourceType:'Patient', criteria:'Patient?_compartment=Patient/456' }

SELECT * FROM "Patient"
WHERE "projectId" IN ('project-id')
  AND "deleted" = false
  AND (
    "organization" = 'Organization/123'     -- resource[0]
    OR "compartments" && ARRAY['Patient/456'] -- resource[1]
  )
```

### 4.4 Layer 4: 字段级控制

#### 4.4a removeHiddenFields() — 读取时隐藏字段

```
repo.ts:2203-2216

removeHiddenFields(input)
  │
  ├─ satisfiedAccessPolicy(input, 'read', accessPolicy)
  │   → 找到匹配的 policy
  │
  ├─ 遍历 policy.hiddenFields:
  │   → delete input[field]  (支持嵌套路径: "a.b.c")
  │
  └─ 非 extendedMode 时:
      → delete meta.author
      → delete meta.project
      → delete meta.account
      → delete meta.compartment
```

**影响**: 用户永远看不到 hiddenFields 中的字段值，也无法修改它们。

#### 4.4b restoreReadonlyFields() — 写入时保护字段

```
repo.ts:2226-2255

restoreReadonlyFields(input, original)
  │
  ├─ satisfiedAccessPolicy(original ?? input, interaction, accessPolicy)
  │
  ├─ 收集需保护的字段:
  │   fieldsToRestore = [...readonlyFields, ...hiddenFields]
  │
  └─ 遍历 fieldsToRestore:
      ├─ delete input[field]  (移除用户提交的值)
      └─ 如果有 original (更新操作):
          → input[field] = original[field]  (恢复原始值)
          // 仅支持顶层字段，不支持 choice-of-type
```

**效果**: readonlyFields 在更新时保持不变，hiddenFields 在创建时为空、更新时保持不变。

#### 4.4c isResourceWriteable() — 写入约束检查

```
repo.ts:2155-2179

isResourceWriteable(previous, current, interaction)
  │
  ├─ canPerformInteraction(interaction, current)
  │   → 获取匹配的 policy (或 undefined → 拒绝)
  │
  ├─ 无 writeConstraint → true
  │
  └─ 遍历 policy.writeConstraint[]:
      → evalFhirPathTyped(
          constraint.expression,
          [{ type: resourceType, value: current }],
          {
            '%before': { type: previous?.resourceType, value: previous },
            '%after': { type: current.resourceType, value: current }
          }
        )
      → 所有约束必须返回 [true] 才允许写入
```

**writeConstraint 示例**:

```json
{
  "resourceType": "Observation",
  "writeConstraint": [
    {
      "expression": "%after.status = 'final' implies %before.status = 'preliminary'"
    }
  ]
}
```

---

## 5. 权限层级总结

```
                    ┌─────────────────────────┐
                    │      SuperAdmin         │
                    │  (project.superAdmin)    │
                    │  - 无 AccessPolicy 限制  │
                    │  - 可访问所有资源类型     │
                    │  - 可访问 protectedTypes │
                    │  - 无 refresh token      │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │    Project Admin        │
                    │  (membership.admin)      │
                    │  - 有 AccessPolicy       │
                    │  - 可访问 adminTypes     │
                    │    (受限: readonly字段)   │
                    │  - 不可修改 features     │
                    │  - 不可见 systemSecret   │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │    Regular User         │
                    │  (无 admin 标记)         │
                    │  - 有 AccessPolicy       │
                    │  - 不可访问 adminTypes   │
                    │  - 不可访问 protectedTypes│
                    │  - 受 criteria 限制      │
                    │  - 受 hiddenFields 限制  │
                    │  - 受 writeConstraint 限制│
                    └─────────────────────────┘
```

## 6. 特殊 Repository 实例

### 6.1 SystemRepo

```typescript
// repo.ts
function getSystemRepo(): Repository {
  return new Repository({
    superAdmin: true,
    // 无 projects 限制
    // 无 accessPolicy
    // 无 author
  });
}
```

**用途**: 认证流程、Seed、后台任务等需要跨项目无限制访问的场景。

**安全边界**: 仅在服务器内部代码使用，不暴露给 HTTP 请求。

### 6.2 异步上下文 Repository

```typescript
// context.ts
async function runInAsyncContext(authState, fn) {
  const repo = await getRepoForLogin(authState, true);  // extendedMode=true
  // 在异步上下文中运行 (如 Bot 执行、Subscription 处理)
}
```

---

## 7. 速率限制与资源配额

### 7.1 FhirRateLimiter

```
构建位置: AuthenticatedRequestContext 构造函数

限制来源:
  1. project.systemSetting['userFhirQuota']     → 项目级默认用户限额
  2. userConfig.option['fhirQuota']              → 用户级覆盖限额
  3. config.defaultFhirQuota                     → 全局默认限额
  4. projectLimit = perProjectLimit ?? userLimit * 10  → 项目总限额

实现: Redis 计数器 (per-user + per-project)
```

### 7.2 ResourceCap

```
构建位置: AuthenticatedRequestContext 构造函数

限制来源:
  project.systemSetting['resourceCap']  → 项目资源总数上限

排除: protectedResourceTypes + projectAdminResourceTypes
实现: Redis 计数器
```

---

## 8. 完整请求生命周期

```
HTTP Request
  │
  ▼
attachRequestContext (全局中间件)
  ├─ authenticateTokenImpl(req)
  │   ├─ Bearer token → verifyJwt → readLogin → readMembership → readProject
  │   └─ Basic auth → readClient → verifySecret → getMembership
  ├─ getRepoForLogin(authState)
  │   ├─ getAccessPolicyForLogin() → buildAccessPolicy → applySmartScopes → applyProjectAdmin
  │   └─ new Repository({ projects, accessPolicy, superAdmin, projectAdmin, ... })
  └─ new AuthenticatedRequestContext(authState, repo)
      └─ requestContextStore.run(ctx, next)
  │
  ▼
authenticateRequest (路由级守卫, 仅需认证的路由)
  └─ ctx instanceof AuthenticatedRequestContext? → next() : 401
  │
  ▼
路由 Handler (如 fhirRouter)
  │
  ▼
ctx.repo.createResource / readResource / updateResource / searchResources
  │
  ├─ Layer 1: supportsInteraction(interaction, resourceType)
  │   → protectedTypes + AccessPolicy 类型级检查
  │
  ├─ Layer 2: canPerformInteraction(interaction, resource)
  │   → projectId 归属 + criteria 匹配
  │
  ├─ Layer 3: addAccessPolicyFilters(builder, resourceType)  [搜索时]
  │   → criteria → SQL WHERE (Disjunction)
  │
  ├─ Layer 4a: restoreReadonlyFields(input, original)  [写入时]
  │   → readonlyFields + hiddenFields 恢复
  │
  ├─ Layer 4b: isResourceWriteable(previous, current)  [写入时]
  │   → writeConstraint FHIRPath 评估
  │
  └─ Layer 4c: removeHiddenFields(output)  [读取时]
      → hiddenFields 删除 + meta 字段清理
```

---

## 9. AccessPolicy 示例

### 9.1 只读患者数据

```json
{
  "resourceType": "AccessPolicy",
  "resource": [
    {
      "resourceType": "Patient",
      "criteria": "Patient?_id=%patient.id",
      "readonly": true
    },
    {
      "resourceType": "Observation",
      "criteria": "Observation?patient=%patient",
      "readonly": true
    }
  ]
}
```

**参数化**: `%patient` 在 `buildAccessPolicyResources` 中替换为 `membership.profile` 引用。

### 9.2 部门级隔离

```json
{
  "resourceType": "AccessPolicy",
  "resource": [
    {
      "resourceType": "*",
      "criteria": "*?_compartment=Organization/%organization.id"
    }
  ]
}
```

通过 `ProjectMembership.access[].parameter` 传入 `organization` 引用。

### 9.3 字段级控制

```json
{
  "resourceType": "AccessPolicy",
  "resource": [
    {
      "resourceType": "Patient",
      "hiddenFields": ["identifier", "telecom", "address"],
      "readonlyFields": ["gender", "birthDate"]
    }
  ]
}
```

### 9.4 写入约束

```json
{
  "resourceType": "AccessPolicy",
  "resource": [
    {
      "resourceType": "Task",
      "writeConstraint": [
        {
          "expression": "%after.status != 'completed' or %before.status = 'in-progress'"
        }
      ]
    }
  ]
}
```

### 9.5 交互级控制

```json
{
  "resourceType": "AccessPolicy",
  "resource": [
    {
      "resourceType": "Patient",
      "interaction": ["read", "search"]
    },
    {
      "resourceType": "Observation",
      "interaction": ["create", "read", "search", "update"]
    }
  ]
}
```

---

## 10. MedXAI 实现建议

### 10.1 必须实现

| 组件 | 说明 |
|------|------|
| **attachRequestContext** | AsyncLocalStorage 请求上下文，token 解析 + AuthState 构建 |
| **authenticateRequest** | 强制认证守卫 |
| **getRepoForLogin** | Repository 工厂，绑定项目 + AccessPolicy |
| **supportsInteraction** | 类型级前置检查 (快速拒绝) |
| **canPerformInteraction** | 实例级检查 (projectId + criteria) |
| **addAccessPolicyFilters** | 搜索时 criteria → SQL WHERE |
| **removeHiddenFields** | 读取时字段隐藏 |
| **restoreReadonlyFields** | 写入时字段保护 |
| **protectedResourceTypes** | DomainConfiguration/JsonWebKey/Login 仅 system 访问 |
| **projectAdminResourceTypes** | 不受 `*` 通配匹配 |

### 10.2 可简化

| 组件 | 建议 |
|------|------|
| **SMART scopes** | 初期可不支持 SMART scope → AccessPolicy 交集 |
| **writeConstraint** | 需要 FHIRPath 评估器，可延后 |
| **compartment (deprecated)** | 可跳过，使用 criteria 替代 |
| **On-Behalf-Of** | 委托认证，可延后 |
| **FhirRateLimiter** | 需要 Redis，可延后 |
| **ResourceCap** | 需要 Redis，可延后 |
| **externalAuthProviders** | 外部 IdP 直接 token 验证，可延后 |
| **extendedMode** | meta.author/project 等仅 extended 模式可见，初期可始终暴露 |

### 10.3 关键实现顺序

```
1. RequestContext + AsyncLocalStorage
2. JWT 验证 (verifyJwt)
3. getLoginForAccessToken → AuthState
4. getRepoForLogin → Repository (基本版)
5. supportsInteraction + canPerformInteraction
6. addAccessPolicyFilters (criteria → SQL)
7. removeHiddenFields + restoreReadonlyFields
8. applyProjectAdminAccessPolicy
```
