# Phase 13: Search Execution Layer — Detailed Plan

```yaml
status: Planning
estimated_duration: 5-8 days
complexity: High
risk: Medium
depends_on: Phase 12 ✅ (SearchParameter Index Layer)
packages:
  - packages/fhir-persistence (extends — search executor)
  - packages/fhir-server (extends — search routes)
```

---

## Overview

Phase 13 bridges the gap between Phase 12's SQL generation layer and the HTTP API. It executes search SQL against PostgreSQL, builds FHIR `Bundle` (type `searchset`) responses, and exposes search via Fastify routes.

### What Phase 12 Already Provides

- `parseSearchRequest()` — URL query → `SearchRequest`
- `buildSearchSQL()` — `SearchRequest` → parameterized SQL + values
- `buildCountSQL()` — `SearchRequest` → COUNT query
- `buildWhereClause()` — composable WHERE fragments
- `SearchParameterRegistry` — parameter → column mapping
- All 6 FHIR search types: string, date, number, reference, uri, token
- Modifiers: `:missing`, `:exact`, `:contains`, `:not`
- Prefixes: eq, ne, lt, gt, le, ge, sa, eb, ap (with ±10%/±1day BETWEEN)
- `_count`, `_offset`, `_sort`, `_total` parsing

### What Phase 13 Adds

1. **Search Executor** — execute SQL, map rows to resources
2. **SearchSet Bundle Builder** — FHIR Bundle (type `searchset`) with pagination links
3. **Repository Interface Extension** — `searchResources()` method
4. **HTTP Search Routes** — `GET /:resourceType` + `POST /:resourceType/_search`
5. **Integration Tests** — end-to-end search through HTTP

---

## Architecture

```
HTTP Request
  │
  ▼
[Fastify Route]  GET /Patient?gender=male&_count=10
  │
  ▼
[parseSearchRequest()]  → SearchRequest { resourceType, params, count, sort, ... }
  │
  ▼
[FhirRepository.searchResources()]
  │
  ├─ [buildSearchSQL()]  → { sql, values }
  │    │
  │    ▼
  │  [DatabaseClient.query()]  → rows[]
  │    │
  │    ▼
  │  [mapRowsToResources()]  → PersistedResource[]
  │
  ├─ [buildCountSQL()]  → { sql, values }  (if _total=accurate)
  │    │
  │    ▼
  │  [DatabaseClient.query()]  → { count: number }
  │
  ▼
[buildSearchBundle()]  → Bundle { type: searchset, entry[], total?, link[] }
  │
  ▼
HTTP Response (200, application/fhir+json)
```

---

## Tasks

### Task 13.1: SearchSet Bundle Builder

**Package:** `packages/fhir-persistence`  
**File:** `src/search/search-bundle.ts`  
**Tests:** `src/__tests__/search/search-bundle.test.ts`

Build a FHIR R4 Bundle of type `searchset` from search results.

```typescript
export interface SearchBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'searchset';
  total?: number;
  link?: BundleLink[];
  entry?: SearchBundleEntry[];
}

export interface SearchBundleEntry {
  fullUrl?: string;
  resource: Record<string, unknown>;
  search?: {
    mode: 'match' | 'include' | 'outcome';
  };
}

export interface BuildSearchBundleOptions {
  baseUrl?: string;
  total?: number;
  selfUrl?: string;
  nextUrl?: string;
}

export function buildSearchBundle(
  resources: PersistedResource[],
  options?: BuildSearchBundleOptions,
): SearchBundle;
```

**Key Points:**
- Pattern mirrors `buildHistoryBundle()` from Phase 10
- Each entry has `search.mode = 'match'`
- `fullUrl` = `{baseUrl}/{resourceType}/{id}`
- `Bundle.id` = `randomUUID()`
- `total` only included when `_total=accurate` is requested
- `link` includes `self` and optionally `next` for pagination

**Tests (15+):**
- Empty results → Bundle with no entry
- Single resource → correct entry structure
- Multiple resources → correct count
- `total` override
- `selfUrl` / `nextUrl` links
- `fullUrl` construction with baseUrl
- `search.mode = 'match'` on all entries
- Bundle `id` is UUID
- Bundle `type` is `searchset`
- Omits entry array when empty
- Omits link when no URLs
- Both self and next links
- Mixed resource types (if applicable)
- Large result set (100 entries)
- Entry resource content preserved

---

### Task 13.2: Search Executor (Repository Extension)

**Package:** `packages/fhir-persistence`  
**Files:**
- `src/repo/types.ts` — extend `ResourceRepository` interface
- `src/repo/fhir-repo.ts` — implement `searchResources()`
- `src/search/search-executor.ts` — pure search execution logic

**Tests:** `src/__tests__/search/search-executor.test.ts`

Extend the repository with search capability.

```typescript
// Added to ResourceRepository interface
export interface SearchOptions {
  /** Whether to include total count. */
  total?: 'none' | 'estimate' | 'accurate';
}

export interface SearchResult {
  resources: PersistedResource[];
  total?: number;
}

// New method on ResourceRepository
searchResources(
  request: SearchRequest,
  registry: SearchParameterRegistry,
  options?: SearchOptions,
): Promise<SearchResult>;
```

**Implementation (search-executor.ts):**

```typescript
export async function executeSearch(
  db: DatabaseClient,
  request: SearchRequest,
  registry: SearchParameterRegistry,
  options?: SearchOptions,
): Promise<SearchResult> {
  // 1. Build and execute search SQL
  const searchSQL = buildSearchSQL(request, registry);
  const { rows } = await db.query(searchSQL.sql, searchSQL.values);

  // 2. Map rows to PersistedResource[]
  const resources = rows
    .filter((row) => !row.deleted)
    .map((row) => JSON.parse(row.content) as PersistedResource);

  // 3. Optionally get total count
  let total: number | undefined;
  if (options?.total === 'accurate') {
    const countSQL = buildCountSQL(request, registry);
    const countResult = await db.query(countSQL.sql, countSQL.values);
    total = parseInt(countResult.rows[0]?.count ?? '0', 10);
  }

  return { resources, total };
}
```

**Key Points:**
- `executeSearch()` is a pure function (takes `DatabaseClient`, returns `SearchResult`)
- `FhirRepository.searchResources()` delegates to `executeSearch()`
- Row mapping: `JSON.parse(row.content)` → `PersistedResource`
- Deleted rows filtered (should already be filtered by WHERE, but defense-in-depth)
- Count query only executed when `_total=accurate`

**Tests (15+):**
- Unit tests with mock DatabaseClient
- Basic search returns resources
- Empty result set
- `_total=accurate` triggers count query
- `_total=none` skips count query
- Row content parsing
- Deleted row filtering
- Multiple resources returned
- Search with params produces correct SQL call
- Search with _count limits results
- Search with _offset skips results
- Search with _sort orders results
- Error propagation from DB
- Registry parameter resolution
- Unknown params gracefully handled

---

### Task 13.3: Pagination Helper

**Package:** `packages/fhir-persistence`  
**File:** `src/search/pagination.ts`  
**Tests:** `src/__tests__/search/pagination.test.ts`

Build pagination URLs for search Bundle links.

```typescript
export interface PaginationContext {
  baseUrl: string;
  resourceType: string;
  queryParams: Record<string, string | string[]>;
  count: number;
  offset: number;
  totalResults: number;
}

export function buildSelfLink(ctx: PaginationContext): string;
export function buildNextLink(ctx: PaginationContext): string | undefined;
export function hasNextPage(ctx: PaginationContext): boolean;
```

**Key Points:**
- Self link preserves all original query parameters
- Next link increments `_offset` by `_count`
- No next link if current page has fewer results than `_count`
- URL encoding for parameter values

**Tests (15+):**
- Self link with no params
- Self link with search params
- Self link with _count and _offset
- Next link when more results exist
- No next link on last page
- No next link when results < count
- hasNextPage true/false cases
- URL encoding of special characters
- Multiple parameter values
- _sort preserved in links
- _total preserved in links
- Offset calculation correctness
- Edge case: offset = 0
- Edge case: count = 0
- Large offset values

---

### Task 13.4: Search HTTP Routes

**Package:** `packages/fhir-server`  
**File:** `src/routes/search-routes.ts`  
**Tests:** `src/__tests__/search.test.ts`

Add search endpoints to the Fastify server.

```typescript
// GET /:resourceType — search via query string
// POST /:resourceType/_search — search via form body
```

**Implementation:**

```typescript
export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = (fastify as any).repo as ResourceRepository;
  const registry = (fastify as any).searchRegistry as SearchParameterRegistry;

  // GET /:resourceType (search)
  fastify.get<{ Params: { resourceType: string }; Querystring: Record<string, string> }>(
    '/:resourceType',
    async (request, reply) => {
      const { resourceType } = request.params;
      const searchRequest = parseSearchRequest(resourceType, request.query, registry);
      const result = await repo.searchResources(searchRequest, registry, {
        total: searchRequest.total,
      });
      const baseUrl = getBaseUrl(request);
      const bundle = buildSearchBundle(result.resources, {
        baseUrl,
        total: result.total,
        selfUrl: buildSelfLink(...),
        nextUrl: buildNextLink(...),
      });
      reply.header('content-type', FHIR_JSON);
      return bundle;
    },
  );

  // POST /:resourceType/_search (form-encoded search)
  fastify.post<{ Params: { resourceType: string }; Body: Record<string, string> }>(
    '/:resourceType/_search',
    async (request, reply) => {
      // Same logic, but params from request.body
    },
  );
}
```

**Key Points:**
- GET search uses query string parameters
- POST _search uses form-encoded body parameters
- Both delegate to same search logic
- `SearchParameterRegistry` must be decorated on Fastify instance
- Unknown parameters return OperationOutcome (400)
- Empty search returns all resources (with default _count=20)

**Route Registration in app.ts:**
- `app.decorate('searchRegistry', registry)` alongside existing `repo` decoration
- Register `searchRoutes` after `resourceRoutes`
- Search route `GET /:resourceType` must be registered BEFORE the CRUD `GET /:resourceType/:id` to avoid conflicts — OR use a route prefix strategy

**Route Conflict Resolution:**
- Fastify parametric routes: `GET /:resourceType` (search) vs `GET /:resourceType/:id` (read)
- These don't conflict because Fastify distinguishes by segment count
- `GET /Patient` → search route (1 segment)
- `GET /Patient/123` → read route (2 segments)

**Tests (20+):**
- GET search with no params → returns Bundle
- GET search with gender=male → filtered results
- GET search with multiple params (AND)
- GET search with multiple values (OR)
- GET search with _count → limited results
- GET search with _sort → ordered results
- GET search with _total=accurate → includes total
- GET search with unknown param → 400 OperationOutcome
- POST _search with form body
- POST _search mirrors GET behavior
- Empty result → Bundle with no entries
- Response content-type is application/fhir+json
- Bundle type is searchset
- Bundle has self link
- Bundle has next link when paginated
- _offset pagination works
- String search with :exact modifier
- Date search with ge prefix
- Token search with :not modifier
- :missing modifier works
- Search on non-existent resource type → appropriate error

---

### Task 13.5: App Integration & Registry Wiring

**Package:** `packages/fhir-server`  
**File:** `src/app.ts` (modify)

Wire the `SearchParameterRegistry` into the Fastify app.

```typescript
export interface AppOptions {
  repo: ResourceRepository;
  searchRegistry?: SearchParameterRegistry;  // NEW
  logger?: boolean;
  baseUrl?: string;
}
```

**Key Points:**
- `SearchParameterRegistry` is optional (search disabled if not provided)
- Decorated on Fastify instance as `searchRegistry`
- Search routes only registered when registry is provided
- Content-type parser for `application/x-www-form-urlencoded` (for POST _search)

---

## Acceptance Criteria

- [ ] `GET /:resourceType` returns searchset Bundle
- [ ] `POST /:resourceType/_search` returns searchset Bundle
- [ ] All 6 parameter types work (string, date, number, reference, uri, token)
- [ ] Multiple values (OR) and multiple parameters (AND) work
- [ ] `_count` limits results
- [ ] `_offset` pagination works
- [ ] `_sort` orders results
- [ ] `_total=accurate` returns total count
- [ ] Pagination links (self, next) are correct
- [ ] Unknown parameters return 400 OperationOutcome
- [ ] 75+ new tests passing
- [ ] 0 TypeScript errors
- [ ] 0 regressions in existing tests

---

## Test Summary

| Task | File | Target Tests |
|------|------|-------------|
| 13.1 | `search-bundle.test.ts` | 15+ |
| 13.2 | `search-executor.test.ts` | 15+ |
| 13.3 | `pagination.test.ts` | 15+ |
| 13.4 | `search.test.ts` | 20+ |
| **Total** | | **65+** |

---

## File Plan

### New Files

| File | Package | Purpose |
|------|---------|---------|
| `src/search/search-bundle.ts` | fhir-persistence | SearchSet Bundle builder |
| `src/search/pagination.ts` | fhir-persistence | Pagination URL helpers |
| `src/search/search-executor.ts` | fhir-persistence | SQL execution + row mapping |
| `src/routes/search-routes.ts` | fhir-server | HTTP search endpoints |
| `src/__tests__/search/search-bundle.test.ts` | fhir-persistence | Bundle builder tests |
| `src/__tests__/search/pagination.test.ts` | fhir-persistence | Pagination tests |
| `src/__tests__/search/search-executor.test.ts` | fhir-persistence | Executor tests |
| `src/__tests__/search.test.ts` | fhir-server | HTTP search tests |

### Modified Files

| File | Package | Changes |
|------|---------|---------|
| `src/repo/types.ts` | fhir-persistence | Add `searchResources()` to `ResourceRepository` |
| `src/repo/fhir-repo.ts` | fhir-persistence | Implement `searchResources()` |
| `src/search/index.ts` | fhir-persistence | Export new modules |
| `src/index.ts` | fhir-persistence | Export new types and functions |
| `src/app.ts` | fhir-server | Wire `SearchParameterRegistry`, register search routes |

---

## Execution Order

```
Task 13.1  →  SearchSet Bundle Builder (pure, no DB)
Task 13.3  →  Pagination Helper (pure, no DB)
Task 13.2  →  Search Executor (needs DB mock)
Task 13.5  →  App Integration (wiring)
Task 13.4  →  HTTP Search Routes (needs all above)
```

Tasks 13.1 and 13.3 can be done in parallel (both pure functions).

---

## Dependencies from Phase 12

| Component | Status | Used By |
|-----------|--------|---------|
| `parseSearchRequest()` | ✅ | Task 13.4 (routes) |
| `buildSearchSQL()` | ✅ | Task 13.2 (executor) |
| `buildCountSQL()` | ✅ | Task 13.2 (executor) |
| `SearchParameterRegistry` | ✅ | Task 13.2, 13.4, 13.5 |
| `SearchRequest` type | ✅ | All tasks |
| `DEFAULT_SEARCH_COUNT` | ✅ | Task 13.3 (pagination) |
| `MAX_SEARCH_COUNT` | ✅ | Task 13.3 (pagination) |

---

## Deferred to Phase 14+

| Feature | Reason |
|---------|--------|
| Chained search (`subject.name=Smith`) | Requires multi-table JOIN infrastructure |
| `_include` / `_revinclude` | Requires secondary queries + Bundle assembly |
| Composite parameters | Complex multi-column matching |
| `_has` reverse chaining | Requires subquery generation |
| `_filter` expression | Requires expression parser |
| `_summary` / `_elements` | Requires response projection |
| lookup-table JOIN strategy | Requires JOIN clause generation in SQL builder |

---

## Risk Mitigation

1. **Route conflict (search vs read)** — Fastify handles `/:resourceType` vs `/:resourceType/:id` by segment count. Verified in Fastify v5 docs.
2. **SQL injection** — All queries use `$N` parameterized placeholders (inherited from Phase 12).
3. **Performance** — Default `_count=20`, `MAX_SEARCH_COUNT=1000`. No unbounded queries.
4. **Registry availability** — Search routes only registered when `SearchParameterRegistry` is provided. Graceful degradation.
