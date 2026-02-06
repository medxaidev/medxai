# HAPI FHIR — IValidationSupport Interface Notes (Deliverable)

## Scope and repo note
This document describes the design intent and typical usage patterns of `org.hl7.fhir.common.hapi.validation.support.IValidationSupport` from the **HAPI FHIR** project.

- This interface **does not exist** in the current repository (`org.hl7.fhir.core-master`, HL7 reference implementation).
- In this repository, similar responsibilities are more closely aligned with `IWorkerContext` / `BaseWorkerContext` / `SimpleWorkerContext`.

The goal of this deliverable is to clarify what `IValidationSupport` is responsible for and how it integrates with `FhirContext`, so the same architecture can be re-created (e.g., in a TypeScript implementation).

---

## What it does
`IValidationSupport` is an abstraction layer that provides a validator with the **external knowledge** required to perform FHIR validation.

In practice, a FHIR instance validator needs to resolve and/or execute operations against:

- StructureDefinition (profiles, base definitions, snapshots)
- ValueSet / CodeSystem (terminology and binding validation)
- Other definitional artifacts (depending on validator features)

Instead of hard-coding “where definitions come from” and “how terminology is validated” into the validator itself, HAPI FHIR delegates those responsibilities to an implementation (or a chain of implementations) of `IValidationSupport`.

---

## Multiple sources: file, HTTP, memory (and why chaining is common)
HAPI FHIR deployments commonly need to combine multiple “definition sources”. Typical sources include:

- **Built-in core definitions**: the base R4/R5 artifacts bundled with the runtime.
- **Local custom artifacts**: your own profiles and terminology artifacts loaded from:
  - files
  - classpath resources
  - NPM packages
- **Remote services**:
  - terminology servers (for code validation / ValueSet expansion)
  - HTTP endpoints that host implementation guides or definitional resources
- **Memory caches**:
  - in-memory maps keyed by canonical URL (and sometimes version) to speed up repeated resolution.

Because no single source is sufficient for most real systems, HAPI FHIR commonly uses a *chain/composite* approach: multiple validation supports are combined so resolution falls back from one to the next (e.g., cache -> local package -> remote server).

---

## Study checklist

### 1) What methods must be implemented?
Exact method names can vary slightly by HAPI FHIR version, but the required capabilities are stable. An implementation of `IValidationSupport` typically needs to provide one or more of the following categories of functionality.

#### A. StructureDefinition resolution
- **Responsibility**: resolve a `StructureDefinition` given a canonical URL (or equivalent key).
- **Why the validator needs it**:
  - validate element paths and cardinalities
  - apply differential constraints against base
  - enforce slicing/type rules
  - validate invariants/constraints

#### B. Terminology artifacts and operations
- **Responsibility**:
  - provide `ValueSet` and `CodeSystem` resources
  - support terminology operations such as:
    - validate a code against a ValueSet
    - expand a ValueSet
    - lookup a code in a CodeSystem
- **Why the validator needs it**:
  - evaluate binding strength (required/extensible/preferred/example)
  - perform code system and value set membership checks

#### C. Other definitional artifacts (optional, feature-dependent)
Depending on validator features enabled and runtime behavior, support may also be queried for other resources, such as:

- `SearchParameter`
- `StructureMap`
- `ImplementationGuide`
- `NamingSystem`

#### D. Caching behavior (recommended)
Even if not mandated by the interface, most production implementations rely on caching:

- **Keying**: canonical URL (and sometimes `url|version`)
- **Policy**: prefer newest compatible version, or exact match depending on system needs

> Practical implementation note: it’s common that “cache” is implemented as a wrapper support in front of other supports.

---

### 2) How does it integrate with FhirContext?
In HAPI FHIR, `FhirContext` is the central runtime hub (model metadata, parsers, clients, validator creation).

Conceptual integration flow:

- You create a validator via `FhirContext`.
- The validator is configured with an `IValidationSupport` instance (often a chain).
- During validation, when the validator needs to resolve a profile or perform terminology checks, it delegates to `IValidationSupport`.

Typical runtime call patterns:

- **Profile resolution**
  - Input: profile canonical URL encountered in instance or validation options
  - Action: `IValidationSupport` resolves the referenced `StructureDefinition`

- **Binding validation**
  - Input: code/coding + binding context (`ValueSet` canonical URL, binding strength)
  - Action: `IValidationSupport` performs ValueSet membership checks (locally or by delegating to a remote terminology server)

- **Fallback behavior via chaining**
  - Try cache first
  - Then local artifacts
  - Then remote services

---

## Mapping to this repository (org.hl7.fhir.core)
If you need an “equivalent” abstraction within `org.hl7.fhir.core-master`:

- `IWorkerContext` plays the role of “definition + terminology access point”.
- `BaseWorkerContext` / `SimpleWorkerContext` implement loading/caching and resource lookup.

This is a different layering than HAPI FHIR, but the same architectural idea exists: validators and snapshot generators must be able to fetch definitions and terminology artifacts and should not be tightly coupled to the underlying source.
