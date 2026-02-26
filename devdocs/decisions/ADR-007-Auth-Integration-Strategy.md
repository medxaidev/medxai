# ADR-007: 认证与授权集成策略 (Auth Integration Strategy)

## Status

**Status:** ACCEPTED — 进入实施  
**Date:** 2026-02-26  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Related:** ADR-006 (Platform Resource & Multi-Tenant), WF-CUS-004, WF-CUS-005

---

## Context

### 当前状态

Phase A+B (ADR-006) 已完成：

- 7 个平台资源已定义 (Project, User, ProjectMembership, Login, ClientApplication, AccessPolicy, JsonWebKey)
- OperationContext 接口已定义，FhirRepository 所有 CRUD/Search 方法已接受 `context?` 参数
- 多租户 projectId 隔离已实现

### 问题

1. 如何管理 JWT 密钥 (签发/验证/轮换)?
2. 支持哪些认证流程 (密码登录? client_credentials? refresh token)?
3. 如何将 HTTP 请求中的 Bearer token 转换为 OperationContext?
4. AccessPolicy 如何在 Repository 层执行?
5. 数据库初始化需要哪些 seed 数据?

### Medplum 分析结果

基于 WF-CUS-004 和 WF-CUS-005 的分析:

- **JWT**: ES256 签名，JsonWebKey 资源存储密钥，jose 库签发/验证
- **认证流程**: 密码登录 → Login 资源 → authorization_code → token；client_credentials 直接出 token
- **中间件**: 全局 attachRequestContext (尽力认证) + 路由级 authenticateRequest (强制认证)
- **AccessPolicy**: 四层执行 — 类型级 → 实例级 → 搜索过滤 → 字段级

---

## Decision

### D1: JWT 密钥管理 — jose 库 + JsonWebKey 资源

**选择**: 使用 `jose` 库进行 JWT 签发/验证，密钥存储在 JsonWebKey 资源中。

| 方面 | 决策 |
|------|------|
| **签名算法** | ES256 (ECDSA P-256) — 与 Medplum 一致 |
| **JWT 库** | `jose` (纯 JS, 无 native 依赖, Medplum 同款) |
| **密钥存储** | JsonWebKey 资源 (DB 持久化) |
| **密钥初始化** | 服务器启动时检查，不存在则自动生成 |
| **公钥端点** | `GET /.well-known/jwks.json` |

**Token 类型与有效期:**

| Token | 用途 | 默认有效期 | Claims |
|-------|------|-----------|--------|
| access_token | API 访问 | 1h | login_id, sub, profile, scope |
| refresh_token | 刷新 access_token | 2w | login_id, refresh_secret |

**Phase C 简化**: 不签发 id_token (OpenID Connect 延后)。

---

### D2: 认证流程 — 密码登录 + client_credentials + refresh

**Phase C 实现范围:**

| 流程 | 路由 | 优先级 |
|------|------|--------|
| **密码登录** | `POST /auth/login` → Login → `POST /oauth2/token` (authorization_code) | 必须 |
| **client_credentials** | `POST /oauth2/token` (grant_type=client_credentials) | 必须 |
| **refresh_token** | `POST /oauth2/token` (grant_type=refresh_token) | 必须 |
| **PKCE** | code_challenge + code_verifier | 推荐 |
| Google/外部 IdP | — | 延后 |
| MFA | — | 延后 |

**密码登录流程:**

```
POST /auth/login { email, password, scope }
  → bcrypt.compare(password, user.passwordHash)
  → 创建 Login { user, code, refreshSecret, scope }
  → 查找 ProjectMembership
  → 关联 Login.membership
  → 返回 { login: loginId, code }

POST /oauth2/token { grant_type: "authorization_code", code }
  → 查找 Login by code
  → 验证 login.granted === false (防重放)
  → 标记 login.granted = true
  → 签发 access_token + refresh_token
```

**client_credentials 流程:**

```
POST /oauth2/token { grant_type: "client_credentials", client_id, client_secret }
  → 读取 ClientApplication
  → timingSafeEqual(client.secret, clientSecret)
  → 查找 ProjectMembership (user = client)
  → 创建 Login { authMethod: 'client', granted: true }
  → 签发 access_token (无 refresh_token)
```

**Refresh Token Rotation:**

```
POST /oauth2/token { grant_type: "refresh_token", refresh_token }
  → verifyJwt(refresh_token) → claims
  → 读取 Login (claims.login_id)
  → timingSafeEqual(login.refreshSecret, claims.refresh_secret)
  → 更新 Login { refreshSecret: generateSecret() } // 旧 token 自动失效
  → 签发新 access_token + refresh_token
```

---

### D3: 认证中间件 — Fastify preHandler + AsyncLocalStorage

**架构:**

```
HTTP Request
  │
  ▼
authenticateToken (Fastify onRequest hook, 全局)
  ├─ 解析 Authorization: Bearer <token>
  ├─ verifyJwt(token) → claims
  ├─ systemRepo.readResource<Login>(claims.login_id)
  ├─ systemRepo.readResource<ProjectMembership>(login.membership)
  ├─ systemRepo.readResource<Project>(membership.project)
  ├─ 构建 AuthState { login, project, membership }
  └─ req.authState = authState
  │
  ▼
requireAuth (Fastify preHandler, 仅需认证的路由)
  ├─ req.authState 存在? → 继续
  └─ 不存在 → 401 Unauthorized
  │
  ▼
Route Handler
  ├─ 从 req.authState 构建 OperationContext
  │   { project, author, accessPolicy, superAdmin }
  └─ repo.createResource(resource, options, context)
```

**关键设计:**

1. **AuthState 存储**: 挂载在 `req.authState` (Fastify request decoration)，不使用 AsyncLocalStorage (简化)
2. **SystemRepo**: 用于认证流程中的跨项目无限制读取 (无 project 过滤, 无 AccessPolicy)
3. **OperationContext 构建**: 在路由 handler 中从 AuthState 构建，注入到所有 repo 调用

**AuthState 接口:**

```typescript
interface AuthState {
  login: PersistedResource;           // Login 资源
  project: PersistedResource;         // Project 资源
  membership: PersistedResource;      // ProjectMembership 资源
}
```

---

### D4: AccessPolicy 执行 — Phase C 实现两层

Medplum 有四层 AccessPolicy 执行。Phase C 实现前两层 (最关键)，后两层延后:

| 层 | 名称 | Phase C | 说明 |
|----|------|---------|------|
| **Layer 1** | supportsInteraction | ✅ 实现 | 类型级前置检查 (protectedTypes + resourceType allow/deny) |
| **Layer 2** | canPerformInteraction | ✅ 实现 | 实例级检查 (projectId 归属 + criteria 匹配) |
| Layer 3 | addAccessPolicyFilters | ❌ 延后 | 搜索时 criteria → SQL WHERE (需要 criteria 解析器) |
| Layer 4 | 字段级控制 | ❌ 延后 | hiddenFields / readonlyFields / writeConstraint |

**Layer 1: supportsInteraction()**

```typescript
function supportsInteraction(
  interaction: 'create' | 'read' | 'update' | 'delete' | 'search',
  resourceType: string,
  context: OperationContext,
): boolean {
  // 1. protectedResourceTypes 仅 superAdmin 可操作
  if (PROTECTED_RESOURCE_TYPES.has(resourceType) && !context.superAdmin) {
    return false;
  }

  // 2. 无 AccessPolicy → 允许全部 (superAdmin 或系统操作)
  if (!context.accessPolicy) return true;

  // 3. 检查 AccessPolicy.resource[] 是否包含此 resourceType
  //    注意: '*' 通配不匹配 projectAdminResourceTypes
  return accessPolicySupportsInteraction(accessPolicy, interaction, resourceType);
}
```

**Layer 2: canPerformInteraction()**

```typescript
function canPerformInteraction(
  interaction: string,
  resource: PersistedResource,
  context: OperationContext,
): boolean {
  // 1. protectedResourceTypes check
  if (PROTECTED_RESOURCE_TYPES.has(resource.resourceType) && !context.superAdmin) {
    return false;
  }

  // 2. 项目归属检查 (已在 Phase B 的 readResource 中实现)
  // projectId 不匹配 → 404

  // 3. AccessPolicy.resource[].readonly 检查
  // 如果 policy.readonly === true 且 interaction 是写操作 → 拒绝

  return true;
}
```

---

### D5: 数据库 Seed — 最小初始化数据

服务器首次启动时，seed 以下数据:

```
1. JsonWebKey (ES256 密钥对, active=true)
2. Project (name="Super Admin", superAdmin=true)
3. User (email=config.adminEmail, passwordHash=bcrypt(config.adminPassword))
4. ClientApplication (name="Default Client", secret=random, status="active")
5. ProjectMembership (user → User, project → Project, admin=true)
6. ProjectMembership (user → ClientApplication, project → Project)
```

**配置来源**: 环境变量或 `.env` 文件

```
MEDXAI_ADMIN_EMAIL=admin@example.com
MEDXAI_ADMIN_PASSWORD=<initial_password>
MEDXAI_BASE_URL=http://localhost:3000
```

---

### D6: 密码存储 — bcrypt

| 方面 | 决策 |
|------|------|
| **算法** | bcrypt (与 Medplum 一致) |
| **Salt Rounds** | 10 (默认, 可配置) |
| **库** | `bcrypt` 或 `bcryptjs` (纯 JS, 无 native 依赖) |

---

## Consequences

### 正面

1. **与 Medplum 一致**: JWT/Login/Token 流程与 Medplum 对齐，降低学习成本
2. **渐进式**: Phase C 仅实现核心两层 AccessPolicy，复杂功能 (字段级, criteria SQL) 延后
3. **安全**: ES256 + bcrypt + Refresh Token Rotation + timingSafeEqual
4. **OperationContext 复用**: Phase B 已预留的 context 参数在 Phase C 直接启用

### 负面

1. **认证流程较长**: 密码登录需要两步 (login → token)，增加客户端复杂度
2. **无 MFA**: 初期不支持多因素认证
3. **AccessPolicy 不完整**: Layer 3/4 延后意味着搜索结果不受 AccessPolicy criteria 过滤

### 风险

1. **Login 资源膨胀**: 每次登录创建一个 Login 资源，需要定期清理
   - **缓解**: 添加 TTL 或后台清理任务 (Phase 2)
2. **SystemRepo 安全**: 认证流程使用无限制的 SystemRepo
   - **缓解**: SystemRepo 仅在服务器内部代码使用，不暴露给 HTTP 请求

---

## 实施计划

### Phase C-1: JWT 密钥管理

- `fhir-server/src/auth/keys.ts` — initKeys(), generateAccessToken(), verifyJwt(), getJwks()
- 服务器启动时加载/生成 JsonWebKey
- `GET /.well-known/jwks.json` 端点

### Phase C-2: Auth 路由

- `fhir-server/src/auth/login.ts` — POST /auth/login (密码登录)
- `fhir-server/src/auth/token.ts` — POST /oauth2/token (authorization_code, client_credentials, refresh_token)
- 密码验证: bcrypt
- Login 资源 CRUD

### Phase C-3: 认证中间件

- `fhir-server/src/auth/middleware.ts` — authenticateToken(), requireAuth()
- Fastify request decoration (authState)
- OperationContext 构建

### Phase C-4: AccessPolicy 基础执行

- `fhir-server/src/auth/access-policy.ts` — supportsInteraction(), canPerformInteraction()
- 集成到路由 handler
- protectedResourceTypes + projectAdminResourceTypes 执行

### Phase C-5: 数据库 Seed

- `fhir-server/src/seed.ts` — seedDatabase()
- 创建 superAdmin Project + User + ClientApplication + Memberships
- JsonWebKey 自动生成

### Phase C-6: 测试验证

- JWT 签发/验证单元测试
- Auth 路由集成测试
- 中间件 + AccessPolicy 测试
- tsc clean + 全量回归

---

## References

- WF-CUS-004: 认证集成 — JWT、Login 路由、OAuth2 Token 流程
- WF-CUS-005: 认证中间件与 AccessPolicy 执行引擎
- WF-CUS-001: Medplum 自定义资源总览
- ADR-006: 平台资源与多租户策略
- ROADMAP-Backend-Stability.md: S5 认证/授权策略
