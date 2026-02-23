# TEST-PLAN-001: Medplum 模拟测试清单

```yaml
plan_id: TEST-PLAN-001
title: "FhirRepository — Medplum 模拟测试全覆盖"
phase: Phase-9 / Phase-10
reference: WF-E2E-001, Phase-9-Detailed-Plan.md, Phase-10-Detailed-Plan.md
created: 2026-02-23
status: In Progress
```

---

## 背景

Medplum 的 `repo.test.ts`（1893行）、`transaction.test.ts`（600+行）覆盖了完整的
Repository CRUD 行为。本计划基于对 Medplum 源码的逆向分析（WF-E2E-001），
为 medxai `FhirRepository` 制定等效的测试清单，并标注每个测试的**优先级**和**当前状态**。

---

## 现有测试覆盖（已完成）

### `src/__tests__/repo/` — 单元测试（mock-free，纯逻辑）

| 文件                          | 测试数 | 覆盖内容                                            |
| ----------------------------- | ------ | --------------------------------------------------- |
| `errors.test.ts`              | ~8     | 错误类型、继承、属性                                |
| `sql-builder.test.ts`         | ~15    | UPSERT/INSERT/SELECT SQL 生成                       |
| `history-sql-builder.test.ts` | ~12    | History SQL + \_since/\_count/cursor                |
| `row-builder.test.ts`         | ~12    | buildResourceRow / buildDeleteRow / buildHistoryRow |
| `history-bundle.test.ts`      | ~18    | buildHistoryBundle 构造                             |

### `src/__tests__/integration/` — 集成测试（真实 PostgreSQL）

| 文件                          | 测试数 | 覆盖内容                             |
| ----------------------------- | ------ | ------------------------------------ |
| `repo-integration.test.ts`    | ~25    | CRUD + 乐观锁 + History + 全生命周期 |
| `history-integration.test.ts` | ~20    | History 过滤/分页/类型级/删除标记    |
| `end-to-end.test.ts`          | ~30    | Schema 生成 Pipeline                 |

**当前总计：~140 个测试**

---

## 缺失测试（待创建）

### 分类 A：FhirRepository 单元测试（Mock DB）

**文件：** `src/__tests__/repo/fhir-repo.unit.test.ts`

对应 Medplum：`repo.test.ts` 中不依赖真实 DB 的测试

| #    | 测试名称                                                             | 优先级    | 对应 Medplum                |
| ---- | -------------------------------------------------------------------- | --------- | --------------------------- |
| A-01 | `createResource` — 返回值包含 id、versionId、lastUpdated             | 🔴 High   | repo.test.ts 基础 create    |
| A-02 | `createResource` — id 格式为 UUID v4                                 | 🔴 High   | repo.test.ts UUID 格式      |
| A-03 | `createResource` — versionId 格式为 UUID v4                          | 🔴 High   | —                           |
| A-04 | `createResource` — lastUpdated 为 ISO 8601 字符串                    | 🔴 High   | —                           |
| A-05 | `createResource` — assignedId 被正确使用                             | 🔴 High   | repo.test.ts assignedId     |
| A-06 | `createResource` — 调用 DB UPSERT + History INSERT（各一次）         | 🔴 High   | —                           |
| A-07 | `createResource` — 两次 DB 调用在同一事务中                          | 🔴 High   | transaction.test.ts         |
| A-08 | `readResource` — DB 抛出错误时向上传播                               | 🟡 Medium | repo.test.ts error handling |
| A-09 | `updateResource` — 无 id 时抛出 Error                                | 🔴 High   | repo.test.ts                |
| A-10 | `updateResource` — ifMatch 匹配时成功                                | 🔴 High   | transaction.test.ts         |
| A-11 | `updateResource` — ifMatch 不匹配时抛出 ResourceVersionConflictError | 🔴 High   | transaction.test.ts         |
| A-12 | `deleteResource` — 调用 UPSERT（deleted=true）+ History INSERT       | 🔴 High   | repo.test.ts                |
| A-13 | `deleteResource` — delete row 的 content 为空字符串                  | 🔴 High   | WF-E2E-001 soft delete      |
| A-14 | `deleteResource` — delete row 的 \_\_version 为 -1                   | 🔴 High   | WF-E2E-001                  |
| A-15 | `readVersion` — content 为空字符串时抛出 ResourceGoneError           | 🟡 Medium | repo.test.ts                |

**实现方式：** 使用 vitest `vi.fn()` mock `DatabaseClient`，不需要真实 PostgreSQL。

---

### 分类 B：并发写入测试（Integration）

**文件：** `src/__tests__/integration/concurrent.integration.test.ts`

对应 Medplum：`transaction.test.ts` — 并发场景

| #    | 测试名称                                                                      | 优先级    | 对应 Medplum                                 |
| ---- | ----------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| B-01 | 同一资源的 5 个并发 update — 全部成功，无丢失更新                             | 🔴 High   | `Conflicting concurrent writes`              |
| B-02 | 同一资源的并发 update — 最终 history 条目数等于写入次数                       | 🔴 High   | —                                            |
| B-03 | 并发 create 不同资源 — 全部成功，id 唯一                                      | 🔴 High   | —                                            |
| B-04 | 并发 create 相同 assignedId — 只有一个成功                                    | 🟡 Medium | `Conflicting concurrent conditional creates` |
| B-05 | 并发 ifMatch update — 只有版本匹配的成功，其余抛 ResourceVersionConflictError | 🔴 High   | `Conflicting concurrent writes`              |
| B-06 | 并发 delete — 只有第一个成功，后续抛 ResourceGoneError                        | 🟡 Medium | —                                            |
| B-07 | 10 个并发 create 不同 Patient — 全部写入 DB，无竞争条件                       | 🟡 Medium | —                                            |

---

### 分类 C：事务处理测试（Integration）

**文件：** `src/__tests__/integration/transaction.integration.test.ts`

对应 Medplum：`transaction.test.ts` — 事务语义

| #    | 测试名称                                        | 优先级    | 对应 Medplum                               |
| ---- | ----------------------------------------------- | --------- | ------------------------------------------ |
| C-01 | 事务提交 — 主表和 History 表同时可见            | 🔴 High   | `Transaction commit`                       |
| C-02 | 事务回滚 — 主表和 History 表均无数据            | 🔴 High   | `Transaction rollback`                     |
| C-03 | 事务中途抛出错误 — 整个事务回滚                 | 🔴 High   | `Transaction rollback`                     |
| C-04 | 嵌套事务提交 — 两个资源均可见                   | 🟡 Medium | `Nested transaction commit`                |
| C-05 | 嵌套事务内层回滚 — 外层资源可见，内层资源不可见 | 🟡 Medium | `Nested transaction rollback`              |
| C-06 | 主表写入成功但 History 写入失败 — 整个事务回滚  | 🔴 High   | —                                          |
| C-07 | `withTransaction` 在序列化冲突时自动重试        | 🟡 Medium | `Retry on conflict`                        |
| C-08 | `withTransaction` 重试后成功 — 最终结果正确     | 🟡 Medium | `Retry on conflict`                        |
| C-09 | 非序列化错误不触发重试                          | 🟡 Medium | `Only retry specific transaction conflict` |

---

### 分类 D：大资源处理测试（Integration）

**文件：** `src/__tests__/integration/large-resource.integration.test.ts`

对应 Medplum：无直接对应，但 Medplum 有 `truncateTextColumn` 等保护机制

| #    | 测试名称                                                | 优先级    | 对应 Medplum |
| ---- | ------------------------------------------------------- | --------- | ------------ |
| D-01 | 1MB JSON 资源 — create 成功，content 完整保存           | 🟡 Medium | —            |
| D-02 | 大资源 update — 新版本 content 完整，history 保留旧版本 | 🟡 Medium | —            |
| D-03 | 100 个字段的 Patient — 所有字段在 read 后完整还原       | 🟡 Medium | —            |
| D-04 | 深度嵌套 JSON（10层）— 序列化/反序列化无损              | 🟡 Medium | —            |
| D-05 | 包含 Unicode 字符的资源 — 存储和读取正确                | 🟡 Medium | —            |
| D-06 | 包含特殊字符（引号、反斜杠）的资源 — SQL 注入安全       | 🔴 High   | —            |

---

### 分类 E：版本冲突处理测试（Integration）

**文件：** 追加到 `repo-integration.test.ts` 或独立文件

对应 Medplum：`transaction.test.ts` — If-Match 场景

| #    | 测试名称                                                                  | 优先级    | 对应 Medplum        |
| ---- | ------------------------------------------------------------------------- | --------- | ------------------- |
| E-01 | 连续 3 次 update（无 ifMatch）— 每次 versionId 不同                       | 🔴 High   | —                   |
| E-02 | update 使用过期 versionId（已被更新）— 抛 ResourceVersionConflictError    | 🔴 High   | transaction.test.ts |
| E-03 | update 使用正确 versionId — 成功，history 增加一条                        | 🔴 High   | —                   |
| E-04 | delete 后 update — 抛 ResourceGoneError                                   | 🔴 High   | —                   |
| E-05 | 读取 history 后 update 使用旧 versionId — 抛 ResourceVersionConflictError | 🟡 Medium | —                   |

---

## 测试文件清单（待创建）

```
src/__tests__/
  repo/
    fhir-repo.unit.test.ts          ← 分类 A（15 个测试，mock DB）
  integration/
    concurrent.integration.test.ts  ← 分类 B（7 个测试，真实 DB）
    transaction.integration.test.ts ← 分类 C（9 个测试，真实 DB）
    large-resource.integration.test.ts ← 分类 D（6 个测试，真实 DB）
```

分类 E 的测试追加到现有 `repo-integration.test.ts`。

---

## 测试数量汇总

| 分类                       | 文件                                 | 测试数   | 状态      |
| -------------------------- | ------------------------------------ | -------- | --------- |
| 现有单元测试               | `repo/*.test.ts`                     | ~65      | ✅ 已完成 |
| 现有集成测试               | `integration/*.test.ts`              | ~75      | ✅ 已完成 |
| **A: FhirRepository 单元** | `fhir-repo.unit.test.ts`             | 22       | ✅ 已创建 |
| **B: 并发写入**            | `concurrent.integration.test.ts`     | 12       | ✅ 已创建 |
| **C: 事务处理**            | `transaction.integration.test.ts`    | 11       | ✅ 已创建 |
| **D: 大资源**              | `large-resource.integration.test.ts` | 11       | ✅ 已创建 |
| **E: 版本冲突**            | 追加到 `repo-integration.test.ts`    | 5        | ✅ 已追加 |
| **合计**                   |                                      | **~196** | —         |

**目标：** Phase 9 验收标准要求 50+ 测试，当前已超出；新增测试将覆盖 Medplum 中
`transaction.test.ts` 的核心场景，达到生产级可信度。

---

## 优先级执行顺序

```
1. fhir-repo.unit.test.ts        (A类，mock DB，无外部依赖，快速验证)
2. transaction.integration.test.ts (C类，事务语义，核心 ACID 保证)
3. concurrent.integration.test.ts  (B类，并发，最复杂)
4. large-resource.integration.test.ts (D类，边界情况)
5. 分类 E 追加到 repo-integration.test.ts
```

---

## 参考资料

- Medplum `transaction.test.ts` — 事务/并发测试模式
- Medplum `repo.test.ts` — CRUD 基础测试模式
- `WF-E2E-001` — 写路径端到端分析（事务边界、soft delete 语义）
- `Phase-9-Detailed-Plan.md` — 验收标准
