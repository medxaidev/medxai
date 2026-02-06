# HAPI R4 Slicing Handling ("processSlicing") Study Deliverable

## Status

Active

## Scope / Purpose

This deliverable explains how HAPI FHIR R4 snapshot generation handles **slicing**.

In this codebase there is **no single method literally named `processSlicing()`**.
Instead, slicing is handled primarily inside:

- `ProfileUtilities.processPaths(...)` (the main snapshot merge loop)

and supported by helpers:

- `updateFromSlicing(...)`
- `discriminatorMatches(...)`, `orderMatches(...)`, `ruleMatches(...)`
- `getSiblings(...)`
- `makeExtensionSlicing()`

---

## Key Concepts / 关键概念

### Slicing configuration lives on the _unsliced_ element

FHIR slicing is configured on the **unsliced** element `path` via:

- `ElementDefinition.slicing`
  - `discriminator[]` (`type`, `path`)
  - `ordered` (boolean)
  - `rules` (`closed`, `open`, `openAtEnd`)

Slices are represented as additional `ElementDefinition` entries having:

- same `path`
- `sliceName`

---

## Key Concepts / 关键概念

## 1) How are discriminators evaluated?

### 1.1 Snapshot generation does **not** evaluate instances

In `ProfileUtilities`, slicing/discriminators are **not executed against data instances** during snapshot generation.
Snapshot generation only:

- copies/merges the `slicing` metadata into the produced snapshot
- validates that differential slicing metadata is compatible with base slicing metadata

### 1.2 What HAPI validates about discriminators at snapshot time

HAPI validates discriminator metadata mostly in the branch: **base element already has slicing**.

If differential provides slicing info (`diffMatches.get(0).hasSlicing()`), then HAPI checks:

- `discriminatorMatches(diff.discriminator, base.discriminator)`
  - requires same count (unless either list is empty)
  - requires same `(type, path)` per position

Implementation details (helpers):

- `discriminatorMatches(...)` returns true when either list is empty (tolerant mode)
- otherwise it requires:
  - same size
  - same ordered pairwise match (no re-ordering)

---

## 2) How are slices inserted (before/after base element)?

### 2.1 Two major slicing situations in `processPaths()`

HAPI has different logic depending on whether **base** is already sliced.

#### Case A: Base is NOT sliced, differential introduces slicing

Branch condition:

- `!currentBase.hasSlicing()` and differential indicates slicing (multiple matches, or slicing metadata, or extension slicing)

Actions:

- Create an `outcome` element as a copy of `currentBase` and add `slicing` to it.
  - If differential doesnt explicitly define slicing and its an extension, HAPI uses `makeExtensionSlicing()`
  - Else it copies `diffMatches.get(0).getSlicing()`

- Add the unsliced+`slicing` outcome element to `result.snapshot` immediately.

- Then process each slice entry in `diffMatches` by recursively calling `processPaths(...)` with narrowed scopes.

Insertion position:

- The slicing entry (unsliced element with slicing metadata) is inserted at the position where the base element was.
- Slice elements appear **after** that entry as they are processed.

#### Case B: Base is already sliced, differential modifies/extends slices

Branch condition:

- `currentBase.hasSlicing()` (base snapshot already contains slicing)

Actions:

1. Copy the base unsliced slicing root element to result.
2. Collect the base slice siblings using `getSiblings(base.elements, currentBase)`.
3. Walk base slice siblings in order, matching them with differential slice entries (`diffMatches`) by `sliceName`.
4. If a base slice has a matching diff slice, recursively process it (so it can bring its children).
5. If a base slice has no matching diff slice, copy it (and its children) directly.
6. After finishing base slice list, process remaining diff slices as new slices (only if slicing is not closed).

Insertion position:

- Existing base slices keep their original order.
- New slices can only be introduced at the end (enforced by checks described in section 3).

---

## 3) How is slice ordering enforced?

### 3.1 Definition order must be maintained

The code states the rules explicitly (in `processPaths` comments):

1. Definition order must be maintained
2. Slice element names must match
3. New slices must be introduced at the end

### 3.2 Base slice order is the backbone

When base already has slicing:

- HAPI iterates `baseMatches = getSiblings(base.elements, currentBase)` in their existing order.
- It only consumes a diff slice if:
  - `diffMatches.get(diffpos).getSliceName().equals(outcome.getSliceName())`

If not equal, HAPI copies the base slice (no diff applied) and moves on.

### 3.3 New slices must be appended; out-of-order is rejected

After all base slices are processed:

- If slicing is `closed` and there are remaining diff slices:
  - throw `DefinitionException`

- Otherwise HAPI processes remaining diff slices as new ones, but first checks:
  - For each remaining `diffItem`, if any base slice has the same name:
    - throw `DefinitionException("Named items are out of order in the slice")`

This prevents the differential from trying to reorder or insert an already-existing slice later.

---

## 4) Slicing rules (`closed`, `open`, `openAtEnd`) handling

### 4.1 Base-vs-diff slicing metadata compatibility checks

When base already has slicing and diff provides slicing metadata, HAPI checks:

- `orderMatches(diff.ordered, base.ordered)`
- `discriminatorMatches(diff.discriminator, base.discriminator)`
- `ruleMatches(diff.rules, base.rules)`

Notably `ruleMatches(diff, base)` is permissive:

- if base is `OPEN`, it matches anything
- if base is `CLOSED`, it allows diff to be `OPENATEND` (special case)

---

## 5) Extension slicing special case

If differential slices an extension element but doesn't declare slicing explicitly:

- HAPI creates slicing via `makeExtensionSlicing()`:
  - discriminator: `(type=VALUE, path="url")`
  - ordered: false
  - rules: OPEN

---

## 6) Text-Based Flowchart (Pseudo-flow)

This is a text-only flow (requested flowchart, but delivered as text for portability):

```text
processPaths(currentBase):
  diffMatches = getDiffMatches(path)

  if currentBase has NO slicing:
    if diff doesn't slice it:
      copy base element
    else if diff constrains types (type slicing shortcut):
      normalize to TYPE slicing header element, validate, then recurse
    else:
      ensure can slice non-repeating only if max==1
      create outcome (copy base) + slicing (diff.slicing or extension default)
      add outcome to result
      optionally apply diff(0) as "base slice definition" if it has no sliceName
      for each slice in diffMatches:
        recurse processPaths for that slice scope

  else (base ALREADY sliced):
    validate slicing metadata compatibility (order/discriminator/rules)
    copy slicing root to result
    copy backbone children for BackboneElement (special handling)
    baseMatches = base slice siblings
    for each base slice in baseMatches order:
      if next diff sliceName matches this base sliceName:
        recurse to apply diff + children
      else:
        copy base slice + children
    if base slicing is CLOSED and diff has remaining slices:
      throw
    else:
      append new slices (must not collide / reorder)
```

---

## 7) Checklist Coverage (Study Guide 1.5)

- [x] How are discriminators evaluated?
  - Snapshot-time: metadata match checks only; no instance evaluation
- [x] How are slices inserted (before/after base element)?
  - Insert slicing root first; slices after; base-sliced preserves order
- [x] How is slice ordering enforced?
  - Base order preserved; new slices appended only; out-of-order throws

---

## References

- `org.hl7.fhir.r4.conformance.ProfileUtilities.processPaths(...)`
- Helper methods:
  - `updateFromSlicing`, `discriminatorMatches`, `ruleMatches`, `orderMatches`, `getSiblings`, `makeExtensionSlicing`
