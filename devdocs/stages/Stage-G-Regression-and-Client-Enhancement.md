# Stage G: 回归测试 + Client Gap 分析与实现

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-27
completed_at: 2026-02-27
scope: Platform persistence regression, MedplumClient gap analysis, Client SDK enhancement
prerequisite: Phase D/E/F complete (S1-Phase-DEF), 3616+ tests passing
entry_test_count: 3616 tests (88 files)
exit_test_count: 3616+ persistence/server + 63 fhir-client (3 test files)
```

---

## 概述

Stage G 是在 S1 Phase A-F 全部完成后的**稳定化与客户端增强阶段**。目标：

1. **G1** — 对 7 种平台资源做全面回归测试，确保 S1 引入的平台资源 + 多租户机制没有破坏已有功能
2. **G2** — 逆向分析 Medplum MedplumClient 核心能力，形成 Gap 文档
3. **G3** — 实现 MedXAIClient 的 "必须" 级缺失功能 (patchResource, searchOne, searchResources, executeBatch, auto-retry, cache, token management 等)

**设计原则**: 不修改后端持久化/服务层，仅在客户端 SDK (`fhir-client`) 包内增加功能。后端保持冻结。

---

## Phase G1: 核心持久化回归测试

**状态**: ✅ 完成 (2026-02-27)
**测试结果**: 62/62 passing, 0 failures
**全套 fhir-persistence**: 961/961 passing, 37 test files, 0 regressions
**tsc**: clean

### 目标

对 MedXAI 的 7 种平台资源类型 (Project, User, ProjectMembership, Login, ClientApplication, AccessPolicy, JsonWebKey) 进行完整的 CRUD + 搜索列 + History + 跨 Project 隔离 + 并发安全 回归测试。

### 测试矩阵

| 分组 | 测试数 | 内容 |
|------|--------|------|
| G1.1 Platform CRUD | 28 | 7 types × 4 ops (create/read/update/delete) |
| G1.2 Search Column Physical Values | 12 | string, reference, token, uri 列物理值验证 |
| G1.3 Reference Fields & Compartments | 6 | _References 表、compartments、projectId |
| G1.4 History Integrity | 6 | vread、readHistory、PK 唯一性 |
| G1.5 Cross-Project Isolation | 6 | 跨 Project 隔离、superAdmin 绕过、搜索自动注入 |
| G1.6 Concurrent Safety | 4 | FOR UPDATE、ifMatch 冲突、last-write-wins |
| **合计** | **62** | **0 failures, 0 regressions** |

### 测试文件

```
packages/fhir-persistence/src/__tests__/integration/platform-persistence-regression.test.ts
```

### 详细文档

→ [Phase-G1-Platform-Persistence-Regression.md](./Phase-G1-Platform-Persistence-Regression.md)

---

## Phase G2: MedplumClient 核心能力分析

**状态**: ✅ 完成 (2026-02-27)

### 目标

对 Medplum `@medplum/core` 包中的 `MedplumClient` 进行全面逆向分析，识别 MedXAI `MedXAIClient` 需要补齐的功能差距。

### 分析范围

| 维度 | MedplumClient 能力 | MedXAIClient 现状 |
|------|--------------------|--------------------|
| **HTTP 层** | fetch 封装、auto-retry (429/5xx)、token auto-refresh、rate limit 感知 | 基础 fetch，无 retry/refresh |
| **FHIR CRUD** | create/read/update/patch/delete + conditional ops + upsert | create/read/update/delete (基础) |
| **Search** | search/searchOne/searchResources/searchResourcePages + cache | search/searchPost (基础) |
| **Batch/Transaction** | executeBatch + auto-batch (GUI 优化) | 无 |
| **Cache** | LRU 1000 条 + TTL + 搜索缓存 + write-through invalidation | 无 |
| **Auth** | OAuth2 (password, PKCE, client_credentials, external IdP) + token lifecycle | password login + token exchange (基础) |
| **WebSocket** | subscribeToCriteria + ReconnectingWebSocket | 无 |
| **GraphQL** | graphql() + graphqlBatch() | 无 |
| **Operations** | $validate, $expand, $everything, $graph, $export | 无 |
| **Binary/Media** | createBinary/createAttachment + 进度回调 | 无 |

### 优先级分类

| 优先级 | 数量 | 说明 |
|--------|------|------|
| **必须** | 16 项 | 生产环境不可缺的核心功能 |
| **建议** | 12 项 | 提升开发体验和性能的功能 |
| **可延后** | 8 项 | 高级功能，可在后续阶段实现 |

### 分析文档

→ [WF-CUS-006_medplum-client.md](../medplum-reverse-engineering/03_WORKFLOW_ANALYSIS/WF-CUS-006_medplum-client.md)

---

## Phase G3: MedXAIClient Gap 实现

**状态**: ✅ 完成 (2026-02-27)
**测试结果**: 63/63 passing (38 unit + 14 E2E + 11 auth E2E), 0 failures
**tsc**: clean (fhir-client)

### 实现清单

| 子任务 | 内容 | 状态 |
|--------|------|------|
| G3.1 | `patchResource` (JSON Patch RFC 6902) + `searchOne` + `searchResources` | ✅ |
| G3.2 | `executeBatch` (batch/transaction Bundle) | ✅ |
| G3.3 | Auto-retry (429/5xx 指数退避, `maxRetries=2`, `500 * 1.5^attempt`) | ✅ |
| G3.4 | Token auto-refresh (`refreshIfExpired`, grace period 5min) + 401 retry | ✅ |
| G3.5 | LRU cache (1000 条) + search cache + write-through invalidation | ✅ |
| G3.6 | `startClientLogin` (client_credentials) + `setBasicAuth` | ✅ |
| G3.7 | `readReference`, `createResourceIfNoneExist`, `upsertResource`, `searchResourcePages` | ✅ |
| G3.8 | `validateResource` ($validate) + `readPatientEverything` ($everything) | ✅ |
| G3.9 | 38 unit tests + 文档更新 | ✅ |

### 新增/修改文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `fhir-client/src/types.ts` | 修改 | `PatchOperation`, `RequestOptions`, `ResourceArray`, 扩展 `MedXAIClientConfig` + `Bundle` |
| `fhir-client/src/client.ts` | 修改 | 新增 20+ 方法, LRU cache, retry pipeline, token management |
| `fhir-client/src/index.ts` | 修改 | 导出新类型 |
| `fhir-client/src/__tests__/client-unit.test.ts` | 新增 | 38 unit tests (mock fetch) |

### 新增公开 API

**CRUD 增强:**
- `patchResource(resourceType, id, operations)` — JSON Patch (RFC 6902)
- `createResourceIfNoneExist(resource, query)` — `If-None-Exist` conditional create
- `upsertResource(resource, query)` — conditional update/create
- `readReference(reference)` — read by reference string
- `validateResource(resource)` — `$validate` operation

**Search 增强:**
- `searchOne(resourceType, params)` — first match or undefined
- `searchResources(resourceType, params)` — `ResourceArray<T>` with `.bundle`
- `searchResourcePages(resourceType, params)` — `AsyncGenerator` pagination

**Batch/Transaction:**
- `executeBatch(bundle)` — batch or transaction Bundle

**Operations:**
- `readPatientEverything(id)` — Patient `$everything`

**Auth 增强:**
- `startClientLogin(clientId, clientSecret)` — client_credentials grant
- `setBasicAuth(clientId, clientSecret)` — Basic auth header
- `setAccessToken(token, refreshToken?)` — optional refreshToken
- `signOut()` — clears tokens, basic auth, and cache

**Cache:**
- `getCached(resourceType, id)` — synchronous cache lookup
- `invalidateAll()` — clear entire cache

**Config 新增字段:**
- `cacheSize` (default: 1000), `cacheTime` (default: 60s browser / 0 Node)
- `maxRetries` (default: 2), `maxRetryTime` (default: 2000ms)
- `refreshGracePeriod` (default: 300000ms = 5min)
- `onUnauthenticated` callback

### 内部架构

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

### 未实现 (建议/可延后)

| 能力 | 优先级 | 说明 |
|------|--------|------|
| Auto-Batch | 建议 | 定时聚合 GET 请求 |
| ReadablePromise | 建议 | React Suspense 支持 |
| WebSocket 订阅 | 建议 | SubscriptionManager |
| GraphQL | 建议 | FHIR GraphQL 端点 |
| PKCE Login | 建议 | `startPkce`, `signInWithRedirect` |
| Binary/Attachment | 建议 | 上传/下载 + 进度回调 |
| FHIRcast | 可延后 | 临床工作流上下文 |

---

## 测试总结

| 测试集 | 通过数 | 文件数 | 备注 |
|--------|--------|--------|------|
| G1 Platform Regression | 62/62 | 1 | real PostgreSQL |
| G3 Client Unit Tests | 38/38 | 1 | mock fetch |
| Client E2E (existing) | 14/14 | 1 | Fastify inject |
| Client Auth E2E (existing) | 11/11 | 1 | Fastify inject |
| **fhir-client 合计** | **63/63** | **3** | 0 failures |
| **fhir-persistence 全套** | **961/961** | **37** | 0 regressions |
| **tsc --noEmit** | clean | — | fhir-client |

---

## 关键设计决策

1. **不修改后端** — G3 所有变更限于 `fhir-client` 包，后端持久化/服务层保持冻结
2. **LRU 实现内置** — 不引入外部依赖，使用 Map 插入顺序实现简单 LRU
3. **Bundle entry.resource 改为可选** — 为支持 batch response (无 resource 的 entry)，将 `Bundle.entry[].resource` 类型改为 `T | undefined`
4. **Retry 策略与 Medplum 一致** — 429/5xx 指数退避，最多 2 次重试，最大等待 2000ms
5. **Token 刷新策略** — 过期前 5 分钟自动刷新，401 时尝试 refresh + retry once，失败调用 `onUnauthenticated` 回调

---

## 后续阶段参考

Stage G 完成后，下一步可能方向：

| 方向 | 说明 | 依赖 |
|------|------|------|
| **H: Platform Admin** | 管理端点 (用户管理、项目管理、AccessPolicy CRUD) | G 完成 |
| **S2-S6: 中文本地化** | i18n、拼音搜索、CN-Profile、术语服务 | 延后 |
| **WebSocket 订阅** | 实时通知 | 后端需要新增 Subscription 路由 |
| **前端 UI** | React Admin 界面 | H + Client SDK 完成 |
