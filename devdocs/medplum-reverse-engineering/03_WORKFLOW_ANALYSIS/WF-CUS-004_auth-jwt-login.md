# WF-CUS-004: 认证集成 — JWT、Login 路由、OAuth2 Token 流程

## 1. 概述

Medplum 的认证系统围绕 **Login** 资源实现完整的 OAuth2/OpenID Connect 协议栈，涵盖：
- JWT 密钥管理与签发/验证 (`oauth/keys.ts`)
- 用户登录流程 (`auth/routes.ts` → `oauth/utils.ts`)
- OAuth2 Token 端点 (`oauth/token.ts`)
- 认证中间件 (`oauth/middleware.ts` → `context.ts`)

所有认证流最终产出一个 **AuthState** 对象，包含 `Login` + `Project` + `ProjectMembership` + `UserConfiguration`，由此构建 `Repository` 实例并绑定到请求上下文。

## 2. JWT 密钥管理

**文件**: `packages/server/src/oauth/keys.ts`

### 2.1 JsonWebKey 资源生命周期

```
服务器启动 → initKeys(config)
  │
  ├─ systemRepo.searchResources<JsonWebKey>({ active: true })
  │   ├─ 找到 → 加载已有密钥
  │   └─ 未找到 → generateKeyPair('ES256')
  │               → exportJWK(privateKey)
  │               → systemRepo.createResource<JsonWebKey>({ active:true, alg:'ES256', ...jwk })
  │
  ├─ 对每个活跃密钥:
  │   ├─ 构建公钥 JWK (kid=jsonWebKey.id, alg, kty, use='sig')
  │   │   ├─ ES256: 包含 x, y, crv
  │   │   └─ RS256: 包含 e, n
  │   ├─ 添加到 jwks.keys[] (供 /.well-known/jwks.json 公开)
  │   └─ importJWK(publicKey) → publicKeys[kid] (内存缓存用于验证)
  │
  └─ 第一个密钥 → signingKey (用于签发 JWT)
```

### 2.2 签名算法

| 算法 | 用途 | 密钥类型 |
|------|------|---------|
| **ES256** (首选) | 新密钥默认算法 | ECDSA P-256 |
| **RS256** (遗留) | 旧部署兼容 | RSA 2048+ |

`PREFERRED_ALG = 'ES256'`，`LEGACY_DEFAULT_ALG = 'RS256'`

验证时同时支持 ES256 和 RS256：
```typescript
// verifyJwt()
const verifyOptions: JWTVerifyOptions = {
  issuer,
  algorithms: ['ES256', 'RS256'],
};
return jwtVerify(token, getKeyForHeader, verifyOptions);
```

验证使用 `kid` 头部定位公钥：
```typescript
function getKeyForHeader(protectedHeader): KeyLike {
  return publicKeys[protectedHeader.kid]; // 从内存缓存获取
}
```

### 2.3 Token 类型与 Claims

#### Access Token (`MedplumAccessTokenClaims`)

```typescript
{
  client_id?: string,     // ClientApplication ID
  login_id: string,       // Login 资源 UUID
  sub: string,            // User ID
  username: string,       // User ID (= sub)
  scope: string,          // OAuth2 scope
  profile: string,        // FHIR profile 引用 (如 "Practitioner/123")
  email?: string,         // 用户邮箱 (需 'email' scope)
  iss: string,            // 发行者 URL
  aud: string,            // 受众 (client_id)
  iat: number,            // 签发时间
  exp: number,            // 过期时间
  nbf: number,            // 生效时间
}
```

**默认有效期**: `1h`（可通过 `ClientApplication.accessTokenLifetime` 自定义）

#### ID Token (`MedplumIdTokenClaims`)

```typescript
{
  client_id?: string,
  login_id: string,
  fhirUser?: string,      // FHIR profile 引用
  name?: string,
  email?: string,
  nonce: string,           // OpenID Connect nonce
  sub: string,             // User ID
  auth_time: number,       // 认证时间戳 (秒)
}
```

**固定有效期**: `1h`

#### Refresh Token (`MedplumRefreshTokenClaims`)

```typescript
{
  client_id?: string,
  login_id: string,
  refresh_secret: string,  // 额外的随机密钥
}
```

**默认有效期**: `2w`（可通过 `ClientApplication.refreshTokenLifetime` 自定义）

### 2.4 JWKS 端点

| 端点 | 功能 |
|------|------|
| `GET /.well-known/jwks.json` | 返回所有活跃公钥的 JWKS |
| `GET /.well-known/openid-configuration` | OpenID Connect 发现文档 |
| `GET /.well-known/oauth-authorization-server` | OAuth2 授权服务器元数据 |
| `GET /.well-known/smart-configuration` | SMART on FHIR 配置 |

### 2.5 辅助函数

| 函数 | 用途 |
|------|------|
| `generateSecret(size)` | `randomBytes(size).toString('hex')` — 生成随机密钥 |
| `generateAccessToken(claims, options?)` | 签发 access_token JWT |
| `generateIdToken(claims)` | 签发 id_token JWT |
| `generateRefreshToken(claims, lifetime?)` | 签发 refresh_token JWT |
| `verifyJwt(token)` | 验证并解码 JWT |
| `getJwks()` | 返回当前 JWKS 集合 |
| `getSigningKey()` | 返回当前签名密钥 |

---

## 3. 登录流程 — Auth 路由

**文件**: `packages/server/src/auth/routes.ts`

### 3.1 路由总览

| 路由 | 认证 | Handler | 功能 |
|------|------|---------|------|
| `POST /auth/login` | ✗ | `loginHandler` | 密码登录 |
| `POST /auth/google` | ✗ | `googleHandler` | Google 登录 |
| `POST /auth/exchange` | ✗ | `exchangeHandler` | Token 交换登录 |
| `GET /auth/external` | ✗ | `externalCallbackHandler` | 外部 IdP 回调 |
| `POST /auth/method` | ✗ | `methodHandler` | 查询可用认证方式 |
| `POST /auth/profile` | ✗ | `profileHandler` | 选择 profile (多成员) |
| `POST /auth/scope` | ✗ | `scopeHandler` | 确认/缩小 scope |
| `POST /auth/newuser` | ✗ | `newUserHandler` | 注册新用户 |
| `POST /auth/newproject` | ✗ | `newProjectHandler` | 创建新项目 |
| `POST /auth/newpatient` | ✗ | `newPatientHandler` | 注册新患者 |
| `POST /auth/resetpassword` | ✗ | `resetPasswordHandler` | 请求密码重置 |
| `POST /auth/setpassword` | ✗ | `setPasswordHandler` | 设置新密码 |
| `POST /auth/verifyemail` | ✗ | `verifyEmailHandler` | 邮箱验证 |
| `POST /auth/changepassword` | ✓ | `changePasswordHandler` | 修改密码 |
| `GET /auth/me` | ✓ | `meHandler` | 当前用户信息 |
| `POST /auth/revoke` | ✓ | `revokeHandler` | 撤销 token |
| `GET /auth/login/:login` | ✗ | `statusHandler` | 查询登录状态 |
| `GET /auth/clientinfo/:clientId` | ✗ | `clientInfoHandler` | 查询客户端信息 |
| `POST /auth/mfa/setup` | ✓ | MFA 设置 | TOTP 设置 |
| `POST /auth/mfa/verify` | ✗ | MFA 验证 | TOTP 验证 |

### 3.2 密码登录完整流程

```
POST /auth/login {
  email: "user@example.com",
  password: "xxx",
  scope: "openid offline",
  nonce: "random",
  clientId: "optional",
  projectId: "optional",
  codeChallenge: "xxx",
  codeChallengeMethod: "S256"
}
  │
  ▼
loginHandler → tryLogin(request)
  │
  ├─ 1. validateLoginRequest(request)
  │     → 校验必填字段 (email/password/scope/authMethod)
  │
  ├─ 2. getClientApplication(clientId) [可选]
  │     → 先查 standardClients，再查 systemRepo
  │     → 校验 allowedOrigin
  │
  ├─ 3. validatePkce(request, client)
  │     → 校验 codeChallenge + codeChallengeMethod 一致性
  │
  ├─ 4. getUserByEmail(email, projectId)
  │     ├─ 有 projectId → getUserByEmailInProject(email, projectId)
  │     └─ 无 projectId → getUserByEmailWithoutProject(email)
  │         → User WHERE email=email AND project IS NULL
  │
  ├─ 5. authenticate(request, user)
  │     ├─ password → bcrypt.compare(password, user.passwordHash)
  │     ├─ google → 验证 Google 凭证
  │     └─ external/exchange → 已由外部验证
  │
  ├─ 6. systemRepo.createResource<Login>({
  │       authMethod: 'password',
  │       user: ref(user),
  │       client: ref(client),
  │       code: generateSecret(16),        // 授权码
  │       cookie: generateSecret(16),      // 会话 cookie
  │       refreshSecret: generateSecret(32), // 仅 offline scope
  │       scope, nonce, codeChallenge, codeChallengeMethod,
  │       remoteAddress, userAgent
  │     })
  │
  ├─ 7. getMembershipsForLogin(login)
  │     → systemRepo.searchResources<ProjectMembership>({
  │         user: login.user,
  │         project: login.project (可选)
  │       })
  │     → 按 profileType 过滤 (可选)
  │
  └─ 8. 根据 membership 数量:
        ├─ 0 个 → 错误 (除非 allowNoMembership)
        ├─ 1 个 → setLoginMembership(login, membership.id)
        └─ 多个 → 返回 login (需用户选择 profile)
```

### 3.3 setLoginMembership() 详解

**文件**: `packages/server/src/oauth/utils.ts:404-492`

这是认证链中最关键的函数，将 Login 与 ProjectMembership 关联：

```
setLoginMembership(login, membershipId)
  │
  ├─ 前置检查:
  │   ├─ login.revoked → 错误
  │   ├─ login.granted → 错误
  │   └─ login.membership 已设置 → 错误
  │
  ├─ systemRepo.readResource<ProjectMembership>(membershipId)
  │   ├─ membership.user ≠ login.user → 错误 ("Invalid profile")
  │   └─ membership.active === false → 错误 ("Profile not active")
  │
  ├─ systemRepo.readReference<Project>(membership.project)
  │
  ├─ 项目级检查:
  │   └─ project.features.includes('google-auth-required')
  │       && login.authMethod !== 'google' → 错误
  │
  ├─ Google 头像更新 (可选):
  │   └─ 如果 authMethod='google' && pictureUrl && project.setting['googleAuthProfilePictures']
  │       → systemRepo.patchResource(profile, [{op:'add', path:'/photo', ...}])
  │
  ├─ getUserConfiguration(systemRepo, project, membership)
  │   → 读取 ProjectMembership.userConfiguration 引用
  │
  ├─ getAccessPolicyForLogin({ project, login, membership, userConfig })
  │   → 构建最终 AccessPolicy (详见 WF-CUS-005)
  │
  ├─ checkIpAccessRules(login, accessPolicy)
  │   → 如果 AccessPolicy 有 ipAccessRule:
  │     ├─ 匹配 'allow' → 通过
  │     ├─ 匹配 'block' → 错误 ("IP address not allowed")
  │     └─ 无匹配 → 通过
  │
  ├─ logAuditEvent(UserAuthenticationEvent)
  │
  └─ systemRepo.updateResource<Login>({
        ...login,
        membership: ref(membership),
        refreshSecret: project.superAdmin ? undefined : login.refreshSecret
      })
      // 注意: superAdmin 项目禁用 refresh token
```

---

## 4. OAuth2 Token 端点

**文件**: `packages/server/src/oauth/token.ts`

### 4.1 路由

```
POST /oauth2/token  (Content-Type: application/x-www-form-urlencoded)
```

### 4.2 支持的 Grant Types

| grant_type | 函数 | 用途 |
|-----------|------|------|
| `client_credentials` | `handleClientCredentials` | 服务端认证 |
| `authorization_code` | `handleAuthorizationCode` | 用户授权码 |
| `refresh_token` | `handleRefreshToken` | 刷新令牌 |
| `urn:ietf:params:oauth:grant-type:token-exchange` | `handleTokenExchange` | 外部 Token 交换 |

### 4.3 Client Credentials 流程

```
POST /oauth2/token {
  grant_type: "client_credentials",
  client_id: "xxx",
  client_secret: "yyy",
  scope: "openid" (可选)
}
  │
  ├─ getClientIdAndSecret(req)
  │   ├─ 方式1: client_assertion (private_key_jwt)
  │   │   → parseClientAssertion() → 验证 JWKS
  │   ├─ 方式2: Authorization: Basic base64(id:secret)
  │   └─ 方式3: POST body client_id + client_secret
  │
  ├─ systemRepo.readResource<ClientApplication>(clientId)
  │   → 检查 client.status === 'active'
  │
  ├─ validateClientIdAndSecret(res, client, clientSecret)
  │   → timingSafeEqual(client.secret, clientSecret)
  │   → timingSafeEqual(client.retiringSecret ?? client.secret, clientSecret)
  │   // 双重比较: 支持 secret 轮换期间新旧密钥都有效
  │   // 时间安全比较: 防止时序攻击
  │
  ├─ getClientApplicationMembership(client)
  │   → searchOne<ProjectMembership>({ user: ref(client) })
  │
  ├─ systemRepo.createResource<Login>({
  │     authMethod: 'client',
  │     user: ref(client),
  │     client: ref(client),
  │     membership: ref(membership),
  │     granted: true,       // ← 直接授权
  │     scope
  │   })
  │   // 注意: authMethod='client' → isCacheOnly=true → 仅写 Redis
  │
  ├─ checkIpAccessRules(login, accessPolicy)
  │
  └─ sendTokenResponse(res, login, client)
```

### 4.4 Authorization Code 流程

```
POST /oauth2/token {
  grant_type: "authorization_code",
  code: "xxx",
  client_id: "optional",
  code_verifier: "yyy" (PKCE)
}
  │
  ├─ systemRepo.search<Login>({ code: code })
  │   → 找不到 → 错误 ("Invalid code")
  │
  ├─ 校验:
  │   ├─ clientId 匹配 → login.client === clientId
  │   ├─ login.membership 存在
  │   ├─ login.granted === false (防止重放)
  │   │   └─ 如果 already granted → revokeLogin + 错误
  │   └─ login.revoked === false
  │
  ├─ PKCE 验证 (除非 client.pkceOptional):
  │   ├─ plain: codeChallenge === codeVerifier
  │   └─ S256: codeChallenge === SHA256(codeVerifier).base64url
  │
  └─ sendTokenResponse(res, login, client)
```

### 4.5 Refresh Token 流程

```
POST /oauth2/token {
  grant_type: "refresh_token",
  refresh_token: "jwt_token"
}
  │
  ├─ verifyJwt(refreshToken) → claims
  ├─ systemRepo.readResource<Login>(claims.login_id)
  │
  ├─ 校验:
  │   ├─ login.refreshSecret 存在
  │   ├─ login.revoked === false
  │   └─ timingSafeEqual(login.refreshSecret, claims.refresh_secret)
  │
  ├─ Refresh Token Rotation:
  │   → systemRepo.updateResource<Login>({
  │       ...login,
  │       refreshSecret: generateSecret(32)  // 新密钥
  │     })
  │   // 旧 refresh token 自动失效 (因为 secret 已变)
  │
  └─ sendTokenResponse(res, updatedLogin, client)
```

### 4.6 Token Response 结构

```typescript
sendTokenResponse() → res.json({
  token_type: 'Bearer',
  expires_in: exp - iat,          // 秒
  scope: login.scope,
  id_token: string,               // JWT
  access_token: string,           // JWT
  refresh_token?: string,         // JWT (仅 offline scope)
  project: membership.project,    // Reference
  profile: membership.profile,    // Reference
  patient?: string,               // Patient ID (SMART)
  encounter?: string,             // Encounter ID (SMART)
  smart_style_url: string,
  need_patient_banner: boolean,
  'hub.topic'?: string,           // FHIRcast (可选)
  'hub.url'?: string,             // FHIRcast (可选)
})
```

### 4.7 Client Assertion (private_key_jwt) 详解

用于不能安全存储 client_secret 的场景（如 FAPI 2 合规）：

```
1. 客户端生成自签名 JWT:
   {
     iss: clientId,
     sub: clientId,
     aud: tokenUrl,        // 必须匹配服务器的 token 端点
     exp: ..., iat: ...
   }
   → 用客户端的私钥签名

2. 客户端发送:
   POST /oauth2/token {
     client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
     client_assertion: "signed_jwt",
     grant_type: "client_credentials"
   }

3. 服务端处理:
   → 解析 JWT 获取 clientId (= iss = sub)
   → 读取 ClientApplication (验证 aud === tokenUrl)
   → 使用 client.jwksUri 获取公钥
   → jwtVerify(clientAssertion, JWKS, verifyOptions)
   → 成功 → 返回 { clientId, clientSecret: client.secret }
```

---

## 5. 外部认证

### 5.1 Token Exchange (RFC 8693)

```
POST /oauth2/token {
  grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
  client_id: "xxx",
  subject_token: "external_access_token",
  subject_token_type: "urn:ietf:params:oauth:token-type:access_token"
}
  │
  ├─ 读取 ClientApplication → identityProvider
  ├─ getExternalUserInfo(idp.userInfoUrl, subjectToken)
  │   → GET userInfoUrl + Authorization: Bearer token
  │   → 解析 JSON/JWT 响应
  ├─ 提取 email 或 externalId (根据 idp.useSubject)
  └─ tryLogin({ authMethod:'exchange', email/externalId, ... })
```

### 5.2 External Auth Provider (直接 Access Token 验证)

**入口**: `getLoginForAccessToken()` → `tryExternalAuth()`

对配置了 `externalAuthProviders` 的服务器，可以直接使用外部 IdP 的 access token：

```
Bearer <external_jwt>
  │
  ├─ 检查 config.externalAuthProviders
  ├─ 解析 JWT payload → claims.iss
  ├─ 匹配 externalAuthConfig (issuer)
  │
  ├─ Redis 缓存检查: medplum:ext-auth:{issuer}:{hash(token)}
  │   ├─ 命中 → 直接返回缓存的 AuthState
  │   └─ 未命中:
  │       ├─ getExternalUserInfo() 验证 token
  │       ├─ claims.fhirUser → 查找 profile 资源
  │       ├─ 查找 ProjectMembership (by profile)
  │       ├─ 创建 Login (authMethod='external')
  │       └─ Redis 缓存 1h: SET key login_json EX 3600
  │
  └─ 返回 AuthState
```

### 5.3 Basic Auth

```
Authorization: Basic base64(clientId:clientSecret)
  │
  ├─ systemRepo.readResource<ClientApplication>(clientId)
  ├─ timingSafeEqual(client.secret, clientSecret)
  ├─ getClientApplicationMembership(client)
  ├─ 创建 Login (内存中, 不持久化)
  │   { authMethod:'client', user:ref(client) }
  └─ 返回 AuthState
```

**关键区别**: Basic Auth 创建的 Login **不写入数据库也不写入 Redis**，仅存在于请求生命周期内。

---

## 6. On-Behalf-Of 委托

**Header**: `X-Medplum-On-Behalf-Of: Practitioner/456` 或 `ProjectMembership/789`

```
tryAddOnBehalfOf(req, authState)
  │
  ├─ 前提: 调用者必须是 admin 或 superAdmin
  │
  ├─ 解析 header:
  │   ├─ "ProjectMembership/xxx" → 直接读取
  │   └─ "Practitioner/xxx" → 搜索 ProjectMembership{ profile=Practitioner/xxx, project=当前项目 }
  │
  └─ 设置:
      authState.onBehalfOf = profileResource
      authState.onBehalfOfMembership = membership
      → 后续 Repository 使用被委托人的 AccessPolicy
```

---

## 7. MFA (Multi-Factor Authentication)

### 7.1 设置流程

```
POST /auth/mfa/setup (需认证)
  → 生成 TOTP secret
  → 返回 secret + QR code URI
  → 用户绑定到 Authenticator App
```

### 7.2 验证流程

```
verifyMfaToken(login, token)
  │
  ├─ 前置检查: !revoked, !granted, !mfaVerified
  ├─ systemRepo.readReference(login.user) → user
  ├─ authenticator.verify({ token, secret: user.mfaSecret })
  │   → 窗口: config.mfaAuthenticatorWindow ?? 1 (±30s)
  └─ systemRepo.updateResource<Login>({ ...login, mfaVerified: true })
```

### 7.3 在登录流中的位置

```
tryLogin()
  → setLoginMembership() [如果只有1个membership]
  → 如果 user.mfaEnrolled && !login.mfaVerified:
    → 返回 login (需 MFA)
    → 客户端调用 POST /auth/mfa/verify { login, token }
    → verifyMfaToken()
    → 客户端调用 POST /oauth2/token { code }
```

---

## 8. Login 状态机完整图

```
                    tryLogin() / clientCredentials
                           │
              ┌────────────┴───────────────┐
              │                            │
     密码/Google/External              client_credentials
              │                            │
              ▼                            ▼
    ┌──────────────────┐         ┌──────────────────┐
    │ Login created    │         │ Login created    │
    │ membership=null  │         │ membership=set   │
    │ granted=false    │         │ granted=true     │
    │ code=random      │         │ cache-only       │
    └────────┬─────────┘         └────────┬─────────┘
             │                            │
     setLoginMembership()          sendTokenResponse()
             │                            │
             ▼                            ▼
    ┌──────────────────┐         ┌──────────────────┐
    │ membership=set   │         │ tokens issued    │
    │ granted=false    │         │ (done)           │
    │ [MFA pending?]   │         └──────────────────┘
    └────────┬─────────┘
             │
     verifyMfaToken() [如需要]
             │
             ▼
    ┌──────────────────┐
    │ mfaVerified=true │
    └────────┬─────────┘
             │
     POST /oauth2/token (code)
             │
             ▼
    ┌──────────────────┐
    │ granted=true     │
    │ tokens issued    │
    └────────┬─────────┘
             │
     refresh / logout / revoke
             │
             ▼
    ┌──────────────────┐
    │ revoked=true     │
    │ (终态)           │
    └──────────────────┘
```

---

## 9. 安全设计要点

### 9.1 防御措施

| 威胁 | 防御 |
|------|------|
| **时序攻击** | `timingSafeEqual` 比较 secret/refreshSecret |
| **授权码重放** | `login.granted` 检查 + 自动 revoke |
| **Refresh Token 泄露** | Refresh Token Rotation (每次刷新生成新 secret) |
| **PKCE** | 默认要求 (`pkceOptional` 可选关闭) |
| **暴力破解** | reCAPTCHA (newuser/resetpassword)、rate limiting |
| **IP 限制** | AccessPolicy.ipAccessRule (allow/block) |
| **SuperAdmin 安全** | 禁用 refresh token (`refreshSecret = undefined`) |
| **MFA** | TOTP with configurable window |
| **Secret 轮换** | `retiringSecret` 支持双密钥并存期 |

### 9.2 Cache-Only Login

| authMethod | 持久化 | 原因 |
|-----------|--------|------|
| `password` | DB + Redis | 需要持久化用于 token 验证和审计 |
| `google` | DB + Redis | 同上 |
| `external` | DB + Redis | 同上 |
| `exchange` | DB + Redis | 同上 |
| `client` | **仅 Redis** | 高频服务端调用，性能优化 |
| `execute` | **仅 Redis** | Bot 执行产生的临时 Login |

---

## 10. MedXAI 实现建议

### 10.1 必须实现

1. **JWT 密钥管理**: 从 DB 加载 JsonWebKey，支持 ES256 签发/验证
2. **Token 签发**: access_token + id_token + refresh_token 三种 JWT
3. **密码登录**: tryLogin → bcrypt → Login → membership → token
4. **client_credentials**: ClientApplication + secret → Login → token
5. **PKCE**: 默认要求 S256
6. **Refresh Token Rotation**: 每次刷新更新 refreshSecret
7. **JWKS 端点**: `/.well-known/jwks.json`

### 10.2 可延后

1. **Google 登录**: 需要 Google OAuth 配置
2. **外部 IdP**: Token Exchange + External Auth Provider
3. **MFA**: TOTP 设置和验证
4. **On-Behalf-Of**: 委托认证
5. **FHIRcast**: 实时通知 hub
6. **Client Assertion**: private_key_jwt

### 10.3 关键差异考虑

- **Cache-Only Login**: 如果不使用 Redis，client_credentials Login 需要写 DB 或内存缓存 + TTL
- **`code` 字段搜索**: Authorization Code 流程通过 `Login.code` 搜索，需要为此字段建立搜索索引
- **Refresh Token 安全**: 旧 refresh token 通过 refreshSecret 失效，不是通过 revoked 标记
- **SystemRepo**: 所有认证操作使用 `getSystemRepo()` — 无项目限制、无 AccessPolicy 限制
