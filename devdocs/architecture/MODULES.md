# MODULES (Enforceable)

## Status

**Status:** Active
**Version:** v1.0
**Scope:** This document defines **all first-class modules** of the system, their responsibilities, and their allowed dependency relationships.

Any new module **MUST** conform to this document. Violations require a documented ADR.

---

## 1. Module Classification

All modules **MUST** belong to exactly one of the following layers:

1. **Core FHIR Layer** – FHIR semantics and algorithms
2. **Infrastructure Layer** – persistence and low-level technical concerns
3. **Platform Layer** – multi-tenant, auth, governance, and system services
4. **Application Layer** – clinical and operational applications
5. **Integration Layer** – external systems and adapters

Cross-layer dependencies are **strictly regulated**.

---

## 2. Core FHIR Layer (Mandatory, Stable)

### 2.1 Responsibility

The Core FHIR Layer defines the **semantic engine** of the platform.

It is responsible for:

- Parsing FHIR resources and definitions
- Validation against FHIR core + custom profiles
- Search semantics and evaluation
- Reference resolution
- Transaction and bundle execution
- Versioning and history rules

This layer is **conceptually inspired by HAPI FHIR**, but implemented independently.

---

### 2.2 Modules

#### `fhir-model`

**Responsibilities:**

- Define FHIR primitive types (string, uri, code, integer, boolean, decimal, etc.)
- Define canonical StructureDefinition model (as per FHIR R4 specification)
- Define canonical ElementDefinition model
- **Define internal canonical semantic model:**
  - `CanonicalProfile` (resolved, flattened semantic view)
  - `CanonicalElement` (merged constraints from inheritance chain)
  - `TypeConstraint`, `BindingConstraint`, `Invariant`
- Own element path normalization rules (base path, sliced path, choice types)
- Own cardinality and type compatibility rules

**Canonical vs Runtime Models:**

- **Canonical Model**: Semantic truth derived from StructureDefinition (e.g., `CanonicalProfile`)
- **Runtime Model**: Instance data representation (e.g., `Patient` resource instance)
- This module defines BOTH, but keeps them strictly separated

**Stability:**

- Extremely high

**Must NOT:**

- Contain parsing logic (belongs to `fhir-parser`)
- Contain validation logic (belongs to `fhir-validator`)
- Contain snapshot generation logic (belongs to `fhir-profile`)
- Depend on infrastructure or platform layers

---

#### `fhir-parser`

**Responsibilities:**

- Parse FHIR JSON/XML into `fhir-model` types
- Normalize primitive values (trim whitespace, validate format)
- Handle FHIR-specific JSON conventions (resourceType, meta, etc.)
- Convert external StructureDefinition JSON into `CanonicalStructureDefinition`

**Depends on:**

- `fhir-model` (for type definitions)

**Must NOT:**

- Interpret StructureDefinition semantics (belongs to `fhir-profile`)
- Generate snapshots (belongs to `fhir-profile`)
- Resolve profile inheritance (belongs to `fhir-context`)
- Access database
- Contain business logic

---

#### `fhir-profile` ⭐

**Responsibilities:**

- **Snapshot generation from differential** (HAPI core algorithm: `ProfileUtilities.generateSnapshot()`)
- **Profile inheritance chain resolution**
- **ElementDefinition constraint merging** (cardinality, type, binding)
- **Slicing definition processing** (discriminators, slicing rules)
- Type specialization and constraint intersection
- Cardinality tightening rules enforcement

**Core Algorithm (HAPI-inspired):**

```
Input: StructureDefinition with differential
Output: StructureDefinition with complete snapshot

Steps:
1. Load base StructureDefinition (recursive if needed)
2. Initialize snapshot from base.snapshot (clone all elements)
3. Apply differential.element (merge constraints element by element)
4. Validate merged snapshot (min <= max, type compatibility)
5. Sort elements by path
```

**Depends on:**

- `fhir-model` (for canonical types)
- `fhir-parser` (to load StructureDefinitions)
- `fhir-context` (to resolve base profiles)

**Stability:**

- Very High (this is the heart of FHIR semantic understanding)

**Must NOT:**

- Perform runtime validation (belongs to `fhir-validator`)
- Access database
- Modify StructureDefinitions after snapshot generation

**Note:** This module implements the most complex algorithm in Stage-1. It is conceptually equivalent to HAPI's `org.hl7.fhir.r4.conformance.ProfileUtilities`.

---

#### `fhir-validator`

**Responsibilities:**

- Structural validation against profiles
- Cardinality enforcement (min/max)
- Type constraint checking
- Required element presence validation
- Terminology binding hooks (metadata only, no expansion)

**Depends on:**

- `fhir-model`
- `fhir-parser`
- `fhir-profile` (to access resolved snapshots)
- `fhir-context` (to load profiles)

**Must NOT:**

- Evaluate FHIRPath constraints (deferred to Stage-3)
- Perform terminology expansion (deferred to Infrastructure Layer)
- Validate reference targets at runtime (deferred to Stage-3)

---

#### `fhir-search`

**Responsibilities:**

- Interpret FHIR SearchParameters
- Build abstract query plans

**Must NOT:**

- Execute SQL
- Assume any specific database

---

#### `fhir-reference`

**Responsibilities:**

- Resolve logical references
- Enforce reference integrity rules

---

#### `fhir-transaction`

**Responsibilities:**

- Execute Bundle transactions
- Enforce atomicity and ordering

---

#### `fhir-history`

**Responsibilities:**

- Manage resource versioning
- Support \_history interactions

---

#### `fhir-context` ⭐

**Responsibilities:**

- **StructureDefinition registry and lifecycle management**
- **Canonical URL → StructureDefinition resolution** (with version support)
- **Circular dependency detection** (prevent infinite recursion in inheritance chains)
- **Snapshot caching and invalidation**
- **Base definition preloading** (Patient, Observation, DomainResource, Resource, etc.)
- Profile inheritance chain resolution

**Loading Strategies:**

- **Lazy loading**: Load StructureDefinition on first access
- **Eager loading**: Preload core FHIR base resources at initialization
- **Version-aware loading**: Support `url|version` format for versioned profiles

**Core Operations:**

```typescript
// Load StructureDefinition by canonical URL
loadStructureDefinition(url: string): Promise<StructureDefinition>

// Get StructureDefinition from registry (synchronous, no loading)
getStructureDefinition(url: string): StructureDefinition | undefined

// Check if StructureDefinition is loaded
hasStructureDefinition(url: string): boolean

// Resolve inheritance chain
resolveInheritanceChain(url: string): Promise<string[]>

// Register StructureDefinition (for Phase 4 to cache snapshots)
registerStructureDefinition(sd: StructureDefinition): void
```

**Depends on:**

- `fhir-model` (for canonical types)
- `fhir-parser` (to parse loaded definitions)

**Stability:**

- High (central coordination point for all FHIR definitions)

**Must NOT:**

- Modify StructureDefinitions after loading and caching
- Generate snapshots (belongs to `fhir-profile`)
- Perform validation (belongs to `fhir-validator`)
- Access database directly (use loaders/adapters)

**Note:** This module is conceptually equivalent to HAPI's `FhirContext` and `IValidationSupport`.

---

## 3. Infrastructure Layer (Replaceable)

### 3.1 Responsibility

Provides **technical implementations** for persistence and indexing.

This layer has **no FHIR semantics of its own**.

---

### 3.2 Modules

#### `storage-postgres`

**Responsibilities:**

- Persist resources using PostgreSQL + JSONB
- Manage transactions

**Depends on:**

- Database drivers only

---

#### `index-engine`

**Responsibilities:**

- Create and maintain search indexes
- Translate abstract query plans into SQL

**Depends on:**

- `fhir-search`
- `storage-postgres`

---

## 4. Platform Layer (Governance)

### 4.1 Responsibility

The Platform Layer governs **who can do what, where, and under which tenant**.

---

### 4.2 Modules

#### `tenant-service`

**Responsibilities:**

- Tenant lifecycle management
- Tenant isolation policies

---

#### `auth-service`

**Responsibilities:**

- Authentication (OIDC/JWT)
- Identity resolution

---

#### `rbac-service`

**Responsibilities:**

- Role and permission evaluation
- Resource-level access control

---

#### `audit-service`

**Responsibilities:**

- AuditEvent generation
- Compliance logging

---

#### `workflow-engine`

**Responsibilities:**

- Workflow orchestration
- Task and approval flows

**Must NOT:**

- Embed clinical decision logic
- Bypass Core FHIR validation

---

## 5. Application Layer (Evolvable)

### 5.1 Responsibility

Application modules implement **Chinese medical workflows**, using but never modifying lower layers.

---

### 5.2 Modules

#### `app-emr`

- Electronic Medical Record management

#### `app-opd`

- Outpatient workflows

#### `app-lis`

- Laboratory management

#### `app-ris`

- Imaging and examination management

#### `app-prescription`

- Prescription and approval flows

---

## 6. Integration Layer (Adapters)

### Responsibility

Isolate all external system interactions.

Integration modules MUST NOT expose domain abstractions upstream.

---

### Modules

#### `adapter-his`

- Legacy HIS integration

#### `adapter-insurance-cn`

- Chinese insurance systems

---

## 7. Dependency Rules (Enforced)

- Core FHIR Layer **MUST NOT** depend on any other layer
- Infrastructure Layer **MAY** depend on public interfaces of Core FHIR
- Infrastructure Layer **MUST NOT** import internal symbols of Core FHIR
- Platform Layer **MAY** depend on Core + Infrastructure
- Application Layer **MAY** depend on all lower layers
- Integration Layer **MUST NOT** be depended upon

Violations require an ADR.

---

## 8. Module Lifecycle Rules

- Core FHIR modules are **high-stability**
- Platform modules are **medium-stability**
- Application modules are **low-stability**

Breaking changes must follow semantic versioning.

---

## 9. Extension Policy

- New FHIR behavior → Core FHIR Layer
- New governance rules → Platform Layer
- New medical workflows → Application Layer
- New external systems → Integration Layer

---

## 10. Stage-1 Module Allowlist (Enforced)

During Stage-1 development, only the following Core FHIR modules are permitted:

### Allowed Modules (Stage-1)

- fhir-model
- fhir-parser
- fhir-validator (StructureDefinition only)
- fhir-profile
- fhir-context

### Conditionally Allowed (Read-only / Test-only)

- terminology-assets (external, read-only)

### Explicitly Forbidden in Stage-1

- fhir-search
- fhir-reference (runtime resolution)
- fhir-transaction
- fhir-history
- index-engine
- storage-postgres
- any Platform / Application / Integration modules

Implementation of forbidden modules during Stage-1 is a violation.

---

**This document is enforceable.**
