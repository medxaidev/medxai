# DATAFLOW (Enforceable)

## Status

**Status:** Active
**Version:** v1.0
**Scope:** This document defines **authoritative runtime data flows** across modules defined in `MODULES.md`.

Any runtime path **MUST** conform to this document. Deviations require an ADR.

---

## 1. Purpose

This document answers one question only:

> **How does data move through the system at runtime?**

It does **not** define:

- Module responsibilities (see MODULES.md)
- Architectural principles (see ARCHITECTURE.md)

---

## 2. Canonical Runtime Model

All external interactions are normalized into a canonical flow:

```
Request
  → Auth / Tenant Resolution
  → FHIR Validation Gate
  → Core FHIR Semantics
  → Infrastructure Execution
  → Audit / History
  → Response
```

No module may bypass this sequence.

---

## 3. Common Entry Flow (All Requests)

### 3.1 Authentication & Tenant Resolution

**Modules involved:**

- `auth-service`
- `tenant-service`

**Flow:**

1. Authenticate identity
2. Resolve tenant context
3. Attach tenant + identity to request context

**Hard Rules:**

- No Core FHIR module may access auth or tenant state directly
- Tenant context MUST be immutable after resolution

---

### 3.2 Authorization (RBAC)

**Modules involved:**

- `rbac-service`

**Flow:**

1. Evaluate permissions against resource + operation
2. Reject unauthorized requests before FHIR execution

---

## 4. Read / vRead Flow

**Modules involved:**

- `fhir-model`
- `storage-postgres`
- `audit-service`

**Flow:**

1. Resolve resource identity
2. Load canonical representation
3. Return immutable resource snapshot
4. Emit audit event

**Must NOT:**

- Perform validation
- Modify resource state

---

## 5. Search Flow (Critical)

**Modules involved:**

- `fhir-search`
- `index-engine`
- `storage-postgres`

**Flow:**

1. Parse SearchParameters
2. Build abstract query plan (`fhir-search`)
3. Translate plan into executable query (`index-engine`)
4. Execute query (`storage-postgres`)
5. Rehydrate resources

**Hard Rules:**

- `fhir-search` MUST NOT generate SQL
- `index-engine` MUST NOT interpret FHIR semantics

---

## 6. Create / Update Flow

**Modules involved:**

- `fhir-parser`
- `fhir-validator`
- `fhir-reference`
- `fhir-transaction`
- `storage-postgres`
- `audit-service`

**Flow:**

1. Parse incoming resource
2. Validate structure and profiles
3. Resolve references
4. Execute transaction
5. Persist new version
6. Record history and audit

**Hard Rules:**

- Validation MUST precede persistence
- Transactions MUST be atomic

---

## 7. Transaction (Bundle) Flow

**Modules involved:**

- `fhir-transaction`

**Flow:**

1. Parse Bundle
2. Order entries deterministically
3. Execute each entry following Create/Update rules
4. Commit or rollback as a unit

---

## 8. Workflow Interaction Flow

**Modules involved:**

- `workflow-engine`
- Application modules

**Flow:**

1. Application emits workflow event
2. Workflow engine creates Tasks
3. Tasks drive state transitions

**Hard Rules:**

- Workflow MUST NOT mutate resources directly
- All mutations go through Core FHIR flows

---

## 9. Integration Flow

**Modules involved:**

- Integration adapters

**Flow:**

1. External system interaction
2. Map to internal DTO
3. Pass into Core FHIR entry points

**Hard Rules:**

- Integration modules MUST NOT bypass validation
- MUST NOT expose external abstractions upstream

---

## 10. Audit & History Flow

**Modules involved:**

- `audit-service`
- `fhir-history`

**Flow:**

1. Observe state-changing operations
2. Record immutable events

Audit and history MUST be append-only.

---

## 11. Forbidden Flows

The following are explicitly forbidden:

- Application → storage-postgres (direct access)
- Workflow → database writes
- Integration → Core FHIR internals
- Infrastructure → Platform logic

---

## 12. Stability & Evolution

- This document is **high-stability**
- Changes require strong justification
- New flows MUST be added explicitly

---

## Appendix A: Stage-1 Valid Dataflows (Enforced)

During Stage-1, the following dataflows are LEGAL and REQUIRED:

### A.1 StructureDefinition Loading Flow

```
External StructureDefinition (JSON/XML file or HTTP)
  ↓
fhir-parser.parse()
  ↓
CanonicalStructureDefinition (fhir-model type)
  ↓
fhir-context.register(url, structureDefinition)
  ↓
Cached in StructureDefinition Registry
```

**Purpose:** Load FHIR definitions into the system.

---

### A.2 Snapshot Generation Flow ⭐ (HAPI Core Algorithm)

```
StructureDefinition (with differential only)
  ↓
fhir-profile.SnapshotGenerator.generate(sd)
  ↓
Step 1: Load base StructureDefinition
  fhir-context.loadStructureDefinition(sd.baseDefinition)
  ↓
Step 2: Ensure base has snapshot (recursive generation if needed)
  if (!base.snapshot) {
    generate(base)  // Recursive call
  }
  ↓
Step 3: Initialize snapshot from base.snapshot
  snapshot = clone(base.snapshot.element)
  ↓
Step 4: Apply differential.element (element-by-element merge)
  For each diffElement in sd.differential.element:
    a. Find matching baseElement in snapshot by path
    b. If found:
       - Merge cardinality: min = max(base.min, diff.min)
       - Merge cardinality: max = min(base.max, diff.max)
       - Merge types: intersection(base.type, diff.type)
       - Merge binding: stricter(base.binding, diff.binding)
       - Accumulate constraints: base.constraint + diff.constraint
    c. If not found (new slice):
       - Insert diffElement into snapshot
       - Apply slicing rules
  ↓
Step 5: Validate merged snapshot
  - Check min <= max for all elements
  - Check type compatibility with base
  - Check required elements exist
  ↓
Step 6: Sort elements by path (lexicographic order)
  ↓
StructureDefinition (with complete snapshot)
  ↓
Cache snapshot in fhir-context
```

**Purpose:** Generate complete element tree from differential (HAPI's most critical algorithm).

**Reference:** HAPI `org.hl7.fhir.r4.conformance.ProfileUtilities.generateSnapshot()`

---

### A.3 Profile Inheritance Chain Resolution Flow

```
Profile URL (e.g., "http://example.org/ChinesePatient")
  ↓
fhir-context.resolveInheritanceChain(url)
  ↓
Step 1: Load StructureDefinition
  sd = loadStructureDefinition(url)
  ↓
Step 2: Extract baseDefinition URL
  baseUrl = sd.baseDefinition
  ↓
Step 3: Recursively load base (until reaching FHIR base resource)
  chain = [url]
  while (baseUrl) {
    chain.push(baseUrl)
    base = loadStructureDefinition(baseUrl)
    baseUrl = base.baseDefinition
  }
  ↓
Step 4: Detect circular dependencies
  if (chain has duplicates) {
    throw CircularDependencyError
  }
  ↓
Inheritance Chain (ordered list)
Example: ["ChinesePatient", "Patient", "DomainResource", "Resource"]
```

**Purpose:** Resolve profile inheritance for snapshot generation and validation.

---

### A.4 Resource Instance Structural Validation Flow

```
FHIR Resource Instance (JSON)
  ↓
fhir-parser.parse()
  ↓
Runtime Resource Object
  ↓
fhir-validator.validate(resource, profileUrl)
  ↓
Step 1: Load profile snapshot
  snapshot = fhir-context.getSnapshot(profileUrl)
  ↓
Step 2: For each ElementDefinition in snapshot:
  a. Extract values from resource (FHIRPath-like navigation)
     values = extractValues(resource, elementDef.path)
  b. Validate cardinality
     if (values.length < elementDef.min) → ERROR
     if (values.length > elementDef.max) → ERROR
  c. Validate type
     for each value:
       if (!isTypeCompatible(value, elementDef.type)) → ERROR
  d. Validate binding (metadata only)
     if (elementDef.binding) {
       // Store binding info, do NOT expand ValueSet
       // Actual code validation deferred to Stage-3
     }
  ↓
ValidationResult {
  valid: boolean,
  issues: ValidationIssue[]
}
```

**Purpose:** Validate resource instances against profile structure (Stage-1 scope: structure only).

**Limitations:**

- ✅ Cardinality validation
- ✅ Type validation
- ✅ Required element presence
- ❌ FHIRPath constraint evaluation (deferred to Stage-3)
- ❌ Terminology binding validation (deferred to Stage-3)
- ❌ Reference target validation (deferred to Stage-3)

---

### A.5 Canonical Profile Registry Query Flow

```
Query: "Get canonical element definition for Patient.identifier.system"
  ↓
fhir-context.getSnapshot("http://hl7.org/fhir/StructureDefinition/Patient")
  ↓
snapshot.element.find(e => e.path === "Patient.identifier.system")
  ↓
CanonicalElement {
  path: "Patient.identifier.system",
  min: 0,
  max: "1",
  type: [{ code: "uri" }],
  // ... other constraints
}
```

**Purpose:** Provide semantic metadata for downstream stages.

---

### A.6 Forbidden Flows in Stage-1 ❌

The following flows are EXPLICITLY FORBIDDEN during Stage-1:

❌ **Direct database access** (no `storage-postgres` module)
❌ **Search parameter processing** (no `fhir-search` module)
❌ **Reference resolution at runtime** (no `fhir-reference` module)
❌ **Transaction bundle execution** (no `fhir-transaction` module)
❌ **Terminology expansion** (no ValueSet `$expand` operation)
❌ **FHIRPath constraint evaluation** (parse only, do not evaluate)
❌ **Resource instance CRUD operations** (no persistence)

**Rationale:** Stage-1 focuses exclusively on **canonical semantics**, not runtime behavior.

---

**This document is enforceable.**
