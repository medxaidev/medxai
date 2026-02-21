# ADR-005: FHIR Persistence Architecture for Platform-Level Hospital Deployment

## Status

**Status:** Accepted  
**Date:** 2026-02-18  
**Deciders:** Core Architecture Team  
**Supersedes:** ADR-005 (Planned: "Database Schema Design for FHIR Resources")  
**Superseded by:** None

---

## Context

The system is designed as a **platform-level FHIR Server** targeting hospital-scale deployment.

### Key Requirements

- High database performance under sustained load
- Strong transactional stability (ACID guarantees)
- Large-scale data volume (millions of Observations, hundreds of thousands of Patients)
- Efficient search and retrieval across resource types
- Long-term schema stability with minimal migration risk
- Controlled development complexity
- Alignment with Medplum-style implementation to reduce development effort

### Options Evaluated

Two architectural approaches were evaluated:

#### Option 1: HAPI-Style Unified Resource Table + Search Index Tables

All resource types share a single `hfj_resource` table. Searched fields are extracted into generic `SPIDX_*` tables (string, token, date, quantity, reference, URI, number, coords).

**Pros:**
- Fully generic — supports any resource type dynamically
- No schema migration when new resource types are added
- Runtime extensibility for arbitrary IGs

**Cons:**
- Unified table grows excessively large at hospital scale
- Heavy multi-table join patterns required for every search
- SPIDX_* tables multiply storage requirements
- Query planning becomes unpredictable under load
- Performance tuning requires deep database expertise
- Not aligned with our target deployment context

#### Option 2: Medplum-Style Per-Resource Tables ✅

Each FHIR resource type has its own physical table. Each resource type has a dedicated history table. Full resource JSON is stored in a JSONB column. Frequently searched fields are stored as indexed physical columns.

**Pros:**
- Strong relational query performance
- Clear, predictable indexing strategies
- Independent scaling per resource type
- Better partitioning strategies (e.g., partition Observation by date)
- Predictable query plans
- Easier BI/analytics integration
- Operational stability under high load
- Alignment with Medplum (lower implementation cost)

**Cons:**
- Schema migrations required for major resource structural changes
- Less flexibility for arbitrary IG runtime loading
- More initial database planning required

---

## Decision

We adopt a **Medplum-style per-resource table architecture** with phased development sequencing.

### Core Architectural Commitments

1. Each FHIR resource type has its own physical table (e.g., `patient`, `observation`, `condition`).
2. Each resource type has a dedicated history table (e.g., `patient_history`, `observation_history`).
3. Full resource JSON is stored in a `JSONB` column on each table.
4. Frequently searched fields are stored as indexed physical columns alongside the JSONB.
5. `SearchParameter` drives the indexing strategy, not the table structure.
6. The persistence layer must be stable before introducing `SearchParameter` search complexity.

### Critical Separation of Concerns

```
StructureDefinition  →  Defines table structure (schema)
SearchParameter      →  Defines index strategy (query optimization)
```

These must not be coupled. Table structure is driven by resource schema stability. `SearchParameter` only affects:
- Which physical columns are indexed
- Query translation logic
- SQL generation in the search layer

---

## Phased Development Strategy

### Phase A — Persistence Core (Foundational Stability)

**Goal:** Ensure reliable storage before introducing search complexity.

**Includes:**
- StructureDefinition-based table generation
- Resource JSON (JSONB) storage
- Versioning support (`versionId`, `lastUpdated`)
- History table implementation
- Transactional CRUD operations (create, read, update, delete)
- Repository abstraction layer

**Explicitly excluded:**
- `SearchParameter` execution
- Chained search
- Composite search
- `_include` / `_revinclude`

**Acceptance Criteria:**
- Resources can be created, updated, versioned, and retrieved safely
- Database schema is stable and migration-safe
- Transactions are reliable (ACID)
- History tracking is correct and queryable

---

### Phase B — Search Index Layer

**Goal:** Introduce `SearchParameter`-driven indexing.

**Includes:**
- `SearchParameter` parsing and registration
- Mapping `SearchParameter` → physical indexed columns
- Index generation strategy
- SQL `WHERE` clause builder
- Basic token, string, date, reference filtering

**Still excluded:**
- Chained search
- `_include` / `_revinclude`
- Complex FHIR search modifiers

---

### Phase C — Search Execution Engine

**Goal:** Full FHIR search compliance.

**Includes:**
- Chained search (`subject.name`)
- Reverse include (`_revinclude`)
- Sorting (`_sort`)
- Pagination (`_count`, `_page`, cursor-based)
- Composite parameters
- Multiple AND/OR semantics
- `_summary` and `_elements` projections

---

## Architectural Rationale

### Why Not HAPI-Style at Hospital Scale?

HAPI is optimized for:
- Generic FHIR server engines serving arbitrary IGs
- Dynamic profile loading at runtime
- Maximum runtime extensibility

For hospital-scale platform deployment:
- Unified table grows excessively large (millions of rows across all types)
- Heavy join patterns degrade under load
- SPIDX_* tables multiply storage and index maintenance cost
- Query planning becomes less predictable
- Performance tuning requires deep database expertise

Given our target is **hospital platform deployment** — not a generic public FHIR engine — the unified table model is suboptimal.

### Why Per-Resource Tables Scale Better?

Hospital systems typically have:
- Stable core resource types (Patient, Observation, Condition, Encounter, etc.)
- Limited structural mutation over time
- Heavy read/query workload (clinical dashboards, analytics)
- Predictable access patterns per resource type

Per-resource tables provide:
- Independent table statistics for the query planner
- Resource-specific partitioning (e.g., Observation by `effectiveDateTime`)
- Targeted index maintenance
- Simpler BI/analytics queries (no joins to generic index tables)

---

## Key Design Principle

> **"If SearchParameter is disabled, persistence still works perfectly."**

If this principle is violated, the architecture is incorrectly coupled.

---

## Development Sequencing Rationale

The 7-step roadmap for the next development stage is:

| Step | Component | Rationale |
|------|-----------|-----------|
| 1 | FHIR Model completeness | Foundation for all downstream work |
| 2 | StructureDefinition → Table generation | Schema must exist before data can be stored |
| 3 | Repository stable write (with transactions) | Persistence must be reliable before search |
| 4 | History mechanism | Versioning is part of core persistence, not search |
| 5 | Server API (basic CRUD) | REST layer over stable persistence |
| 6 | SearchParameter index layer | Index strategy, not execution |
| 7 | Search execution layer | Full search only after index layer is stable |

This sequencing ensures each layer is independently verifiable before the next is built.

---

## Consequences

### Positive

- High database performance at hospital scale
- Predictable scaling behavior per resource type
- Strong transactional guarantees (ACID)
- Clear operational boundaries between persistence and search
- Reduced architectural risk
- Alignment with Medplum (lower implementation cost)
- Suitable for hospital-scale deployment
- Supports future multi-hospital and horizontal sharding

### Negative

- Schema migrations required for major resource structural changes
- Less flexibility for arbitrary IG runtime loading
- More initial database planning required

These tradeoffs are acceptable given the deployment context.

---

## Long-Term Vision

This architecture supports:
- Multi-hospital deployment
- Horizontal sharding by resource type or tenant
- Resource-based partitioning
- Analytical integration (direct SQL on typed tables)
- Runtime index optimization
- Controlled feature evolution

The system is positioned as:

> **"A Hospital-Grade FHIR Persistence Platform"**

Not as:

> "A Generic Public FHIR Engine"

---

## References

- [Medplum Architecture](https://www.medplum.com/docs/self-hosting/architecture) — Per-resource table design reference
- [HAPI FHIR JPA Server](https://hapifhir.io/hapi-fhir/docs/server_jpa/) — HAPI unified table approach (evaluated and rejected for this context)
- [FHIR R4 REST API](https://hl7.org/fhir/R4/http.html) — FHIR HTTP specification
- [FHIR SearchParameter](https://hl7.org/fhir/R4/searchparameter.html) — Search parameter specification
- [ADR-001](./ADR-001-HAPI-Inspired-Architecture.md) — HAPI-Inspired Architecture (algorithm reference, not persistence model)

---

## Related Documents

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — System layering
- [Stage-2-Development-Roadmap.md](../stages/Stage-2-Development-Roadmap.md) — Detailed implementation plan
- [ADR-001](./ADR-001-HAPI-Inspired-Architecture.md) — Core architectural approach

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-18 | 1.0 | Initial decision — per-resource table architecture + phased development strategy | Architecture Team |
