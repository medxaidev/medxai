/**
 * `@medxai/fhir-core` — Public API
 *
 * Re-exports all public types from the model, parser, and context layers.
 * Additional modules (profile, validator) will be added here as they
 * are implemented in later phases.
 *
 * @packageDocumentation
 */

// ─── Parser module ───────────────────────────────────────────────────────────
export type {
  ParseSeverity,
  ParseErrorCode,
  ParseIssue,
  ParseResult,
  ChoiceValue,
  ChoiceTypeField,
} from './parser/index.js';

export {
  parseFhirJson,
  parseFhirObject,
  parseStructureDefinition,
  parseElementDefinition,
  serializeToFhirJson,
  serializeToFhirObject,
  parseSuccess,
  parseFailure,
  createIssue,
  hasErrors,
} from './parser/index.js';

// ─── Model module ────────────────────────────────────────────────────────────
export type {
  // Primitives
  FhirBoolean,
  FhirInteger,
  FhirString,
  FhirDecimal,
  FhirUri,
  FhirUrl,
  FhirCanonical,
  FhirBase64Binary,
  FhirInstant,
  FhirDate,
  FhirDateTime,
  FhirTime,
  FhirCode,
  FhirOid,
  FhirId,
  FhirMarkdown,
  FhirUnsignedInt,
  FhirPositiveInt,
  FhirUuid,
  FhirXhtml,

  // Enums
  PublicationStatus,
  StructureDefinitionKind,
  TypeDerivationRule,
  ExtensionContextType,
  FhirVersionCode,
  PropertyRepresentation,
  SlicingRules,
  DiscriminatorType,
  AggregationMode,
  ReferenceVersionRules,
  ConstraintSeverity,
  BindingStrength,
  NarrativeStatus,

  // Base complex types
  Element,
  Extension,
  Coding,
  CodeableConcept,
  Identifier,
  Period,
  Reference,
  ContactDetail,
  ContactPoint,
  UsageContext,
  Quantity,
  Narrative,
  Meta,
  Resource,
  DomainResource,
  BackboneElement,

  // ElementDefinition
  ElementDefinition,
  ElementDefinitionSlicing,
  SlicingDiscriminator,
  ElementDefinitionBase,
  ElementDefinitionType,
  ElementDefinitionConstraint,
  ElementDefinitionBinding,
  ElementDefinitionExample,
  ElementDefinitionMapping,

  // StructureDefinition
  StructureDefinition,
  StructureDefinitionMapping,
  StructureDefinitionContext,
  StructureDefinitionSnapshot,
  StructureDefinitionDifferential,

  // Canonical Profile (internal semantic model)
  CanonicalProfile,
  CanonicalElement,
  TypeConstraint,
  BindingConstraint,
  Invariant,
  SlicingDefinition,
  SlicingDiscriminatorDef,
} from './model/index.js';

// ─── Context module ─────────────────────────────────────────────────────────
export type {
  FhirContext,
  FhirContextOptions,
  StructureDefinitionLoader,
  LoaderOptions,
  ContextStatistics,
} from './context/index.js';

export {
  FhirContextImpl,
  createEmptyStatistics,
  MemoryLoader,
  FileSystemLoader,
  CompositeLoader,
  ContextError,
  ResourceNotFoundError,
  CircularDependencyError,
  LoaderError,
  InvalidStructureDefinitionError,
  BASE_RESOURCES,
  PRIMITIVE_TYPES,
  COMPLEX_TYPES,
  CORE_RESOURCES,
  ALL_CORE_DEFINITIONS,
  loadAllCoreDefinitions,
  loadCoreDefinition,
  loadCoreDefinitionSync,
  getCoreDefinitionsDir,
} from './context/index.js';