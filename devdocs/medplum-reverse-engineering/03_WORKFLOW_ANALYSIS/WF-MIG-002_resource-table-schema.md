# Workflow Analysis: Resource Table Schema Strategy

```yaml
workflow_id: WF-MIG-002
workflow_name: Resource Table Schema Strategy
entry_point: "buildCreateTables(result, resourceType)"
exit_point: "3张表定义 (主表 + History + References) 加入 SchemaDefinition"
phase: Phase-Server (Database Schema Management)
parent_workflow: WF-MIG-001
source_file: packages/server/src/migrations/migrate.ts
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心设计：每个 FHIR 资源类型 = 3 张表

对于每个 FHIR 资源类型（如 Patient、Observation），Medplum 自动生成 **3 张 PostgreSQL 表**：

### 1.1 主表 `{ResourceType}`

存储资源的当前版本。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 资源 ID |
| `content` | TEXT | NOT NULL | **完整 JSON 内容**（FHIR 资源序列化） |
| `lastUpdated` | TIMESTAMPTZ | NOT NULL | 最后更新时间 |
| `deleted` | BOOLEAN | NOT NULL, DEFAULT false | 软删除标记 |
| `projectId` | UUID | NOT NULL | 所属项目（多租户） |
| `__version` | INTEGER | NOT NULL | 乐观锁版本号 |
| `_source` | TEXT | | 来源标识 |
| `_profile` | TEXT[] | | 资源 profile URL 数组 |
| `compartments` | UUID[] | NOT NULL（Binary 除外） | 所属 compartment 列表 |
| *搜索列...* | *各种* | | 由 WF-MIG-003 生成 |

**关键设计决策**：
- **JSON-in-TEXT**：完整资源存储为 TEXT 列中的 JSON 字符串，不使用 PostgreSQL 的 JSONB 类型
- **搜索列是冗余的**：搜索列从 `content` 中提取，用于加速查询
- **软删除**：`deleted` 标记，不物理删除
- **多租户**：`projectId` 实现项目级隔离

### 1.2 历史表 `{ResourceType}_History`

存储资源的所有历史版本。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `versionId` | UUID | PK, NOT NULL | 版本 ID |
| `id` | UUID | NOT NULL | 资源 ID |
| `content` | TEXT | NOT NULL | 该版本的完整 JSON |
| `lastUpdated` | TIMESTAMPTZ | NOT NULL | 该版本的时间戳 |

**设计**：History 表不包含搜索列，只用于版本查询。

### 1.3 引用表 `{ResourceType}_References`

存储资源间的引用关系。

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `resourceId` | UUID | NOT NULL | 源资源 ID |
| `targetId` | UUID | NOT NULL | 目标资源 ID |
| `code` | TEXT | NOT NULL | 搜索参数 code |

**复合主键**：`(resourceId, targetId, code)`
**用途**：支持反向引用查询（`_revinclude`）和 compartment 搜索。

---

## 2. 默认索引策略

### 主表索引

| 索引列 | 类型 | 用途 |
|--------|------|------|
| `lastUpdated` | btree | 按时间排序 |
| `projectId, lastUpdated` | btree | 项目内按时间排序（最常用） |
| `projectId` | btree | 项目过滤 |
| `_source` | btree | 来源过滤 |
| `_profile` | **gin** | 数组包含查询 |
| `__version` | btree | 版本查询 |
| `lastUpdated, __version WHERE deleted=false` | btree | 重索引分页 |
| `compartments` | **gin** | 数组包含查询（compartment 搜索） |

### History 表索引

| 索引列 | 类型 | 用途 |
|--------|------|------|
| `id` | btree | 按资源 ID 查历史 |
| `lastUpdated` | btree | 按时间查历史 |

### References 表索引

| 索引列 | 类型 | 用途 |
|--------|------|------|
| `targetId, code` (INCLUDE resourceId) | btree | 反向引用查询 |

---

## 3. 特殊资源处理

```ts
// Binary 没有 compartments 列
if (resourceType !== 'Binary') {
  tableDefinition.columns.push({ name: 'compartments', type: 'UUID[]', notNull: true });
}

// Project 有 CHECK 约束（禁止使用系统保留 ID）
if (resourceType === 'Project') {
  tableDefinition.constraints.push({
    name: 'reserved_project_id_check',
    expression: `id <> '${systemResourceProjectId}'::uuid`,
  });
}

// User 有唯一索引
if (resourceType === 'User') {
  result.indexes.push(
    { columns: ['project', 'email'], unique: true },
    { columns: ['project', 'externalId'], unique: true }
  );
}

// ProjectMembership 有唯一索引
if (resourceType === 'ProjectMembership') {
  result.indexes.push(
    { columns: ['project', 'externalId'], unique: true },
    { columns: ['project', 'userName'], unique: true }
  );
}

// DomainConfiguration 的 domain 列唯一
if (resourceType === 'DomainConfiguration') {
  domainIdx.unique = true;
}

// UserConfiguration 的 name 有默认值
if (resourceType === 'UserConfiguration') {
  nameCol.defaultValue = "''::text";
}

// Encounter 有复合 GIN 索引
if (resourceType === 'Encounter') {
  result.indexes.push({ columns: ['compartments', 'deleted', 'appointment'], indexType: 'gin' });
}
```

---

## 4. 数据模型图

```
┌─────────────────────────────────────────────────────┐
│                    Patient (主表)                     │
├──────────┬──────────────┬───────────────────────────┤
│ id (PK)  │ content      │ lastUpdated │ deleted     │
│ UUID     │ TEXT (JSON)  │ TIMESTAMPTZ │ BOOLEAN     │
├──────────┼──────────────┼─────────────┼─────────────┤
│ projectId│ __version    │ _source     │ _profile    │
│ UUID     │ INTEGER      │ TEXT        │ TEXT[]      │
├──────────┼──────────────┼─────────────┼─────────────┤
│ compartments             │ ... 搜索列 (WF-MIG-003)  │
│ UUID[]                   │ name, birthdate, etc.     │
└──────────────────────────┴───────────────────────────┘
         │ 1:N                    │ M:N
         ▼                        ▼
┌─────────────────────┐  ┌─────────────────────────────┐
│ Patient_History      │  │ Patient_References           │
├──────────┬──────────┤  ├──────────┬─────────┬────────┤
│versionId │ id       │  │resourceId│targetId │ code   │
│(PK) UUID │ UUID     │  │ UUID     │ UUID    │ TEXT   │
│ content  │lastUpdated│  │ (composite PK)              │
│ TEXT     │TIMESTAMPTZ│  └─────────────────────────────┘
└──────────────────────┘
```

---

## 5. 表数量估算

```
FHIR R4 标准资源类型: ~145 个
Medplum 扩展资源类型: ~15 个
每个资源类型: 3 张表
────────────────────────
资源表总数: ~480 张
Lookup 表: ~11 张 (WF-MIG-004)
系统表: 1 张 (DatabaseMigration)
────────────────────────
总计: ~492 张表
```

---

## 6. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 资源存储格式？ | JSON-in-TEXT | 考虑 JSONB（支持 JSON 路径查询），但 TEXT 更简单且序列化/反序列化更快 |
| 每个资源类型一张表？ | 是（~160 张主表） | 可选单表（所有资源一张表）或多表；Medplum 方案的优势是搜索列可定制 |
| 搜索列冗余？ | 是（从 content 提取） | 这是性能关键设计，避免 JSON 解析开销 |
| 历史版本？ | 独立 History 表 | 可选：History 表 vs 版本列 vs 事件溯源 |
| 引用关系？ | 独立 References 表 | 支持高效反向引用查询，建议保留 |
| 软删除？ | `deleted` 布尔列 | 建议保留，FHIR 规范要求支持 |
| 多租户？ | `projectId` 列 | 若 medxai 需要多租户，必须实现 |
