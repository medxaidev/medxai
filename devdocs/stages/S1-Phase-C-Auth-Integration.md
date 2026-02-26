# S1 Phase C: 认证与授权集成 (Auth Integration)

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
completed_at: 2026-02-26
scope: JWT key management, auth routes, middleware, AccessPolicy enforcement, DB seed
prerequisite: Phase A+B complete (3549/3549 tests, OperationContext, multi-tenant)
related_adr: ADR-007-Auth-Integration-Strategy.md
related_analysis: WF-CUS-004_auth-jwt-login.md, WF-CUS-005_middleware-accesspolicy.md
```

---

## 交付物总览

| 步骤 | 交付物 | 状态 |
|------|--------|------|
| C-1 | JWT 密钥管理 (keys.ts) | ✅ 完成 |
| C-2 | Auth 路由 (login.ts + token.ts) | ✅ 完成 |
| C-3 | Fastify 认证中间件 (middleware.ts) | ✅ 完成 |
| C-4 | AccessPolicy 基础执行 (access-policy.ts) | ✅ 完成 |
| C-5 | 数据库 Seed (seed.ts) | ✅ 完成 |
| C-6 | 测试验证 — 3593/3593 pass, +44 new tests | ✅ 完成 |

---

## C-1: JWT 密钥管理

**文件**: `fhir-server/src/auth/keys.ts`

### 功能

| 函数 | 说明 |
|------|------|
| `initKeys(repo, baseUrl)` | 服务器启动时加载/生成 JsonWebKey |
| `generateAccessToken(claims, options?)` | 签发 access_token JWT (ES256) |
| `generateRefreshToken(claims, options?)` | 签发 refresh_token JWT |
| `verifyJwt(token)` | 验证 JWT 签名、过期时间、issuer |
| `getJwks()` | 返回 JWKS (用于 `/.well-known/jwks.json`) |
| `generateSecret(bytes?)` | 生成密码学安全随机 hex 字符串 |

### 技术决策

- **签名算法**: ES256 (ECDSA P-256)
- **JWT 库**: `jose` v5 (纯 JS, 无 native 依赖)
- **密钥存储**: JsonWebKey 资源 (DB 持久化)
- **密钥初始化**: 搜索 `active=true` 的 JsonWebKey，不存在则 `generateKeyPair({ extractable: true })` 生成
- **公钥端点**: `GET /.well-known/jwks.json`

### Token 规格

| Token | 默认有效期 | Claims |
|-------|-----------|--------|
| access_token | 1h (3600s) | login_id, sub, profile, scope, iss, iat, exp |
| refresh_token | 2w (1209600s) | login_id, refresh_secret, iss, iat, exp |

---

## C-2: Auth 路由

### POST /auth/login (密码登录)

**文件**: `fhir-server/src/auth/login.ts`

**流程**:
1. 验证 email + password
2. 搜索 User (by email)
3. `bcrypt.compare(password, user.passwordHash)`
4. 创建 Login 资源 (code, refreshSecret, scope)
5. 查找 ProjectMembership(s)
6. 单个 membership → 自动绑定到 Login
7. 多个 membership → 返回列表供客户端选择

**响应**: `{ login: <id>, code: <code>, memberships?: [...] }`

### POST /oauth2/token (三种 grant type)

**文件**: `fhir-server/src/auth/token.ts`

| Grant Type | 流程 |
|------------|------|
| `authorization_code` | 通过 code 查找 Login → 验证 granted=false → 标记 granted=true → 签发 tokens |
| `client_credentials` | 读取 ClientApplication → `timingSafeEqual` 验证 secret → 查找 Membership → 创建 Login → 签发 token (无 refresh) |
| `refresh_token` | verifyJwt → 读取 Login → `timingSafeEqual` 验证 refreshSecret → Rotation (新 secret) → 签发新 tokens |

**安全措施**:
- `timingSafeEqual` 防止时序攻击
- Refresh Token Rotation (旧 token 自动失效)
- Authorization code 一次性使用 (重放 → revoke login)

---

## C-3: Fastify 认证中间件

**文件**: `fhir-server/src/auth/middleware.ts`

### 架构

```
HTTP Request
  │
  ▼
authenticateToken (onRequest hook, 全局)
  ├─ 解析 Authorization: Bearer <token>
  ├─ verifyJwt(token) → claims
  ├─ systemRepo.readResource<Login>(claims.login_id)
  ├─ systemRepo.readResource<ProjectMembership>(login.membership)
  ├─ systemRepo.readResource<Project>(membership.project)
  └─ req.authState = { login, project, membership }
  │
  ▼
requireAuth (preHandler hook, 需认证的路由)
  ├─ req.authState 存在? → 继续
  └─ 不存在 → 401 Unauthorized
  │
  ▼
Route Handler
  └─ getOperationContext(req) → { project, author, accessPolicy, superAdmin }
```

### 关键接口

```typescript
interface AuthState {
  login: PersistedResource;
  project: PersistedResource;
  membership: PersistedResource;
}

interface OperationContext {
  project?: string;
  author?: string;
  accessPolicy?: string;
  superAdmin?: boolean;
}
```

### 设计特点

- **尽力认证**: `authenticateToken` 不拒绝请求，仅设置 authState (或留空)
- **按需强制**: `requireAuth` 按路由选择性应用
- **SystemRepo**: 中间件使用无限制的 repo 读取 Login/Membership/Project
- **Fastify Declaration Merging**: `FastifyRequest` 扩展 `authState` 属性

---

## C-4: AccessPolicy 基础执行

**文件**: `fhir-server/src/auth/access-policy.ts`

### 四层模型 (Phase C 实现前两层)

| 层 | 名称 | 状态 | 说明 |
|----|------|------|------|
| **Layer 1** | `supportsInteraction()` | ✅ 实现 | 类型级前置检查 |
| **Layer 2** | `canPerformInteraction()` | ✅ 实现 | 实例级检查 |
| Layer 3 | `addAccessPolicyFilters()` | ❌ 延后 | 搜索 SQL 注入 |
| Layer 4 | 字段级控制 | ❌ 延后 | hiddenFields / readonlyFields |

### Layer 1 规则

1. `PROTECTED_RESOURCE_TYPES` (Project, JsonWebKey) → 仅 superAdmin 可操作
2. 无 AccessPolicy → 允许全部
3. 有 AccessPolicy → 检查 `resource[]` 条目:
   - `*` 通配 **不匹配** `PROJECT_ADMIN_RESOURCE_TYPES`
   - 精确 resourceType 匹配
   - `readonly: true` → 仅允许 read/search/history/vread
   - `interaction[]` → 仅允许列出的操作

### Layer 2 规则

1. Protected types check (同 Layer 1)
2. 无 policy → 返回合成 `{ resourceType: "*" }` 表示全部允许
3. 有 policy → 查找匹配条目, 检查 readonly 对写操作的限制

### 辅助函数

| 函数 | 说明 |
|------|------|
| `parseAccessPolicy(resource)` | 解析 AccessPolicy FHIR 资源 → ParsedAccessPolicy |
| `buildDefaultAccessPolicy()` | 创建 `*` 通配策略 (无 policy 时默认) |

---

## C-5: 数据库 Seed

**文件**: `fhir-server/src/auth/seed.ts`

### Seed 顺序

```
1. Project     (name="Super Admin", superAdmin=true)
2. User        (email=config.adminEmail, passwordHash=bcrypt(config.adminPassword))
3. ClientApplication (name="Default Client", secret=random, status="active")
4. ProjectMembership (user → User, project → Project, admin=true)
5. ProjectMembership (user → ClientApplication, project → Project)
```

### 配置

```typescript
interface SeedConfig {
  adminEmail: string;
  adminPassword: string;
  clientId?: string;      // 可选固定 client ID
  clientSecret?: string;  // 可选固定 client secret
}
```

### 返回值

```typescript
interface SeedResult {
  project: PersistedResource;
  user: PersistedResource;
  client: PersistedResource;
  adminMembership: PersistedResource;
  clientMembership: PersistedResource;
  clientSecret: string;   // 生成的 client secret (仅创建时可见)
}
```

---

## App Factory 集成

**文件**: `fhir-server/src/app.ts`

### 新增 AppOptions

```typescript
interface AppOptions {
  // ... existing options ...
  systemRepo?: ResourceRepository;  // 系统级 repo (无 project/AccessPolicy 限制)
  enableAuth?: boolean;             // 启用认证中间件和路由 (默认 false)
}
```

### 新增路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `POST /auth/login` | 密码登录 | 无需认证 |
| `POST /oauth2/token` | Token 签发 | 无需认证 |
| `GET /.well-known/jwks.json` | JWKS 公钥 | 无需认证 |

### 向后兼容

- `enableAuth` 默认 `false` → 不影响现有测试和使用
- `systemRepo` 可选 → 默认使用 `repo`
- 所有 auth 功能通过 `enableAuth: true` 显式启用

---

## 依赖变更

### 新增 dependencies (fhir-server)

| 包 | 版本 | 用途 |
|----|------|------|
| `jose` | ^6.x | JWT 签发/验证 |
| `bcryptjs` | ^3.x | 密码哈希 |

### 新增 devDependencies

| 包 | 版本 | 用途 |
|----|------|------|
| `@types/bcryptjs` | ^3.x | TypeScript 类型 |

---

## 新增文件

| 文件 | 行数 | 说明 |
|------|------|------|
| `fhir-server/src/auth/keys.ts` | ~300 | JWT 密钥管理 |
| `fhir-server/src/auth/login.ts` | ~210 | 密码登录路由 |
| `fhir-server/src/auth/token.ts` | ~340 | OAuth2 token 路由 |
| `fhir-server/src/auth/middleware.ts` | ~195 | 认证中间件 |
| `fhir-server/src/auth/access-policy.ts` | ~215 | AccessPolicy 执行 |
| `fhir-server/src/auth/seed.ts` | ~125 | 数据库初始化 |
| `fhir-server/src/auth/index.ts` | ~55 | Auth 模块 barrel |

### 修改文件

| 文件 | 变更 |
|------|------|
| `fhir-server/src/app.ts` | 新增 auth imports, systemRepo/enableAuth options, auth hooks/routes |
| `fhir-server/src/index.ts` | 导出 auth 模块 public API |
| `fhir-server/package.json` | 新增 jose, bcryptjs 依赖 |

### 新增测试文件

| 文件 | 测试数 | 说明 |
|------|--------|------|
| `__tests__/auth/keys.test.ts` | 11 | JWT 密钥管理 |
| `__tests__/auth/access-policy.test.ts` | 23 | AccessPolicy 执行 |
| `__tests__/auth/middleware.test.ts` | 10 | 认证中间件 |

### 文档文件

| 文件 | 说明 |
|------|------|
| `devdocs/decisions/ADR-007-Auth-Integration-Strategy.md` | Auth 集成策略 ADR |
| `devdocs/stages/S1-Phase-AB-Platform-Resource-MultiTenant.md` | Phase A+B 记录 |
| `devdocs/stages/S1-Phase-C-Auth-Integration.md` | 本文件 |

---

## 验证结果

| 指标 | 结果 |
|------|------|
| tsc --noEmit (fhir-persistence) | ✅ clean |
| tsc --noEmit (fhir-server) | ✅ clean |
| Tests | ✅ 3593/3593 pass, 87 files |
| New tests | ✅ +44 (11 keys + 23 access-policy + 10 middleware) |
| Regressions | ✅ 0 |
| 向后兼容 | ✅ enableAuth 默认 false, 现有代码不变 |

---

## 延后事项 (Phase C+1)

| 事项 | 说明 |
|------|------|
| AccessPolicy Layer 3 | 搜索时 criteria → SQL WHERE 过滤 |
| AccessPolicy Layer 4 | hiddenFields / readonlyFields / writeConstraint |
| SMART scopes | OAuth2 scope → AccessPolicy 映射 |
| id_token | OpenID Connect 标准 |
| Google/外部 IdP | 第三方认证 |
| MFA | 多因素认证 |
| Login 清理 | 过期 Login 资源定期清理 |
| Rate Limiting | 按 project/user 限流 |
