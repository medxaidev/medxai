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
  BundleLoadOptions,
  BundleLoadResult,
  BundleLoadError,
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
  loadBundleFromObject,
  loadBundleFromFile,
  loadBundlesFromFiles,
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

// ─── Profile module ────────────────────────────────────────────────────────
export type {
  SnapshotGeneratorOptions,
  SnapshotResult,
  SnapshotIssue,
  SnapshotIssueCode,
  DiffElementTracker,
  TraversalScope,
  MergeContext,
} from './profile/index.js';

export {
  // SnapshotGenerator
  SnapshotGenerator,

  // CanonicalBuilder
  buildCanonicalProfile,
  buildCanonicalElement,
  buildTypeConstraints,
  buildBindingConstraint,
  buildInvariants,
  buildSlicingDefinition,

  // Errors
  ProfileError,
  SnapshotCircularDependencyError,
  BaseNotFoundError,
  ConstraintViolationError,
  UnconsumedDifferentialError,

  // Type helpers
  createSnapshotIssue,
  createDiffTracker,

  // Path utilities
  pathMatches,
  isDirectChild,
  isDescendant,
  pathDepth,
  parentPath,
  tailSegment,
  isChoiceTypePath,
  matchesChoiceType,
  extractChoiceTypeName,
  hasSliceName,
  extractSliceName,

  // Element sorter
  findBaseIndex,
  sortDifferential,
  validateElementOrder,
  ensureElementIds,

  // Constraint merger
  mergeConstraints,
  setBaseTraceability,
  mergeCardinality,
  mergeTypes,
  mergeBinding,
  mergeConstraintList,
  isLargerMax,

  // Element merger
  createMergeContext,
  processPaths,
  mergeSnapshot,

  // Slicing handler
  makeExtensionSlicing,
  getSliceSiblings,
  validateSlicingCompatibility,
  diffsConstrainTypes,
  handleNewSlicing,
  handleExistingSlicing,
} from './profile/index.js';

// ─── Validator module ──────────────────────────────────────────────────────
export type {
  ValidationOptions,
  ValidationResult,
  ValidationIssue,
  ValidationIssueCode,
} from './validator/index.js';

export {
  StructureValidator,
  createValidationIssue,
  resolveValidationOptions,
  hasValidationErrors,
  extractValues,
  ProfileNotFoundError,
  ValidationFailedError,
} from './validator/index.js';