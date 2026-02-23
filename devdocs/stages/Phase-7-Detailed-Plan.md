# Phase 7: FHIR Model Completeness & Bundle Loading — Detailed Plan

> **Status:** ✅ Completed
> **Completed:** 2026-02-22
> **Duration:** 3-5 days
> **Complexity:** Low-Medium
> **Risk:** Low
> **Dependencies:** Phase 1-6 ✅ Complete

---

## Overview

Phase 7 ensures the FHIR model layer is complete and ready to drive table generation in Phase 8. The core work is validating and extending the existing `StructureDefinitionParser` to handle the **full** FHIR R4 specification bundles (`profiles-resources.json`, `profiles-types.json`, `profiles-others.json`), and establishing the `spec/` directory structure for official, platform, and future regional definitions.

### Core Responsibilities

- Validate that `StructureDefinitionParser` correctly handles all resource types in the full FHIR R4 bundles
- Implement `BundleLoader` — reads `profiles-*.json` and produces `CanonicalProfile[]`
- Establish `spec/` directory layout (official R4 + platform placeholder + future CN)
- Confirm `CanonicalProfile` fields are sufficient to drive Phase 8 schema generation

### What Phase 7 Does NOT Include

- ❌ Any database code or schema generation (Phase 8)
- ❌ `StructureDefinitionRegistry` for schema generation (Phase 8)
- ❌ `SearchParameterRegistry` (Phase 8)
- ❌ Platform custom resources (`profiles-platform.json`) (Phase 9)
- ❌ Chinese localization profiles (future stage)
- ❌ Modifications to `CanonicalElement` interface
- ❌ Adding more individual JSON files to `core-definitions/`

---

## Architectural Context

### Current State (after Phase 1-6)

```
spec/fhir/r4/                        ← Official FHIR R4 bundles (already present)
  profiles-resources.json            ← ~148 resource StructureDefinitions
  profiles-types.json                ← ~50 type StructureDefinitions
  profiles-others.json               ← conformance resources
  search-parameters.json             ← all SearchParameters
  ...

packages/fhir-core/src/
  context/core-definitions/          ← 73 individual JSON files (Stage-1 subset)
    Patient.json, Observation.json, ...
    index.ts                         ← loadAllCoreDefinitions() — Stage-1 use only
  parser/
    structure-definition-parser.ts   ← StructureDefinitionParser (ALG-001)
  model/
    canonical-profile.ts             ← CanonicalProfile, CanonicalElement
```

### Target State (after Phase 7)

```
spec/
  fhir/r4/                           ← Unchanged (official FHIR R4)
  platform/                          ← NEW (empty placeholder for Phase 9)
    profiles-platform.json           ← Empty Bundle stub
    search-parameters-platform.json  ← Empty Bundle stub

packages/fhir-core/src/
  context/
    core-definitions/                ← Unchanged (Stage-1 validation use only)
    bundle-loader.ts                 ← NEW: loads profiles-*.json → CanonicalProfile[]
    bundle-loader.test.ts            ← NEW: tests
```

### Data Flow (Phase 7 establishes this pipeline)

```
spec/fhir/r4/profiles-resources.json
  ↓ BundleLoader.loadFromFile(path)
Bundle<StructureDefinition>
  ↓ bundle.entry[].resource (filter: kind='resource', abstract=false)
StructureDefinition[]
  ↓ StructureDefinitionParser.parse()   ← fhir-core, already exists
CanonicalProfile[]
  ↓ (consumed by Phase 8 StructureDefinitionRegistry)
```

### Two Parallel Loading Paths (intentional)

```
Path A — Stage-1 Validation (existing, unchanged):
  core-definitions/*.json (73 files)
    → loadAllCoreDefinitions()
    → FhirContextImpl (runtime validation)

Path B — Stage-2 Schema Generation (Phase 7 new):
  spec/fhir/r4/profiles-*.json (complete bundles)
    → BundleLoader (Phase 7)
    → StructureDefinitionRegistry (Phase 8)
    → TableSchemaBuilder (Phase 8)
```

---

## Task Breakdown

### Task 7.1: Parser Completeness Audit (~0.5 day)

#### Objectives

Verify that the existing `StructureDefinitionParser` correctly handles **all** StructureDefinitions in the full FHIR R4 bundles, not just the 73 that were tested in Stage-1.

#### Work Items

1. Write a diagnostic script (or test) that:
   - Reads `spec/fhir/r4/profiles-resources.json`
   - Iterates all `bundle.entry[].resource` entries
   - Runs each through `StructureDefinitionParser.parse()`
   - Collects any parse errors or warnings
2. Repeat for `profiles-types.json` and `profiles-others.json`
3. Document any failures found

#### Expected Findings

Based on Stage-1 test coverage (63 unit tests + 93 fixture tests), the parser should handle the majority correctly. Potential edge cases:

- Resources with unusual snapshot structures
- Resources with deeply nested backbone elements (>5 levels)
- Resources with complex slicing patterns not covered in Stage-1 fixtures

#### Acceptance Criteria

- [x] All resources in `profiles-resources.json` parse without errors — **149/149 ✅**
- [x] All types in `profiles-types.json` parse without errors — **63/63 ✅**
- [x] All entries in `profiles-others.json` parse without errors — **44/44 ✅**
- [x] Any failures documented and fixed before proceeding to Task 7.2 — **0 failures, no fixes needed**

#### Audit Results (Completed 2026-02-22)

| Bundle                    | Total   | Succeeded | Failed | Warnings |
| ------------------------- | ------- | --------- | ------ | -------- |
| `profiles-resources.json` | 149     | 149       | 0      | 0        |
| `profiles-types.json`     | 63      | 63        | 0      | 0        |
| `profiles-others.json`    | 44      | 44        | 0      | 0        |
| **Total**                 | **256** | **256**   | **0**  | **0**    |

**Test file:** `packages/fhir-core/src/parser/__tests__/parser-completeness-audit.test.ts` (10 tests)

**Pre-existing issue noted:** `core-definitions.test.ts` and `fhir-context.test.ts` have 4 timeout failures (5s default) unrelated to Task 7.1. These are caused by loading 73 individual JSON files sequentially and predate this task.

---

### Task 7.2: BundleLoader Implementation (~1 day)

#### Objectives

Implement `BundleLoader` — the bridge between raw `profiles-*.json` files and `CanonicalProfile[]` consumed by Phase 8.

#### File to Create

`packages/fhir-core/src/context/bundle-loader.ts`

#### Interface Design

```typescript
export interface BundleLoadOptions {
  /** Only include entries where kind matches. Default: all kinds. */
  filterKind?: StructureDefinitionKind | StructureDefinitionKind[];

  /** Exclude abstract definitions. Default: false (include abstract). */
  excludeAbstract?: boolean;

  /** Only include entries where type matches one of these. */
  filterTypes?: string[];
}

export interface BundleLoadResult {
  profiles: CanonicalProfile[];
  errors: BundleLoadError[];
  stats: {
    total: number; // total entries in bundle
    loaded: number; // successfully parsed
    skipped: number; // filtered out
    failed: number; // parse errors
  };
}

export interface BundleLoadError {
  resourceType: string;
  url: string;
  error: Error;
}
```

#### Key Functions

```typescript
/**
 * Load CanonicalProfiles from a FHIR Bundle JSON file.
 * Reads the file, parses each StructureDefinition entry,
 * and returns the results with error reporting.
 */
export async function loadBundleFromFile(
  filePath: string,
  options?: BundleLoadOptions,
): Promise<BundleLoadResult>;

/**
 * Load CanonicalProfiles from an already-parsed Bundle object.
 * Useful for testing and for in-memory bundles.
 */
export function loadBundleFromObject(
  bundle: Bundle<StructureDefinition>,
  options?: BundleLoadOptions,
): BundleLoadResult;

/**
 * Load and merge multiple bundle files in order.
 * Later bundles override earlier ones for the same URL.
 * Load order: types → resources → others → platform (future)
 */
export async function loadBundlesFromFiles(
  filePaths: string[],
  options?: BundleLoadOptions,
): Promise<BundleLoadResult>;
```

#### Internal Logic

```
loadBundleFromFile(path, options):
  1. readFile(path) → JSON.parse → Bundle<StructureDefinition>
  2. bundle.entry[].resource → StructureDefinition[]
  3. Apply filters (kind, abstract, type)
  4. For each SD:
     a. parseFhirJson(JSON.stringify(sd)) → validate structure
     b. StructureDefinitionParser.parse(sd) → CanonicalProfile
     c. On error: add to errors[], continue (don't abort)
  5. Return BundleLoadResult
```

#### Files to Create

- `packages/fhir-core/src/context/bundle-loader.ts`
- `packages/fhir-core/src/context/__tests__/bundle-loader.test.ts`

#### Test Strategy

```typescript
// Unit tests (mock bundle, no file I/O):
describe("loadBundleFromObject", () => {
  it("loads all entries from a valid bundle");
  it("filters by kind=resource correctly");
  it("excludes abstract definitions when excludeAbstract=true");
  it("reports errors without aborting on parse failure");
  it("returns correct stats (total/loaded/skipped/failed)");
  it("handles empty bundle gracefully");
  it("handles bundle with no entry array");
});

// Integration tests (real spec files):
describe("loadBundleFromFile — profiles-resources.json", () => {
  it("loads all resource StructureDefinitions without errors");
  it("produces CanonicalProfile with correct kind=resource");
  it("Patient profile has expected elements (id, name, birthDate, ...)");
  it("Observation profile has expected elements (status, code, value[x], ...)");
});

describe("loadBundleFromFile — profiles-types.json", () => {
  it("loads all type StructureDefinitions without errors");
  it("HumanName profile has expected elements");
  it("Coding profile has expected elements");
});

describe("loadBundlesFromFiles — merge order", () => {
  it("later bundle overrides earlier for same URL");
  it("merged result contains entries from all bundles");
});
```

#### Acceptance Criteria

- [x] `loadBundleFromObject` passes all unit tests (15+ tests) — **16 unit tests ✅**
- [x] `loadBundleFromFile` successfully loads `profiles-resources.json` (all ~148 resources) — **149 loaded ✅**
- [x] `loadBundleFromFile` successfully loads `profiles-types.json` (all ~50 types) — **63 loaded ✅**
- [x] `loadBundleFromFile` successfully loads `profiles-others.json` — **44 loaded ✅**
- [x] Error reporting works (partial failures don't abort the load) — **tested ✅**
- [x] `tsc --noEmit` clean (no new errors introduced) — **✅**

**Test file:** `packages/fhir-core/src/context/__tests__/bundle-loader.test.ts` (28 tests)
**Completed:** 2026-02-22

---

### Task 7.3: spec/ Directory Structure (~0.5 day)

#### Objectives

Establish the canonical `spec/` directory layout that will be used throughout Stage-2 and beyond.

#### Directory Layout

```
spec/
  fhir/
    r4/                              ← Official FHIR R4 v4.0.1 (already present)
      profiles-resources.json        ← 148 resource StructureDefinitions
      profiles-types.json            ← 50 type StructureDefinitions
      profiles-others.json           ← conformance resources
      profiles-extensions.json       ← extension definitions
      search-parameters.json         ← all SearchParameters
      valuesets.json                 ← value set definitions
      conceptmaps.json               ← concept maps
      ...

  platform/                          ← NEW: Platform custom definitions (Phase 9)
    profiles-platform.json           ← Empty Bundle stub (placeholder)
    search-parameters-platform.json  ← Empty Bundle stub (placeholder)
    README.md                        ← Documents what goes here

  cn/                                ← Future: Chinese localization (Stage-3+)
    (not created yet)
```

#### Loading Order (documented for Phase 8)

```
Schema Generation loading order:
  1. spec/fhir/r4/profiles-types.json       ← type system (no tables)
  2. spec/fhir/r4/profiles-resources.json   ← clinical resources (tables)
  3. spec/fhir/r4/profiles-others.json      ← conformance resources (tables)
  4. spec/platform/profiles-platform.json   ← platform resources (Phase 9)
  [future] spec/cn/profiles-cn-core.json   ← CN constraints (validation only)

SearchParameter loading order:
  1. spec/fhir/r4/search-parameters.json
  2. spec/platform/search-parameters-platform.json  (Phase 9)
  [future] spec/cn/search-parameters-cn.json
```

#### Files to Create

- `spec/platform/profiles-platform.json` — empty Bundle stub
- `spec/platform/search-parameters-platform.json` — empty Bundle stub
- `spec/platform/README.md` — documents purpose and format

#### Empty Bundle Stub Format

```json
{
  "resourceType": "Bundle",
  "id": "medxai-platform-profiles",
  "type": "collection",
  "entry": []
}
```

#### Acceptance Criteria

- [x] `spec/platform/` directory created with stub files — **✅**
- [x] `spec/platform/README.md` documents the purpose and format — **✅**
- [ ] Loading order documented in a `spec/README.md` — deferred (documented in `spec/platform/README.md` instead)

**Completed:** 2026-02-22

---

### Task 7.4: CanonicalProfile Sufficiency Verification (~0.5 day)

#### Objectives

Verify (without modifying) that `CanonicalProfile` and `CanonicalElement` contain all information needed by Phase 8's `TableSchemaBuilder`. This is a design validation step, not an implementation step.

#### Verification Checklist

For `TableSchemaBuilder` to generate a `ResourceTableSet`, it needs:

| Information Needed               | Source in CanonicalProfile                         | Status |
| -------------------------------- | -------------------------------------------------- | ------ |
| Is this a resource (not a type)? | `profile.kind === 'resource'`                      | ✅     |
| Should we build a table?         | `profile.abstract === false`                       | ✅     |
| Resource type name (table name)  | `profile.type` (e.g., `'Patient'`)                 | ✅     |
| Element path                     | `element.path`                                     | ✅     |
| Element type code                | `element.types[0].code`                            | ✅     |
| Is element a reference?          | `element.types[0].code === 'Reference'`            | ✅     |
| Is element an array?             | `element.max === 'unbounded' \|\| element.max > 1` | ✅     |
| Is element required?             | `element.min > 0`                                  | ✅     |

**Conclusion from verification:** `CanonicalProfile` is sufficient. No modifications needed.

#### Acceptance Criteria

- [x] Written verification document (or test assertions) confirming all needed fields are present — **verified in checklist above ✅**
- [x] No changes to `CanonicalElement` or `CanonicalProfile` interfaces — **confirmed, zero changes ✅**

**Completed:** 2026-02-22

---

### Task 7.5: Export & Integration (~0.5 day)

#### Objectives

Export `BundleLoader` from `fhir-core` public API and ensure all existing tests still pass.

#### Files to Modify

- `packages/fhir-core/src/context/index.ts` — add `BundleLoader` exports
- `packages/fhir-core/src/index.ts` — re-export if needed

#### Acceptance Criteria

- [x] `BundleLoader` exported from `fhir-core` public API — **context/index.ts + index.ts updated ✅**
- [x] All existing Phase 1-6 tests still pass (no regressions) — **2404 tests passing (excl. 4 pre-existing timeouts) ✅**
- [x] `tsc --noEmit` clean (no new errors) — **✅**
- [ ] Build produces ESM + CJS + `.d.ts` — to verify at final integration

**Completed:** 2026-02-22

---

## Test Summary

| Test File                                      | Type       | Count |
| ---------------------------------------------- | ---------- | ----- |
| `parser-completeness-audit.test.ts` (Task 7.1) | Audit      | 10    |
| `bundle-loader.test.ts` (unit + integration)   | Unit+Integ | 28    |
| Existing Phase 1-6 tests                       | Regression | 2404  |

**Total new tests: 38**

---

## File Summary

### New Files

| File                                                                        | Purpose                      |
| --------------------------------------------------------------------------- | ---------------------------- |
| `packages/fhir-core/src/context/bundle-loader.ts`                           | BundleLoader implementation  |
| `packages/fhir-core/src/parser/__tests__/parser-completeness-audit.test.ts` | Task 7.1 audit tests         |
| `packages/fhir-core/src/context/__tests__/bundle-loader.test.ts`            | Unit + integration tests     |
| `spec/platform/profiles-platform.json`                                      | Empty Bundle stub            |
| `spec/platform/search-parameters-platform.json`                             | Empty Bundle stub            |
| `spec/platform/README.md`                                                   | Platform spec documentation  |
| `spec/README.md`                                                            | Spec directory documentation |

### Modified Files

| File                                      | Change                      |
| ----------------------------------------- | --------------------------- |
| `packages/fhir-core/src/context/index.ts` | Add BundleLoader exports    |
| `packages/fhir-core/src/index.ts`         | Add BundleLoader re-exports |

### Unchanged Files

| File                                    | Reason                                  |
| --------------------------------------- | --------------------------------------- |
| `core-definitions/*.json` (73 files)    | Stage-1 validation path, not touched    |
| `core-definitions/index.ts`             | Stage-1 API, not touched                |
| `model/canonical-profile.ts`            | No modifications needed                 |
| `parser/structure-definition-parser.ts` | Only bug fixes if Task 7.1 finds issues |

---

## Acceptance Criteria (Phase 7 Complete)

- [x] `BundleLoader` loads all entries from `profiles-resources.json` without errors — **149 ✅**
- [x] `BundleLoader` loads all entries from `profiles-types.json` without errors — **63 ✅**
- [x] `BundleLoader` loads all entries from `profiles-others.json` without errors — **44 ✅**
- [x] `spec/platform/` directory created with stub files — **✅**
- [x] `CanonicalProfile` sufficiency verified (no modifications needed) — **✅**
- [x] `BundleLoader` exported from `fhir-core` public API — **✅**
- [x] 38 new tests passing (exceeds 25+ target) — **✅**
- [x] All 2404 existing tests still passing (excl. 4 pre-existing timeouts) — **✅**
- [x] `tsc --noEmit` clean (no new errors) — **✅**
- [ ] Build: ESM + CJS + `.d.ts` — to verify

---

## Implementation Notes

**Phase 7 completed: 2026-02-22**

- Task 7.1: Parser audit passed 256/256 StructureDefinitions across 3 bundles, zero failures
- Task 7.2: BundleLoader implemented with 3 public functions, 28 tests (16 unit + 12 integration)
- Task 7.3: `spec/platform/` created with empty Bundle stubs and README
- Task 7.4: CanonicalProfile verified sufficient — no interface changes needed
- Task 7.5: Exports added to `context/index.ts` and `index.ts`
- Pre-existing issue: 4 timeout failures in `core-definitions.test.ts` / `fhir-context.test.ts` (5s default timeout, unrelated to Phase 7)
