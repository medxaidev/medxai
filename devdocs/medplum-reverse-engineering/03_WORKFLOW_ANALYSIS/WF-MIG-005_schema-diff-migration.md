# Workflow Analysis: Schema Diff & Migration Generation

```yaml
workflow_id: WF-MIG-005
workflow_name: Schema Diff & Migration Generation Algorithm
entry_point: "generateMigrationActions(options)"
exit_point: "PhasalMigration { preDeploy: MigrationAction[], postDeploy: MigrationAction[] }"
phase: Phase-Server (Database Schema Management)
parent_workflow: WF-MIG-001
source_file: packages/server/src/migrations/migrate.ts
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心问题

给定两个 schema 定义（`startDefinition` = 当前数据库，`targetDefinition` = 从 FHIR 规范推导），计算将数据库从 start 迁移到 target 所需的最小操作集，并将操作分为 preDeploy 和 postDeploy 两个阶段。

---

## 2. 算法概述

```
generateMigrationActions(options)
  │
  ├─ buildStartDefinition(options)
  │    → SchemaDefinition { tables[], functions[] }
  │    （从 PostgreSQL information_schema + pg_indexes + pg_constraint 读取）
  │
  ├─ buildTargetDefinition()
  │    → SchemaDefinition { tables[], functions[] }
  │    （从 FHIR 规范推导，见 WF-MIG-002/003/004）
  │
  ├─ Functions Diff
  │    for each targetFunction:
  │      if not in startDefinition → preDeploy: CREATE_FUNCTION
  │
  ├─ Tables Diff
  │    for each targetTable:
  │      if startTable exists → diff columns + indexes + constraints
  │      if startTable not exists → preDeploy: CREATE_TABLE
  │
  │    for each startTable:
  │      if not in targetDefinition → postDeploy: DROP_TABLE
  │
  └─ [optional] ANALYZE_TABLE for all resource types
```

---

## 3. 从 PostgreSQL 读取当前 Schema

### 3.1 获取表名

```sql
SELECT * FROM information_schema.tables WHERE table_schema='public'
```

### 3.2 获取列定义

```ts
// migrate-utils.ts → getColumns()
// 从 information_schema.columns 读取列名、类型、默认值、NOT NULL 等
```

### 3.3 获取索引定义

```sql
SELECT indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1
```

→ 解析 `indexdef` 字符串为 `IndexDefinition` 对象（`parseIndexDefinition()`）

### 3.4 获取 CHECK 约束

```sql
SELECT conrelid::regclass AS table_name, conname, contype, convalidated,
       pg_get_constraintdef(oid, TRUE) as condef
FROM pg_catalog.pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid IN($1::regclass)
  AND contype = 'c'
```

---

## 4. Diff 算法详解

### 4.1 Columns Diff (`generateColumnsActions`)

```
for each targetColumn:
  startColumn = startTable.columns.find(name match)
  │
  ├─ startColumn 不存在
  │    → preDeploy: ADD_COLUMN
  │
  └─ startColumn 存在但不相等（columnDefinitionsEqual）
       → generateAlterColumnActions():
            ├─ defaultValue 不同 → postDeploy: ALTER_COLUMN_SET_DEFAULT / DROP_DEFAULT
            ├─ notNull 不同     → postDeploy: ALTER_COLUMN_UPDATE_NOT_NULL
            └─ type 不同        → postDeploy: ALTER_COLUMN_TYPE

for each startColumn:
  if not in targetTable
    → postDeploy: DROP_COLUMN
```

**列比较的特殊处理**：
```ts
function desugarColumnDefinition(tableDef, inputColumnDef): ColumnDefinition {
  // SERIAL → INT + nextval() 默认值
  // IDENTITY → NOT NULL
  // 这样可以正确比较 PostgreSQL 报告的列定义和目标定义
}
```

### 4.2 Indexes Diff (`generateIndexesActions`)

```
computedIndexes = 从 primaryKey 列推导的隐式索引

for each targetIndex (包括 computedIndexes):
  indexName = getIndexName(tableName, index)
  assert(indexName 不重复)
  │
  ├─ startIndex 存在且相等（indexDefinitionsEqual）
  │    → 标记为 matched，不生成操作
  │
  └─ startIndex 不存在
       → postDeploy: CREATE_INDEX (CONCURRENTLY)

for each startIndex:
  if not matched:
    console.log("Existing index should not exist: ...")
    if options.dropUnmatchedIndexes:
      → preDeploy: DROP_INDEX (CONCURRENTLY)
```

**索引比较的特殊处理**：
```ts
function indexDefinitionsEqual(a, b): boolean {
  // 忽略 primaryKey 标记（parseIndexDefinition 不包含此信息）
  // unique = primaryKey || unique
  // 忽略 indexNameOverride 和 indexNameSuffix
  // 对于表达式列，忽略 name（只比较 expression）
}
```

**索引名生成规则**：
```
{TableNameAbbreviated}_{Column1Abbreviated}_{Column2Abbreviated}_idx
```
- 表名和列名有缩写映射（`TableNameAbbreviations`, `ColumnNameAbbreviations`）
- 索引名长度限制 ≤ 63 字符（PostgreSQL 限制）

### 4.3 Constraints Diff (`generateConstraintsActions`)

```
for each targetConstraint:
  startConstraint = startTable.constraints.find(equal)
  │
  ├─ 存在且相等 → 标记为 matched
  │
  └─ 不存在
       → postDeploy: ADD_CONSTRAINT

for each startConstraint:
  if not matched:
    console.log("Existing constraint should not exist: ...")
    // 注意：不自动删除约束（只打印警告）
```

---

## 5. Migration Action 类型

| Action 类型 | 阶段 | SQL 模板 |
|------------|------|----------|
| `CREATE_FUNCTION` | preDeploy | 自定义 SQL |
| `CREATE_TABLE` | preDeploy | `CREATE TABLE IF NOT EXISTS ...` |
| `DROP_TABLE` | postDeploy | `DROP TABLE IF EXISTS ...` |
| `ADD_COLUMN` | preDeploy | `ALTER TABLE ADD COLUMN IF NOT EXISTS ...` |
| `DROP_COLUMN` | postDeploy | `ALTER TABLE DROP COLUMN IF EXISTS ...` |
| `ALTER_COLUMN_SET_DEFAULT` | postDeploy | `ALTER TABLE ALTER COLUMN SET DEFAULT ...` |
| `ALTER_COLUMN_DROP_DEFAULT` | postDeploy | `ALTER TABLE ALTER COLUMN DROP DEFAULT` |
| `ALTER_COLUMN_UPDATE_NOT_NULL` | postDeploy | `ALTER TABLE ALTER COLUMN SET/DROP NOT NULL` |
| `ALTER_COLUMN_TYPE` | postDeploy | `ALTER TABLE ALTER COLUMN TYPE ...` |
| `CREATE_INDEX` | postDeploy | `CREATE INDEX CONCURRENTLY IF NOT EXISTS ...` |
| `DROP_INDEX` | preDeploy | `DROP INDEX CONCURRENTLY IF EXISTS ...` |
| `ADD_CONSTRAINT` | postDeploy | 非阻塞添加 CHECK 约束 |
| `ANALYZE_TABLE` | preDeploy | `ANALYZE {tableName}` |

---

## 6. 非阻塞操作

Medplum 对可能阻塞表的操作使用特殊的非阻塞实现：

```ts
// migrate-functions.ts
async function nonBlockingAlterColumnNotNull(client, results, tableName, columnName): Promise<void>
// 使用 CHECK 约束 + VALIDATE 的两步方式，避免长时间锁表

async function nonBlockingAddCheckConstraint(client, results, tableName, constraintName, expression): Promise<void>
// 先添加 NOT VALID 约束，再异步 VALIDATE

async function idempotentCreateIndex(client, results, indexName, createIndexSql): Promise<void>
// 先检查索引是否存在，再 CREATE INDEX CONCURRENTLY
```

---

## 7. 代码生成

迁移操作不是直接执行的，而是**生成 TypeScript 代码文件**：

### Pre-deploy 迁移文件模板

```ts
// src/migrations/schema/v{N}.ts
import type { PoolClient } from 'pg';
import * as fns from '../migrate-functions';

export async function run(client: PoolClient): Promise<void> {
  const results: { name: string; durationMs: number }[] = [];
  await fns.query(client, results, `CREATE TABLE IF NOT EXISTS ...`);
  await fns.query(client, results, `ALTER TABLE ... ADD COLUMN ...`);
  // ...
}
```

### Post-deploy 迁移文件模板

```ts
// src/migrations/data/v{N}.ts
import type { PoolClient } from 'pg';
import { prepareCustomMigrationJobData, runCustomMigration } from '../../workers/post-deploy-migration';
import * as fns from '../migrate-functions';
import type { MigrationActionResult } from '../types';
import type { CustomPostDeployMigration } from './types';

export const migration: CustomPostDeployMigration = {
  type: 'custom',
  prepareJobData: (asyncJob) => prepareCustomMigrationJobData(asyncJob),
  run: async (repo, job, jobData) => runCustomMigration(repo, job, jobData, callback),
};

async function callback(client: PoolClient, results: MigrationActionResult[]): Promise<void> {
  await fns.idempotentCreateIndex(client, results, 'indexName', `CREATE INDEX CONCURRENTLY ...`);
  await fns.query(client, results, `ALTER TABLE ... DROP COLUMN ...`);
  // ...
}
```

---

## 8. 伪代码

```
ALGORITHM SchemaDiff
INPUT:
  startSchema: SchemaDefinition  -- 当前数据库
  targetSchema: SchemaDefinition -- 目标（从 FHIR 推导）
OUTPUT:
  migration: { preDeploy: Action[], postDeploy: Action[] }

BEGIN
  pre  = []
  post = []

  -- Functions diff
  FOR EACH targetFunc IN targetSchema.functions:
    IF targetFunc NOT IN startSchema.functions:
      pre.push(CREATE_FUNCTION(targetFunc))

  -- Tables diff
  matchedStartTables = empty set
  FOR EACH targetTable IN targetSchema.tables:
    startTable = startSchema.tables.find(name == targetTable.name)
    IF startTable EXISTS:
      matchedStartTables.add(startTable)
      (colPre, colPost)   = diffColumns(startTable, targetTable)
      (idxPre, idxPost)   = diffIndexes(startTable, targetTable)
      (conPre, conPost)    = diffConstraints(startTable, targetTable)
      pre.push(...colPre, ...idxPre, ...conPre)
      post.push(...colPost, ...idxPost, ...conPost)
    ELSE:
      pre.push(CREATE_TABLE(targetTable))

  FOR EACH startTable IN startSchema.tables:
    IF startTable NOT IN matchedStartTables:
      post.push(DROP_TABLE(startTable.name))

  RETURN { preDeploy: pre, postDeploy: post }
END
```

---

## 9. 复杂度

- **时间**：O(T × C) 其中 T = 表数量（~500），C = 每表最大列/索引数（~50）
- **空间**：O(T × C) 用于存储 start 和 target schema
- **I/O**：每张表 3 次 DB 查询（columns, indexes, constraints）= ~1500 次查询
- **实际耗时**：几秒（本地 PostgreSQL）

---

## 10. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 迁移生成方式？ | 声明式 diff（目标 vs 当前） | 强烈建议采用，避免手写迁移 |
| 迁移文件格式？ | 生成 TypeScript 代码 | 可选 TypeScript 或纯 SQL |
| 非阻塞操作？ | CONCURRENTLY + 两步约束 | 生产环境必须使用 |
| 索引名缩写？ | 自动缩写（63字符限制） | PostgreSQL 硬限制，必须处理 |
| 约束删除？ | 只打印警告，不自动删除 | 保守策略，建议保留 |
| SERIAL 处理？ | desugar 为 INT + nextval | 正确处理 PostgreSQL 的 SERIAL 语法糖 |
