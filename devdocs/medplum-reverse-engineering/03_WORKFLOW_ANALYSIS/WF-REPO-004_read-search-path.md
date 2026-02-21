# Workflow Analysis: Read & Search Path

```yaml
workflow_id: WF-REPO-004
workflow_name: Read & Search Path (Query Execution)
entry_point: "Repository.readResource() / search()"
exit_point: "WithId<T> 或 Bundle<WithId<T>>"
phase: Phase-Server (Runtime CRUD — Read Path)
source_files:
  - packages/server/src/fhir/repo.ts (readResource, readResourceImpl, readResourceFromDatabase, search, readHistory, readVersion)
  - packages/server/src/fhir/search.ts (searchImpl, getSelectQueryForSearch, buildSearchExpression, getSearchEntries)
  - packages/server/src/fhir/token-column.ts (buildTokenColumnsSearchFilter)
  - packages/server/src/fhir/sql.ts (SelectQuery, Condition, Disjunction, etc.)
parent_workflow: WF-REPO-001
related_workflows:
  - WF-REPO-003 (Compartment & Access Control — 安全过滤)
  - WF-MIG-003 (Search Parameter Mapping — 索引对应)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 读取单个资源 (readResource)

### 调用链

```
readResource(resourceType, id, options?)
  │
  ├─ rateLimiter?.recordRead()
  │
  └─ readResourceImpl(resourceType, id, options)
       │
       ├─ 验证 id 是 UUID
       ├─ validateResourceType(resourceType)
       ├─ supportsInteraction(READ, resourceType)
       │
       ├─ [Redis 缓存] getCacheEntry(resourceType, id)
       │    ├─ [事务中] → 返回 undefined（不读缓存）
       │    └─ [非事务] → getRedis().get('{ResourceType}/{id}')
       │         ├─ [命中] canPerformInteraction(READ, cached)?
       │         │    → 返回缓存资源
       │         └─ [未命中] → 继续
       │
       ├─ [checkCacheOnly] → throw notFound
       │
       └─ readResourceFromDatabase(resourceType, id)
            │
            ├─ SELECT content, deleted FROM "{ResourceType}"
            │  WHERE id = $1
            │  AND [安全过滤] ← addSecurityFilters()
            │
            ├─ [0 rows] → throw notFound
            ├─ [deleted = true] → throw gone
            │
            ├─ resource = JSON.parse(rows[0].content)
            ├─ setCacheEntry(resource)  // 写入 Redis
            └─ return resource
```

**关键**：读取只查询 `content` 和 `deleted` 两列，不需要 JOIN Lookup 表。资源的完整数据存储在 `content` 列中。

---

## 2. 搜索资源 (search → searchImpl)

### 2.1 总体流程

```
search(searchRequest, options?)
  │
  ├─ rateLimiter?.recordSearch()
  │
  └─ searchImpl(repo, searchRequest, options)
       │
       ├─ validateSearchResourceTypes(repo, searchRequest)
       ├─ applyCountAndOffsetLimits(searchRequest)
       │
       ├─ [count > 0] getSelectQueryForSearch(repo, searchRequest)
       │    → 构建 SelectQuery
       │
       ├─ getSearchEntries(repo, searchRequest, builder)
       │    ├─ builder.execute(getDatabaseClient(READER))
       │    ├─ for each row: JSON.parse(row.content)
       │    ├─ removeHiddenFields()
       │    ├─ [_elements] subsetResource()
       │    └─ 处理 _include / _revinclude
       │
       ├─ [total=accurate|estimate] getCount(repo, searchRequest)
       │
       └─ 构建 Bundle { type: 'searchset', entry, total, link }
```

### 2.2 SQL 查询构建 (getSelectQueryForSearch)

```
getSelectQueryForSearch(repo, searchRequest, options?)
  │
  ├─ new SelectQuery(resourceType)
  │    .column('id').column('content')
  │
  ├─ repo.addDeletedFilter(builder)
  │    → WHERE deleted = false
  │
  ├─ repo.addSecurityFilters(builder, resourceType)
  │    ├─ addProjectFilters()    → WHERE projectId IN (...)
  │    └─ addAccessPolicyFilters() → WHERE (compartment OR criteria)
  │
  ├─ buildSearchExpression(repo, builder, resourceType, searchRequest)
  │    → 将 FHIR 搜索参数转为 SQL WHERE 条件
  │    → 详见 §3
  │
  ├─ addSortRules(builder, searchRequest)
  │    → ORDER BY 子句
  │
  └─ .limit(count + 1).offset(offset)
       → 多取一条用于判断是否有下一页
```

---

## 3. 搜索参数 → SQL WHERE 条件

### 3.1 策略分发

```
buildSearchExpression(repo, builder, resourceType, searchRequest)
  │
  └─ for each filter in searchRequest.filters:
       │
       ├─ getSearchParameterImplementation(resourceType, searchParam)
       │
       ├─ [TOKEN-COLUMN 策略]
       │    → buildTokenColumnsSearchFilter()
       │    → 详见 §3.2
       │
       ├─ [LOOKUP-TABLE 策略]
       │    → buildLookupTableCondition()
       │    → 详见 §3.3
       │
       └─ [COLUMN 策略]
            → buildColumnCondition()
            → 详见 §3.4
```

### 3.2 TOKEN-COLUMN 搜索

```sql
-- 精确匹配: GET /Patient?identifier=http://example.com|12345
-- 1. 计算哈希: v5('http://example.com\x0112345', NIL) → 'abc-uuid'
-- 2. SQL:
WHERE "__identifier" @> ARRAY['abc-uuid']::UUID[]

-- 文本搜索: GET /Patient?name:text=john
-- SQL (使用 token_array_to_text 函数 + 正则):
WHERE token_array_to_text("__nameText") ~* '\x03[^\x03]*john'

-- 缺失检查: GET /Patient?identifier:missing=true
-- 专用列:
WHERE cardinality("__identifier") = 0
-- 共享列:
WHERE NOT ("__sharedTokens" @> ARRAY[v5('identifier')]::UUID[])
```

### 3.3 LOOKUP-TABLE 搜索

```sql
-- 姓名搜索: GET /Patient?name=Smith
-- JOIN HumanName 表:
WHERE "Patient".id IN (
  SELECT "resourceId" FROM "HumanName"
  WHERE to_tsvector('simple', "name") @@ to_tsquery('simple', 'Smith:*')
)

-- 地址搜索: GET /Patient?address=123 Main St
-- JOIN Address 表:
WHERE "Patient".id IN (
  SELECT "resourceId" FROM "Address"
  WHERE to_tsvector('simple', "address") @@ to_tsquery('simple', '123 & Main & St:*')
)

-- 引用搜索 (_revinclude): 
-- JOIN {ResourceType}_References 表:
WHERE "Patient".id IN (
  SELECT "targetId" FROM "Observation_References"
  WHERE "code" = 'subject'
)
```

### 3.4 COLUMN 搜索

```sql
-- 日期搜索: GET /Patient?birthdate=1990-01-01
WHERE "birthdate" = '1990-01-01'

-- 日期范围: GET /Observation?date=ge2024-01-01&date=le2024-12-31
WHERE "date" >= '2024-01-01T00:00:00Z' AND "date" <= '2024-12-31T23:59:59Z'

-- 字符串搜索: GET /Patient?family=Smith
WHERE "family" LIKE 'Smith%'    -- 默认前缀匹配

-- 字符串精确: GET /Patient?family:exact=Smith
WHERE "family" = 'Smith'

-- 字符串包含: GET /Patient?family:contains=mit
WHERE "family" LIKE '%mit%'

-- 引用搜索: GET /Observation?subject=Patient/123
WHERE "subject" = 'Patient/123'

-- 数组列: GET /Condition?code=http://snomed.info/sct|123456
WHERE "code" @> ARRAY['http://snomed.info/sct|123456']

-- 布尔搜索: GET /Patient?active=true
WHERE "active" = true

-- 数量搜索: GET /Observation?value-quantity=98.6
WHERE "valueQuantity" = 98.6
```

---

## 4. 排序 (ORDER BY)

```ts
// 默认排序：lastUpdated DESC
// 用户指定排序：_sort=birthdate,-name

// COLUMN 策略:
ORDER BY "birthdate" ASC

// TOKEN-COLUMN 策略:
ORDER BY "__codeSort" ASC   // 使用排序列

// LOOKUP-TABLE 策略 (HumanName):
ORDER BY "__nameSort" ASC   // 使用主表上的排序列
```

---

## 5. 分页

### Offset 分页（默认）

```sql
SELECT id, content FROM "Patient"
WHERE ...
ORDER BY "lastUpdated" DESC
LIMIT 21        -- count + 1（多取一条判断是否有下一页）
OFFSET 0
```

### Cursor 分页

```ts
// Cursor 格式 (v2):
{
  version: '2',
  nextInstant: '2024-01-15T10:30:00Z',  // 上一页最后一条的 lastUpdated
  excludedIds?: ['id1', 'id2']           // 相同 lastUpdated 的已返回 ID
}

// SQL:
WHERE "lastUpdated" < '2024-01-15T10:30:00Z'
   OR ("lastUpdated" = '2024-01-15T10:30:00Z' AND "id" NOT IN ('id1', 'id2'))
ORDER BY "lastUpdated" DESC
LIMIT 21
```

### 分页限制

```ts
// maxSearchOffset: 配置项，限制最大偏移量
// minCursorBasedSearchPageSize: 20（cursor 分页最小页大小）
// DEFAULT_SEARCH_COUNT: 20
// DEFAULT_MAX_SEARCH_COUNT: 1000
```

---

## 6. _include / _revinclude

```
getSearchEntries(repo, searchRequest, builder)
  │
  ├─ 执行主查询 → 获取主资源列表
  │
  ├─ [_include] 正向包含
  │    → 从主资源的引用字段中提取目标 ID
  │    → repo.readReferences(references)
  │    → 加入 entry（search.mode = 'include'）
  │
  └─ [_revinclude] 反向包含
       → 查询引用了主资源的其他资源
       → SELECT FROM "{TargetType}" WHERE "{refColumn}" IN (主资源ID列表)
       → 加入 entry（search.mode = 'include'）
```

---

## 7. 历史查询 (readHistory)

```sql
-- GET /Patient/123/_history
SELECT "versionId", "id", "content", "lastUpdated"
FROM "Patient_History"
WHERE "id" = '123'
ORDER BY "lastUpdated" DESC
LIMIT 100 OFFSET 0

-- 同时查询总数:
SELECT COUNT(*)::int AS "count"
FROM "Patient_History"
WHERE "id" = '123'
```

**注意**：History 查询不经过安全过滤（已在 `readResourceImpl` 中验证过权限）。

---

## 8. 版本读取 (readVersion)

```sql
-- GET /Patient/123/_history/456
SELECT "content"
FROM "Patient_History"
WHERE "id" = '123' AND "versionId" = '456'
```

---

## 9. Reader vs Writer 模式

```ts
// repo.ts:2383-2394
getDatabaseClient(mode: DatabaseMode): Pool | PoolClient {
  if (this.conn) {
    return this.conn;  // 事务中：使用事务连接
  }
  if (mode === DatabaseMode.WRITER) {
    this.mode = RepositoryMode.WRITER;  // 一旦用过 writer，后续都用 writer
  }
  return getDatabasePool(this.mode === RepositoryMode.WRITER ? DatabaseMode.WRITER : mode);
}
```

**读写分离**：
- **读操作**默认使用 READER 连接池（可指向只读副本）
- **写操作**使用 WRITER 连接池（主库）
- 一旦 Repository 执行过写操作，后续所有操作都使用 WRITER（避免复制延迟导致的不一致）

---

## 10. 完整搜索 SQL 示例

```sql
-- GET /Observation?subject=Patient/123&code=http://loinc.org|8867-4&date=ge2024-01-01&_sort=-date&_count=20

SELECT "id", "content"
FROM "Observation"
WHERE
  "deleted" = false
  AND "projectId" IN ('proj-1', 'r4-project-id')
  AND "subject" = 'Patient/123'
  AND "__code" @> ARRAY['<v5-hash-of-loinc|8867-4>']::UUID[]
  AND "date" >= '2024-01-01T00:00:00Z'
ORDER BY "date" DESC
LIMIT 21
OFFSET 0
```

---

## 11. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 读取方式？ | SELECT content → JSON.parse | 简单高效，无需 JOIN |
| 搜索引擎？ | PostgreSQL 原生（btree/gin/tsvector/trigram） | 足够强大，无需 Elasticsearch |
| 读写分离？ | READER/WRITER 连接池 | 建议保留，支持只读副本 |
| 分页方式？ | Offset + Cursor | Cursor 更适合大数据集 |
| _include？ | 主查询后批量读取引用 | 可优化为 JOIN，但当前方案更简单 |
| _revinclude？ | 子查询 WHERE IN | 依赖 References 表的索引 |
| 总数查询？ | 可选 accurate/estimate | estimate 使用 PostgreSQL 统计信息 |
| 链式搜索？ | 子查询嵌套 | 复杂但符合 FHIR 规范 |
