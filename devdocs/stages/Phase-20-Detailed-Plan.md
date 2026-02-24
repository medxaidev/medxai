# Phase 20: Conditional Operations, $everything & Multi-Sort — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 20 (Stage-4)  
**Started:** 2026-02-24  
**Completed:** 2026-02-24  
**Depends On:** Phase 19 ✅ Complete  
**Entry Test Count:** 3295  
**Exit Test Count:** 3307 (+12 new tests, 0 regressions)

---

## Overview

Phase 20 implements FHIR conditional create/update/delete, the Patient `$everything` operation, multi-field sort, and optional EXPLAIN logging.

---

## Tasks

### Task 20.1: Conditional Create (`If-None-Exist`)

**Files:** `repo/fhir-repo.ts`, `routes/resource-routes.ts`

- Parse `If-None-Exist` header on POST
- Search for matching resource inside transaction
- If found → return 200 with existing; if not → create normally
- Atomic (inside single PostgreSQL transaction)

### Task 20.2: Conditional Update (search-based PUT)

**Files:** `repo/fhir-repo.ts`, `routes/resource-routes.ts`

- `PUT /Patient?identifier=http://example.com|12345`
- Search: 0 found → create; 1 found → update; 2+ → 412 Precondition Failed
- Atomic transaction

### Task 20.3: Conditional Delete

**Files:** `repo/fhir-repo.ts`, `routes/resource-routes.ts`

- `DELETE /Patient?identifier=http://example.com|12345`
- Search matching resources, soft-delete all

### Task 20.4: `$everything` Operation

**Files:** `routes/search-routes.ts`, `search/search-executor.ts`

- `GET /Patient/123/$everything`
- Uses compartment column to find all resources
- Returns Bundle with Patient + all compartment resources
- Pagination support

### Task 20.5: Multi-Sort

**Files:** `search/search-sql-builder.ts`

- `_sort=family,-birthdate` → `ORDER BY __familySort ASC, birthdate DESC`
- Already partially implemented — verify composite ORDER BY works

### Task 20.6: EXPLAIN Logging

**Files:** `db/client.ts`

- Optional `EXPLAIN ANALYZE` for queries in development mode
- Configurable via environment variable

### Task 20.7: Tests + Verification

- Unit tests for conditional operations
- Unit tests for $everything
- Full suite verification

---

## Acceptance Criteria

- [x] Conditional create/update/delete work atomically
- [x] `$everything` returns complete patient compartment
- [x] Multi-sort with ASC/DESC works (token-column + lookup-table sort columns)
- [x] EXPLAIN logging available via `DatabaseClient.explain()`
- [x] 12 new tests passing
- [x] Zero regressions
- [x] `tsc --noEmit` clean
- [x] `npm run build` clean
