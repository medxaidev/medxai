/**
 * `@medxai/fhir-core` — Public API
 *
 * Re-exports all public types from the model layer.
 * Additional modules (parser, profile, validator, context) will be
 * added here as they are implemented in later phases.
 *
 * @packageDocumentation
 */

/**
 * Brand symbol used to distinguish FHIR primitive types at compile time.
 * This provides nominal typing over TypeScript's structural type system,
 * preventing accidental assignment between semantically different types
 * (e.g., assigning a FhirUri to a FhirCode) while maintaining zero runtime overhead.
 */
declare const __brand: unique symbol;

/**
 * How resource references can be aggregated.
 * @see https://hl7.org/fhir/R4/valueset-resource-aggregation-mode.html
 */
export declare type AggregationMode = 'contained' | 'referenced' | 'bundled';

/**
 * Base definition for all elements that are defined inside a resource,
 * but not those in a data type.
 * @see https://hl7.org/fhir/R4/backboneelement.html
 */
export declare interface BackboneElement extends Element {
    /** Extensions that cannot be ignored even if unrecognized (0..*) */
    modifierExtension?: Extension[];
}

/**
 * A resolved value set binding on a canonical element.
 *
 * Corresponds to a simplified version of `ElementDefinition.binding`.
 */
export declare interface BindingConstraint {
    /**
     * required | extensible | preferred | example
     *
     * Indicates the degree of conformance expectation.
     * @see https://hl7.org/fhir/R4/valueset-binding-strength.html
     */
    strength: BindingStrength;
    /**
     * Canonical URL of the bound value set.
     *
     * Resolved from `ElementDefinitionBinding.valueSet`.
     */
    valueSetUrl?: string;
    /** Human-readable description of the binding. */
    description?: string;
}

/**
 * Indication of the degree of conformance expectations associated with a binding.
 * @see https://hl7.org/fhir/R4/valueset-binding-strength.html
 */
export declare type BindingStrength = 'required' | 'extensible' | 'preferred' | 'example';

/**
 * Generic branded type. Intersects a base type with a unique brand tag.
 * @typeParam Base - The underlying TypeScript type (string, number, boolean)
 * @typeParam Brand - A unique string literal identifying the FHIR type
 */
declare type Branded<Base, Brand extends string> = Base & {
    readonly [__brand]: Brand;
};

/**
 * A single resolved element within a CanonicalProfile.
 *
 * This is the internal, pre-resolved representation of an
 * `ElementDefinition` from a StructureDefinition snapshot.
 * All values are resolved and normalized for efficient downstream use.
 *
 * ## Key differences from ElementDefinition
 *
 * | Aspect | ElementDefinition (FHIR) | CanonicalElement (internal) |
 * |--------|--------------------------|----------------------------|
 * | `max` | `string` (`"1"`, `"*"`) | `number \| 'unbounded'` |
 * | `mustSupport` | `boolean \| undefined` | `boolean` (always present) |
 * | `isModifier` | `boolean \| undefined` | `boolean` (always present) |
 * | `isSummary` | `boolean \| undefined` | `boolean` (always present) |
 * | `constraints` | `array \| undefined` | `array` (always present, may be empty) |
 * | `types` | `array \| undefined` | `array` (always present, may be empty) |
 */
export declare interface CanonicalElement {
    /** Element path (e.g., `Patient.name.given`). */
    path: string;
    /**
     * Element id (e.g., `Patient.name.given`).
     *
     * In most cases identical to `path`, but may differ for sliced elements
     * (e.g., `Patient.identifier:MRN`).
     */
    id: string;
    /**
     * Minimum cardinality.
     *
     * Resolved from `ElementDefinition.min`. Always a non-negative integer.
     */
    min: number;
    /**
     * Maximum cardinality.
     *
     * **Design decision:** Uses `number | 'unbounded'` instead of FHIR's
     * `string` representation. The `"*"` from FHIR is converted to
     * `'unbounded'` during snapshot resolution, eliminating the need for
     * downstream code to repeatedly parse the string.
     */
    max: number | 'unbounded';
    /**
     * Allowed types for this element.
     *
     * Always an array (possibly empty). Empty means the element is a
     * backbone element whose children define its structure.
     */
    types: TypeConstraint[];
    /**
     * Value set binding, if this element is coded.
     */
    binding?: BindingConstraint;
    /**
     * Formal constraints (invariants) on this element.
     *
     * **Design decision:** Always an array (possibly empty), never
     * `undefined`. This simplifies downstream iteration — no need to
     * check for `undefined` before looping.
     */
    constraints: Invariant[];
    /**
     * Slicing definition, if this element is a slicing root.
     */
    slicing?: SlicingDefinition;
    /**
     * Whether implementations must meaningfully support this element.
     *
     * **Design decision:** Always `boolean`, never `undefined`.
     * Defaults to `false` during snapshot resolution.
     */
    mustSupport: boolean;
    /**
     * Whether this element can modify the meaning of other elements.
     *
     * **Design decision:** Always `boolean`, never `undefined`.
     * Defaults to `false` during snapshot resolution.
     */
    isModifier: boolean;
    /**
     * Whether this element is included in summary views.
     *
     * **Design decision:** Always `boolean`, never `undefined`.
     * Defaults to `false` during snapshot resolution.
     */
    isSummary: boolean;
}

/**
 * The internal, resolved representation of a FHIR StructureDefinition.
 *
 * A CanonicalProfile is produced by the snapshot generation algorithm
 * (fhir-profile module) from a StructureDefinition. It flattens the
 * inheritance chain and resolves all element constraints into a single,
 * self-contained structure optimized for validation and runtime use.
 *
 * ## Usage
 *
 * ```typescript
 * // Produced by fhir-profile (Phase 4):
 * const profile: CanonicalProfile = snapshotGenerator.generate(structureDef);
 *
 * // O(1) element lookup:
 * const nameElement = profile.elements.get('Patient.name');
 *
 * // Iteration in definition order (Map preserves insertion order):
 * for (const [path, element] of profile.elements) { ... }
 * ```
 *
 * ## Design note on `elements` ordering
 *
 * JavaScript `Map` preserves insertion order (ES2015+). The fhir-profile
 * module MUST insert elements in the same order as the snapshot element
 * array, so that iteration over `elements` yields elements in definition
 * order. This is important for rendering and for algorithms that depend
 * on element ordering (e.g., slicing evaluation).
 */
export declare interface CanonicalProfile {
    /**
     * Canonical URL of this profile.
     *
     * Corresponds to `StructureDefinition.url`.
     */
    url: string;
    /**
     * Business version of this profile.
     *
     * Corresponds to `StructureDefinition.version`.
     */
    version?: string;
    /**
     * Computer-readable name.
     *
     * Corresponds to `StructureDefinition.name`.
     */
    name: string;
    /**
     * The kind of structure: primitive-type | complex-type | resource | logical.
     *
     * Corresponds to `StructureDefinition.kind`.
     */
    kind: StructureDefinitionKind;
    /**
     * The type defined or constrained (e.g., `Patient`, `Observation`).
     *
     * Corresponds to `StructureDefinition.type`.
     */
    type: string;
    /**
     * Canonical URL of the base profile, if any.
     *
     * Corresponds to `StructureDefinition.baseDefinition`.
     */
    baseProfile?: string;
    /**
     * Whether this type is abstract.
     *
     * Corresponds to `StructureDefinition.abstract`.
     */
    abstract: boolean;
    /**
     * specialization | constraint
     *
     * Corresponds to `StructureDefinition.derivation`.
     */
    derivation?: TypeDerivationRule;
    /**
     * All resolved elements, keyed by element path.
     *
     * **Design decision:** Uses `Map<string, CanonicalElement>` instead of
     * an array for O(1) path lookup. `Map` preserves insertion order
     * (ES2015+), so iteration yields elements in definition order matching
     * the original snapshot element array.
     *
     * The fhir-profile module is responsible for populating this Map in
     * the correct order during snapshot generation.
     */
    elements: Map<string, CanonicalElement>;
}

/**
 * A concept that may be defined by a formal reference to a terminology
 * or ontology, or may be provided by text.
 * @see https://hl7.org/fhir/R4/datatypes.html#CodeableConcept
 */
export declare interface CodeableConcept extends Element {
    /** Code defined by a terminology system (0..*) */
    coding?: Coding[];
    /** Plain text representation of the concept (0..1) */
    text?: FhirString;
}

/**
 * A reference to a code defined by a terminology system.
 * @see https://hl7.org/fhir/R4/datatypes.html#Coding
 */
export declare interface Coding extends Element {
    /** Identity of the terminology system (0..1) */
    system?: FhirUri;
    /** Version of the system (0..1) */
    version?: FhirString;
    /** Symbol in syntax defined by the system (0..1) */
    code?: FhirCode;
    /** Representation defined by the system (0..1) */
    display?: FhirString;
    /** If this coding was chosen directly by the user (0..1) */
    userSelected?: FhirBoolean;
}

/**
 * The severity of a constraint violation.
 * @see https://hl7.org/fhir/R4/valueset-constraint-severity.html
 */
export declare type ConstraintSeverity = 'error' | 'warning';

/**
 * Contact information for a person or organization.
 * @see https://hl7.org/fhir/R4/metadatatypes.html#ContactDetail
 */
export declare interface ContactDetail extends Element {
    /** Name of an individual to contact (0..1) */
    name?: FhirString;
    /** Contact details for individual or organization (0..*) */
    telecom?: ContactPoint[];
}

/**
 * Details for all kinds of technology-mediated contact points.
 * @see https://hl7.org/fhir/R4/datatypes.html#ContactPoint
 */
export declare interface ContactPoint extends Element {
    /** phone | fax | email | pager | url | sms | other (0..1) */
    system?: FhirCode;
    /** The actual contact point details (0..1) */
    value?: FhirString;
    /** home | work | temp | old | mobile (0..1) */
    use?: FhirCode;
    /** Specify preferred order of use (0..1) */
    rank?: FhirPositiveInt;
    /** Time period when the contact point was/is in use (0..1) */
    period?: Period;
}

/**
 * How an element value is interpreted when discrimination is evaluated.
 * @see https://hl7.org/fhir/R4/valueset-discriminator-type.html
 */
export declare type DiscriminatorType = 'value' | 'exists' | 'pattern' | 'type' | 'profile';

/**
 * A resource that includes narrative, extensions, and contained resources.
 * Most FHIR resources inherit from DomainResource.
 * @see https://hl7.org/fhir/R4/domainresource.html
 */
export declare interface DomainResource extends Resource {
    /** Text summary of the resource, for human interpretation (0..1) */
    text?: Narrative;
    /** Contained, inline Resources (0..*) */
    contained?: Resource[];
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Extensions that cannot be ignored (0..*) */
    modifierExtension?: Extension[];
}

/**
 * Base definition for all elements in a resource.
 * Every element in FHIR inherits from Element.
 * @see https://hl7.org/fhir/R4/element.html
 */
export declare interface Element {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
}

/**
 * Captures constraints on each element within a resource, data type,
 * or extension.
 *
 * ElementDefinition is the most complex data type in FHIR. Each instance
 * describes a single element path (e.g., `Patient.name`, `Patient.name.given`)
 * and carries all constraint information: cardinality, types, bindings,
 * invariants, slicing, flags, and documentation.
 *
 * ElementDefinition appears in:
 * - `StructureDefinition.snapshot.element` (complete, flattened)
 * - `StructureDefinition.differential.element` (delta only)
 *
 * This interface extends BackboneElement (has `id`, `extension`,
 * `modifierExtension`).
 *
 * @see https://hl7.org/fhir/R4/elementdefinition.html
 */
export declare interface ElementDefinition extends BackboneElement {
    /**
     * Path of the element in the hierarchy of elements (1..1)
     *
     * The path is dot-separated, e.g., `Patient.name.given`.
     * The first element in a snapshot always has a path equal to the
     * resource/type name (e.g., `Patient`).
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.path
     */
    path: FhirString;
    /**
     * How this element is represented in instances (0..*)
     *
     * Controls serialization format (mainly relevant for XML).
     * @see https://hl7.org/fhir/R4/valueset-property-representation.html
     */
    representation?: PropertyRepresentation[];
    /**
     * Name for this particular element (in a set of slices) (0..1)
     *
     * Unique within the context of the containing element. Used to
     * identify slices in a slicing definition.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.sliceName
     */
    sliceName?: FhirString;
    /**
     * If this slice definition constrains an inherited slice definition
     * (or not) (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.sliceIsConstraining
     */
    sliceIsConstraining?: FhirBoolean;
    /**
     * Name for element to display with or prompt for element (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.label
     */
    label?: FhirString;
    /**
     * Corresponding codes in terminologies (0..*)
     *
     * Codes that define the meaning of this element, e.g., LOINC or
     * SNOMED CT codes. Used for mapping and search.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.code
     */
    code?: Coding[];
    /**
     * This element is sliced — slices follow (0..1)
     *
     * Defines how this element can be divided into a set of slices.
     * Only appears on the "slicing root" element; individual slices
     * are identified by `sliceName`.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.slicing
     */
    slicing?: ElementDefinitionSlicing;
    /**
     * Concise definition for space-constrained presentations (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.short
     */
    short?: FhirString;
    /**
     * Full formal definition of the element (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.definition
     */
    definition?: FhirMarkdown;
    /**
     * Comments about the use of this element (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.comment
     */
    comment?: FhirMarkdown;
    /**
     * Why this resource has been created (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.requirements
     */
    requirements?: FhirMarkdown;
    /**
     * Other names (0..*)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.alias
     */
    alias?: FhirString[];
    /**
     * Minimum cardinality (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.min
     */
    min?: FhirUnsignedInt;
    /**
     * Maximum cardinality (number or "*") (0..1)
     *
     * A string value: either a non-negative integer or `"*"` for unbounded.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.max
     */
    max?: FhirString;
    /**
     * Base definition information for tools (0..1)
     *
     * Records the cardinality and path from the base StructureDefinition,
     * so tools can show what has changed in a derived profile without
     * needing to trace the full inheritance chain.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.base
     */
    base?: ElementDefinitionBase;
    /**
     * Reference to definition of content for the element (0..1)
     *
     * A URI that points to another element within the same
     * StructureDefinition, in the form `#<elementId>`. Indicates that
     * this element has the same meaning and constraints as the
     * referenced element.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.contentReference
     */
    contentReference?: FhirUri;
    /**
     * Data type and profile for this element (0..*)
     *
     * Defines the allowed types for this element. Multiple entries
     * indicate a choice type (e.g., value[x] can be valueString,
     * valueInteger, etc.).
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.type
     */
    type?: ElementDefinitionType[];
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
    /**
     * Implicit meaning when this element is missing (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.meaningWhenMissing
     */
    meaningWhenMissing?: FhirMarkdown;
    /**
     * What the order of the elements means (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.orderMeaning
     */
    orderMeaning?: FhirString;
    /**
     * Value must be exactly this (0..1)
     *
     * Choice type [x] — `fixedString`, `fixedCoding`, etc.
     * If present, the element value in instances MUST match exactly.
     *
     * Stage-1: represented as `unknown`; fhir-parser will handle
     * concrete dispatch in Phase 2.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.fixed_x_
     */
    fixed?: unknown;
    /**
     * Value must have at least these property values (0..1)
     *
     * Choice type [x] — `patternCodeableConcept`, `patternString`, etc.
     * More lenient than `fixed`: the instance value must contain at least
     * the properties and values specified by the pattern.
     *
     * Stage-1: represented as `unknown`; fhir-parser will handle
     * concrete dispatch in Phase 2.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.pattern_x_
     */
    pattern?: unknown;
    /**
     * Example value (as defined for type) (0..*)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.example
     */
    example?: ElementDefinitionExample[];
    /**
     * Minimum allowed value (for some types) (0..1)
     *
     * Choice type [x] — `minValueDate`, `minValueInteger`, etc.
     * Only applicable to: date, dateTime, instant, time, decimal,
     * integer, positiveInt, unsignedInt, Quantity.
     *
     * Stage-1: represented as `unknown`; fhir-parser will handle
     * concrete dispatch in Phase 2.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.minValue_x_
     */
    minValue?: unknown;
    /**
     * Maximum allowed value (for some types) (0..1)
     *
     * Choice type [x] — `maxValueDate`, `maxValueInteger`, etc.
     * Same type restrictions as `minValue`.
     *
     * Stage-1: represented as `unknown`; fhir-parser will handle
     * concrete dispatch in Phase 2.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.maxValue_x_
     */
    maxValue?: unknown;
    /**
     * Max length for strings (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.maxLength
     */
    maxLength?: FhirInteger;
    /**
     * Reference to invariant about presence (0..*)
     *
     * A list of constraint keys (`ElementDefinitionConstraint.key`) that
     * are conditions on this element. When a constraint evaluates to false,
     * the element is not valid.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.condition
     */
    condition?: FhirId[];
    /**
     * Condition that must evaluate to true (0..*)
     *
     * Formal constraints (invariants) that must be met for the element
     * to be valid. Expressed as FHIRPath expressions.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.constraint
     */
    constraint?: ElementDefinitionConstraint[];
    /**
     * If the element must be supported (0..1)
     *
     * When `true`, implementations claiming conformance to this profile
     * MUST "meaningfully support" this element. The exact meaning of
     * mustSupport is defined per implementation guide.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.mustSupport
     */
    mustSupport?: FhirBoolean;
    /**
     * If this modifies the meaning of other elements (0..1)
     *
     * Modifier elements can change the interpretation of the containing
     * resource or element. Implementations MUST understand modifier elements.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isModifier
     */
    isModifier?: FhirBoolean;
    /**
     * Reason that this element is marked as a modifier (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isModifierReason
     */
    isModifierReason?: FhirString;
    /**
     * Include when _summary = true? (0..1)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary
     */
    isSummary?: FhirBoolean;
    /**
     * ValueSet details if this is coded (0..1)
     *
     * Binds this element to a specific value set. The `strength`
     * determines how strictly the binding applies.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.binding
     */
    binding?: ElementDefinitionBinding;
    /**
     * Map element to another set of definitions (0..*)
     *
     * Identifies a concept from an external specification (e.g., v2,
     * CDA, or a custom mapping) that corresponds to this element.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.mapping
     */
    mapping?: ElementDefinitionMapping[];
}

/**
 * Information about the base definition of the element, provided to
 * make it unnecessary for tools to trace the deviation of the element
 * through the derived and related profiles.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.base
 */
export declare interface ElementDefinitionBase {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Path that identifies the base element (1..1) */
    path: FhirString;
    /** Min cardinality of the base element (1..1) */
    min: FhirUnsignedInt;
    /**
     * Max cardinality of the base element (1..1)
     *
     * A string value, either a number or "*" for unbounded.
     */
    max: FhirString;
}

/**
 * Binds an element to a specific value set, indicating the degree of
 * conformance expectation.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.binding
 */
export declare interface ElementDefinitionBinding {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * required | extensible | preferred | example (1..1)
     *
     * Indicates the degree of conformance expectations associated with
     * this binding. Only `required` means mandatory in FHIR.
     * @see https://hl7.org/fhir/R4/valueset-binding-strength.html
     */
    strength: BindingStrength;
    /** Human explanation of the value set (0..1) */
    description?: FhirString;
    /**
     * Source of value set (0..1)
     *
     * Canonical URL reference to the value set bound to this element.
     */
    valueSet?: FhirCanonical;
}

/**
 * Formal constraints (invariants) on the element that must be satisfied
 * for the element to be valid.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.constraint
 */
export declare interface ElementDefinitionConstraint {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * Target of 'condition' reference (1..1)
     *
     * Unique identifier for the constraint, used by `condition` fields
     * to reference which constraints apply.
     */
    key: FhirId;
    /** Why this constraint is necessary or appropriate (0..1) */
    requirements?: FhirString;
    /**
     * error | warning (1..1)
     * @see https://hl7.org/fhir/R4/valueset-constraint-severity.html
     */
    severity: ConstraintSeverity;
    /** Human description of constraint (1..1) */
    human: FhirString;
    /**
     * FHIRPath expression of constraint (0..1)
     *
     * A FHIRPath expression that must evaluate to `true` when
     * tested against the element and its children.
     */
    expression?: FhirString;
    /**
     * XPath expression of constraint (0..1)
     *
     * Deprecated in favor of `expression` (FHIRPath), but retained
     * for backward compatibility with older profiles.
     */
    xpath?: FhirString;
    /**
     * Reference to original source of constraint (0..1)
     *
     * Canonical URL of the StructureDefinition where this constraint
     * was originally defined.
     */
    source?: FhirCanonical;
}

/**
 * A sample value for the element, providing an example for implementers.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.example
 */
export declare interface ElementDefinitionExample {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Describes the purpose of this example (1..1) */
    label: FhirString;
    /**
     * Value of Example (1..1)
     *
     * Choice type [x] — the actual property name in JSON will be
     * `valueString`, `valueBoolean`, `valueCoding`, etc.
     * Can be any FHIR data type.
     *
     * Stage-1: represented as `unknown`; fhir-parser will handle
     * concrete dispatch in Phase 2.
     */
    value: unknown;
}

/**
 * Identifies a concept from an external specification that roughly
 * corresponds to this element.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.mapping
 */
export declare interface ElementDefinitionMapping {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * Reference to mapping declaration (1..1)
     *
     * An internal reference to the StructureDefinition.mapping.identity
     * that this element mapping refers to.
     */
    identity: FhirId;
    /** Computable language of mapping (0..1) */
    language?: FhirCode;
    /** Details of the mapping (1..1) */
    map: FhirString;
    /** Comments about the mapping (0..1) */
    comment?: FhirString;
}

/**
 * How an element is sliced — defines the discriminator(s) and rules
 * for matching slices in an instance.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.slicing
 */
export declare interface ElementDefinitionSlicing {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * Element values that are used to distinguish the slices (0..*)
     *
     * Each discriminator specifies a path and a type that together
     * identify which slice a given element instance belongs to.
     */
    discriminator?: SlicingDiscriminator[];
    /** Text description of how slicing works (or in profile determine how slicing is used) (0..1) */
    description?: FhirString;
    /** If elements must be in same order as slices (0..1) */
    ordered?: FhirBoolean;
    /**
     * closed | open | openAtEnd (1..1)
     *
     * - `closed`: no additional content allowed beyond the defined slices
     * - `open`: additional content allowed anywhere
     * - `openAtEnd`: additional content allowed, but only at the end
     * @see https://hl7.org/fhir/R4/valueset-resource-slicing-rules.html
     */
    rules: SlicingRules;
}

/**
 * The data type or resource that is a permitted type for the element.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.type
 */
export declare interface ElementDefinitionType {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * Data type or Resource (name) (1..1)
     *
     * The URI of the data type or resource, e.g., `http://hl7.org/fhirpath/System.String`
     * for primitives or a simple name like `string`, `Patient`, `Reference`.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.type.code
     */
    code: FhirUri;
    /**
     * Profiles (StructureDefinition or IG) — one of which this type must
     * conform to (0..*)
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.type.profile
     */
    profile?: FhirCanonical[];
    /**
     * Profile (StructureDefinition or IG) on the Reference target —
     * one of which the reference must conform to (0..*)
     *
     * Only meaningful when `code` is `Reference` or `canonical`.
     * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.type.targetProfile
     */
    targetProfile?: FhirCanonical[];
    /**
     * contained | referenced | bundled (0..*)
     *
     * How resource references are aggregated. Only meaningful when
     * `code` is `Reference`.
     * @see https://hl7.org/fhir/R4/valueset-resource-aggregation-mode.html
     */
    aggregation?: AggregationMode[];
    /**
     * either | independent | specific (0..1)
     *
     * Whether references need to be version-specific.
     * @see https://hl7.org/fhir/R4/valueset-reference-version-rules.html
     */
    versioning?: ReferenceVersionRules;
}

/**
 * An Extension: additional information that is not part of the basic
 * definition of the resource.
 * @see https://hl7.org/fhir/R4/extensibility.html#Extension
 */
export declare interface Extension extends Element {
    /** Identifies the meaning of the extension (1..1) */
    url: FhirUri;
    /**
     * Value of extension.
     * This is a choice type [x] — the actual property name in JSON will be
     * `valueString`, `valueCode`, `valueBoolean`, etc.
     * Stage-1: represented as unknown; fhir-parser will handle concrete dispatch.
     */
    value?: unknown;
}

/**
 * The context type for an extension definition.
 * @see https://hl7.org/fhir/R4/valueset-extension-context-type.html
 */
export declare type ExtensionContextType = 'fhirpath' | 'element' | 'extension';

/**
 * FHIR base64Binary: base64 encoded content (RFC 4648).
 * Regex: `(\s*([0-9a-zA-Z\+\/\=]){4}\s*)+`
 * @see https://hl7.org/fhir/R4/datatypes.html#base64Binary
 */
export declare type FhirBase64Binary = Branded<string, 'FhirBase64Binary'>;

/**
 * FHIR boolean: true | false
 * @see https://hl7.org/fhir/R4/datatypes.html#boolean
 */
export declare type FhirBoolean = boolean;

/**
 * FHIR canonical: a URI that refers to a resource by its canonical URL,
 * optionally with a version suffix `|version`.
 * @see https://hl7.org/fhir/R4/datatypes.html#canonical
 */
export declare type FhirCanonical = Branded<string, 'FhirCanonical'>;

/**
 * FHIR code: a string that is constrained to the set of allowed values
 * from a controlled vocabulary (value set).
 * Regex: `[^\s]+(\s[^\s]+)*`
 * @see https://hl7.org/fhir/R4/datatypes.html#code
 */
export declare type FhirCode = Branded<string, 'FhirCode'>;

/**
 * FHIR date: a date or partial date (year, year-month, or year-month-day).
 * No timezone. No time.
 * Format: `YYYY(-MM(-DD)?)?`
 * Regex: `([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?`
 * @see https://hl7.org/fhir/R4/datatypes.html#date
 */
export declare type FhirDate = Branded<string, 'FhirDate'>;

/**
 * FHIR dateTime: a date, date-time, or partial date with optional time and timezone.
 * Format: `YYYY(-MM(-DD(Thh:mm:ss(.sss)?(Z|(+|-)hh:mm))?)?)?`
 * @see https://hl7.org/fhir/R4/datatypes.html#dateTime
 */
export declare type FhirDateTime = Branded<string, 'FhirDateTime'>;

/**
 * FHIR decimal: rational numbers with implicit precision.
 * Regex: `-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?`
 * Note: precision of the decimal value has significance
 * (e.g., 0.010 is regarded as different to 0.01).
 * @see https://hl7.org/fhir/R4/datatypes.html#decimal
 */
export declare type FhirDecimal = Branded<number, 'FhirDecimal'>;

/**
 * FHIR id: any combination of upper- or lower-case ASCII letters,
 * numerals, '-', and '.', with a length limit of 64 characters.
 * Regex: `[A-Za-z0-9\-\.]{1,64}`
 * @see https://hl7.org/fhir/R4/datatypes.html#id
 */
export declare type FhirId = Branded<string, 'FhirId'>;

/**
 * FHIR instant: an instant in time with at least second precision
 * and always includes a timezone.
 * Format: `YYYY-MM-DDThh:mm:ss.sss+zz:zz`
 * Regex: `([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))`
 * @see https://hl7.org/fhir/R4/datatypes.html#instant
 */
export declare type FhirInstant = Branded<string, 'FhirInstant'>;

/**
 * FHIR integer: whole numbers in the range -2,147,483,648..2,147,483,647
 * Regex: `[0]|[-+]?[1-9][0-9]*`
 * @see https://hl7.org/fhir/R4/datatypes.html#integer
 */
export declare type FhirInteger = Branded<number, 'FhirInteger'>;

/**
 * FHIR markdown: a FHIR string that may contain markdown syntax.
 * Systems are not required to have markdown support.
 * @see https://hl7.org/fhir/R4/datatypes.html#markdown
 */
export declare type FhirMarkdown = Branded<string, 'FhirMarkdown'>;

/**
 * FHIR oid: an OID represented as a URI (RFC 3001).
 * Format: `urn:oid:[0-2](\.(0|[1-9][0-9]*))+`
 * @see https://hl7.org/fhir/R4/datatypes.html#oid
 */
export declare type FhirOid = Branded<string, 'FhirOid'>;

/**
 * FHIR positiveInt: positive integer in the range 1..2,147,483,647.
 * Regex: `+?[1-9][0-9]*`
 * @see https://hl7.org/fhir/R4/datatypes.html#positiveInt
 */
export declare type FhirPositiveInt = Branded<number, 'FhirPositiveInt'>;

/**
 * FHIR string: a sequence of Unicode characters.
 * Regex: `[ \r\n\t\S]+`
 * Note: strings SHOULD not contain Unicode character points below 32,
 * except for horizontal tab, carriage return, and line feed.
 * @see https://hl7.org/fhir/R4/datatypes.html#string
 */
export declare type FhirString = Branded<string, 'FhirString'>;

/**
 * FHIR time: a time of day with no date and no timezone.
 * Format: `hh:mm:ss(.sss)?`
 * Regex: `([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?`
 * @see https://hl7.org/fhir/R4/datatypes.html#time
 */
export declare type FhirTime = Branded<string, 'FhirTime'>;

/**
 * FHIR unsignedInt: non-negative integer in the range 0..2,147,483,647.
 * Regex: `[0]|([1-9][0-9]*)`
 * @see https://hl7.org/fhir/R4/datatypes.html#unsignedInt
 */
export declare type FhirUnsignedInt = Branded<number, 'FhirUnsignedInt'>;

/**
 * FHIR uri: a Uniform Resource Identifier.
 * Regex: `\S*`
 * @see https://hl7.org/fhir/R4/datatypes.html#uri
 */
export declare type FhirUri = Branded<string, 'FhirUri'>;

/**
 * FHIR url: a Uniform Resource Locator (a subset of uri).
 * Must start with http:, https:, ftp:, mailto:, or mllp:.
 * @see https://hl7.org/fhir/R4/datatypes.html#url
 */
export declare type FhirUrl = Branded<string, 'FhirUrl'>;

/**
 * FHIR uuid: a UUID expressed as a URI (RFC 4122).
 * Format: `urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
 * @see https://hl7.org/fhir/R4/datatypes.html#uuid
 */
export declare type FhirUuid = Branded<string, 'FhirUuid'>;

/**
 * FHIR version identifier.
 * @see https://hl7.org/fhir/R4/valueset-FHIR-version.html
 */
export declare type FhirVersionCode = '0.01' | '0.05' | '0.06' | '0.11' | '0.0.80' | '0.0.81' | '0.0.82' | '0.4.0' | '0.5.0' | '1.0.0' | '1.0.1' | '1.0.2' | '1.1.0' | '1.4.0' | '1.6.0' | '1.8.0' | '3.0.0' | '3.0.1' | '3.0.2' | '3.3.0' | '3.5.0' | '4.0.0' | '4.0.1';

/**
 * FHIR xhtml: limited XHTML content as defined in the Narrative datatype.
 * @see https://hl7.org/fhir/R4/datatypes.html#xhtml
 * @see https://hl7.org/fhir/R4/narrative.html
 */
export declare type FhirXhtml = Branded<string, 'FhirXhtml'>;

/**
 * An identifier intended for computation (e.g., MRN, NPI).
 * @see https://hl7.org/fhir/R4/datatypes.html#Identifier
 */
export declare interface Identifier extends Element {
    /** usual | official | temp | secondary | old (0..1) */
    use?: FhirCode;
    /** Description of identifier (0..1) */
    type?: CodeableConcept;
    /** The namespace for the identifier value (0..1) */
    system?: FhirUri;
    /** The value that is unique (0..1) */
    value?: FhirString;
    /** Time period when id is/was valid for use (0..1) */
    period?: Period;
    /** Organization that issued id (0..1) */
    assigner?: Reference;
}

/**
 * A resolved constraint (invariant) on a canonical element.
 *
 * Corresponds to a simplified version of `ElementDefinition.constraint`.
 */
export declare interface Invariant {
    /** Unique key identifying this constraint. */
    key: string;
    /**
     * error | warning
     * @see https://hl7.org/fhir/R4/valueset-constraint-severity.html
     */
    severity: ConstraintSeverity;
    /** Human-readable description of the constraint. */
    human: string;
    /** FHIRPath expression that must evaluate to `true`. */
    expression?: string;
    /**
     * Canonical URL of the StructureDefinition where this constraint
     * was originally defined.
     */
    source?: string;
}

/**
 * The metadata about a resource. This is content in the resource that is
 * maintained by the infrastructure.
 * @see https://hl7.org/fhir/R4/resource.html#Meta
 */
export declare interface Meta extends Element {
    /** Version specific identifier (0..1) */
    versionId?: FhirId;
    /** When the resource version last changed (0..1) */
    lastUpdated?: FhirInstant;
    /** Identifies where the resource comes from (0..1) */
    source?: FhirUri;
    /** Profiles this resource claims to conform to (0..*) */
    profile?: FhirCanonical[];
    /** Security Labels applied to this resource (0..*) */
    security?: Coding[];
    /** Tags applied to this resource (0..*) */
    tag?: Coding[];
}

/**
 * A human-readable summary of the resource conveying the essential
 * clinical and business information.
 * @see https://hl7.org/fhir/R4/narrative.html#Narrative
 */
export declare interface Narrative extends Element {
    /** generated | extensions | additional | empty (1..1) */
    status: NarrativeStatus;
    /** Limited xhtml content (1..1) */
    div: FhirXhtml;
}

/**
 * The status of a narrative.
 * @see https://hl7.org/fhir/R4/valueset-narrative-status.html
 */
export declare type NarrativeStatus = 'generated' | 'extensions' | 'additional' | 'empty';

/**
 * A time period defined by a start and end date/time.
 * @see https://hl7.org/fhir/R4/datatypes.html#Period
 */
export declare interface Period extends Element {
    /** Starting time with inclusive boundary (0..1) */
    start?: FhirDateTime;
    /** End time with inclusive boundary, if not ongoing (0..1) */
    end?: FhirDateTime;
}

/**
 * How a property is represented when serialized.
 * @see https://hl7.org/fhir/R4/valueset-property-representation.html
 */
export declare type PropertyRepresentation = 'xmlAttr' | 'xmlText' | 'typeAttr' | 'cdaText' | 'xhtml';

/**
 * Publication status of a FHIR conformance resource.
 * @see https://hl7.org/fhir/R4/valueset-publication-status.html
 */
export declare type PublicationStatus = 'draft' | 'active' | 'retired' | 'unknown';

/**
 * A measured amount (or an amount that can potentially be measured).
 * @see https://hl7.org/fhir/R4/datatypes.html#Quantity
 */
export declare interface Quantity extends Element {
    /** Numerical value (with implicit precision) (0..1) */
    value?: FhirDecimal;
    /** `<` | `<=` | `>=` | `>` — how to understand the value (0..1) */
    comparator?: FhirCode;
    /** Unit representation (0..1) */
    unit?: FhirString;
    /** System that defines coded unit form (0..1) */
    system?: FhirUri;
    /** Coded form of the unit (0..1) */
    code?: FhirCode;
}

/**
 * A reference from one resource to another.
 * @see https://hl7.org/fhir/R4/references.html#Reference
 */
export declare interface Reference extends Element {
    /** Literal reference, Relative, internal or absolute URL (0..1) */
    reference?: FhirString;
    /** Type the reference refers to (e.g., "Patient") (0..1) */
    type?: FhirUri;
    /** Logical reference, when literal reference is not known (0..1) */
    identifier?: Identifier;
    /** Text alternative for the resource (0..1) */
    display?: FhirString;
}

/**
 * Whether all resource references need to be version-specific.
 * @see https://hl7.org/fhir/R4/valueset-reference-version-rules.html
 */
export declare type ReferenceVersionRules = 'either' | 'independent' | 'specific';

/**
 * Abstract base for all FHIR resources.
 * @see https://hl7.org/fhir/R4/resource.html
 */
export declare interface Resource {
    /**
     * The type of the resource (1..1)
     *
     * This is typed as `string` rather than `FhirString` because it serves
     * as a discriminator field that concrete resource interfaces narrow to
     * a string literal (e.g., `'StructureDefinition'`, `'Patient'`).
     * Branded types would prevent this narrowing.
     */
    resourceType: string;
    /** Logical id of this artifact (0..1) */
    id?: FhirId;
    /** Metadata about the resource (0..1) */
    meta?: Meta;
    /** A set of rules under which this content was created (0..1) */
    implicitRules?: FhirUri;
    /** Language of the resource content (0..1) */
    language?: FhirCode;
}

/**
 * A resolved slicing definition on a canonical element.
 *
 * Corresponds to a simplified version of `ElementDefinition.slicing`.
 * Unlike the FHIR version, `ordered` is always a boolean (default `false`).
 */
export declare interface SlicingDefinition {
    /** Discriminators used to match slices. */
    discriminators: SlicingDiscriminatorDef[];
    /**
     * closed | open | openAtEnd
     * @see https://hl7.org/fhir/R4/valueset-resource-slicing-rules.html
     */
    rules: SlicingRules;
    /**
     * Whether elements must appear in the same order as slices.
     *
     * Always has a value (default `false`), unlike the FHIR spec where
     * this is optional.
     */
    ordered: boolean;
    /** Human-readable description of the slicing. */
    description?: string;
}

/**
 * Designates a discriminator to differentiate between slices.
 * @see https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.slicing.discriminator
 */
export declare interface SlicingDiscriminator {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /**
     * value | exists | pattern | type | profile (1..1)
     * @see https://hl7.org/fhir/R4/valueset-discriminator-type.html
     */
    type: DiscriminatorType;
    /**
     * Path to element value (1..1)
     *
     * A FHIRPath expression that identifies the element within the
     * resource/type to be used as the discriminator.
     */
    path: FhirString;
}

/**
 * A single discriminator within a slicing definition.
 *
 * Corresponds to `ElementDefinition.slicing.discriminator`.
 */
export declare interface SlicingDiscriminatorDef {
    /**
     * value | exists | pattern | type | profile
     * @see https://hl7.org/fhir/R4/valueset-discriminator-type.html
     */
    type: DiscriminatorType;
    /**
     * FHIRPath expression identifying the discriminating element.
     */
    path: string;
}

/**
 * How slices are interpreted when evaluating an instance.
 * @see https://hl7.org/fhir/R4/valueset-resource-slicing-rules.html
 */
export declare type SlicingRules = 'closed' | 'open' | 'openAtEnd';

/**
 * A definition of a FHIR structure — a resource, data type, or extension.
 *
 * StructureDefinition is the central metadata resource in FHIR. It defines:
 * - The shape of resources and data types (via snapshot/differential)
 * - Profile constraints (via derivation = 'constraint')
 * - Extension definitions (via kind = 'resource', type = 'Extension')
 *
 * This interface extends DomainResource and includes all fields defined
 * in the FHIR R4 specification.
 *
 * @see https://hl7.org/fhir/R4/structuredefinition.html
 */
export declare interface StructureDefinition extends DomainResource {
    /** Resource type discriminator (1..1) */
    resourceType: 'StructureDefinition';
    /**
     * Canonical identifier for this structure definition, represented as a URI
     * (globally unique) (1..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.url
     */
    url: FhirUri;
    /**
     * Additional identifier for the structure definition (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.identifier
     */
    identifier?: Identifier[];
    /**
     * Business version of the structure definition (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.version
     */
    version?: FhirString;
    /**
     * Computer-readable name of the structure definition (1..1)
     *
     * Name should be usable as an identifier for the module by machine
     * processing applications such as code generation.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.name
     */
    name: FhirString;
    /**
     * Human-readable name for the structure definition (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.title
     */
    title?: FhirString;
    /**
     * Publication status: draft | active | retired | unknown (1..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.status
     */
    status: PublicationStatus;
    /**
     * For testing purposes, not real usage (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.experimental
     */
    experimental?: FhirBoolean;
    /**
     * Date last changed (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.date
     */
    date?: FhirDateTime;
    /**
     * Name of the publisher (organization or individual) (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.publisher
     */
    publisher?: FhirString;
    /**
     * Contact details for the publisher (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.contact
     */
    contact?: ContactDetail[];
    /**
     * Natural language description of the structure definition (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.description
     */
    description?: FhirMarkdown;
    /**
     * The context that the content is intended to support (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.useContext
     */
    useContext?: UsageContext[];
    /**
     * Intended jurisdiction for structure definition (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.jurisdiction
     */
    jurisdiction?: CodeableConcept[];
    /**
     * Why this structure definition is defined (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.purpose
     */
    purpose?: FhirMarkdown;
    /**
     * Use and/or publishing restrictions (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.copyright
     */
    copyright?: FhirMarkdown;
    /**
     * Assist with indexing and finding (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.keyword
     */
    keyword?: Coding[];
    /**
     * FHIR Version this StructureDefinition targets (0..1)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.fhirVersion
     */
    fhirVersion?: FhirVersionCode;
    /**
     * External specification that the content is mapped to (0..*)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.mapping
     */
    mapping?: StructureDefinitionMapping[];
    /**
     * The kind of structure: primitive-type | complex-type | resource | logical (1..1)
     *
     * Determines the fundamental nature of the structure being defined.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.kind
     */
    kind: StructureDefinitionKind;
    /**
     * Whether the structure is abstract (1..1)
     *
     * Abstract types cannot be instantiated directly. For example,
     * `DomainResource` is abstract — you cannot create a resource
     * with `resourceType: "DomainResource"`.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.abstract
     */
    abstract: FhirBoolean;
    /**
     * If an extension, where it can be used in instances (0..*)
     *
     * Only meaningful when kind = 'resource' and type = 'Extension'.
     * Defines the contexts in which the extension can appear.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.context
     */
    context?: StructureDefinitionContext[];
    /**
     * FHIRPath invariants — conditions that must be true for the
     * extension to be valid in a given context (0..*)
     *
     * Only meaningful when kind = 'resource' and type = 'Extension'.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.contextInvariant
     */
    contextInvariant?: FhirString[];
    /**
     * Type defined or constrained by this structure (1..1)
     *
     * For base definitions (derivation = 'specialization'), this is the
     * type being defined (e.g., 'Patient', 'Observation').
     * For profiles (derivation = 'constraint'), this is the type being
     * constrained (must match the type of the base definition).
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.type
     */
    type: FhirUri;
    /**
     * Definition that this type is constrained/specialized from (0..1)
     *
     * The canonical URL of the base StructureDefinition. This forms the
     * inheritance chain used in snapshot generation.
     * - For specializations: points to the parent type
     * - For constraints: points to the profile being constrained
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.baseDefinition
     */
    baseDefinition?: FhirCanonical;
    /**
     * specialization | constraint (0..1)
     *
     * - `specialization`: defines a new type (e.g., Patient specializes DomainResource)
     * - `constraint`: constrains an existing type (e.g., USCorePatient constrains Patient)
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.derivation
     */
    derivation?: TypeDerivationRule;
    /**
     * Snapshot view of the structure (0..1)
     *
     * Contains the complete, flattened element tree with all constraints
     * from the inheritance chain resolved. Generated by the snapshot
     * generation algorithm (fhir-profile module).
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.snapshot
     */
    snapshot?: StructureDefinitionSnapshot;
    /**
     * Differential constraints of the structure (0..1)
     *
     * Contains only the constraints that differ from the base definition.
     * This is the authoring format — profiles are typically written as
     * differentials to avoid repeating base constraints.
     * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.differential
     */
    differential?: StructureDefinitionDifferential;
}

/**
 * Identifies the types of resource or data type elements to which the
 * extension can be applied. Only relevant when kind = 'resource' and
 * type = 'Extension'.
 * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.context
 */
export declare interface StructureDefinitionContext {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Extensions that cannot be ignored even if unrecognized (0..*) */
    modifierExtension?: Extension[];
    /** fhirpath | element | extension (1..1) */
    type: ExtensionContextType;
    /** Where the extension can be used in instances (1..1) */
    expression: FhirString;
}

/**
 * A differential view of the structure, containing only the constraints
 * that differ from the base definition. This is the compact authoring
 * format used when creating profiles.
 * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.differential
 */
export declare interface StructureDefinitionDifferential {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Extensions that cannot be ignored even if unrecognized (0..*) */
    modifierExtension?: Extension[];
    /**
     * Definition of elements in the resource (if no StructureDefinition) (1..*)
     *
     * The differential contains only the constraints that differ from the base
     * profile. It MUST NOT be used directly for semantic interpretation — it
     * must first be expanded into a snapshot via snapshot generation.
     */
    element: ElementDefinition[];
}

/**
 * The kind of structure being defined by a StructureDefinition.
 * @see https://hl7.org/fhir/R4/valueset-structure-definition-kind.html
 */
export declare type StructureDefinitionKind = 'primitive-type' | 'complex-type' | 'resource' | 'logical';

/**
 * A mapping to an external specification that the structure conforms to.
 * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.mapping
 */
export declare interface StructureDefinitionMapping {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Extensions that cannot be ignored even if unrecognized (0..*) */
    modifierExtension?: Extension[];
    /** Internal id when this mapping is used (1..1) */
    identity: FhirId;
    /** Identifies what this mapping refers to (0..1) */
    uri?: FhirUri;
    /** Names what this mapping refers to (0..1) */
    name?: FhirString;
    /** Versions, issues, scope limitations, etc. (0..1) */
    comment?: FhirString;
}

/**
 * A snapshot view of the structure, containing all element definitions
 * with their complete constraint information resolved from the
 * inheritance chain.
 * @see https://hl7.org/fhir/R4/structuredefinition-definitions.html#StructureDefinition.snapshot
 */
export declare interface StructureDefinitionSnapshot {
    /** Unique id for inter-element referencing (0..1) */
    id?: FhirString;
    /** Additional content defined by implementations (0..*) */
    extension?: Extension[];
    /** Extensions that cannot be ignored even if unrecognized (0..*) */
    modifierExtension?: Extension[];
    /**
     * Definition of elements in the resource (if no StructureDefinition) (1..*)
     *
     * The snapshot contains the complete, flattened list of all ElementDefinition
     * entries with all constraints from the inheritance chain fully resolved.
     * This is the "semantic truth" used for validation and interpretation.
     */
    element: ElementDefinition[];
}

/**
 * A resolved type constraint on a canonical element.
 *
 * Corresponds to a simplified, pre-validated version of
 * `ElementDefinition.type` from the FHIR spec.
 */
export declare interface TypeConstraint {
    /**
     * The data type or resource name (e.g., `string`, `Reference`, `Patient`).
     *
     * Unlike `ElementDefinitionType.code` (which is a URI), this is the
     * resolved short name used for runtime dispatch.
     */
    code: string;
    /**
     * Profiles that the type must conform to (resolved canonical URLs).
     *
     * Corresponds to `ElementDefinitionType.profile`.
     */
    profiles?: string[];
    /**
     * For Reference/canonical types, profiles that the target must conform to.
     *
     * Corresponds to `ElementDefinitionType.targetProfile`.
     */
    targetProfiles?: string[];
}

/**
 * Whether a StructureDefinition is a specialization or a constraint.
 * - `specialization`: defines a new type (e.g., Patient specializes DomainResource)
 * - `constraint`: constrains an existing type (e.g., USCorePatient constrains Patient)
 * @see https://hl7.org/fhir/R4/valueset-type-derivation-rule.html
 */
export declare type TypeDerivationRule = 'specialization' | 'constraint';

/**
 * Specifies clinical/business/etc. context in which a conformance
 * artifact is applicable.
 * @see https://hl7.org/fhir/R4/metadatatypes.html#UsageContext
 */
export declare interface UsageContext extends Element {
    /** Type of context being specified (1..1) */
    code: Coding;
    /**
     * Value that defines the context.
     * Choice type [x]: valueCodeableConcept | valueQuantity | valueRange | valueReference
     * Stage-1: represented as unknown; fhir-parser will handle concrete dispatch.
     */
    value?: unknown;
}

export { }
