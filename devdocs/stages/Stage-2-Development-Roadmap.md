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

## Phase 7: FHIR Model Completeness & Bundle Loading

**Duration:** 3-5 days  
**Complexity:** Low-Medium  
**Risk:** Low  
**Depends On:** Phase 1-6 ✅  
**Detailed Plan:** [Phase-7-Detailed-Plan.md](./Phase-7-Detailed-Plan.md)

### Objectives

Validate and extend the existing `StructureDefinitionParser` to handle the **full** FHIR R4 specification bundles (`profiles-resources.json`, `profiles-types.json`, `profiles-others.json`), implement `BundleLoader` as the entry point for Phase 8's schema generation pipeline, and establish the `spec/` directory structure.

**Key insight:** The 73 individual JSON files in `core-definitions/` are a Stage-1 subset for the validation layer. Phase 8 requires the complete bundles — all ~148 resources from `profiles-resources.json`.

### Tasks

#### Task 7.1: Parser Completeness Audit

- Run all entries from `profiles-resources.json`, `profiles-types.json`, `profiles-others.json` through `StructureDefinitionParser`
- Document and fix any parse failures
- Existing 73-file `core-definitions/` path is **unchanged** (Stage-1 validation use only)

#### Task 7.2: BundleLoader Implementation

**File:** `packages/fhir-core/src/context/bundle-loader.ts`

- `loadBundleFromFile(path, options?)` → `BundleLoadResult`
- `loadBundleFromObject(bundle, options?)` → `BundleLoadResult`
- `loadBundlesFromFiles(paths[], options?)` → merged `BundleLoadResult`
- Filter options: `filterKind`, `excludeAbstract`, `filterTypes`
- Error reporting: partial failures don't abort the load

#### Task 7.3: spec/ Directory Structure

```
spec/
  fhir/r4/          ← Official FHIR R4 (already present, unchanged)
  platform/         ← NEW: empty Bundle stubs (Phase 9 will populate)
    profiles-platform.json
    search-parameters-platform.json
    README.md
  cn/               ← Future: Chinese localization (Stage-3+, not created yet)
```

Loading order for Phase 8:

1. `spec/fhir/r4/profiles-types.json` — type system (no tables)
2. `spec/fhir/r4/profiles-resources.json` — clinical resources
3. `spec/fhir/r4/profiles-others.json` — conformance resources
4. `spec/platform/profiles-platform.json` — platform resources (Phase 9)

#### Task 7.4: CanonicalProfile Sufficiency Verification

- Verify (without modifying) that existing `CanonicalProfile` fields are sufficient for Phase 8
- `kind`, `abstract`, `type`, `elements[].types[].code`, `elements[].max` — all present ✅
- **No changes to `CanonicalElement` or `CanonicalProfile` interfaces**

#### Task 7.5: Export & Integration

- Export `BundleLoader` from `fhir-core` public API
- Ensure all existing Phase 1-6 tests still pass

### Acceptance Criteria

- [ ] `BundleLoader` loads all entries from `profiles-resources.json` without errors (~148 resources)
- [ ] `BundleLoader` loads all entries from `profiles-types.json` and `profiles-others.json`
- [ ] `spec/platform/` directory created with stub files
- [ ] `CanonicalProfile` sufficiency verified (no interface changes)
- [ ] 25+ new tests passing
- [ ] All 1745 existing tests still passing (zero regressions)
- [ ] `tsc --noEmit` clean

---

## Phase 8: StructureDefinition → Table Generation

**Duration:** 5-8 days  
**Complexity:** Medium-High  
**Risk:** Medium  
**Depends On:** Phase 7  
**Detailed Plan:** [Phase-8-Detailed-Plan.md](./Phase-8-Detailed-Plan.md)

### Objectives

Implement the schema generation pipeline in a new `fhir-persistence` package. Given `CanonicalProfile[]` (from Phase 7's `BundleLoader`) and `SearchParameter` definitions, produce SQL DDL strings for all resource tables. All code is **pure functions — no database dependency**.

### Confirmed Design Decisions

| Decision              | Choice                                             |
| --------------------- | -------------------------------------------------- |
| Package               | New `fhir-persistence` (separate from `fhir-core`) |
| Phase 8 scope         | DDL generation only — no DB execution              |
| Registry input        | `CanonicalProfile` from Phase 7 BundleLoader       |
| `content` column type | `TEXT` (consistent with Medplum; faster writes)    |
| SchemaDiff            | Not in Phase 8 (future phase)                      |
| Tables per resource   | 3: main + `_History` + `_References`               |

### Architecture

```
spec/fhir/r4/profiles-resources.json
  ↓ BundleLoader (Phase 7)
CanonicalProfile[]
  ↓ StructureDefinitionRegistry
  Map<resourceType, CanonicalProfile>

spec/fhir/r4/search-parameters.json
  ↓ SearchParameterRegistry
  Map<resourceType, SearchParameterImpl[]>

TableSchemaBuilder.buildAll(sdRegistry, spRegistry)
  ↓
ResourceTableSet[]   (3 tables per resource type)
  ↓
DDLGenerator.generateSchemaDDL(schema)
  ↓
string[]   (SQL DDL — stdout / file / Phase 9 executor)
```

### Tasks

#### Task 8.0: Package Scaffolding

`packages/fhir-persistence/` — `package.json`, `tsconfig.json`, `jest.config.ts`

#### Task 8.1: TableSchema Type Definitions

`src/schema/table-schema.ts` — `ColumnSchema`, `IndexSchema`, `MainTableSchema`, `HistoryTableSchema`, `ReferencesTableSchema`, `ResourceTableSet`, `SchemaDefinition`

#### Task 8.2: StructureDefinitionRegistry

`src/registry/structure-definition-registry.ts` — indexes `CanonicalProfile[]`, `getTableResourceTypes()` returns `kind='resource' AND abstract=false`

#### Task 8.3: SearchParameterRegistry

`src/registry/search-parameter-registry.ts` — maps SearchParam types to strategies: `column` / `token-column` / `lookup-table`

#### Task 8.4: TableSchemaBuilder

`src/schema/table-schema-builder.ts` — core pure function

**Fixed columns (all main tables):**
`id UUID PK`, `content TEXT NOT NULL`, `lastUpdated TIMESTAMPTZ NOT NULL`, `deleted BOOLEAN DEFAULT false`, `projectId UUID NOT NULL`, `__version INTEGER NOT NULL`, `_source TEXT`, `_profile TEXT[]`, `compartments UUID[] NOT NULL` (except Binary)

**Three tables per resource:**

- Main: fixed columns + search columns driven by SearchParameterRegistry
- `_History`: `versionId UUID PK`, `id UUID`, `content TEXT`, `lastUpdated TIMESTAMPTZ`
- `_References`: `resourceId UUID`, `targetId UUID`, `code TEXT` (composite PK)

#### Task 8.5: DDLGenerator

`src/schema/ddl-generator.ts` — `generateCreateTable()`, `generateCreateIndex()`, `generateResourceDDL()`, `generateSchemaDDL()`

Output format: `CREATE TABLE IF NOT EXISTS "Patient" (...)` with all identifiers quoted.

#### Task 8.6: CLI Entry Point

`src/cli/generate-schema.ts` — `npx medxai schema:generate [--spec-dir] [--output] [--resource]`

#### Task 8.7: Integration Test

Full pipeline: `profiles-resources.json` → DDL for all ~140+ resource types

### Acceptance Criteria

- [ ] `fhir-persistence` package builds cleanly (ESM + CJS + `.d.ts`)
- [ ] `StructureDefinitionRegistry` indexes all FHIR R4 resources
- [ ] `SearchParameterRegistry` indexes all FHIR R4 search parameters
- [ ] `TableSchemaBuilder` generates correct 3-table structure for all resource types
- [ ] `DDLGenerator` produces valid, idempotent PostgreSQL DDL
- [ ] CLI `schema:generate` works end-to-end
- [ ] 95+ new tests passing
- [ ] All existing Phase 1-6 tests still passing (zero regressions)
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
  since?: string; // _since parameter (instant)
  count?: number; // _count parameter
  at?: string; // _at parameter (point-in-time)
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

| Method | URL                                   | Interaction              |
| ------ | ------------------------------------- | ------------------------ |
| POST   | `/{resourceType}`                     | create                   |
| GET    | `/{resourceType}/{id}`                | read                     |
| PUT    | `/{resourceType}/{id}`                | update                   |
| DELETE | `/{resourceType}/{id}`                | delete                   |
| GET    | `/{resourceType}/{id}/_history`       | vread (history)          |
| GET    | `/{resourceType}/{id}/_history/{vid}` | vread (specific version) |
| GET    | `/metadata`                           | capabilities             |

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
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "diagnostics": "Resource Patient/123 not found"
    }
  ]
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

**Key Principle:** This phase adds _indexing strategy_ only. Full search execution is Phase 13.

### SearchParameter Types (Phase 12 Scope)

| Type      | Example                           | SQL Column Type        |
| --------- | --------------------------------- | ---------------------- |
| token     | `Patient?gender=male`             | `TEXT`                 |
| string    | `Patient?name=Smith`              | `TEXT`                 |
| date      | `Patient?birthdate=1990`          | `DATE` / `TIMESTAMPTZ` |
| reference | `Observation?subject=Patient/123` | `UUID` / `TEXT`        |
| number    | `Observation?value-quantity=185`  | `NUMERIC`              |
| uri       | `ValueSet?url=http://...`         | `TEXT`                 |

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
  search(resourceType: string, params: SearchRequest): Promise<Bundle>;
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

| Metric                          | Target             |
| ------------------------------- | ------------------ |
| Implementation files            | 25-35              |
| Test files                      | 15-20              |
| Total tests (Stage-2)           | 400-600            |
| FHIR interactions supported     | 7 (CRUD + history) |
| SearchParameter types supported | 6                  |
| Write latency (p99)             | < 50ms             |
| Read latency (p99)              | < 20ms             |
| Search latency (p99, simple)    | < 100ms            |
| Transaction isolation           | SERIALIZABLE       |
| History correctness             | 100%               |

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
