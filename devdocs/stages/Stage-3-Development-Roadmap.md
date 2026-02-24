# Stage-3 Development Roadmap: Advanced Search & Runtime

## Status

**Status:** 🚧 Active  
**Version:** v1.0  
**Stage:** Stage-3 (Advanced Search & Runtime)  
**Estimated Duration:** 4-6 weeks  
**Last Updated:** 2026-02-24  
**Depends On:** Stage-2 ✅ Complete (Phases 7-13)

---

## Overview

Stage-3 transforms the Stage-2 foundation into a **production-capable FHIR search engine**. Stage-2 built the schema generation, CRUD repository, and basic search SQL framework. Stage-3 closes the remaining gaps to make search actually work end-to-end with real data, and adds advanced search features required by clinical workflows.

**Stage-3 Goal:** A fully functional FHIR search system where resources are indexed on write, searchable via all standard parameter types, and support advanced features like chained search, `_include`/`_revinclude`, and metadata parameters.

---

## Design Principles

1. **Index on Write** — Search columns are populated during `create`/`update`, not at query time.
2. **FHIRPath-driven extraction** — Search column values are extracted from resource JSON using FHIRPath expressions from SearchParameterRegistry.
3. **Incremental feature addition** — Each phase adds independently testable search capabilities.
4. **Medplum compatibility** — Schema and behavior should align with Medplum where possible, with documented deviations.
5. **Test-first verification** — Each phase must include integration tests against real PostgreSQL.

---

## 4-Phase Plan

```
Phase 14: Row Indexer & Search Integration
Phase 15: Metadata Search Parameters & Token Enhancement
Phase 16: Chained Search & _include/_revinclude
Phase 17: Search Performance & Optimization
```

---

## Phase 14: Row Indexer & Search Integration

**Duration:** 5-7 days  
**Complexity:** High  
**Risk:** Medium-High  
**Depends On:** Phase 13  
**Detailed Plan:** [Phase-14-Detailed-Plan.md](./Phase-14-Detailed-Plan.md)

### Objectives

Implement the **Row Indexer** — the component that extracts search parameter values from FHIR resource JSON and populates the corresponding search columns during `create`/`update`. Then verify the full search pipeline end-to-end: HTTP request → SQL → real PostgreSQL → Bundle.

This is the **most critical missing piece** from Stage-2. Without it, search columns remain empty and queries return no results.

### Key Components

1. **Row Indexer** — Extracts values from resource JSON using FHIRPath expressions
2. **Search Column Writer** — Populates search columns in SQL INSERT/UPDATE
3. **Search Integration Tests** — Full pipeline with real PostgreSQL
4. **HTTP Search E2E Tests** — Full HTTP path with real DB

### Tasks

#### Task 14.1: Row Indexer Implementation

**File:** `packages/fhir-persistence/src/repo/row-indexer.ts`

- Extract search parameter values from resource JSON
- Use `SearchParameterRegistry` to get FHIRPath expressions per resource type
- Handle type coercion: string → TEXT, reference → TEXT/TEXT[], token → UUID[], date → TIMESTAMPTZ
- Handle array vs scalar columns
- Token hashing: `system|code` → UUID hash (matching Medplum's approach)

#### Task 14.2: SQL Builder Integration

- Extend `sql-builder.ts` to include search column values in INSERT/UPDATE
- Row indexer output feeds into SQL parameter list
- Handle NULL for optional search columns

#### Task 14.3: Reference Table Population

- On create/update, extract all Reference values from resource JSON
- INSERT into `{ResourceType}_References` table
- DELETE old references on update (replace strategy)

#### Task 14.4: Search Integration Tests (real DB)

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts`

- 15+ tests covering: token, date, string, reference, number, uri search
- Pagination, sort, total count
- Deleted resources excluded from search
- Update reflects new values in search

#### Task 14.5: HTTP Search E2E Tests

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts`

- 10+ tests covering: GET search, POST _search, pagination links, empty results

### Acceptance Criteria

- [ ] Row indexer correctly extracts values for all 6 search parameter types
- [ ] Search columns populated on create and update
- [ ] Reference table populated on create and update
- [ ] Full search pipeline works end-to-end (HTTP → SQL → DB → Bundle)
- [ ] 40+ new tests passing
- [ ] Zero regressions on existing 589 Stage-2 tests

---

## Phase 15: Metadata Search Parameters & Token Enhancement

**Duration:** 4-6 days  
**Complexity:** Medium  
**Risk:** Medium  
**Depends On:** Phase 14

### Objectives

Add support for FHIR metadata search parameters (`_tag`, `_security`, `_profile`, `_source`) and enhance token search to support `system|code` syntax, `:text` modifier, and `:of-type` modifier.

### Tasks

#### Task 15.1: Metadata Parameter Columns

- Add `___tag`, `___tagText`, `___tagSort` columns to schema generation
- Add `___securitySort` column
- Row indexer extracts `meta.tag`, `meta.security` values

#### Task 15.2: Token Search Enhancement

- Support `system|code` syntax: `GET /Patient?identifier=http://example.com|12345`
- Support `|code` (any system) and `system|` (any code)
- `:text` modifier for display text search
- `:not` modifier for negation

#### Task 15.3: Reference Lookup Sort Columns

- Add `__*IdentifierSort` columns for reference parameters
- Populate from referenced resource's identifier

#### Task 15.4: Tests

- 30+ new tests covering metadata params and token enhancements

### Acceptance Criteria

- [ ] `_tag`, `_security` search works
- [ ] Token `system|code` syntax works
- [ ] Reference sort columns populated
- [ ] 30+ new tests passing

---

## Phase 16: Chained Search & _include/_revinclude

**Duration:** 6-8 days  
**Complexity:** Very High  
**Risk:** High  
**Depends On:** Phase 15

### Objectives

Implement chained search parameters and resource inclusion, the two most complex FHIR search features.

### Tasks

#### Task 16.1: Chained Search

- `GET /Observation?subject:Patient.name=Smith`
- Translate to SQL JOIN on `{ResourceType}_References` table
- Support single-level chaining (multi-level deferred)

#### Task 16.2: _include

- `GET /MedicationRequest?_include=MedicationRequest:patient`
- After primary search, load referenced resources
- Add to Bundle with `search.mode = 'include'`

#### Task 16.3: _revinclude

- `GET /Patient?_revinclude=Observation:subject`
- After primary search, find resources that reference the results
- Add to Bundle with `search.mode = 'include'`

#### Task 16.4: Tests

- 40+ new tests covering chained search and include/revinclude

### Acceptance Criteria

- [ ] Single-level chained search works
- [ ] `_include` loads referenced resources
- [ ] `_revinclude` loads reverse references
- [ ] Include results have `search.mode = 'include'`
- [ ] 40+ new tests passing

---

## Phase 17: Search Performance & Optimization

**Duration:** 3-5 days  
**Complexity:** Medium  
**Risk:** Low  
**Depends On:** Phase 16

### Objectives

Optimize search performance for production workloads. Add trigram indexes for fuzzy text search, shared token indexes, and query plan analysis.

### Tasks

#### Task 17.1: Trigram Indexes

- Add `pg_trgm` extension support
- Generate `*TextTrgm` GIN indexes for token text columns
- Support `:contains` modifier with trigram acceleration

#### Task 17.2: Shared Token Index

- Add `__sharedTokens`, `__sharedTokensText` columns
- Unified index across `_tag`, `_security`, `identifier`

#### Task 17.3: Query Plan Analysis

- Add EXPLAIN ANALYZE logging for slow queries
- Benchmark: simple search < 50ms, complex search < 200ms

#### Task 17.4: Lookup-table JOIN Implementation

- Implement JOIN-based search for `name`, `address`, `telecom` parameters
- Create lookup tables (`Patient_name`, `Patient_address`, etc.)
- Populate on write via row indexer

#### Task 17.5: Tests & Benchmarks

- 20+ new tests
- Performance benchmark suite

### Acceptance Criteria

- [ ] Trigram indexes generated and functional
- [ ] Shared token index working
- [ ] Lookup-table JOIN search works for name/address/telecom
- [ ] Simple search p99 < 50ms
- [ ] 20+ new tests passing

---

## Success Metrics

| Metric                          | Target             |
| ------------------------------- | ------------------ |
| New implementation files        | 10-15              |
| New test files                  | 8-12               |
| New tests (Stage-3)             | 130-200            |
| Search parameter types working  | 6 (all end-to-end) |
| Chained search depth            | 1 level            |
| _include/_revinclude            | ✅                 |
| Metadata params (_tag, _security)| ✅                |
| Simple search latency (p99)     | < 50ms             |
| Complex search latency (p99)    | < 200ms            |

---

## Stage-3 Completion Checklist

- [ ] Phase 14: Row indexer & search integration
- [ ] Phase 15: Metadata params & token enhancement
- [ ] Phase 16: Chained search & _include/_revinclude
- [ ] Phase 17: Search performance & optimization
- [ ] All tests passing (130+ new tests)
- [ ] Zero TypeScript errors
- [ ] Documentation updated
- [ ] Schema matches Medplum (all columns accounted for)

---

## Risk Management

### High-Risk Areas

1. **Row indexer FHIRPath evaluation performance** (Phase 14)
   - Mitigation: Cache parsed expressions, batch extraction per resource type

2. **Chained search SQL complexity** (Phase 16)
   - Mitigation: Limit to single-level chaining initially, use EXPLAIN ANALYZE

3. **Token hashing compatibility with Medplum** (Phase 14)
   - Mitigation: Study Medplum's `generateId()` hash function, replicate exactly

### Contingency Plans

- If row indexer is too slow: Defer to async background indexing
- If chained search is too complex: Defer to Stage-4, focus on _include first
- If trigram indexes cause write slowdown: Make optional per deployment

---

## References

- [Stage-2-Development-Roadmap.md](./Stage-2-Development-Roadmap.md)
- [TEST-PLAN-002](./TEST-PLAN-002_schema-and-api-verification.md)
- [REVIEW-001](./REVIEW-001_Phase-1-to-12-Review.md)
- [FHIR R4 Search](https://hl7.org/fhir/R4/search.html)
- [FHIR R4 Search — Chained Parameters](https://hl7.org/fhir/R4/search.html#chaining)
- [FHIR R4 Search — Including Other Resources](https://hl7.org/fhir/R4/search.html#include)
- [Medplum Search Implementation](https://github.com/medplum/medplum/tree/main/packages/server/src/fhir)

---

**This roadmap is a living document. Update as phases complete.**
