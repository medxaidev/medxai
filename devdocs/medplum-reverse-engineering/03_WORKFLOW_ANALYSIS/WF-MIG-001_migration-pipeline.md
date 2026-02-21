# Workflow Analysis: Database Migration Pipeline (总控)

```yaml
workflow_id: WF-MIG-001
workflow_name: Database Migration Pipeline
entry_point: "npm run migrate (packages/server)"
exit_point: "生成 schema migration .ts 文件 + data migration .ts 文件 + schema.sql"
phase: Phase-Server (Database Schema Management)
related_workflows:
  - WF-MIG-002 (Resource Table Schema Strategy)
  - WF-MIG-003 (Search Parameter → Column/Index Mapping)
  - WF-MIG-004 (Lookup Table Strategy)
  - WF-MIG-005 (Schema Diff & Migration Generation)
  - WF-SERVER-001 (loadStructureDefinitions)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 概述

### 这个系统解决什么问题？

Medplum 的数据库 schema 不是手写的，而是**从 FHIR 规范自动推导**的。每当 FHIR 规范更新或搜索参数变化时，需要：
1. 计算目标 schema（从 FHIR 规范推导）
2. 读取当前数据库 schema
3. 对比差异，生成迁移脚本
4. 将迁移脚本写入版本化的 `.ts` 文件

### 核心设计理念

```
FHIR StructureDefinition + SearchParameter
        ↓ (自动推导)
Target Schema Definition (内存中)
        ↓ (对比)
Current DB Schema (从 PostgreSQL 读取)
        ↓ (diff)
Migration Actions (preDeploy + postDeploy)
        ↓ (代码生成)
TypeScript Migration Files (版本化)
```

**这不是传统的手写 migration，而是声明式 schema 管理。**

---

## 2. 完整调用链

```
[npm run migrate]  →  tsx src/migrations/migrate-main.ts
  │
  ├─ 1. indexStructureDefinitionsAndSearchParameters()
  │      ├─ indexStructureDefinitionBundle × 3  → 填充 DATA_TYPES
  │      └─ indexSearchParameterBundle × 3      → 填充 globalSchema
  │      (与 WF-SERVER-001 完全相同)
  │
  ├─ 2. new Client({ host, port, database, user, password })
  │      → 连接到 PostgreSQL
  │
  ├─ 3. [if !skipMigration] generateMigrationActions(options)
  │      ├─ buildStartDefinition(options)        → 从 DB 读取当前 schema
  │      │    ├─ getTableNames(db)               → SELECT FROM information_schema.tables
  │      │    └─ for each table: getTableDefinition(db, name)
  │      │         ├─ getColumns(db, name)
  │      │         ├─ getIndexes(db, name)
  │      │         └─ getCheckConstraints(db, name)
  │      │
  │      ├─ buildTargetDefinition()              → 从 FHIR 规范推导目标 schema
  │      │    ├─ for each resourceType: buildCreateTables()   → WF-MIG-002
  │      │    │    ├─ 基础列 (id, content, lastUpdated, ...)
  │      │    │    ├─ buildSearchColumns()                    → WF-MIG-003
  │      │    │    ├─ buildSearchIndexes()
  │      │    │    ├─ {ResourceType}_History 表
  │      │    │    └─ {ResourceType}_References 表
  │      │    │
  │      │    └─ Lookup Tables                               → WF-MIG-004
  │      │         ├─ buildAddressTable()
  │      │         ├─ buildContactPointTable()
  │      │         ├─ buildIdentifierTable()
  │      │         ├─ buildHumanNameTable()
  │      │         ├─ buildCodingTable()
  │      │         ├─ buildCodingPropertyTable()
  │      │         ├─ buildCodeSystemPropertyTable()
  │      │         ├─ buildConceptMappingTable()
  │      │         ├─ buildCodingSystemTable()
  │      │         ├─ buildConceptMappingAttributeTable()
  │      │         └─ buildDatabaseMigrationTable()
  │      │
  │      └─ Diff: start vs target                            → WF-MIG-005
  │           ├─ Functions diff
  │           ├─ for each targetTable:
  │           │    ├─ generateColumnsActions()
  │           │    ├─ generateIndexesActions()
  │           │    └─ generateConstraintsActions()
  │           └─ Drop unmatched start tables
  │
  ├─ 4. [if actions.preDeploy.length > 0]
  │      writePreDeployActionsToBuilder()
  │      → 写入 src/migrations/schema/v{N}.ts
  │      → rewriteMigrationExports()
  │
  ├─ 5. [if actions.postDeploy.length > 0]
  │      writePostDeployActionsToBuilder()
  │      → 写入 src/migrations/data/v{N}.ts
  │      → rewriteMigrationExports()
  │      → addDataMigrationToManifest()
  │
  └─ 6. [if writeSchema]
         buildSchema()
         → 写入 src/migrations/schema/schema.sql
```

---

## 3. 输入与输出

### 输入

| 类型 | 来源 | 说明 |
|------|------|------|
| FHIR StructureDefinition JSON × 3 | `@medplum/definitions` | 定义所有资源类型和字段 |
| FHIR SearchParameter JSON × 3 | `@medplum/definitions` | 定义所有搜索参数 |
| PostgreSQL 数据库连接 | 配置 | 读取当前 schema |
| CLI 参数 | `process.argv` | `--dryRun`, `--dropUnmatchedIndexes`, `--writeSchema`, `--skipMigration`, `--analyzeResourceTables` |

### 输出

| 类型 | 路径 | 说明 |
|------|------|------|
| Pre-deploy migration | `src/migrations/schema/v{N}.ts` | 部署前执行（CREATE TABLE, ADD COLUMN 等） |
| Post-deploy migration | `src/migrations/data/v{N}.ts` | 部署后执行（DROP COLUMN, CREATE INDEX 等） |
| Schema SQL | `src/migrations/schema/schema.sql` | 完整的 schema 定义（用于全新安装） |
| Migration exports | `src/migrations/schema/index.ts` | 自动重写的导出文件 |
| Data version manifest | `src/migrations/data/data-version-manifest.json` | 数据迁移版本映射 |

---

## 4. Pre-deploy vs Post-deploy 策略

这是 Medplum 迁移系统的核心设计决策：

| 阶段 | 操作类型 | 原因 |
|------|----------|------|
| **Pre-deploy** | CREATE TABLE | 新表必须在代码部署前存在 |
| **Pre-deploy** | ADD COLUMN | 新列必须在代码使用前存在 |
| **Pre-deploy** | CREATE FUNCTION | 新函数必须在代码调用前存在 |
| **Pre-deploy** | DROP INDEX | 删除旧索引不影响功能 |
| **Post-deploy** | DROP TABLE | 旧表在旧代码停止后才能删 |
| **Post-deploy** | DROP COLUMN | 旧列在旧代码停止后才能删 |
| **Post-deploy** | CREATE INDEX (CONCURRENTLY) | 索引创建不阻塞读写 |
| **Post-deploy** | ALTER COLUMN | 列修改在旧代码停止后执行 |
| **Post-deploy** | ADD CONSTRAINT | 约束在数据迁移后添加 |

**关键**：这种分阶段策略支持**零停机部署**。

---

## 5. CLI 参数

| 参数 | 作用 |
|------|------|
| `--dryRun` | 只打印迁移内容，不写入文件 |
| `--dropUnmatchedIndexes` | 删除数据库中存在但目标 schema 中不存在的索引 |
| `--analyzeResourceTables` | 为所有资源表生成 `ANALYZE` 语句（更新统计信息） |
| `--writeSchema` | 生成完整的 `schema.sql` |
| `--skipMigration` | 跳过迁移生成，只执行 `--writeSchema` |

---

## 6. 版本管理

```ts
// 迁移文件命名：v{N}.ts（递增整数）
// 例如：v1.ts, v2.ts, ..., v87.ts

function getNextVersion(dir): number {
  // 扫描目录中所有 v{N}.ts 文件
  // 返回最大版本号 + 1
}

function rewriteMigrationExports(dir): void {
  // 自动重写 index.ts，按版本号排序导出所有迁移
  // export * as v1 from './v1';
  // export * as v2 from './v2';
  // ...
}
```

---

## 7. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 迁移策略？ | 声明式（从 FHIR 规范自动推导） | 若 medxai 也基于 FHIR，可复用此模式 |
| 迁移分阶段？ | preDeploy + postDeploy | 强烈建议采用，支持零停机部署 |
| 迁移文件格式？ | TypeScript（可执行） | 可选 TypeScript 或 SQL |
| 全新安装？ | `schema.sql`（完整 schema） | 建议同时维护完整 schema 和增量迁移 |
