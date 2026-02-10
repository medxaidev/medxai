# Phase 3: fhir-context — Detailed Plan

> **Status:** Planning  
> **Duration:** 8-10 days  
> **Complexity:** Medium  
> **Risk:** Low  
> **Dependencies:** Phase 1 (fhir-model), Phase 2 (fhir-parser)

---

## Overview

Phase 3 implements the **`fhir-context` module**, which serves as the central registry and lifecycle manager for FHIR StructureDefinitions. This module is the foundation for Phase 4 (snapshot generation) and Phase 5 (validation).

### Core Responsibilities

- StructureDefinition registry and caching
- Loader abstraction for multiple sources (file system, memory, future: HTTP)
- Profile inheritance chain resolution
- Circular dependency detection
- FHIR R4 core resource preloading

### What Phase 3 Does NOT Include

- ❌ Snapshot generation (Phase 4: fhir-profile)
- ❌ Structural validation (Phase 5: fhir-validator)
- ❌ Search parameter processing (future phase)
- ❌ Terminology services (future phase)
- ❌ Chinese language support (future phase)

---

## Architectural Context

### Module Position in Layered Architecture

```
Semantic Layer (Foundation)
├── fhir-model ✅ (Phase 1)
├── fhir-parser ✅ (Phase 2)
├── fhir-context ⬅️ (Phase 3, current)
└── fhir-profile (Phase 4, depends on context)

Validation Layer
└── fhir-validator (Phase 5, depends on profile)
```

### Dependency Rules (Enforced)

- `fhir-context` **MAY** depend on:
  - ✅ `fhir-model` (for type definitions)
  - ✅ `fhir-parser` (to parse loaded JSON)
  
- `fhir-context` **MUST NOT** depend on:
  - ❌ `fhir-profile` (snapshot generation)
  - ❌ `fhir-validator`
  - ❌ Infrastructure layer (database, HTTP clients in Phase 3)

### HAPI FHIR Conceptual Mapping

| HAPI Component | MedXAI Equivalent | Phase |
|----------------|-------------------|-------|
| `FhirContext` | `FhirContext` class | Phase 3 |
| `IValidationSupport` | `StructureDefinitionLoader` interface | Phase 3 |
| `ValidationSupportChain` | `CompositeLoader` | Phase 3 |
| `PrePopulatedValidationSupport` | `MemoryLoader` | Phase 3 |
| `ProfileUtilities` | `SnapshotGenerator` | Phase 4 |

---

## Task Breakdown

### Task 3.1: Core Interfaces & Error Types (Day 1, ~0.5 day)

#### Objectives

Define the foundational interfaces and error types for the context module.

#### Files to Create

- `packages/fhir-core/src/context/types.ts`
- `packages/fhir-core/src/context/errors.ts`

#### Work Items

1. **Define `FhirContext` interface**
   ```typescript
   interface FhirContext {
     loadStructureDefinition(url: string): Promise<StructureDefinition>;
     getStructureDefinition(url: string): StructureDefinition | undefined;
     hasStructureDefinition(url: string): boolean;
     resolveInheritanceChain(url: string): Promise<string[]>;
     registerStructureDefinition(sd: StructureDefinition): void;
     preloadCoreDefinitions(): Promise<void>;
     getStatistics(): ContextStatistics;
   }
   ```

2. **Define `StructureDefinitionLoader` interface**
   ```typescript
   interface StructureDefinitionLoader {
     load(url: string): Promise<StructureDefinition | null>;
     canLoad(url: string): boolean;
     getSourceType(): string; // 'file' | 'memory' | 'http'
   }
   ```

3. **Define `LoaderOptions` configuration**
   ```typescript
   interface LoaderOptions {
     baseUrl?: string;
     timeout?: number;
     retryCount?: number;
     cache?: boolean;
   }
   ```

4. **Define error types**
   - `ContextError` (base error)
   - `CircularDependencyError` (extends ContextError)
   - `ResourceNotFoundError` (extends ContextError)
   - `LoaderError` (extends ContextError)
   - `InvalidStructureDefinitionError` (extends ContextError)

5. **Define `ContextStatistics` type**
   ```typescript
   interface ContextStatistics {
     totalLoaded: number;
     cacheHits: number;
     cacheMisses: number;
     loaderCalls: number;
     averageLoadTime: number;
   }
   ```

#### Acceptance Criteria

- [ ] All interfaces compile without errors
- [ ] Error types have proper inheritance chain
- [ ] TSDoc comments for all public interfaces
- [ ] No dependencies on fhir-profile or fhir-validator

---

### Task 3.2: StructureDefinition Registry (Day 1-2, ~1 day)

#### Objectives

Implement the in-memory registry for storing and querying StructureDefinitions.

#### Files to Create

- `packages/fhir-core/src/context/registry.ts`
- `packages/fhir-core/src/context/__tests__/registry.test.ts`

#### Work Items

1. **Implement `StructureDefinitionRegistry` class**
   - Internal Map storage: `Map<string, StructureDefinition>`
   - Key format: canonical URL (e.g., `http://hl7.org/fhir/StructureDefinition/Patient`)
   - Version support: `url|version` format (e.g., `http://example.org/Profile|1.0.0`)

2. **Core operations**
   - `register(sd: StructureDefinition): void`
   - `get(url: string): StructureDefinition | undefined`
   - `has(url: string): boolean`
   - `delete(url: string): boolean`
   - `clear(): void`
   - `size(): number`
   - `getAllUrls(): string[]`

3. **Version resolution logic**
   - If URL contains `|version`, exact match required
   - If URL has no version, return latest version (if multiple exist)
   - Implement version comparison (semantic versioning)

4. **Statistics tracking**
   - Track registration count
   - Track query count
   - Track cache hit/miss ratio

#### Acceptance Criteria

- [ ] Registry stores and retrieves StructureDefinitions correctly
- [ ] Version resolution works for both exact and latest version queries
- [ ] Statistics are tracked accurately
- [ ] Unit tests cover all operations (≥20 tests)
- [ ] Edge cases tested: duplicate registration, non-existent URL, version conflicts

---

### Task 3.3: Loader Implementations (Day 2-3, ~1.5 days)

#### Objectives

Implement concrete loader classes for different sources.

#### Files to Create

- `packages/fhir-core/src/context/loaders/memory-loader.ts`
- `packages/fhir-core/src/context/loaders/file-loader.ts`
- `packages/fhir-core/src/context/loaders/composite-loader.ts`
- `packages/fhir-core/src/context/loaders/index.ts`
- `packages/fhir-core/src/context/__tests__/loaders.test.ts`

#### Work Items

1. **MemoryLoader** (for testing and preloaded resources)
   - Constructor accepts `Map<string, StructureDefinition>`
   - `load(url)` returns from internal map
   - `canLoad(url)` checks if URL exists in map
   - Use case: unit tests, preloaded core resources

2. **FileSystemLoader** (load from local JSON files)
   - Constructor accepts base directory path
   - `load(url)` maps URL to file path (configurable mapping strategy)
   - Uses `fhir-parser.parseFhirJson()` to parse file content
   - Error handling: file not found, invalid JSON, parse errors
   - Use case: loading custom profiles from local files

3. **CompositeLoader** (chain of responsibility pattern)
   - Constructor accepts array of loaders: `StructureDefinitionLoader[]`
   - `load(url)` tries each loader in order until one succeeds
   - `canLoad(url)` returns true if any loader can load
   - Use case: fallback chain (memory → file → future: HTTP)

4. **Loader error handling**
   - Wrap loader errors in `LoaderError`
   - Include source loader type in error message
   - Preserve original error stack trace

#### Acceptance Criteria

- [ ] MemoryLoader works with in-memory map
- [ ] FileSystemLoader reads and parses JSON files correctly
- [ ] CompositeLoader tries loaders in order and stops at first success
- [ ] Error handling is robust (file not found, parse errors, etc.)
- [ ] Unit tests for each loader (≥15 tests total)
- [ ] Integration test: CompositeLoader with memory + file loaders

---

### Task 3.4: Inheritance Chain Resolution (Day 3-4, ~1.5 days)

#### Objectives

Implement recursive resolution of profile inheritance chains with circular dependency detection.

#### Files to Create

- `packages/fhir-core/src/context/inheritance-resolver.ts`
- `packages/fhir-core/src/context/__tests__/inheritance-resolver.test.ts`

#### Work Items

1. **Implement `InheritanceChainResolver` class**
   - Constructor accepts `FhirContext` reference (to load base definitions)
   - Main method: `resolve(url: string): Promise<string[]>`

2. **Resolution algorithm**
   ```
   Input: Profile URL (e.g., "http://example.org/ChinesePatient")
   Output: Inheritance chain (e.g., ["ChinesePatient", "Patient", "DomainResource", "Resource"])
   
   Steps:
   1. Load StructureDefinition for given URL
   2. Extract baseDefinition URL
   3. If baseDefinition exists:
      a. Check if baseDefinition is in current chain (circular dependency)
      b. If circular, throw CircularDependencyError
      c. If not circular, recursively resolve baseDefinition
      d. Prepend current URL to chain
   4. If no baseDefinition (reached root), return [url]
   5. Return complete chain
   ```

3. **Circular dependency detection**
   - Maintain a Set of "currently resolving" URLs
   - Before loading each base, check if it's in the set
   - If found, construct error message showing the cycle
   - Example: `"Circular dependency detected: A → B → C → A"`

4. **Caching resolved chains**
   - Cache resolved chains in a Map: `Map<string, string[]>`
   - Invalidate cache when a StructureDefinition is re-registered

5. **Edge cases**
   - Base definition not found (throw ResourceNotFoundError)
   - Invalid baseDefinition URL format
   - Self-referencing profile (A.baseDefinition = A)

#### Acceptance Criteria

- [ ] Resolves simple inheritance chains (e.g., Patient → DomainResource → Resource)
- [ ] Resolves complex chains (3+ levels)
- [ ] Detects direct circular dependencies (A → B → A)
- [ ] Detects indirect circular dependencies (A → B → C → A)
- [ ] Throws appropriate errors with clear messages
- [ ] Caching works correctly
- [ ] Unit tests cover all scenarios (≥12 tests)

---

### Task 3.5: FHIR R4 Core Resources Preparation (Day 4-5, ~1 day)

#### Objectives

Prepare FHIR R4 core StructureDefinition JSON files for preloading.

#### Files to Create

- `packages/fhir-core/src/context/fixtures/core-definitions/` (directory)
  - `Resource.json`
  - `DomainResource.json`
  - `Element.json`
  - `BackboneElement.json`
  - `Patient.json`
  - `Observation.json`
  - `Condition.json`
  - `Encounter.json`
  - `Practitioner.json`
  - `Organization.json`
  - `Procedure.json`
  - `MedicationRequest.json`
  - `DiagnosticReport.json`
  - `AllergyIntolerance.json`
  - `Immunization.json`
  - (Total: ~20-30 core resources)

#### Work Items

1. **Download FHIR R4 core definitions**
   - Source: https://hl7.org/fhir/R4/definitions.json.zip
   - Extract StructureDefinition resources
   - Select ~20-30 most commonly used resources

2. **Organize files**
   - One JSON file per StructureDefinition
   - File naming: `{resourceType}.json` (e.g., `Patient.json`)
   - Validate JSON format

3. **Create index file**
   - `packages/fhir-core/src/context/fixtures/core-definitions/index.ts`
   - Export array of file paths or inline JSON objects
   - Facilitate easy import in preload logic

4. **Verify completeness**
   - Ensure all base resources are included (Resource, DomainResource, Element)
   - Ensure inheritance chains are complete (no missing base definitions)

#### Acceptance Criteria

- [ ] 20-30 core StructureDefinition JSON files prepared
- [ ] All files are valid FHIR R4 StructureDefinitions
- [ ] Inheritance chains are complete (no broken references)
- [ ] Index file exports all definitions
- [ ] Files are organized in a clear directory structure

---

### Task 3.6: FhirContext Main Class (Day 5-6, ~1.5 days)

#### Objectives

Implement the main `FhirContext` class that integrates registry, loaders, and inheritance resolution.

#### Files to Create

- `packages/fhir-core/src/context/fhir-context.ts`
- `packages/fhir-core/src/context/__tests__/fhir-context.test.ts`

#### Work Items

1. **Implement `FhirContext` class**
   - Constructor accepts `StructureDefinitionLoader` (or array for composite)
   - Internal components:
     - `StructureDefinitionRegistry` instance
     - `InheritanceChainResolver` instance
     - `StructureDefinitionLoader` instance(s)
     - Statistics tracker

2. **Core methods implementation**

   **`loadStructureDefinition(url: string): Promise<StructureDefinition>`**
   - Check registry first (cache hit)
   - If not in registry, use loader to load
   - Parse JSON if loader returns raw string
   - Validate loaded StructureDefinition (has required fields: url, name, status, kind)
   - Register in registry
   - Update statistics
   - Return StructureDefinition

   **`getStructureDefinition(url: string): StructureDefinition | undefined`**
   - Synchronous query from registry only
   - Does NOT trigger loading

   **`hasStructureDefinition(url: string): boolean`**
   - Check if URL exists in registry

   **`resolveInheritanceChain(url: string): Promise<string[]>`**
   - Delegate to `InheritanceChainResolver`
   - Ensure all base definitions are loaded

   **`registerStructureDefinition(sd: StructureDefinition): void`**
   - Validate StructureDefinition
   - Register in registry
   - Invalidate inheritance chain cache if needed

   **`preloadCoreDefinitions(): Promise<void>`**
   - Load all core FHIR R4 definitions from fixtures
   - Use MemoryLoader or FileSystemLoader
   - Register all in registry
   - Log preload statistics

   **`getStatistics(): ContextStatistics`**
   - Return current statistics (loads, cache hits, etc.)

3. **Lifecycle management**
   - `initialize(): Promise<void>` — call preloadCoreDefinitions
   - `dispose(): void` — clear registry, reset statistics

4. **Error handling**
   - Wrap all errors in appropriate ContextError subclasses
   - Provide clear error messages with context (URL, loader type, etc.)

#### Acceptance Criteria

- [ ] FhirContext integrates all components correctly
- [ ] loadStructureDefinition works with cache and loader fallback
- [ ] Inheritance chain resolution works end-to-end
- [ ] preloadCoreDefinitions loads all core resources
- [ ] Statistics tracking is accurate
- [ ] Error handling is robust
- [ ] Unit tests cover all methods (≥20 tests)
- [ ] Integration tests cover complete workflows (≥5 tests)

---

### Task 3.7: Caching Strategy (Day 6, ~0.5 day)

#### Objectives

Implement simple caching for StructureDefinitions and inheritance chains.

#### Files to Create

- `packages/fhir-core/src/context/cache.ts`
- `packages/fhir-core/src/context/__tests__/cache.test.ts`

#### Work Items

1. **StructureDefinition cache**
   - Already implemented in `StructureDefinitionRegistry` (Map-based)
   - No LRU eviction needed in Phase 3 (keep it simple)
   - Cache invalidation: when `registerStructureDefinition` is called with same URL

2. **Inheritance chain cache**
   - Implement in `InheritanceChainResolver`
   - Map<string, string[]> for resolved chains
   - Invalidate when base StructureDefinition is updated

3. **Cache statistics**
   - Track cache hits and misses
   - Include in `ContextStatistics`

4. **Future-proofing for Phase 4**
   - Add placeholder for snapshot cache (not implemented in Phase 3)
   - Document cache invalidation strategy for snapshots

#### Acceptance Criteria

- [ ] StructureDefinition cache works correctly
- [ ] Inheritance chain cache works correctly
- [ ] Cache invalidation works when definitions are updated
- [ ] Statistics accurately reflect cache performance
- [ ] Unit tests verify cache behavior (≥8 tests)

---

### Task 3.8: Test Suite (Day 7-8, ~2 days)

#### Objectives

Create comprehensive test coverage for the entire context module.

#### Files to Create

- `packages/fhir-core/src/context/__tests__/integration.test.ts`
- `packages/fhir-core/src/context/__tests__/fixtures/` (test fixtures)
- Update existing unit test files

#### Work Items

1. **Unit tests** (already created in previous tasks)
   - Registry: ≥20 tests
   - Loaders: ≥15 tests
   - Inheritance resolver: ≥12 tests
   - FhirContext: ≥20 tests
   - Cache: ≥8 tests
   - **Subtotal: ~75 unit tests**

2. **Integration tests**
   - Complete loading workflow: file → parse → register → query
   - Inheritance chain resolution with real FHIR resources
   - Composite loader fallback chain
   - Preload core definitions and verify registry state
   - Error scenarios: circular dependencies, missing resources
   - **Target: ≥15 integration tests**

3. **Fixture-based tests**
   - Use real FHIR R4 StructureDefinitions
   - Test Patient → DomainResource → Resource chain
   - Test custom profile with inheritance
   - Test circular dependency detection with crafted fixtures
   - **Target: ≥10 fixture tests**

4. **Error scenario tests**
   - Resource not found
   - Invalid JSON
   - Circular dependency (various patterns)
   - Invalid StructureDefinition (missing required fields)
   - Loader failures
   - **Target: ≥10 error tests**

5. **Performance tests** (optional, informational)
   - Measure load time for 100 StructureDefinitions
   - Measure cache hit rate after warmup
   - Measure inheritance chain resolution time

#### Test Coverage Target

- **Total tests: 100-120**
- **Line coverage: ≥80%**
- **Branch coverage: ≥75%**

#### Acceptance Criteria

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All fixture tests pass
- [ ] All error scenario tests pass
- [ ] Test coverage meets targets (≥80% line coverage)
- [ ] No flaky tests
- [ ] Tests run in <5 seconds total

---

### Task 3.9: Exports & Build Validation (Day 8, ~0.5 day)

#### Objectives

Create barrel exports and validate the complete build pipeline.

#### Files to Create/Update

- `packages/fhir-core/src/context/index.ts` (new)
- `packages/fhir-core/src/index.ts` (update)

#### Work Items

1. **Create `src/context/index.ts`**
   ```typescript
   // Public API exports
   export type { FhirContext, StructureDefinitionLoader, LoaderOptions, ContextStatistics } from './types.js';
   export { FhirContextImpl } from './fhir-context.js';
   export { MemoryLoader, FileSystemLoader, CompositeLoader } from './loaders/index.js';
   export { ContextError, CircularDependencyError, ResourceNotFoundError, LoaderError } from './errors.js';
   
   // Internal exports (not re-exported from src/index.ts)
   // - StructureDefinitionRegistry
   // - InheritanceChainResolver
   ```

2. **Update `src/index.ts`**
   - Add context module re-exports
   - Organize by module (model, parser, context)

3. **Run build validation**
   - `npx tsc --noEmit` — verify TypeScript compilation
   - `npm run build` — verify full build pipeline (tsc → api-extractor → esbuild)
   - Check `dist/index.d.ts` includes context types

4. **Run full test suite**
   - `npx vitest run` — all tests across all modules
   - Verify no regressions in Phase 1/2 tests

5. **Update package.json exports** (if needed)
   - Ensure context module is properly exported

#### Acceptance Criteria

- [ ] `src/context/index.ts` exports all public APIs
- [ ] `src/index.ts` re-exports context module
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] `dist/index.d.ts` contains context types
- [ ] All tests pass (Phase 1 + Phase 2 + Phase 3)
- [ ] No api-extractor warnings

---

## Phase 3 Overall Acceptance Criteria

| Criterion | Verification Method | Status |
|-----------|---------------------|--------|
| Load FHIR R4 Patient StructureDefinition | `context.loadStructureDefinition('http://hl7.org/fhir/StructureDefinition/Patient')` succeeds | ⬜ |
| Resolve Patient inheritance chain | Returns `['Patient', 'DomainResource', 'Resource']` | ⬜ |
| Detect circular dependencies | Crafted circular profile throws `CircularDependencyError` | ⬜ |
| Support versioned URLs | `context.loadStructureDefinition('http://example.org/Profile\|1.0.0')` works | ⬜ |
| Preload core resources | After `preloadCoreDefinitions()`, registry contains ≥20 resources | ⬜ |
| Composite loader fallback | CompositeLoader tries loaders in order | ⬜ |
| Cache hit rate | After warmup, cache hit rate ≥80% for repeated queries | ⬜ |
| Test coverage | ≥80% line coverage, ≥75% branch coverage | ⬜ |
| Zero TypeScript errors | `tsc --noEmit` passes | ⬜ |
| Build success | `npm run build` succeeds | ⬜ |
| All tests pass | `vitest run` shows 100% pass rate | ⬜ |
| No regressions | Phase 1 and Phase 2 tests still pass | ⬜ |

---

## Dependencies & Risks

### Dependencies

| Dependency | Status | Impact if Delayed |
|------------|--------|-------------------|
| Phase 1 (fhir-model) | ✅ Complete | N/A |
| Phase 2 (fhir-parser) | ✅ Complete | N/A |
| FHIR R4 core definitions | ⬜ Need to download | Can use subset initially |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FHIR R4 definitions incomplete | Low | Medium | Download official definitions.json.zip from HL7 |
| Inheritance chain complexity | Low | Medium | Start with simple chains, add complexity incrementally |
| Cache invalidation bugs | Medium | Low | Comprehensive cache invalidation tests |
| Loader error handling gaps | Medium | Medium | Test all error scenarios explicitly |
| Performance issues with large registries | Low | Low | Defer optimization to later phase if needed |

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \  Integration Tests (15)
      /____\
     /      \  Unit Tests (75)
    /________\
   /          \  Fixture Tests (10) + Error Tests (10)
  /____________\
```

### Test Categories

1. **Unit Tests** (~75 tests)
   - Each class/method tested in isolation
   - Mock dependencies
   - Fast execution (<1s total)

2. **Integration Tests** (~15 tests)
   - End-to-end workflows
   - Real components (no mocks)
   - Moderate execution time (1-2s)

3. **Fixture Tests** (~10 tests)
   - Real FHIR StructureDefinitions
   - Validate against official definitions
   - Slow execution (2-3s)

4. **Error Scenario Tests** (~10 tests)
   - All error paths covered
   - Clear error messages validated

**Total: 100-120 tests**

---

## Interface Contract for Phase 4

Phase 4 (fhir-profile) will depend on Phase 3 providing this interface:

```typescript
interface FhirContext {
  // Load StructureDefinition (with caching)
  loadStructureDefinition(url: string): Promise<StructureDefinition>;
  
  // Resolve inheritance chain (from child to parent)
  resolveInheritanceChain(url: string): Promise<string[]>;
  
  // Register generated snapshot back to context
  registerStructureDefinition(sd: StructureDefinition): void;
  
  // Check if definition is already loaded
  hasStructureDefinition(url: string): boolean;
}
```

Phase 4 usage example:

```typescript
// Phase 4: SnapshotGenerator will use Phase 3 like this
async function generateSnapshot(sd: StructureDefinition): Promise<StructureDefinition> {
  // 1. Get inheritance chain using Phase 3
  const chain = await context.resolveInheritanceChain(sd.url);
  
  // 2. Load base definition using Phase 3
  const base = await context.loadStructureDefinition(sd.baseDefinition);
  
  // 3. Generate snapshot (Phase 4 algorithm)
  const snapshot = mergeElements(base.snapshot, sd.differential);
  
  // 4. Register back to context (optional, for caching)
  context.registerStructureDefinition({ ...sd, snapshot });
  
  return sd;
}
```

---

## Documentation Updates Required

After Phase 3 completion, update:

1. **`devdocs/architecture/MODULES.md`**
   - Mark `fhir-context` as implemented
   - Update dependency graph

2. **`devdocs/architecture/DATAFLOW.md`**
   - Add "StructureDefinition Loading Flow" diagram
   - Add "Inheritance Chain Resolution Flow" diagram

3. **`devdocs/stages/Stage-1-Development-Roadmap.md`**
   - Mark Phase 3 as complete
   - Update overall progress

4. **`README.md`** (if exists in fhir-core package)
   - Add context module usage examples

---

## Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| 3.1 Core Interfaces | 0.5 day | None |
| 3.2 Registry | 1 day | 3.1 |
| 3.3 Loaders | 1.5 days | 3.1 |
| 3.4 Inheritance Resolver | 1.5 days | 3.1, 3.2 |
| 3.5 Core Resources Prep | 1 day | None (parallel) |
| 3.6 FhirContext Main | 1.5 days | 3.2, 3.3, 3.4 |
| 3.7 Caching | 0.5 day | 3.6 |
| 3.8 Test Suite | 2 days | All above |
| 3.9 Exports & Build | 0.5 day | All above |

**Total: 8-10 days** (with some parallelization)

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Implementation files | 8-10 | ⬜ |
| Test files | 6-8 | ⬜ |
| Total tests | 100-120 | ⬜ |
| Line coverage | ≥80% | ⬜ |
| Branch coverage | ≥75% | ⬜ |
| Build time | <30s | ⬜ |
| Test execution time | <5s | ⬜ |
| Core resources preloaded | ≥20 | ⬜ |
| Public API functions | 8-10 | ⬜ |
| Public API types | 6-8 | ⬜ |

---

## Phase 3 Completion Checklist

- [ ] All 9 tasks completed
- [ ] All acceptance criteria met
- [ ] Test coverage ≥80%
- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] All tests pass (Phase 1 + 2 + 3)
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Phase-3-Detailed-Plan.md marked as complete

---

## Next Phase Preview: Phase 4 (fhir-profile)

Phase 4 will implement the **snapshot generation algorithm**, the most complex and critical algorithm in the FHIR semantic engine.

### Phase 4 Scope

- Implement HAPI's `ProfileUtilities.generateSnapshot()` algorithm (complete, Option A)
- Handle all edge cases:
  - Slicing (discriminators, slicing rules, ordered slices)
  - Choice types (`[x]` suffix handling)
  - Type specialization and constraint intersection
  - Cardinality tightening
  - Binding strength comparison
- Validate against HAPI reference tests
- Support complex profiles (US Core, IPS)

### Phase 4 Estimated Duration

**15-20 days** (marked as "VERY HIGH" complexity in roadmap)

### Phase 4 Dependencies

- ✅ Phase 1 (fhir-model)
- ✅ Phase 2 (fhir-parser)
- ⬜ Phase 3 (fhir-context) ← must complete first

---

**Phase 3 Status:** Planning → Ready for Implementation
