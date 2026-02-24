# Phase 17: Lookup-Table Search & Search Completeness — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 17 (Stage-3)  
**Completed:** 2026-02-24  
**Last Updated:** 2026-02-24  
**Depends On:** Phase 16 ✅ Complete (723 tests, 0 failures)  
**Final Results:** 739 tests passing (629 persistence + 110 server), 0 regressions, tsc clean, build clean

---

## Overview

Phase 17 closes the remaining **functional gaps** in the FHIR search system and adds
performance-related improvements. The most critical gap is that **lookup-table strategy
parameters** (`name`, `address`, `telecom`, `email`, `phone`, `family`, `given`, etc.)
currently return no results — `buildWhereFragment()` returns `null` for these params.

This phase takes a pragmatic approach: rather than implementing full lookup tables with
separate `Patient_name`, `Patient_address` tables and JOINs (which is Medplum's approach),
we use the existing `__nameSort` column for **sort-column-based search**. This gives
functional search for these critical params without the complexity of maintaining separate
lookup tables. Full lookup-table JOINs can be added in Stage-4 if needed for performance.

### Scope

| Item                             | Status                 | Priority                                                               |
| -------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| Lookup-table sort-column search  | 🚧                     | **Critical** — name/address/telecom don't work                         |
| `:contains` modifier for string  | 🚧                     | High — already supported in column strategy, ensure lookup-table works |
| `:exact` modifier for string     | 🚧                     | High — same                                                            |
| Search completeness audit        | 🚧                     | Medium — verify all param types work e2e                               |
| Query EXPLAIN logging (optional) | ⏭️ Deferred            | Low — nice to have                                                     |
| Trigram indexes                  | ⏭️ Deferred to Stage-4 | Low — optimization                                                     |
| Shared token index               | ⏭️ Deferred to Stage-4 | Low — optimization                                                     |

### Explicitly Deferred

- **Full lookup tables with JOINs** — `Patient_name`, `Patient_address` etc. Deferred to Stage-4.
  The sort-column approach provides functional search without separate table maintenance.
- **Trigram indexes / `pg_trgm`** — Performance optimization, not needed for correctness.
- **Shared token index** — Optimization for cross-parameter token search.
- **Re-indexing existing resources** — Existing resources won't have sort columns populated
  until they are updated. A re-index tool is a Stage-4 item.

---

## Architecture

### Current State

The `SearchParameterRegistry` assigns `lookup-table` strategy to params targeting complex
FHIR types (HumanName, Address, ContactPoint). The schema builder generates only a
`__nameSort TEXT` column in the main table. The `row-indexer` populates this sort column
with a concatenated string (e.g., "Smith John" for HumanName). However, `buildWhereFragment()`
in `where-builder.ts` returns `null` for lookup-table params, making them unsearchable.

### Solution

Add a `buildLookupTableFragment()` function in `where-builder.ts` that searches the
`__<name>Sort` column using ILIKE (same approach as string search). This leverages the
existing sort column data without requiring separate lookup tables.

```
Search: GET /Patient?name=Smith
↓
where-builder.ts: buildLookupTableFragment()
↓
SQL: LOWER("__nameSort") LIKE 'smith%'
```

For `:exact` → `"__nameSort" = $1`  
For `:contains` → `LOWER("__nameSort") LIKE '%smith%'`  
Default → `LOWER("__nameSort") LIKE 'smith%'`

---

## Tasks

### Task 17.1: Lookup-Table WHERE Handler

**File:** `packages/fhir-persistence/src/search/where-builder.ts`

- Remove the `return null` for `lookup-table` strategy
- Add `buildLookupTableFragment()` that searches `__<name>Sort` column
- Support string modifiers: default (prefix), `:exact`, `:contains`
- Handle OR (multiple values)

**Unit Tests:** 6 tests

- name prefix search generates correct SQL
- name `:exact` generates equality SQL
- name `:contains` generates ILIKE with wildcards
- multiple values generate OR clause
- address search uses `__addressSort` column
- telecom search uses `__telecomSort` column

### Task 17.2: Sort-Column Extraction Enhancement

**File:** `packages/fhir-persistence/src/repo/row-indexer.ts`

- Review and enhance `extractSortString()` to produce better searchable values
- Ensure HumanName extracts `family given` (not just `family`)
- Ensure Address extracts `line city state postalCode country`
- Ensure ContactPoint extracts `value`

**Unit Tests:** 4 tests

- HumanName sort string includes family and given
- Address sort string includes all components
- ContactPoint sort string extracts value
- Multiple names uses first name

### Task 17.3: Integration Tests

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts`

- Search by Patient name (prefix)
- Search by Patient name `:exact`
- Search by Patient name `:contains`
- Search by Practitioner address

**Tests:** 4 integration tests

### Task 17.4: HTTP E2E Tests

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts`

- GET /Patient?name=value returns matching patient
- GET /Patient?name:exact=value returns exact match

**Tests:** 2 HTTP E2E tests

### Task 17.5: Rebuild & Full Verification

- `tsc --noEmit` clean (both packages)
- `npm run build` clean (fhir-persistence)
- Full test suite: 0 regressions
- Update documentation

---

## Acceptance Criteria

- [x] `GET /Patient?name=Smith` returns patients with matching name (prefix) ✅
- [x] `GET /Patient?name:exact=Smith` returns exact matches ✅
- [x] `GET /Patient?name:contains=mit` returns substring matches ✅
- [x] `GET /Patient?address=...` searches address sort column ✅
- [x] Lookup-table params no longer silently ignored ✅
- [x] 16 new tests passing ✅ (6 where-builder + 4 row-indexer + 4 integration + 2 HTTP E2E)
- [x] Zero regressions on existing 723 tests ✅ (now 739 total)
- [x] `tsc --noEmit` clean ✅

---

## Execution Order

```
1. Task 17.1 — Lookup-table WHERE handler + 6 unit tests
2. Task 17.2 — Sort-column extraction enhancement + 4 unit tests
3. Task 17.3 — Integration tests + 4 tests
4. Task 17.4 — HTTP E2E tests + 2 tests
5. Task 17.5 — Rebuild, full verification, docs
```

---

## Risk Assessment

| Risk                                             | Likelihood | Impact | Mitigation                                            |
| ------------------------------------------------ | ---------- | ------ | ----------------------------------------------------- |
| Sort column too coarse for precise search        | Medium     | Medium | Acceptable for Stage-3; full lookup tables in Stage-4 |
| extractSortString() changes break existing tests | Low        | Low    | Review snapshot tests before changing                 |
| Name search performance on large datasets        | Low        | Low    | btree index on `__nameSort` already exists            |

---

## Dependencies

- Phase 16 ✅ Complete
- PostgreSQL running at localhost:5433
- `npm run db:init` completed (schema includes `__nameSort` etc. columns)
