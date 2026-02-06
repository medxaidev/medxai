# HL7 Reference Validator — InstanceValidator Full Validation Flow Notes (Deliverable)

## Scope
Study Guide item:

- **InstanceValidator.java**
- **Purpose:** Understand how the reference validator validates resource instances against profiles, including FHIRPath constraints.

This note is intended as:
- A high-level map of the validation pipeline
- A reference for implementing *Stage-1 structural validation* (even though the full validator does much more)

---

## File location in this repository
The Study Guide lists `org.hl7.fhir.r4.validation.InstanceValidator`.

In this repository the corresponding class is:

- `org.hl7.fhir.validation/src/main/java/org/hl7/fhir/validation/instance/InstanceValidator.java`

> Important: this class is implemented using **R5 element model** (`org.hl7.fhir.r5.elementmodel.Element`) and **R5 FHIRPathEngine** (`org.hl7.fhir.r5.fhirpath.FHIRPathEngine`) even when validating older versions. This is typical of the HL7 reference validator: it uses shared infra and cross-version converters.

---

## What InstanceValidator is
`InstanceValidator` is the main instance-level validator that:

- Parses input into the **element model** (`Element`)
- Resolves applicable **StructureDefinition** profiles
- Walks the instance tree while validating:
  - structure (required children, cardinalities)
  - fixed/pattern constraints
  - bindings / terminology checks
  - slices and discriminators
  - references and contained-resource rules
  - invariants expressed in **FHIRPath**
- Records findings as `List<ValidationMessage>` (via `BaseValidator` helper methods)

It extends:
- `BaseValidator`

and implements:
- `IResourceValidator`

---

## Public entry points (how validation starts)
InstanceValidator has multiple overloads that all converge into:

- `validate(Object appContext, List<ValidationMessage> errors, String path, Element element, List<StructureDefinition> profiles)`

Typical paths into this include:

- `validate(..., InputStream stream, FhirFormat format, List<StructureDefinition> profiles)`
  - parses using `Manager.makeParser(...)`

- `validate(..., Resource resource, List<StructureDefinition> profiles)`
  - converts to element model via `ResourceParser(context).parse(resource)`

- `validate(..., JsonObject object, List<StructureDefinition> profiles)`
  - parses using `new JsonParser(context, new ProfileUtilities(context, null, null, fpe))`

After parsing, the element model root is passed to `validate(...)`.

---

## Main entry point: `validate(appContext, errors, path, element, profiles)`
This method orchestrates top-level validation.

### Step 0 — Reset internal per-run state
`clearInternalState(element, profiles)`:

- clears fetch caches (`fetchCache`), seeds it with the root (`type/id`)
- clears trackers (`resourceTracker`, tracked messages)
- generates a new `executionId`
- sets `baseOnly = profiles.isEmpty()`
- sets parent pointers on the element tree (`setParents(element)`)
- initializes validation timeout tracking (`timeTracker.initializeValidationTimeout(...)`)

### Step 1 — Create `NodeStack`
A `NodeStack` is created and then threaded through most validation calls:

- used for line/col
- used to build literal path for message locations
- used to maintain per-element “id stack” (`stack.resetIds()`)

### Step 2 — Choose validation mode and profile(s)
Two major modes:

- **No explicit profiles**:
  - calls `validateResource(..., defn=null, mode=BaseDefinition)`

- **Explicit profiles provided**:
  - expands dependent imposed profiles via `EXT_SD_IMPOSE_PROFILE`
  - for each profile, calls `validateResource(..., defn=that profile, mode=ConfigProfile)`

### Step 3 — Finalization & cleanup
At the end of `validate(...)`:

- optional `checkElementUsage(...)` (mustSupport hints) if enabled
- `codingObserver.finish(...)`
- removes deferred-to-be-removed warnings: `errors.removeAll(messagesToRemove)`
- time tracking: `timeTracker.overall(...)`
- optional AI-based code/text validation (`validateCodeAndTextWithAI(...)`)
- debug dump of element tree if debug mode

Timeout is caught and reported as a warning `ValidationMessage`.

---

## Core internal entry point: `validateResource(...)`
Signature (key parameters):

- `ValidationContext valContext`
- `List<ValidationMessage> errors`
- `Element resource` (root resource)
- `Element element` (current element)
- `StructureDefinition defn` (profile)
- `NodeStack stack`
- `ValidationMode mode`
- flags: `forReference`, `fromContained`

### A) Profile resolution (when `defn` is null)
If `defn == null`, it attempts:

- `defn = element.getProperty().getStructure()`
- or `profileUtilities.findProfile("http://hl7.org/fhir/StructureDefinition/" + resourceName, defn)`

Then it emits an error if definition cannot be found.

### B) Special bundle handling
If resource is a `Bundle` but the profile is not for Bundle:

- tries to validate against the first entry resource instead (`getFirstEntry(stack)`)

### C) Resource-level sanity checks
Before deep validation:

- Resource.id required/prohibited rules (`IdStatus`)
- Resource.id formatting check (length and `FormatUtilities.isValidId`)

Also handles a special `matchetype` extension that influences matching behavior.

### D) Resource type match
Checks the instance type matches the profile type (`checkResourceName(defn, resourceName, format)`), otherwise emits an error.

### E) Delegate to deep validation
On success, it calls:

- `start(valContext, errors, element, element, defn, stack, pct, mode, fromContained)`

> `start(...)` is the “real” deep walk: validating children, cardinalities, fixed/pattern, slicing, bindings, references, and invariants.

### F) Contained-resource reference integrity
If not validating “for reference”, it performs a late pass:

- `checkContainedReferences(...)`

This verifies contained resources are referenced (or transitively referenced) and reports orphans.

---

## FHIRPath invariants (constraints) execution
A key part of full validation is evaluating invariants (`ElementDefinition.constraint.expression`).

Key behaviors observed:

- `FHIRPathEngine fpe` is created in constructor and configured with `ValidatorHostServices` via `fpe.setHostServices(...)`.
- Expressions are:
  - parsed using `fpe.parse(...)` (often after `FHIRPathExpressionFixer.fixExpr(...)`)
  - cached on the invariant via `UserDataNames.validator_expression_cache`
- Invariant execution uses:
  - `fpe.evaluateToBoolean(valContext, resource, valContext.getRootResource(), element, n)`

If invariant fails:

- message text is constructed using invariant key, human text, and optionally source
- severity mapping:
  - best-practice invariants can be downgraded/controlled via `BestPracticeWarningLevel`
  - otherwise uses invariant `ConstraintSeverity` (ERROR/WARNING)
- uses `ruleInv(...)`, `warningInv(...)`, or `hintInv(...)` to attach:
  - `invId`
  - `messageId`

Validation can be configured to:

- suppress invariants entirely via `noInvariantChecks`
- include the invariant AST string in messages via `wantInvariantInMessage`

---

## How InstanceValidator reports errors
InstanceValidator uses `BaseValidator` helpers and always appends to:

- `List<ValidationMessage> errors`

Notable mechanics inherited from `BaseValidator`:

- severity gating (errors/warnings/hints)
- message suppression via policy advisor
- message de-duplication via `preciseMatch`
- per-message ID allow/deny + severity override (`validationControl`)
- tracked messages that can be removed later (`messagesToRemove`)

---

## Key takeaways for Stage-1 structural validation
Stage-1 in your roadmap is structural-only. From InstanceValidator’s perspective, a minimal subset would be:

- Parse into a tree model (or equivalent) with:
  - element name
  - children
  - primitive value
  - location/path tracking
- Resolve the profile `StructureDefinition` snapshot
- Validate:
  - required children / cardinalities (`min/max`)
  - element presence and multiplicity
  - basic type checks
  - slicing *structure* (if you choose to support it structurally)

Defer to later stages:

- terminology (`binding`) validation
- reference resolution
- invariants / FHIRPath execution

---
