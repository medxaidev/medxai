# Phase 10: History Mechanism — Detailed Plan

```yaml
status: ✅ Completed
completed: 2026-02-23
duration: 1 day (actual)
complexity: Medium
risk: Low
depends_on: Phase 9 ✅
tests: 41 new tests (26 unit + 15 integration)
total_tests_after: 301/301 passing
```

---

## Overview

Phase 10 extends the persistence layer with FHIR-compliant history operations:

- **Instance history** — all versions of a single resource, with `_since` / `_count` / cursor filtering
- **Type-level history** — all changes to a resource type
- **History Bundle construction** — FHIR R4 Bundle type `history` with proper entries
- **Delete entries** — appear in history as `method=DELETE`, `resource=null`
- **Cursor-based pagination** — `lastUpdated < cursor` for stable page traversal

> **Scope adjustment vs. original plan:** `readSystemHistory()` (UNION across all 146 resource types)
> was deferred to Phase 11 or later. The system-level endpoint requires HTTP routing context
> (`GET /_history`) which belongs in the server layer. The persistence layer provides
> `readTypeHistory()` as the building block; the server layer will compose it.

### What Was Already Done (Phase 9)

- `FhirRepository.readHistory(resourceType, id)` — returned `PersistedResource[]`
- `FhirRepository.readVersion(resourceType, id, versionId)` — reads specific version
- History table indexes: `id` btree + `lastUpdated` btree on every `_History` table

### What Phase 10 Added

| Item                        | File                     | Description                                                                                            |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `HistoryOptions`            | `repo/types.ts`          | `_since`, `_count`, `cursor` parameters                                                                |
| `HistoryEntry`              | `repo/types.ts`          | Replaces `PersistedResource` in history results; includes `deleted`, `versionId`, `id`, `resourceType` |
| `buildInstanceHistorySQL()` | `repo/sql-builder.ts`    | Instance history with optional filters                                                                 |
| `buildTypeHistorySQL()`     | `repo/sql-builder.ts`    | Type-level history with optional filters                                                               |
| `buildHistoryBundle()`      | `repo/history-bundle.ts` | Pure function: `HistoryEntry[]` → FHIR Bundle                                                          |
| `readHistory()` (updated)   | `repo/fhir-repo.ts`      | Now returns `HistoryEntry[]`, accepts `HistoryOptions`                                                 |
| `readTypeHistory()`         | `repo/fhir-repo.ts`      | New method: type-level history                                                                         |

---

## Task Breakdown — Actual Implementation

### Task 10.1: History Types & SQL Extensions ✅

**`HistoryOptions` interface** (`repo/types.ts`):

```typescript
interface HistoryOptions {
  since?: string; // _since: >= filter on lastUpdated
  count?: number; // _count: LIMIT
  cursor?: string; // pagination: < filter on lastUpdated (strictly before)
}
```

**`HistoryEntry` interface** (`repo/types.ts`):

```typescript
interface HistoryEntry {
  resource: PersistedResource | null; // null for delete entries
  versionId: string;
  lastUpdated: string;
  deleted: boolean;
  resourceType: string;
  id: string;
}
```

**Design decision:** `readHistory()` return type changed from `PersistedResource[]` to
`HistoryEntry[]`. This is a **breaking change** from Phase 9, but necessary because:

1. Delete entries have no resource content — `PersistedResource` cannot represent them
2. FHIR history bundles need `versionId`, `deleted`, `resourceType` at the entry level
3. Callers no longer need to parse `meta.versionId` from the resource JSON

**SQL builders** (`repo/sql-builder.ts`):

- `buildInstanceHistorySQL(tableName, resourceId, options?)` — returns `{ sql, values }`
- `buildTypeHistorySQL(tableName, options?)` — returns `{ sql, values }`
- Both select: `"id"`, `"versionId"`, `"lastUpdated"`, `"content"`
- `_since` → `"lastUpdated" >= $N`
- `cursor` → `"lastUpdated" < $N` (strictly before, for stable pagination)
- `count` → `LIMIT $N`

### Task 10.2: History Bundle Construction ✅

**`buildHistoryBundle(entries, options?)`** (`repo/history-bundle.ts`):

```typescript
function buildHistoryBundle(
  entries: HistoryEntry[],
  options?: BuildHistoryBundleOptions,
): HistoryBundle;
```

- Pure function — no database dependency, fully unit-testable
- `Bundle.type = "history"`
- `Bundle.total` = `entries.length` (or `options.total` override for paginated results)
- Each entry has `request` (method + URL) and `response` (status + ETag + lastModified)
- Delete entries: `method = "DELETE"`, `status = "204"`, no `resource`
- Non-delete entries: `method = "PUT"` (or `"POST"` for oldest), `status = "200"`, `resource` included
- `Bundle.link` populated when `selfUrl` or `nextUrl` provided
- `fullUrl` populated when `baseUrl` provided

**ETag format:** `W/"versionId"` (weak validator, per FHIR R4 spec)

### Task 10.3: FhirRepository History Extensions ✅

**`readHistory()` updated signature:**

```typescript
readHistory(
  resourceType: string,
  id: string,
  options?: HistoryOptions,
): Promise<HistoryEntry[]>
```

- Now includes delete entries (`deleted=true`, `resource=null`)
- Ordered newest first (`ORDER BY "lastUpdated" DESC`)
- Supports `_since`, `_count`, cursor pagination

**`readTypeHistory()` new method:**

```typescript
readTypeHistory(
  resourceType: string,
  options?: HistoryOptions,
): Promise<HistoryEntry[]>
```

- Queries `"{resourceType}_History"` without `id` filter
- Same ordering and filtering as instance history

**`toHistoryEntry()` internal helper** (`repo/fhir-repo.ts`):

- Converts raw DB row `{ id, versionId, lastUpdated, content }` to `HistoryEntry`
- Handles `content = ''` → `deleted=true`, `resource=null`
- Handles PostgreSQL `Date` objects in `lastUpdated` → ISO string conversion

### Task 10.4: Tests ✅

| File                                      | Tests | Coverage                                                                                        |
| ----------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `repo/history-sql-builder.test.ts`        | 12    | `buildInstanceHistorySQL` + `buildTypeHistorySQL` with all option combinations                  |
| `repo/history-bundle.test.ts`             | 14    | Bundle structure, delete entries, links, ETag format, fullUrl                                   |
| `integration/history-integration.test.ts` | 15    | Instance history with options, type-level history, bundle integration, `HistoryEntry` structure |

---

## Design Decisions

### 1. `HistoryEntry` replaces `PersistedResource` in history results

**Why:** Delete entries have `content = ''` — they cannot be represented as `PersistedResource`.
The `HistoryEntry` wrapper makes delete markers first-class, matching FHIR spec behavior
where history includes all interactions including deletions.

### 2. Cursor pagination uses `lastUpdated < cursor` (strict less-than)

**Why:** Avoids re-fetching the last entry of the previous page. The cursor value is the
`lastUpdated` of the last entry returned. The next page starts strictly before that timestamp.

**Limitation:** If two entries share the exact same `lastUpdated` millisecond, they may be
split across pages. This is acceptable for Phase 10 MVP; a tie-breaking secondary sort
(e.g., `versionId`) can be added in Phase 13.

### 3. `readSystemHistory()` deferred

**Why:** System-level history (`GET /_history`) requires querying all 146 resource type
history tables. This is architecturally a server-layer concern (HTTP routing + response
assembly), not a pure persistence concern. The server layer (Phase 11) will implement
`GET /_history` by calling `readTypeHistory()` for each resource type and merging results.

### 4. `buildHistoryBundle()` is a pure function

**Why:** Separates bundle construction from data fetching. The server layer calls
`readHistory()` or `readTypeHistory()`, then passes the result to `buildHistoryBundle()`.
This makes bundle construction fully unit-testable without a database.

---

## Files Changed

| File                         | Change                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `src/repo/types.ts`          | Added `HistoryOptions`, `HistoryEntry`; updated `ResourceRepository` interface        |
| `src/repo/sql-builder.ts`    | Added `buildInstanceHistorySQL()`, `buildTypeHistorySQL()`, `HistorySQLOptions`       |
| `src/repo/history-bundle.ts` | **NEW** — `buildHistoryBundle()`, `HistoryBundle`, `HistoryBundleEntry`, `BundleLink` |
| `src/repo/fhir-repo.ts`      | Updated `readHistory()`, added `readTypeHistory()`, added `toHistoryEntry()` helper   |
| `src/repo/index.ts`          | Updated barrel exports                                                                |
| `src/index.ts`               | Updated package-level barrel exports                                                  |

---

## Test Results

```
✅ history-sql-builder.test.ts   12/12
✅ history-bundle.test.ts        14/14
✅ history-integration.test.ts   15/15
─────────────────────────────────────
   Phase 10 new tests:           41/41
   Total fhir-persistence:      301/301
```

---

## Acceptance Criteria — Final Status

- [x] Instance history returns correct ordered versions (newest first)
- [x] Specific version retrieval works (`readVersion`)
- [x] Type-level history works (`readTypeHistory`)
- [x] `_since` filtering works correctly
- [x] `_count` / cursor pagination works correctly
- [x] Deleted resources appear in history with `deleted=true`, `resource=null`
- [x] History bundles are valid FHIR R4 Bundles
- [x] ETag format: `W/"versionId"`
- [x] 35+ tests passing (actual: 41)
- [ ] System-level history (`readSystemHistory`) — **deferred to Phase 11 server layer**

---

## What Phase 11 Needs From Phase 10

Phase 11 (Server API) will use:

- `readHistory(resourceType, id, options?)` → instance history endpoint
- `readTypeHistory(resourceType, options?)` → type-level history endpoint
- `buildHistoryBundle(entries, options?)` → convert to HTTP response body
- `readVersion(resourceType, id, versionId)` → `GET /{type}/{id}/_history/{vid}`
- `HistoryOptions` → parsed from HTTP query params (`_since`, `_count`)
