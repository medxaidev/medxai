# HAPI R4 `ProfileUtilities.processPaths()` Study Deliverable

## Status

Active

## Purpose

This deliverable explains the real behavior of HAPI FHIR R4 snapshot generation’s core merge routine:

- Class: `org.hl7.fhir.r4.conformance.ProfileUtilities`
- Method: `processPaths(...)`

It is written to satisfy the Study Guide section **1.2 `processPaths()`** checklist items:

- How are paths matched? (exact, prefix, sliced?)
- What happens if no match found? (new element or error?)
- How is insertion position determined?

Chinese explanations are provided inline while keeping English technical terms.

---

## Where `processPaths()` Sits in the Pipeline

`generateSnapshot()` orchestrates snapshot generation and calls `processPaths(...)` as the core merge driver.

Key conceptual point:

- `processPaths()` is **base-driven**: it walks the **base snapshot** (or datatype snapshot) and consumes matching items from the **differential**.
- It does not simply iterate differential and patch base.

---

## Method Signature (R4)

In R4 this method signature is long; the most important parameters for understanding matching and insertion are:

- `result`: the **target** snapshot being built (`derived.snapshot`)
- `base`: the **source** snapshot being walked (base profile snapshot or datatype snapshot)
- `differential`: the differential element list to be applied
- `baseCursor/baseLimit`: current scope within `base.element[]`
- `diffCursor/diffLimit`: current scope within `differential.element[]`
- `contextPathSrc/contextPathDst`: path rewriting context (esp. when diving into datatypes or contentReference)
- `slicingDone`: a guard to avoid repeating implicit slicing handling
- `redirector`: redirection mapping used when `contentReference` is involved

---

## Control Flow Skeleton

At a high level, the method does:

1. While `baseCursor <= baseLimit`:
   - Take `currentBase = base.element[baseCursor]`
   - Compute current effective path `cpath` (after redirection):
     - `cpath = fixedPathSource(contextPathSrc, currentBase.path, redirector)`
   - Find differential elements matching `cpath` within the diff scope:
     - `diffMatches = getDiffMatches(differential, cpath, diffCursor, diffLimit, profileName)`
   - Merge according to whether `currentBase` is already sliced (`currentBase.hasSlicing()`) and whether diff slices it.

---

# 1) How are paths matched?

## 1.1 Primary matcher: `getDiffMatches(...)`

`processPaths()` delegates matching to `getDiffMatches(...)`.

What we can infer from call sites and follow-up logic:

- Matching is **path-based** and works within a diff “window” (`diffCursor..diffLimit`).
- It collects all differential entries that match the current base path, including slice-specific entries.

## 1.2 Exact path vs prefix (children)

There are two distinct notions:

- **Exact path match**: differential element whose `path` corresponds to `cpath` (or its slice variants)
- **Inner/child matches**: differential elements whose `path` starts with `cpath + "."`.

The latter is detected using:

- `hasInnerDiffMatches(differential, cpath, diffCursor, diffLimit, base.element, ...)`

## 1.3 Slicing-aware matching

There are three major slicing scenarios:

### A) Base element is NOT sliced (`!currentBase.hasSlicing()`)

- `diffMatches.isEmpty()` means diff says nothing about this element.
- `diffMatches.size()==1` and diff is not slicing => treat as a normal constraint application.
- Otherwise, diff is slicing (or constraining by type slices) => enter slicing/type-slicing branches.

### B) Base element IS already sliced (`currentBase.hasSlicing()`)

HAPI enforces slicing rules:

- Existing slice order must be maintained.
- Slice names must match.
- New slices can only be introduced at the end.
- If base slicing is `CLOSED`, diff cannot introduce new slices.

### C) Type slicing shortcut (`diffsConstrainTypes(...)`)

HAPI supports a “type slicing” shortcut where differential constraints imply slicing by type.

This is detected by:

- `diffsConstrainTypes(diffMatches, cpath, typeList)`

and then it may insert an artificial slicing root element into the differential list (workaround behavior differs depending on version flags).

## 1.4 Choice types (`[x]`) normalization

Inside the “single diff match” branch, HAPI has special logic when:

- outcome has multiple types
- base path ends with `[x]` but differential path is concrete (e.g., `valueString`)

Code excerpt behavior (simplified):

- If base element has multiple types and path ends with `[x]`, it derives the chosen type name from the differential path tail.
- Then it narrows `outcome.type[]` down to that chosen type.

## 1.5 Extensions

There are multiple extension-specific checks:

- Slicing rules differ for `.extension` / `.modifierExtension`.
- Some branches treat extension slicing as a special case (e.g., `makeExtensionSlicing()` and doc checks).

---

# 2) What happens if no match is found?

## 2.1 Base not sliced + no diff match (`diffMatches.isEmpty()`)

The default behavior is:

1. Copy base element into outcome:
   - `outcome = updateURLs(url, webUrl, currentBase.copy())`
   - rewrite destination path: `fixedPathDest(...)`
2. Merge base constraints into outcome:
   - `updateFromBase(outcome, currentBase)`
3. Add to `result.element[]`.

So “no diff match” does **not** cause an error; it means “inherit base as-is”.

## 2.2 But: if diff has children under this path, HAPI may still descend

Even when there is no direct diff match for `cpath`, HAPI checks:

- `hasInnerDiffMatches(...)`

If true:

- If base has children: recursively process base children scope.
- Else (base has no children): interpret as implicit step into a datatype (or reference-like) structure:
  - Determine datatype profile via `getProfileForDataType(outcome.type[0])`
  - Compute diff subrange that starts with `cpath + "."`
  - Recurse with `dt.snapshot` as the new base.

If outcome has no types, HAPI throws.

## 2.3 Base sliced + no diff match

If base element is already sliced and diff has no match:

- HAPI copies the base slice element and all its children/siblings as-is until the slice scope ends.

## 2.4 When it becomes an error

Common hard-error situations include:

- Differential attempts slicing on a non-repeating element without satisfying “sliced-to-one-only” constraints.
- Differential indicates slicing but does not define required slicing info.
- Base slicing is `CLOSED` but diff tries to add new slices.
- Differential walks into children when base has no children AND outcome has no types (cannot infer datatype).
- Multiple non-Reference types with children (ambiguous datatype expansion) triggers errors.

---

# 3) How is insertion position determined?

## 3.1 The simplest rule: output is appended in traversal order

In the non-slicing, non-special-case path, insertion is:

- `result.getElement().add(outcome)`

Because `processPaths()` walks `baseCursor` forward, this naturally preserves base snapshot order.

## 3.2 Result scope safety: `resultPathBase`

HAPI maintains an invariant:

- All inserted outcomes must share a common root prefix `resultPathBase`.
- If insertion would violate it, HAPI throws `DefinitionException("Adding wrong path")`.

This is a structural safety check to prevent inserting elements under an unrelated root.

## 3.3 Insertion around children: controlled via recursion scopes

Insertion position for nested content is handled by recursion ranges:

- When processing children of an element, `processPaths()` is called with:
  - baseCursor/baseLimit narrowed to that element’s subtree
  - diffCursor/diffLimit narrowed to the differential subtree

Thus, children are inserted immediately after their parent element has been inserted, because recursion happens right after `result.add(outcome)`.

## 3.4 Slicing insertion rules

### A) Differential introduces slicing on an unsliced base element

Behavior summary:

- First, HAPI may add a slicing entry (either from diff or synthesized) to the result.
- Then for each entry in `diffMatches` (each slice), it repeatedly calls `processPaths(...)` over the same base subtree scope.

Insertion order in result is:

1. The slicing root element (unsliced path with slicing component)
2. Each slice’s processed output appended in the order of `diffMatches`

Important constraints:

- If base element is not unbounded (non-repeating), diff may only slice it when total slices are constrained to 1.

### B) Base already sliced

Behavior summary:

- HAPI obtains sibling slices from base: `baseMatches = getSiblings(...)`
- It iterates base slices in base order, and aligns differential slices by comparing `sliceName`.
- If a diff slice matches the current base slice name, it processes that slice and its children.
- If not, it copies base slice as-is.
- After all base slices are processed, any remaining diff slices are treated as “new slices”:
  - Allowed only when slicing is not `CLOSED`
  - New slices are appended at the end

Thus insertion position for new slices is **after** all base-defined slices.

---

## Minimal Pseudocode (Text)

This pseudocode is deliberately high-level and reflects real branching in the Java source:

```text
processPaths(result, base, differential, baseCursor..baseLimit, diffCursor..diffLimit):
  while baseCursor <= baseLimit:
    currentBase = base[baseCursor]
    cpath = redirectAndFixSourcePath(currentBase.path)
    diffMatches = getDiffMatches(differential, cpath, diffCursor..diffLimit)

    if currentBase is NOT sliced:
      if diffMatches empty:
        outcome = copy currentBase into result
        if hasInnerDiffMatches(cpath):
          if baseHasChildren(currentBase):
            recurse into base children scope
          else:
            dt = getProfileForDataType(outcome.type)
            recurse into dt.snapshot scope
        baseCursor++

      else if diffMatches is a single non-slicing match:
        outcome = merge(base=currentBase, diff=diffMatches[0])
        add outcome
        maybe recurse into children/datatype/contentReference
        advance baseCursor and diffCursor

      else if diffsConstrainTypes(diffMatches):
        setup type slicing (may insert synthetic slicing root)
        recurse for slicing root then for each type-slice
        advance cursors

      else:
        setup slicing on result
        for each diffMatch (slice):
          recurse over same base subtree with diff scope for that slice
        advance cursors

    else (currentBase is sliced in base):
      if diffMatches empty:
        copy base slice block as-is
      else:
        verify slicing compatibility
        add unsliced slicing entry
        align slices by sliceName in base order
        process matching slices, copy non-matching base slices
        append new diff slices if allowed

    move baseCursor forward appropriately
```

---

## Notes for Your TypeScript Implementation

1. Implement base-driven traversal with scoped cursors/ranges.
2. Preserve slice ordering constraints exactly.
3. Keep a “diff consumed” marker to validate coverage at the end.
4. Treat datatype diving (implicit step-in) and contentReference redirection as first-class recursion scenarios.

---

## References

- Java source: `org.hl7.fhir.r4.conformance.ProfileUtilities#processPaths`
- Study guide: `devdocs/research/HAPI-Algorithm-Study-Guide.md` section 1.2
