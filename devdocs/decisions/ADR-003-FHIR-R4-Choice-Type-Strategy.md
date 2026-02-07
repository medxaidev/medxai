# ADR-003: FHIR R4 Choice Type [x] Representation Strategy

## Status

**Status:** Accepted  
**Date:** 2026-02-08  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Superseded by:** None

---

## Context

FHIR R4 uses **choice types** (denoted `[x]` in the specification) to represent elements that can hold values of multiple data types. For example, `Observation.value[x]` can appear in JSON as `valueString`, `valueQuantity`, `valueCodeableConcept`, etc.

This pattern creates a fundamental modeling challenge in TypeScript:

### The Problem

In FHIR JSON, a choice type element like `value[x]` does **not** appear as a single `value` property. Instead, the actual JSON property name includes the type suffix:

```json
{
  "valueString": "hello",
  "valueQuantity": { "value": 42, "unit": "kg" }
}
```

This means a TypeScript interface cannot simply declare `value?: SomeUnionType` — the **property name itself varies** depending on the chosen type.

### Affected Elements in Our Model

Choice type `[x]` fields appear in the following interfaces:

| Interface | Field | FHIR Spec | Possible Types |
|-----------|-------|-----------|----------------|
| `Extension` | `value[x]` | Extension.value | All FHIR types (~50) |
| `UsageContext` | `value[x]` | UsageContext.value | CodeableConcept, Quantity, Range, Reference |
| `ElementDefinition` | `defaultValue[x]` | ElementDefinition.defaultValue | All FHIR types (~50) |
| `ElementDefinition` | `fixed[x]` | ElementDefinition.fixed | All FHIR types (~50) |
| `ElementDefinition` | `pattern[x]` | ElementDefinition.pattern | All FHIR types (~50) |
| `ElementDefinition` | `minValue[x]` | ElementDefinition.minValue | date, dateTime, instant, time, decimal, integer, positiveInt, unsignedInt, Quantity |
| `ElementDefinition` | `maxValue[x]` | ElementDefinition.maxValue | (same as minValue) |
| `ElementDefinitionExample` | `value[x]` | ElementDefinition.example.value | All FHIR types (~50) |

**Total: 8 choice type fields across 3 source files.**

### Options Evaluated

#### Option A: Discriminated Union with Explicit Properties

```typescript
interface ElementDefinition {
  defaultValueString?: FhirString;
  defaultValueBoolean?: FhirBoolean;
  defaultValueQuantity?: Quantity;
  // ... ~50 more properties per choice field
}
```

- **Pro:** Fully type-safe at compile time
- **Con:** Massive interface bloat (~400 extra properties for ElementDefinition alone)
- **Con:** No compile-time enforcement that only one variant is set
- **Con:** Every consumer must check all variants

#### Option B: Tagged Union Type

```typescript
type ChoiceValue =
  | { type: 'string'; value: FhirString }
  | { type: 'boolean'; value: FhirBoolean }
  | { type: 'Quantity'; value: Quantity };

interface ElementDefinition {
  defaultValue?: ChoiceValue;
}
```

- **Pro:** Clean discriminated union with exhaustive checking
- **Con:** Does not match FHIR JSON wire format — requires transformation layer
- **Con:** Breaks round-trip fidelity (JSON → model → JSON)

#### Option C: `unknown` with Parser-Phase Resolution

```typescript
interface ElementDefinition {
  /** Choice type [x] — Stage-1: unknown; resolved by fhir-parser in Phase 2 */
  defaultValue?: unknown;
}
```

- **Pro:** Zero bloat, minimal complexity in Phase 1
- **Pro:** Defers type resolution to the parser where JSON property names are known
- **Pro:** Does not commit to a representation that may need changing
- **Con:** No compile-time type safety for choice fields until Phase 2

#### Option D: Generic Wrapper Type

```typescript
interface ChoiceType<T extends Record<string, unknown>> {
  readonly __choiceType: true;
  readonly typeName: keyof T;
  readonly value: T[keyof T];
}
```

- **Pro:** Type-safe with generic constraints
- **Con:** Runtime wrapper adds complexity
- **Con:** Still requires parser to populate the wrapper

---

## Decision

We adopt a **phased approach** combining Option C (Phase 1) and a refined Option B or D (Phase 2):

### Phase 1 (Current): `unknown` with JSDoc Documentation

All choice type `[x]` fields are typed as `unknown` with comprehensive JSDoc that documents:
1. That the field is a choice type
2. The actual JSON property name pattern (e.g., `defaultValueString`, `defaultValueBoolean`)
3. The allowed FHIR types
4. That `fhir-parser` will handle concrete dispatch in Phase 2

**Example (current code):**

```typescript
/**
 * Specified value if missing from instance (0..1)
 *
 * Choice type [x] — the actual JSON property will be
 * `defaultValueString`, `defaultValueBoolean`, etc.
 * Can be any FHIR data type.
 *
 * Stage-1: represented as `unknown`; fhir-parser will handle
 * concrete dispatch in Phase 2.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.defaultValue_x_
 */
defaultValue?: unknown;
```

### Phase 2 (Future): Parser-Resolved Choice Types

When `fhir-parser` is implemented, choice types will be resolved during JSON parsing. The parser will:

1. Detect choice type property names (e.g., `valueString`, `defaultValueQuantity`)
2. Extract the type suffix and the value
3. Populate the model field with a typed representation

The exact Phase 2 representation will be decided in a follow-up ADR after parser prototyping. Candidate approaches:

- **Tagged union** (Option B) if round-trip fidelity can be maintained
- **Generic wrapper** (Option D) if type safety across all ~50 types is critical
- **Hybrid** where common choice types (Extension.value, Observation.value) get explicit unions and rare ones remain `unknown`

### Design Constraints for Phase 2

1. **Round-trip fidelity**: `parse(serialize(resource))` must produce an equivalent resource
2. **Property name preservation**: The original JSON property name (e.g., `valueString`) must be recoverable for serialization
3. **Type narrowing**: Consumers should be able to narrow the choice type without `as` casts
4. **Backward compatibility**: The Phase 2 representation should be a refinement of `unknown` (i.e., existing code that handles `unknown` should still compile)

---

## Consequences

### Positive

1. **Phase 1 stays simple**: No premature type complexity in the model layer
2. **No wasted work**: We don't build a choice type system that may need redesigning after parser experience
3. **Clear documentation**: Every `unknown` field has JSDoc explaining what it represents
4. **Compilation clean**: No type errors from incomplete union types
5. **Deferred commitment**: Phase 2 can choose the optimal representation based on real parser requirements

### Negative

1. **No compile-time safety for choice fields in Phase 1**: Consumers of the model types cannot get type checking on choice type values until Phase 2
2. **JSDoc is the only contract**: The allowed types for each choice field are documented but not enforced by the compiler
3. **Phase 2 migration**: When the `unknown` fields are refined to concrete types, downstream code may need updates

### Mitigation

1. **Phase 1 is types-only**: No runtime code consumes choice type fields yet, so the lack of type safety has zero practical impact
2. **Parser is the gatekeeper**: All choice type values enter the system through `fhir-parser`, which will enforce type correctness at the boundary
3. **Incremental refinement**: Phase 2 can refine one choice field at a time, starting with the most commonly used ones (Extension.value, Observation.value[x])

---

## References

- [FHIR R4 Choice Types](https://hl7.org/fhir/R4/formats.html#choice) — Specification for choice type serialization
- [ElementDefinition](https://hl7.org/fhir/R4/elementdefinition.html) — Primary consumer of choice types in metadata
- [Extension](https://hl7.org/fhir/R4/extensibility.html#Extension) — Most common choice type usage
- [Phase-1-Detailed-Plan.md](../stages/Phase-1-Detailed-Plan.md) — Phase 1 plan specifying `unknown` for choice types
- [ADR-001](./ADR-001-HAPI-Inspired-Architecture.md) — HAPI-inspired architecture (HAPI uses `IBase` interface for choice types)
- [ADR-002](./ADR-002-Single-Package-fhir-core.md) — Single package structure

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial decision — Phase 1 uses `unknown`, Phase 2 deferred | Architecture Team |
