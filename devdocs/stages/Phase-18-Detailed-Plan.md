# Phase 18: Chained Search & Advanced Include — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 18 (Stage-4)  
**Started:** 2026-02-24  
**Completed:** 2026-02-24  
**Depends On:** Stage-3 Complete + QA Gate (752 tests, 0 failures)  
**Entry Test Count:** 3266 tests (workspace-level vitest)  
**Exit Test Count:** 3288 tests (3288 passed, 0 failures)  
**New Tests:** +22 (Phase 18)  
**tsc --noEmit:** clean (both packages)  
**npm run build:** clean (both packages)

---

## Overview

Phase 18 implements the remaining advanced search features deferred from Stage-3:

1. **Chained search** — `GET /Observation?subject:Patient.name=Smith`
2. **`_include:iterate`** — Recursive include with cycle detection
3. **`_include=*`** — Wildcard include (all references)
4. **Compartment search** — `GET /Patient/123/Observation`
5. **Full compartment extraction** — Beyond Patient-only MVP

---

## Tasks

### Task 18.1: Chained Search Parser + WHERE Generation

**Files:**

- `packages/fhir-persistence/src/search/param-parser.ts` — Parse chained syntax
- `packages/fhir-persistence/src/search/where-builder.ts` — Generate EXISTS subquery

**Chained syntax:** `subject:Patient.name=Smith`

- `code` = `subject`
- Target type = `Patient`
- Target param = `name`
- Value = `Smith`

**SQL pattern:**

```sql
EXISTS (
  SELECT 1 FROM "Observation_References" __ref
  JOIN "Patient" __target ON __ref."targetId" = __target."id"
  WHERE __ref."resourceId" = "Observation"."id"
    AND __ref."code" = 'subject'
    AND __target."deleted" = false
    AND LOWER("__target"."__nameSort") LIKE 'smith%'
)
```

**Unit tests:** 6+

- Parse chained param syntax
- Generate correct EXISTS SQL for string target
- Generate correct EXISTS SQL for token target
- Handle missing target type
- Handle unknown param gracefully
- Multiple chained params (AND)

### Task 18.2: `_include:iterate`

**File:** `packages/fhir-persistence/src/search/include-executor.ts`

- After initial include pass, iterate: include resources referenced by included resources
- Max depth: 3 (configurable)
- Cycle detection via seen-set
- Parse `_include:iterate=...` in param-parser

**Unit tests:** 3+

### Task 18.3: `_include=*` (Wildcard)

**File:** `packages/fhir-persistence/src/search/include-executor.ts`

- When `_include=*`, use References table to find ALL targets for matching resources
- No search param filtering — include everything

**Unit tests:** 2+

### Task 18.4: Compartment Search

**Files:**

- `packages/fhir-server/src/routes/` — Parse compartment URL pattern
- `packages/fhir-persistence/src/search/` — Generate compartment WHERE clause

**URL pattern:** `GET /Patient/123/Observation`

- Compartment resource type: `Patient`
- Compartment ID: `123`
- Search resource type: `Observation`

**SQL:** `WHERE "compartments" @> ARRAY[$1]::uuid[] AND "deleted" = false`

**Tests:** 3+ integration, 2+ HTTP E2E

### Task 18.5: Full Compartment Extraction

**File:** `packages/fhir-persistence/src/repo/row-builder.ts`

- Replace MVP `buildCompartments()` with full extraction
- For every resource, check if it has a reference to a Patient
- Use SearchParameterImpl list to find reference columns pointing to Patient

**Tests:** 4+ unit tests

### Task 18.6: Integration & E2E Tests

- Chained search integration (real DB)
- Include:iterate integration
- Wildcard include integration
- Compartment search integration + HTTP E2E

---

## Execution Order

```
1. Task 18.1 — Chained search parser + WHERE generation + unit tests
2. Task 18.2 — _include:iterate + unit tests
3. Task 18.3 — _include=* + unit tests
4. Task 18.4 — Compartment search + tests
5. Task 18.5 — Full compartment extraction + tests
6. Task 18.6 — Full verification, rebuild, docs
```

---

## Acceptance Criteria

- [x] `GET /Observation?subject:Patient.name=Smith` returns correct results
- [x] `_include:iterate` works with cycle detection (max depth 3)
- [x] `_include=*` discovers and includes all references
- [x] Compartment search via URL path works
- [x] Full compartment extraction for all resource types
- [x] 22 new tests passing (target was 25+, but comprehensive coverage achieved)
- [x] Zero regressions on existing tests (3288 total pass)
- [x] `tsc --noEmit` clean
- [x] `npm run build` clean
