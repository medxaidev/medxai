# Stage-1 Development Roadmap

## Status

**Status:** Active  
**Version:** v1.0  
**Stage:** Stage-1 (Canonical FHIR Model)  
**Estimated Duration:** 6-8 weeks  
**Last Updated:** 2026-02-04

---

## Overview

This document provides a **detailed, step-by-step development plan** for Stage-1, including phases, milestones, deliverables, and success criteria.

**Stage-1 Goal**: Establish the system's ability to understand FHIR definitions correctly and deterministically.

---

## Development Philosophy

### Before Coding: Research Phase (CRITICAL) ⭐

**Duration:** 1-2 weeks  
**Effort:** 40-60 hours

**Why This Matters:**

- Snapshot generation is the **most complex algorithm** in Stage-1
- HAPI has 10+ years of production validation
- Misunderstanding semantics leads to subtle bugs that are hard to fix later
- **Correctness > Speed** in this phase

**Deliverable:** HAPI Algorithm Research Report (see Phase 0 below)

---

## Phase 0: HAPI Algorithm Deep Dive (MANDATORY) 🔍

**Duration:** 1-2 weeks  
**Status:** MUST complete before Phase 1

### Objectives

1. **Understand HAPI's Core Algorithms**
2. **Document Algorithm Logic** (not code)
3. **Identify Edge Cases**
4. **Create Reference Test Suite**

### Tasks

#### Task 0.1: Study HAPI ProfileUtilities (3-5 days)

**Target File:** `org.hl7.fhir.r4.conformance.ProfileUtilities.java`

**Focus Areas:**

- `generateSnapshot(StructureDefinition base, StructureDefinition derived)` method
- `processPaths()` - element path processing
- `updateFromBase()` - constraint merging logic
- `updateFromDefinition()` - differential application
- `sortElements()` - element ordering rules

**Deliverable:** Document with pseudocode for each key method

**Resources:**

- [HAPI GitHub - ProfileUtilities.java](https://github.com/hapifhir/org.hl7.fhir.core/blob/master/org.hl7.fhir.r4/src/main/java/org/hl7/fhir/r4/conformance/ProfileUtilities.java)
- [HAPI Documentation - Validation](https://hapifhir.io/hapi-fhir/docs/validation/profile_validator.html)

---

#### Task 0.2: Study Element Path Normalization (1-2 days)

**Target Concepts:**

- Base path: `Patient.identifier.system`
- Sliced path: `Patient.identifier:nationalId.system`
- Choice type path: `Observation.value[x]` → `valueString`, `valueQuantity`

**Key Questions to Answer:**

- How does HAPI handle path matching during differential merge?
- How are slices inserted into the element tree?
- How are choice type expansions generated?

**Deliverable:** Path normalization rules document with examples

---

#### Task 0.3: Study Constraint Merging Rules (2-3 days)

**Target Logic:**

- **Cardinality merging**: `min = max(base.min, diff.min)`, `max = min(base.max, diff.max)`
- **Type constraint merging**: Intersection of allowed types
- **Binding merging**: Stricter binding wins
- **Invariant accumulation**: Parent constraints + child constraints

**Key HAPI Methods:**

- `updateFromBase()` - how constraints are merged
- `checkTypeDerivation()` - type compatibility checking
- `compareBindings()` - binding strength comparison

**Deliverable:** Constraint merging logic flowchart

---

#### Task 0.4: Study Slicing Semantics (2-3 days)

**Target Concepts:**

- Discriminator types: `value`, `pattern`, `type`, `profile`, `exists`
- Slicing rules: `closed`, `open`, `openAtEnd`
- Slice ordering and insertion logic

**Key HAPI Methods:**

- `processSlicing()` - slicing definition processing
- `matchSlice()` - discriminator evaluation

**Deliverable:** Slicing algorithm document with test cases

---

#### Task 0.5: Create Reference Test Suite (2-3 days)

**Objective:** Validate our implementation produces same results as HAPI

**Test Categories:**

1. **Simple Profile** (no slicing, basic constraints)
2. **Inheritance Chain** (3+ levels deep)
3. **Slicing** (value discriminator, closed/open rules)
4. **Choice Types** (multiple type options)
5. **Complex Constraints** (cardinality tightening, type restriction)

**Test Format:**

```typescript
{
  name: "Simple Patient Profile",
  input: {
    base: "http://hl7.org/fhir/StructureDefinition/Patient",
    differential: { /* ... */ }
  },
  expectedSnapshot: { /* HAPI output */ },
  notes: "Tests basic cardinality tightening"
}
```

**Deliverable:** `tests/fixtures/hapi-reference-tests.json`

---

### Phase 0 Completion Criteria ✅

- [ ] ProfileUtilities algorithm documented in pseudocode
- [ ] Path normalization rules documented with 10+ examples
- [ ] Constraint merging flowchart created
- [ ] Slicing algorithm documented
- [ ] Reference test suite created (20+ test cases)
- [ ] Team review completed (all members understand algorithms)

**Exit Gate:** Cannot proceed to Phase 1 until all criteria met.

---

## Phase 1: Foundation - fhir-model (Week 1)

**Duration:** 5-7 days  
**Complexity:** Low  
**Risk:** Low

### Objectives

1. Define TypeScript types for FHIR canonical model
2. Establish type safety foundation
3. No logic, pure data structures

### Tasks

#### Task 1.1: Define FHIR Primitive Types (1 day) ✅ COMPLETED 2026-02-07

**File:** `packages/fhir-core/src/model/primitives.ts` (580 lines)

**Implemented:**

- 20 FHIR R4 primitive types using branded types (compile-time nominal typing, zero runtime cost)
- 13 common enum types (PublicationStatus, StructureDefinitionKind, BindingStrength, etc.)
- 16 base complex types (Element, Extension, Coding, CodeableConcept, Identifier, Period, Reference, ContactDetail, ContactPoint, UsageContext, Quantity, Narrative, Meta, Resource, DomainResource, BackboneElement)
- All JSDoc comments include FHIR R4 spec `@see` links and cardinality annotations

**Validation:** `tsc --noEmit` exit 0

---

#### Task 1.2: Define StructureDefinition Model (2 days) ✅ COMPLETED 2026-02-07

**File:** `packages/fhir-core/src/model/structure-definition.ts` (359 lines)

**Implemented:**

- `StructureDefinition` interface extending `DomainResource` (36 fields, all FHIR R4 fields covered)
- 4 sub-types: `StructureDefinitionMapping`, `StructureDefinitionContext`, `StructureDefinitionSnapshot`, `StructureDefinitionDifferential`
- Reuses 5 enums from `primitives.ts` (PublicationStatus, StructureDefinitionKind, TypeDerivationRule, ExtensionContextType, FhirVersionCode)
- All JSDoc comments include cardinality annotations and FHIR R4 spec `@see` links
- **Side fix:** `Resource.resourceType` changed from `FhirString` to `string` to allow literal narrowing

**Validation:** `tsc --noEmit` exit 0

---

#### Task 1.3: Define ElementDefinition Model (2 days) ✅ COMPLETED 2026-02-07

**File:** `packages/fhir-core/src/model/element-definition.ts` (648 lines)

**Implemented:**

- `ElementDefinition` interface extending `BackboneElement` (37 fields, all FHIR R4 fields covered)
- 8 sub-types: `ElementDefinitionSlicing`, `SlicingDiscriminator`, `ElementDefinitionBase`, `ElementDefinitionType`, `ElementDefinitionConstraint`, `ElementDefinitionBinding`, `ElementDefinitionExample`, `ElementDefinitionMapping`
- Reuses 7 enums from `primitives.ts` (PropertyRepresentation, SlicingRules, DiscriminatorType, AggregationMode, ReferenceVersionRules, ConstraintSeverity, BindingStrength)
- 5 choice type [x] fields (defaultValue, fixed, pattern, minValue, maxValue) typed as `unknown` with JSDoc documenting allowed types and Stage-1 strategy
- All JSDoc comments include cardinality annotations and FHIR R4 spec `@see` links

**Validation:** `tsc --noEmit` exit 0

---

#### Task 1.4: Define Canonical Model (Internal) (1-2 days)

**Files to Create:**

- `packages/fhir-core/src/model/canonical-profile.ts`

**Key Interfaces:**

```typescript
interface CanonicalProfile {
  url: string;
  version?: string;
  kind: "primitive-type" | "complex-type" | "resource" | "logical";
  type: string;
  baseProfile?: string;
  elements: Map<string, CanonicalElement>; // path → element
  abstract: boolean;
  derivation?: "specialization" | "constraint";
}

interface CanonicalElement {
  path: string;
  id: string;
  min: number;
  max: number | "unbounded";
  types: TypeConstraint[];
  binding?: BindingConstraint;
  constraints: Invariant[];
  slicing?: SlicingDefinition;
}

interface TypeConstraint {
  code: string;
  profiles?: string[];
  targetProfiles?: string[];
}

interface BindingConstraint {
  strength: "required" | "extensible" | "preferred" | "example";
  valueSetUrl: string;
}

interface Invariant {
  key: string;
  severity: "error" | "warning";
  human: string;
  expression?: string;
}
```

---

### Phase 1 Deliverables

- [ ] `fhir-model` package with all type definitions
- [ ] TypeScript compilation successful
- [ ] JSDoc comments for all public interfaces
- [ ] No logic, pure types

### Phase 1 Success Criteria ✅

- [ ] All FHIR R4 core types defined
- [ ] StructureDefinition model complete
- [ ] ElementDefinition model complete
- [ ] Canonical model defined
- [ ] Code review passed
- [ ] Documentation complete

---

## Phase 2: Parsing - fhir-parser (Week 2)

**Duration:** 5-7 days  
**Complexity:** Low-Medium  
**Risk:** Low

### Objectives

1. Parse FHIR JSON into TypeScript types
2. Handle FHIR-specific JSON conventions
3. No semantic interpretation yet

### Tasks

#### Task 2.1: JSON Parser Implementation (3 days)

**Files to Create:**

- `packages/fhir-core/src/parser/json-parser.ts`

**Key Functions:**

```typescript
function parseStructureDefinition(json: string): StructureDefinition;
function parseElementDefinition(json: any): ElementDefinition;
```

**Edge Cases to Handle:**

- Missing optional fields
- Invalid JSON structure
- FHIR-specific conventions (resourceType, meta)

---

#### Task 2.2: Primitive Value Normalization (1 day)

**Normalization Rules:**

- Trim whitespace from strings
- Validate URI format
- Validate date/datetime format

---

#### Task 2.3: Parser Tests (2 days)

**Test Cases:**

- Valid StructureDefinition JSON
- Invalid JSON (error handling)
- Edge cases (empty arrays, null values)

---

### Phase 2 Deliverables

- [ ] `fhir-parser` module
- [ ] JSON parsing for StructureDefinition
- [ ] Test suite (20+ tests)
- [ ] Error handling

### Phase 2 Success Criteria ✅

- [ ] Parse FHIR base resources (Patient, Observation)
- [ ] Parse custom profiles
- [ ] All tests passing
- [ ] Error messages are clear

---

## Phase 3: Registry - fhir-context (Week 3)

**Duration:** 5-7 days  
**Complexity:** Medium  
**Risk:** Medium

### Objectives

1. StructureDefinition registry and caching
2. Canonical URL resolution
3. Circular dependency detection

### Tasks

#### Task 3.1: Registry Implementation (2 days)

**Files to Create:**

- `packages/fhir-core/src/context/fhir-context.ts`

**Key Methods:**

```typescript
class FhirContext {
  register(url: string, sd: StructureDefinition): void;
  load(url: string): Promise<StructureDefinition>;
  resolveInheritanceChain(url: string): Promise<string[]>;
}
```

---

#### Task 3.2: Circular Dependency Detection (1 day)

**Algorithm:**

```typescript
function detectCircularDependency(chain: string[]): boolean {
  const seen = new Set<string>();
  for (const url of chain) {
    if (seen.has(url)) return true;
    seen.add(url);
  }
  return false;
}
```

---

#### Task 3.3: Loader Abstraction (1 day)

**Support:**

- File system loader (for local definitions)
- HTTP loader (for remote definitions)
- Memory loader (for tests)

---

#### Task 3.4: Context Tests (2 days)

**Test Cases:**

- Register and retrieve definitions
- Inheritance chain resolution
- Circular dependency detection
- Cache invalidation

---

### Phase 3 Deliverables

- [ ] `fhir-context` module
- [ ] Registry with caching
- [ ] Loader abstraction
- [ ] Test suite

### Phase 3 Success Criteria ✅

- [ ] Load FHIR base resources
- [ ] Resolve inheritance chains
- [ ] Detect circular dependencies
- [ ] All tests passing

---

## Phase 4: Snapshot Generation - fhir-profile (Weeks 4-6) ⭐

**Duration:** 15-20 days  
**Complexity:** VERY HIGH  
**Risk:** HIGH

**Note:** This is the **most critical and complex phase**. Allocate sufficient time.

### Objectives

1. Implement HAPI's snapshot generation algorithm
2. Handle all edge cases (slicing, choice types, inheritance)
3. Validate against HAPI reference tests

### Tasks

#### Task 4.1: Snapshot Generator Skeleton (2 days)

**Files to Create:**

- `packages/fhir-core/src/profile/snapshot-generator.ts`

**Basic Structure:**

```typescript
class SnapshotGenerator {
  constructor(private context: FhirContext) {}

  async generate(sd: StructureDefinition): Promise<StructureDefinition> {
    // Step 1: Load base
    // Step 2: Initialize snapshot
    // Step 3: Apply differential
    // Step 4: Validate
    // Step 5: Sort
  }
}
```

---

#### Task 4.2: Base Loading and Initialization (2 days)

**Implementation:**

```typescript
private async loadBase(sd: StructureDefinition): Promise<StructureDefinition> {
  if (!sd.baseDefinition) {
    throw new Error('No base definition');
  }

  const base = await this.context.load(sd.baseDefinition);

  // Ensure base has snapshot (recursive generation)
  if (!base.snapshot) {
    return this.generate(base);
  }

  return base;
}

private initializeSnapshot(base: StructureDefinition): ElementDefinition[] {
  // Deep clone base.snapshot.element
  return JSON.parse(JSON.stringify(base.snapshot.element));
}
```

---

#### Task 4.3: Element Path Matching (3 days)

**Implementation:**

```typescript
private findMatchingElement(
  snapshot: ElementDefinition[],
  path: string
): ElementDefinition | undefined {
  // Handle exact match
  // Handle sliced paths (Patient.identifier:nationalId)
  // Handle choice types (Observation.value[x])
}
```

**Edge Cases:**

- Sliced paths with colons
- Choice type expansions
- Nested elements

---

#### Task 4.4: Constraint Merging (5-7 days) ⭐

**This is the core algorithm.**

**Implementation:**

```typescript
private mergeConstraints(
  base: ElementDefinition,
  diff: ElementDefinition
): ElementDefinition {
  const merged = { ...base };

  // Merge cardinality
  merged.min = Math.max(base.min, diff.min ?? base.min);
  merged.max = this.mergeMax(base.max, diff.max);

  // Merge types
  merged.type = this.mergeTypes(base.type, diff.type);

  // Merge binding
  merged.binding = this.mergeBinding(base.binding, diff.binding);

  // Accumulate constraints
  merged.constraint = [
    ...(base.constraint ?? []),
    ...(diff.constraint ?? [])
  ];

  return merged;
}

private mergeMax(baseMax: string, diffMax?: string): string {
  if (!diffMax) return baseMax;
  if (baseMax === '*' && diffMax === '*') return '*';
  if (baseMax === '*') return diffMax;
  if (diffMax === '*') return baseMax;
  return String(Math.min(Number(baseMax), Number(diffMax)));
}

private mergeTypes(
  baseTypes?: ElementDefinitionType[],
  diffTypes?: ElementDefinitionType[]
): ElementDefinitionType[] | undefined {
  if (!diffTypes) return baseTypes;
  if (!baseTypes) return diffTypes;

  // Intersection of types
  return diffTypes.filter(dt =>
    baseTypes.some(bt => this.isTypeCompatible(bt, dt))
  );
}

private mergeBinding(
  baseBinding?: ElementDefinitionBinding,
  diffBinding?: ElementDefinitionBinding
): ElementDefinitionBinding | undefined {
  if (!diffBinding) return baseBinding;
  if (!baseBinding) return diffBinding;

  // Stricter binding wins
  const strengthOrder = ['example', 'preferred', 'extensible', 'required'];
  const baseStrength = strengthOrder.indexOf(baseBinding.strength);
  const diffStrength = strengthOrder.indexOf(diffBinding.strength);

  return diffStrength >= baseStrength ? diffBinding : baseBinding;
}
```

---

#### Task 4.5: Slicing Handling (3-4 days)

**Implementation:**

```typescript
private processSlicing(
  snapshot: ElementDefinition[],
  slicedElement: ElementDefinition
): void {
  // Insert slicing definition
  // Insert slice elements at correct position
  // Handle slice ordering
}
```

**Reference:** HAPI `processSlicing()` method

---

#### Task 4.6: Validation and Sorting (2 days)

**Implementation:**

```typescript
private validateSnapshot(snapshot: ElementDefinition[]): void {
  for (const element of snapshot) {
    // Check min <= max
    if (element.min > Number(element.max) && element.max !== '*') {
      throw new Error(`Invalid cardinality: ${element.path}`);
    }

    // Check type compatibility
    // Check required elements exist
  }
}

private sortElements(elements: ElementDefinition[]): ElementDefinition[] {
  return elements.sort((a, b) => a.path.localeCompare(b.path));
}
```

---

#### Task 4.7: HAPI Reference Tests (3-4 days)

**Objective:** Validate our implementation matches HAPI

**Test Strategy:**

1. Run HAPI on reference profiles
2. Capture HAPI's snapshot output
3. Run our implementation on same profiles
4. Compare outputs (element by element)

**Success Criteria:**

- 100% match for simple profiles
- 95%+ match for complex profiles (document differences)

---

### Phase 4 Deliverables

- [ ] `fhir-profile` module with snapshot generator
- [ ] All HAPI reference tests passing
- [ ] Edge case handling documented
- [ ] Performance benchmarks

### Phase 4 Success Criteria ✅

- [ ] Generate snapshots for FHIR base resources
- [ ] Handle profile inheritance (3+ levels)
- [ ] Handle slicing (all discriminator types)
- [ ] Handle choice types
- [ ] HAPI reference tests: 95%+ match
- [ ] Code review passed
- [ ] Algorithm documented

---

## Phase 5: Validation - fhir-validator (Week 7)

**Duration:** 5-7 days  
**Complexity:** Medium  
**Risk:** Low

### Objectives

1. Structural validation against profiles
2. Cardinality enforcement
3. Type checking

### Tasks

#### Task 5.1: Validator Implementation (3 days)

**Files to Create:**

- `packages/fhir-core/src/validator/structure-validator.ts`

**Key Methods:**

```typescript
class StructureValidator {
  async validate(resource: any, profileUrl: string): Promise<ValidationResult> {
    const snapshot = await this.context.getSnapshot(profileUrl);
    const issues: ValidationIssue[] = [];

    for (const element of snapshot.element) {
      // Extract values from resource
      const values = this.extractValues(resource, element.path);

      // Validate cardinality
      this.validateCardinality(element, values, issues);

      // Validate types
      this.validateTypes(element, values, issues);
    }

    return { valid: issues.length === 0, issues };
  }
}
```

---

#### Task 5.2: Value Extraction (2 days)

**Implementation:**

```typescript
private extractValues(resource: any, path: string): any[] {
  // Navigate resource using path (FHIRPath-like)
  // Handle arrays
  // Handle nested objects
}
```

---

#### Task 5.3: Validator Tests (2 days)

**Test Cases:**

- Valid resources pass validation
- Invalid cardinality fails
- Invalid types fail
- Missing required elements fail

---

### Phase 5 Deliverables

- [ ] `fhir-validator` module
- [ ] Structural validation
- [ ] Test suite
- [ ] Clear error messages

### Phase 5 Success Criteria ✅

- [ ] Validate FHIR base resources
- [ ] Validate custom profiles
- [ ] Clear validation error messages
- [ ] All tests passing

---

## Phase 6: Integration and Testing (Week 8)

**Duration:** 5-7 days  
**Complexity:** Medium  
**Risk:** Low

### Objectives

1. End-to-end integration tests
2. Performance benchmarks
3. Documentation finalization

### Tasks

#### Task 6.1: End-to-End Tests (2 days)

**Test Flow:**

```
Load StructureDefinition
  ↓
Generate Snapshot
  ↓
Validate Resource Instance
  ↓
Assert Results
```

---

#### Task 6.2: Performance Benchmarks (1 day)

**Metrics:**

- Snapshot generation time (per profile)
- Validation time (per resource)
- Memory usage

**Targets:**

- Snapshot generation: < 5 seconds per profile
- Validation: < 100ms per resource

---

#### Task 6.3: Documentation (2 days)

**Documents to Create:**

- API documentation (TypeDoc)
- Usage examples
- Troubleshooting guide

---

#### Task 6.4: Stage-1 Completion Review (1 day)

**Checklist:**

- [ ] All modules implemented
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] Code review completed

---

### Phase 6 Deliverables

- [ ] Integration test suite
- [ ] Performance benchmarks
- [ ] Complete documentation
- [ ] Stage-1 completion report

### Phase 6 Success Criteria ✅

- [ ] All Stage-1 objectives met
- [ ] HAPI semantic equivalence validated
- [ ] Documentation freeze
- [ ] Ready for Stage-2

---

## Risk Management

### High-Risk Areas

1. **Snapshot Generation Algorithm** (Phase 4)
   - **Mitigation:** Allocate extra time, reference HAPI closely, create extensive tests

2. **Semantic Differences from HAPI**
   - **Mitigation:** HAPI reference test suite, document all differences

3. **Edge Cases in Slicing**
   - **Mitigation:** Study HAPI's slicing logic deeply, test all discriminator types

### Contingency Plans

- **If Phase 4 takes longer:** Extend timeline, do not compromise correctness
- **If HAPI tests fail:** Document differences, create ADR for intentional divergences
- **If performance is poor:** Defer optimization to Stage-2, focus on correctness first

---

## Success Metrics

### Quantitative

- [ ] 100% of planned modules implemented
- [ ] 95%+ HAPI reference test pass rate
- [ ] 200+ unit tests passing
- [ ] 20+ integration tests passing
- [ ] < 5 seconds snapshot generation per profile
- [ ] < 100ms validation per resource

### Qualitative

- [ ] Team understands HAPI algorithms
- [ ] Code is maintainable and well-documented
- [ ] Architecture aligns with ARCHITECTURE.md
- [ ] Stage-1 boundaries respected (no scope creep)

---

## Next Steps After Stage-1

Once Stage-1 is complete:

1. **Stage-1 Freeze:** No new features, only bug fixes
2. **Documentation Freeze:** Update all docs to reflect final implementation
3. **ADR Review:** Document any architectural decisions made during implementation
4. **Stage-2 Planning:** Begin planning Canonical Dataflow Model

---

**This roadmap is a living document. Update as needed, but always document changes.**
