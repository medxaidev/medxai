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

- Canonical identity (`url`, `version`, `kind`, `type`)
- Element tree (resolved from snapshot or differential)
- Cardinality rules (`min`, `max`)
- Type constraints (`type.code`, profiles, targetProfiles)
- Value bindings (`ValueSet`, strength)
- Invariants and constraints

No assumptions are made about:

- Storage layout
- Serialization format
- UI representation

---

## 5. ElementDefinition Semantics

Each `ElementDefinition` is interpreted as an **independent semantic contract**, including:

- Absolute canonical path (e.g. `Patient.identifier.value`)
- Cardinality contract
- Type allowance and specialization
- Binding requirements
- Constraint expressions

Inheritance, slicing, and differential overlays **MUST** be resolved into a canonical, flattened semantic view.

---

## 6. Outputs of Stage-1

Stage-1 produces the following conceptual outputs:

- A canonical semantic graph of FHIR definitions
- A fully resolved element tree per resource
- Explicit, machine-readable semantic constraints

These outputs are **read-only contracts** for later stages.

---

## 7. Downstream Dependencies

The following stages explicitly depend on Stage-1:

- **Stage-2:** Canonical Dataflow Model
- **Stage-3:** Runtime & Validation Engine
- **Stage-4:** Application Integration

Any inconsistency between downstream behavior and Stage-1 semantics is considered a **system defect**.

---

## 8. Enforcement

All modules, pipelines, and engines **MUST** reference Stage-1 semantics as the authoritative definition of FHIR meaning.

Violations include:

- Hard-coded assumptions not present in canonical definitions
- Dataflow rules that bypass semantic constraints
- Runtime behavior that contradicts resolved canonical meaning

---

## 9. Summary

Stage-1 defines _what FHIR means_ in this system.

Everything else defines _what the system does_ with that meaning.
