# WF-CUS-003: 应用层资源 — ClientApplication / Bot / AccessPolicy / Agent / 其他

## 1. ClientApplication

### 1.1 资源结构

**定义**: OAuth2 客户端应用，用于 `client_credentials` 和 `authorization_code` 认证。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `status` | code | 0..1 | active \| error \| off |
| `name` | string | 0..1 | 客户端名称 |
| `description` | string | 0..1 | 描述 |
| `secret` | string | 0..1 | 客户端密钥 |
| `retiringSecret` | string | 0..1 | 轮换中的旧密钥 |
| `jwksUri` | uri | 0..1 | JWKS 端点 (用于 JWT 客户端认证) |
| `redirectUri` | uri | 0..1 | OAuth2 重定向 URI (单个) |
| `redirectUris` | uri[] | 0..* | OAuth2 重定向 URI (多个) |
| `launchUri` | uri | 0..1 | SMART on FHIR 启动 URI |
| `pkceOptional` | boolean | 0..1 | 是否允许不使用 PKCE |
| `identityProvider` | IdentityProvider | 0..1 | 外部身份提供商配置 |
| `accessTokenLifetime` | string | 0..1 | 访问令牌有效期 |
| `refreshTokenLifetime` | string | 0..1 | 刷新令牌有效期 |
| `allowedOrigin` | string[] | 0..* | CORS 允许的来源域名 |
| `defaultScope` | string[] | 0..* | 默认 OAuth2 scope |
| `signInForm` | BackboneElement | 0..1 | 自定义登录表单 (welcomeString, logo) |

### 1.2 IdentityProvider 复合类型

嵌入在 `ClientApplication.identityProvider` 中：

| 字段 | 类型 | 说明 |
|------|------|------|
| `authorizeUrl` | uri | 外部 IdP 授权 URL |
| `tokenUrl` | uri | 外部 IdP Token URL |
| `userInfoUrl` | uri | 外部 IdP UserInfo URL |
| `clientId` | string | 外部 IdP 客户端 ID |
| `clientSecret` | string | 外部 IdP 客户端密钥 |
| `useSubject` | boolean | 是否使用 subject 作为用户标识 |

### 1.3 数据输入输出点

| 入口 | 代码位置 | 操作 |
|------|---------|------|
| `POST /admin/projects/:id/client` | `admin/client.ts:createClient()` | 创建 ClientApp + ProjectMembership |
| `seedDatabase()` | `seed.ts:98-119` | 创建默认 SuperAdmin 客户端 (如果配置) |
| `createProject()` | `projectinit.ts:149-153` | 每个新项目自动创建默认客户端 |
| `POST /ClientApplication/:id/$rotate-secret` | `rotatesecret.ts` | 轮换密钥 |
| `GET /ClientApplication/:id/$smart-launch` | `launch.ts` | SMART on FHIR 启动 |
| 标准 FHIR CRUD | `/fhir/R4/ClientApplication` | CRUD |

### 1.4 关键行为

#### Secret 管理

- **创建时**: `generateSecret(32)` 生成随机密钥
- **轮换**: `$rotate-secret` 操作将当前 secret → retiringSecret，生成新 secret
- **验证**: `oauth/token.ts` 同时检查 `secret` 和 `retiringSecret`（支持平滑轮换）
- **权限**: secret 字段通过 systemRepo 写入，不暴露给普通用户

#### OAuth2 流程中的角色

```
/oauth2/token (client_credentials)
  → getClientApplication(clientId) — 读取 ClientApplication
  → 验证 secret / JWT assertion / basic auth
  → getClientApplicationMembership(client) — 查 ProjectMembership
  → 创建 Login (cache-only, authMethod='client')
  → 签发 access_token
```

#### 删除保护

被 `ProjectMembership.user` 或 `ProjectMembership.profile` 引用时，preCommit 检查阻止删除。

#### "内置"客户端

`oauth/utils.ts:getStandardClientById()` 返回硬编码的内置客户端（如配置中的 `adminClientId`），不需要数据库查询。

---

## 2. Bot

### 2.1 资源结构

**定义**: 服务端自动化脚本执行器，可由 Subscription 触发或通过 `$execute` 手动调用。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `name` | string | 0..1 | Bot 名称 |
| `description` | string | 0..1 | 描述 |
| `runtimeVersion` | code | 0..1 | 运行时版本 (awslambda, vmcontext) |
| `timeout` | integer | 0..1 | 执行超时 (毫秒) |
| `photo` | Attachment | 0..1 | 头像 |
| `cron[x]` | Timing \| string | 0..1 | 定时执行计划 |
| `category` | CodeableConcept[] | 0..* | 分类 |
| `system` | boolean | 0..1 | 是否为系统级 Bot |
| `runAsUser` | boolean | 0..1 | 是否以调用用户身份运行 |
| `publicWebhook` | boolean | 0..1 | 是否允许公开 webhook 调用 |
| `auditEventTrigger` | code | 0..1 | AuditEvent 触发条件 |
| `auditEventDestination` | code[] | 0..* | AuditEvent 输出目标 |
| `sourceCode` | Attachment | 0..1 | 源代码 (指向 Binary) |
| `executableCode` | Attachment | 0..1 | 编译后代码 (指向 Binary) |
| `code` | string | 0..1 | 内联代码 |
| `cdsService` | BackboneElement | 0..1 | CDS Hooks 服务定义 |
| `identifier` | Identifier[] | 0..* | 标识符 |

### 2.2 数据输入输出点

| 入口 | 代码位置 | 操作 |
|------|---------|------|
| `POST /admin/projects/:id/bot` | `admin/bot.ts:createBot()` | 创建 Bot + Binary + ProjectMembership |
| `POST /Bot/:id/$deploy` | `operations/deploy.ts` | 编译并部署 Bot 代码 |
| `GET/POST /Bot/:id/$execute` | `operations/execute.ts` | 执行 Bot |
| 标准 FHIR CRUD | `/fhir/R4/Bot` | CRUD |

### 2.3 关键行为

#### 创建流程

```
createBot() @ admin/bot.ts:46-83
  1. 创建 Binary (空源代码模板)
  2. 写入默认 TypeScript 代码到 Binary Storage
  3. 创建 Bot (sourceCode → Binary 引用)
  4. 创建 ProjectMembership (user: Bot, profile: Bot)
```

#### 执行流程

```
Bot.$execute
  1. 读取 Bot 资源
  2. 查找 Bot 的 ProjectMembership
  3. 创建 Login (cache-only, authMethod='execute')
  4. 设置执行上下文 (Repository 以 Bot 的 AccessPolicy 运行)
  5. 根据 runtimeVersion 选择执行引擎:
     - 'vmcontext': Node.js vm 沙箱
     - 'awslambda': AWS Lambda 调用
  6. 记录 AuditEvent
```

#### Subscription 触发

Bot 通常通过 Subscription 触发：
- Subscription 的 `channel.endpoint` 设置为 `Bot/{id}`
- 当匹配的资源创建/更新时，`addSubscriptionJobs()` 排入队列
- Worker 执行 Bot

#### 定时执行 (Cron)

Bot 的 `cron[x]` 字段支持定时执行：
- `cronString`: cron 表达式 (如 `"0 0 * * *"`)
- `cronTiming`: FHIR Timing 类型
- `addCronJobs()` 在 Bot 创建/更新时注册定时任务

#### Pre-commit Bot

特殊类型的 Subscription 可以标记为 pre-commit（`preCommitSubscriptionsEnabled`），Bot 在事务提交前执行，可以修改或拒绝写入操作。

### 2.4 删除保护

被 `ProjectMembership.user` 或 `ProjectMembership.profile` 引用时阻止删除。

---

## 3. AccessPolicy

### 3.1 资源结构

**定义**: 细粒度访问控制策略，控制用户对资源类型和实例的读写权限。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `name` | string | 0..1 | 策略名称 |
| `compartment` | Reference | 0..1 | @deprecated — 整体 compartment 限制 |
| `resource` | BackboneElement[] | 0..* | 资源类型级别的访问规则 |

#### resource 子元素

| 字段 | 类型 | 说明 |
|------|------|------|
| `resource.resourceType` | code | 资源类型 (`*` 为通配) |
| `resource.compartment` | Reference | @deprecated — compartment 限制 |
| `resource.criteria` | string | FHIR 搜索查询 (如 `Patient?organization=Organization/123`) |
| `resource.readonly` | boolean | 是否只读 |
| `resource.readonlyFields` | string[] | 只读字段列表 |
| `resource.hiddenFields` | string[] | 隐藏字段列表 |
| `resource.writeConstraint` | BackboneElement[] | FHIRPath 写入约束 |
| `resource.interaction` | BackboneElement[] | 允许的交互类型 |

### 3.2 在 Repository 中的执行

#### supportsInteraction() — 类型级检查

```
repo.ts:2113-2121
```

```typescript
supportsInteraction(interaction, resourceType): boolean {
  if (!this.isSuperAdmin() && protectedResourceTypes.includes(resourceType)) return false;
  if (!this.context.accessPolicy) return true;
  return accessPolicySupportsInteraction(this.context.accessPolicy, interaction, resourceType);
}
```

#### canPerformInteraction() — 实例级检查

```
repo.ts:2130-2146
```

- 检查 `protectedResourceTypes` → 非 superAdmin 无法访问
- 检查 `resource.meta.project` 是否在用户的项目列表中
- 写操作仅允许对 `projects[0]`（主项目）
- 读操作允许对所有关联项目
- 调用 `satisfiedAccessPolicy()` 检查 criteria 匹配

#### addAccessPolicyFilters() — 搜索过滤

```
repo.ts:1576-1634
```

AccessPolicy 的 `criteria` 被解析为 SQL 搜索条件，作为 `WHERE` 子句附加到查询中：

```sql
-- 如果 AccessPolicy 有 criteria: "Patient?organization=Organization/123"
SELECT * FROM "Patient"
WHERE "projectId" IN (...)
AND ("organization" = 'Organization/123')  -- AccessPolicy 过滤
AND "deleted" = false
```

多个 AccessPolicy resource 条目之间是 **OR** 关系 (`Disjunction`)。

#### removeHiddenFields() — 读取时字段过滤

```
repo.ts:2203-2216
```

- `hiddenFields` 中的字段在返回给用户前被删除
- 非 `extendedMode` 时，`meta.author`, `meta.project`, `meta.account`, `meta.compartment` 被删除

#### restoreReadonlyFields() — 写入时字段保护

```
repo.ts:2226-2255
```

- `readonlyFields` 和 `hiddenFields` 中的字段在写入时恢复为原始值
- 防止用户篡改受保护字段

#### isResourceWriteable() — 写入约束

```
repo.ts:2155-2179
```

- `writeConstraint` 中的 FHIRPath 表达式在写入时评估
- `%before` 和 `%after` 变量分别代表更新前后的资源
- 所有约束必须返回 `true` 才允许写入

### 3.3 AccessPolicy 绑定位置

1. **ProjectMembership.accessPolicy** — 单策略绑定
2. **ProjectMembership.access[]** — 多策略绑定（带参数化）
3. **Project.defaultPatientAccessPolicy** — 新患者默认策略
4. **UserConfiguration** — 可覆盖 membership 的策略

策略解析优先级（`getAccessPolicyForLogin()`）：
```
1. UserConfiguration.option (name='access-policy') → 如果存在
2. membership.access[] → 合并参数化策略
3. membership.accessPolicy → 单策略
4. (无策略) → 允许所有操作
```

### 3.4 MedXAI 实现要点

- **必须实现 `resource[]` 数组**: 每个条目定义一个资源类型的访问规则
- **criteria 解析**: 需要将 FHIR 搜索语法转换为 SQL 条件
- **hiddenFields/readonlyFields**: 需要在读/写路径上分别处理
- **writeConstraint**: 需要 FHIRPath 评估器
- **通配符 `*`**: 匹配所有非 `projectAdminResourceTypes` 的资源类型

---

## 4. Agent

### 4.1 资源结构

**定义**: 本地网络代理，用于连接本地 HL7v2、DICOM、ASTM 设备到 Medplum 云。

| 字段 | 类型 | 基数 | 说明 |
|------|------|------|------|
| `name` | string | 1..1 | 代理名称 |
| `status` | code | 1..1 | active \| off \| error |
| `device` | Reference(Device) | 0..1 | 关联的 Device |
| `setting` | BackboneElement[] | 0..* | 配置参数 |
| `channel` | BackboneElement[] | 0..* | 通信通道配置 |
| `channel.name` | string | 1..1 | 通道名称 |
| `channel.endpoint` | Reference(Endpoint) | 1..1 | 连接端点 |
| `channel.targetReference` | Reference(Bot) | 0..1 | 消息处理 Bot |
| `channel.decodeMode` | code | 0..1 | 解码模式 |

### 4.2 专用 Operations

| 操作 | 路由 | 功能 |
|------|------|------|
| `$status` | `GET /Agent/:id/$status` | 查询代理在线状态 |
| `$bulk-status` | `GET /Agent/$bulk-status` | 批量查询所有代理状态 |
| `$reload-config` | `GET /Agent/:id/$reload-config` | 重新加载代理配置 |
| `$upgrade` | `GET /Agent/:id/$upgrade` | 升级代理版本 |
| `$fetch-logs` | `GET /Agent/:id/$fetch-logs` | 获取代理日志 |
| `$push` | `POST /Agent/:id/$push` | 向代理推送消息 |

### 4.3 MedXAI 建议

Agent 功能高度特定于 Medplum 的本地集成场景。**建议 MedXAI 延后实现**，除非有本地设备集成需求。

---

## 5. 其他资源

### 5.1 UserSecurityRequest

**用途**: 密码重置、邮箱验证等安全操作的一次性令牌。

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | code | 请求类型 (binding: user-security-request-type) |
| `user` | Reference(User) | 关联用户 |
| `secret` | string | 一次性验证密钥 |
| `used` | boolean | 是否已使用 |
| `redirectUri` | uri | 操作完成后的重定向地址 |

**触发点**:
- `POST /auth/resetpassword` → 创建 type='reset' 请求，发送重置邮件
- `POST /auth/verifyemail` → 创建 type='verify' 请求，发送验证邮件
- `POST /auth/setpassword` → 验证 secret，更新 User.passwordHash
- `POST /User/:id/$update-email` → 可能创建验证请求

### 5.2 JsonWebKey

**用途**: 存储 JWT 签名密钥 (RSA/EC)，用于签发和验证 access_token。

| 字段 | 类型 | 说明 |
|------|------|------|
| `active` | boolean | 是否为当前活跃密钥 |
| `kty` | code | 密钥类型 (RSA, EC) |
| `n`, `e`, `d`, `p`, `q`, `dp`, `dq`, `qi` | string | RSA 参数 |
| `x`, `y` | string | EC 参数 |
| `alg` | code | 算法 (RS256, ES384 等) |
| `kid` | string | 密钥 ID |

**protectedResourceType**: 仅 superAdmin/system 可访问。

**触发点**:
- 服务器启动时检查是否存在活跃密钥，没有则生成
- JWT 签发时读取活跃密钥
- `/.well-known/jwks.json` 端点公开公钥部分

**MedXAI 必须实现**: 这是 JWT 签发的基础。

### 5.3 DomainConfiguration

**用途**: 将自定义域名映射到特定项目。

| 字段 | 类型 | 说明 |
|------|------|------|
| `domain` | string | 域名 |
| `identityProvider` | IdentityProvider | 该域名的默认 IdP |

**protectedResourceType**: 仅 superAdmin 可访问。

**MedXAI 建议**: 单域名部署可跳过。

### 5.4 UserConfiguration

**用途**: 用户 UI 配置（菜单、主页、搜索等）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 配置名称 |
| `menu` | BackboneElement[] | 菜单配置 |
| `search` | BackboneElement[] | 默认搜索配置 |
| `option` | BackboneElement[] | 选项配置 (含 access-policy 覆盖) |

**MedXAI 建议**: UI 个性化，可延后。

### 5.5 BulkDataExport

**用途**: `$export` 操作的状态追踪。

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | code | active \| error \| completed |
| `request` | uri | 原始请求 URL |
| `requestTime` | instant | 请求时间 |
| `transactionTime` | instant | 事务时间 |
| `output` | BackboneElement[] | 输出文件列表 |
| `error` | BackboneElement[] | 错误列表 |

**MedXAI 建议**: 如果需要 $export 功能则实现。

### 5.6 AsyncJob

**用途**: 长时间运行的异步操作状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | code | accepted \| active \| error \| completed |
| `request` | uri | 原始请求 |
| `requestTime` | instant | 请求时间 |
| `transactionTime` | instant | 完成时间 |
| `output` | BackboneElement | 输出参数 |

**专用操作**: `POST /AsyncJob/:id/$cancel`

**MedXAI 建议**: 如果有批量操作需求则实现。

### 5.7 SmartAppLaunch

**用途**: SMART on FHIR 应用启动上下文。

| 字段 | 类型 | 说明 |
|------|------|------|
| `patient` | Reference(Patient) | 启动时的患者上下文 |
| `encounter` | Reference(Encounter) | 启动时的就诊上下文 |

**MedXAI 建议**: 如果需要 SMART on FHIR 则实现。

### 5.8 ViewDefinition (logical)

**用途**: SQL-on-FHIR 视图定义（HL7 规范）。

**kind**: `logical` — 不持久化到数据库，仅作为类型定义存在。

**MedXAI**: 不需要实现。

---

## 6. 汇总: 变更副作用矩阵

| 操作 | 资源 | 副作用 |
|------|------|--------|
| **创建** Project | Project | → 自动创建 ClientApplication + ProjectMembership |
| **创建** ClientApplication | ClientApplication | → 生成 secret → 创建 ProjectMembership |
| **创建** Bot | Bot | → 创建 Binary → 创建 ProjectMembership |
| **创建** Login (client/execute) | Login | → 仅写 Redis (isCacheOnly) |
| **创建** Subscription (websocket) | Subscription | → 仅写 Redis + sadd 到活跃集合 |
| **更新** StructureDefinition | StructureDefinition | → 清除 profile 缓存 |
| **更新** User.email | User | → 发送验证邮件 → 可能更新 profile telecom |
| **删除** 被 Membership 引用的资源 | Bot/Client/Patient/Practitioner/User | → preCommit 阻止删除 |
| **更新** Login.membership | Login | → 检查 Project features → 获取 AccessPolicy → 检查 IP 规则 |
| **轮换** ClientApp secret | ClientApplication | → 旧 secret → retiringSecret → 新 secret 生成 |
| **所有写入** | 所有资源 | → addBackgroundJobs() → Subscription + Download + Cron |
| **所有写入** | 所有资源 | → preCommitValidation() → 可能执行 pre-commit Bot |

---

## 7. MedXAI 实现优先级总结

### Phase 1 — 核心 (必须)

1. **Project** — 多租户隔离
2. **User** — 认证主体
3. **ProjectMembership** — 关联与权限
4. **Login** — OAuth2 会话
5. **ClientApplication** — 服务端认证
6. **AccessPolicy** — 行级访问控制
7. **JsonWebKey** — JWT 签发

### Phase 2 — 自动化 (推荐)

8. **Bot** — 服务端自动化
9. **UserSecurityRequest** — 密码重置/邮箱验证
10. **AsyncJob** — 异步操作状态

### Phase 3 — 扩展 (可延后)

11. **UserConfiguration** — UI 配置
12. **BulkDataExport** — 批量导出
13. **SmartAppLaunch** — SMART on FHIR
14. **Agent** — 本地设备集成
15. **DomainConfiguration** — 多域名
