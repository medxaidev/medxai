# Workflow Analysis: Search Parameter → Column/Index Mapping

```yaml
workflow_id: WF-MIG-003
workflow_name: Search Parameter to Column/Index Mapping Strategy
entry_point: "buildSearchColumns(tableDefinition, resourceType)"
exit_point: "搜索列和索引定义追加到 TableDefinition"
phase: Phase-Server (Database Schema Management)
parent_workflow: WF-MIG-001
source_files:
  - packages/server/src/migrations/migrate.ts (buildSearchColumns, getSearchParameterColumns, getSearchParameterIndexes)
  - packages/server/src/fhir/searchparameter.ts (getSearchParameterImplementation, buildSearchParameterImplementation)
  - packages/server/src/fhir/lookups/ (各 LookupTable 实现)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心问题

FHIR 规范定义了约 1300+ 个 SearchParameter，每个搜索参数需要映射为 PostgreSQL 的列和索引。Medplum 使用 **3 种搜索策略** 来处理不同类型的搜索参数。

---

## 2. 三种搜索策略

### 策略决策树

```
SearchParameter
  │
  ├─ getTokenIndexType(searchParam, resourceType) 返回非空？
  │    YES → TOKEN-COLUMN 策略
  │    NO  ↓
  │
  ├─ getLookupTable(resourceType, searchParam) 返回非空？
  │    YES → LOOKUP-TABLE 策略
  │    NO  ↓
  │
  └─ 默认 → COLUMN 策略
```

### 2.1 COLUMN 策略（默认）

**适用**：大多数非 token 类型的搜索参数（date、string、number、uri、reference 等）

**列生成**：
```
SearchParameter.code = "birthdate"
  → columnName = "birthdate"
  → 列: { name: "birthdate", type: 根据搜索参数类型决定 }
  → 索引: btree (标量) 或 gin (数组)
```

**列类型映射**（由 `getSearchParamColumnType()` 决定）：

| SearchParameter.type | 数组？ | PostgreSQL 类型 |
|---------------------|--------|----------------|
| date | 否 | TIMESTAMPTZ |
| date | 是 | TIMESTAMPTZ[] |
| number/quantity | 否 | DOUBLE PRECISION |
| number/quantity | 是 | DOUBLE PRECISION[] |
| string | 否 | TEXT |
| string | 是 | TEXT[] |
| uri | 否 | TEXT |
| uri | 是 | TEXT[] |
| reference | 否 | TEXT |
| reference | 是 | TEXT[] |

**索引策略**：
- 标量列 → btree 索引
- 数组列 → gin 索引
- 特殊：`date` 和 `sent` 参数额外创建 `(projectId, columnName)` 复合 btree 索引

**列名转换规则**：
```ts
// 连字符 → camelCase
"birth-date"  → "birthDate"
// 冒号 → camelCase（Medplum derived 参数）
"patient:identifier" → "patientIdentifier"
```

### 2.2 TOKEN-COLUMN 策略

**适用**：token 类型的搜索参数（code、Coding、CodeableConcept、Identifier 等）

**为什么需要特殊处理**：token 搜索需要同时支持：
- 精确匹配（`system|code`）→ UUID 哈希
- 文本搜索（`:text` 修饰符）→ trigram 索引
- 排序 → TEXT 列

**列生成**（每个 token 参数生成 3 列）：

| 列名 | 类型 | 用途 |
|------|------|------|
| `__code` | UUID[] | token 值的 UUID 哈希数组（精确匹配） |
| `__codeText` | TEXT[] | token 显示文本数组（文本搜索） |
| `__codeSort` | TEXT | 排序用的首个值 |

**索引生成**：
- `__code` → **gin** 索引（数组包含查询）
- `__codeText` → **gin trigram** 索引（通过 `TokenArrayToTextFn` 转换后的 trigram）

**共享列 vs 专用列**：

```
hasDedicatedTokenColumns(searchParam, resourceType)?
  YES → 专用列: __code, __codeText, __codeSort
  NO  → 共享列: __sharedTokens, __sharedTokensText, __codeSort
```

**共享列的条件**（`hasDedicatedTokenColumns` 返回 false）：
- 搜索参数 code 以 `:identifier` 结尾（derived identifier 参数）
- `_security` 参数
- 在 `DedicatedTokenColumnsOverridesByResourceTypeAndCode` 中被显式标记为 false 的参数

**共享列的目的**：减少数据库列数和索引数，对于低频使用的 token 参数，共享一组列。

### 2.3 LOOKUP-TABLE 策略

**适用**：复杂数据类型的搜索参数，需要多列存储

**Lookup 表列表**：

| LookupTable 类 | 适用搜索参数 | 独立表名 |
|----------------|-------------|----------|
| `AddressTable` | address, address-city, address-country, etc. | Address |
| `HumanNameTable` | name, given, family | HumanName |
| `ReferenceTable` | 所有 reference 类型参数 | {ResourceType}_References |
| `CodingTable` | 特定 coding 参数 | Coding |
| `ConceptMappingTable` | concept map 相关 | ConceptMapping |

**主表上的列**：
- 如果是 HumanName 相关参数，在主表上添加 `__nameSort` 排序列
- 其他 lookup-table 参数不在主表上添加列

**详细设计见 WF-MIG-004。**

---

## 3. 完整调用链

```
buildSearchColumns(tableDefinition, resourceType)
  │
  ├─ getStandardAndDerivedSearchParameters(resourceType)
  │    → 获取该资源类型的所有搜索参数（标准 + 派生）
  │
  ├─ 过滤：跳过 composite 类型
  ├─ 过滤：跳过 _id, _lastUpdated, _profile, _compartment, _source（已在基础列中）
  │
  └─ for each searchParam:
       │
       ├─ getSearchParameterImplementation(resourceType, searchParam)
       │    │
       │    ├─ [缓存命中] → 返回已缓存的 SearchParameterImplementation
       │    │
       │    └─ [缓存未命中] → buildSearchParameterImplementation()
       │         │
       │         ├─ getSearchParameterDetails(resourceType, searchParam)
       │         │    → 基础信息（type, array, columnName 等）
       │         │
       │         ├─ getTokenIndexType(searchParam, resourceType)
       │         │    → 非空？→ TOKEN-COLUMN 策略
       │         │         ├─ hasDedicatedTokenColumns()
       │         │         │    → 专用列 or 共享列
       │         │         └─ 设置 tokenColumnName, textSearchColumnName, sortColumnName
       │         │
       │         ├─ getLookupTable(resourceType, searchParam)
       │         │    → 非空？→ LOOKUP-TABLE 策略
       │         │         └─ 设置 lookupTable, sortColumnName
       │         │
       │         └─ 默认 → COLUMN 策略
       │              └─ 设置 columnName
       │
       ├─ getSearchParameterColumns(impl)
       │    → 根据策略返回 ColumnDefinition[]
       │
       └─ getSearchParameterIndexes(searchParam, impl)
            → 根据策略返回 IndexDefinition[]
```

---

## 4. 搜索策略分布估算

以 Patient 资源为例：

| 策略 | 参数数量 | 示例 |
|------|----------|------|
| COLUMN | ~10 | birthdate, gender, active, deceased, death-date |
| TOKEN-COLUMN（专用） | ~5 | identifier, language |
| TOKEN-COLUMN（共享） | ~3 | _security, _tag |
| LOOKUP-TABLE | ~5 | name, given, family, address, phone, email |

---

## 5. IgnoredSearchParameters

以下搜索参数不生成搜索列（已在基础列中处理）：

```ts
const IgnoredSearchParameters = new Set([
  '_id',           // → id 列（PK）
  '_lastUpdated',  // → lastUpdated 列
  '_profile',      // → _profile 列
  '_compartment',  // → compartments 列
  '_source',       // → _source 列
]);
```

---

## 6. additionalSearchColumns

硬编码的额外搜索列（不由 SearchParameter 驱动）：

```ts
const additionalSearchColumns = [
  { table: 'MeasureReport', column: 'period_range', type: 'TSTZRANGE', indexType: 'gist' },
];
```

---

## 7. globalSearchParameterRegistry

```ts
// 第三个全局注册表（除 DATA_TYPES 和 globalSchema 外）
export const globalSearchParameterRegistry: IndexedSearchParameters = { types: {} };

// 结构：
{
  types: {
    'Patient': {
      searchParamsImplementations: {
        'birthdate': ColumnSearchParameterImplementation { searchStrategy: 'column', columnName: 'birthdate' },
        'identifier': TokenColumnSearchParameterImplementation { searchStrategy: 'token-column', ... },
        'name': LookupTableSearchParameterImplementation { searchStrategy: 'lookup-table', ... },
      }
    }
  }
}
```

**缓存策略**：`getSearchParameterImplementation()` 首次调用时构建，后续调用从缓存返回。

---

## 8. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 搜索策略数量？ | 3种（column, token-column, lookup-table） | 可简化为2种（column + lookup-table），token 可用 JSONB GIN 索引替代 |
| token 搜索的 UUID 哈希？ | system\|code → UUID 哈希存储 | 高效但不可逆，需评估是否需要反查 |
| 共享 vs 专用 token 列？ | 按使用频率决定 | 好的优化策略，建议保留 |
| trigram 索引？ | 用于 `:text` 修饰符搜索 | 若需要模糊搜索，必须使用 |
| 搜索参数缓存？ | `globalSearchParameterRegistry` | 建议改为依赖注入 |
