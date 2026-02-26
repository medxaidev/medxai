# WF-CUS-002: 核心安全资源 — Project / User / ProjectMembership / Login

## 1. Project

### 1.1 资源结构

**定义**: 多租户容器，封装一组资源和配置。每个 Project 是完全隔离的命名空间。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `name` | string | 0..1 | 项目名称 |
| `description` | string | 0..1 | 项目描述 |
| `superAdmin` | boolean | 0..1 | 是否为超级管理员项目 |
| `strictMode` | boolean | 0..1 | 是否启用严格 FHIR 验证 |
| `checkReferencesOnWrite` | boolean | 0..1 | 写入时是否检查引用完整性 |
| `owner` | Reference(User) | 0..1 | 项目所有者 |
| `features` | code[] | 0..* | 启用的功能列表 (binding: project-feature) |
| `defaultPatientAccessPolicy` | Reference(AccessPolicy) | 0..1 | 新患者默认 AccessPolicy |
| `setting` | BackboneElement[] | 0..* | 项目配置 (name + value[x]) |
| `secret` | BackboneElement[] | 0..* | 项目密钥 (同 setting 结构) |
| `systemSetting` | BackboneElement[] | 0..* | 系统级设置 (仅 superAdmin 可见) |
| `systemSecret` | BackboneElement[] | 0..* | 系统级密钥 |
| `site` | BackboneElement[] | 0..* | 站点配置 (domain, Google OAuth, reCAPTCHA) |
| `link` | BackboneElement[] | 0..* | 关联的项目引用 |
| `defaultProfile` | BackboneElement[] | 0..* | 资源类型默认 StructureDefinition profile |
| `exportedResourceType` | code[] | 0..* | 允许导出给关联项目的资源类型 |
| `identifier` | Identifier[] | 0..* | 项目标识符 |

### 1.2 Repository 特殊处理

#### getProjectId()

```
packages/server/src/fhir/repo.ts:1976-1978
```

```typescript
if (updated.resourceType === 'Project') {
  return updated.id;  // Project 的 projectId 就是自身 ID
}
```

#### addProjectFilters() — 搜索时的项目过滤

```
packages/server/src/fhir/repo.ts:1558-1565
```

```typescript
if (
  resourceType === 'Project' || // 搜索 Project 时包含所有项目
  project.id === this.context.currentProject?.id ||
  !project.exportedResourceType?.length ||
  project.exportedResourceType?.includes(resourceType as ResourceType)
) {
  projectIds.push(project.id);
}
```

Project 搜索特殊: 当 `resourceType === 'Project'` 时，包含 **所有** 上下文中的项目 ID，而非仅当前项目。

#### currentProject()

```
packages/server/src/fhir/repo.ts:335-337
```

`RepositoryContext.currentProject` 用于：
- 检查 `strictMode` → 决定验证行为
- 检查 `checkReferencesOnWrite` → 决定引用完整性
- 检查 `features` → 功能开关（如 `google-auth-required`）
- 检查 `setting` → 运行时配置（如 `preCommitSubscriptionsEnabled`）
- 检查 `defaultProfile` → 自动添加 profile
- 检查 `systemSetting` → 系统级行为（如 `legacyFhirJsonResponseFormat`）

### 1.3 数据输入输出点

| 入口 | 触发方式 | 写入操作 |
|------|---------|---------|
| `seedDatabase()` | 服务器首次启动 | 创建 Super Admin Project + R4 Project |
| `POST /Project/$init` | FHIR Operation | 创建 Project + ClientApplication + Practitioner + ProjectMembership |
| `POST /auth/newproject` | Auth API | 同上 |
| `POST /Project/:id/$clone` | FHIR Operation (superAdmin) | 克隆整个项目及其所有资源 |
| `POST /admin/projects/:id` | Admin API | 更新 Project |
| 标准 FHIR CRUD | `/fhir/R4/Project` (projectAdmin+) | CRUD |

### 1.4 创建 Project 的完整流程

**入口**: `createProject()` @ `packages/server/src/fhir/operations/projectinit.ts:122-167`

```
1. systemRepo.createResource<Project>({
     name, owner, strictMode: true,
     features: config.defaultProjectFeatures,
     systemSetting: config.defaultProjectSystemSetting
   })
   → projectId = project.id (自身)

2. createClient(systemRepo, { project, name: '{name} Default Client' })
   → 创建 ClientApplication (带 secret)
   → 创建 ProjectMembership (client → project)

3. (如果有 admin 用户)
   createProfile(project, 'Practitioner', ...)
   → 创建 Practitioner

4. createProjectMembership(systemRepo, admin, project, profile, { admin: true })
   → 创建 ProjectMembership (user → project, profile → Practitioner)
```

### 1.5 副作用与级联

- **创建时**: 自动创建 Default ClientApplication + ProjectMembership
- **删除时**: 无级联删除。但 `$clone` 操作会深拷贝所有项目内资源
- **features 字段**: 运行时功能开关，影响认证流（如 `google-auth-required`）
- **link 字段**: 建立项目间关联，允许通过 `exportedResourceType` 共享资源

---

## 2. User

### 2.1 资源结构

**定义**: 人类用户的系统账号，跨项目存在。一个 User 可以通过多个 ProjectMembership 加入多个项目。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `firstName` | string | 1..1 | 名 |
| `lastName` | string | 1..1 | 姓 |
| `email` | string | 0..1 | 电子邮箱 |
| `emailVerified` | boolean | 0..1 | 邮箱是否已验证 |
| `externalId` | string | 0..1 | 外部系统 ID |
| `admin` | boolean | 0..1 | @deprecated |
| `passwordHash` | string | 0..1 | bcrypt 密码哈希 |
| `mfaSecret` | string | 0..1 | TOTP MFA 密钥 |
| `mfaRequired` | boolean | 0..1 | 是否要求 MFA |
| `mfaEnrolled` | boolean | 0..1 | 是否已注册 MFA |
| `project` | Reference(Project) | 0..1 | 关联的项目（项目范围用户） |
| `identifier` | Identifier[] | 0..* | 用户标识符 |

### 2.2 两种 User 模型

1. **Server-scoped User** (`project` 为空): 跨项目用户，可加入多个项目
2. **Project-scoped User** (`project` 指向某 Project): 仅属于单个项目

### 2.3 Repository 特殊处理

#### getProjectId()

```
packages/server/src/fhir/repo.ts:1984-1987
```

```typescript
if (updated.resourceType === 'User' && this.isSuperAdmin()) {
  return updated?.meta?.project;  // superAdmin 可设置 User 的项目归属
}
```

#### getCompartments()

```
packages/server/src/fhir/repo.ts:1736-1739
```

```typescript
if (resource.resourceType === 'User' && resource.project?.reference && isUUID(resolveId(resource.project) ?? '')) {
  compartments.add(resource.project.reference);
}
```

Project-scoped User 会被加入其项目的 compartment。

### 2.4 数据输入输出点

| 入口 | 触发方式 | 写入操作 |
|------|---------|---------|
| `seedDatabase()` | 首次启动 | 创建 admin User |
| `POST /auth/newuser` | Auth API | 创建 User |
| `POST /Project/$init` | FHIR Operation | 可能创建 User (via `ownerEmail`) |
| `POST /admin/projects/:id/invite` | Admin API | 查找或创建 User |
| `POST /User/:id/$update-email` | FHIR Operation | 更新 User email |
| `POST /auth/changepassword` | Auth API | 更新 User passwordHash |
| `POST /auth/resetpassword` | Auth API | 创建 UserSecurityRequest |
| `POST /auth/mfa/setup` | Auth API | 更新 User mfaSecret |

### 2.5 副作用与级联

- **passwordHash**: 使用 bcrypt 哈希存储 (`auth/utils.ts:bcryptHashPassword`)
- **删除保护**: 如果 User 被 ProjectMembership.user 引用，preCommit 检查会阻止删除
- **$update-email**: 更新 email 后会触发验证邮件发送，并可选更新关联 profile 的 telecom
- **MFA**: mfaSecret 是 TOTP 密钥，mfaEnrolled 在首次验证后设为 true

---

## 3. ProjectMembership

### 3.1 资源结构

**定义**: 用户/客户端/Bot 与项目的关联关系。是 Medplum 多租户和 RBAC 的核心纽带。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `project` | Reference(Project) | 1..1 | 所属项目 |
| `user` | Reference(Bot\|ClientApp\|User) | 1..1 | 关联的主体 |
| `profile` | Reference(Bot\|ClientApp\|Patient\|Practitioner\|RelatedPerson) | 1..1 | FHIR profile 资源 |
| `accessPolicy` | Reference(AccessPolicy) | 0..1 | 绑定的访问策略 |
| `access` | BackboneElement[] | 0..* | 多策略访问配置 |
| `admin` | boolean | 0..1 | 是否为项目管理员 |
| `active` | boolean | 0..1 | 是否激活 |
| `userName` | string | 0..1 | 用户名 |
| `externalId` | string | 0..1 | 外部 ID |
| `invitedBy` | Reference(User) | 0..1 | 邀请人 |
| `identifier` | Identifier[] | 0..* | 成员标识符 |

### 3.2 三种主体类型

ProjectMembership 的 `user` 字段支持三种主体:

| 主体类型 | user 指向 | profile 指向 | 用途 |
|---------|----------|-------------|------|
| 人类用户 | `User/{id}` | `Practitioner/{id}` 或 `Patient/{id}` | 人类操作 |
| 客户端应用 | `ClientApplication/{id}` | `ClientApplication/{id}` | 服务端认证 |
| Bot | `Bot/{id}` | `Bot/{id}` | 自动化执行 |

### 3.3 Repository 特殊处理

#### getProjectId()

```
packages/server/src/fhir/repo.ts:1980-1982
```

```typescript
if (updated.resourceType === 'ProjectMembership') {
  return resolveId(updated.project);  // 从 membership.project 引用解析
}
```

#### preCommitValidation — 引用保护

`precommit.ts` 中 `criticalProjectMembershipReferences`:

```typescript
const criticalProjectMembershipReferences = ['profile', 'user', 'access-policy', 'accessPolicy'];
```

删除 Bot, ClientApplication, Patient, Practitioner, RelatedPerson, User, AccessPolicy 时，检查是否有 ProjectMembership 引用它们。如果有，抛出:

```
Cannot delete {ResourceType}/{id}: referenced by ProjectMembership/{membershipId}
```

### 3.4 数据输入输出点

| 入口 | 触发方式 | 写入操作 |
|------|---------|---------|
| `seedDatabase()` | 首次启动 | 创建 admin membership |
| `POST /Project/$init` | FHIR Operation | 创建 membership |
| `POST /auth/newproject` | Auth API | 创建 membership |
| `POST /admin/projects/:id/invite` | Admin API | upsert membership (serializable tx) |
| `POST /admin/projects/:id/bot` | Admin API | 创建 Bot membership |
| `POST /admin/projects/:id/client` | Admin API | 创建 Client membership |
| `POST /admin/projects/:id/members/:id` | Admin API | 更新 membership |
| `DELETE /admin/projects/:id/members/:id` | Admin API | 删除 membership |
| 标准 FHIR CRUD | `/fhir/R4/ProjectMembership` (projectAdmin+) | CRUD |

### 3.5 在认证流中的作用

**登录流**:
```
1. tryLogin() → 创建 Login 资源
2. getMembershipsForLogin(login) → 搜索 ProjectMembership where user=login.user
3. 如果只有 1 个 membership → 自动选择
4. 如果有多个 → 返回列表，用户选择
5. setLoginMembership(login, membershipId)
   → 读取 ProjectMembership
   → 读取关联 Project
   → 检查 Project features (如 google-auth-required)
   → 获取 AccessPolicy (从 membership 或 UserConfiguration)
   → 检查 IP Access Rules
   → 更新 Login.membership
```

**Token 生成**: `ProjectMembership` 决定了:
- 用户属于哪个 Project
- 用户的 AccessPolicy（行级权限）
- 用户的 profile（author 引用）
- 是否为 admin

### 3.6 副作用与级联

- **创建 Bot/Client 时**: Admin API 同时创建 Bot/ClientApplication 和对应的 ProjectMembership
- **删除 membership**: 需要验证不是项目 owner 的 membership
- **invite upsert**: 使用 `SERIALIZABLE` 事务隔离级别，防止并发创建重复 membership
- **active=false**: 阻止通过该 membership 登录

---

## 4. Login

### 4.1 资源结构

**定义**: OAuth2 登录会话，记录认证过程和状态。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `client` | Reference(ClientApplication) | 0..1 | 发起登录的客户端 |
| `user` | Reference(User) | 0..1 | 认证的用户 |
| `membership` | Reference(ProjectMembership) | 0..1 | 选择的成员身份 |
| `launch` | Reference(SmartAppLaunch) | 0..1 | SMART 启动上下文 |
| `project` | Reference(Project) | 0..1 | 目标项目 |
| `authMethod` | code | 0..1 | 认证方式 (password/google/client/execute) |
| `authTime` | dateTime | 0..1 | 认证时间 |
| `code` | string | 0..1 | 授权码 |
| `cookie` | string | 0..1 | 会话 cookie |
| `refreshSecret` | string | 0..1 | 刷新令牌密钥 |
| `scope` | string | 0..1 | OAuth2 scope |
| `nonce` | string | 0..1 | OpenID Connect nonce |
| `codeChallenge` | string | 0..1 | PKCE code_challenge |
| `codeChallengeMethod` | code | 0..1 | PKCE 方法 |
| `granted` | boolean | 0..1 | 是否已授权 |
| `revoked` | boolean | 0..1 | 是否已撤销 |
| `admin` | boolean | 0..1 | 是否为管理员登录 |
| `superAdmin` | boolean | 0..1 | 是否为超级管理员登录 |
| `profileType` | code | 0..1 | 期望的 profile 类型 |
| `remoteAddress` | string | 0..1 | 客户端 IP |
| `userAgent` | string | 0..1 | 客户端 User-Agent |
| `pictureUrl` | uri | 0..1 | Google 头像 URL |
| `externalAuthMethod` | code | 0..1 | 外部认证方式 |
| `mfaVerified` | boolean | 0..1 | MFA 是否已验证 |

### 4.2 protectedResourceType

Login 是 `protectedResourceTypes` 之一:
- 仅 superAdmin/system 可以读写
- 不分配 projectId
- 不参与 AccessPolicy 过滤

### 4.3 isCacheOnly 优化

```
packages/server/src/fhir/repo.ts:2187-2190
```

```typescript
if (resource.resourceType === 'Login' && (resource.authMethod === 'client' || resource.authMethod === 'execute')) {
  return true;  // 不写入数据库，仅写入 Redis 缓存
}
```

**含义**: `client_credentials` 和 Bot 执行产生的 Login **不持久化到 PostgreSQL**，仅存储在 Redis 中。这是高频操作的性能优化。

### 4.4 数据输入输出点

| 入口 | 触发方式 | 写入操作 |
|------|---------|---------|
| `tryLogin()` | `/auth/login` | 创建 Login (password/google/exchange) |
| `clientCredentialsLogin()` | `/oauth2/token (client_credentials)` | 创建 Login (cache-only) |
| `Bot.$execute` | Bot 执行 | 创建 Login (cache-only) |
| `setLoginMembership()` | `/auth/profile` 或自动 | 更新 Login.membership |
| `newProjectHandler()` | `/auth/newproject` | 更新 Login.membership |
| `POST /oauth2/token` | Token 交换 | 更新 Login.granted=true |
| Token refresh | 刷新令牌 | 新建 Login + 旧 Login revoked |

### 4.5 Login 生命周期

```
         tryLogin()
             │
             ▼
    ┌─────────────────┐
    │  Login created   │  code=random, membership=null
    │  authMethod set  │  refreshSecret=random (if applicable)
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ membership set  │  setLoginMembership()
    │ (profile chosen)│  → 检查 Project features
    └────────┬────────┘  → 获取 AccessPolicy
             │           → 检查 IP rules
    ┌────────▼────────┐
    │ granted=true    │  /oauth2/token (code → token)
    │ token issued    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ revoked=true    │  logout / token refresh
    └─────────────────┘
```

### 4.6 副作用

- **superAdmin Login**: 禁用 refresh token (`refreshSecret = undefined`)
- **MFA 验证**: 如果 User.mfaEnrolled=true，需要额外 MFA 验证步骤
- **IP 检查**: AccessPolicy 可包含 IP 地址限制规则
- **AuditEvent**: 登录成功/失败都会写入 AuditEvent

---

## 5. 资源间交互流程汇总

### 5.1 新项目创建完整流程

```
POST /auth/newproject { login: "xxx", projectName: "My Clinic" }
  │
  ├─ 1. readResource<Login>(loginId)
  ├─ 2. readReference<User>(login.user)
  ├─ 3. createResource<Project>({ name, owner, strictMode:true })
  │     → projectId = project.id
  ├─ 4. createResource<ClientApplication>({ name: "My Clinic Default Client", secret: random })
  │     → meta.project = project.id
  ├─ 5. createResource<ProjectMembership>({ project, user: client, profile: client })
  │     → clientApp 的 membership
  ├─ 6. createResource<Practitioner>({ name, telecom })
  │     → meta.project = project.id
  ├─ 7. createResource<ProjectMembership>({ project, user: admin, profile: practitioner, admin: true })
  │     → admin 的 membership
  └─ 8. updateResource<Login>({ ...login, membership: ref(membership) })
        → 关联 membership 到 login
```

### 5.2 client_credentials 认证流程

```
POST /oauth2/token { grant_type: "client_credentials", client_id: "xxx", client_secret: "yyy" }
  │
  ├─ 1. getClientApplication(clientId)
  │     → readResource<ClientApplication>(clientId)
  ├─ 2. 验证 secret (或 JWKS)
  ├─ 3. getClientApplicationMembership(client)
  │     → searchOne<ProjectMembership>({ user: ref(client) })
  ├─ 4. readReference<Project>(membership.project)
  ├─ 5. getAccessPolicyForLogin({ project, login, membership })
  ├─ 6. createResource<Login>({ authMethod: 'client', ... })
  │     → isCacheOnly=true → 仅写 Redis
  └─ 7. 签发 JWT access_token
        → token 包含: login_id, profile, project_id
```

---

## 6. MedXAI 实现建议

### 6.1 Project

- **必须实现 `projectId` 列**: 这是所有隔离查询的基础
- **简化 features/settings**: 初期可仅支持 `strictMode` 和 `checkReferencesOnWrite`
- **hardcoded R4 Project**: 保留 `r4ProjectId` 常量用于 StructureDefinition/ValueSet/SearchParameter
- **systemResourceProjectId**: Login/JsonWebKey 等系统资源使用

### 6.2 User

- **passwordHash**: 使用 bcrypt（同 Medplum）
- **初期可跳过 MFA**: mfaSecret/mfaRequired/mfaEnrolled 可延后
- **project-scoped vs server-scoped**: 初期可只支持 server-scoped (project=null)

### 6.3 ProjectMembership

- **核心三字段**: `project` + `user` + `profile` 不可或缺
- **accessPolicy**: 必须支持，这是行级权限的入口
- **admin**: 必须支持，用于区分 projectAdmin
- **serializable upsert**: invite 流程使用 SERIALIZABLE 隔离级别

### 6.4 Login

- **cache-only**: 如果 MedXAI 不使用 Redis，client_credentials Login 需要写 DB（或使用内存缓存 + TTL）
- **JWT 签发**: 需要 JsonWebKey 资源存储签名密钥
- **code/refreshSecret**: 使用 `crypto.randomBytes` 生成
- **生命周期**: 需要实现 created → membership_set → granted → revoked 状态机
