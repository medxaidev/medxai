# Stage-1: Canonical FHIR Semantics (Enforced)

> **Status:** Enforced
>
> This stage defines the _formal, canonical interpretation_ of FHIR resources. All subsequent stages (Dataflow, Runtime, Validation, Codegen) **MUST** depend on and comply with the definitions in this document.

---

## 1. Stage Objective

Stage-1 establishes the system’s ability to **understand FHIR definitions correctly and deterministically**, independent of persistence, querying, runtime execution, or application-level semantics.

The goal is to build a **stable, language-agnostic canonical semantics layer** derived directly from the official FHIR specification. This layer serves as the authoritative source of truth for how FHIR resources _mean_, not how they are stored or executed.

---

## 2. Scope

This stage focuses exclusively on **FHIR Canonical Resources**, including but not limited to:

- `StructureDefinition`
- `ElementDefinition`
- `ValueSet`
- `CodeSystem`
- `OperationDefinition` (read-only interpretation)

Out of scope for this stage:

- Persistence models (database schemas)
- Search parameters and indexing
- Runtime execution or validation engines
- Business logic or application workflows

---

## 3. Canonical Semantics Principles

The following principles are **mandatory** for all implementations that claim compliance with Stage-1:

### 3.1 Deterministic Interpretation

Given the same canonical FHIR input, the system **MUST** produce the same interpreted semantic model, regardless of:

- Programming language
- Runtime environment
- Storage backend

### 3.2 Specification-Derived Meaning

All semantics **MUST** be derived from:

- Official FHIR specification fields
- Explicit constraints (`min`, `max`, `type`, `binding`, `constraint`)
- Snapshot and differential resolution rules

No inferred or application-specific meaning is allowed at this stage.

### 3.3 Canonical Before Dataflow

No dataflow, transformation, or runtime behavior may be defined unless it can be expressed _in terms of_ the canonical semantics defined here.

> **Rule:** Dataflow is derived — never invented.

---

## 4. StructureDefinition Semantic Model

At Stage-1, a `StructureDefinition` is interpreted as a **pure semantic schema**, composed of:

### 4.1 Canonical Identity

- `url`: Canonical URL (globally unique identifier)
- `version`: Version string (optional, for versioned profiles)
- `kind`: primitive-type | complex-type | resource | logical
- `type`: Resource type code (e.g., "Patient", "Observation")
- `baseDefinition`: Canonical URL of base profile (for inheritance)
- `derivation`: specialization | constraint

### 4.2 Element Tree (MUST be Snapshot) ⭐

**Critical Rule:** All semantic interpretation MUST operate on **snapshot**, not differential.

**Snapshot Generation Requirements:**

1. **If StructureDefinition contains only `differential`:**
   - **MUST generate snapshot** using the canonical algorithm (see §4.3)
   - MUST NOT interpret differential directly
   - This is the PRIMARY use case for custom profiles

2. **If StructureDefinition contains both `snapshot` and `differential`:**
   - Prefer snapshot for semantic interpretation
   - MAY validate snapshot consistency (optional)

3. **If StructureDefinition contains only `snapshot`:**
   - Use snapshot directly
   - This is typical for FHIR base resources

**Rationale:** Differential is a compact representation for authoring. Snapshot is the semantic truth for interpretation.

### 4.3 Snapshot Generation Algorithm (Mandatory) ⭐

Stage-1 MUST implement the following algorithm (inspired by HAPI `ProfileUtilities.generateSnapshot()`):

```
Input: StructureDefinition SD with differential
Output: Complete snapshot

Algorithm:
1. Load base StructureDefinition (SD.baseDefinition)
   - Recursively ensure base has snapshot
   - Detect circular dependencies (throw error if found)

2. Initialize snapshot = clone(base.snapshot.element)
   - Deep copy all ElementDefinitions from base

3. For each element E in SD.differential.element:
   a. Find matching element B in snapshot by path
   b. If B exists (constraint on existing element):
      - Merge cardinality:
        * min = max(B.min, E.min)
        * max = min(B.max, E.max)
      - Merge types:
        * intersection(B.type, E.type)
      - Merge binding:
        * stricter(B.binding, E.binding)
      - Accumulate constraints:
        * B.constraint + E.constraint
   c. If B does not exist (new slice or extension):
      - Insert E into snapshot at correct position
      - Apply slicing rules

4. Validate snapshot consistency:
   - min <= max for all elements
   - Types are compatible with base
   - Required elements exist

5. Sort elements by path (lexicographic order)

6. Return snapshot
```

**Implementation Note:** This is the **most complex algorithm in Stage-1**.

**Reference:** HAPI `org.hl7.fhir.r4.conformance.ProfileUtilities.generateSnapshot()`

### 4.4 Cardinality Rules

- `min`: Non-negative integer (0, 1, 2, ...)
- `max`: Non-negative integer or "\*" (unbounded)
- **Constraint inheritance**: child.min >= parent.min, child.max <= parent.max
- Violation is a semantic error

### 4.5 Type Constraints

- `type.code`: FHIR type code (string, Reference, BackboneElement, etc.)
- `type.profile`: Constraining profile URLs
- `type.targetProfile`: For Reference types, allowed target resource types
- **Type specialization**: child types MUST be subtypes of parent types

### 4.6 Value Bindings

- `binding.strength`: required | extensible | preferred | example
- `binding.valueSet`: Canonical URL of ValueSet
- **Binding strength rules**: child binding MUST be >= parent binding strength
- **Stage-1 limitation**: Only interpret binding metadata, do NOT expand ValueSets

### 4.7 Invariants and Constraints

- `constraint.key`: Unique identifier
- `constraint.severity`: error | warning
- `constraint.human`: Human-readable description
- `constraint.expression`: FHIRPath expression
- **Stage-1 limitation**: Parse and store constraints, do NOT evaluate FHIRPath

No assumptions are made about:

- Storage layout
- Serialization format
- UI representation

---

## 5. ElementDefinition Semantics

Each `ElementDefinition` is interpreted as an **independent semantic contract**.

### 5.1 Element Path (Critical) ⭐

**Path Format Rules:**

1. **Base path**: `ResourceType.element.subelement`
   - Example: `Patient.identifier.system`
   - Dot (`.`) separates path segments

2. **Sliced path**: `ResourceType.element:sliceName.subelement`
   - Example: `Patient.identifier:nationalId.system`
   - Colon (`:`) separates base path from slice name
   - Slice names MUST be unique within the same base path

3. **Choice type path**: `ResourceType.element[x]`
   - Example: `Patient.deceased[x]`
   - Bracket notation indicates polymorphic type
   - Concrete types: `Patient.deceasedBoolean`, `Patient.deceasedDateTime`

**Path Normalization Requirements:**

- Paths MUST be case-sensitive
- Paths MUST use dot (`.`) as separator
- Slice names MUST follow FHIR naming rules
- Choice type expansions MUST follow FHIR naming conventions (capitalize first letter of type)

### 5.2 Cardinality Contract

**Semantic Meaning:**

- `min=0, max=1`: Optional, single value
- `min=1, max=1`: Required, single value
- `min=0, max=*`: Optional, array (zero or more)
- `min=1, max=*`: Required, array (at least one)
- `min=N, max=M`: Exactly N to M occurrences

**Inheritance Rules:**

- Child `min` MUST be >= parent `min`
- Child `max` MUST be <= parent `max`
- Violation is a **semantic error**

### 5.3 Type Allowance and Specialization

**Type Hierarchy (simplified):**

```
Element (abstract base)
  ├─ BackboneElement (for nested structures)
  ├─ Primitive types (string, integer, boolean, ...)
  ├─ Complex types (Identifier, CodeableConcept, ...)
  └─ Resource types (Patient, Observation, ...)
```

**Type Constraint Rules:**

1. **Type restriction**: Parent allows [A, B, C] → Child allows [A, B] ✅
2. **Type expansion**: Parent allows [A] → Child allows [A, B] ❌ (forbidden)
3. **Profile constraint**: Parent allows Reference(Any) → Child allows Reference(Patient) ✅

### 5.4 Slicing Semantics ⭐

**Slicing Definition:**

A slice is a **named subset** of a repeating element, distinguished by discriminator rules.

**Example:**

```json
{
  "path": "Patient.identifier",
  "slicing": {
    "discriminator": [
      {
        "type": "value",
        "path": "system"
      }
    ],
    "rules": "open"
  }
}
```

**Slicing Rules:**

- `rules=closed`: Only defined slices allowed, no additional elements
- `rules=open`: Additional unsliced elements allowed
- `rules=openAtEnd`: Unsliced elements must come after sliced ones

**Discriminator Types (Stage-1 Support):**

- `value`: Discriminate by element value
- `pattern`: Discriminate by pattern matching
- `type`: Discriminate by type
- `profile`: Discriminate by profile conformance
- **Stage-1 limitation**: Parse discriminators, do NOT enforce during validation (deferred to Stage-3)

### 5.5 Binding Requirements

**Binding Strength Semantics:**

- `required`: Value MUST come from ValueSet (no exceptions)
- `extensible`: Value SHOULD come from ValueSet (local codes allowed if necessary)
- `preferred`: Value MAY come from ValueSet (guidance only)
- `example`: Example values, no enforcement

**Stage-1 Interpretation:**

- Store binding metadata
- Do NOT expand ValueSets
- Do NOT validate code membership
- Defer to Stage-3 for terminology validation

### 5.6 Constraint Expressions

**FHIRPath Constraints:**

- Stored as `constraint.expression`
- **Stage-1 limitation**: Parse and store, do NOT evaluate
- Evaluation deferred to Stage-3 (Runtime & Validation Engine)

**Invariant Inheritance:**

- Child profiles inherit all parent constraints
- Child profiles MAY add new constraints
- Child profiles MUST NOT remove parent constraints

### 5.7 Canonical Flattening Requirement ⭐

**Critical Rule:** All inheritance, slicing, and differential overlays MUST be resolved into a **canonical, flattened semantic view**.

**Flattened View Properties:**

1. Every element has explicit cardinality (no inheritance lookup needed)
2. Every element has explicit type constraints (fully resolved)
3. Every slice is a distinct element in the tree
4. All constraints are accumulated (parent + child)

**Implementation:** This is achieved by the Snapshot Generation algorithm (§4.3).

---

## 6. Outputs of Stage-1

Stage-1 produces the following **concrete, machine-readable outputs**:

### 6.1 Canonical Profile Registry

**Data Structure:**

```typescript
interface CanonicalProfileRegistry {
  // Key: canonical URL (with optional |version)
  profiles: Map<string, CanonicalProfile>;

  // Inheritance graph for dependency resolution
  inheritanceGraph: Map<string, string[]>; // url → [base urls]
}

interface CanonicalProfile {
  url: string;
  version?: string;
  kind: "primitive-type" | "complex-type" | "resource" | "logical";
  type: string;
  baseProfile?: string;

  // Fully resolved element tree (from snapshot)
  elements: Map<string, CanonicalElement>; // path → element

  // Metadata
  abstract: boolean;
  derivation?: "specialization" | "constraint";
}

interface CanonicalElement {
  path: string;
  id: string;

  // Cardinality (fully resolved, no inheritance lookup needed)
  min: number;
  max: number | "unbounded";

  // Type constraints (fully resolved)
  types: TypeConstraint[];

  // Binding (if applicable)
  binding?: BindingConstraint;

  // Accumulated constraints (parent + child)
  constraints: Invariant[];

  // Slicing metadata (if this is a slicing definition)
  slicing?: SlicingDefinition;
}
```

### 6.2 Validation Artifacts

**For each StructureDefinition:**

- Complete snapshot (generated if needed)
- Validation rules (cardinality, type, binding metadata)
- Constraint expressions (unparsed FHIRPath strings)

### 6.3 TypeScript Type Definitions (Optional)

**Stage-1 MAY generate TypeScript types for developer experience:**

```typescript
// Generated from Patient StructureDefinition
interface Patient extends DomainResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  name?: HumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string; // FHIR date format
  // ... other elements
}
```

**Generation Rules:**

- Optional elements: `?` suffix
- Arrays: `[]` suffix
- Choice types: union types (`boolean | DateTime`)
- Code bindings: literal union types (if ValueSet is small and known)

**Note:** Type generation is NOT semantically required, but improves developer experience.

### 6.4 Read-Only Contract Guarantee

**Critical Rule:** All Stage-1 outputs are **immutable after generation**.

**Enforcement:**

- CanonicalProfile objects SHOULD be frozen (`Object.freeze()`)
- Modifications require regeneration from source StructureDefinition
- Later stages MUST NOT mutate canonical semantics

### 6.5 Persistence Strategy (Out of Scope)

**Stage-1 does NOT define:**

- Database schema for StructureDefinitions
- Caching strategy (in-memory vs persistent)
- Versioning and migration strategies

**Rationale:** These are Infrastructure concerns, not semantic concerns.

These outputs are **read-only contracts** for later stages.

---

## 7. Downstream Dependencies

The following stages explicitly depend on Stage-1:

- **Stage-2:** Canonical Dataflow Model
- **Stage-3:** Runtime & Validation Engine
- **Stage-4:** Application Integration

Any inconsistency between downstream behavior and Stage-1 semantics is considered a **system defect**.

---

## 8. Stage-1 Boundaries and Limitations (Enforced)

### 8.1 What Stage-1 MUST Implement ✅

1. **StructureDefinition parsing** (JSON/XML → canonical model)
2. **Snapshot generation** from differential (HAPI algorithm, §4.3)
3. **Profile inheritance chain resolution**
4. **ElementDefinition constraint merging** (cardinality, type, binding)
5. **Type constraint interpretation** (type hierarchy, specialization rules)
6. **Cardinality rule enforcement** (during snapshot generation)
7. **Binding metadata interpretation** (strength, ValueSet URL)
8. **Slicing definition parsing** (discriminators, rules)
9. **Path normalization** (base path, sliced path, choice types)
10. **Canonical profile registry** (in-memory cache with version support)

### 8.2 What Stage-1 MUST NOT Implement ❌

1. **FHIRPath evaluation** → Deferred to Stage-3
2. **Terminology expansion** (ValueSet `$expand`) → Deferred to Infrastructure Layer
3. **Code validation** (is code in ValueSet?) → Deferred to Stage-3
4. **Reference resolution** (runtime) → Deferred to Stage-3
5. **Search parameter processing** → Deferred to Stage-2
6. **Database persistence** → Deferred to Infrastructure Layer
7. **Transaction semantics** → Deferred to Stage-3
8. **Resource instance CRUD operations** → Deferred to Stage-3

### 8.3 Partial Implementation in Stage-1

**Structural Validation (Allowed in Stage-1):**

- ✅ Cardinality validation (min/max enforcement)
- ✅ Type validation (is value of correct FHIR type?)
- ✅ Required element presence checking
- ❌ FHIRPath constraint evaluation (parse only, do not evaluate)
- ❌ Terminology binding validation (metadata only, no code checking)
- ❌ Reference target validation (no runtime resolution)

**Rationale:** Structural validation uses only snapshot metadata, requiring no external dependencies.

### 8.4 External Dependencies (Read-Only)

**Stage-1 MAY depend on:**

- FHIR base definitions (Patient, Observation, DomainResource, Resource, etc.) as **read-only inputs**
- FHIR terminology assets (ValueSet, CodeSystem) for **metadata only** (no expansion)

**Stage-1 MUST NOT:**

- Modify external definitions
- Assume specific file locations or HTTP URLs
- Hard-code FHIR resource definitions in source code

### 8.5 Performance Considerations (Explicitly Deferred)

**Stage-1 does NOT optimize for:**

- Large-scale StructureDefinition loading
- Snapshot generation performance
- Memory usage optimization

**Rationale:** Correctness first, performance later (Stage-2+).

**Acceptable Stage-1 Performance:**

- Snapshot generation: seconds per profile (not milliseconds)
- Memory: full in-memory caching (no disk-based caching)
- Concurrency: single-threaded processing acceptable

---

## 9. Enforcement

All modules, pipelines, and engines **MUST** reference Stage-1 semantics as the authoritative definition of FHIR meaning.

Violations include:

- Hard-coded assumptions not present in canonical definitions
- Dataflow rules that bypass semantic constraints
- Runtime behavior that contradicts resolved canonical meaning

---

## 9. Summary

Stage-1 defines _what FHIR means_ in this system.

Everything else defines _what the system does_ with that meaning.
