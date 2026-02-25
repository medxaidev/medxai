# REVIEW-002: Phase 1-22 Audit Skeleton (Template)

```yaml
document_type: audit_template
version: v1.0
status: ready_to_use
scope: Phase 1 through Phase 22
mode: planning_only (no execution)
owner: <fill>
reviewers: <fill>
created_at: <fill>
last_updated: <fill>
```

---

## 1) Purpose

This template is used to run a structured audit from **Phase 1 to Phase 22**.
It is designed to identify:

- **Issue points** (confirmed defects/inconsistencies)
- **Risk points** (not yet failing, but likely to fail under conditions)
- **Mitigations and priorities** (P0/P1/P2/P3)

---

## 2) How to Use This Template

1. Fill the **Master Audit Matrix** first (one row per phase).
2. For each phase, complete the **Phase Audit Card**.
3. Keep **Issue** and **Risk** separate.
4. Add code/doc/test evidence links using repository paths.
5. At the end, compile **Top 10 risks** and a **Go/No-Go recommendation**.

---

## 3) Severity and Priority Standard

| Priority | Meaning | Typical Action |
| --- | --- | --- |
| P0 | Data correctness, transaction consistency, protocol correctness, safety | Fix immediately, block release |
| P1 | High probability production regression | Fix before release |
| P2 | Edge-case or medium operational risk | Schedule in near-term sprint |
| P3 | Maintainability/documentation/process gaps | Backlog and continuously improve |

---

## 4) Audit Dimensions (Apply to Every Phase)

| Dimension | Key Question |
| --- | --- |
| Goal Completion | Did implementation fully meet phase goals and acceptance criteria? |
| Code-Doc Consistency | Do code behaviors match roadmap/devdocs/ADRs? |
| Test Effectiveness | Do tests validate risks, not only happy paths? |
| Cross-Phase Dependency | Are assumptions from previous phases still valid? |
| HAPI/Medplum Alignment | Is the chosen pattern clearly aligned or intentionally different? |
| Runtime Safety | Any concurrency, transaction, idempotency, or rollback gaps? |
| Data Integrity | Any versioning, history, indexing, reference integrity gaps? |
| Search/Query Semantics | Any mismatch with FHIR behavior for edge syntax/modifiers? |
| Operability | Any migration, observability, or maintenance blind spots? |

---

## 5) Master Audit Matrix (Phase 1-22)

| Phase | Name | Stage | Status | Main Package(s) | Issue Count | Risk Count | Highest Priority | Decision | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Foundation (fhir-model) | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 2 | fhir-parser | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 3 | fhir-context | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 4 | fhir-profile (snapshot generation) | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 5 | fhir-validator | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 6 | fhir-fhirpath | Stage-1 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 7 | Model completeness & bundle loading | Stage-2 | ☐ Not Started | fhir-core |  |  |  |  |  |  |
| 8 | StructureDefinition → table generation | Stage-2 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 9 | Repository stable write (transactions) | Stage-2 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 10 | History mechanism | Stage-2 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 11 | Server API basic CRUD | Stage-2 | ☐ Not Started | fhir-server |  |  |  |  |  |  |
| 12 | SearchParameter index layer | Stage-2 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 13 | Search execution layer | Stage-2 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 14 | Row indexer & search integration | Stage-3 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 15 | Metadata search params & token enhancement | Stage-3 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 16 | _include/_revinclude & reference population | Stage-3 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 17 | Lookup-table search completeness | Stage-3 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 18 | Chained search & advanced include | Stage-4 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 19 | Lookup tables, trigram indexes, re-index tool | Stage-4 | ☐ Not Started | fhir-persistence |  |  |  |  |  |  |
| 20 | Compartment search, conditional ops, $everything | Stage-4 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 21 | Bundle transaction/batch, cache, retry | Stage-4 | ☐ Not Started | fhir-persistence, fhir-server |  |  |  |  |  |  |
| 22 | Comprehensive validation & hardening | Stage-4 | ☐ Not Started | all |  |  |  |  |  |  |

---

## 6) Phase Audit Cards (Pre-Filled Skeleton)

> Use one card per phase. All fields are intentionally blank for audit execution.

### Phase 1 — Foundation (fhir-model)

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are type definitions complete for planned downstream parser/context/profile needs?
- [ ] Any type-level ambiguity that can create runtime interpretation drift?
- [ ] Are breaking changes documented and versioned?

### Phase 2 — fhir-parser

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Do parse/serialize round-trips preserve semantic equivalence?
- [ ] Are choice types, primitive extensions, and arrays handled correctly?
- [ ] Are parse errors explicit, actionable, and stable?

### Phase 3 — fhir-context

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Is definition loading deterministic and cache-safe?
- [ ] Is inheritance resolution cycle-safe and invalidation-safe?
- [ ] Are context statistics and errors trustworthy for operations?

### Phase 4 — fhir-profile (snapshot generation)

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Is differential → snapshot merge behavior deterministic?
- [ ] Are slicing and constraints merged per expected semantics?
- [ ] Any unresolved differential elements or silent fallback behavior?

### Phase 5 — fhir-validator

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are cardinality/type/fixed/pattern/reference checks complete?
- [ ] Are validation issue codes consistent and mappable to API outcomes?
- [ ] Any false-positive/false-negative patterns in fixture tests?

### Phase 6 — fhir-fhirpath

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are parser/evaluator semantics stable for core operators and functions?
- [ ] Is cache behavior correct under repeated and mixed expressions?
- [ ] Any correctness vs performance trade-offs undocumented?

### Phase 7 — Model completeness & bundle loading

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are all relevant FHIR bundles loadable with clear partial-failure reporting?
- [ ] Are platform stubs/versioning/loading order documented and verified?
- [ ] Any canonical profile fields missing for Phase 8+?

### Phase 8 — StructureDefinition → table generation

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Is schema generation deterministic and idempotent?
- [ ] Are all fixed columns/indexes/constraints aligned with design docs?
- [ ] Any strategy mismatch in SearchParameter registry mapping?

### Phase 9 — Repository stable write (transactions)

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are create/update/delete operations fully transactional?
- [ ] Is optimistic concurrency (`ifMatch`) enforced correctly?
- [ ] Are rollback semantics validated for mid-transaction failures?

### Phase 10 — History mechanism

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Is history append-only and version identity unique?
- [ ] Is vread/history retrieval consistent with repository states?
- [ ] Are delete/update interactions reflected correctly in history?

### Phase 11 — Server API basic CRUD

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are FHIR response headers and status codes consistent?
- [ ] Is error → OperationOutcome mapping complete and stable?
- [ ] Any route ambiguity or unsupported edge semantics?

### Phase 12 — SearchParameter index layer

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are search prefixes/modifiers parsed correctly and safely?
- [ ] Is SQL generation parameterized and injection-safe?
- [ ] Are unsupported parameters explicitly surfaced or silently ignored?

### Phase 13 — Search execution layer

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are Bundle `searchset` semantics complete (entries, links, totals)?
- [ ] Is pagination behavior stable and deterministic?
- [ ] Any divergence between HTTP and direct executor behavior?

### Phase 14 — Row indexer & search integration

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are indexed columns fully populated on create/update paths?
- [ ] Are token/reference/date/string extraction rules consistent?
- [ ] Any stale-index risk across updates/deletes?

### Phase 15 — Metadata search params & token enhancement

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are `_tag`, `_security`, `_profile`, `_source` fully supported end-to-end?
- [ ] Are token `system|code`, `|code`, `system|`, and modifiers correctly handled?
- [ ] Any schema/index naming mismatch that can break queries?

### Phase 16 — _include/_revinclude & reference population

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are include/revinclude results complete and deduplicated?
- [ ] Is reference extraction robust for nested and mixed reference formats?
- [ ] Any unbounded expansion or memory pressure risks?

### Phase 17 — Lookup-table search completeness

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are lookup-table/search strategy semantics clearly defined and tested?
- [ ] Is sorting/contains/exact behavior consistent across parameter types?
- [ ] Any performance regressions under realistic cardinality?

### Phase 18 — Chained search & advanced include

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are chained queries semantically correct and SQL-safe?
- [ ] Are iterate/wildcard include behaviors bounded and cycle-safe?
- [ ] Are compartment-related filters compatible with chained/include paths?

### Phase 19 — Lookup tables, trigram indexes, re-index tool

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are global lookup tables and indexes generated as intended?
- [ ] Are trigram/function indexes valid and migration-safe?
- [ ] Is re-index operation correct, resumable, and observable?

### Phase 20 — Compartment search, conditional ops, $everything

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are compartment filters accurate and complete by resource context?
- [ ] Are conditional create/update/delete semantics race-safe?
- [ ] Is `$everything` bounded, paginated, and deterministic?

### Phase 21 — Bundle transaction/batch, cache, retry

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are transaction and batch semantics correctly separated?
- [ ] Are cache invalidation boundaries complete on all write paths?
- [ ] Are retry policies safe (no duplicate side effects)?

### Phase 22 — Comprehensive validation & hardening

| Field | Value |
| --- | --- |
| Scope | |
| Evidence (Docs/Code/Tests) | |
| Goal Completion | |
| Code-Doc Consistency | |
| Dependency Risks | |
| HAPI/Medplum Alignment Notes | |
| Final Risk Level | |
| Decision (Pass / Conditional / Block) | |

**Checklist Questions**
- [ ] Are all prior phase risks closed, accepted, or formally deferred?
- [ ] Is release readiness backed by measurable gates (tests, perf, operations)?
- [ ] Are rollback, migration, and incident-response paths documented?

---

## 7) Cross-Phase Risk Register (Empty)

| Risk ID | Phase(s) | Type (Issue/Risk) | Description | Trigger | Impact | Priority | Mitigation | Owner | ETA | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 |  |  |  |  |  |  |  |  |  |  |
| R-002 |  |  |  |  |  |  |  |  |  |  |
| R-003 |  |  |  |  |  |  |  |  |  |  |
| R-004 |  |  |  |  |  |  |  |  |  |  |
| R-005 |  |  |  |  |  |  |  |  |  |  |

---

## 8) Final Summary Output (To Fill After Audit)

### 8.1 Top 10 Risks

1. <fill>
2. <fill>
3. <fill>
4. <fill>
5. <fill>
6. <fill>
7. <fill>
8. <fill>
9. <fill>
10. <fill>

### 8.2 Quick Wins (<= 1 day each)

- <fill>
- <fill>
- <fill>

### 8.3 Release Gate Recommendation

- **Recommendation:** ☐ Go / ☐ Conditional Go / ☐ No-Go
- **Blocking Items:**
  - <fill>
- **Required Before Release:**
  - <fill>
- **Can Defer to Next Iteration:**
  - <fill>

---

_This is a planning template only. Do not treat unchecked fields as completed audit results._
