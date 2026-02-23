# Phase 9: Repository — Stable Write (with Transactions) — Detailed Plan

> **Status:** In Progress
> **Duration:** 5-8 days
> **Complexity:** High
> **Risk:** Medium
> **Dependencies:** Phase 8 ✅ (Schema Generation), Phase 7 ✅ (BundleLoader)
> **Reference:** WF-E2E-001 (POST /Patient 完整写路径端到端分析)

---

## Overview

Phase 9 implements the **PostgreSQL persistence layer** — the bridge between FHIR resources and database storage. Given a FHIR resource (e.g., Patient JSON), it performs transactional CRUD operations against the PostgreSQL tables generated in Phase 8.

This phase extends the `fhir-persistence` package with a `ResourceRepository` that handles Create, Read, Update, Delete with full FHIR versioning semantics.

### Core Responsibilities

- `ResourceRepository` interface — CRUD contract for FHIR resources
- `FhirRepository` — concrete PostgreSQL implementation
- Search column population — extract values from resources using FHIRPath
- History tracking — every write creates a history entry
- Soft delete — mark as deleted, preserve history
- Optimistic locking — `If-Match` / versionId-based conflict detection
- Transaction management — all writes are ACID

### What Phase 9 Does NOT Include

- ❌ Search query execution (Phase 10+)
- ❌ Lookup table population (HumanName, Address — future phase)
- ❌ Redis caching (Phase 11)
- ❌ Access control / compartment-based filtering (Phase 11)
- ❌ REST layer / HTTP routing (Phase 11)
- ❌ Subscription / Bot triggers (future)

---

## Confirmed Design Decisions (from WF-E2E-001 Medplum Analysis)

| Decision | Choice | Medplum Reference | Rationale |
|----------|--------|-------------------|-----------|
| UUID generation | **App-side** `crypto.randomUUID()` | repo.ts:398-400 `v4()` | No DB dependency for ID generation |
| versionId type | **UUID** (not integer) | repo.ts:792-794 | Consistent with Medplum; globally unique |
| versionId initial | Random UUID (no 0/1 concept) | — | Each write = new UUID |
| `__version` column | Schema version constant (integer) | repo.ts:1636 `Repository.VERSION = 13` | Tracks schema migration version, not resource version |
| History write content | **New version** (not old version) | repo.ts:1705-1718 | Each write appends current snapshot to history |
| History write timing | After main UPSERT, same transaction | repo.ts:1118-1124 | ACID guarantee |
| Soft delete strategy | `deleted=true`, `content=''`, `__version=-1` | repo.ts:1292-1323 | Preserves row for search exclusion |
| Search column fill | **Synchronous**, in `buildResourceRow()` | repo.ts:1636-1674 | Part of INSERT, same transaction |
| Main table write | **UPSERT** (`ON CONFLICT DO UPDATE`) | repo.ts:1683-1685 | Create and update share same SQL path |
| Optimistic locking | **App-layer** versionId comparison | repo.ts:775-784 | Read existing → compare → write |
| Locking trigger | Only when `If-Match` header present | repo.ts:715-717 | No overhead for normal writes |
| Transaction isolation | `REPEATABLE READ` (default) | repo.ts:1118 | Sufficient for UPSERT pattern |

---

## Architectural Context

### Package Structure (additions to `fhir-persistence`)

```
packages/fhir-persistence/
  src/
    db/
      config.ts          ← ✅ Phase 9.0 (done)
      client.ts          ← ✅ Phase 9.0 (done)
      index.ts           ← ✅ Phase 9.0 (done)
    repo/
      types.ts           ← NEW: ResourceRepository interface, options types
      errors.ts          ← NEW: RepositoryError hierarchy
      fhir-repo.ts       ← NEW: FhirRepository (PostgreSQL implementation)
      row-builder.ts     ← NEW: buildResourceRow() — search column population
      sql-builder.ts     ← NEW: InsertQuery, UpsertQuery SQL generation
      index.ts           ← NEW: barrel exports
    registry/            ← existing (Phase 8)
    schema/              ← existing (Phase 8)
    cli/                 ← existing (Phase 8)
  src/__tests__/
    repo/
      types.test.ts
      row-builder.test.ts
      sql-builder.test.ts
      fhir-repo.test.ts           ← unit tests (mock DB)
    integration/
      repo-integration.test.ts    ← real PostgreSQL tests
```

### Write Path (from WF-E2E-001)

```
repo.createResource(patientJson)
  │
  ├─ 1. id = crypto.randomUUID()
  ├─ 2. versionId = crypto.randomUUID()
  ├─ 3. lastUpdated = new Date().toISOString()
  ├─ 4. buildResourceRow(resource)
  │      ├─ fixed columns: id, content, lastUpdated, deleted, __version
  │      ├─ search columns: birthdate, gender, active, __identifier, ...
  │      └─ compartments: [patientId]
  │
  └─ 5. withTransaction(client =>
           ├─ UPSERT "Patient" (main table)
           ├─ INSERT "Patient_History" (history table)
           └─ (future: writeLookupTables)
         )
```

### Read Path

```
repo.readById('Patient', id)
  │
  └─ SELECT "content" FROM "Patient" WHERE "id" = $1 AND "deleted" = false
       → JSON.parse(content) → Patient resource
```

### Update Path

```
repo.update(patientJson)
  │
  ├─ 1. Read existing (for optimistic locking if If-Match)
  ├─ 2. versionId = crypto.randomUUID()
  ├─ 3. lastUpdated = now
  ├─ 4. buildResourceRow(resource)
  │
  └─ 5. withTransaction(client =>
           ├─ UPSERT "Patient" (ON CONFLICT DO UPDATE)
           └─ INSERT "Patient_History" (new version snapshot)
         )
```

### Delete Path

```
repo.delete('Patient', id)
  │
  ├─ 1. Read existing (verify exists)
  ├─ 2. versionId = crypto.randomUUID()
  ├─ 3. Build delete row: deleted=true, content='', __version=-1
  │
  └─ 4. withTransaction(client =>
           ├─ UPSERT "Patient" (mark deleted)
           └─ INSERT "Patient_History" (delete version, content='')
         )
```

---

## Task Breakdown

### Task 9.0: Database Infrastructure ✅ COMPLETED

**Files created:**
- `src/db/config.ts` — `DatabaseConfig`, `loadDatabaseConfig()`
- `src/db/client.ts` — `DatabaseClient` (pg.Pool wrapper, `withTransaction`, `executeStatements`, `ping`)
- `scripts/init-db.ts` — Cross-platform DB init script
- `.env.example`, `.env`, `.gitignore`

**Results:** 146 resource types, 3639 DDL statements, 0 errors.

---

### Task 9.1: Repository Types & Interfaces

**Files:**
- `src/repo/types.ts` — interfaces and option types
- `src/repo/errors.ts` — error hierarchy

**Types to define:**

```typescript
// Core FHIR resource shape (minimal, no dependency on fhir-core types)
interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Repository interface
interface ResourceRepository {
  createResource<T extends FhirResource>(resource: T): Promise<T>;
  readResource(resourceType: string, id: string): Promise<FhirResource>;
  updateResource<T extends FhirResource>(resource: T, options?: UpdateOptions): Promise<T>;
  deleteResource(resourceType: string, id: string): Promise<void>;
  readHistory(resourceType: string, id: string): Promise<FhirResource[]>;
  readVersion(resourceType: string, id: string, versionId: string): Promise<FhirResource>;
}

// Options
interface UpdateOptions {
  ifMatch?: string;  // versionId for optimistic locking
}

interface CreateOptions {
  assignedId?: string;  // pre-assigned UUID (for batch/transaction)
}
```

**Errors:**
- `RepositoryError` (base)
- `ResourceNotFoundError` — 404
- `ResourceGoneError` — 410 (deleted)
- `ResourceVersionConflictError` — 412 (optimistic locking)
- `ResourceAlreadyExistsError` — 409

---

### Task 9.2: SQL Builder & Row Builder

**Files:**
- `src/repo/sql-builder.ts` — SQL query generation (parameterized)
- `src/repo/row-builder.ts` — `buildResourceRow()` for search column population

**SQL Builder responsibilities:**
- `buildUpsertSQL(tableName, columns)` — generates `INSERT ... ON CONFLICT DO UPDATE`
- `buildInsertSQL(tableName, columns)` — generates plain `INSERT`
- `buildSelectByIdSQL(tableName)` — generates `SELECT "content" FROM ... WHERE "id" = $1`
- All queries use parameterized `$1, $2, ...` placeholders (no SQL injection)

**Row Builder responsibilities:**
- Fixed columns: `id`, `content`, `lastUpdated`, `deleted`, `__version`, `_source`, `_profile`
- Search columns: use `SearchParameterRegistry` + FHIRPath evaluation (Phase 6)
- Compartments: extract Patient references from CompartmentDefinition
- Token columns: UUID v5 hashing for token search

**Note:** Search column population requires FHIRPath evaluation from `@medxai/fhir-core`. For Phase 9 MVP, we populate only fixed columns + `content`. Full search column population will be added incrementally.

---

### Task 9.3: FhirRepository — Create & Read

**File:** `src/repo/fhir-repo.ts`

**Create flow:**
1. Generate `id` via `crypto.randomUUID()`
2. Generate `versionId` via `crypto.randomUUID()`
3. Set `meta.lastUpdated` to current ISO timestamp
4. Build resource row (fixed columns + content JSON)
5. Within transaction:
   - UPSERT main table
   - INSERT history table
6. Return resource with populated `id` and `meta`

**Read flow:**
1. `SELECT "content", "deleted" FROM "{ResourceType}" WHERE "id" = $1`
2. If not found → `ResourceNotFoundError`
3. If `deleted = true` → `ResourceGoneError`
4. `JSON.parse(content)` → return resource

**ReadHistory flow:**
1. `SELECT "content" FROM "{ResourceType}_History" WHERE "id" = $1 ORDER BY "lastUpdated" DESC`
2. Parse each row → return array

**ReadVersion flow:**
1. `SELECT "content" FROM "{ResourceType}_History" WHERE "id" = $1 AND "versionId" = $2`
2. If not found → `ResourceNotFoundError`
3. Parse → return

---

### Task 9.4: FhirRepository — Update & Delete

**Update flow:**
1. Read existing resource (verify exists, not deleted)
2. If `options.ifMatch` → compare with existing `meta.versionId`
   - Mismatch → `ResourceVersionConflictError` (HTTP 412)
3. Generate new `versionId`
4. Set `meta.lastUpdated` to now
5. Build resource row
6. Within transaction:
   - UPSERT main table (ON CONFLICT DO UPDATE)
   - INSERT history table (new version snapshot)
7. Return updated resource

**Delete flow:**
1. Read existing resource (verify exists, not deleted)
2. Generate new `versionId` for the delete event
3. Build delete row: `deleted=true`, `content=''`, `__version=-1`
4. Within transaction:
   - UPSERT main table (mark deleted)
   - INSERT history table (delete version with empty content)
5. Return void

---

### Task 9.5: Optimistic Locking

- Only triggered when `ifMatch` option is provided
- Compare `ifMatch` value against `existing.meta.versionId`
- On mismatch: throw `ResourceVersionConflictError`
- Transaction ensures atomicity of read-compare-write

---

### Task 9.6: Repository Tests

**Unit tests (mock DB):** `src/__tests__/repo/`
- `types.test.ts` — type guards, error construction (10+ tests)
- `sql-builder.test.ts` — SQL generation correctness (15+ tests)
- `row-builder.test.ts` — row building, fixed columns (10+ tests)

**Integration tests (real PostgreSQL):** `src/__tests__/integration/`
- `repo-integration.test.ts` — full CRUD against real DB (25+ tests)
  - Create Patient → verify in DB
  - Read by ID → correct content
  - Update → new versionId, history entry
  - Delete → soft delete, history entry
  - Read deleted → ResourceGoneError
  - Optimistic locking → conflict detection
  - History read → all versions
  - Version read → specific version
  - Create with assignedId
  - Multiple resource types (Patient, Observation)

**Target:** 50+ tests total

---

## Acceptance Criteria

- [ ] Create, Read, Update, Delete all work correctly
- [ ] All writes are transactional (ACID)
- [ ] versionId is UUID, generated per write
- [ ] History is written on every write (new version snapshot)
- [ ] Soft delete: `deleted=true`, `content=''`, `__version=-1`
- [ ] Optimistic locking via `ifMatch` prevents lost updates
- [ ] `ResourceNotFoundError` on missing resource
- [ ] `ResourceGoneError` on deleted resource
- [ ] `ResourceVersionConflictError` on version mismatch
- [ ] 50+ tests passing
- [ ] `tsc --noEmit` clean
- [ ] Integration tests pass against real PostgreSQL

---

## Key Differences from Medplum

| Aspect | Medplum | MedXAI Phase 9 |
|--------|---------|-----------------|
| Package | `packages/server/src/fhir/repo.ts` | `packages/fhir-persistence/src/repo/fhir-repo.ts` |
| Auth/ACL | Integrated in Repository | Separate (Phase 11) |
| Redis cache | In handleStorage() | Not included (Phase 11) |
| Lookup tables | 5 tables (Address, HumanName, ...) | Deferred (future phase) |
| Search columns | Full FHIRPath evaluation | MVP: fixed columns only; incremental |
| Subscriptions | postCommit triggers | Not included (future) |
| Rate limiting | In createResource() | Not included (future) |
| `__version` | Schema migration version (=13) | Schema version constant (=1) |

---

## Dependencies

| Dependency | Package | Status |
|------------|---------|--------|
| `DatabaseClient` | `fhir-persistence/db` | ✅ Phase 9.0 |
| `SearchParameterRegistry` | `fhir-persistence/registry` | ✅ Phase 8 |
| Schema tables | PostgreSQL `medxai_dev` | ✅ Phase 9.0 (3639 DDL) |
| `pg` | npm | ✅ installed |
| `crypto.randomUUID()` | Node.js built-in | ✅ Node 19+ |
