# ADR-006: 平台资源与多租户策略 (Platform Resource & Multi-Tenant Strategy)

## Status

**Status:** ACCEPTED — 阶段A+B已完成, 阶段C进行中  
**Date:** 2026-02-26  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Related:** ADR-001 (HAPI-Inspired Architecture), REVIEW-005 (R-010 Auth/Authz)

---

## Context

### 当前状态

MedXAI 已完成 Phase 1-22 的核心 FHIR 引擎开发：

- **fhir-core**: Model + Parser + Context + Profile + Validator
- **fhir-persistence**: CRUD + History + Search + Bundle + Conditional + Schema + DDL
- **fhir-server**: Fastify REST API (CRUD + Search + Metadata + Bundle)
- **Schema**: 与 Medplum 对齐 (4726 DDL, 3549 tests, 0 failures)

但存在以下关键缺口：

- `spec/platform/profiles-platform.json` 为**空 Bundle**
- 没有平台资源（Project/User/Login 等）→ 无法实现多租户
- REVIEW-005 中 R-010 (Auth/Authz) 仍为 Open 状态

### 问题

1. MedXAI 需要什么平台资源来支持多租户和认证？
2. 多租户隔离采用什么 SQL 策略？
3. 权限控制采用什么模型（RBAC / ABAC / AccessPolicy）？
4. 平台资源定义文件放在哪里？如何加载？如何升级？

### Medplum 分析结果

基于 WF-CUS-001/002/003 的分析，Medplum 定义了 16 个自定义资源，分为四个层级：

- **Tier-0 (系统保护)**: Login, JsonWebKey, DomainConfiguration — 仅 superAdmin
- **Tier-1 (项目管理)**: Project, User, ProjectMembership, UserSecurityRequest — projectAdmin+
- **Tier-2 (应用层)**: ClientApplication, Bot, AccessPolicy, UserConfiguration, Agent
- **Tier-3 (运行时)**: AsyncJob, BulkDataExport, SmartAppLaunch

---

## Decision

### D1: 平台资源最小必要集 (7 个核心资源)

MedXAI Phase 1 实现 **7 个核心平台资源**：

| 资源类型              | Tier | 用途                                   | Medplum 对应 |
| --------------------- | ---- | -------------------------------------- | ------------ |
| **Project**           | 1    | 多租户容器，所有资源归属于某个 Project | ✅ 1:1       |
| **User**              | 1    | 人类用户账号，跨项目存在               | ✅ 1:1       |
| **ProjectMembership** | 1    | 用户-项目-角色关联，权限绑定入口       | ✅ 1:1       |
| **Login**             | 0    | OAuth2 登录会话，JWT 生命周期管理      | ✅ 简化版    |
| **ClientApplication** | 2    | OAuth2 客户端，服务端认证              | ✅ 简化版    |
| **AccessPolicy**      | 2    | 行级访问控制策略                       | ✅ 简化版    |
| **JsonWebKey**        | 0    | JWT 签名密钥                           | ✅ 1:1       |

**暂不实现** (Phase 2+)：

- Bot — 服务端自动化（推荐 Phase 2）
- UserSecurityRequest — 密码重置/MFA（推荐 Phase 2）
- AsyncJob — 异步操作状态（推荐 Phase 2）
- Agent, DomainConfiguration, UserConfiguration, BulkDataExport, SmartAppLaunch — 延后

**理由**：这 7 个资源是实现 "认证 + 多租户 + 权限控制" 的最小闭合集。缺少任何一个都无法形成完整的安全链路。

---

### D2: 多租户隔离策略 — 共享 Schema + compartments 列

**选择方案 A**: 共享 Schema，通过 `compartments` UUID[] 列实现租户隔离。

| 方案                                 | 描述                                                                | 优点                                                                            | 缺点                                        |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| **A: 共享 Schema + compartments** ✅ | 所有租户共用同一组表，资源行的 `compartments` 列包含所属 Project ID | 与 Medplum 一致；复用已有 compartments 基础设施；无 schema 膨胀；跨项目查询简单 | 大规模时需要索引优化                        |
| B: Schema-per-tenant                 | 每个租户独立 PostgreSQL schema                                      | 物理隔离更强                                                                    | 管理复杂度高；DDL 变更需要广播到所有 schema |
| C: Database-per-tenant               | 每个租户独立数据库                                                  | 最强隔离                                                                        | 运维极其复杂；跨租户不可能                  |

**关键实现细节**：

```
资源写入时:
  resource.meta.project = projectId
  compartments = [...patientCompartments, projectId]

资源搜索时:
  WHERE "compartments" @> ARRAY[$projectId]::uuid[]
  AND "deleted" = false

Project 资源自身:
  projectId = project.id (自指)
```

**与现有代码的兼容性**：

- `compartments` UUID[] 列已存在于所有资源表
- `@>` array contains 查询已在 compartment search 中使用
- **零 schema 变更** — 仅需在 write path 增加 project ID 注入

---

### D3: 权限控制模型 — AccessPolicy (参考 Medplum)

**选择**: 基于 AccessPolicy 资源的细粒度权限控制，而非传统 RBAC。

**理由**：

1. AccessPolicy 是 FHIR 原生方式（资源即策略）
2. 支持资源类型级和实例级控制
3. 通过 ProjectMembership 绑定，天然支持多租户
4. Medplum 已验证此模型在生产环境的可行性

**权限层级**：

```
Tier-0: protectedResourceTypes
  Login, JsonWebKey → 仅 superAdmin/system 可操作
  不分配 projectId

Tier-1: projectAdminResourceTypes
  Project, User, ProjectMembership → 需要 admin=true
  AccessPolicy 通配符 '*' 不匹配

Tier-2: 普通资源
  通过 AccessPolicy.resource[] 控制
  支持: resourceType 过滤, criteria 条件, readonly, hiddenFields
```

**AccessPolicy 结构 (MedXAI 简化版)**：

```json
{
  "resourceType": "AccessPolicy",
  "name": "Doctor Read-Write",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Observation",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false,
      "criteria": "Encounter?participant=Practitioner/%profile.id"
    }
  ]
}
```

**Phase 1 实现范围**：

- ✅ `resource[].resourceType` — 资源类型级别 allow/deny
- ✅ `resource[].readonly` — 只读控制
- ✅ `resource[].criteria` — FHIR 搜索条件过滤
- ❌ `resource[].hiddenFields` — 延后 (需要字段级过滤)
- ❌ `resource[].readonlyFields` — 延后
- ❌ `resource[].writeConstraint` — 延后 (需要 FHIRPath)

---

### D4: 平台资源文件位置与加载策略

#### 文件位置

```
spec/
├── fhir/r4/
│   ├── profiles-resources.json      ← FHIR R4 标准资源 (只读)
│   ├── profiles-types.json          ← FHIR R4 类型系统 (只读)
│   └── search-parameters.json       ← FHIR R4 搜索参数 (只读)
├── platform/
│   ├── profiles-medxai.json         ← MedXAI 平台资源定义 (本 ADR 产出)
│   ├── search-parameters-medxai.json← MedXAI 平台搜索参数 (本 ADR 产出)
│   ├── profiles-platform.json       ← 保留为空 (未来扩展用)
│   ├── search-parameters-platform.json ← 保留为空 (未来扩展用)
│   └── README.md                    ← 更新说明
└── cn/                              ← 未来: 中文 Profile (S3)
```

**命名理由**：

- `profiles-medxai.json` — 与 Medplum 的 `profiles-medplum.json` 对应，明确标识为 MedXAI 平台定义
- `profiles-platform.json` — 保留为扩展点，供部署时自定义（类似 Medplum 的 `profiles-platform.json` 用于客户自定义）

#### 加载顺序

```
1. spec/fhir/r4/profiles-types.json       ← 类型系统
2. spec/fhir/r4/profiles-resources.json    ← 标准 FHIR 资源
3. spec/platform/profiles-medxai.json      ← MedXAI 平台资源 (NEW)
4. spec/platform/profiles-platform.json    ← 部署自定义 (保留, 空)
```

后加载的 Bundle 可以 override 同 URL 的定义（`loadBundlesFromFiles` 已支持此语义）。

#### 代码变更

**`init-db.ts`**:

```typescript
// 现在: 只加载 profiles-resources.json
const profilesResult = loadBundleFromFile(
  resolve(specDir, "profiles-resources.json"),
);

// 变更为: 加载 FHIR R4 + MedXAI 平台 profiles
const profilesResult = loadBundlesFromFiles([
  resolve(specDir, "profiles-resources.json"),
  resolve(rootDir, "spec", "platform", "profiles-medxai.json"),
]);
```

**`generate-schema.ts`**:

```typescript
// 同样变更，增加平台 profiles 加载
```

**SearchParameter 同理**:

```typescript
// 加载标准 + 平台搜索参数
// 标准: spec/fhir/r4/search-parameters.json
// 平台: spec/platform/search-parameters-medxai.json
```

#### 版本管理与升级

- 平台资源定义与 MedXAI 代码仓库**同版本管理**（Git tracked）
- 升级路径: 修改 `profiles-medxai.json` → 重新运行 `init-db.ts --reset`
- 未来: 实现增量 migration（类似 Medplum 的 `generateMigrationActions()`）

---

### D5: OperationContext — 统一上下文接口

为避免 S1（多租户）和 S5（Auth）两次修改 `FhirRepository` 公共接口，**S1 即引入 OperationContext**：

```typescript
/**
 * 操作上下文 — 贯穿所有 CRUD/Search 操作
 *
 * S1: 仅使用 project
 * S5: 扩展使用 author, accessPolicy, superAdmin
 */
export interface OperationContext {
  /** 当前操作所属的 Project ID */
  project?: string;

  /** 当前操作的执行者 (User/Bot/ClientApplication 引用) */
  author?: string;

  /** 当前操作绑定的 AccessPolicy ID */
  accessPolicy?: string;

  /** 是否为超级管理员操作 */
  superAdmin?: boolean;
}
```

**S1 阶段**: 所有 CRUD 方法增加可选 `context?: OperationContext` 参数，但仅使用 `project` 字段：

- 写入时: 将 `context.project` 注入到 `compartments` 和 `meta.project`
- 搜索时: 将 `context.project` 作为 WHERE 条件过滤

**S5 阶段**: 扩展 context 的解析逻辑，启用 `author`, `accessPolicy`, `superAdmin`，**不修改方法签名**。

---

### D6: 平台资源的 StructureDefinition 设计原则

每个平台资源遵循以下设计原则：

1. **继承自 DomainResource**: `baseDefinition = "http://hl7.org/fhir/StructureDefinition/DomainResource"`, `derivation = "specialization"`
2. **URL 命名**: `https://medxai.com/fhir/StructureDefinition/{ResourceType}`
3. **与 Medplum 字段对齐**: 核心字段保持一致，便于迁移和对比
4. **适度裁剪**: 初期不需要的字段（如 MFA, SMART, Bot 相关）不定义
5. **snapshot 完整**: 包含完整的 snapshot.element 以供 schema 生成

#### 核心资源字段设计 (简化版)

**Project**:

- name, description, superAdmin, strictMode, checkReferencesOnWrite
- owner (Reference → User), features (code[]), identifier (Identifier[])
- _省略_: setting, secret, systemSetting, systemSecret, site, link, defaultProfile, exportedResourceType

**User**:

- firstName, lastName, email, emailVerified, passwordHash
- project (Reference → Project), identifier (Identifier[])
- _省略_: mfaSecret, mfaRequired, mfaEnrolled, externalId, admin (deprecated)

**ProjectMembership**:

- project (Reference → Project), user (Reference → User|ClientApplication)
- profile (Reference → Practitioner|Patient|ClientApplication)
- accessPolicy (Reference → AccessPolicy), admin, active, userName
- identifier (Identifier[])

**Login**:

- client (Reference → ClientApplication), user (Reference → User)
- membership (Reference → ProjectMembership), project (Reference → Project)
- authMethod, authTime, code, refreshSecret, scope
- granted, revoked, superAdmin
- remoteAddress, userAgent

**ClientApplication**:

- name, description, status, secret, redirectUri
- identifier (Identifier[])
- _省略_: retiringSecret, jwksUri, redirectUris, pkceOptional, SMART, IdentityProvider

**AccessPolicy**:

- name
- resource[] → { resourceType, criteria, readonly }
- _省略_: hiddenFields, readonlyFields, writeConstraint, compartment (deprecated)

**JsonWebKey**:

- active, kty, alg, kid
- n, e, d, p, q, dp, dq, qi (RSA), x, y (EC)

---

## Consequences

### 正面

1. **最小变更**: 复用已有 `compartments` 列实现多租户，零 schema 结构变更
2. **与 Medplum 一致**: 平台资源模型和隔离策略与 Medplum 对齐，降低学习成本
3. **渐进式**: OperationContext 预留 Auth 扩展，S5 无需二次修改接口
4. **管线就绪**: `loadBundlesFromFiles` 已支持多 Bundle 合并加载

### 负面

1. **Schema 膨胀**: 新增 7 个资源 → 7 × 3 = 21 张新表（主表 + History + References）
2. **OperationContext 穿透**: 需要在所有 CRUD/Search 调用链上传递 context
3. **复杂度**: 平台资源的 Tier 分层 + protectedResourceTypes 增加 Repo 复杂度

### 风险

1. **compartments 性能**: 大规模多租户场景下 `@>` 查询可能变慢 → GIN 索引已存在
2. **测试回归**: 修改 CRUD 方法签名（增加 context 参数） → 需要更新大量测试
   - **缓解**: context 参数为 optional，不提供时行为不变

---

## 实施计划

### 阶段 A: 文件与 Schema ✅ 已完成 (2026-02-26)

1. ✅ ADR-006 编写
2. ✅ 创建 `spec/platform/profiles-medxai.json` — 7 个平台资源 StructureDefinition
3. ✅ 创建 `spec/platform/search-parameters-medxai.json` — 20 个平台搜索参数
4. ✅ 更新 `init-db.ts` 和 `generate-schema.ts` 加载路径
5. ✅ 重新生成 DDL — 153 资源类型, 4896 DDL, 7 个平台表确认
6. ✅ 测试验证 — tsc clean, 3549/3549 pass, 0 regressions

**详细记录**: `devdocs/stages/S1-Phase-AB-Platform-Resource-MultiTenant.md`

### 阶段 B: Repository 集成 ✅ 已完成 (2026-02-26)

7. ✅ 定义 `OperationContext` 接口
8. ✅ `FhirRepository` 方法增加 `context?` 参数
9. ✅ 写入路径注入 project ID 到 `projectId` 列 (via `resolveProjectId()`)
10. ✅ 搜索路径增加 project 过滤 (`SearchRequest.project` + SQL WHERE)
11. ✅ 定义 `PROTECTED_RESOURCE_TYPES` 和 `PROJECT_ADMIN_RESOURCE_TYPES`
12. ✅ 测试全量通过 — 3549/3549 pass, 0 regressions

### 阶段 C: Auth 集成 (进行中)

13. JWT 密钥管理 (JsonWebKey + jose 库 + 签发/验证)
14. Auth 路由 (`/auth/login`, `/oauth2/token`)
15. Fastify 认证中间件 (Bearer token → AuthState → OperationContext)
16. AccessPolicy 基础执行 (supportsInteraction + canPerformInteraction)
17. 数据库 Seed (superAdmin Project + User + ClientApplication)
18. Phase C 测试验证

**设计文档**: `devdocs/decisions/ADR-007-Auth-Integration-Strategy.md`  
**详细记录**: `devdocs/stages/S1-Phase-C-Auth-Integration.md`

---

## 确认要求

**请确认以下关键决策后进入实施**：

1. ✅/❌ **D1**: 7 个核心平台资源是否正确？是否需要增减？
2. ✅/❌ **D2**: 共享 Schema + compartments 多租户策略是否接受？
3. ✅/❌ **D3**: 基于 AccessPolicy 的权限模型（非传统 RBAC）是否接受？
4. ✅/❌ **D4**: 文件命名 `profiles-medxai.json` 放在 `spec/platform/` 是否接受？
5. ✅/❌ **D5**: OperationContext 统一接口是否接受？
6. ✅/❌ **D6**: 各资源字段裁剪范围是否合适？

---

## References

- WF-CUS-001: Medplum 自定义资源总览
- WF-CUS-002: 核心安全资源 (Project/User/ProjectMembership/Login)
- WF-CUS-003: 应用层资源 (ClientApplication/Bot/AccessPolicy/Agent)
- ARCHITECTURE.md: 3.3 Infrastructure Services, 3.4 Application Modules
- REVIEW-005 v1.2: R-010 Auth/Authz (Open)
