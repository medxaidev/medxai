# HAPI FHIR (HL7 Reference Validator) — BaseValidator Validation Patterns Notes (Deliverable)

## Scope note
This document summarizes validation utility patterns implemented by `org.hl7.fhir.validation.BaseValidator` in this repository.

Study Guide reference:
- **Item:** BaseValidator.java
- **Study checklist:**
  - What validation utilities are provided?
  - How are validation errors reported?

---

## File location
- `org.hl7.fhir.validation/src/main/java/org/hl7/fhir/validation/BaseValidator.java`

> Note: The Study Guide mentions `org.hl7.fhir.r4.validation.BaseValidator`, but in this repository the class lives in `org.hl7.fhir.validation`.

---

## What BaseValidator is
`BaseValidator` is a shared foundation for validator components. It centralizes:

- Common *message construction* helpers (`rule`, `warning`, `hint`, etc.)
- Consistent *severity gating* (errors-only vs warnings vs hints)
- Message *deduplication* and optional *suppression* / *override* rules
- Several resolver utilities used by instance validation (ValueSet resolution, Bundle reference resolution, etc.)

It implements:
- `IValidationContextResourceLoader`
- `IMessagingServices`

and is typically used/extended by validators such as `InstanceValidator`.

---

## 1) Validation utilities provided

### A. Severity gating utilities
Validation output is controlled by `ValidatorSettings.getLevel()`.

Key methods:
- `doingLevel(IssueSeverity)`
- `doingErrors()`
- `doingWarnings()`
- `doingHints()`

This enables running the validator in modes such as:
- errors only
- errors + warnings
- errors + warnings + hints

### B. Core "assert" helpers (rule/warning/hint/fail)
These helpers follow a consistent shape:

- Input: `List<ValidationMessage> errors`, rule metadata (`ruleDate`, `IssueType`), location (`line`, `col`, `path`), boolean `thePass`, and message id/template
- Behavior:
  - If `thePass == false` and severity level is enabled, they create and append a `ValidationMessage`
  - Return `thePass` to allow fluent aggregation

Key methods:
- **Fatal / stop-like**: `fail(...)` (adds `IssueSeverity.FATAL`)
- **Error**: `rule(...)`, `ruleInv(...)`, `rulePlural(...)`, `ruleHtml(...)`
- **Warning**: `warning(...)`, `warningInv(...)`, `warningPlural(...)`, `warningHtml(...)`
- **Hint (Information)**: `hint(...)`, `hintInv(...)`, `hintPlural(...)`

Convenience overloads exist for:
- `NodeStack` (to carry line/col + literal FHIRPath-like path)
- `List<String> pathParts` (converted to a canonical path with `toPath(...)`)

### C. Terminology-specific utilities (tx*)
Terminology messages are marked with source `Source.TerminologyEngine` and can carry extra fields:

- `txRule(...)` (severity ERROR)
- `txWarning(...)` (severity WARNING)
- `txHint(...)` (severity INFORMATION)

These typically attach:
- `txLink`
- `diagnostics`

### D. Slicing diagnostics helpers
For profile slicing, BaseValidator supports attaching richer hint content:

- `slicingHint(...)` creates a hint message and marks it as a slicing hint:
  - `setSlicingHint(true)`
  - `setSliceHtml(html, info)` to attach explain/trace content
  - can mark `criticalSignpost`

It also supports attaching slice details to rule/warning messages:
- `setSliceInfo(details)`

### E. Signposts
`signpost(...)` emits an INFORMATION message with `setSignpost(true)`.

This is used for producing higher-level breadcrumbs in the validation output.

### F. Message suppression hooks
There are two suppression/override mechanisms:

1) **Policy advisor suppression**
- `isSuppressedValidationMessage(path, messageIdOrTemplate)` delegates to `policyAdvisor.isSuppressMessageId(...)`.

2) **Per-message ID validation control**
- `validationControl : Map<String, ValidationControl>` where `ValidationControl` contains:
  - `allowed` (boolean)
  - `level` (override severity)

`checkMsgId(id, vm)` applies:
- optional severity override (`vm.setLevel(...)`)
- optional allow/deny gate (returns `control.isAllowed()`)

This lets hosting applications selectively:
- suppress specific message IDs
- downgrade/upgrade severity for specific message IDs

### G. Message de-duplication
All message additions route through `addValidationMessage(...)` which:

- creates a `ValidationMessage`
- checks:
  - severity is enabled (`doingLevel(theSeverity)`)
  - message is not already present (`!hasMessage(errors, validationMessage)` using `preciseMatch`)
  - message passes validationControl (`checkMsgId(id, validationMessage)`)

This prevents repeated identical messages from flooding the output.

### H. "Warn now, remove later" pattern (tracked messages)
`BaseValidator` has a specific pattern for extensible bindings that may be superseded by later logic:

- `txWarningForLaterRemoval(location, ...)`:
  - adds a warning
  - also records it in `trackedMessages` with an arbitrary `location` key

- `removeTrackedMessagesForLocation(errors, location, path)`:
  - finds tracked messages for `location`
  - adds them to `messagesToRemove`
  - removes from `trackedMessages`

This enables a two-phase validation flow:
- emit tentative warnings
- later retract them if a stricter/required binding is discovered

### I. ValueSet binding reference resolution
`resolveBindingReference(DomainResource ctxt, String reference, String uri, Resource src)` resolves a binding reference to a `ValueSet`:

- Supports contained references (`#...`) by scanning `ctxt.getContained()`
- Normalizes/pins some references (e.g., `bcp13` -> `ValueSet/mimetypes`)
- Uses `ContextUtilities.pinValueSet(reference)`
- Fetches terminology resources via `context.findTxResource(ValueSet.class, reference, null, src)`
- Falls back to `ImplicitValueSets.generateImplicitValueSet(reference)` if not found
- Tracks terminology lookup time via `timeTracker.tx(...)`

### J. Bundle reference resolution helpers
`resolveInBundle(...)` and related helpers support resolving references within a Bundle:

- Builds per-bundle entry maps in userData:
  - `validator_entry_map` keyed by `fullUrl` (and versioned `fullUrl/_history/{versionId}`)
  - `validator_entry_map_reverse` keyed by `ResourceType/id` (and versioned)

- Resolves absolute URLs primarily by `fullUrl` lookup
- Provides diagnostic messages for:
  - not found
  - found multiple
  - fragment mismatch (`#fragment`)

Messages are gated by a session key to avoid repeating the same bundle-level warning:
- `UserDataNames.validation_bundle_error` stores `sessionId` once an error has been emitted

### K. Misc utilities
- `isSearchUrl(IWorkerContext context, String ref)` validates `ResourceType?param=value&...` using a regex
- String utilities:
  - `splitByCamelCase(...)`
  - `stripPunctuation(...)`

### L. Cross-version extension utilities (xver)
`BaseValidator` integrates with `XVerExtensionManager`:

- `isXverUrl`, `xverStatus`, `xverDefn`, etc.
- `getXverExt(...)`:
  - validates extension URL/version
  - generates snapshot via `ContextUtilities.generateSnapshot(defn)`
  - caches the generated StructureDefinition in `context.getManager().cacheResource(defn)`

### M. Resource loading utilities (contained + found)
`loadContainedResource(...)` and `loadFoundResource(...)` support loading contained resources and converting them to R5 model when needed.

---

## 2) How validation errors are reported

### Primary reporting structure: `ValidationMessage`
All validation findings are recorded as `org.hl7.fhir.utilities.validation.ValidationMessage` instances.

A `ValidationMessage` typically contains:
- **Source**: e.g., `settings.getSource()` or `Source.TerminologyEngine`
- **IssueType**: from `ValidationMessage.IssueType`
- **Severity**: from `ValidationMessage.IssueSeverity` (FATAL/ERROR/WARNING/INFORMATION)
- **Location**: `line`, `col`, `path`
- **Message text**: formatted via `context.formatMessage(...)` (supports i18n/message templates)
- Optional fields:
  - `messageId`
  - `invId`
  - `txLink`, `diagnostics`
  - slice hint HTML/info

### Building messages from `OperationOutcomeIssueComponent`
`buildValidationMessage(txLink, diagnostics, line, col, path, OperationOutcomeIssueComponent issue)` converts terminology/server issues into `ValidationMessage`:

- Maps OperationOutcome severity/code into `IssueSeverity`/`IssueType`
- Uses `issue.details.text` as the message text
- Copies extensions when present:
  - `EXT_ISSUE_SERVER`
  - `EXT_ISSUE_MSG_ID`
- Copies `issue.diagnostics` into `ValidationMessage.diagnostics`

### Output control and stability guarantees
BaseValidator ensures output is:
- **consistent** (centralized constructors)
- **bounded** (dedup)
- **configurable** (level gating + suppression + overrides)

---

## Notes for a TypeScript re-implementation
If you are porting these patterns:

- Implement a single message sink interface (equivalent to `List<ValidationMessage>`) and ensure:
  - severity gating
  - message ID suppression
  - message de-duplication (precise match)

- Keep a clear separation between:
  - *validation logic* (checks)
  - *message emission* (rule/warn/hint helpers)

- Implement the tracked warning removal pattern if you need the same “extensible binding later replaced by required binding” behavior.

---
