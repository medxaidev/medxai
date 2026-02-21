# Workflow Analysis: Lookup Table Strategy

```yaml
workflow_id: WF-MIG-004
workflow_name: Lookup Table Strategy
entry_point: "buildTargetDefinition() 中的 buildXxxTable() 系列函数"
exit_point: "Lookup 表定义加入 SchemaDefinition"
phase: Phase-Server (Database Schema Management)
parent_workflow: WF-MIG-001
source_files:
  - packages/server/src/migrations/migrate.ts (buildLookupTable, buildAddressTable, buildHumanNameTable, etc.)
  - packages/server/src/fhir/lookups/ (各 LookupTable 实现)
  - packages/server/src/fhir/searchparameter.ts (lookupTables 数组)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心问题

某些 FHIR 数据类型（Address、HumanName、Identifier、ContactPoint、Coding）包含多个子字段，无法用单列存储。Medplum 为这些类型创建**独立的 Lookup 表**，通过 `resourceId` 关联回主表。

---

## 2. Lookup 表总览

### 2.1 通用 Lookup 表（由 `buildLookupTable()` 生成）

| 表名 | 列 | 索引 | 额外索引 |
|------|-----|------|----------|
| **Address** | resourceId, address, city, country, postalCode, state, use | 每列 btree | 6 个 tsvector GIN（全文搜索） |
| **ContactPoint** | resourceId, system, value | 每列 btree | 无 |
| **Identifier** | resourceId, system, value | 每列 btree | 无 |
| **HumanName** | resourceId, name, given, family | 每列 btree | 3 个 trigram GIN + 3 个 tsvector GIN |

**通用结构**：
```sql
CREATE TABLE {LookupTableName} (
  "resourceId" UUID NOT NULL,
  -- 数据列（全部 TEXT 类型）
  "column1" TEXT,
  "column2" TEXT,
  ...
);
-- 索引
CREATE INDEX ON {LookupTableName} ("resourceId");  -- btree
CREATE INDEX ON {LookupTableName} ("column1");      -- btree
-- 可选额外索引
```

### 2.2 专用表（独立定义）

| 表名 | 主键 | 核心列 | 用途 |
|------|------|--------|------|
| **Coding** | id (BIGSERIAL) | system(UUID), code, display, isSynonym, synonymOf, language | 术语编码存储 |
| **Coding_Property** | 无（复合索引） | coding, property, target, value | 编码属性关系 |
| **CodeSystem_Property** | id (BIGSERIAL) | system(UUID), code, type, uri, description | 代码系统属性定义 |
| **CodingSystem** | id (BIGINT, IDENTITY) | system(TEXT) | 编码系统 URL → ID 映射 |
| **ConceptMapping** | id (BIGINT, IDENTITY) | conceptMap, sourceSystem, sourceCode, targetSystem, targetCode, relationship | 概念映射 |
| **ConceptMapping_Attribute** | 复合PK | mapping, uri, type, value, kind | 映射属性 |
| **DatabaseMigration** | id (INTEGER) | version, dataVersion, firstBoot | 迁移版本追踪 |

---

## 3. 索引策略详解

### 3.1 Address 表 — tsvector 全文搜索

```sql
-- 每个搜索字段都有 tsvector GIN 索引
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "address"));
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "postalCode"));
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "city"));
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "use"));
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "country"));
CREATE INDEX ON "Address" USING gin (to_tsvector('simple', "state"));
```

**为什么用 `'simple'` 而不是 `'english'`**：FHIR 地址是结构化数据，不需要词干提取（stemming），`simple` 配置只做分词和小写化。

### 3.2 HumanName 表 — trigram + tsvector 双索引

```sql
-- Trigram 索引（模糊匹配，如 LIKE '%john%'）
CREATE INDEX ON "HumanName" USING gin ("name" gin_trgm_ops);
CREATE INDEX ON "HumanName" USING gin ("given" gin_trgm_ops);
CREATE INDEX ON "HumanName" USING gin ("family" gin_trgm_ops);

-- tsvector 索引（全文搜索，如 name:contains）
CREATE INDEX ON "HumanName" USING gin (to_tsvector('simple', "name"));
CREATE INDEX ON "HumanName" USING gin (to_tsvector('simple', "given"));
CREATE INDEX ON "HumanName" USING gin (to_tsvector('simple', "family"));
```

**双索引原因**：
- **trigram**：支持 FHIR `:contains` 修饰符（子串匹配）
- **tsvector**：支持 FHIR 默认字符串搜索（前缀匹配/分词匹配）

### 3.3 Coding 表 — 复杂索引策略

```sql
-- 唯一索引：精确查找 (system, code) → id
CREATE UNIQUE INDEX ON "Coding" ("system", "code") INCLUDE ("id")
  WHERE "synonymOf" IS NULL;

-- 唯一索引：防止重复（含同义词）
CREATE UNIQUE INDEX ON "Coding" ("system", "code", "display",
  COALESCE("synonymOf", (-1)::bigint));

-- 模糊搜索：display 文本的 trigram
CREATE INDEX ON "Coding" USING gin ("system", "display" gin_trgm_ops);
```

**Coding 表的特殊设计**：
- `system` 列是 UUID（引用 `CodingSystem.id`），不是 TEXT
- `isSynonym` + `synonymOf` 支持同义词关系
- 条件唯一索引 `WHERE "synonymOf" IS NULL` 确保主编码唯一

---

## 4. LookupTable 接口

```ts
// packages/server/src/fhir/lookups/lookuptable.ts
export abstract class LookupTable {
  abstract isIndexed(searchParam: SearchParameter, resourceType: string): boolean;
  abstract indexResource(client: PoolClient, resource: Resource): Promise<void>;
  abstract deleteValuesForResource(client: PoolClient, resource: Resource): Promise<void>;
}
```

**5 个实现**：

| 类 | `isIndexed()` 判断逻辑 |
|----|----------------------|
| `AddressTable` | searchParam.code 以 `address` 开头 |
| `HumanNameTable` | searchParam.id 在 `HumanNameSearchParameterIds` 集合中 |
| `ReferenceTable` | searchParam.type === 'reference' |
| `CodingTable` | 特定 coding/token 参数 |
| `ConceptMappingTable` | concept map 相关参数 |

**运行时行为**：当资源被创建/更新时，`indexResource()` 将资源的相关字段提取并写入 lookup 表。

---

## 5. Lookup 表 vs 主表搜索列的权衡

| 维度 | 主表搜索列（COLUMN/TOKEN-COLUMN） | Lookup 表 |
|------|----------------------------------|-----------|
| 查询性能 | 更快（无 JOIN） | 需要 JOIN |
| 存储空间 | 每行都有列（即使为空） | 只存有值的行 |
| 多值支持 | 数组列（UUID[], TEXT[]） | 多行 |
| 子字段搜索 | 不支持（单列） | 支持（多列） |
| 全文搜索 | 有限（trigram on TEXT[]） | 完整（tsvector per column） |
| 写入开销 | 低（更新单行） | 高（删除旧行 + 插入新行） |

---

## 6. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 是否需要 Lookup 表？ | 是（Address, HumanName, Identifier, ContactPoint, Coding） | 若需要子字段搜索，必须使用 |
| 全文搜索引擎？ | PostgreSQL tsvector + trigram | 可选 Elasticsearch/OpenSearch 替代 |
| Coding 表设计？ | 独立表 + 同义词支持 | 若需要术语服务，建议复用此设计 |
| tsvector 配置？ | `'simple'`（不做词干提取） | 对于 FHIR 结构化数据，`simple` 是正确选择 |
| trigram 扩展？ | `pg_trgm` | 必须安装此 PostgreSQL 扩展 |
| btree_gin 扩展？ | `btree_gin` | 用于复合 GIN 索引（如 Encounter 的 compartments+deleted+appointment） |
