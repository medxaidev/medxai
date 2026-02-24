# Phase 16: \_include / \_revinclude & Reference Table Population — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 16 (Stage-3)  
**Completed:** 2026-02-24  
**Last Updated:** 2026-02-24  
**Depends On:** Phase 15 ✅ Complete (693 tests, 0 failures)  
**Final Results:** 723 tests passing (615 persistence + 108 server), 0 regressions, tsc clean, build clean

---

## Overview

Phase 16 implements **`_include`** and **`_revinclude`** — the FHIR search features
that allow clients to request related resources alongside primary search results.
This phase also completes the **Reference Table Population** (deferred from Phase 14
Task 14.5), which is a prerequisite for `_revinclude`.

**Chained search** (`subject:Patient.name=Smith`) is deferred to Phase 17 or
Stage-4 due to its very high complexity and the fact that `_include`/`_revinclude`
covers the most common clinical use cases.

### Current State

- Search works end-to-end for all 6 parameter types (Phase 14)
- Metadata search (`_tag`, `_security`, `_profile`, `_source`) works (Phase 15)
- Token enhancements (`system|code`, `:text`, `:not`) work (Phase 15)
- `{ResourceType}_References` tables exist in schema but are **never populated**
- `_include` and `_revinclude` are parsed by `param-parser.ts` but **silently skipped**
- `SearchBundleEntry.search.mode` already supports `'include'` type

### Phase 16 Goal

After this phase:

1. Reference tables are populated on every `create`/`update`
2. `_include` loads referenced resources and adds them to the Bundle
3. `_revinclude` loads resources that reference the primary results
4. Include results have `search.mode = 'include'` in the Bundle

---

## Architecture

### \_include Flow

```
GET /MedicationRequest?_include=MedicationRequest:patient
  ↓
1. Execute primary search → MedicationRequest[] (search.mode = 'match')
  ↓
2. Extract reference values from results:
   MedicationRequest.subject → "Patient/123"
  ↓
3. Load referenced resources by ID:
   SELECT * FROM "Patient" WHERE "id" = '123'
  ↓
4. Add to Bundle with search.mode = 'include'
```

### \_revinclude Flow

```
GET /Patient?_revinclude=Observation:subject
  ↓
1. Execute primary search → Patient[] (search.mode = 'match')
  ↓
2. Query References table for reverse references:
   SELECT * FROM "Observation_References"
   WHERE "targetId" IN (patient-ids) AND "code" = 'subject'
  ↓
3. Load referencing resources:
   SELECT * FROM "Observation" WHERE "id" IN (observation-ids)
  ↓
4. Add to Bundle with search.mode = 'include'
```

### \_include Parameter Syntax

```
_include = {source-type}:{search-param}
_include = {source-type}:{search-param}:{target-type}

Examples:
  _include=MedicationRequest:patient           → load Patient referenced by subject
  _include=Observation:subject:Patient         → load only Patient targets
  _include=*                                   → load all referenced resources (iterate)
```

### \_revinclude Parameter Syntax

```
_revinclude = {source-type}:{search-param}
_revinclude = {source-type}:{search-param}:{target-type}

Examples:
  _revinclude=Observation:subject              → load Observations referencing results
  _revinclude=MedicationRequest:patient:Patient → load MedicationRequests referencing Patient results
```

---

## Tasks

### Task 16.1: Reference Table Population (from Phase 14.5)

**File:** `packages/fhir-persistence/src/repo/reference-indexer.ts` (new)

On `create`/`update`, extract all Reference values from the resource JSON and
write to `{ResourceType}_References` table. On `update`, delete old references
first (replace strategy).

#### Reference Extraction Rules

| Source Field                   | Example                             | References Row                                                   |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------- |
| `Patient.managingOrganization` | `{ reference: "Organization/abc" }` | `resourceId=patient-id, targetId=abc, code=managingOrganization` |
| `Observation.subject`          | `{ reference: "Patient/123" }`      | `resourceId=obs-id, targetId=123, code=subject`                  |
| Array references               | `Account.subject[*]`                | One row per reference                                            |
| Display-only reference         | `{ display: "Dr. Smith" }`          | Skipped (no targetId)                                            |

#### Interface

```typescript
export interface ReferenceRow {
  resourceId: string;
  targetId: string;
  code: string;
}

export function extractReferences(resource: FhirResource): ReferenceRow[];
```

#### Integration into FhirRepository

- In `createResource()` and `updateResource()`: after main+history writes,
  INSERT reference rows into `{ResourceType}_References`
- In `deleteResource()`: DELETE reference rows for the resource
- Use `SearchParameterRegistry` to find reference-type params and their expressions

#### Tests (8)

**File:** `packages/fhir-persistence/src/__tests__/repo/reference-indexer.test.ts`

```
16.1-01: extract single reference (Patient.managingOrganization)
16.1-02: extract array references (Account.subject)
16.1-03: skip display-only reference (no reference URL)
16.1-04: skip empty/null reference fields
16.1-05: extract nested reference (Observation.subject)
16.1-06: multiple reference params produce multiple rows
16.1-07: relative reference "Patient/123" → targetId = "123"
16.1-08: absolute reference "http://example.com/Patient/123" → targetId = "123"
```

---

### Task 16.2: \_include / \_revinclude Parsing

**Files Modified:**

- `packages/fhir-persistence/src/search/types.ts`
- `packages/fhir-persistence/src/search/param-parser.ts`

#### Type Changes

Add `_include` and `_revinclude` fields to `SearchRequest`:

```typescript
export interface IncludeTarget {
  resourceType: string; // Source resource type (e.g., "MedicationRequest")
  searchParam: string; // Search parameter code (e.g., "patient")
  targetType?: string; // Optional target type filter (e.g., "Patient")
}

export interface SearchRequest {
  // ... existing fields ...
  include?: IncludeTarget[];
  revinclude?: IncludeTarget[];
}
```

#### Parser Changes

In `processQueryParam()`, parse `_include` and `_revinclude` values:

```typescript
// _include=MedicationRequest:patient → { resourceType: "MedicationRequest", searchParam: "patient" }
// _include=Observation:subject:Patient → { resourceType: "Observation", searchParam: "subject", targetType: "Patient" }
```

#### Tests (6)

**File:** `packages/fhir-persistence/src/__tests__/search/param-parser.test.ts` (extend)

```
16.2-01: parse _include=MedicationRequest:patient
16.2-02: parse _include with target type filter
16.2-03: parse _revinclude=Observation:subject
16.2-04: parse _revinclude with target type filter
16.2-05: multiple _include values
16.2-06: invalid _include format (missing colon) → ignored
```

---

### Task 16.3: \_include Execution

**File:** `packages/fhir-persistence/src/search/include-executor.ts` (new)

After primary search, load referenced resources and return them as include entries.

#### Algorithm

1. For each `_include` target:
   a. Find the `SearchParameterImpl` for the search param on the source type
   b. For each primary result of matching source type:
   - Extract the reference column value(s)
   - Parse reference strings to get target resource type + ID
     c. If `targetType` is specified, filter to matching type
     d. Batch-load target resources by ID from their respective tables
2. Deduplicate (same resource may be referenced multiple times)
3. Return as `PersistedResource[]` with `search.mode = 'include'`

#### Interface

```typescript
export async function executeInclude(
  db: DatabaseClient,
  primaryResults: PersistedResource[],
  includes: IncludeTarget[],
  registry: SearchParameterRegistry,
): Promise<PersistedResource[]>;
```

#### Tests (8)

**File:** `packages/fhir-persistence/src/__tests__/search/include-executor.test.ts`

```
16.3-01: _include loads single referenced resource
16.3-02: _include loads multiple referenced resources
16.3-03: _include with target type filter
16.3-04: _include deduplicates same target
16.3-05: _include with no matching references → empty
16.3-06: _include with array reference column
16.3-07: _include skips missing target resources (deleted/nonexistent)
16.3-08: _include with multiple include targets
```

---

### Task 16.4: \_revinclude Execution

**File:** `packages/fhir-persistence/src/search/include-executor.ts` (extend)

After primary search, find resources that reference the primary results using
the `{ResourceType}_References` table.

#### Algorithm

1. For each `_revinclude` target:
   a. Collect primary result IDs
   b. Query `{SourceType}_References` table:
   ```sql
   SELECT "resourceId" FROM "{SourceType}_References"
   WHERE "targetId" = ANY($1) AND "code" = $2
   ```
   c. Batch-load source resources by ID
2. Deduplicate
3. Return as `PersistedResource[]` with `search.mode = 'include'`

#### Interface

```typescript
export async function executeRevinclude(
  db: DatabaseClient,
  primaryResults: PersistedResource[],
  revincludes: IncludeTarget[],
): Promise<PersistedResource[]>;
```

#### Tests (6)

**File:** `packages/fhir-persistence/src/__tests__/search/include-executor.test.ts` (extend)

```
16.4-01: _revinclude loads resources referencing primary results
16.4-02: _revinclude with specific search param code
16.4-03: _revinclude with no reverse references → empty
16.4-04: _revinclude deduplicates
16.4-05: _revinclude with target type filter
16.4-06: _revinclude with multiple primary results
```

---

### Task 16.5: Integration into Search Pipeline

**Files Modified:**

- `packages/fhir-persistence/src/search/search-executor.ts`
- `packages/fhir-persistence/src/search/search-bundle.ts`
- `packages/fhir-persistence/src/repo/fhir-repo.ts`

#### Search Executor Changes

Extend `executeSearch()` to process `_include` and `_revinclude` after primary
search:

```typescript
export async function executeSearch(
  db: DatabaseClient,
  request: SearchRequest,
  registry: SearchParameterRegistry,
  options?: SearchOptions,
): Promise<SearchResult> {
  // 1. Primary search (existing)
  // 2. Execute _include (new)
  // 3. Execute _revinclude (new)
  // 4. Return combined result with include resources
}
```

#### SearchResult Changes

```typescript
export interface SearchResult {
  resources: PersistedResource[];
  included?: PersistedResource[]; // NEW: include/revinclude results
  total?: number;
}
```

#### Search Bundle Changes

Update `buildSearchBundle()` to accept included resources and add them with
`search.mode = 'include'`.

#### FhirRepository Changes

Update `createResource()`, `updateResource()`, `deleteResource()` to write/delete
reference rows.

#### Tests (4)

Extend existing test files:

```
16.5-01: executeSearch with _include returns included resources
16.5-02: executeSearch with _revinclude returns included resources
16.5-03: buildSearchBundle includes resources with mode='include'
16.5-04: FhirRepository write path populates References table
```

---

### Task 16.6: Integration Tests (real PostgreSQL)

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts` (extend)

```
16.6-01: create Patient + Observation, _include=Observation:subject → Patient included
16.6-02: create Patient + Observation, _revinclude=Observation:subject → Observations included
16.6-03: _include with no matching references → only primary results
16.6-04: _revinclude with no reverse references → only primary results
16.6-05: included resources have search.mode = 'include'
16.6-06: _include does not duplicate primary results
16.6-07: update resource updates References table
16.6-08: delete resource cleans up References table
```

---

### Task 16.7: HTTP E2E Tests

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts` (extend)

```
16.7-01: GET /Observation?_include=Observation:subject returns Patient in Bundle
16.7-02: GET /Patient?_revinclude=Observation:subject returns Observations in Bundle
16.7-03: included entries have search.mode = 'include'
16.7-04: _include with no matches → only primary entries
```

---

## File Plan

### New Files

| File                                            | Purpose                                              |
| ----------------------------------------------- | ---------------------------------------------------- |
| `src/repo/reference-indexer.ts`                 | Reference extraction and References table population |
| `src/__tests__/repo/reference-indexer.test.ts`  | Reference indexer unit tests                         |
| `src/search/include-executor.ts`                | \_include and \_revinclude execution logic           |
| `src/__tests__/search/include-executor.test.ts` | Include executor unit tests                          |

### Modified Files

| File                            | Changes                                               |
| ------------------------------- | ----------------------------------------------------- |
| `src/search/types.ts`           | Add `IncludeTarget`, extend `SearchRequest`           |
| `src/search/param-parser.ts`    | Parse `_include` and `_revinclude` values             |
| `src/search/search-executor.ts` | Integrate include/revinclude into search pipeline     |
| `src/search/search-bundle.ts`   | Add included resources with `search.mode = 'include'` |
| `src/repo/fhir-repo.ts`         | Write/delete reference rows on create/update/delete   |
| `src/repo/index.ts`             | Export new functions                                  |
| `src/search/index.ts`           | Export new types and functions                        |
| `src/index.ts`                  | Export new public API                                 |

### Test Files (modified)

| File                                                   | Changes                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/__tests__/search/param-parser.test.ts`            | +6 tests for \_include/\_revinclude parsing |
| `src/__tests__/integration/search-integration.test.ts` | +8 integration tests                        |
| `fhir-server/src/__tests__/search-e2e.test.ts`         | +4 HTTP E2E tests                           |

---

## Acceptance Criteria

- [x] Reference rows written to `{ResourceType}_References` on create/update ✅
- [x] Reference rows deleted on resource delete ✅
- [x] `_include` loads referenced resources into Bundle ✅
- [x] `_revinclude` loads reverse-referencing resources into Bundle ✅
- [x] Included resources have `search.mode = 'include'` ✅
- [x] No duplicate resources in Bundle (deduplication) ✅
- [x] 30 new tests passing ✅ (12 ref-indexer + 7 parser + 8 integration + 4 HTTP E2E, minus 1 updated)
- [x] Zero regressions on existing 693 tests ✅ (now 723 total)
- [x] `tsc --noEmit` clean ✅

---

## Execution Order

```
1. Task 16.1 — Reference indexer + unit tests
2. Task 16.2 — _include/_revinclude parsing + unit tests
3. Task 16.3 — _include execution + unit tests
4. Task 16.4 — _revinclude execution + unit tests
5. Task 16.5 — Pipeline integration (executor, bundle, repo)
6. Task 16.6 — Integration tests (real DB)
7. Task 16.7 — HTTP E2E tests
8. Update this document with completion results
```

---

## Risk Mitigation

| Risk                                        | Mitigation                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| References table write overhead             | Batch INSERT with single statement per resource                          |
| N+1 query for \_include                     | Batch-load all target IDs in one query per target type                   |
| Large \_revinclude result sets              | Cap included resources at 1000 (configurable)                            |
| Circular includes                           | Track seen resource IDs to prevent infinite loops                        |
| Missing References rows (pre-existing data) | Only affects resources created before Phase 16; re-index script deferred |

---

## Scope Decisions

### In Scope

- `_include` with explicit source:param syntax
- `_revinclude` with explicit source:param syntax
- Target type filtering (`_include=Observation:subject:Patient`)
- Reference table population on create/update/delete

### Deferred (Phase 17 / Stage-4)

- **Chained search** (`subject:Patient.name=Smith`) — requires SQL JOIN generation
- `_include:iterate` / `_include:recurse` — recursive include
- `_include=*` — wildcard include (all references)
- Re-indexing existing resources to populate References table

---

## References

- [Stage-3-Development-Roadmap.md](./Stage-3-Development-Roadmap.md)
- [Phase-14-Detailed-Plan.md](./Phase-14-Detailed-Plan.md) — Task 14.5 (deferred)
- [Phase-15-Detailed-Plan.md](./Phase-15-Detailed-Plan.md)
- [FHIR R4 Search — Including Other Resources](https://hl7.org/fhir/R4/search.html#include)
- [FHIR R4 Search — Chained Parameters](https://hl7.org/fhir/R4/search.html#chaining)
- Current `{ResourceType}_References` table schema (3 columns: resourceId, targetId, code)
