# Phase K: 术语服务

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-28
completed_at: 2026-02-28
scope: CodeSystem/ValueSet CRUD + $expand + $validate-code + $lookup operations
risk_level: LOW — Layer 2 only (fhir-server) — new routes using existing FHIR CRUD
layer_impact: Layer 2 (fhir-server) — new terminology routes + service layer
```

---

## 概述

Phase K 添加 FHIR 术语服务端点。CodeSystem 和 ValueSet 作为标准 FHIR 资源已通过 CRUD 路径持久化，
本阶段添加 FHIR 规范定义的术语操作端点：

- `$expand` — 展开 ValueSet 为扁平编码列表
- `$validate-code` — 校验给定编码是否属于某个 CodeSystem/ValueSet
- `$lookup` — 查询编码的详细信息（显示名、属性等）

## 子任务

| 子任务 | 内容                                                                                | 状态 |
| ------ | ----------------------------------------------------------------------------------- | ---- |
| K1     | 术语服务层 (`terminology-service.ts`) — expand, validateCode, lookup 逻辑           | ✅   |
| K2     | `POST /ValueSet/$expand` + `GET /ValueSet/:id/$expand` — 展开 ValueSet              | ✅   |
| K3     | `POST /CodeSystem/$validate-code` + `GET /CodeSystem/:id/$validate-code` — 编码校验 | ✅   |
| K4     | `POST /CodeSystem/$lookup` + `GET /CodeSystem/:id/$lookup` — 编码查询               | ✅   |
| K5     | 术语路由注册 + E2E 测试                                                             | ✅   |
| K6     | 回归测试                                                                            | ✅   |

## 实现细节

### 术语服务层

```
packages/fhir-server/src/terminology/
  terminology-service.ts   — 核心逻辑 (TerminologyService class)
  terminology-routes.ts    — HTTP 路由注册
```

### TerminologyService 方法

| 方法                                            | 说明                   |
| ----------------------------------------------- | ---------------------- |
| `expandById(id, filter?)`                       | 按 ID 展开 ValueSet    |
| `expandByUrl(url, filter?)`                     | 按 URL 展开 ValueSet   |
| `validateCodeById(id, code, system?)`           | 按 ID 校验编码         |
| `validateCodeByUrl(url, code)`                  | 按 URL 校验编码        |
| `validateCodeInValueSetById(id, code, system?)` | 在 ValueSet 中校验编码 |
| `lookupById(id, code)`                          | 按 ID 查询编码         |
| `lookupByUrl(system, code)`                     | 按 URL 查询编码        |

### 路由

| 方法 | 路径                             | 说明                                    |
| ---- | -------------------------------- | --------------------------------------- |
| POST | `/ValueSet/$expand`              | 通过 url 参数或 POST body 展开 ValueSet |
| GET  | `/ValueSet/:id/$expand`          | 按 ID 展开 ValueSet                     |
| POST | `/CodeSystem/$validate-code`     | 校验编码是否属于 CodeSystem             |
| GET  | `/CodeSystem/:id/$validate-code` | 按 ID 校验编码                          |
| POST | `/CodeSystem/$lookup`            | 查询编码详细信息                        |
| GET  | `/CodeSystem/:id/$lookup`        | 按 ID 查询编码                          |

### 响应格式

- `$expand` 返回 ValueSet 资源（含 expansion.contains）
- `$validate-code` 返回 Parameters 资源（result, display, message）
- `$lookup` 返回 Parameters 资源（name, display, property）

### 关键设计

- ValueSet 展开支持两种来源：预展开的 `expansion.contains` 和按需解析的 `compose.include`
- CodeSystem 概念支持层级结构（递归查找）
- 支持 `filter` 参数进行编码/显示名模糊过滤
- 参数可通过 POST body (Parameters 资源) 或 query string 传递

## 新增/修改文件

| 文件                                                 | 变更类型 | 说明                         |
| ---------------------------------------------------- | -------- | ---------------------------- |
| `fhir-server/src/terminology/terminology-service.ts` | 新增     | 术语服务核心逻辑             |
| `fhir-server/src/terminology/terminology-routes.ts`  | 新增     | 6 个术语端点路由             |
| `fhir-server/src/app.ts`                             | 修改     | 导入并注册 terminologyRoutes |
| `fhir-server/src/__tests__/terminology.test.ts`      | 新增     | 17 tests                     |

## 测试结果

| 测试集           | 通过数         | 说明                |
| ---------------- | -------------- | ------------------- |
| Phase K 新增测试 | 17/17          | terminology.test.ts |
| 全部 server 测试 | 138/138        | 7 test files        |
| **tsc --noEmit** | clean          | fhir-server         |
| **回归**         | **0 failures** | **0 regressions**   |
