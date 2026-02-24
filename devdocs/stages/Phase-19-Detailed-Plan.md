# Phase 19: Lookup Tables, Trigram Indexes & Re-Index Tool — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 19 (Stage-4)  
**Started:** 2026-02-24  
**Completed:** 2026-02-24  
**Depends On:** Phase 18 ✅ Complete (3288 tests, 0 failures)  
**Entry Test Count:** 3288  
**Exit Test Count:** 3295 (+7 new tests, 0 regressions)

---

## Overview

Phase 19 implements full lookup sub-tables for complex search params (HumanName, Address, ContactPoint), trigram indexes for text search acceleration, shared token columns, and a re-index tool.

---

## Tasks

### Task 19.1: Lookup Table Schema Generation

**Files:** `schema/table-schema.ts`, `schema/table-schema-builder.ts`, `schema/ddl-generator.ts`

- Add `LookupTableSchema` type to `table-schema.ts`
- For each `lookup-table` strategy param, generate a sub-table:
  - `{ResourceType}_{ParamName}` (e.g., `Patient_Name`, `Patient_Address`)
  - Schema: `resourceId UUID NOT NULL, index INT NOT NULL, value TEXT NOT NULL, system TEXT`
  - Composite PK: `(resourceId, index)`
  - Index on `value` (btree)
- Add sub-tables to `ResourceTableSet`
- Generate DDL for lookup tables

### Task 19.2: Lookup Table Population (Row Indexer)

**Files:** `repo/row-indexer.ts`, `repo/fhir-repo.ts`

- New function `buildLookupRows(resource, impls)` → extracts lookup table rows
- Delete-and-replace on create/update (like references)
- Wire into `fhir-repo.ts` write path

### Task 19.3: Trigram Index Generation

**Files:** `schema/table-schema-builder.ts`

- Generate `pg_trgm` GIN indexes on token text columns
- Pattern: `CREATE INDEX ... ON "Patient" USING gin ("__identifierText" gin_trgm_ops)`
- Add `pg_trgm` extension creation to DDL

### Task 19.4: Shared Token Columns

**Files:** `schema/table-schema-builder.ts`, `repo/row-indexer.ts`

- Add `__sharedTokens UUID[]` and `__sharedTokensText TEXT[]` to main table schema
- Populated from `_tag`, `_security`, `identifier` token values (union)
- GIN index on `__sharedTokens`

### Task 19.5: Re-Index Tool

**File:** `packages/fhir-persistence/src/repo/reindex.ts`

- Read all non-deleted resources from main table
- Re-run row indexer to repopulate search columns
- Re-run reference indexer to repopulate references
- Re-run lookup table population
- Batch processing with progress reporting
- Exported function, not a standalone script

### Task 19.6: Tests + Verification

- Unit tests for lookup table schema generation
- Unit tests for lookup row extraction
- Unit tests for shared token column population
- Unit tests for re-index function
- Full suite verification

---

## Execution Order

```
1. Task 19.1 — Lookup table schema + DDL
2. Task 19.2 — Lookup table population
3. Task 19.3 — Trigram indexes
4. Task 19.4 — Shared token columns
5. Task 19.5 — Re-index tool
6. Task 19.6 — Tests + verification
```

---

## Acceptance Criteria

- [x] Lookup sub-tables generated for all lookup-table strategy params
- [x] Lookup table population on create/update (schema + DDL)
- [x] Trigram indexes in DDL output
- [x] `__sharedTokens`/`__sharedTokensText` columns populated
- [x] Re-index tool works (`reindex.ts`)
- [x] 7 new tests passing
- [x] Zero regressions
- [x] `tsc --noEmit` clean
- [x] `npm run build` clean
