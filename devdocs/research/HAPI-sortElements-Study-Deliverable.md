# HAPI R4 `sortElements()` / Differential Sorting Study Deliverable

## Status

Active

## Scope

This deliverable explains **Study Guide 1.6** ("`sortElements()`") as implemented in:

- `org.hl7.fhir.r4.conformance.ProfileUtilities`

Important naming note:

- The main entry point is `sortDifferential(base, diff, name, errors)`.
- `sortElements(edh, cmp, errors)` is a recursive helper that sorts the tree.

---

## 0) Why sorting exists (what problem it solves)

Snapshot generation and other tooling assume the `differential.element[]` list is in a coherent order:

- children are grouped under their parent
- slice siblings are in a valid sequence
- choice type paths align with their base `[x]` element
- elements that point via `contentReference` can still be mapped into base

HAPI sorts the differential so that subsequent processing (e.g. snapshot merge) can rely on predictable traversal.

---

## 1) What is the exact sorting rule?

### 1.1 Overall algorithm (`sortDifferential`)

1. If the differential is empty: return.
2. Build a _tree_ (`ElementDefinitionHolder`) from `differential.element[]` using `processElementsIntoTree`.
3. Sort siblings at every tree level using `sortElements(edh, cmp, errors)`.
4. Serialize the tree back into a linear list with `writeElements`.

The key comparator is:

- `ElementDefinitionComparer implements Comparator<ElementDefinitionHolder>`

Its comparison rule is:

- compute `baseIndex` for each node by locating it in **base snapshot** (`cmp.find(path)`).
- sort by `baseIndex` ascending.

So the _authoritative ordering_ is the order of elements in **base snapshot**, not lexicographic path ordering.

### 1.2 The `find(path)` mapping (how baseIndex is computed)

`ElementDefinitionComparer.find(path)` attempts to map the differential path to an index in `base.snapshot.element[]`.

It considers (in order):

- direct equality: `p.equals(actual)`
- choice type match: base element ends with `[x]` and `actual` begins with the `[x]` prefix (details in section 3)
- `contentReference` redirection:
  - if `path.startsWith(p + ".")` and base `snapshot[i]` has `contentReference`, rewrite `actual` to point into the referenced structure
  - includes a compatibility branch for older FHIR where references were like `#parameter` instead of `#Parameters.parameter`
  - includes recursion limit `MAX_RECURSION_LIMIT` to avoid infinite loops

If nothing is found:

- it records an error (`"Differential contains path ... not found in the base"`) and returns 0.

---

## 2) How are sliced paths sorted? (`:sliceName` suffix)

### 2.1 In this codebase, sorting does not literally parse `:sliceName`

In canonical string form, slices are often displayed as `path:sliceName`.
But in the model, slice name is stored separately:

- `ElementDefinition.path` = the common path
- `ElementDefinition.sliceName` = the slice identifier

So there is no `:sliceName` parsing step.

### 2.2 Where sliceName affects sorting

There are **two different sorting phases**:

#### Phase A: Optional pre-sort (only when no slicing detected)

If `sortDifferential` detects _no slicing_ (heuristic):

- no element has `slicing`
- and there are no duplicate `path` values

then it pre-sorts the raw differential list with:

- `Collections.sort(diffList, new ElementNameCompare())`

`ElementNameCompare` compares:

1. `normalizePath(o1).compareTo(normalizePath(o2))`
2. if same normalized path: compare `sliceName` (empty string if none)

So in this pre-sort, sliceName is only a tie-breaker for same path.

#### Phase B: Primary sort (tree sibling sort)

When slicing exists (or might exist), HAPI does _not_ pre-sort.
Instead it relies on `ElementDefinitionComparer`, which sorts by baseIndex.

Important consequence:

- `ElementDefinitionComparer.find(path)` uses only `path` (not `sliceName`).
- Therefore multiple slices with the same `path` will map to the same baseIndex.
- Java `Collections.sort` is stable (TimSort), so equal baseIndex items keep their relative order from input tree.

---

## 3) How are choice types sorted? (`[x]` vs concrete types)

Choice types appear in base snapshot as:

- `Observation.value[x]`

but differential may contain:

- `Observation.valueString`
- `Observation.valueQuantity`

HAPI handles this in two places:

### 3.1 Pre-sort normalization (`ElementNameCompare.normalizePath`)

When pre-sort is used (no slicing):

- if a path ends with `[x]`, it strips the suffix for comparison.

This ensures e.g. `onset[x]` compares the same as `onsetAge`, `onsetDateTime`, etc.

### 3.2 BaseIndex mapping (`ElementDefinitionComparer.find`)

In the primary sort, choice types are handled by a special match:

If base snapshot path `p` ends with `[x]` and:

- `actual.startsWith(p without [x])`
- `actual` is not itself `[x]`
- the suffix part does not include `.` (i.e. it is a direct choice expansion like `valueString`, not a nested child)

then `find()` returns the base index of the `[x]` element.

Consequence:

- all `valueString`, `valueQuantity`, etc. map to the same baseIndex as `value[x]`.
- within that group, relative order is preserved by stable sorting.

---

## 4) Practical takeaways for a TS implementation

If you want semantic equivalence:

1. Do not implement sorting as plain lexicographic `path` order.
2. Implement a "map-to-base-index" function like `find(path)` that:
   - resolves direct matches
   - resolves choice types via `[x]` prefix match
   - resolves `contentReference` redirection
3. Use stable sorting, because ties (same baseIndex) are common:
   - slices under the same path
   - choice type expansions mapping to `[x]`

---

## 5) Checklist Coverage (Study Guide 1.6)

- [x] What is the exact sorting rule?
  - Build tree, sort siblings by base snapshot index (via `find(path)`), serialize back.
- [x] How are sliced paths sorted?
  - Pre-sort tie-breaker uses `sliceName` only when _no slicing exists_; otherwise ordering follows baseIndex + stable tie behavior.
- [x] How are choice types sorted?
  - `[x]` stripped in pre-sort; concrete types map to `[x]` base index in primary sort.

---

## References

- `ProfileUtilities.sortDifferential(...)`
- `ProfileUtilities.sortElements(...)`
- `ProfileUtilities.ElementDefinitionComparer.find(...)`
- `ProfileUtilities.ElementNameCompare.normalizePath(...)`
