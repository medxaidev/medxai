# Phase 12: SearchParameter Index Layer — Detailed Plan

```yaml
status: Pending
duration: 3-4 days (revised down from 6-8; Phase 8 completed most infrastructure)
complexity: Medium (revised down from High)
risk: Low
depends_on: Phase 8 ✅, Phase 11
package: packages/fhir-persistence (extends existing)
```

---

## Overview

Phase 12 builds the SQL WHERE clause generator for FHIR search parameters.
This is the bridge between the SearchParameter registry (Phase 8) and search execution (Phase 13).

### What's Already Done (Phase 8)

| Component | File | Status |
|-----------|------|--------|
| `SearchParameterRegistry` | `registry/search-parameter-registry.ts` | ✅ 460 lines |
| `SearchParameterImpl` type | `registry/search-parameter-registry.ts` | ✅ code, type, strategy, columnName, columnType |
| Strategy resolution | `registry/search-parameter-registry.ts` | ✅ column / token-column / lookup-table |
| Column type mapping | `registry/search-parameter-registry.ts` | ✅ 6 FHIR types → PostgreSQL types |
| Column name mapping | `registry/search-parameter-registry.ts` | ✅ hyphen → camelCase |
| DDL generation | `schema/table-schema-builder.ts` | ✅ ADD COLUMN IF NOT EXISTS |
| Index DDL generation | `schema/ddl-generator.ts` | ✅ CREATE INDEX IF NOT EXISTS |
| Registry tests | `__tests__/registry/search-parameter-registry.test.ts` | ✅ 18 tests |

### What Phase 12 Adds

| Component | File | Description |
|-----------|------|-------------|
| `SearchRequest` type | `search/types.ts` | Parsed search request with parameters |
| `parseSearchParams()` | `search/param-parser.ts` | Parse FHIR search URL query → structured params |
| `buildWhereClause()` | `search/where-builder.ts` | SearchParameter + value → SQL WHERE fragment |
| `buildSearchSQL()` | `search/search-sql-builder.ts` | Full SELECT with WHERE, ORDER BY, LIMIT |

> **Note:** Phase 12 does NOT implement search execution or HTTP endpoints.
> It only builds the SQL generation layer. Phase 13 adds the executor and routes.

---

## Task Breakdown

### Task 12.1: Search Types

**File:** `src/search/types.ts`

```typescript
interface SearchParameter {
  code: string;           // e.g., "gender"
  modifier?: string;      // e.g., "exact", "contains", "missing", "not"
  prefix?: SearchPrefix;  // e.g., "eq", "ne", "lt", "gt", "ge", "le"
  values: string[];       // e.g., ["male", "female"] (OR semantics)
}

type SearchPrefix = 'eq' | 'ne' | 'lt' | 'gt' | 'le' | 'ge' | 'sa' | 'eb' | 'ap';

interface SearchRequest {
  resourceType: string;
  params: SearchParameter[];
  count?: number;         // _count
  offset?: number;        // _offset (or cursor)
  sort?: SortRule[];      // _sort
  total?: 'none' | 'estimate' | 'accurate';  // _total
}

interface SortRule {
  code: string;
  descending: boolean;
}

interface WhereFragment {
  sql: string;            // e.g., '"gender" = $1'
  values: unknown[];      // e.g., ['male']
}
```

### Task 12.2: Search Parameter Parser

**File:** `src/search/param-parser.ts`

Parse FHIR search URL query string into `SearchParameter[]`:

```
?gender=male              → { code: "gender", values: ["male"] }
?gender=male,female       → { code: "gender", values: ["male", "female"] }  (OR)
?birthdate=ge1990-01-01   → { code: "birthdate", prefix: "ge", values: ["1990-01-01"] }
?name:exact=Smith         → { code: "name", modifier: "exact", values: ["Smith"] }
?active:missing=true      → { code: "active", modifier: "missing", values: ["true"] }
```

This reuses `SearchParameterRegistry.getImpl()` to validate parameter names.

### Task 12.3: WHERE Clause Builder

**File:** `src/search/where-builder.ts`

Core function: `buildWhereFragment(impl, param, startIndex) → WhereFragment`

**By SearchParameter type:**

| Type | Default Operator | Example SQL |
|------|-----------------|-------------|
| token | `= $N` | `"gender" = $1` |
| string | `ILIKE $N` | `"family" ILIKE $1` (value: `%Smith%`) |
| string:exact | `= $N` | `"family" = $1` |
| date | `= $N` (or prefix) | `"birthdate" >= $1` |
| reference | `= $N` | `"subject" = $1` |
| number | `= $N` (or prefix) | `"valueQuantity" >= $1` |
| uri | `= $N` | `"url" = $1` |

**Prefix handling:**

| Prefix | SQL Operator |
|--------|-------------|
| `eq` (default) | `=` |
| `ne` | `<>` |
| `lt` | `<` |
| `gt` | `>` |
| `le` | `<=` |
| `ge` | `>=` |

**Multiple values (OR):**
```sql
-- ?gender=male,female
("gender" = $1 OR "gender" = $2)
```

**Multiple parameters (AND):**
```sql
-- ?gender=male&active=true
"gender" = $1 AND "active" = $2
```

### Task 12.4: Search SQL Builder

**File:** `src/search/search-sql-builder.ts`

Compose full SELECT statement:

```typescript
function buildSearchSQL(
  resourceType: string,
  request: SearchRequest,
  registry: SearchParameterRegistry,
): { sql: string; values: unknown[] }
```

Output:
```sql
SELECT "id", "content", "lastUpdated", "deleted"
FROM "Patient"
WHERE "deleted" = false
  AND "gender" = $1
  AND "birthdate" >= $2
ORDER BY "lastUpdated" DESC
LIMIT $3
```

### Task 12.5: Tests (40+)

| File | Tests | Coverage |
|------|-------|---------|
| `search/types.test.ts` | 5 | Type validation |
| `search/param-parser.test.ts` | 12 | Query string parsing, prefixes, modifiers, OR values |
| `search/where-builder.test.ts` | 15 | All 6 types, prefixes, modifiers, OR/AND |
| `search/search-sql-builder.test.ts` | 10 | Full SQL generation, ORDER BY, LIMIT |

---

## Relationship to Existing Code

### Reused from Phase 8 (no changes needed)

- `SearchParameterRegistry` — parameter lookup by `(resourceType, code)`
- `SearchParameterImpl` — `columnName`, `columnType`, `strategy`, `type`
- `resolveStrategy()`, `resolveColumnType()`, `codeToColumnName()`

### New directory

```
fhir-persistence/src/search/     ← NEW
  ├── types.ts
  ├── param-parser.ts
  ├── where-builder.ts
  ├── search-sql-builder.ts
  └── index.ts
```

### No SQL regeneration needed

The existing DDL (schema.sql) already includes all search columns generated by Phase 8.
Phase 12 only reads these columns via WHERE clauses — it does not modify the schema.

---

## Acceptance Criteria

- [ ] `parseSearchParams()` handles all 6 parameter types
- [ ] `buildWhereFragment()` generates correct SQL for each type
- [ ] Prefix operators (`eq`, `ne`, `lt`, `gt`, `le`, `ge`) work correctly
- [ ] String modifier `:exact` and `:contains` work
- [ ] Multiple values produce OR clauses
- [ ] Multiple parameters produce AND clauses
- [ ] All queries use parameterized values (no SQL injection)
- [ ] `SearchParameterRegistry` from Phase 8 is reused without modification
- [ ] 40+ tests passing
- [ ] `tsc --noEmit` clean
