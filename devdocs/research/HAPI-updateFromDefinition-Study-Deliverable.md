# HAPI R4 `ProfileUtilities.updateFromDefinition()` Study Deliverable

## Status

Active

## Purpose

This document explains how HAPI FHIR R4 applies a differential `ElementDefinition` onto a snapshot element during snapshot generation.

- Class: `org.hl7.fhir.r4.conformance.ProfileUtilities`
- Method: `updateFromDefinition(ElementDefinition dest, ElementDefinition source, ...)`

It is intended to satisfy Study Guide section **1.4**:

- How does it differ from `updateFromBase()`?
- Which properties are overwritten vs merged?

Chinese explanations are included inline while keeping English technical terms.

---

## 0) Where `updateFromDefinition()` Is Used

During snapshot generation, HAPI generally:

1. Creates an `outcome` element as a copy/clone of a base snapshot element.
2. Calls `updateFromBase(outcome, currentBase)` to populate `outcome.base` (traceability).
3. Calls `updateFromDefinition(outcome, diffElement, ...)` to apply the differential constraints.

---

## 1) How `updateFromDefinition()` Differs from `updateFromBase()`

### 1.1 `updateFromBase()` (in this R4 codebase)

- Only populates `ElementDefinition.base` (`path/min/max`) on the destination element.
- Does not merge cardinality, types, bindings, etc.

### 1.2 `updateFromDefinition()`

- Treats `dest` as the **working snapshot element** (initially base-derived).
- Treats `source` as the **differential element**.
- Copies selected fields from `source` onto `dest` using a mix of:
  - overwrite
  - merge/append
  - validate-then-overwrite

Additionally:

- It marks the differential element as “consumed” by setting:
  - `source.setUserData(GENERATED_IN_SNAPSHOT, dest)`

---

## 2) High-Level Structure of the Method

At the start:

- `base = dest`
- `derived = source`
- `derived.setUserData(DERIVATION_POINTER, base)` (trace link)
- `isExtension = checkExtensionDoco(base)`

Then it applies many fields in a consistent pattern:

- If `derived` has the field:
  - If different from `base`, update `base` (overwrite or merge)
  - Else mark equality (or trim differential)

---

## 3) Which Properties Are Overwritten vs Merged?

Below is a categorized table based on the code visible in this repository.

### 3.1 Pure overwrite (replace on difference)

| Field                   | Behavior                         | Notes                                                                        |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| `short`                 | overwrite                        | `base.short = derived.short` if different                                    |
| `label`                 | overwrite (or append with `...`) | `"..."` prefix means append derived text to base                             |
| `requirements`          | overwrite (or append with `...`) | root-level requirements are cleared (sdf-9)                                  |
| `min`                   | validate then overwrite          | validates `derived.min >= base.min` (except slices) and then sets `base.min` |
| `max`                   | validate then overwrite          | validates `derived.max <= base.max` and then sets `base.max`                 |
| `fixed`                 | overwrite                        | deep compare uses `true`                                                     |
| `pattern`               | overwrite                        |                                                                              |
| `maxLength`             | overwrite                        |                                                                              |
| `minValue` / `maxValue` | overwrite                        |                                                                              |
| `mustSupport`           | overwrite                        |                                                                              |
| `binding`               | validate then overwrite          | special REQUIRED binding logic                                               |
| `isSummary`             | overwrite with guard             | if base already has it, throws `Error`                                       |
| `type[]`                | validate then replace            | see type compatibility below                                                 |

### 3.2 Append / union (merge without deleting base items)

| Field          | Behavior                 | Notes                                                                            |
| -------------- | ------------------------ | -------------------------------------------------------------------------------- |
| `alias[]`      | union-add                | adds missing aliases                                                             |
| `example[]`    | union-add                | adds missing examples                                                            |
| `mapping[]`    | union-add (identity+map) | comment says mappings are not cumulative, but code behaves like add-if-missing   |
| `constraint[]` | append all derived       | base constraints are marked derived; derived constraints are copied and appended |
| `extension[]`  | replace-per-url then add | remove existing ext (depending on SD) then add copy                              |

### 3.3 Conditional overwrite (extensions only)

- For profiles, comments indicate some fields cannot change (`isModifier`, defaultValue, meaningWhenMissing).
- But extensions can change `isModifier` (and `isModifierReason`) when `isExtension == true`.

---

## 4) The Core Validation Checks (What can error)

### 4.1 Cardinality tightening

- If `derived.min < base.min` AND `!derived.hasSliceName()`:
  - add `ValidationMessage ERROR`
- If `derived.max` is larger than `base.max` (`isLargerMax`):
  - add `ValidationMessage ERROR`

### 4.2 Type compatibility (hard failure)

For each `ts` in `derived.type[]`, HAPI checks it is compatible with at least one `td` in `base.type[]`.

Special allowances exist (from code):

- `Extension`
- `Element`
- `*`
- `Resource` / `DomainResource` compatibility with actual resource types
- historical workaround: `derived uri` vs `base string`

If not compatible:

- throws `DefinitionException` (hard stop)

### 4.3 Binding rules (REQUIRED)

- If base binding is REQUIRED and derived tries to change strength away from REQUIRED:
  - add `ValidationMessage ERROR`

- If both are REQUIRED and both have valueSet:
  - fetch + expand both value sets
  - verify derived is a subset of base
  - if not subset: add `ValidationMessage ERROR`

### 4.4 `isSummary`

- If base already has `isSummary` and derived differs:
  - `throw new Error(...)`

### 4.5 Bindable-type cleanup

At the end:

- If `dest` still has a binding but no bindable type after type processing:
  - binding is removed (`dest.setBinding(null)`)

---

## 5) Practical Takeaways for a TS Re-Implementation

1. Treat `updateFromDefinition()` as the **single source of truth** for:
   - which fields are overwritten vs merged
   - which validations exist

2. Keep a consistent “apply pattern” per field:
   - if diff has field -> compare -> validate -> apply (overwrite/merge)

3. Preserve the “diff consumed” marker concept:
   - you will need an equivalent to `GENERATED_IN_SNAPSHOT` to validate coverage.

---

## References

- Source file: `org.hl7.fhir.r4.conformance.ProfileUtilities.java`
- Method: `updateFromDefinition(ElementDefinition dest, ElementDefinition source, ...)`
