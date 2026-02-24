# Phase 14: Row Indexer & Search Integration — Detailed Plan

## Status

**Status:** 🚧 In Progress  
**Version:** v1.0  
**Phase:** 14 (Stage-3)  
**Estimated Duration:** 5-7 days  
**Last Updated:** 2026-02-24  
**Depends On:** Phase 13 ✅ Complete

---

## Overview

Phase 14 implements the **Row Indexer** — the component that extracts search
parameter values from FHIR resource JSON and populates the corresponding search
columns during `create`/`update`. This is the critical bridge between Stage-2's
schema generation and actual searchable data.

**Current State:** `buildResourceRow()` only populates fixed columns (id, content,
lastUpdated, deleted, projectId, __version, _source, _profile, compartments).
Search columns (e.g., `patient TEXT[]`, `__status UUID[]`, `birthdate TIMESTAMPTZ`)
are **never written**. Search queries return no results because the indexed columns
are all NULL.

**Phase 14 Goal:** After this phase, `FhirRepository.createResource()` and
`updateResource()` will populate all search columns, and search queries will
return correct results against real PostgreSQL.

---

## Architecture

```
FhirResource (JSON)
  ↓ FhirRepository.createResource()
  ↓
buildResourceRow(resource)           → fixed columns
  +
buildSearchColumns(resource, impls)  → search columns  ← NEW (Task 14.1)
  ↓
merged row { ...fixedCols, ...searchCols }
  ↓
buildUpsertSQL(tableName, row)       → INSERT ... ON CONFLICT DO UPDATE
  ↓
PostgreSQL main table (search columns now populated)
  ↓
executeSearch() → SELECT WHERE patient = $1 → actual results
```

---

## Tasks

### Task 14.1: Row Indexer — Value Extraction

**File:** `packages/fhir-persistence/src/repo/row-indexer.ts`

Implement `buildSearchColumns()` — given a FHIR resource and the list of
`SearchParameterImpl` for its resource type, extract values and return a
`Record<string, unknown>` of search column name → value pairs.

#### Value Extraction Rules by Type

| SearchParam Type | Strategy | Extraction | Column Value |
|-----------------|----------|------------|--------------|
| `string` | column | Direct property access | `TEXT` value |
| `date` | column | Direct property access | `TIMESTAMPTZ` ISO string |
| `reference` | column | Extract `reference` field from Reference object | `TEXT` or `TEXT[]` |
| `number` | column | Direct property access | `DOUBLE PRECISION` |
| `uri` | column | Direct property access | `TEXT` |
| `token` | token-column | Extract `system\|code` from CodeableConcept/Coding | `UUID[]` hash + `TEXT[]` display + `TEXT` sort |
| `string` | lookup-table | Extract for sort column only | `TEXT` sort value |

#### FHIRPath Expression Parsing (Simplified)

For Phase 14 MVP, use **simplified property path extraction** instead of full
FHIRPath evaluation:

```typescript
// Expression: "Patient.birthDate" → resource.birthDate
// Expression: "Patient.name" → resource.name (array of HumanName)
// Expression: "Account.subject.where(resolve() is Patient)" → resource.subject
// Expression: "A.x | B.y" → for resource type A, use A.x path
```

Strategy:
1. Split expression by `|` (union)
2. Find the path that starts with the current resource type
3. Strip the resource type prefix: `"Patient.birthDate"` → `"birthDate"`
4. Handle `.where(...)` by stripping it: `"subject.where(...)"` → `"subject"`
5. Navigate the resource JSON using the remaining dot-path
6. Extract the appropriate value based on the FHIR type

#### Token Hashing

For token columns, generate a deterministic UUID hash from `system|code`:

```typescript
// Medplum approach: generateId(system + '|' + code)
// We use: uuid v5 with a fixed namespace
import { v5 as uuidv5 } from 'uuid';
const TOKEN_NAMESPACE = '...' ; // fixed UUID namespace
function hashToken(system: string, code: string): string {
  return uuidv5(`${system}|${code}`, TOKEN_NAMESPACE);
}
```

#### Interface

```typescript
export interface SearchColumnValues {
  [columnName: string]: unknown;
}

export function buildSearchColumns(
  resource: FhirResource,
  impls: SearchParameterImpl[],
): SearchColumnValues;
```

#### Tests (15+)

**File:** `packages/fhir-persistence/src/__tests__/repo/row-indexer.test.ts`

```
14.1-01: extract string value (Patient.birthDate → TIMESTAMPTZ)
14.1-02: extract reference value (Observation.subject → TEXT)
14.1-03: extract multi-target reference (Account.subject → TEXT[])
14.1-04: extract token value (Patient.gender → UUID[] + TEXT[] + TEXT)
14.1-05: extract CodeableConcept token (Observation.code → UUID[])
14.1-06: extract uri value (ValueSet.url → TEXT)
14.1-07: extract number value (RiskAssessment.probability → DOUBLE PRECISION)
14.1-08: handle null/missing values → column not set (undefined)
14.1-09: handle array reference with .where() expression
14.1-10: handle union expression (pick correct path for resource type)
14.1-11: lookup-table sort value extraction (Patient.name → sort string)
14.1-12: token with system|code → correct UUID hash
14.1-13: token with only code (no system) → hash with empty system
14.1-14: multiple codings in CodeableConcept → all hashed
14.1-15: deeply nested path extraction (e.g., Observation.value.quantity)
```

---

### Task 14.2: Integrate Row Indexer into Repository

**Files Modified:**
- `packages/fhir-persistence/src/repo/row-builder.ts`
- `packages/fhir-persistence/src/repo/fhir-repo.ts`

#### Changes to `row-builder.ts`

Add a new function `buildResourceRowWithSearch()` that:
1. Calls existing `buildResourceRow()` for fixed columns
2. Calls `buildSearchColumns()` for search columns
3. Merges both into a single `ResourceRow`

```typescript
export function buildResourceRowWithSearch(
  resource: PersistedResource,
  searchImpls: SearchParameterImpl[],
): ResourceRow {
  const fixedRow = buildResourceRow(resource);
  const searchCols = buildSearchColumns(resource, searchImpls);
  return { ...fixedRow, ...searchCols };
}
```

#### Changes to `fhir-repo.ts`

- In `createResource()` and `updateResource()`: use `buildResourceRowWithSearch()`
  when `this.registry` is available, fall back to `buildResourceRow()` otherwise.
- Get search impls via `this.registry.getAllForType(resourceType)`.

#### Tests (15+)

**File:** `packages/fhir-persistence/src/__tests__/repo/row-builder.test.ts` (extend existing)

```
14.2-01: buildResourceRowWithSearch includes fixed columns
14.2-02: buildResourceRowWithSearch includes search columns
14.2-03: buildResourceRowWithSearch with empty search impls → only fixed columns
14.2-04: buildResourceRowWithSearch merges without overwriting fixed columns
14.2-05: FhirRepository.createResource populates search columns (mock DB)
14.2-06: FhirRepository.updateResource populates search columns (mock DB)
14.2-07: FhirRepository without registry → no search columns (backward compat)
14.2-08: delete row has no search columns
14.2-09: token columns in upsert SQL have correct parameter count
14.2-10: array reference column in upsert SQL uses array literal
14.2-11: null search values omitted from SQL
14.2-12: buildResourceRowWithSearch with Patient resource
14.2-13: buildResourceRowWithSearch with Observation resource
14.2-14: buildResourceRowWithSearch with Account resource
14.2-15: search columns update on resource update
```

---

### Task 14.3: Search Integration Tests (real PostgreSQL)

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts`

End-to-end tests that:
1. Create resources via `FhirRepository` (with search column population)
2. Search via `executeSearch()` against real PostgreSQL
3. Verify correct results

**Prerequisites:** Database must have tables created with search columns
(from DDL generator).

```
14.3-01: create Patient, search by birthdate → found
14.3-02: create Patient, search by gender (token) → found
14.3-03: create Patient, search by name (string) → found
14.3-04: create Observation, search by subject (reference) → found
14.3-05: create multiple Patients, search by gender → correct subset
14.3-06: search with _count=2 → at most 2 results
14.3-07: search with _offset=1 → skip first result
14.3-08: search with _sort=birthdate → ordered ascending
14.3-09: search with _sort=-birthdate → ordered descending
14.3-10: search with multiple params (AND) → intersection
14.3-11: search with multiple values (OR) → union
14.3-12: search on empty table → empty result
14.3-13: deleted resource NOT in search results
14.3-14: update resource → search reflects new values
14.3-15: search with _total=accurate → correct count
```

---

### Task 14.4: HTTP Search E2E Tests

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts`

Full HTTP path tests (Fastify + real DB):

```
14.4-01: GET /Patient?gender=male → searchset Bundle with matches
14.4-02: POST /Patient/_search (form body) → searchset Bundle
14.4-03: GET /Patient?_count=2 → at most 2 entries
14.4-04: GET /Patient?_count=2&_offset=2 → next page
14.4-05: Bundle.link.self has correct URL
14.4-06: Bundle.link.next present when more results
14.4-07: Bundle.total with _total=accurate
14.4-08: search with no matches → empty Bundle (200, not 404)
14.4-09: search result entries have search.mode = 'match'
14.4-10: GET /Patient?birthdate=ge1990-01-01 → date prefix search
```

---

### Task 14.5: Reference Table Population (stretch goal)

**File:** `packages/fhir-persistence/src/repo/reference-indexer.ts`

On create/update, extract all Reference values and write to
`{ResourceType}_References` table.

This is a **stretch goal** for Phase 14. If time is limited, defer to Phase 15.

```
14.5-01: create Patient with managingOrganization → References row created
14.5-02: update Patient → old references deleted, new ones inserted
14.5-03: delete Patient → references cleaned up
14.5-04: multiple references in one resource → multiple rows
14.5-05: reference with display only (no reference URL) → skipped
```

---

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `src/repo/row-indexer.ts` | Search column value extraction |
| `src/__tests__/repo/row-indexer.test.ts` | Row indexer unit tests |
| `src/__tests__/integration/search-integration.test.ts` | Search integration tests |

### Modified Files

| File | Changes |
|------|---------|
| `src/repo/row-builder.ts` | Add `buildResourceRowWithSearch()` |
| `src/repo/fhir-repo.ts` | Use `buildResourceRowWithSearch()` in create/update |
| `src/repo/index.ts` | Export new functions |
| `src/index.ts` | Export new functions |

### Server Files (if Task 14.4)

| File | Purpose |
|------|---------|
| `fhir-server/src/__tests__/search-e2e.test.ts` | HTTP search E2E tests |

---

## Acceptance Criteria

- [ ] `buildSearchColumns()` correctly extracts values for string, date, reference, token, number, uri
- [ ] `FhirRepository.createResource()` populates search columns when registry is available
- [ ] `FhirRepository.updateResource()` populates search columns
- [ ] Backward compatibility: repository works without registry (no search columns)
- [ ] Search queries return correct results against real PostgreSQL
- [ ] 40+ new tests passing
- [ ] Zero regressions on existing 589 tests (499 persistence + 90 server)
- [ ] `tsc --noEmit` clean

---

## Execution Order

```
1. Task 14.1 — Row Indexer (value extraction) + unit tests
2. Task 14.2 — Integrate into row-builder + fhir-repo + unit tests
3. Task 14.3 — Search integration tests (real DB)
4. Task 14.4 — HTTP search E2E tests
5. Task 14.5 — Reference table population (stretch)
6. Update this document with completion results
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| FHIRPath expression complexity | Use simplified property path extraction for MVP; full FHIRPath in Phase 15+ |
| Token hashing incompatibility | Study Medplum's hash function; use deterministic UUID v5 |
| Integration test DB setup | Reuse existing `localhost:5433/medxai_dev` setup from Phase 9 |
| Search column NULL handling | PostgreSQL handles NULL in WHERE gracefully; test explicitly |

---

## References

- [Stage-3-Development-Roadmap.md](./Stage-3-Development-Roadmap.md)
- [TEST-PLAN-002](./TEST-PLAN-002_schema-and-api-verification.md)
- [Phase-13-Detailed-Plan.md](./Phase-13-Detailed-Plan.md)
- Current `row-builder.ts` — fixed column population
- Current `sql-builder.ts` — UPSERT SQL generation
- Current `fhir-repo.ts` — repository write path
- Current `search-parameter-registry.ts` — SearchParameterImpl definitions
