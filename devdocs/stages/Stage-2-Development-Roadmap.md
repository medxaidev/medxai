# Stage-2 Development Roadmap: FHIR Persistence Platform

## Status

**Status:** Planned  
**Version:** v1.0  
**Stage:** Stage-2 (FHIR Persistence Platform)  
**Estimated Duration:** 8-12 weeks  
**Last Updated:** 2026-02-18  
**Depends On:** Stage-1 ✅ Complete (Phases 1-6)

---

## Overview

Stage-2 builds the **FHIR Persistence Platform** — the database storage, versioning, history, and REST API layer that transforms the Stage-1 semantic engine into a running FHIR server.

**Stage-2 Goal:** A hospital-grade FHIR server capable of reliable resource storage, versioning, history tracking, and basic CRUD REST operations, with a clean foundation for search.

**Architectural Basis:** [ADR-005 — FHIR Persistence Architecture](../decisions/ADR-005-FHIR-Persistence-Architecture.md)

---

## Design Principles

1. **Persistence before Search** — Storage must be stable and correct before any search complexity is introduced.
2. **Per-resource tables** — Each FHIR resource type has its own physical table and history table (Medplum-style).
3. **JSONB + indexed columns** — Full resource JSON in JSONB; frequently searched fields as physical indexed columns.
4. **StructureDefinition drives schema; SearchParameter drives indexes** — These must not be coupled.
5. **Transactional integrity** — All writes are ACID; history is append-only.
6. **Incremental delivery** — Each phase produces independently testable, deployable output.

---

## 7-Phase Plan

```
Phase 7:  FHIR Model Completeness
Phase 8:  StructureDefinition → Table Generation
Phase 9:  Repository — Stable Write (with Transactions)
Phase 10: History Mechanism
Phase 11: Server API — Basic CRUD
Phase 12: SearchParameter Index Layer
Phase 13: Search Execution Layer
```

---

## Phase 7: FHIR Model Completeness

**Duration:** 3-5 days  
**Complexity:** Low  
**Risk:** Low  
**Depends On:** Phase 1-6 ✅

### Objectives

Ensure the FHIR model layer is complete and ready to drive table generation. All resource types needed for hospital deployment must be representable.

### Tasks

#### Task 7.1: Audit Existing Model Coverage

- Review `packages/fhir-core/src/model/` for missing FHIR R4 resource types
- Identify gaps: MedicationRequest, Encounter, Condition, DiagnosticReport, etc.
- Document which resource types are needed for Phase A (Persistence Core)

#### Task 7.2: Complete Core Resource Types

**Target resource types (minimum for hospital deployment):**

| Category | Resources |
|----------|-----------|
| Patient | Patient, RelatedPerson |
| Clinical | Observation, Condition, Procedure, AllergyIntolerance, Immunization |
| Medication | Medication, MedicationRequest, MedicationAdministration |
| Encounter | Encounter, EpisodeOfCare |
| Diagnostic | DiagnosticReport, Specimen, ImagingStudy |
| Documents | DocumentReference, Composition |
| Workflow | ServiceRequest, Task, Appointment |
| Infrastructure | Organization, Practitioner, PractitionerRole, Location, Device |
| Financial | Coverage, Claim, ExplanationOfBenefit |
| Terminology | ValueSet, CodeSystem, ConceptMap |
| Conformance | CapabilityStatement, SearchParameter |

#### Task 7.3: Canonical Model Extensions

- Ensure `CanonicalElement` supports all fields needed for table generation
- Add `tableColumn` metadata to `CanonicalElement` for schema generation hints
- Verify `Invariant`, `SlicingDefinition`, `TypeConstraint` are complete

#### Task 7.4: Model Tests

- Unit tests for all new resource type models
- Fixture-driven tests for parsing new resource types

### Acceptance Criteria

- [ ] All hospital-core resource types modeled
- [ ] `CanonicalElement` supports table generation metadata
- [ ] All existing tests still pass (no regressions)
- [ ] `tsc --noEmit` clean

---

## Phase 8: StructureDefinition → Table Generation

**Duration:** 5-8 days  
**Complexity:** Medium-High  
**Risk:** Medium  
**Depends On:** Phase 7

### Objectives

Generate SQL DDL (CREATE TABLE statements) from StructureDefinition snapshots. This is the bridge between the FHIR semantic model and the database schema.

### Architecture

```
StructureDefinition (snapshot)
        ↓
  TableSchemaGenerator
        ↓
  TableSchema (intermediate model)
        ↓
  DDLGenerator (PostgreSQL)
        ↓
  SQL DDL strings / migration files
```

### Tasks

#### Task 8.1: TableSchema Model

**File:** `packages/fhir-core/src/persistence/schema/table-schema.ts`

```typescript
interface TableSchema {
  tableName: string;           // e.g., 'patient'
  historyTableName: string;    // e.g., 'patient_history'
  resourceType: string;        // e.g., 'Patient'
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  constraints: TableConstraint[];
}

interface ColumnSchema {
  name: string;                // e.g., 'id', 'version_id', 'resource'
  sqlType: string;             // e.g., 'UUID', 'BIGINT', 'JSONB', 'TEXT'
  nullable: boolean;
  primaryKey: boolean;
  fhirPath?: string;           // Source FHIRPath for extracted columns
}

interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
  partial?: string;            // Partial index WHERE clause
}
```

#### Task 8.2: TableSchemaGenerator

**File:** `packages/fhir-core/src/persistence/schema/table-schema-generator.ts`

Key logic:
- Every table gets standard columns: `id UUID PK`, `version_id BIGINT`, `last_updated TIMESTAMPTZ`, `resource JSONB`
- History table adds: `history_id BIGSERIAL PK`, `deleted BOOLEAN`
- Extract commonly searched fields as physical columns based on resource type conventions
- Generate indexes for physical columns

#### Task 8.3: DDL Generator (PostgreSQL)

**File:** `packages/fhir-core/src/persistence/schema/ddl-generator.ts`

- Generate `CREATE TABLE IF NOT EXISTS` statements
- Generate `CREATE INDEX IF NOT EXISTS` statements
- Generate history table DDL
- Support migration-safe DDL (idempotent)

#### Task 8.4: Schema Registry

**File:** `packages/fhir-core/src/persistence/schema/schema-registry.ts`

- Register generated schemas by resource type
- Lookup table name by resource type
- Lookup column name by FHIRPath

#### Task 8.5: Schema Tests

- Unit tests for `TableSchemaGenerator` (20+ tests)
- Unit tests for `DDLGenerator` (15+ tests)
- Fixture-driven tests: StructureDefinition → expected DDL (5+ fixtures)

### Standard Columns (All Resource Tables)

```sql
CREATE TABLE patient (
  id              UUID            NOT NULL DEFAULT gen_random_uuid(),
  version_id      BIGINT          NOT NULL DEFAULT 1,
  last_updated    TIMESTAMPTZ     NOT NULL DEFAULT now(),
  resource        JSONB           NOT NULL,
  -- Extracted search columns (resource-specific):
  active          BOOLEAN,
  family          TEXT,
  given           TEXT[],
  birthdate       DATE,
  gender          TEXT,
  -- Constraints:
  CONSTRAINT patient_pk PRIMARY KEY (id)
);

CREATE TABLE patient_history (
  history_id      BIGSERIAL       NOT NULL,
  id              UUID            NOT NULL,
  version_id      BIGINT          NOT NULL,
  last_updated    TIMESTAMPTZ     NOT NULL,
  resource        JSONB,          -- NULL if deleted
  deleted         BOOLEAN         NOT NULL DEFAULT false,
  CONSTRAINT patient_history_pk PRIMARY KEY (history_id)
);
```

### Acceptance Criteria

- [ ] `TableSchemaGenerator` produces correct schema from StructureDefinition
- [ ] DDL is valid PostgreSQL (idempotent, migration-safe)
- [ ] History table generated for every resource table
- [ ] Standard columns present on all tables
- [ ] 35+ tests passing
- [ ] `tsc --noEmit` clean

---

## Phase 9: Repository — Stable Write (with Transactions)

**Duration:** 7-10 days  
**Complexity:** High  
**Risk:** Medium-High  
**Depends On:** Phase 8

### Objectives

Implement the repository layer for reliable resource storage. This is the core persistence abstraction. All writes must be transactional and versioned.

### Architecture

```
REST Layer (Phase 11)
      ↓
ResourceRepository (interface)
      ↓
PostgresResourceRepository (implementation)
      ↓
DatabaseClient (connection pool)
      ↓
PostgreSQL
```

### Tasks

#### Task 9.1: Database Client Abstraction

**File:** `packages/fhir-core/src/persistence/db/database-client.ts`

```typescript
interface DatabaseClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (client: TransactionClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
```

- PostgreSQL implementation using `pg` (node-postgres)
- Connection pool management
- Transaction support

#### Task 9.2: ResourceRepository Interface

**File:** `packages/fhir-core/src/persistence/repository/resource-repository.ts`

```typescript
interface ResourceRepository {
  create(resource: Resource): Promise<Resource>;
  readById(resourceType: string, id: string): Promise<Resource | null>;
  update(resource: Resource): Promise<Resource>;
  delete(resourceType: string, id: string): Promise<void>;
  exists(resourceType: string, id: string): Promise<boolean>;
}
```

#### Task 9.3: PostgresResourceRepository

**File:** `packages/fhir-core/src/persistence/repository/postgres-resource-repository.ts`

Key behaviors:
- **Create**: INSERT with generated UUID, version_id=1, write to history
- **Read**: SELECT by id, return parsed resource from JSONB
- **Update**: UPDATE with version_id++, write old version to history (optimistic locking)
- **Delete**: Mark as deleted in history, remove from main table (or soft-delete)
- **All writes**: Wrapped in transactions

#### Task 9.4: Optimistic Locking

- `If-Match` header support (ETag-based versioning)
- Version conflict detection: `409 Conflict` on version mismatch
- `version_id` incremented atomically

#### Task 9.5: Repository Tests

- Unit tests with mock database client (30+ tests)
- Integration tests with real PostgreSQL (20+ tests, using test containers or local DB)
- Fixtures: resource create/update/delete scenarios (5+ fixtures)

### Acceptance Criteria

- [ ] Create, Read, Update, Delete all work correctly
- [ ] All writes are transactional (ACID)
- [ ] Version IDs increment correctly
- [ ] History is written on every write
- [ ] Optimistic locking prevents lost updates
- [ ] 50+ tests passing
- [ ] `tsc --noEmit` clean

---

## Phase 10: History Mechanism

**Duration:** 4-6 days  
**Complexity:** Medium  
**Risk:** Low-Medium  
**Depends On:** Phase 9

### Objectives

Implement FHIR history tracking per the FHIR R4 specification. History must be queryable at the resource instance, resource type, and system level.

### FHIR History Endpoints

```
GET /{resourceType}/{id}/_history           → Instance history
GET /{resourceType}/{id}/_history/{vid}     → Specific version
GET /{resourceType}/_history                → Type-level history
GET /_history                               → System-level history
```

### Tasks

#### Task 10.1: HistoryRepository

**File:** `packages/fhir-core/src/persistence/repository/history-repository.ts`

```typescript
interface HistoryRepository {
  getInstanceHistory(
    resourceType: string,
    id: string,
    options?: HistoryOptions,
  ): Promise<Bundle>;

  getVersionById(
    resourceType: string,
    id: string,
    versionId: string,
  ): Promise<Resource | null>;

  getTypeHistory(
    resourceType: string,
    options?: HistoryOptions,
  ): Promise<Bundle>;

  getSystemHistory(options?: HistoryOptions): Promise<Bundle>;
}

interface HistoryOptions {
  since?: string;   // _since parameter (instant)
  count?: number;   // _count parameter
  at?: string;      // _at parameter (point-in-time)
}
```

#### Task 10.2: History Bundle Construction

- Build FHIR `Bundle` of type `history`
- Each entry has `request` (method + URL) and `response` (status + ETag)
- Deleted entries have `request.method = DELETE` and no `resource`
- Pagination via `Bundle.link` (self, next, prev)

#### Task 10.3: History Query Optimization

- Index `patient_history(id, version_id DESC)` for instance history
- Index `patient_history(last_updated DESC)` for type/system history
- Cursor-based pagination (not OFFSET) for large history sets

#### Task 10.4: History Tests

- Unit tests for history bundle construction (15+ tests)
- Integration tests for all 4 history endpoints (20+ tests)
- Fixtures: history scenarios (create → update → delete → history) (5+ fixtures)

### Acceptance Criteria

- [ ] Instance history returns correct ordered versions
- [ ] Specific version retrieval works (`_history/{vid}`)
- [ ] Type-level and system-level history work
- [ ] `_since` filtering works correctly
- [ ] Deleted resources appear in history with correct entry
- [ ] History bundles are valid FHIR R4 Bundles
- [ ] 35+ tests passing

---

## Phase 11: Server API — Basic CRUD

**Duration:** 5-7 days  
**Complexity:** Medium  
**Risk:** Low  
**Depends On:** Phase 9, Phase 10

### Objectives

Expose the repository layer as a FHIR R4 REST API. Implement the basic CRUD interactions per the FHIR HTTP specification.

### FHIR REST Interactions (Phase 11 Scope)

| Method | URL | Interaction |
|--------|-----|-------------|
| POST | `/{resourceType}` | create |
| GET | `/{resourceType}/{id}` | read |
| PUT | `/{resourceType}/{id}` | update |
| DELETE | `/{resourceType}/{id}` | delete |
| GET | `/{resourceType}/{id}/_history` | vread (history) |
| GET | `/{resourceType}/{id}/_history/{vid}` | vread (specific version) |
| GET | `/metadata` | capabilities |

**Excluded from Phase 11** (deferred to Phase 12-13):
- `GET /{resourceType}?...` (search)
- `POST /{resourceType}/_search`
- `POST /` (batch/transaction bundle)

### Tasks

#### Task 11.1: HTTP Server Setup

**Framework:** Fastify (high performance, TypeScript-native)

**File:** `packages/fhir-server/src/server.ts`

- Fastify instance with JSON schema validation
- FHIR content type handling (`application/fhir+json`)
- Error handling middleware (FHIR OperationOutcome responses)
- Request logging

#### Task 11.2: FHIR Route Handlers

**File:** `packages/fhir-server/src/routes/resource-routes.ts`

Key behaviors:
- **Create**: `201 Created` + `Location` header + `ETag`
- **Read**: `200 OK` + `ETag` + `Last-Modified`; `404` if not found
- **Update**: `200 OK` (existing) or `201 Created` (upsert); `409` on version conflict
- **Delete**: `204 No Content`; `404` if not found (or idempotent `204`)
- **vread**: `200 OK` with specific version; `404` if not found; `410 Gone` if deleted

#### Task 11.3: OperationOutcome Error Responses

All errors return FHIR `OperationOutcome`:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found",
    "diagnostics": "Resource Patient/123 not found"
  }]
}
```

#### Task 11.4: CapabilityStatement (`/metadata`)

- Generate `CapabilityStatement` from registered resource types
- Declare supported interactions per resource type
- FHIR version: R4

#### Task 11.5: Server Tests

- Integration tests for all CRUD endpoints (40+ tests)
- Error case tests (404, 409, 410, 422) (15+ tests)
- Fixtures: request/response pairs (5+ fixtures)

### Acceptance Criteria

- [ ] All 7 interactions work correctly
- [ ] FHIR-compliant response headers (`ETag`, `Location`, `Last-Modified`)
- [ ] FHIR `OperationOutcome` for all error responses
- [ ] `CapabilityStatement` at `/metadata`
- [ ] 55+ tests passing
- [ ] Passes basic FHIR conformance checks

---

## Phase 12: SearchParameter Index Layer

**Duration:** 6-8 days  
**Complexity:** High  
**Risk:** Medium  
**Depends On:** Phase 8, Phase 11

### Objectives

Parse and register `SearchParameter` resources. Map them to physical indexed columns. Generate index DDL. Build the SQL `WHERE` clause generator for basic filtering.

**Key Principle:** This phase adds *indexing strategy* only. Full search execution is Phase 13.

### SearchParameter Types (Phase 12 Scope)

| Type | Example | SQL Column Type |
|------|---------|-----------------|
| token | `Patient?gender=male` | `TEXT` |
| string | `Patient?name=Smith` | `TEXT` |
| date | `Patient?birthdate=1990` | `DATE` / `TIMESTAMPTZ` |
| reference | `Observation?subject=Patient/123` | `UUID` / `TEXT` |
| number | `Observation?value-quantity=185` | `NUMERIC` |
| uri | `ValueSet?url=http://...` | `TEXT` |

### Tasks

#### Task 12.1: SearchParameter Parser

**File:** `packages/fhir-core/src/persistence/search/search-parameter-parser.ts`

- Parse `SearchParameter` resource JSON
- Extract: `code`, `type`, `expression` (FHIRPath), `base` (resource types)
- Validate expression syntax

#### Task 12.2: SearchParameter Registry

**File:** `packages/fhir-core/src/persistence/search/search-parameter-registry.ts`

```typescript
interface SearchParameterRegistry {
  register(sp: SearchParameter): void;
  getByCode(resourceType: string, code: string): SearchParameter | undefined;
  getAllForType(resourceType: string): SearchParameter[];
}
```

#### Task 12.3: Index Column Mapper

**File:** `packages/fhir-core/src/persistence/search/index-column-mapper.ts`

- Map `SearchParameter.expression` → physical column name
- Map `SearchParameter.type` → SQL column type
- Generate `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for new search params
- Generate `CREATE INDEX IF NOT EXISTS` for indexed columns

#### Task 12.4: SQL WHERE Builder (Basic)

**File:** `packages/fhir-core/src/persistence/search/where-builder.ts`

Basic parameter → SQL translation:

```typescript
// Input:  { gender: 'male' }
// Output: WHERE gender = $1  (params: ['male'])

// Input:  { birthdate: 'ge1990-01-01' }
// Output: WHERE birthdate >= $1  (params: ['1990-01-01'])

// Input:  { name: 'Smith' }
// Output: WHERE family ILIKE $1  (params: ['%Smith%'])
```

#### Task 12.5: Index Layer Tests

- Unit tests for `SearchParameterParser` (20+ tests)
- Unit tests for `IndexColumnMapper` (15+ tests)
- Unit tests for `WhereBuilder` (25+ tests)
- Fixtures: SearchParameter → expected column/index DDL (5+ fixtures)

### Acceptance Criteria

- [ ] All 6 SearchParameter types parsed correctly
- [ ] Index DDL generated correctly
- [ ] Basic WHERE clause generation for token, string, date, reference
- [ ] SearchParameter registry works correctly
- [ ] 60+ tests passing
- [ ] `tsc --noEmit` clean

---

## Phase 13: Search Execution Layer

**Duration:** 8-12 days  
**Complexity:** Very High  
**Risk:** High  
**Depends On:** Phase 12

### Objectives

Implement full FHIR search execution. Translate FHIR search URL parameters into SQL queries. Return FHIR `Bundle` of type `searchset`.

### Search Features (Phase 13 Scope)

**In scope:**
- Basic parameter filtering (all 6 types)
- Multiple values (OR semantics): `?gender=male,female`
- Multiple parameters (AND semantics): `?gender=male&active=true`
- `_count` and cursor-based pagination
- `_sort` (single field, asc/desc)
- `_total` (accurate count)
- `_summary=count`

**Deferred (Phase 14+):**
- Chained search: `?subject.name=Smith`
- `_include` / `_revinclude`
- Composite parameters
- `_has` reverse chaining
- `_filter` expression

### Tasks

#### Task 13.1: Search Request Parser

**File:** `packages/fhir-core/src/persistence/search/search-request-parser.ts`

- Parse FHIR search URL query string
- Extract parameter name, modifier, value(s)
- Handle prefixes: `eq`, `ne`, `lt`, `gt`, `le`, `ge`, `sa`, `eb`, `ap`
- Handle modifiers: `:exact`, `:contains`, `:missing`, `:not`

#### Task 13.2: Search Query Builder

**File:** `packages/fhir-core/src/persistence/search/search-query-builder.ts`

- Translate parsed search request → SQL SELECT with WHERE, ORDER BY, LIMIT
- Handle OR (multiple values for same param) and AND (multiple params)
- Parameterized queries (no SQL injection)
- Pagination: cursor-based using `last_updated + id` composite cursor

#### Task 13.3: Search Executor

**File:** `packages/fhir-core/src/persistence/search/search-executor.ts`

```typescript
interface SearchExecutor {
  search(
    resourceType: string,
    params: SearchRequest,
  ): Promise<Bundle>;
}
```

- Execute SQL query
- Build FHIR `Bundle` of type `searchset`
- Include `Bundle.total` (accurate count)
- Include `Bundle.link` (self, next, prev)

#### Task 13.4: Search Route Handler

**File:** `packages/fhir-server/src/routes/search-routes.ts`

- `GET /{resourceType}?...`
- `POST /{resourceType}/_search` (form-encoded body)
- Validate parameter names against registered SearchParameters
- Return `OperationOutcome` for unknown parameters (or warn)

#### Task 13.5: Search Tests

- Unit tests for `SearchRequestParser` (25+ tests)
- Unit tests for `SearchQueryBuilder` (30+ tests)
- Integration tests for search endpoint (40+ tests)
- Fixtures: search request → expected SQL + Bundle (5+ fixtures)

### Acceptance Criteria

- [ ] Basic search works for all 6 parameter types
- [ ] Multiple values (OR) and multiple parameters (AND) work
- [ ] Pagination works correctly (cursor-based)
- [ ] `_sort` works for single field
- [ ] `_total` returns accurate count
- [ ] Search results are valid FHIR `Bundle` (searchset)
- [ ] 95+ tests passing
- [ ] Passes FHIR search conformance tests

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Implementation files | 25-35 |
| Test files | 15-20 |
| Total tests (Stage-2) | 400-600 |
| FHIR interactions supported | 7 (CRUD + history) |
| SearchParameter types supported | 6 |
| Write latency (p99) | < 50ms |
| Read latency (p99) | < 20ms |
| Search latency (p99, simple) | < 100ms |
| Transaction isolation | SERIALIZABLE |
| History correctness | 100% |

---

## Stage-2 Completion Checklist

- [ ] Phase 7: FHIR Model complete
- [ ] Phase 8: Table generation working
- [ ] Phase 9: Repository stable (CRUD + transactions)
- [ ] Phase 10: History mechanism correct
- [ ] Phase 11: REST API serving CRUD
- [ ] Phase 12: SearchParameter index layer
- [ ] Phase 13: Search execution working
- [ ] All tests passing (400+ new tests)
- [ ] Zero TypeScript errors
- [ ] ADR-005 acceptance criteria met
- [ ] Documentation updated

---

## Risk Management

### High-Risk Areas

1. **Transaction correctness under concurrent writes** (Phase 9)
   - Mitigation: Extensive concurrency tests, optimistic locking, serializable isolation

2. **History table performance at scale** (Phase 10)
   - Mitigation: Proper indexing, cursor-based pagination, partition by resource type

3. **Search SQL generation correctness** (Phase 13)
   - Mitigation: Parameterized queries only, extensive test fixtures, no dynamic SQL

4. **Schema migration safety** (Phase 8)
   - Mitigation: Idempotent DDL (`IF NOT EXISTS`), migration versioning

### Contingency Plans

- If Phase 9 takes longer: Extend timeline, do not compromise transactional correctness
- If search complexity exceeds estimates: Defer composite/chained search to Stage-3
- If PostgreSQL-specific features are needed: Document in ADR, keep abstraction layer

---

## References

- [ADR-005 — FHIR Persistence Architecture](../decisions/ADR-005-FHIR-Persistence-Architecture.md)
- [FHIR R4 REST API](https://hl7.org/fhir/R4/http.html)
- [FHIR R4 Search](https://hl7.org/fhir/R4/search.html)
- [FHIR R4 History](https://hl7.org/fhir/R4/http.html#history)
- [Medplum Architecture](https://www.medplum.com/docs/self-hosting/architecture)
- [Stage-1-Development-Roadmap.md](./Stage-1-Development-Roadmap.md)

---

**This roadmap is a living document. Update as phases complete.**
