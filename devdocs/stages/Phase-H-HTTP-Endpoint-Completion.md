# Phase H: 补齐服务端 HTTP 端点

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-27
completed_at: 2026-02-27
scope: Add missing HTTP routes that wire to existing persistence layer capabilities
risk_level: LOW — all persistence logic already implemented and tested
layer_impact: Layer 2 only (fhir-server) — additive routes, no breaking changes
```

---

## 概述

Phase H 补齐 fhir-server 中缺失的 HTTP 端点。所有底层 persistence 能力（Bundle处理、条件操作、$everything、$validate）已在 Stage-4 实现并测试。本阶段只需添加 HTTP 路由层。

## 子任务

| 子任务 | 内容                                                  | 依赖的 persistence 方法              | 状态 |
| ------ | ----------------------------------------------------- | ------------------------------------ | ---- |
| H1     | `POST /` — Bundle (transaction/batch)                 | `processTransaction`, `processBatch` | ✅   |
| H2     | `POST /:type/$validate` — Resource validation         | `ResourceValidator` (已有)           | ✅   |
| H3     | `GET /:type/:id/$everything` — Compartment export     | `repo.everything()`                  | ✅   |
| H4     | Conditional delete HTTP 支持 (`DELETE /:type?search`) | `conditionalDelete`                  | ✅   |
| H5     | `PATCH /:type/:id` — JSON Patch (RFC 6902)            | read + applyPatch + updateResource   | ✅   |

## 实现细节

### H1: Bundle HTTP 端点

**路由**: `POST /` (server root)
**Content-Type**: `application/fhir+json`

- 验证 `body.resourceType === 'Bundle'` 和 `body.type` 为 `transaction` 或 `batch`
- 调用 `processTransaction(repo, bundle)` 或 `processBatch(repo, bundle)`
- 返回对应的 `transaction-response` 或 `batch-response` Bundle
- 已导出 `processTransaction`/`processBatch` 到 `@medxai/fhir-persistence` 公开 API

### H2: $validate 端点

**路由**: `POST /:resourceType/$validate`

- 支持直接资源 body 和 `Parameters` wrapper
- 无 validator 配置时返回 informational OperationOutcome
- 有 validator 时返回 valid/invalid + issues

### H3: $everything 端点

**路由**: `GET /:resourceType/:id/$everything`

- 调用 `repo.everything(resourceType, id, PATIENT_COMPARTMENT_TYPES)`
- 返回 `searchset` Bundle，包含 focal resource + compartment resources
- 28 种 compartment resource types (AllergyIntolerance → ServiceRequest)

### H4: Conditional Delete

**路由**: `DELETE /:resourceType?search_params` (当 searchRegistry 可用时)

- 解析 query params → `SearchRequest`
- 调用 `repo.conditionalDelete(resourceType, searchRequest)`
- 返回删除数量 OperationOutcome

### H5: PATCH 端点

**路由**: `PATCH /:resourceType/:id`
**Content-Type**: `application/json-patch+json`

- 完整 RFC 6902 实现: `add`, `remove`, `replace`, `move`, `copy`, `test`
- JSON Pointer (RFC 6901) 路径解析，支持 `~0`/`~1` 转义
- 读取当前资源 → 应用 patch → 保持 resourceType/id → updateResource
- 支持 `If-Match` 乐观锁
- `test` 操作失败时返回 500 + OperationOutcome

## 新增/修改文件

| 文件                                                | 变更类型 | 说明                                                            |
| --------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `fhir-server/src/routes/fhir-operations-routes.ts`  | 新增     | 所有 Phase H 路由 + JSON Patch 实现                             |
| `fhir-server/src/app.ts`                            | 修改     | 注册 fhirOperationsRoutes + json-patch+json content-type parser |
| `fhir-persistence/src/repo/index.ts`                | 修改     | 导出 bundle-processor types/functions                           |
| `fhir-persistence/src/index.ts`                     | 修改     | 公开 API 导出 processTransaction/processBatch                   |
| `fhir-server/src/__tests__/fhir-operations.test.ts` | 新增     | 20 tests                                                        |

## 新增公开 API

**fhir-persistence 新增导出:**

- `processTransaction(repo, bundle)` — 事务处理
- `processBatch(repo, bundle)` — 批处理
- Types: `BundleEntry`, `PersistenceBundle`, `BundleResponseEntry`, `BundleResponse`

**fhir-server 新增导出:**

- `fhirOperationsRoutes` — Fastify route plugin
- `parseIfNoneExist(header)` — If-None-Exist header 解析工具

## 测试结果

| 测试集                | 通过数         | 说明                           |
| --------------------- | -------------- | ------------------------------ |
| Phase H 新增测试      | 20/20          | fhir-operations.test.ts        |
| 已有 CRUD 测试        | 26/26          | crud.test.ts                   |
| Parity 测试           | 55/55          | parity.test.ts                 |
| Auth/Audit/Validation | 86/86          | 6 test files                   |
| **tsc --noEmit**      | clean          | fhir-server + fhir-persistence |
| **回归**              | **0 failures** | **0 regressions**              |

## 关键设计决策

1. **Fastify `$` 路由**: `$validate` 和 `$everything` 路由不需要反斜杠转义，Fastify 直接支持 `$` 字面量
2. **JSON Patch 内置实现**: 不引入外部依赖 (如 fast-json-patch)，使用 `structuredClone` + 内部实现
3. **路由注册顺序**: `fhirOperationsRoutes` 在 `searchRoutes` 和 `resourceRoutes` 之前注册，确保 `$validate`/`$everything` 等操作路由优先匹配
4. **bundle-processor 升级为公开 API**: 从 internal module 提升为 `@medxai/fhir-persistence` 公开导出
