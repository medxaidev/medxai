# WF-CUS-001: Medplum 自定义资源总览

## 1. 概述

Medplum 在标准 FHIR R4 资源之外，通过 `profiles-medplum.json` 定义了 **16 个自定义资源类型** 和 **1 个自定义复合类型**，用于实现多租户隔离、身份认证、访问控制、自动化（Bot）、异步任务等平台级功能。

**定义文件**: `packages/definitions/src/fhir/r4/profiles-medplum.json`

所有自定义资源继承自 `DomainResource`，在数据库中与标准 FHIR 资源共用相同的表结构模式（主表 + History 表 + References 表 + Lookup 表）。

## 2. 资源分类矩阵

| 类别                 | 资源类型              | 权限层级                                        | 数据库存储                   | 核心用途                 |
| -------------------- | --------------------- | ----------------------------------------------- | ---------------------------- | ------------------------ |
| **Tier-0: 系统保护** | `Login`               | `protectedResourceTypes` — 仅 superAdmin/system | DB + Cache (部分 cache-only) | OAuth 登录会话           |
| **Tier-0: 系统保护** | `JsonWebKey`          | `protectedResourceTypes` — 仅 superAdmin/system | DB                           | JWT 签名密钥             |
| **Tier-0: 系统保护** | `DomainConfiguration` | `protectedResourceTypes` — 仅 superAdmin/system | DB                           | 域名到项目映射           |
| **Tier-1: 项目管理** | `Project`             | `projectAdminResourceTypes` — projectAdmin+     | DB                           | 多租户项目容器           |
| **Tier-1: 项目管理** | `User`                | `projectAdminResourceTypes` — projectAdmin+     | DB                           | 人类用户账号             |
| **Tier-1: 项目管理** | `ProjectMembership`   | `projectAdminResourceTypes` — projectAdmin+     | DB                           | 用户-项目-角色关联       |
| **Tier-1: 项目管理** | `UserSecurityRequest` | `projectAdminResourceTypes` — projectAdmin+     | DB                           | 密码重置/MFA 请求        |
| **Tier-2: 应用层**   | `ClientApplication`   | 普通 FHIR CRUD (通过 AccessPolicy)              | DB                           | OAuth2 客户端应用        |
| **Tier-2: 应用层**   | `Bot`                 | 普通 FHIR CRUD                                  | DB                           | 服务器端自动化脚本       |
| **Tier-2: 应用层**   | `AccessPolicy`        | 普通 FHIR CRUD                                  | DB                           | 细粒度访问控制策略       |
| **Tier-2: 应用层**   | `UserConfiguration`   | 普通 FHIR CRUD                                  | DB                           | 用户 UI 配置             |
| **Tier-2: 应用层**   | `Agent`               | 普通 FHIR CRUD                                  | DB                           | 本地网络代理 (HL7/DICOM) |
| **Tier-3: 运行时**   | `AsyncJob`            | 普通 FHIR CRUD                                  | DB                           | 异步批量操作状态         |
| **Tier-3: 运行时**   | `BulkDataExport`      | 普通 FHIR CRUD                                  | DB                           | $export 操作状态         |
| **Tier-3: 运行时**   | `SmartAppLaunch`      | 普通 FHIR CRUD                                  | DB                           | SMART on FHIR 启动上下文 |
| **Tier-4: 逻辑型**   | `ViewDefinition`      | N/A (logical)                                   | 不持久化                     | SQL-on-FHIR 视图定义     |
| **复合类型**         | `IdentityProvider`    | 嵌入在 ClientApplication 中                     | 随宿主资源存储               | 外部 IdP 配置            |

## 3. 权限层级体系

### 3.1 protectedResourceTypes（Tier-0）

**定义位置**: `packages/core/src/access.ts:15`

```typescript
export const protectedResourceTypes = [
  "DomainConfiguration",
  "JsonWebKey",
  "Login",
];
```

**行为**:

- `repo.supportsInteraction()` 对非 superAdmin 返回 `false` → 完全阻止 CRUD
- `repo.canPerformInteraction()` 对非 superAdmin 返回 `undefined` → 阻止读取
- 不参与 projectId 分配（`getProjectId()` 返回 `undefined`）
- `$export` 操作跳过这些类型
- ResourceCap（资源配额）计数排除这些类型

### 3.2 projectAdminResourceTypes（Tier-1）

**定义位置**: `packages/core/src/access.ts:21`

```typescript
export const projectAdminResourceTypes = [
  "UserSecurityRequest",
  "Project",
  "ProjectMembership",
  "User",
];
```

**行为**:

- AccessPolicy 通配符 `resourceType: '*'` **不匹配**这些类型 → 必须显式声明
- 需要 `projectAdmin: true` 或 `superAdmin: true` 才能操作
- 专用的管理 API 路由 (`/admin/projects/...`)
- ResourceCap 计数排除这些类型

### 3.3 普通资源（Tier-2/3）

- 通过标准 FHIR CRUD 路径 (`/fhir/R4/{ResourceType}`) 操作
- 受 AccessPolicy 约束
- 参与标准的 projectId 分配和 compartment 隔离

## 4. Repository 写入路径中的特殊处理

以下是 `Repository` (`packages/server/src/fhir/repo.ts`) 中对自定义资源的所有特殊分支：

### 4.1 getProjectId() — 项目归属

```
repo.ts:1975-2002
```

| 资源类型                 | projectId 逻辑                                      |
| ------------------------ | --------------------------------------------------- |
| `Project`                | `project.id`（自身 ID）                             |
| `ProjectMembership`      | `resolveId(membership.project)`（所属项目）         |
| `User` (superAdmin)      | `user.meta.project`（可由 superAdmin 设置）         |
| `protectedResourceTypes` | `undefined`（无项目归属）                           |
| 其他                     | `existing.meta.project` 或 `context.projects[0].id` |

### 4.2 isCacheOnly() — 缓存优化

```
repo.ts:2187-2195
```

- `Login` 且 `authMethod === 'client' || 'execute'` → **仅写入 Redis，不写 DB**
- `Subscription` 且 `channel.type === 'websocket'` → 仅写入 Redis

### 4.3 getCompartments() — Compartment 计算

```
repo.ts:1728-1768
```

- `User` 资源: 如果有 `user.project` 引用，将其加入 compartment
- 所有资源: 通过 `meta.project` 加入 Project compartment

### 4.4 handleStorage() — 特殊缓存行为

```
repo.ts:896-922
```

- `Subscription` + websocket → 写入 Redis Set `medplum:subscriptions:r4:project:{id}:active`
- `StructureDefinition` → 清除 profile 缓存

### 4.5 preCommitValidation() — 删除前引用检查

```
precommit.ts:48-58, 176-192
```

- 删除 `Bot`, `ClientApplication`, `Patient`, `Practitioner`, `RelatedPerson`, `User` 时
- 检查是否被 `ProjectMembership` 的 `profile`/`user`/`accessPolicy` 字段引用
- 如果有引用则阻止删除（抛出 BadRequest）

## 5. API 路由入口

### 5.1 专用 FHIR Operations（内部路由器）

| 路由                                          | Handler                    | 关联资源                                                    |
| --------------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| `POST /Project/$init`                         | `projectInitHandler`       | Project, ClientApplication, Practitioner, ProjectMembership |
| `POST /Project/:id/$clone`                    | `projectCloneHandler`      | Project (superAdmin only)                                   |
| `POST /User/:id/$update-email`                | `updateUserEmailOperation` | User, ProjectMembership                                     |
| `POST /Bot/:id/$deploy`                       | `deployHandler`            | Bot                                                         |
| `GET/POST /Bot/$execute`, `/Bot/:id/$execute` | `executeHandler`           | Bot                                                         |
| `POST /ClientApplication/:id/$rotate-secret`  | `rotateSecretHandler`      | ClientApplication                                           |
| `POST /AsyncJob/:id/$cancel`                  | `asyncJobCancelHandler`    | AsyncJob                                                    |
| `GET /Agent/:id/$status`                      | `agentStatusHandler`       | Agent                                                       |
| `GET /Agent/:id/$reload-config`               | `agentReloadConfigHandler` | Agent                                                       |
| `GET /Agent/:id/$upgrade`                     | `agentUpgradeHandler`      | Agent                                                       |
| `GET /Agent/:id/$fetch-logs`                  | `agentFetchLogsHandler`    | Agent                                                       |
| `POST /Agent/$push`                           | `agentPushHandler`         | Agent                                                       |

### 5.2 Admin API 路由（Express 路由器）

| 路由                                     | 方法     | 功能                   |
| ---------------------------------------- | -------- | ---------------------- |
| `/admin/projects/:projectId`             | GET      | 读取项目详情           |
| `/admin/projects/:projectId`             | POST     | 更新项目               |
| `/admin/projects/:projectId/members`     | GET      | 列出项目成员           |
| `/admin/projects/:projectId/members/:id` | GET      | 读取成员               |
| `/admin/projects/:projectId/members/:id` | POST     | 更新成员               |
| `/admin/projects/:projectId/members/:id` | DELETE   | 删除成员               |
| `/admin/projects/:projectId/invite`      | POST     | 邀请用户               |
| `/admin/projects/:projectId/bot`         | POST     | 创建 Bot               |
| `/admin/projects/:projectId/client`      | POST     | 创建 ClientApplication |
| `/admin/projects/:projectId/secrets`     | GET/POST | 管理项目 Secrets       |

### 5.3 Auth API 路由

| 路由                        | 功能         | 关联资源                                                           |
| --------------------------- | ------------ | ------------------------------------------------------------------ |
| `POST /auth/login`          | 用户登录     | Login, User, ProjectMembership                                     |
| `POST /auth/newuser`        | 新用户注册   | User                                                               |
| `POST /auth/newproject`     | 创建新项目   | Project, Practitioner, ProjectMembership, ClientApplication, Login |
| `POST /auth/profile`        | 选择 profile | Login, ProjectMembership                                           |
| `POST /auth/changepassword` | 修改密码     | User                                                               |
| `POST /auth/resetpassword`  | 重置密码     | UserSecurityRequest, User                                          |
| `POST /auth/setpassword`    | 设置密码     | UserSecurityRequest, User                                          |
| `POST /auth/verifyemail`    | 验证邮箱     | UserSecurityRequest, User                                          |
| `POST /auth/mfa/setup`      | MFA 设置     | User                                                               |
| `POST /auth/mfa/verify`     | MFA 验证     | Login, User                                                        |

### 5.4 OAuth2 端点

| 路由                                      | 功能       | 关联资源                                    |
| ----------------------------------------- | ---------- | ------------------------------------------- |
| `POST /oauth2/token`                      | Token 发放 | Login, ClientApplication, ProjectMembership |
| `GET /oauth2/authorize`                   | 授权页面   | ClientApplication                           |
| `POST /oauth2/token (client_credentials)` | 服务端认证 | ClientApplication, ProjectMembership        |

## 6. 数据库 Seed 流程

**入口**: `packages/server/src/seed.ts:seedDatabase()`

Seed 按以下顺序创建系统初始数据：

```
1. User (admin@example.com)
2. Project (Super Admin, superAdmin=true)
3. Project (FHIR R4, hardcoded ID: 161452d9-43b7-5c29-aa7b-c85680fa45c6)
4. Practitioner (admin profile)
5. ProjectMembership (admin → Super Admin project)
6. ClientApplication (if configured, with specified ID/secret)
7. ProjectMembership (client → Super Admin project)
8. StructureDefinition × ~700+ (R4 definitions)
9. ValueSet × ~900+ (R4 value sets)
10. SearchParameter × ~1400+ (R4 search parameters)
```

**关键常量**:

- `r4ProjectId = '161452d9-43b7-5c29-aa7b-c85680fa45c6'` — 硬编码的 R4 项目 ID
- `systemResourceProjectId = '65897e4f-7add-55f3-9b17-035b5a4e6d52'` — 系统资源的 projectId

## 7. 资源间依赖关系图

```
                         ┌───────────────┐
                         │    Project    │
                         │  (租户容器)   │
                         └──────┬────────┘
                                │ owner → User
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼──┐ ┌─────▼──────┐ ┌──▼──────────────┐
            │   User   │ │ ClientApp  │ │      Bot        │
            │ (用户账号)│ │ (OAuth客户端)│ │ (自动化脚本)    │
            └────┬─────┘ └─────┬──────┘ └──────┬──────────┘
                 │             │               │
                 └──────┬──────┘───────────────┘
                        │ user/profile →
                 ┌──────▼──────────┐
                 │ ProjectMembership│
                 │  (成员关联)      │
                 └──────┬──────────┘
                        │ accessPolicy →
                 ┌──────▼──────────┐
                 │  AccessPolicy   │
                 │ (访问控制策略)   │
                 └─────────────────┘

            ┌──────────────┐   ┌──────────────────┐
            │    Login     │   │ UserSecurityReq   │
            │ (登录会话)   │   │ (密码重置/MFA)    │
            └──────────────┘   └──────────────────┘

     ┌────────────────────┐   ┌───────────────────┐
     │  UserConfiguration │   │ DomainConfiguration│
     │  (UI配置)          │   │  (域名映射)        │
     └────────────────────┘   └───────────────────┘

     ┌──────────┐  ┌────────────────┐  ┌──────────────┐
     │  Agent   │  │ BulkDataExport │  │  AsyncJob    │
     │ (代理)   │  │  (批量导出)    │  │  (异步任务)  │
     └──────────┘  └────────────────┘  └──────────────┘

     ┌────────────────┐  ┌──────────────┐
     │ SmartAppLaunch │  │  JsonWebKey  │
     │ (SMART启动)    │  │  (JWT密钥)   │
     └────────────────┘  └──────────────┘
```

## 8. MedXAI 决策要点

### 8.1 必须实现（核心功能所需）

| 资源                | 必要性   | 理由                                 |
| ------------------- | -------- | ------------------------------------ |
| `Project`           | **必须** | 多租户隔离的基础，projectId 列的来源 |
| `ProjectMembership` | **必须** | 用户-项目关联，AccessPolicy 绑定     |
| `User`              | **必须** | 认证主体                             |
| `Login`             | **必须** | OAuth2 会话管理                      |
| `ClientApplication` | **必须** | 服务端 OAuth2 认证                   |
| `AccessPolicy`      | **必须** | 行级访问控制                         |

### 8.2 可选实现（根据功能需求）

| 资源                  | 建议     | 理由                                    |
| --------------------- | -------- | --------------------------------------- |
| `Bot`                 | 推荐     | 服务端自动化、Subscription 处理         |
| `Agent`               | 可延后   | 仅用于本地网络集成 (HL7v2/DICOM)        |
| `AsyncJob`            | 推荐     | 批量操作状态追踪                        |
| `BulkDataExport`      | 可延后   | $export 操作                            |
| `SmartAppLaunch`      | 可延后   | SMART on FHIR 集成                      |
| `UserConfiguration`   | 可延后   | UI 个性化                               |
| `UserSecurityRequest` | 推荐     | 密码重置/MFA 流程                       |
| `DomainConfiguration` | 可延后   | 多域名部署                              |
| `JsonWebKey`          | **必须** | JWT 签名/验证                           |
| `ViewDefinition`      | 不需要   | 逻辑类型，不持久化                      |
| `IdentityProvider`    | 可延后   | 外部 IdP 集成（嵌入 ClientApplication） |

### 8.3 关键设计差异

1. **projectId 列**: Medplum 用 `projectId` 列实现硬隔离；MedXAI 需要决定是否保留此模式
2. **Cache-only Login**: `client`/`execute` 类型的 Login 不写 DB — MedXAI 如果不用 Redis 需要适配
3. **SystemRepo**: 无项目/无 AccessPolicy 约束的特权仓库，用于跨项目操作
4. **preCommit 引用检查**: 删除被 ProjectMembership 引用的资源会被阻止

---

**详细分析见**:

- [WF-CUS-002: 核心安全资源](WF-CUS-002_core-security-resources.md) — Project, User, ProjectMembership, Login
- [WF-CUS-003: 应用层资源](WF-CUS-003_application-resources.md) — ClientApplication, Bot, AccessPolicy, Agent 等
- [WF-CUS-004: 认证集成](WF-CUS-004_auth-jwt-login.md) — JWT 密钥管理、Login 路由、OAuth2 Token 流程
- [WF-CUS-005: 中间件与 AccessPolicy 执行](WF-CUS-005_middleware-accesspolicy.md) — 请求上下文、四层 AccessPolicy 执行引擎
- [WF-CUS-006: MedplumClient 核心能力](WF-CUS-006_medplum-client.md) — CRUD、Batch/Transaction、GraphQL、缓存、自动重试、WebSocket 订阅
- [WF-CUS-007: Server 路由全表](WF-CUS-007_server-routes.md) — 全部 ~182 个端点、类别、核心实现函数、认证要求
- [WF-CUS-008: App 平台全面分析](WF-CUS-008_app-platform.md) — 前端管理平台 ~51 页面、路由、组件、API 调用模式
