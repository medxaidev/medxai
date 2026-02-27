# WF-CUS-006: MedplumClient 核心能力分析

## 1. 概述

**文件**: `packages/core/src/client.ts` (~4676 行)

`MedplumClient` 是 Medplum 的统一客户端 SDK，可运行于浏览器、Node.js 和 Bot 环境。它封装了完整的 FHIR REST API、OAuth2 认证流程、以及多种高级能力。

**核心架构**:

```
MedplumClient extends TypedEventTarget
  |
  +-- HTTP 层: fetch + fetchWithRetry + request
  |     +-- 自动重试 (429/5xx)
  |     +-- 自动刷新 token
  |     +-- Rate Limit 感知
  |
  +-- 缓存层: LRUCache<RequestCacheEntry>
  |     +-- GET 请求缓存
  |     +-- 搜索结果缓存
  |     +-- 资源实例缓存
  |
  +-- 批处理层: AutoBatch
  |     +-- 定时聚合 GET -> Bundle batch
  |
  +-- 认证层: OAuth2 + PKCE
  |     +-- Password / Google / Client Credentials / JWT Bearer / External
  |     +-- Token refresh
  |
  +-- 订阅层: SubscriptionManager
  |     +-- WebSocket + ReconnectingWebSocket
  |
  +-- 存储层: IClientStorage
        +-- localStorage (浏览器) / 内存 (Node) / 自定义
```

---

## 2. 配置选项

**接口**: `MedplumClientOptions`

| 选项                    | 类型                               | 默认值                     | 说明                                   |
| ----------------------- | ---------------------------------- | -------------------------- | -------------------------------------- |
| `baseUrl`               | string                             | `https://api.medplum.com/` | API 基础 URL                           |
| `fhirUrlPath`           | string                             | `fhir/R4/`                 | FHIR 路径前缀                          |
| `authorizeUrl`          | string                             | `{base}/oauth2/authorize`  | OAuth2 授权 URL                        |
| `tokenUrl`              | string                             | `{base}/oauth2/token`      | OAuth2 Token URL                       |
| `logoutUrl`             | string                             | `{base}/oauth2/logout`     | 登出 URL                               |
| `fhircastHubUrl`        | string                             | `{base}/fhircast/STU3`     | FHIRcast Hub URL                       |
| `clientId`              | string                             | `''`                       | OAuth2 Client ID                       |
| `clientSecret`          | string                             | `''`                       | OAuth2 Client Secret                   |
| `accessToken`           | string                             | -                          | 预设 Access Token                      |
| `authCredentialsMethod` | `'body'` or `'header'`             | `'body'`                   | 凭证传递方式                           |
| `resourceCacheSize`     | number                             | `1000`                     | LRU 缓存容量                           |
| `cacheTime`             | number                             | 浏览器 60000 / Node 0      | 缓存 TTL (ms)                          |
| `autoBatchTime`         | number                             | `0` (禁用)                 | 自动批处理延迟 (ms)                    |
| `refreshGracePeriod`    | number                             | `300000` (5 min)           | Token 刷新提前量                       |
| `fetch`                 | FetchLike                          | `globalThis.fetch`         | 自定义 fetch 实现                      |
| `storage`               | IClientStorage                     | `ClientStorage`            | 自定义持久化存储                       |
| `createPdf`             | Function                           | -                          | PDF 生成实现                           |
| `onUnauthenticated`     | Function                           | -                          | 认证失败回调                           |
| `redirect`              | RequestRedirect                    | 不跟随                     | 重定向行为                             |
| `logLevel`              | `'none'` / `'basic'` / `'verbose'` | `'none'`                   | 日志级别                               |
| `extendedMode`          | boolean                            | `true`                     | Medplum 扩展模式 (meta.author/project) |
| `defaultHeaders`        | Record                             | `{}`                       | 默认请求头                             |
| `storagePrefix`         | string                             | `''`                       | 存储键前缀                             |

---

## 3. 认证能力

### 3.1 认证方法一览

| 方法                                              | 流程类型                         | 适用场景          |
| ------------------------------------------------- | -------------------------------- | ----------------- |
| `startLogin(request)`                             | Password + PKCE                  | 用户邮箱/密码登录 |
| `startGoogleLogin(request)`                       | Google OAuth                     | Google 账号登录   |
| `startClientLogin(clientId, secret)`              | Client Credentials               | 服务端 M2M 通信   |
| `startJwtBearerLogin(clientId, assertion, scope)` | JWT Bearer (RFC 7523)            | JWT 断言登录      |
| `startJwtAssertionLogin(jwt)`                     | Client Assertion (RFC 7523 S2.2) | 私钥 JWT 认证     |
| `signInWithRedirect(params)`                      | Authorization Code + PKCE        | 浏览器重定向登录  |
| `signInWithExternalAuth(...)`                     | 外部 IdP                         | 外部身份提供商    |
| `exchangeExternalAccessToken(token)`              | Token Exchange (RFC 8693)        | 外部 Token 交换   |
| `setBasicAuth(clientId, secret)`                  | Basic Auth                       | HTTP Basic 认证   |
| `setAccessToken(token, refresh?)`                 | 直接设置                         | 外部获取的 token  |

### 3.2 Token 生命周期管理

```
构造函数:
  +-- 如果有 accessToken 选项 -> setAccessToken()
  +-- 如果有异步 storage -> 等待初始化
  +-- attemptResumeActiveLogin()
        -> 从 storage 读取 activeLogin
        -> setAccessToken(accessToken, refreshToken)
        -> refreshProfile() -> GET /auth/me

每次请求前:
  request() -> refreshIfExpired()
    +-- accessTokenExpires 过期?
    |     +-- 有 refreshToken -> fetchTokens(grant_type=refresh_token)
    |     +-- 有 clientId+secret -> startClientLogin()
    +-- 否 -> 跳过

请求 401:
  handleUnauthenticated()
    +-- refresh() 成功 -> 重试请求
    +-- 失败 -> clear() + onUnauthenticated()
```

### 3.3 PKCE 流程

```
startPkce():
  pkceState = getRandomString() -> sessionStorage
  codeVerifier = getRandomString().slice(0, 128) -> sessionStorage
  codeChallenge = base64url(SHA256(codeVerifier))
  return { codeChallengeMethod: 'S256', codeChallenge }
```

所有 `startLogin` / `startGoogleLogin` 会自动调用 `ensureCodeChallenge()` 注入 PKCE。

### 3.4 Session 状态

```typescript
interface SessionDetails {
  project: Project;
  membership: ProjectMembership;
  profile: WithId<ProfileResource>;
  config: WithId<UserConfiguration>;
  accessPolicy: AccessPolicy;
}
```

通过 `GET /auth/me` 获取，缓存在 `sessionDetails` 中。

**访问器**:

- `getProject()` / `getProjectMembership()` / `getProfile()` / `getProfileAsync()`
- `getUserConfiguration()` / `getAccessPolicy()`
- `isSuperAdmin()` / `isProjectAdmin()`

---

## 4. FHIR CRUD 操作

### 4.1 方法清单

| 方法                                         | HTTP                              | 说明                  |
| -------------------------------------------- | --------------------------------- | --------------------- |
| `createResource(resource)`                   | `POST /{type}`                    | 创建资源              |
| `createResourceIfNoneExist(resource, query)` | `POST /{type}` + `If-None-Exist`  | 条件创建              |
| `readResource(type, id)`                     | `GET /{type}/{id}`                | 读取资源              |
| `readReference(ref)`                         | `GET /{type}/{id}`                | 按引用读取            |
| `readCanonical(type, url)`                   | `GET /{type}?url=`                | 按 canonical URL 读取 |
| `updateResource(resource)`                   | `PUT /{type}/{id}`                | 更新资源              |
| `upsertResource(resource, query)`            | `PUT /{type}?{query}`             | 条件更新/创建         |
| `patchResource(type, id, ops)`               | `PATCH /{type}/{id}`              | JSON Patch 更新       |
| `deleteResource(type, id)`                   | `DELETE /{type}/{id}`             | 删除资源              |
| `validateResource(resource)`                 | `POST /{type}/$validate`          | 资源验证              |
| `readHistory(type, id)`                      | `GET /{type}/{id}/_history`       | 读取版本历史          |
| `readVersion(type, id, vid)`                 | `GET /{type}/{id}/_history/{vid}` | 读取特定版本          |

### 4.2 缓存失效策略

```
createResource() -> invalidateSearches(resourceType)
updateResource() -> cacheResource + invalidate(_history) + invalidateSearches
patchResource()  -> cacheResource + invalidate(_history) + invalidateSearches
deleteResource() -> deleteCacheEntry + invalidateSearches
```

每个写操作都会自动清除相关搜索缓存，确保下次搜索获取最新数据。

### 4.3 Binary / Attachment 操作

| 方法                               | 说明                            |
| ---------------------------------- | ------------------------------- |
| `createBinary(options)`            | 上传 Binary (支持进度回调)      |
| `createAttachment(options)`        | 创建 Attachment (基于 Binary)   |
| `createMedia(options)`             | 创建 Media + Binary + 更新状态  |
| `createDocumentReference(options)` | 创建 DocumentReference + Binary |
| `createPdf(options)`               | PDF 生成 -> Binary              |
| `download(url)`                    | 下载 Binary 为 Blob             |

**上传进度**: 使用 `XMLHttpRequest` 替代 `fetch`，支持 `onProgress` 回调。

**Security Context**: `createMedia` / `createDocumentReference` 自动设置 `X-Security-Context` header 关联 Binary 到父资源。

---

## 5. 搜索能力

### 5.1 搜索方法

| 方法                               | 返回类型                  | 说明                       |
| ---------------------------------- | ------------------------- | -------------------------- |
| `search(type, query)`              | `Bundle<Resource>`        | 搜索 (返回 Bundle)         |
| `searchOne(type, query)`           | `Resource` or `undefined` | 搜索单个 (自动 `_count=1`) |
| `searchResources(type, query)`     | `ResourceArray`           | 搜索 (返回资源数组)        |
| `searchResourcePages(type, query)` | `AsyncGenerator`          | 分页迭代器                 |

### 5.2 ResourceArray

```typescript
type ResourceArray<T> = T[] & { bundle: Bundle<T> };
```

同时携带资源数组和原始 Bundle，可访问 `total`、分页链接等元数据。

### 5.3 分页搜索

```typescript
// 自动分页，每次最多 1000 条
async *searchResourcePages(type, query) {
  while (url) {
    const bundle = await search(type, params);
    yield bundleToResourceArray(bundle);
    url = bundle.link?.find(l => l.relation === 'next')?.url;
  }
}
```

支持 `_offset` 和 `_cursor` 两种分页模式。`_offset` 限制 10,000 条。

### 5.4 搜索缓存

搜索结果使用独立缓存键:

- `search-{url}` - Bundle 缓存
- `searchOne-{url}` - 单资源缓存
- `searchResources-{url}` - 数组缓存

搜索结果中的每个资源也会被单独缓存 (通过 `cacheResource`)。

---

## 6. Batch / Transaction

### 6.1 显式 Batch/Transaction

```typescript
executeBatch(bundle: Bundle): Promise<Bundle>
// POST {fhirBaseUrl} (Bundle body)
```

支持 FHIR `batch` 和 `transaction` 类型。Transaction 是原子性的。

### 6.2 自动批处理 (Auto-Batch)

**启用**: `new MedplumClient({ autoBatchTime: 50 })`

**工作原理**:

```
GET /fhir/R4/Patient/1  --+
GET /fhir/R4/Patient/2  --+  在 autoBatchTime 内收集
GET /fhir/R4/Patient/3  --+
                           v
executeAutoBatch()
  +-- 如果只有 1 个请求 -> 直接执行
  +-- 如果多个请求:
        -> 构建 Bundle { type: 'batch', entry: [...] }
        -> POST {fhirBaseUrl} Bundle
        -> 解析响应，逐个 resolve/reject
```

**限制**:

- 仅限 `GET` 请求
- 仅限 FHIR URL (`url.startsWith(fhirBaseUrl)`)
- 可通过 `options.disableAutoBatch` 单次禁用

**性能意义**: 在 UI 渲染时，多个组件同时请求不同资源，可以自动合并为单个 HTTP 请求，显著减少网络往返。

---

## 7. GraphQL

```typescript
graphql(query, operationName?, variables?): Promise<any>
// POST /fhir/R4/$graphql { query, operationName, variables }
```

支持:

- 简单查询: `{ Patient(id: "123") { name { given family } } }`
- 命名操作 + 变量: `query GetPatient($id: ID!) { Patient(id: $id) { ... } }`
- 批量列表查询: `{ PatientList(name: "Alice") { ... } }`

**Schema 加载**: `requestSchema(resourceType)` 通过 GraphQL 查询 StructureDefinition + SearchParameter 并缓存。

---

## 8. FHIR 操作 ($operations)

| 方法                                 | 操作                                  | 说明                    |
| ------------------------------------ | ------------------------------------- | ----------------------- |
| `validateResource(resource)`         | `$validate`                           | 资源验证                |
| `valueSetExpand(params)`             | `ValueSet/$expand`                    | 值集展开                |
| `readPatientEverything(id)`          | `Patient/{id}/$everything`            | 患者所有资源            |
| `readPatientSummary(id)`             | `Patient/{id}/$summary`               | 国际患者摘要 (IPS)      |
| `readResourceGraph(type, id, graph)` | `{type}/{id}/$graph`                  | 图定义遍历              |
| `executeBot(id, body, contentType)`  | `Bot/{id}/$execute`                   | Bot 执行                |
| `pushToAgent(agent, dest, body)`     | `Agent/{id}/$push`                    | Agent 推送              |
| `requestProfileSchema(url)`          | `StructureDefinition/$expand-profile` | Profile 展开            |
| `bulkExport(level, types, since)`    | `$export`                             | 批量数据导出            |
| `startAsyncRequest(url)`             | 异步请求模式                          | `Prefer: respond-async` |

---

## 9. 缓存系统

### 9.1 LRU 缓存

```typescript
class LRUCache<T> {
  private max: number; // 默认 1000
  private cache: Map<string, T>; // 有序 Map (LRU 淘汰)

  get(key): T | undefined; // 访问时移到末尾
  set(key, val): void; // 满时淘汰最旧
  delete(key): void;
  clear(): void;
  keys(): IterableIterator;
}
```

### 9.2 RequestCacheEntry

```typescript
interface RequestCacheEntry {
  requestTime: number; // 缓存时间戳
  value: ReadablePromise<any>; // Promise (支持同步读取)
}
```

### 9.3 缓存行为

| 场景                            | 行为                                 |
| ------------------------------- | ------------------------------------ |
| `GET` 请求                      | 检查缓存 -> 命中且未过期 -> 返回缓存 |
| `POST/PUT/PATCH/DELETE`         | 清除相关缓存                         |
| `options.cache = 'no-cache'`    | 跳过缓存读取                         |
| `options.cache = 'reload'`      | 跳过缓存读取                         |
| `x-medplum-on-behalf-of` header | 禁用缓存                             |
| `cacheTime = 0`                 | 完全禁用缓存                         |
| 资源被 SUBSETTED 标记           | 不缓存                               |

### 9.4 缓存失效方法

| 方法                       | 说明                   |
| -------------------------- | ---------------------- |
| `invalidateUrl(url)`       | 清除特定 URL           |
| `invalidateAll()`          | 清除所有缓存           |
| `invalidateSearches(type)` | 清除指定类型的搜索缓存 |
| `getCached(type, id)`      | 同步获取缓存资源       |
| `getCachedReference(ref)`  | 同步获取缓存引用       |

---

## 10. HTTP 请求管道

### 10.1 请求处理流程

```
client.get/post/put/patch/delete(url, ...)
  |
  v
request(method, url, options)
  |
  +-- refreshIfExpired() -- Token 过期检查+自动刷新
  |
  +-- addFetchOptionsDefaults(options)
  |     +-- defaultHeaders
  |     +-- Accept: application/fhir+json, */*; q=0.1
  |     +-- X-Medplum: extended (如果 extendedMode)
  |     +-- Content-Type: application/fhir+json (如果有 body)
  |     +-- Authorization: Bearer {token} 或 Basic {base64}
  |     +-- cache: no-cache
  |     +-- credentials: include
  |
  +-- fetchWithRetry(url, options)
  |     +-- for attemptNum = 0..maxRetries:
  |     |     +-- this.fetch(url, options)
  |     |     +-- setCurrentRateLimit(response)
  |     |     +-- isRetryable(response)? (429 或 5xx)
  |     |     |     +-- getRetryDelay(attemptNum)
  |     |     |     |     500 * 1.5^attemptNum
  |     |     |     |     + rateLimitReset (如果配额耗尽)
  |     |     |     +-- delay > maxRetryTime? -> 返回
  |     |     |     +-- sleep(delay) -> 重试
  |     |     +-- 不可重试 -> 返回
  |     +-- 'Failed to fetch' -> dispatchEvent('offline')
  |     +-- AbortError -> 立即抛出
  |
  +-- 状态码处理:
        +-- 401 -> handleUnauthenticated (refresh + retry)
        +-- 204/304 -> undefined (无内容/未修改)
        +-- 200 + followRedirectOnOk -> GET Content-Location
        +-- 201 + followRedirectOnCreated -> GET Content-Location
        +-- 202 + pollStatusOnAccepted -> pollStatus(statusUrl)
        +-- 404 (non-JSON) -> throw notFound
        +-- 400+ -> throw OperationOutcomeError
        +-- 成功 -> 返回 body
```

### 10.2 自动重试配置

```typescript
interface MedplumRequestOptions {
  maxRetries?: number; // 默认 2 (总共 3 次尝试)
  maxRetryTime?: number; // 默认 2000ms
}
```

**重试条件**: HTTP 429 (Too Many Requests) 或 5xx (Server Error)。

**退避策略**: 指数退避 `500 * 1.5^attemptNum`，与 Rate Limit 信息叠加。

### 10.3 Rate Limit 感知

```
Response header: ratelimit: "user"; r=95; t=60, "project"; r=950; t=60
                                     ^remaining  ^seconds_until_reset

rateLimitStatus() -> [
  { name: 'user', remainingUnits: 95, secondsUntilReset: 60, resetsAfter: ... },
  { name: 'project', remainingUnits: 950, secondsUntilReset: 60, resetsAfter: ... }
]
```

当 `remainingUnits = 0` 时，重试延迟会延长到 `secondsUntilReset * 1000`。

### 10.4 异步请求模式

```typescript
startAsyncRequest(url): Promise<T>
// 设置 Prefer: respond-async
// 返回 202 -> pollStatus(Content-Location)
//   -> 循环 GET statusUrl (间隔 pollStatusPeriod, 默认 1s)
//   -> 直到非 202 -> 返回结果
```

用于 `$export` 等长时间运行的操作。

---

## 11. WebSocket 订阅

### 11.1 SubscriptionManager

**文件**: `packages/core/src/subscriptions/index.ts`

```
SubscriptionManager
  |
  +-- medplum: MedplumClient
  +-- ws: ReconnectingWebSocket  (ws://host/ws/subscriptions-r4)
  +-- criteriaEntries: Map<criteria, CriteriaMapEntry>
  +-- criteriaEntriesBySubscriptionId: Map<subId, CriteriaEntry>
  +-- masterSubEmitter: SubscriptionEmitter (全局事件)
  +-- pingTimer: setInterval (每 5s ping/pong)
```

### 11.2 订阅流程

```
subscribeToCriteria('Communication?status=completed')
  |
  +-- addCriteria(criteria)
  |     +-- 如果已存在 -> refCount++ -> 返回同一 emitter
  |     +-- 新建 CriteriaEntry
  |
  +-- subscribeToCriteria(criteriaEntry) [async]
        +-- medplum.createResource<Subscription>({
        |     resourceType: 'Subscription',
        |     status: 'active',
        |     channel: { type: 'websocket' },
        |     criteria: 'Communication?status=completed'
        |   })
        |
        +-- medplum.get('Subscription/{id}/$get-ws-binding-token')
        |   -> { token, websocket-url }
        |
        +-- ws.send({ type: 'bind-with-token', payload: { token } })
        |
        +-- 等待 handshake 消息
              -> emit 'connect' 事件
```

### 11.3 消息处理

```
WebSocket message:
  +-- JSON.parse(data)
  |
  +-- { type: 'pong' } -> 重置 waitingForPong
  |
  +-- Bundle (SubscriptionStatus):
        +-- status.type === 'heartbeat'
        |     -> masterEmitter.dispatch('heartbeat', bundle)
        |
        +-- status.type === 'handshake'
        |     -> masterEmitter.dispatch('connect', { subscriptionId })
        |     -> criteriaEmitter.dispatch('connect', { subscriptionId })
        |
        +-- 其他 (notification)
              -> masterEmitter.dispatch('message', bundle)
              -> criteriaEmitter.dispatch('message', bundle)
```

### 11.4 连接管理

- **ReconnectingWebSocket**: 自动重连
- **Ping/Pong**: 每 5 秒发送 ping，未收到 pong 则触发重连
- **Profile 变更**: 自动重连 WebSocket
- **登出**: 自动关闭 WebSocket
- **重连后**: 自动刷新所有订阅 (`refreshAllSubscriptions`)
- **引用计数**: 相同 criteria 多次订阅共享同一 Subscription 资源

### 11.5 事件类型

| 事件         | 触发时机           |
| ------------ | ------------------ |
| `open`       | WebSocket 连接打开 |
| `close`      | WebSocket 连接关闭 |
| `connect`    | 订阅握手成功       |
| `disconnect` | 订阅断开           |
| `message`    | 收到通知 Bundle    |
| `heartbeat`  | 收到心跳           |
| `error`      | 发生错误           |

---

## 12. FHIRcast

### 12.1 方法

| 方法                                     | 说明                         |
| ---------------------------------------- | ---------------------------- |
| `fhircastSubscribe(topic, events)`       | 订阅 FHIRcast 话题           |
| `fhircastUnsubscribe(subRequest)`        | 取消订阅                     |
| `fhircastConnect(subRequest)`            | 建立 FHIRcast WebSocket 连接 |
| `fhircastPublish(topic, event, context)` | 发布上下文变更事件           |
| `fhircastGetContext(topic)`              | 获取当前上下文               |

### 12.2 流程

```
fhircastSubscribe('topic-uuid', ['Patient-open', 'Patient-close'])
  -> POST /fhircast/STU3
       { hub.channel.type: 'websocket', hub.mode: 'subscribe',
         hub.topic: 'topic-uuid', hub.events: 'Patient-open,Patient-close' }
  -> { hub.channel.endpoint: 'wss://...' }
  -> return SubscriptionRequest

fhircastConnect(subRequest)
  -> new FhircastConnection(subRequest)
  -> WebSocket 连接到 endpoint
```

---

## 13. 其他能力

### 13.1 邮件发送

```typescript
sendEmail(email: MailOptions): Promise<OperationOutcome>
// POST /email/v1/send
```

### 13.2 CDS Hooks

```typescript
getCdsServices(): Promise<CdsDiscoveryResponse>  // GET /cds-services
callCdsService(id, body): Promise<CdsResponse>     // POST /cds-services/{id}
```

### 13.3 项目管理

```typescript
invite(projectId, body: InviteRequest): Promise<ProjectMembership>
// POST /admin/projects/{id}/invite
```

### 13.4 创建便捷方法

```typescript
createComment(resource, text); // 创建 Communication (评论)
```

### 13.5 Key-Value 存储

```typescript
client.keyValue; // MedplumKeyValueClient (懒加载)
```

### 13.6 事件系统

```typescript
type MedplumClientEventMap = {
  change: {}; // 登录/登出状态变更
  offline: {}; // 网络离线
  profileRefreshing: {}; // Profile 刷新中
  profileRefreshed: {}; // Profile 刷新完成
  storageInitialized: {}; // 存储初始化完成
  storageInitFailed: { error }; // 存储初始化失败
};
```

---

## 14. 核心能力清单总表

### 14.1 FHIR REST 操作

| 能力                   | 状态 | 关键方法                                                        |
| ---------------------- | ---- | --------------------------------------------------------------- |
| **Create**             | 必须 | `createResource`, `createResourceIfNoneExist`                   |
| **Read**               | 必须 | `readResource`, `readReference`, `readCanonical`                |
| **Update**             | 必须 | `updateResource`, `upsertResource`                              |
| **Patch**              | 必须 | `patchResource` (JSON Patch)                                    |
| **Delete**             | 必须 | `deleteResource`                                                |
| **Search**             | 必须 | `search`, `searchOne`, `searchResources`, `searchResourcePages` |
| **History**            | 建议 | `readHistory`, `readVersion`                                    |
| **Batch/Transaction**  | 必须 | `executeBatch`                                                  |
| **$validate**          | 建议 | `validateResource`                                              |
| **Conditional Create** | 建议 | `If-None-Exist` header                                          |
| **Conditional Update** | 建议 | `upsertResource`                                                |

### 14.2 认证

| 能力                          | 状态   | 关键方法                                        |
| ----------------------------- | ------ | ----------------------------------------------- |
| **Password Login + PKCE**     | 必须   | `startLogin`, `startPkce`                       |
| **Client Credentials**        | 必须   | `startClientLogin`                              |
| **Token Refresh**             | 必须   | `refresh`, `refreshIfExpired`                   |
| **Basic Auth**                | 必须   | `setBasicAuth`                                  |
| **Authorization Code + PKCE** | 建议   | `signInWithRedirect`, `processCode`             |
| **Google Login**              | 可延后 | `startGoogleLogin`                              |
| **JWT Bearer**                | 可延后 | `startJwtBearerLogin`, `startJwtAssertionLogin` |
| **External Token Exchange**   | 可延后 | `exchangeExternalAccessToken`                   |
| **External IdP Redirect**     | 可延后 | `signInWithExternalAuth`                        |

### 14.3 高级 HTTP

| 能力                | 状态 | 说明                            |
| ------------------- | ---- | ------------------------------- |
| **自动重试**        | 必须 | 429/5xx 指数退避重试            |
| **Token 自动刷新**  | 必须 | 过期前 5 分钟刷新               |
| **401 自动重试**    | 必须 | refresh + retry                 |
| **Rate Limit 感知** | 建议 | ratelimit header 解析           |
| **Async 请求模式**  | 建议 | Prefer: respond-async + polling |
| **Request 日志**    | 建议 | basic/verbose 两级日志          |

### 14.4 缓存

| 能力                    | 状态 | 说明                            |
| ----------------------- | ---- | ------------------------------- |
| **LRU 资源缓存**        | 必须 | 1000 条 + TTL                   |
| **搜索缓存**            | 必须 | 独立缓存键                      |
| **写后失效**            | 必须 | create/update/delete 自动清缓存 |
| **ReadablePromise**     | 建议 | 支持 React Suspense             |
| **On-Behalf-Of 禁缓存** | 建议 | 委托模式下跳过缓存              |

### 14.5 批处理

| 能力                 | 状态 | 说明                              |
| -------------------- | ---- | --------------------------------- |
| **显式 Batch**       | 必须 | `executeBatch`                    |
| **显式 Transaction** | 必须 | `executeBatch` (type=transaction) |
| **Auto-Batch**       | 建议 | 定时聚合 GET 请求                 |

### 14.6 实时通信

| 能力                      | 状态   | 说明                                        |
| ------------------------- | ------ | ------------------------------------------- |
| **WebSocket 订阅**        | 建议   | `subscribeToCriteria` + SubscriptionManager |
| **ReconnectingWebSocket** | 建议   | 自动重连 + ping/pong                        |
| **FHIRcast**              | 可延后 | 临床工作流上下文同步                        |

### 14.7 扩展功能

| 能力                    | 状态   | 说明                                  |
| ----------------------- | ------ | ------------------------------------- |
| **GraphQL**             | 建议   | FHIR GraphQL 端点                     |
| **Patient $everything** | 建议   | 患者全部数据                          |
| **Patient $summary**    | 可延后 | IPS 国际患者摘要                      |
| **$graph**              | 可延后 | GraphDefinition 遍历                  |
| **ValueSet $expand**    | 建议   | 值集展开搜索                          |
| **Bot $execute**        | 可延后 | 远程 Bot 执行                         |
| **Agent $push**         | 可延后 | Agent 消息推送                        |
| **$export**             | 可延后 | 批量数据导出                          |
| **Binary 上传进度**     | 建议   | XMLHttpRequest onProgress             |
| **PDF 生成**            | 可延后 | pdfmake 集成                          |
| **Email 发送**          | 可延后 | nodemailer 兼容                       |
| **CDS Hooks**           | 可延后 | 临床决策支持                          |
| **Schema 加载**         | 建议   | StructureDefinition + SearchParameter |
| **Key-Value 存储**      | 可延后 | 自定义键值对                          |

---

## 15. MedXAI 实现建议

### 15.1 第一阶段 (MVP)

1. **基础 HTTP 层**: fetch 封装 + 自动重试 + token 管理
2. **FHIR CRUD**: create/read/update/patch/delete
3. **搜索**: search/searchOne/searchResources
4. **认证**: startClientLogin + setAccessToken + refreshIfExpired
5. **缓存**: LRU 缓存 + 写后失效
6. **Batch**: executeBatch

### 15.2 第二阶段 (增强)

1. **Auto-Batch**: 减少 UI 网络请求
2. **分页搜索**: searchResourcePages AsyncGenerator
3. **GraphQL**: FHIR GraphQL 端点
4. **WebSocket 订阅**: SubscriptionManager
5. **$validate**: 资源验证
6. **ValueSet $expand**: 值集搜索

### 15.3 关键设计决策

| 决策点              | Medplum 方案                 | 建议                                 |
| ------------------- | ---------------------------- | ------------------------------------ |
| **fetch 实现**      | `globalThis.fetch` + 可注入  | 保持可注入设计，兼容 SSR             |
| **缓存默认**        | 浏览器 60s / Node 0          | 保持区分                             |
| **Auto-Batch 默认** | 禁用 (0ms)                   | 保持禁用，由应用按需启用             |
| **extendedMode**    | 默认 `true`                  | 建议保持，meta.author/project 很有用 |
| **存储**            | localStorage / 内存 / 自定义 | 保持 IClientStorage 接口             |
| **Token 刷新**      | 过期前 5 分钟                | 保持                                 |
| **重试策略**        | 2 次重试，指数退避           | 保持                                 |
| **ReadablePromise** | 支持 React Suspense          | 按 UI 框架决定                       |

---

## 16. G3 实现结果

**实现日期**: 2026-02-28
**状态**: ✅ 完成 (必须项全部实现)

### 16.1 实现清单

| G3 子任务 | 内容                                                                                  | 状态 | 备注                                                       |
| --------- | ------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| G3.1      | `patchResource` (JSON Patch) + `searchOne` + `searchResources`                        | ✅   | RFC 6902, `_count=1`, `ResourceArray`                      |
| G3.2      | `executeBatch` (batch/transaction)                                                    | ✅   | POST to base URL                                           |
| G3.3      | Auto-retry (429/5xx 指数退避)                                                         | ✅   | `maxRetries=2`, `maxRetryTime=2000ms`, `500 * 1.5^attempt` |
| G3.4      | Token auto-refresh (`refreshIfExpired`) + 401 retry                                   | ✅   | Grace period 5min, 401→refresh→retry                       |
| G3.5      | LRU cache + search cache + write-through invalidation                                 | ✅   | `cacheSize=1000`, TTL, `getCached`, `invalidateAll`        |
| G3.6      | `startClientLogin` (client_credentials) + `setBasicAuth`                              | ✅   | M2M auth, Basic auth fallback                              |
| G3.7      | `readReference`, `createResourceIfNoneExist`, `upsertResource`, `searchResourcePages` | ✅   | AsyncGenerator pagination                                  |
| G3.8      | `validateResource` + `readPatientEverything`                                          | ✅   | `$validate`, `$everything`                                 |
| G3.9      | Tests + 文档更新                                                                      | ✅   | 63/63 tests (38 unit + 14 E2E + 11 auth E2E)               |

### 16.2 新增/修改文件

| 文件                                            | 变更类型 | 说明                                                                                    |
| ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `fhir-client/src/types.ts`                      | 修改     | `PatchOperation`, `RequestOptions`, `ResourceArray`, 扩展 `MedXAIClientConfig`+`Bundle` |
| `fhir-client/src/client.ts`                     | 修改     | 新增 20+ 方法, LRU cache, retry pipeline, token management                              |
| `fhir-client/src/index.ts`                      | 修改     | 导出新类型                                                                              |
| `fhir-client/src/__tests__/client-unit.test.ts` | 新增     | 38 unit tests (mock fetch)                                                              |

### 16.3 新增公开 API

**CRUD 增强:**

- `patchResource(resourceType, id, operations)` — JSON Patch (RFC 6902)
- `createResourceIfNoneExist(resource, query)` — `If-None-Exist` conditional create
- `upsertResource(resource, query)` — conditional update/create
- `readReference(reference)` — read by reference string (e.g. `"Patient/123"`)
- `validateResource(resource)` — `$validate` operation
- `deleteResource` — now with cache invalidation

**Search 增强:**

- `searchOne(resourceType, params)` — returns first match or undefined
- `searchResources(resourceType, params)` — returns `ResourceArray<T>` with `.bundle`
- `searchResourcePages(resourceType, params)` — `AsyncGenerator` for pagination

**Batch/Transaction:**

- `executeBatch(bundle)` — send batch or transaction Bundle

**Operations:**

- `readPatientEverything(id)` — Patient `$everything`

**Auth 增强:**

- `startClientLogin(clientId, clientSecret)` — client_credentials grant
- `setBasicAuth(clientId, clientSecret)` — Basic auth header
- `setAccessToken(token, refreshToken?)` — now accepts optional refreshToken
- `signOut()` — clears tokens, basic auth, and cache

**Cache:**

- `getCached(resourceType, id)` — synchronous cache lookup
- `invalidateAll()` — clear entire cache

**Config 新增字段:**

- `cacheSize` (default: 1000)
- `cacheTime` (default: 60s browser / 0 Node)
- `maxRetries` (default: 2)
- `maxRetryTime` (default: 2000ms)
- `refreshGracePeriod` (default: 300000ms = 5min)
- `onUnauthenticated` callback

### 16.4 内部架构

```
request(method, url, options)
  → refreshIfExpired()          // 自动刷新过期 token
  → buildHeaders() + merge      // Bearer / Basic / content-type
  → fetchWithRetry(url, init)   // 429/5xx 指数退避
  → 401? → handleUnauthenticated()  // refresh + retry once
  → handleResponse()            // JSON parse + error mapping

cachedGet(url, options)
  → cache hit? → return cached  // LRU + TTL check
  → request("GET", ...)         // full pipeline
  → cache.set(url, result)      // store in LRU

write operations (create/update/patch/delete)
  → request(method, ...)
  → cacheResource(result)       // write-through for update/patch
  → invalidateSearches(type)    // invalidate search + history cache
```

### 16.5 测试结果

```
fhir-client tests: 63/63 passing (3 test files, 0 failures)
  - client-unit.test.ts:      38 tests (mock fetch, G3 features)
  - client-e2e.test.ts:       14 tests (real server via inject)
  - client-auth-e2e.test.ts:  11 tests (auth flows via inject)

tsc --noEmit: clean (fhir-client)
```

### 16.6 未实现 (建议/可延后)

| 能力                   | 优先级 | 说明                              |
| ---------------------- | ------ | --------------------------------- |
| Auto-Batch             | 建议   | 定时聚合 GET 请求，减少网络开销   |
| Rate Limit Header 解析 | 建议   | 读取 `ratelimit-*` headers        |
| ReadablePromise        | 建议   | React Suspense 支持               |
| WebSocket 订阅         | 建议   | SubscriptionManager               |
| GraphQL                | 建议   | FHIR GraphQL 端点                 |
| PKCE Login             | 建议   | `startPkce`, `signInWithRedirect` |
| Async Request (202)    | 建议   | `Prefer: respond-async` + polling |
| FHIRcast               | 可延后 | 临床工作流上下文                  |
| Binary/Attachment      | 建议   | 上传/下载 + 进度回调              |
