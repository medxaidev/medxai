# Lookup Table 重构：从 Per-Resource 改为 Medplum 全局共享设计

**Date**: 2026-02-25
**Status**: ✅ Completed
**Impact**: Schema Generation / Row Indexing / Search Query / DDL Generation

---

## 1. 问题描述

MedXAI 当前为每个拥有 `name`/`address`/`telecom` 搜索参数的资源生成独立的 lookup 子表（如 `Patient_Name`, `Organization_Name` 共 ~35 个表），且列设计为通用的 `(resourceId, index, value, system)`。

Medplum 的经生产验证的设计是使用**全局共享 lookup table**，只有 4 个表，列结构正确反映 FHIR 复杂类型的字段。

### 当前 MedXAI 设计（错误）

```sql
-- 35+ 个结构完全相同的表
CREATE TABLE "Patient_Name" (
  "resourceId" UUID NOT NULL,
  "index" INTEGER NOT NULL,
  "value" TEXT NOT NULL,       -- ← family/given 混在一起
  "system" TEXT,
  CONSTRAINT "Patient_Name_pk" PRIMARY KEY ("resourceId", "index")
);
CREATE TABLE "Organization_Name" (...同上...);
CREATE TABLE "Practitioner_Name" (...同上...);
```

### Medplum 设计（正确）

```sql
-- 4 个全局共享表
CREATE TABLE "HumanName" (
  "resourceId" UUID NOT NULL,
  name TEXT,      -- 完整名字字符串
  given TEXT,     -- given name(s)
  family TEXT     -- family name
);

CREATE TABLE "Address" (
  "resourceId" UUID NOT NULL,
  address TEXT,       -- 完整地址字符串
  city TEXT,
  country TEXT,
  "postalCode" TEXT,
  state TEXT,
  use TEXT
);

CREATE TABLE "ContactPoint" (
  "resourceId" UUID NOT NULL,
  system TEXT,    -- phone/email/etc
  value TEXT,     -- 号码/邮箱
  use TEXT        -- home/work/etc
);

CREATE TABLE "Identifier" (
  "resourceId" UUID NOT NULL,
  system TEXT,    -- identifier system URI
  value TEXT      -- identifier value
);
```

---

## 2. 问题分析

| 问题               | 说明                                                                |
| ------------------ | ------------------------------------------------------------------- |
| **语义损失**       | `value TEXT` 无法区分 family/given，搜索 `name:family=Zhang` 不可能 |
| **表数量爆炸**     | 35 个结构完全相同的表，违反 DRY                                     |
| **无法跨类型查询** | "所有叫张三的人" 需要 UNION 多表                                    |
| **索引效率低**     | Medplum 每表 3 层索引(btree+tsvector+trgm)，我们只有 btree(value)   |
| **冗余存储**       | 主表 `__nameSort` + 子表 `Patient_Name.value` 双重存储              |

---

## 3. 修复方案

### 3.1 全局 Lookup Table 定义

创建 4 个全局表 + Medplum 风格的索引：

| 表             | 列                                                         | 索引                                                                                               |
| -------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `HumanName`    | resourceId, name, given, family                            | btree(name), btree(given), btree(family), btree(resourceId), trgm(name), trgm(given), trgm(family) |
| `Address`      | resourceId, address, city, country, postalCode, state, use | btree(address), btree(city), btree(resourceId), trgm(address)                                      |
| `ContactPoint` | resourceId, system, value, use                             | btree(value), btree(resourceId)                                                                    |
| `Identifier`   | resourceId, system, value                                  | btree(value), btree(resourceId)                                                                    |

### 3.2 受影响的文件

| 文件                                    | 改动                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| `schema/table-schema.ts`                | 新增 `GlobalLookupTableSchema` 接口，`SchemaDefinition` 增加 `globalLookupTables` 字段 |
| `schema/table-schema-builder.ts`        | `buildLookupTables()` 删除 per-resource 逻辑，新增 `buildGlobalLookupTables()`         |
| `schema/ddl-generator.ts`               | 新增 `generateCreateGlobalLookupTable()` + 在全量 DDL 开头生成全局表                   |
| `repo/row-indexer.ts`                   | `populateLookupTableStrategy()` 改为返回全局表行数据                                   |
| `repo/fhir-repo.ts`                     | `createResource`/`updateResource` 中写入/更新全局 lookup 表行                          |
| `search/where-builder.ts`               | `buildLookupTableFragment()` 改为 JOIN 全局表                                          |
| `scripts/init-db.ts`                    | 确保全局表在资源表之前创建                                                             |
| `registry/search-parameter-registry.ts` | 新增 `lookupTableName` 属性映射                                                        |

### 3.3 保留的设计

- 主表 `__nameSort TEXT` 排序列**保留** — 用于 ORDER BY，避免 JOIN
- `lookup-table` strategy 概念**保留** — 只改底层实现
- 现有测试中使用 `__nameSort` 的行为**保持不变**

---

## 4. 执行步骤

- [x] Step 1: 更新 `table-schema.ts` — 添加 `GlobalLookupTableSchema` + `LookupTableType`
- [x] Step 2: 重构 `table-schema-builder.ts` — 删除 per-resource lookup，添加 `buildGlobalLookupTables()`
- [x] Step 3: 更新 `ddl-generator.ts` — 添加 `generateCreateGlobalLookupTable()` + `pg_trgm`/`btree_gin` 扩展
- [x] Step 4: 更新 `row-indexer.ts` — 添加 `buildLookupTableRows()` 提取 HumanName/Address/ContactPoint 行
- [x] Step 5: 更新 `fhir-repo.ts` — `writeLookupRows()`/`deleteLookupRows()` 集成到 CRUD
- [x] Step 6: 更新 `where-builder.ts` — EXISTS subquery 搜索全局 lookup 表
- [x] Step 7: 更新测试 (where-builder, phase19-schema, ddl-generator snapshot, fhir-repo.unit, ddl-validation)
- [x] Step 8: DB reset — 0 errors, 4711 DDL statements
- [x] Step 9: 全量验证 — tsc clean, 3368/3368 tests passing

---

## 5. 测试验证

- ✅ 所有 3368/3368 测试通过（0 failures）
- ✅ tsc --noEmit clean（both packages）
- ✅ DDL snapshot 已更新
- ✅ DB reset 0 errors, 4711 DDL statements

---

## 6. 变更文件清单

### 实现文件（6 个）

| 文件                             | 改动                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `schema/table-schema.ts`         | 新增 `GlobalLookupTableSchema`, `LookupTableType`; `SchemaDefinition` 增加 `globalLookupTables` 字段 |
| `schema/table-schema-builder.ts` | 删除 `buildLookupTables()`; 新增 `buildGlobalLookupTables()` 生成 4 个 Medplum 风格共享表            |
| `schema/ddl-generator.ts`        | 新增 `generateCreateGlobalLookupTable()`; DDL 顺序改为扩展→全局表→资源表→索引                        |
| `repo/row-indexer.ts`            | 新增 `LookupTableRow`, `buildLookupTableRows()` 提取 HumanName/Address/ContactPoint 行               |
| `repo/fhir-repo.ts`              | 新增 `writeLookupRows()`/`deleteLookupRows()`; create/update/delete 三处集成                         |
| `search/where-builder.ts`        | `buildLookupTableFragment()` 改为 EXISTS subquery 搜索全局 lookup 表                                 |

### 测试文件（5 个）

| 文件                                          | 改动                                         |
| --------------------------------------------- | -------------------------------------------- |
| `__tests__/search/where-builder.test.ts`      | 8 个测试更新 → EXISTS subquery 期望          |
| `__tests__/schema/phase19-schema.test.ts`     | 2 个测试重写 → 全局 lookup 表 schema 验证    |
| `__tests__/schema/ddl-generator.test.ts`      | DDL 验证正则更新 + snapshot 更新             |
| `__tests__/schema/phase22-validation.test.ts` | DDL 验证增加 CREATE EXTENSION 支持           |
| `__tests__/repo/fhir-repo.unit.test.ts`       | A-12 delete 调用次数 4→8（+4 lookup delete） |

## 7. 变更记录

| 时间       | 步骤          | 状态 |
| ---------- | ------------- | ---- |
| 2026-02-25 | 全部 9 步完成 | ✅   |
