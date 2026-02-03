# GLOSSARY (Authoritative)

## Status

**Status:** Active  
**Version:** v1.0  
**Scope:** This document defines all **critical technical terms** used across the MedXAI project.

When terms conflict with external sources, **this document takes precedence** within the project scope.

---

## Core FHIR Concepts

### Canonical

**Definition:** The authoritative, resolved, and flattened semantic representation of a FHIR definition, independent of its serialization format or storage representation.

**Example:** A `CanonicalProfile` is the fully resolved snapshot of a StructureDefinition, with all inheritance and constraints merged.

**Contrast with:** Runtime representation (instance data), Differential representation (authoring format).

---

### Snapshot

**Definition:** A complete, flattened list of all `ElementDefinition` entries for a `StructureDefinition`, with all constraints from the inheritance chain fully resolved and merged.

**Purpose:** The snapshot is the **semantic truth** for validation and interpretation. It eliminates the need for runtime inheritance lookups.

**Generation:** Produced by the Snapshot Generation Algorithm (see Stage-1 §4.3).

**Contrast with:** Differential (compact authoring format).

---

### Differential

**Definition:** A compact representation of a `StructureDefinition` that contains **only the constraints that differ** from the base profile.

**Purpose:** Authoring convenience. Profiles are typically written as differentials to avoid repeating base constraints.

**Limitation:** Differentials **MUST NOT** be used directly for semantic interpretation. They must first be expanded into a snapshot.

**Example:**
```json
{
  "differential": {
    "element": [
      {
        "path": "Patient.identifier",
        "min": 1  // Tightens base constraint (was 0)
      }
    ]
  }
}
```

---

### Profile

**Definition:** A `StructureDefinition` that constrains a base FHIR resource or data type by adding additional rules (cardinality, type restrictions, bindings, etc.).

**Types:**
- **Base Profile:** FHIR core resources (e.g., `Patient`, `Observation`)
- **Derived Profile:** Custom constraints on base profiles (e.g., `ChinesePatient`)

**Inheritance:** Profiles form an inheritance chain via `baseDefinition`.

---

### ElementDefinition

**Definition:** A single element in a FHIR resource's structure, defining its path, cardinality, type, binding, and constraints.

**Example:**
```json
{
  "path": "Patient.identifier.system",
  "min": 0,
  "max": "1",
  "type": [{ "code": "uri" }]
}
```

**Key Properties:**
- `path`: Dot-separated element path (e.g., `Patient.name.family`)
- `min`/`max`: Cardinality constraints
- `type`: Allowed FHIR types
- `binding`: Terminology binding (if applicable)

---

### Slicing

**Definition:** A mechanism to subdivide a repeating element into **named subsets** (slices), each with distinct constraints.

**Purpose:** Allow different constraints for different uses of the same element.

**Example:** `Patient.identifier` sliced into `:nationalId` and `:medicalRecordNumber`.

**Discriminator:** The rule used to distinguish slices (e.g., by `system` value).

**Slicing Rules:**
- `closed`: Only defined slices allowed
- `open`: Additional unsliced elements allowed
- `openAtEnd`: Unsliced elements must come after sliced ones

---

### Choice Type

**Definition:** An element that can have multiple possible types, denoted by `[x]` suffix in the path.

**Example:** `Observation.value[x]` can be `valueString`, `valueQuantity`, `valueBoolean`, etc.

**Path Normalization:** `value[x]` → `valueString`, `valueQuantity` (capitalize first letter of type).

---

### Cardinality

**Definition:** The minimum and maximum number of times an element can appear.

**Format:** `min..max` (e.g., `0..1`, `1..*`, `0..*`)

**Constraint Rules:**
- Child profiles MUST tighten cardinality: `child.min >= parent.min`, `child.max <= parent.max`
- Violation is a semantic error

**Special Values:**
- `0..1`: Optional, single value
- `1..1`: Required, single value
- `0..*`: Optional, array
- `1..*`: Required, array (at least one)

---

### Binding

**Definition:** A constraint that limits the allowed values of a coded element to a specific `ValueSet`.

**Binding Strength:**
- `required`: Value MUST come from ValueSet (no exceptions)
- `extensible`: Value SHOULD come from ValueSet (local codes allowed if necessary)
- `preferred`: Value MAY come from ValueSet (guidance only)
- `example`: Example values, no enforcement

**Inheritance Rule:** Child bindings MUST be at least as strict as parent bindings.

---

### FHIRPath

**Definition:** A path-based query language for navigating and extracting values from FHIR resources.

**Purpose:** Used in constraints (`constraint.expression`) and search parameters.

**Stage-1 Limitation:** Parse and store FHIRPath expressions, but do NOT evaluate them (deferred to Stage-3).

**Example:** `Patient.name.family.exists()` (checks if family name is present).

---

## MedXAI-Specific Concepts

### Canonical Model

**Definition:** The internal, language-agnostic semantic representation of FHIR definitions used by MedXAI.

**Purpose:** Decouple FHIR semantics from:
- Serialization format (JSON/XML)
- Storage representation (database schema)
- Runtime representation (instance objects)

**Key Types:** `CanonicalProfile`, `CanonicalElement`, `TypeConstraint`, `BindingConstraint`.

---

### Runtime Model

**Definition:** The in-memory representation of FHIR resource **instances** (e.g., a specific `Patient` resource).

**Contrast with:** Canonical Model (definitions/schemas), not instances.

**Example:** A `Patient` object with `id="123"`, `name=[{family: "Zhang"}]`.

---

### Semantic Layer

**Definition:** The sublayer of the Core FHIR Engine responsible for interpreting FHIR definitions (StructureDefinition) into canonical semantics.

**Key Responsibilities:**
- Snapshot generation
- Profile inheritance resolution
- ElementDefinition constraint merging

**Key Modules:** `fhir-model`, `fhir-profile`, `fhir-context`.

**Rules:** MUST be deterministic, MUST NOT access external resources.

---

### Validation Layer

**Definition:** The sublayer of the Core FHIR Engine responsible for validating resource instances against profiles.

**Key Responsibilities:**
- Cardinality enforcement
- Type checking
- Required element presence validation

**Key Modules:** `fhir-validator`.

**Depends on:** Semantic Layer (uses resolved snapshots).

---

### Runtime Layer

**Definition:** The sublayer of the Core FHIR Engine responsible for runtime operations (parsing, reference resolution, transactions).

**Key Responsibilities:**
- FHIR JSON/XML parsing
- Reference resolution
- Transaction bundle execution

**Key Modules:** `fhir-parser`, `fhir-search`, `fhir-reference`, `fhir-transaction`.

**Depends on:** Semantic Layer and Validation Layer.

---

### Stage

**Definition:** A development phase with a specific, bounded scope and explicit deliverables.

**Purpose:** Organize development to reduce uncertainty progressively.

**Stages:**
- **Stage-1:** Canonical FHIR Model (semantic understanding)
- **Stage-2:** Canonical Dataflow Model (search, indexing)
- **Stage-3:** Runtime & Validation Engine (execution)
- **Stage-4:** Application Integration (workflows)

**Rules:** Later stages MUST NOT begin until earlier stages are complete and documented.

---

### Snapshot Generation Algorithm

**Definition:** The algorithm that transforms a `StructureDefinition` with only `differential` into a complete `snapshot` by merging constraints from the inheritance chain.

**Reference:** HAPI `ProfileUtilities.generateSnapshot()`.

**Steps:**
1. Load base StructureDefinition
2. Initialize snapshot from base.snapshot
3. Apply differential (merge constraints)
4. Validate consistency
5. Sort elements by path

**Complexity:** This is the most complex algorithm in Stage-1.

---

## HAPI FHIR References

### HAPI

**Definition:** HAPI FHIR is a Java-based open-source FHIR server and library, widely used in production healthcare systems.

**Relevance to MedXAI:** MedXAI is **conceptually inspired** by HAPI's architecture and algorithms, but implemented independently in TypeScript.

**Key HAPI Components Referenced:**
- `ProfileUtilities.generateSnapshot()` → MedXAI `fhir-profile` module
- `FhirContext` → MedXAI `fhir-context` module
- `IValidationSupport` → MedXAI validation infrastructure

---

### ProfileUtilities

**Definition:** A HAPI class responsible for snapshot generation and profile manipulation.

**Key Method:** `generateSnapshot(StructureDefinition base, StructureDefinition derived)`

**MedXAI Equivalent:** `fhir-profile` module, Snapshot Generation Algorithm (Stage-1 §4.3).

---

## Terminology

### ValueSet

**Definition:** A set of coded values (codes from one or more CodeSystems) used for a specific purpose.

**Purpose:** Define allowed values for coded elements (e.g., valid gender codes).

**Stage-1 Limitation:** Interpret metadata only, do NOT expand ValueSets (deferred to Infrastructure Layer).

---

### CodeSystem

**Definition:** A collection of codes with defined meanings (e.g., LOINC, SNOMED CT).

**Purpose:** Provide the vocabulary for coded elements.

**Stage-1 Limitation:** Read-only interpretation, no code validation.

---

## Architectural Terms

### Core FHIR Layer

**Definition:** The layer responsible for FHIR semantics and algorithms, independent of infrastructure.

**Sublayers:** Semantic Layer, Validation Layer, Runtime Layer.

**Stability:** Very High (breaking changes require major version bump).

---

### Infrastructure Layer

**Definition:** The layer responsible for technical implementations (persistence, indexing, caching).

**Key Modules:** `storage-postgres`, `index-engine`.

**Stability:** Medium (replaceable implementations).

**Rule:** MUST NOT contain FHIR semantics.

---

### Platform Layer

**Definition:** The layer responsible for governance (multi-tenancy, auth, RBAC, audit).

**Key Modules:** `tenant-service`, `auth-service`, `rbac-service`, `audit-service`.

**Stability:** Medium.

---

### Application Layer

**Definition:** The layer responsible for clinical and operational workflows (EMR, OPD, LIS, RIS).

**Key Modules:** `app-emr`, `app-opd`, `app-lis`, `app-ris`.

**Stability:** Low (high evolvability).

---

### Integration Layer

**Definition:** The layer responsible for external system adapters (HIS, insurance systems).

**Key Modules:** `adapter-his`, `adapter-insurance-cn`.

**Rule:** MUST NOT be depended upon by other layers.

---

## Development Terms

### ADR (Architecture Decision Record)

**Definition:** A document recording a significant architectural decision, its context, and rationale.

**Format:** `ADR-NNN-Title.md` (e.g., `ADR-001-HAPI-Inspired-Architecture.md`).

**Purpose:** Make long-term decisions explicit and traceable.

---

### SOP (Standard Operating Procedure)

**Definition:** A documented process for executing a specific development activity.

**Purpose:** Reduce variability and ensure consistency.

**Examples:** SOP for starting new work, SOP for AI-assisted development.

---

### Deterministic

**Definition:** A system or algorithm that produces the same output for the same input, every time.

**Importance:** Critical for Stage-1 (Canonical FHIR Model) to ensure reproducibility.

---

### Idempotent

**Definition:** An operation that produces the same result when executed multiple times.

**Example:** Snapshot generation is idempotent (generating twice yields the same snapshot).

---

## Abbreviations

| Abbreviation | Full Term | Definition |
|--------------|-----------|------------|
| **FHIR** | Fast Healthcare Interoperability Resources | HL7 standard for healthcare data exchange |
| **HL7** | Health Level 7 | Healthcare standards organization |
| **HAPI** | HL7 API | Java-based FHIR implementation library |
| **ADR** | Architecture Decision Record | Document recording architectural decisions |
| **SOP** | Standard Operating Procedure | Documented process for development activities |
| **EMR** | Electronic Medical Record | Patient medical record system |
| **OPD** | Outpatient Department | Outpatient workflow management |
| **LIS** | Laboratory Information System | Lab test management |
| **RIS** | Radiology Information System | Imaging and examination management |
| **HIS** | Hospital Information System | Legacy hospital management system |
| **RBAC** | Role-Based Access Control | Permission management system |
| **CRUD** | Create, Read, Update, Delete | Basic data operations |
| **JSON** | JavaScript Object Notation | Data serialization format |
| **XML** | Extensible Markup Language | Data serialization format |
| **URI** | Uniform Resource Identifier | Unique identifier format |
| **URL** | Uniform Resource Locator | Web address format |

---

## Cross-References

- **ARCHITECTURE.md**: System layering and responsibilities
- **MODULES.md**: Module definitions and dependencies
- **DATAFLOW.md**: Data flow patterns
- **Stage-1-Canonical-FHIR-Model.md**: Canonical semantics details
- **CODING-CONVENTIONS.md**: Naming conventions and code style

---

**This document is authoritative for term definitions within the MedXAI project.**
