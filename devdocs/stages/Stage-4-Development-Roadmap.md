# Stage-4 Development Roadmap: DB Completeness & Repo Maturity

## Status

**Status:** 🚧 In Progress  
**Version:** v1.0  
**Stage:** Stage-4 (DB Completeness & Repo Maturity)  
**Started:** 2026-02-24  
**Last Updated:** 2026-02-24  
**Depends On:** Stage-3 ✅ Complete (752 tests passing, 0 regressions)  
**Entry Test Count:** 752 tests (642 persistence + 110 server)

---

## Overview

Stage-4 is the **final stage for database and repository work** before moving to higher layers (Client SDK, authentication, UI, Chinese localization). The user's directive is clear:

> 1. 全部完成数据库生成的工作，不要有任何遗漏
> 2. Repo 部分完全完成，并且包括高级功能，如缓存等；之后进行大量测试

After Stage-4 is complete, the DB + Repo layer should be **production-grade** and require no further structural changes. All subsequent stages build on top of it.

---

## Design Principles

1. **Zero schema gaps** — Every Medplum schema feature must be implemented or explicitly documented as out-of-scope with justification.
2. **Repo feature parity** — Implement all Medplum repo-level features: caching, conditional operations, batch/transaction bundles, re-indexing, compartment search.
3. **Hardening through testing** — Each phase must include stress tests, concurrency tests, and cross-validation against Medplum's physical DB output.
4. **No deferred items to Stage-5** — Stage-4 is the cutoff for DB/Repo work.

---

## Deferred Items from Stage-3

These items were explicitly deferred and must be resolved in Stage-4:

| Item | Deferred From | Phase |
|------|--------------|-------|
| Chained search (`subject:Patient.name=Smith`) | Phase 16 | 18 |
| `_include:iterate` / `_include:recurse` | Phase 16 | 18 |
| `_include=*` (wildcard include) | Phase 16 | 18 |
| Full lookup tables (`Patient_Name`, `Patient_Address` sub-tables) | Phase 17 | 19 |
| Trigram indexes (`pg_trgm` for token text) | Phase 17 | 19 |
| `__sharedTokens` / `__sharedTokensText` columns | Phase 17 | 19 |
| Re-indexing existing resources | Phase 17 | 19 |
| Reference sort columns (`__ownerIdentifierSort` etc.) | Phase 15 | 19 |
| Query EXPLAIN logging | Phase 17 | 20 |

---

## New Stage-4 Requirements

In addition to deferred items, these are new requirements for production-grade Repo:

| Requirement | Phase |
|------------|-------|
| Compartment search (using `compartments` column) | 18 |
| Full compartment extraction (beyond Patient-only MVP) | 18 |
| Conditional create (`If-None-Exist`) | 20 |
| Conditional update (`If-Match` with search) | 20 |
| FHIR Bundle transaction/batch processing | 21 |
| Read cache (in-memory LRU) | 21 |
| Serialization conflict retry (`40001`) | 21 |
| Re-index tool (repopulate search columns for existing resources) | 19 |
| `$everything` operation (Patient compartment export) | 20 |
| Multi-sort (`_sort=family,-birthdate`) | 20 |
| Comprehensive Medplum cross-validation (all 146 resource types DDL diff) | 22 |
| Stress / load testing | 22 |

---

## 5-Phase Plan

```
Phase 18: Chained Search & Advanced Include
Phase 19: Lookup Tables, Trigram Indexes & Re-Index Tool
Phase 20: Compartment Search, Conditional Operations & $everything
Phase 21: Bundle Transaction/Batch, Cache & Retry
Phase 22: Comprehensive Validation & Hardening
```

---

## Phase 18: Chained Search & Advanced Include

**Duration:** 5-7 days  
**Complexity:** Very High  
**Risk:** High  
**Depends On:** Stage-3 Complete + QA Gate (752 tests)

### Objectives

Implement single-level chained search and advanced include features that were deferred from Phase 16.

### Tasks

#### Task 18.1: Chained Search Parser

**File:** `packages/fhir-persistence/src/search/`

- Parse chained search syntax: `subject:Patient.name=Smith`
- Extract: source param (`subject`), target type (`Patient`), target param (`name`), value (`Smith`)
- Handle reverse chaining: `_has:Observation:subject:code=1234`

#### Task 18.2: Chained Search SQL Generation

**File:** `packages/fhir-persistence/src/search/where-builder.ts`

- Generate SQL JOIN via `_References` table:
  ```sql
  EXISTS (
    SELECT 1 FROM "Observation_References" r
    JOIN "Patient" t ON r."targetId" = t."id"
    WHERE r."resourceId" = "Observation"."id"
      AND r."code" = 'subject'
      AND LOWER(t."__nameSort") LIKE 'smith%'
  )
  ```
- Single-level only (multi-level chaining out of scope)

#### Task 18.3: `_include:iterate`

- After initial include pass, run a second pass to include resources referenced by included resources
- Cycle detection (avoid infinite loops)
- Configurable depth limit (default: 3)

#### Task 18.4: `_include=*` (Wildcard)

- Include all referenced resources for matching results
- Uses `_References` table to discover all targets

#### Task 18.5: Compartment Search

- `GET /Patient/123/Observation` → search Observations where `compartments @> ARRAY[uuid]`
- Parse compartment URL pattern in router
- Generate WHERE clause using GIN index on `compartments` column

#### Task 18.6: Full Compartment Extraction

**File:** `packages/fhir-persistence/src/repo/row-builder.ts`

- Replace MVP `buildCompartments()` (Patient-only) with FHIRPath-based extraction
- Use CompartmentDefinition to find Patient references in any resource type
- Example: `Observation.subject` → if Patient reference → add to compartments

#### Task 18.7: Tests

- 10+ unit tests (chained search parser, SQL generation)
- 10+ integration tests (chained search e2e, include:iterate, wildcard, compartment)
- 5+ HTTP E2E tests

### Acceptance Criteria

- [ ] `GET /Observation?subject:Patient.name=Smith` returns correct results
- [ ] `_include:iterate` works with cycle detection
- [ ] `_include=*` discovers and includes all references
- [ ] Compartment search via URL path works
- [ ] Full compartment extraction populates `compartments` for all resource types
- [ ] 25+ new tests passing
- [ ] Zero regressions

---

## Phase 19: Lookup Tables, Trigram Indexes & Re-Index Tool

**Duration:** 5-7 days  
**Complexity:** High  
**Risk:** Medium  
**Depends On:** Phase 18

### Objectives

Implement full lookup sub-tables for HumanName/Address/ContactPoint, trigram indexes for text search acceleration, shared token columns, and a re-index tool.

### Tasks

#### Task 19.1: Lookup Table Schema

- Add `Patient_Name`, `Patient_Address`, `Patient_Telecom` (etc.) table definitions to schema builder
- Schema: `resourceId UUID, index INT, {type-specific columns}`
- Generate DDL alongside main tables

#### Task 19.2: Lookup Table Population

- On create/update, extract HumanName/Address/ContactPoint components into sub-tables
- Delete-and-replace strategy (like References)
- Row indexer integration

#### Task 19.3: Lookup Table Search (JOIN-based)

- Replace sort-column search with JOIN-based search for lookup-table params
- Better precision: search `family` vs `given` independently

#### Task 19.4: Trigram Indexes

- Generate `pg_trgm` GIN indexes on token text columns (`__identifierText`, `__typeText`, etc.)
- Medplum pattern: `token_array_to_text("__identifierText") gin_trgm_ops`
- May require custom PostgreSQL function `token_array_to_text()`

#### Task 19.5: Shared Token Columns

- Add `__sharedTokens UUID[]`, `__sharedTokensText TEXT[]` to main table schema
- Unified token index across `_tag`, `_security`, `identifier`
- Populate in row indexer

#### Task 19.6: Reference Sort Columns

- Add `__ownerIdentifierSort`, `__patientIdentifierSort`, etc.
- Cross-resource identifier lookup (read target resource's identifier)

#### Task 19.7: Re-Index Tool

**File:** `packages/fhir-persistence/scripts/reindex.ts`

- Read all existing resources from main table
- Re-run row indexer to repopulate search columns, references, lookup tables
- Batch processing with progress reporting
- Necessary after schema changes

#### Task 19.8: Tests

- 10+ unit tests
- 10+ integration tests (lookup table search, trigram, re-index verification)
- DB schema diff against Medplum

### Acceptance Criteria

- [ ] Lookup sub-tables generated for all lookup-table strategy params
- [ ] Lookup table population on create/update
- [ ] JOIN-based search returns precise results
- [ ] Trigram indexes generated and functional
- [ ] `__sharedTokens` columns populated
- [ ] Re-index tool works for all resource types
- [ ] 20+ new tests passing
- [ ] Zero regressions

---

## Phase 20: Conditional Operations, $everything & Multi-Sort

**Duration:** 4-6 days  
**Complexity:** Medium-High  
**Risk:** Medium  
**Depends On:** Phase 19

### Objectives

Implement FHIR conditional create/update, Patient `$everything` operation, and multi-field sort.

### Tasks

#### Task 20.1: Conditional Create (`If-None-Exist`)

- `POST /Patient` with `If-None-Exist: identifier=http://example.com|12345`
- Search for matching resource; if found, return existing; if not, create
- Must be atomic (inside transaction)

#### Task 20.2: Conditional Update

- `PUT /Patient?identifier=http://example.com|12345`
- Search for match: 0 found → create; 1 found → update; 2+ found → error 412
- Atomic transaction

#### Task 20.3: Conditional Delete

- `DELETE /Patient?identifier=http://example.com|12345`
- Search, soft-delete all matches

#### Task 20.4: `$everything` Operation

- `GET /Patient/123/$everything`
- Uses compartment column to find all resources in Patient compartment
- Returns Bundle with Patient + all related resources

#### Task 20.5: Multi-Sort

- `_sort=family,-birthdate` → ORDER BY family ASC, birthdate DESC
- Parse multiple sort fields, generate composite ORDER BY

#### Task 20.6: EXPLAIN Logging

- Optional query plan logging for slow queries
- `EXPLAIN ANALYZE` integration for development mode

#### Task 20.7: Tests

- 15+ tests covering conditional operations, $everything, multi-sort

### Acceptance Criteria

- [ ] Conditional create/update/delete work atomically
- [ ] `$everything` returns complete patient compartment
- [ ] Multi-sort with ASC/DESC works
- [ ] EXPLAIN logging available in dev mode
- [ ] 15+ new tests passing
- [ ] Zero regressions

---

## Phase 21: Bundle Transaction/Batch, Cache & Retry

**Duration:** 5-7 days  
**Complexity:** Very High  
**Risk:** High  
**Depends On:** Phase 20

### Objectives

Implement FHIR Bundle processing (transaction and batch modes), read cache, and serialization conflict retry.

### Tasks

#### Task 21.1: Bundle Transaction Processing

- `POST /` with `Bundle.type = 'transaction'`
- All entries processed in a single PostgreSQL transaction
- Rollback all on any failure
- Support: create, update, delete, conditional operations within bundle
- Resolve internal references (`urn:uuid:...`)

#### Task 21.2: Bundle Batch Processing

- `POST /` with `Bundle.type = 'batch'`
- Each entry processed independently
- Individual success/failure per entry
- Return response Bundle with per-entry outcomes

#### Task 21.3: Read Cache (LRU)

**File:** `packages/fhir-persistence/src/cache/`

- In-memory LRU cache for `readResource` results
- Cache key: `{resourceType}/{id}`
- Invalidation: on update and delete
- Configurable max size and TTL
- Optional: disabled by default, enabled via config

#### Task 21.4: Serialization Conflict Retry

**File:** `packages/fhir-persistence/src/db/client.ts`

- Detect PostgreSQL error code `40001` (serialization_failure)
- Auto-retry with exponential backoff (max 3 retries)
- Only applies when using SERIALIZABLE or REPEATABLE READ isolation
- Log retry attempts

#### Task 21.5: Tests

- 15+ tests (bundle transaction, batch, cache hit/miss/invalidation, retry)
- Concurrency tests for cache consistency

### Acceptance Criteria

- [ ] Transaction bundle: all-or-nothing processing
- [ ] Batch bundle: per-entry outcomes
- [ ] Internal reference resolution (`urn:uuid:...`)
- [ ] Cache reduces DB reads for repeated access
- [ ] Cache correctly invalidated on writes
- [ ] Serialization retry works under concurrent load
- [ ] 15+ new tests passing
- [ ] Zero regressions

---

## Phase 22: Comprehensive Validation & Hardening

**Duration:** 4-5 days  
**Complexity:** Medium  
**Risk:** Low  
**Depends On:** Phase 21

### Objectives

Final validation pass before declaring DB + Repo complete. Cross-validate against Medplum, run stress tests, and ensure no gaps remain.

### Tasks

#### Task 22.1: Full DDL Cross-Validation

- For all 146 resource types: compare generated DDL against Medplum's physical DB
- Report: columns present/missing, type mismatches, index differences
- Automated diff script

#### Task 22.2: Repo API Completeness Audit

- Verify every method on `ResourceRepository` interface has:
  - Unit tests (mock DB)
  - Integration tests (real DB)
  - HTTP E2E tests (where applicable)
  - Error path coverage

#### Task 22.3: Stress Testing

- Concurrent create/update/delete (50+ parallel operations)
- Large resource payloads (1MB+ JSON)
- Search on tables with 10K+ rows
- History table growth behavior

#### Task 22.4: Edge Case Testing

- Unicode/CJK characters in all string fields
- Empty arrays, null values, deeply nested resources
- Maximum identifier count per resource
- Duplicate token handling

#### Task 22.5: Documentation

- Final Stage-4 completion report
- DB schema documentation (all column types and purposes)
- Repo API documentation (all methods, error codes, behavior)

### Acceptance Criteria

- [ ] All 146 resource types DDL validated against Medplum
- [ ] All Repo API methods have 3-layer test coverage
- [ ] Stress tests pass without data corruption
- [ ] Edge cases documented and tested
- [ ] Final test count documented
- [ ] Zero TypeScript errors, zero test failures

---

## Success Metrics

| Metric | Target |
|--------|--------|
| New tests (Stage-4 total) | 100+ |
| Final total test count | 850+ |
| Resource types DDL validated | 146 / 146 |
| Repo API methods covered | 100% |
| Chained search depth | 1 level |
| `_include:iterate` depth | 3 levels |
| Concurrent stress operations | 50+ without corruption |
| Cache hit rate (repeated reads) | > 90% |
| Bundle transaction size | 50+ entries |

---

## Stage-4 Completion Checklist

- [ ] Phase 18: Chained search & advanced include
- [ ] Phase 19: Lookup tables, trigram indexes & re-index tool
- [ ] Phase 20: Conditional operations, $everything & multi-sort
- [ ] Phase 21: Bundle transaction/batch, cache & retry
- [ ] Phase 22: Comprehensive validation & hardening
- [ ] All tests passing
- [ ] Zero TypeScript errors
- [ ] Documentation complete
- [ ] Schema matches Medplum (146 resource types validated)
- [ ] **DB + Repo declared production-grade**

---

## Post-Stage-4 Path

After Stage-4 completion, the DB and Repo layer is frozen for structural changes. Subsequent stages:

| Stage | Focus |
|-------|-------|
| Stage-5 | Authentication / Authorization (JWT, SMART on FHIR) |
| Stage-6 | FHIR Client SDK + Frontend UI |
| Stage-7 | Chinese Localization (pinyin indexing, CN-Profiles, i18n, terminology) |

Chinese localization (as defined in `CHINESE-NATIVE-SUPPORT.md`) is intentionally placed after DB/Repo maturity, per user directive. Pinyin indexing columns will be added to the frozen schema via a migration mechanism implemented in Stage-7.

---

## Risk Management

### High-Risk Areas

1. **Chained search SQL complexity** (Phase 18) — Mitigate: single-level only, test with EXPLAIN ANALYZE
2. **Lookup table write overhead** (Phase 19) — Mitigate: batch inserts, benchmark before/after
3. **Bundle transaction atomicity** (Phase 21) — Mitigate: comprehensive rollback tests
4. **Cache consistency** (Phase 21) — Mitigate: cache-aside pattern, conservative TTL

### Contingency Plans

- If lookup tables cause >50% write slowdown: keep sort-column approach, add trigram only
- If chained search is too slow: add materialized views for common chains
- If bundle size >100 entries causes timeouts: implement streaming bundle processing

---

## References

- [Stage-3-Development-Roadmap.md](./Stage-3-Development-Roadmap.md) — Predecessor stage
- [CHINESE-NATIVE-SUPPORT.md](../CHINESE-NATIVE-SUPPORT.md) — Chinese localization plan (post Stage-4)
- [FHIR R4 Search — Chained Parameters](https://hl7.org/fhir/R4/search.html#chaining)
- [FHIR R4 — Bundle Transaction](https://hl7.org/fhir/R4/http.html#transaction)
- [FHIR R4 — Conditional Operations](https://hl7.org/fhir/R4/http.html#cond-update)
- [FHIR R4 — $everything](https://hl7.org/fhir/R4/patient-operation-everything.html)
- [Medplum Repo Implementation](https://github.com/medplum/medplum/tree/main/packages/server/src/fhir)

---

**This roadmap is a living document. Update as phases complete.**
