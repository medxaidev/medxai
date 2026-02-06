# HL7 Reference Implementation — FHIRPathEngine Syntax Basics Notes (Deliverable)

## Scope
This deliverable covers the Study Guide item:

- **FHIRPathEngine.java**
- **Study checklist**:
  - Understand FHIRPath syntax basics
  - Understand common operators/functions (`exists`, `where`, `all`, etc.)

This is meant as a practical reference for re-implementing *a subset* of FHIRPath evaluation semantics (e.g., in TypeScript).

---

## File location (R4)
In this repository, the R4 FHIRPath engine is implemented at:

- `org.hl7.fhir.r4/src/main/java/org/hl7/fhir/r4/fhirpath/FHIRPathEngine.java`

> Note: The Study Guide mentions `org.hl7.fhir.r4.utils.FHIRPathEngine`, but in this repository the R4 engine lives under `org.hl7.fhir.r4.fhirpath`.

There are also versions for other FHIR releases:
- `org.hl7.fhir.r4b/.../fhirpath/FHIRPathEngine.java`
- `org.hl7.fhir.r5/.../fhirpath/FHIRPathEngine.java`
- older DSTU2/DSTU3 variants

---

## What it does (high level)
`FHIRPathEngine` is responsible for:

- **Parsing** FHIRPath strings into an AST (`ExpressionNode`) using `FHIRLexer`
- **Static checking / type inference** of expressions via `check(...)` and internal `executeType(...)`
- **Evaluating** expressions against a focus object to produce a collection result (`List<Base>`) via `evaluate(...)` and internal `execute(...)`

This engine is used by validators to execute constraints and other logic expressed as FHIRPath.

---

## Core mental model: everything is a collection
Evaluation methods return `List<Base>`:

- Empty collection means “no value”
- Many functions/operators are written in terms of iterating a collection

Some operations also have **short-circuiting** and “tri-state boolean” semantics implemented via an internal enum:

- `Equality { Null, True, False }`

---

## FHIRPath syntax basics (as implemented here)

### 1) Parse API
Public parse methods:

- `ExpressionNode parse(String path)`
- `ExpressionNode parse(String path, String name)`
- `ExpressionNodeWithOffset parsePartial(String path, int i)`
- `ExpressionNode parse(FHIRLexer lexer)`

Key behavior:
- Empty input is rejected (`"Path cannot be empty"`)
- Parsing produces an `ExpressionNode` tree and then calls `result.check()` to validate AST constraints

### 2) Evaluation API
Common entry points:

- `List<Base> evaluate(Base base, String path)`
- `List<Base> evaluate(Object appContext, Resource focusResource, Resource rootResource, Base base, String path)`
- `boolean evaluateToBoolean(...)` wraps `evaluate(...)` + `convertToBoolean(...)`
- `String evaluateToString(...)` wraps `evaluate(...)` + `convertToString(...)`

Conceptually:
1) parse string -> `ExpressionNode`
2) build an `ExecutionContext`
3) call `execute(context, focusList, node, atEntry=true)`

### 3) Special variables at the start of an expression
In `execute(...)`, when evaluating a `Name` node at entry, the engine recognizes:

- `$this` : current item
- `$total` : “total” collection
- `$index` : index (used notably by `select`)

### 4) Constants and literals
In the parser, constants include:

- string literals (single/double quotes depending on flags)
- integers and decimals
- booleans (`true`, `false`)
- empty set literal `{}` -> represented as `null` in constant parsing
- special constants starting with `%` or `@` (represented as `FHIRConstant`)

---

## Common operators/functions (exists/where/all/etc.)

### Function dispatch
Runtime evaluation of functions goes through:

- `evaluateFunction(context, focus, exp)`
- `switch (exp.getFunction()) { ... }`

Parameter counts are validated during parsing via:

- `checkParameters(...)` with per-function `checkParamCount(...)` rules

### `where(predicate)`
Implementation: `funcWhere(...)`

Semantics:
- Iterate each `item` in `focus`.
- Evaluate the predicate with `$this` bound to the `item` (via `changeThis(context, item)`).
- If predicate evaluates to boolean `True`, keep the original `item`.

Code shape:
- Builds a single-item list `pc` for predicate evaluation
- Uses `asBool(execute(...predicate...), exp)` to interpret predicate result as `Equality`

### `select(projection)`
Implementation: `funcSelect(...)`

Semantics:
- Iterate each `item` in `focus`.
- Evaluate the projection with `$this` bound to `item`.
- Also sets `$index` for the inner context (`setIndex(i)`), incrementing per element.
- Concatenate all projection results into the resulting collection.

### `exists()` and `exists(predicate)`
Implementation: `funcExists(...)`

Semantics:
- Without params: returns `true` if any item in `focus` is not empty (`!f.isEmpty()`).
- With predicate: returns `true` if predicate is `True` for any item.

Notable details:
- Uses an `empty` flag that flips when a match is found
- Returns a singleton boolean list

### `all()` and `all(predicate)`
Implementation: `funcAll(...)`

Semantics:
- With predicate: returns `true` if predicate is `True` for *every* item.
- Without predicate: attempts to interpret each item itself as boolean and returns true only if all are true.

### Related boolean collection functions
The engine also implements:

- `allTrue()` / `anyTrue()`
- `allFalse()` / `anyFalse()`

These are similar in structure to `all/exists` and rely on `asBool(...)` conversion.

---

## Short-circuiting behavior (example: `and`, `or`, `implies`)
Before evaluating a full binary operation chain, `execute(...)` may call `preOperate(...)`.

`preOperate(...)` can return an early boolean result based on the left-hand side:

- `And`: if left is false -> return false
- `Or`: if left is true -> return true
- `Implies`: if left is false -> return true

This avoids unnecessary evaluation of the right-hand expression.

---

## Type checking and type inference (why it matters)
`check(...)` does more than validate syntax:

- It resolves type context via `IWorkerContext` and `StructureDefinition` snapshots
- It infers result types through `executeType(...)`
- It can emit warnings when applying collection-only functions to singletons

For porting a subset of FHIRPath (Stage-1), you may only need a small fraction of this type machinery.

---

## Practical notes for a TypeScript re-implementation (Stage-1 context)
Your Study Guide note says Stage-1 does **not** evaluate FHIRPath.

If you still want a minimal implementation for later stages, a pragmatic incremental strategy is:

1) Build a parser + AST for the subset you need
2) Implement a collection-based evaluator returning `T[]`
3) Implement only the functions you need first:
   - navigation (name resolution)
   - `where`, `exists`, `all`, `select`
4) Add tri-state boolean conversion logic (Null/True/False)
5) Add short-circuit evaluation for boolean ops

---
