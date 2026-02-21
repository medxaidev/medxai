# Phase 8: StructureDefinition → Table Generation — Detailed Plan

> **Status:** Planning
> **Duration:** 5-8 days
> **Complexity:** Medium-High
> **Risk:** Medium
> **Dependencies:** Phase 7 ✅ (BundleLoader, CanonicalProfile pipeline)

---

## Overview

Phase 8 implements the **schema generation pipeline** — the bridge between FHIR semantic definitions and PostgreSQL table structures. Given `CanonicalProfile[]` (from Phase 7's `BundleLoader`) and `SearchParameter` definitions, it produces SQL DDL strings for creating all resource tables.

This phase establishes the `fhir-persistence` package. All code is **pure functions with no database dependency** — fully unit-testable without PostgreSQL.

### Core Responsibilities

- `StructureDefinitionRegistry` — indexes `CanonicalProfile[]` by resource type
- `SearchParameterRegistry` — indexes `SearchParameter[]` by resource type
- `TableSchemaBuilder` — derives `ResourceTableSet` (3 tables per resource) from registries
- `DDLGenerator` — converts `ResourceTableSet` to SQL DDL strings
- CLI entry point — `npx medxai schema:generate` outputs DDL to stdout or file

### What Phase 8 Does NOT Include

- ❌ Database connection or execution (Phase 9)
- ❌ `SchemaDiff` / incremental migration (future phase)
- ❌ Platform custom resources (Phase 9)
- ❌ Repository CRUD (Phase 9)
- ❌ Redis cache (Phase 11)

---

## Confirmed Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package location | New `fhir-persistence` package | Clean separation from semantic layer |
| Phase 8 scope | DDL generation only, no execution | Fully unit-testable without PostgreSQL |
| Registry input | `CanonicalProfile` (from Phase 7) | Reuse existing parser, avoid duplication |
| `content` column type | `TEXT` | Faster writes; consistent with Medplum |
| SchemaDiff | Not in Phase 8 | Only needed for schema evolution (future) |
| Tables per resource | 3 (main + history + references) | FHIR versioning + `_revinclude` support |

---

## Architectural Context

### New Package: `fhir-persistence`

```
packages/
  fhir-core/           ← Stage-1 (semantic layer, no DB)
  fhir-persistence/    ← NEW (Phase 8+, persistence layer)
    package.json
    tsconfig.json
    jest.config.ts
    src/
      registry/
        structure-definition-registry.ts
        search-parameter-registry.ts
        index.ts
      schema/
        table-schema.ts          ← type definitions
        table-schema-builder.ts  ← core generator (pure function)
        ddl-generator.ts         ← SQL string generator (pure function)
        index.ts
      cli/
        generate-schema.ts       ← CLI entry point
      index.ts
    src/__tests__/
      registry/
        structure-definition-registry.test.ts
        search-parameter-registry.test.ts
      schema/
        table-schema-builder.test.ts
        ddl-generator.test.ts
        ddl-generator.snapshot.test.ts
      fixtures/
        01-registry/
        02-schema-builder/
        03-ddl/
```

### Dependency Graph

```
fhir-persistence
  └── depends on: fhir-core (CanonicalProfile, StructureDefinition types)
  └── NO dependency on: pg, redis, express, or any runtime infrastructure
```

### Data Flow

```
spec/fhir/r4/profiles-resources.json
  ↓ BundleLoader (Phase 7)
CanonicalProfile[]
  ↓ StructureDefinitionRegistry.indexAll()
  Map<resourceType, CanonicalProfile>

spec/fhir/r4/search-parameters.json
  ↓ SearchParameterRegistry.indexBundle()
  Map<resourceType, SearchParameterImpl[]>

TableSchemaBuilder.buildAll(sdRegistry, spRegistry)
  ↓
ResourceTableSet[]   (one per resource type)
  ↓
DDLGenerator.generateSchemaDDL(schema)
  ↓
string[]   (SQL DDL statements)
  ↓
stdout / file  (CLI)  OR  MigrationExecutor (Phase 9)
```

---

## Task Breakdown

### Task 8.0: Package Scaffolding (~0.5 day)

Create the `fhir-persistence` package with correct build configuration, mirroring `fhir-core` structure.

**Files to create:**
- `packages/fhir-persistence/package.json`
- `packages/fhir-persistence/tsconfig.json`
- `packages/fhir-persistence/tsconfig.build.json`
- `packages/fhir-persistence/jest.config.ts`
- `packages/fhir-persistence/src/index.ts` (empty barrel)

**Acceptance Criteria:**
- [ ] `tsc --noEmit` passes on empty `src/index.ts`
- [ ] `jest` runs (0 tests, no errors)
- [ ] `@medxai/fhir-core` listed as dependency

---

### Task 8.1: TableSchema Type Definitions (~0.5 day)

Define the intermediate data model representing PostgreSQL table structure.

**File:** `src/schema/table-schema.ts`

```typescript
export type SqlColumnType =
  | 'UUID' | 'TEXT' | 'TEXT[]' | 'BOOLEAN' | 'INTEGER' | 'BIGINT'
  | 'TIMESTAMPTZ' | 'TIMESTAMPTZ[]' | 'DATE' | 'DATE[]'
  | 'NUMERIC' | 'UUID[]';

export interface ColumnSchema {
  name: string;
  type: SqlColumnType;
  notNull: boolean;
  primaryKey: boolean;
  defaultValue?: string;       // SQL expression, e.g. 'false'
  fhirPath?: string;           // Source FHIRPath (documentation)
  searchParamCode?: string;    // Source SearchParameter.code
}

export interface IndexSchema {
  name: string;
  columns: string[];
  indexType: 'btree' | 'gin' | 'gist';
  unique: boolean;
  where?: string;              // Partial index WHERE clause
  include?: string[];          // INCLUDE columns (covering index)
}

export interface ConstraintSchema {
  name: string;
  type: 'primary_key' | 'unique' | 'check';
  columns?: string[];
  expression?: string;
}

export interface MainTableSchema {
  tableName: string;           // e.g. 'Patient'
  resourceType: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  constraints: ConstraintSchema[];
}

export interface HistoryTableSchema {
  tableName: string;           // e.g. 'Patient_History'
  resourceType: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
}

export interface ReferencesTableSchema {
  tableName: string;           // e.g. 'Patient_References'
  resourceType: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  compositePrimaryKey: string[];
}

export interface ResourceTableSet {
  resourceType: string;
  main: MainTableSchema;
  history: HistoryTableSchema;
  references: ReferencesTableSchema;
}

export interface SchemaDefinition {
  version: string;             // e.g. 'fhir-r4-v4.0.1'
  generatedAt: string;         // ISO timestamp
  tableSets: ResourceTableSet[];
}
```

**Acceptance Criteria:**
- [ ] All types exported, `tsc --noEmit` clean

---

### Task 8.2: StructureDefinitionRegistry (~1 day)

Index `CanonicalProfile[]` for fast lookup. medxai equivalent of Medplum's `indexStructureDefinitionBundle()` → `DATA_TYPES`, but as an injectable instance (no global state).

**File:** `src/registry/structure-definition-registry.ts`

**Key methods:**
```typescript
class StructureDefinitionRegistry {
  index(profile: CanonicalProfile): void
  indexAll(profiles: CanonicalProfile[]): void
  get(resourceType: string): CanonicalProfile | undefined
  has(resourceType: string): boolean
  // Returns kind='resource' AND abstract=false — the table-building list
  getTableResourceTypes(): string[]
  getAllTypes(): string[]
  get size(): number
  clear(): void
}
```

**`getTableResourceTypes()` logic:**
```typescript
return Array.from(this.profiles.values())
  .filter(p => p.kind === 'resource' && p.abstract === false)
  .map(p => p.type)
  .sort();
```

**Test cases (15+):**
- indexes by type name, overwrites on duplicate
- `getTableResourceTypes()` excludes abstract (Resource, DomainResource), complex types (HumanName), primitives (string)
- integration: indexes all 148 resources from `profiles-resources.json`, returns ~140+ table types

**Acceptance Criteria:**
- [ ] 15+ unit tests passing
- [ ] Integration test with real `profiles-resources.json`

---

### Task 8.3: SearchParameterRegistry (~1 day)

Index `SearchParameter` definitions. Drives physical search column generation.

**File:** `src/registry/search-parameter-registry.ts`

**SearchParameter → Strategy mapping (from WF-MIG-003):**

| SearchParam.type | Strategy | Column Type |
|-----------------|----------|-------------|
| `date` | `column` | `DATE` or `TIMESTAMPTZ` |
| `string` | `column` | `TEXT` |
| `reference` | `column` | `TEXT` |
| `number` | `column` | `NUMERIC` |
| `quantity` | `column` | `NUMERIC` |
| `uri` | `column` | `TEXT` |
| `boolean` | `column` | `BOOLEAN` |
| `token` | `token-column` | `UUID[]` + `TEXT[]` + `TEXT` (3 cols) |
| `special`/`composite` | skipped | — |

**Lookup table strategy** (name/address/identifier): generates sort column only in main table; actual data written by Phase 9 Repository.

**Key types:**
```typescript
export type SearchStrategy = 'column' | 'token-column' | 'lookup-table';

export interface SearchParameterImpl {
  code: string;
  type: SearchParamType;
  resourceTypes: string[];
  expression: string;
  strategy: SearchStrategy;
  columnName?: string;
  columnType?: SearchColumnType;
  array: boolean;
}
```

**Test cases (15+):**
- date → column/DATE, string → column/TEXT, token → token-column
- multi-resource params handled correctly
- integration: indexes all params from `search-parameters.json`

**Acceptance Criteria:**
- [ ] 15+ unit tests passing
- [ ] Integration test with real `search-parameters.json`

---

### Task 8.4: TableSchemaBuilder (~2 days)

Core of Phase 8. Pure function: registries → `ResourceTableSet`.

**File:** `src/schema/table-schema-builder.ts`

#### Fixed Columns (All Main Tables)

```
id UUID PK, content TEXT NOT NULL, lastUpdated TIMESTAMPTZ NOT NULL,
deleted BOOLEAN NOT NULL DEFAULT false, projectId UUID NOT NULL,
__version INTEGER NOT NULL, _source TEXT, _profile TEXT[]
```

Plus `compartments UUID[] NOT NULL` for all resources **except Binary**.

#### Fixed Indexes (All Main Tables)

```
btree(lastUpdated), btree(projectId, lastUpdated), btree(projectId),
btree(_source), gin(_profile), btree(__version),
btree(lastUpdated, __version) WHERE deleted=false  ← reindex_idx
gin(compartments)  ← not for Binary
```

#### History Table (fixed, all resources)

```
versionId UUID PK, id UUID NOT NULL, content TEXT NOT NULL, lastUpdated TIMESTAMPTZ NOT NULL
Indexes: btree(id), btree(lastUpdated)
```

#### References Table (fixed, all resources)

```
resourceId UUID NOT NULL, targetId UUID NOT NULL, code TEXT NOT NULL
Composite PK: (resourceId, targetId, code)
Index: btree(targetId, code) INCLUDE (resourceId)
```

#### Search Column Generation

- `column` strategy → one column per SearchParam
- `token-column` strategy → three columns: `__code UUID[]`, `__codeText TEXT[]`, `__codeSort TEXT`
- `lookup-table` strategy → sort column only in main table (e.g. `__nameSort TEXT`)

#### Public API

```typescript
export function buildResourceTableSet(
  resourceType: string,
  sdRegistry: StructureDefinitionRegistry,
  spRegistry: SearchParameterRegistry,
): ResourceTableSet

export function buildAllResourceTableSets(
  sdRegistry: StructureDefinitionRegistry,
  spRegistry: SearchParameterRegistry,
): ResourceTableSet[]

export function buildSchemaDefinition(
  sdRegistry: StructureDefinitionRegistry,
  spRegistry: SearchParameterRegistry,
  version?: string,
): SchemaDefinition
```

**Test cases (30+):**
- Fixed columns present on all tables
- Binary has no compartments column
- Patient has birthdate DATE, gender TEXT, __name UUID[], __nameSort TEXT
- Observation has date TIMESTAMPTZ, __code UUID[], subject TEXT
- History table structure correct
- References table structure correct
- Unknown/abstract resource type throws error
- `buildAllResourceTableSets` returns ~140+ sets

**Acceptance Criteria:**
- [ ] 30+ unit tests passing
- [ ] `buildResourceTableSet('Patient', ...)` correct 3-table structure
- [ ] `buildResourceTableSet('Binary', ...)` no compartments
- [ ] `buildAllResourceTableSets(...)` ~140+ resource types
- [ ] Pure function — no global state

---

### Task 8.5: DDLGenerator (~1 day)

Convert `ResourceTableSet` / `SchemaDefinition` to SQL DDL strings.

**File:** `src/schema/ddl-generator.ts`

**Public API:**
```typescript
export function generateCreateTable(
  table: MainTableSchema | HistoryTableSchema | ReferencesTableSchema,
): string

export function generateCreateIndex(index: IndexSchema, tableName: string): string

export function generateResourceDDL(tableSet: ResourceTableSet): string[]

// Returns all CREATE TABLEs first, then all CREATE INDEXes
export function generateSchemaDDL(schema: SchemaDefinition): string[]
```

**DDL format:**
```sql
CREATE TABLE IF NOT EXISTS "Patient" (
  "id"           UUID        NOT NULL,
  "content"      TEXT        NOT NULL,
  "lastUpdated"  TIMESTAMPTZ NOT NULL,
  "deleted"      BOOLEAN     NOT NULL DEFAULT false,
  "projectId"    UUID        NOT NULL,
  "__version"    INTEGER     NOT NULL,
  "_source"      TEXT,
  "_profile"     TEXT[],
  "compartments" UUID[]      NOT NULL,
  "birthdate"    DATE,
  CONSTRAINT "Patient_pk" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Patient_lastUpdated_idx"
  ON "Patient" USING btree ("lastUpdated");

CREATE INDEX IF NOT EXISTS "Patient_compartments_idx"
  ON "Patient" USING gin ("compartments");

CREATE INDEX IF NOT EXISTS "Patient_reindex_idx"
  ON "Patient" USING btree ("lastUpdated", "__version")
  WHERE deleted = false;
```

**Test cases (20+):**
- Correct `CREATE TABLE IF NOT EXISTS` syntax
- All columns with correct types and constraints
- Composite PK for References table
- Partial index with WHERE clause
- Covering index with INCLUDE
- Snapshot tests: Patient, Observation, Binary DDL

**Acceptance Criteria:**
- [ ] 20+ unit tests passing
- [ ] Snapshot tests for Patient, Observation, Binary
- [ ] Generated DDL is valid PostgreSQL (idempotent)
- [ ] All identifiers quoted

---

### Task 8.6: CLI Entry Point (~0.5 day)

**File:** `src/cli/generate-schema.ts`

```
Usage:
  npx medxai schema:generate [options]

Options:
  --spec-dir <path>    Path to spec/ directory (default: ./spec)
  --output <path>      Output file path (default: stdout)
  --resource <type>    Generate DDL for single resource type only
  --format text|json   Output format (default: text)
```

**Acceptance Criteria:**
- [ ] `npx medxai schema:generate` outputs valid DDL to stdout
- [ ] `--output` writes to file
- [ ] `--resource Patient` generates only Patient DDL

---

### Task 8.7: Integration Test & Verification (~0.5 day)

End-to-end test of the complete pipeline using real spec files.

```typescript
describe('Phase 8 Integration', () => {
  it('full pipeline: profiles-resources.json → DDL for all resources')
  it('Patient DDL contains expected columns and indexes')
  it('Observation DDL contains expected columns and indexes')
  it('Binary DDL has no compartments column or index')
  it('generated DDL is syntactically valid PostgreSQL')
  it('all resource types from profiles-resources.json have DDL')
})
```

**Acceptance Criteria:**
- [ ] Full pipeline integration test passing
- [ ] DDL for all ~140+ resource types generated without errors

---

## Test Summary

| Test File | Type | Count |
|-----------|------|-------|
| `structure-definition-registry.test.ts` | Unit | 15+ |
| `search-parameter-registry.test.ts` | Unit | 15+ |
| `table-schema-builder.test.ts` | Unit | 30+ |
| `ddl-generator.test.ts` | Unit | 20+ |
| `ddl-generator.snapshot.test.ts` | Snapshot | 5+ |
| Integration tests | Integration | 10+ |

**Total new tests: 95+**

---

## File Summary

### New Package

`packages/fhir-persistence/` — all files new

### Key Source Files

| File | Purpose |
|------|---------|
| `src/registry/structure-definition-registry.ts` | Profile indexing |
| `src/registry/search-parameter-registry.ts` | SearchParam indexing |
| `src/schema/table-schema.ts` | Type definitions |
| `src/schema/table-schema-builder.ts` | Core schema generation |
| `src/schema/ddl-generator.ts` | SQL DDL generation |
| `src/cli/generate-schema.ts` | CLI entry point |

### No Changes To

| Package | Reason |
|---------|--------|
| `fhir-core` | Phase 7 already added BundleLoader; no further changes |
| `spec/fhir/r4/` | Read-only input |

---

## Acceptance Criteria (Phase 8 Complete)

- [ ] `fhir-persistence` package builds cleanly (ESM + CJS + `.d.ts`)
- [ ] `StructureDefinitionRegistry` indexes all FHIR R4 resources
- [ ] `SearchParameterRegistry` indexes all FHIR R4 search parameters
- [ ] `TableSchemaBuilder` generates correct 3-table structure for all resource types
- [ ] `DDLGenerator` produces valid, idempotent PostgreSQL DDL
- [ ] CLI `schema:generate` works end-to-end
- [ ] 95+ new tests passing
- [ ] All existing Phase 1-6 tests still passing (zero regressions)
- [ ] `tsc --noEmit` clean across all packages
- [ ] Build: ESM + CJS + `.d.ts`

---

## Implementation Notes

*(To be filled in during implementation)*
