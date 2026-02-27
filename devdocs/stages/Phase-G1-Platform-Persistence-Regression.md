# Phase G1: 核心持久化回归测试 — Platform Resource CRUD 全面验证

**日期**: 2026-02-27
**状态**: ✅ 完成
**目标**: 对 7 种 MedXAI 平台资源类型进行完整的 CRUD + 搜索列 + History + 跨 Project 隔离 + 并发安全的回归测试

## 背景

MedXAI 定义了 7 种平台资源类型，这些类型是自定义的 StructureDefinition，不属于 FHIR R4 基础规范：

| 资源类型          | 搜索参数                                                                               | 特殊字段                                         |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Project           | name(string), owner(reference)                                                         | name, owner, description                         |
| User              | email(string), first-name(string), last-name(string), project(reference)               | email, firstName, lastName, passwordHash         |
| ProjectMembership | project(ref), user(ref), profile-reference(ref), access-policy(ref), user-name(string) | project, user, profile, accessPolicy, userName   |
| Login             | user(ref), client(ref), project(ref), auth-method(token), code(string)                 | user, client, project, authMethod, code, granted |
| ClientApplication | name(string), status(token), redirect-uri(uri)                                         | name, status, redirectUri, secret                |
| AccessPolicy      | name(string)                                                                           | name, resource                                   |
| JsonWebKey        | active(token)                                                                          | active, publicKey, privateKey                    |

## 测试矩阵

### G1.1: Platform Resource CRUD (7 types × 4 ops = 28 tests)

对每种平台资源类型验证: Create → Read → Update → Delete

### G1.2: Search Column Physical Value Verification (12 tests)

验证写入后搜索列的物理数据库值:

- string 列 (name, email) → TEXT 值正确
- reference 列 (owner, user, project) → TEXT 格式 `Type/id`
- token 列 (status, auth-method, active) → UUID[] hash 值 + TEXT[] text + TEXT sort
- uri 列 (redirect-uri) → TEXT 值正确

### G1.3: Reference Fields & Compartments (6 tests)

- 单目标 TEXT 引用: Project.owner, Login.user
- 多目标 TEXT 引用 (虽然平台资源无 TEXT[])
- compartments UUID[] 写入和查询
- \_References 表行正确填充

### G1.4: History Integrity (6 tests)

- Create → 1 history entry
- Create → Update → 2 history entries, 正确排序
- Create → Update → Delete → 3 entries, delete marker 为空 content
- versionId 唯一性 (PK)
- readHistory API 返回正确结果
- readVersion (vread) 正确

### G1.5: Cross-Project Isolation (6 tests)

- Project A 创建资源 → Project B 读取 → ResourceNotFoundError
- Project A 创建资源 → Project A 读取 → 成功
- superAdmin 跨 Project 读取 → 成功
- Project A 更新 → Project B 更新同一资源 → ResourceNotFoundError
- Project A 删除 → Project B 删除同一资源 → ResourceNotFoundError
- searchResources 自动注入 project 过滤

### G1.6: Concurrent Safety (4 tests)

- 平台资源并发 ifMatch 更新: 一个成功一个冲突
- 平台资源并发 delete + update: 一个成功一个失败
- 平台资源并发无 ifMatch: last-write-wins
- FOR UPDATE 锁在 Login 资源上的行为

## 测试文件

```
packages/fhir-persistence/src/__tests__/integration/platform-persistence-regression.test.ts
```

## 预期测试数量

| 分组                           | 预期数量 |
| ------------------------------ | -------- |
| G1.1 Platform CRUD             | 28       |
| G1.2 Search Columns            | 12       |
| G1.3 References & Compartments | 6        |
| G1.4 History                   | 6        |
| G1.5 Project Isolation         | 6        |
| G1.6 Concurrent Safety         | 4        |
| **合计**                       | **62**   |

## 依赖

- PostgreSQL localhost:5433/medxai_dev
- SearchParameterRegistry + 平台搜索参数 (search-parameters-medxai.json)
- FhirRepository with registry enabled

## 结果

| 分组                           | 状态   | 通过/总数 | 备注                                           |
| ------------------------------ | ------ | --------- | ---------------------------------------------- |
| G1.1 Platform CRUD             | ✅     | 28/28     | 7 types × 4 ops                                |
| G1.2 Search Columns            | ✅     | 12/12     | string, reference, token, uri 列全部正确       |
| G1.3 References & Compartments | ✅     | 6/6       | \_References 表、compartments、projectId 正确  |
| G1.4 History                   | ✅     | 6/6       | vread、readHistory、PK 唯一性全部通过          |
| G1.5 Project Isolation         | ✅     | 6/6       | 跨 Project 隔离、superAdmin 绕过、搜索自动注入 |
| G1.6 Concurrent Safety         | ✅     | 4/4       | FOR UPDATE、ifMatch 冲突、last-write-wins      |
| **合计**                       | **✅** | **62/62** | **0 failures, 0 regressions**                  |

### 全套回归验证

- **fhir-persistence 全套**: 961/961 passing, 37 test files, 0 regressions
- **tsc --noEmit**: clean
- **Duration**: ~2s (G1 only), ~7.4s (full suite)

### 测试文件

```
packages/fhir-persistence/src/__tests__/integration/platform-persistence-regression.test.ts
```

### 修复记录

1. `searchResources` 测试中 `SearchRequest` 字段名从 `filters` 修正为 `params` — 非 bug，仅测试代码笔误
