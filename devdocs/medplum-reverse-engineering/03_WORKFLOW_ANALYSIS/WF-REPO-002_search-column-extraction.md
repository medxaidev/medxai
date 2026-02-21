# Workflow Analysis: Search Column Value Extraction

```yaml
workflow_id: WF-REPO-002
workflow_name: Search Column Value Extraction (Resource → DB Columns)
entry_point: "Repository.buildResourceRow(resource)"
exit_point: "Record<string, any> — 包含所有搜索列值的行对象"
phase: Phase-Server (Runtime CRUD — Write Path)
source_files:
  - packages/server/src/fhir/repo.ts (buildResourceRow, buildColumn, buildColumnValues)
  - packages/server/src/fhir/token-column.ts (buildTokenColumns, hashTokenColumnValue)
  - packages/server/src/fhir/searchparameter.ts (getSearchParameterImplementation)
  - packages/server/src/fhir/lookups/humanname.ts (getHumanNameSortValue)
parent_workflow: WF-REPO-001
related_workflows:
  - WF-MIG-003 (Search Parameter → Column/Index Mapping — Schema 端)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心问题

当资源被创建或更新时，需要从 FHIR JSON 中**提取搜索列的值**写入 PostgreSQL。这是 WF-MIG-003（Schema 端定义列）的**运行时对应物**。

```
FHIR Resource (JSON)
    ↓ FHIRPath 求值
TypedValue[]
    ↓ 类型转换
Column Values (string | number | boolean | UUID[] | ...)
    ↓ INSERT/UPSERT
PostgreSQL Row
```

---

## 2. 完整调用链

```
buildResourceRow(resource)
  │
  ├─ 基础列:
  │    id, lastUpdated, deleted, projectId, content, __version
  │
  ├─ getStandardAndDerivedSearchParameters(resourceType)
  │    → 获取该资源类型的所有搜索参数
  │
  └─ for each searchParam:
       buildColumn(resource, row, searchParam)
         │
         ├─ [跳过] _id, _lastUpdated, _compartment:identifier, _deleted, composite
         │
         ├─ [_compartment] → row.compartments = meta.compartment.map(resolveId)
         │
         ├─ getSearchParameterImplementation(resourceType, searchParam)
         │    → 返回 SearchParameterImplementation（含 searchStrategy）
         │
         ├─ [LOOKUP-TABLE 策略]
         │    → 只设置排序列（如 __nameSort）
         │    → 实际数据由 writeLookupTables() 写入独立表
         │
         ├─ evalFhirPathTyped(impl.parsedExpression, [toTypedValue(resource)])
         │    → 执行 FHIRPath 表达式，提取值
         │
         ├─ [TOKEN-COLUMN 策略]
         │    → buildTokenColumns(searchParam, impl, columns, resource)
         │    → 详见 §4
         │
         └─ [COLUMN 策略]
              → buildColumnValues(searchParam, impl, typedValues)
              → 详见 §3
```

---

## 3. COLUMN 策略值提取 (buildColumnValues)

### 类型转换规则

| SearchParameter.type | 转换函数 | 输出类型 | 示例 |
|---------------------|----------|----------|------|
| boolean | 直接取值 | `boolean \| null` | `true` |
| date | `convertToSearchableDates()` → `.start.substring(0,10)` | `string` | `'1990-01-01'` |
| dateTime | `convertToSearchableDates()` → `.start` | `string` | `'2024-01-15T10:30:00Z'` |
| number | `convertToSearchableNumbers()` → `[low, high]` → `low ?? high` | `number` | `98.6` |
| quantity | `convertToSearchableQuantities()` → `.value` | `number` | `120.0` |
| reference | `convertToSearchableReferences()` | `string` | `'Patient/123'` |
| token | `convertToSearchableTokens()` → `.value` | `string` | `'male'` |
| string | `convertToSearchableStrings()` | `string` | `'John Smith'` |
| uri | `convertToSearchableUris()` | `string` | `'http://example.com'` |
| special/composite | 不支持 | `[]` | — |

### 数组 vs 标量

```ts
if (impl.array) {
  columns[impl.columnName] = columnValues.length > 0 ? columnValues : undefined;
  // 数组列：TEXT[], TIMESTAMPTZ[], etc.
} else {
  columns[impl.columnName] = columnValues[0];
  // 标量列：只取第一个值
}
```

### 文本截断

```ts
// 所有 TEXT 类型列都经过截断处理
function truncateTextColumn(value: string | undefined): string | undefined {
  // btree 索引条目最大 2704 字节
  // 如果 UTF-8 编码超过 2704 字节，截断到 675 字符
  // （最坏情况：675 × 4 bytes/char = 2700 bytes）
  if (textEncoder.encode(value).length <= 2704) return value;
  return Array.from(value).slice(0, 675).join('');
}
```

---

## 4. TOKEN-COLUMN 策略值提取 (buildTokenColumns)

### 4.1 Token 哈希算法

```ts
// token-column.ts:129-131
export function hashTokenColumnValue(value: string): string {
  return v5(value, NIL);  // UUID v5 哈希，命名空间为 NIL UUID
}
```

**输入格式**（取决于搜索方式）：

| 搜索模式 | 哈希输入 | 说明 |
|----------|----------|------|
| `[system]\|` | `system` 或 `code\x01system` | 只按系统搜索 |
| `[system]\|[code]` | `system\x01value` 或 `code\x01system\x01value` | 系统+代码 |
| `\|[code]` | `\x02\x01value` 或 `code\x01\x02\x01value` | 无系统的代码 |
| `[code]` | `\x01value` 或 `code\x01\x01value` | 只按代码搜索 |

**专用列 vs 共享列**：
- **专用列**：哈希输入不含 `code` 前缀（因为列本身就是该 code 专用的）
- **共享列**：哈希输入包含 `code\x01` 前缀（区分不同搜索参数）

### 4.2 三列输出

```ts
// 最终写入：
columns[impl.tokenColumnName]      = Array.from(tokens);       // UUID[] — 哈希值数组
columns[impl.textSearchColumnName] = Array.from(textSearchTokens); // TEXT[] — 显示文本数组
columns[impl.sortColumnName]       = sortColumnValue;           // TEXT — 字母序最小的值
```

### 4.3 文本搜索列

```ts
// 文本搜索列存储原始显示文本（不哈希）
// 用于 :text 和 :contains 修饰符搜索
// 专用列格式：value
// 共享列格式：code\x01value
if (impl.hasDedicatedColumns) {
  textSearchTokens.add(value);
} else {
  textSearchTokens.add(code + DELIM + value);
}
```

### 4.4 大小写处理

```ts
// 如果 impl.caseInsensitive = true（由 TokenIndexTypes.CASE_INSENSITIVE 决定）
if (value && impl.caseInsensitive) {
  value = value.toLocaleLowerCase();
}
```

### 4.5 数组填充（Array Padding）

```ts
// 解决 PostgreSQL 数组列统计信息不准确的问题
// 当数组中大部分元素是唯一的时，ANALYZE 无法正确估计选择性
// 解决方案：随机添加已知的填充元素，使 most_common_elements 统计更准确
// 填充概率：m * lambda / (statisticsTarget * 300)
// 填充值：00000000-0000-0000-0000-00000000{random_int}
```

---

## 5. LOOKUP-TABLE 策略值提取

Lookup 表的值不在 `buildColumn` 中提取，而是在 `writeLookupTables` 中由各 LookupTable 实现自行处理。

**主表上只写排序列**：

```ts
// repo.ts:1795-1800
if (impl.searchStrategy === 'lookup-table') {
  if (impl.sortColumnName) {
    // 只有 HumanName 相关参数有排序列
    columns[impl.sortColumnName] = getHumanNameSortValue(resource.name, searchParam);
  }
  return; // 不在主表写其他列
}
```

---

## 6. 特殊处理

### MeasureReport.period — tstzrange 试验

```ts
// repo.ts:1807-1809
if (searchParam.id === 'MeasureReport-period') {
  columns['period_range'] = this.buildPeriodColumn(typedValues[0]?.value);
  // 输出格式：'[2024-01-01T00:00:00Z, 2024-01-31T23:59:59Z)'
}
```

这是 Medplum 正在试验的 `TSTZRANGE` 列类型，未来可能推广到所有 date 参数。

---

## 7. Reindex 流程

```ts
// repo.ts:1204-1224
async reindexResources(conn, resources): Promise<void> {
  for (const resource of resources) {
    meta.compartment = this.getCompartments(resource);  // 重算 compartment
    if (!meta.project) {
      meta.project = resolveId(meta.compartment.find(r => r.startsWith('Project/')));
    }
  }
  await this.batchWriteLookupTables(conn, resources, false);  // 重写 Lookup 表
  await this.batchWriteResources(conn, resources);             // 重写主表（含搜索列）
}
```

**Reindex 的作用**：当 Schema 版本升级（新增搜索参数、修改索引策略）后，需要重新计算所有资源的搜索列值。通过比较 `resource.__version` 与 `Repository.VERSION` 来判断是否需要 reindex。

---

## 8. 数据流总结

```
┌─────────────────────────────────────────────────────────────────┐
│                    FHIR Resource (JSON)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    FHIRPath 求值
                    evalFhirPathTyped()
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TypedValue[]                                   │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
   COLUMN 策略       TOKEN-COLUMN 策略   LOOKUP-TABLE 策略
       │                  │                  │
       ▼                  ▼                  ▼
  convertToXxx()    buildTokenColumns()   LookupTable
       │                  │              .indexResource()
       ▼                  ▼                  │
  标量/数组值        UUID哈希数组            ▼
  (string/number)   + 文本数组          独立表 INSERT
       │            + 排序值
       │                  │
       ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL 主表行 (INSERT ON CONFLICT)              │
│  id | content | lastUpdated | ... | birthdate | __code | ...    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 值提取引擎？ | FHIRPath 求值 | 核心依赖，必须实现 FHIRPath |
| Token 哈希？ | UUID v5 (NIL namespace) | 不可逆但高效，适合精确匹配 |
| 文本截断？ | 675 字符（btree 2704 字节限制） | PostgreSQL 硬限制，必须处理 |
| 数组填充？ | 概率性填充解决统计偏差 | 高级优化，初期可跳过 |
| tstzrange？ | 试验中（仅 MeasureReport） | 日期范围搜索的更好方案 |
| Reindex？ | VERSION 比较 + 批量重写 | Schema 演进必须有此机制 |
