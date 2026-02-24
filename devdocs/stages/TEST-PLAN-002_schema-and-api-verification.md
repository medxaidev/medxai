# TEST-PLAN-002: Schema Verification & Repo/API Comprehensive Testing

**Version:** v1.0  
**Created:** 2026-02-24  
**Scope:** Stage-2 (Phases 8–13)  
**Packages:** `fhir-persistence`, `fhir-server`

---

## Part A: Multi-Resource Schema Dump Comparison Guide

### Purpose

Verify that MedXAI's generated DDL matches Medplum's schema for representative
resource types, after the schema generation fixes in Phase 8 (reference array
detection, expression-based lookup-table strategy).

### Resources to Compare (Priority Order)

| Priority | Resource | Why Representative |
|----------|----------|--------------------|
| 1 | `Patient` | HumanName lookup-table, multi-target references, token columns |
| 2 | `Observation` | Multi-target subject/performer, token code, date |
| 3 | `Practitioner` | HumanName + Address lookup-table |
| 4 | `Organization` | Plain-string name (lookup-table conservative), address |
| 5 | `DiagnosticReport` | Multi-target subject/encounter, token status |
| 6 | `Encounter` | Multi-target references, period date |
| 7 | `Condition` | Multi-target subject/encounter/asserter |
| 8 | `MedicationRequest` | Multi-target subject/requester, token status |

### Dump Commands

Run these against **both** Medplum DB and MedXAI DB, then compare.

```bash
# Replace <DB_NAME> with medplum_dev or medxai_dev
# Replace <RESOURCE> with the resource name (e.g. Patient)

# Main table
pg_dump -h localhost -p 5433 -U postgres -d <DB_NAME> \
  --schema-only --no-owner --no-privileges \
  -t '"<RESOURCE>"' \
  -f <RESOURCE>_main.sql

# History table
pg_dump -h localhost -p 5433 -U postgres -d <DB_NAME> \
  --schema-only --no-owner --no-privileges \
  -t '"<RESOURCE>_History"' \
  -f <RESOURCE>_history.sql

# References table
pg_dump -h localhost -p 5433 -U postgres -d <DB_NAME> \
  --schema-only --no-owner --no-privileges \
  -t '"<RESOURCE>_References"' \
  -f <RESOURCE>_references.sql
```

### Known Acceptable Differences (Do NOT flag as bugs)

These differences are by design and do not need to be fixed:

| Difference | Medplum | MedXAI | Reason |
|------------|---------|--------|--------|
| `status` column | `status text` (btree) | `__status uuid[]` + `__statusText text[]` + `__statusSort text` (GIN) | MedXAI uses token-column per FHIR spec; Medplum uses simplified text |
| `__sharedTokens` | Present | Absent | Phase 16+ feature |
| `___tag` / `___tagSort` | Present | Absent | Phase 14 feature |
| `___securitySort` | Present | Absent | Phase 14 feature |
| `__*IdentifierSort` (owner/patient/subject) | Present | Absent | Phase 14 reference lookup enhancement |
| `*TextTrgm` GIN trigram indexes | Present | Absent | Phase 16+ performance optimization |
| Constraint naming | `_pkey` | `_pk` | Naming convention difference, functionally identical |
| Column ordering | Varies | Varies | No semantic impact |

### Comparison Checklist Per Resource

For each resource, verify:

- [ ] All reference columns with multiple targets are `TEXT[]` with GIN index
- [ ] All reference columns with single target are `TEXT` with btree index
- [ ] `name`/`given`/`family` params targeting HumanName use `__*Sort TEXT` (lookup-table)
- [ ] `address`/`address-*` params use `__*Sort TEXT` (lookup-table)
- [ ] `email`/`phone`/`telecom` params use `__*Sort TEXT` (lookup-table)
- [ ] Token params produce 3 columns: `__X uuid[]`, `__XText text[]`, `__XSort text`
- [ ] Date params produce `X TIMESTAMPTZ` with btree index
- [ ] `_History` table: 4 columns, 2 indexes — identical to Medplum
- [ ] `_References` table: 3 columns, composite PK, covering index — identical to Medplum

---

## Part B: Repo + API Comprehensive Test Strategy

### Current Test Coverage (Phase 9–13)

| Category | File | Tests | Status |
|----------|------|-------|--------|
| Unit — SQL builders | `sql-builder.test.ts` | 12 | ✅ |
| Unit — History SQL | `history-sql-builder.test.ts` | 12 | ✅ |
| Unit — Row builder | `row-builder.test.ts` | 16 | ✅ |
| Unit — History bundle | `history-bundle.test.ts` | 14 | ✅ |
| Unit — FhirRepo (mock DB) | `fhir-repo.unit.test.ts` | 26 | ✅ |
| Integration — CRUD | `repo-integration.test.ts` | 30 | ✅ |
| Integration — History | `history-integration.test.ts` | 15 | ✅ |
| Integration — Transactions | `transaction.integration.test.ts` | 11 | ✅ |
| Integration — Concurrent | `concurrent.integration.test.ts` | 11 | ✅ |
| Integration — Large resource | `large-resource.integration.test.ts` | 10 | ✅ |
| API — CRUD routes | `resource.test.ts` | 65 | ✅ |
| API — Search routes | `search.test.ts` | 25 | ✅ |

### Gap Analysis: What Is NOT Yet Covered

#### Gap 1 — Search Integration (DB + HTTP end-to-end)

Current search tests use a `MockRepo`. There are no tests that exercise the full
path: **HTTP request → SearchParameterRegistry → SQL → real PostgreSQL → Bundle**.

**Priority: High** — This is the most critical untested path.

#### Gap 2 — Row Indexer (search column population)

The `FhirRepository.create/update` writes to the main table, but the search
columns (`patient`, `subject`, `__status`, etc.) need to be populated from the
resource JSON. There are no tests verifying that search columns are correctly
extracted and written on create/update.

**Priority: High** — Without this, search queries return no results even if SQL
is correct.

#### Gap 3 — Reference Table Population

`Account_References` / `Patient_References` etc. need to be populated with
reference targets on create/update. No tests verify this.

**Priority: Medium** — Required for `_revinclude` and reference integrity.

#### Gap 4 — Search Parameter Modifier Integration

`:missing`, `:exact`, `:contains`, `:not` modifiers are unit-tested in
`where-builder.test.ts` but not tested end-to-end against a real DB.

**Priority: Medium**

#### Gap 5 — HTTP Error Responses (OperationOutcome format)

Current API tests check status codes but not the full `OperationOutcome` JSON
structure for all error cases.

**Priority: Low** — Functional but not spec-compliant verified.

### Proposed TEST-PLAN-002 Test Files

#### TEST-002-F: Search Integration (real DB)

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts`

**Scope:** Full path from `SearchRequest` → SQL → PostgreSQL → `SearchResult`

```
F-01: search by token (status=active) returns matching resources
F-02: search by date (birthdate=ge1990-01-01) returns correct resources
F-03: search by string (name=Smith) returns prefix-matched resources
F-04: search by reference (subject=Patient/123) returns linked resources
F-05: search with _count limits results
F-06: search with _offset paginates correctly
F-07: search with _sort=birthdate orders ascending
F-08: search with _sort=-birthdate orders descending
F-09: search with multiple params (AND) narrows results
F-10: search with multiple values (OR) broadens results
F-11: search with _total=accurate returns correct count
F-12: search on empty table returns empty Bundle
F-13: search with unknown param returns empty (graceful)
F-14: deleted resources do NOT appear in search results
F-15: search after update reflects new values
```

#### TEST-002-G: Row Indexer (search column population)

**File:** `packages/fhir-persistence/src/__tests__/integration/row-indexer.integration.test.ts`

**Scope:** Verify search columns are populated correctly on create/update

```
G-01: create Patient — birthdate column populated from resource JSON
G-02: create Patient — __gender token column populated
G-03: create Observation — subject TEXT column populated
G-04: create Account — patient TEXT[] column populated (array reference)
G-05: create Account — subject TEXT[] column populated
G-06: update Patient — search columns reflect updated values
G-07: delete Patient — row removed (soft delete, deleted=true)
G-08: create with null optional field — column is NULL, not error
G-09: create with array reference — TEXT[] contains all values
G-10: token column — __status UUID[] populated with correct hash
```

#### TEST-002-H: HTTP Search End-to-End

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts`

**Scope:** Full HTTP path with real DB (not MockRepo)

```
H-01: GET /Patient?gender=male returns searchset Bundle
H-02: POST /Patient/_search with form body returns searchset Bundle
H-03: GET /Patient?_count=5 returns at most 5 entries
H-04: GET /Patient?_count=5&_offset=5 returns next page
H-05: Bundle.link.self is correct URL
H-06: Bundle.link.next present when more results exist
H-07: Bundle.total accurate with _total=accurate
H-08: search on non-existent resource type returns 404
H-09: search with no matches returns empty Bundle (not 404)
H-10: search result entries have search.mode = 'match'
```

### Implementation Priority

```
Phase 14 prep:
  1. TEST-002-G (Row Indexer) — prerequisite for F and H
  2. TEST-002-F (Search Integration) — core search correctness
  3. TEST-002-H (HTTP Search E2E) — API conformance

Phase 15+:
  4. Gap 3 (Reference table population)
  5. Gap 4 (Modifier integration)
  6. Gap 5 (OperationOutcome format)
```

### Notes on Row Indexer Implementation

The `FhirRepository` currently writes `content` (full JSON) but does NOT
populate search columns. This is the **most critical missing piece** for
search to work end-to-end. The row indexer needs to:

1. Evaluate FHIRPath expressions from `SearchParameterRegistry` against the resource
2. Write extracted values to the corresponding columns
3. Handle type coercion (string → TEXT, reference → TEXT/TEXT[], token → UUID[])

This is a **Phase 14 implementation task**, not a Phase 8–13 gap.

---

## Summary

| Item | Status | Tests Added |
|------|--------|-------------|
| Schema correctness (Section 11) | ✅ Done | +15 (58 total) |
| Multi-resource dump guide | ✅ Documented above | — |
| Medplum extra columns plan | ✅ Phase 14/16+ | — |
| Search integration tests | 📋 Phase 14 | 15 planned |
| Row indexer tests | 📋 Phase 14 | 10 planned |
| HTTP search E2E tests | 📋 Phase 14 | 10 planned |
