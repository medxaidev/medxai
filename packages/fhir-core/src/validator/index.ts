/**
 * fhir-validator — Barrel Exports
 *
 * Re-exports all public types, interfaces, error classes, and helper
 * functions from the FHIR validator module.
 *
 * Public surface:
 * - Types: ValidationOptions, ValidationResult, ValidationIssue, etc.
 * - Errors: ValidatorError hierarchy
 * - Helpers: createValidationIssue, hasValidationErrors, etc.
 *
 * @module fhir-validator
 */

// ─── Types & Interfaces ───
export type {
  ValidationOptions,
  ValidationResult,
  ValidationIssue,
  ValidationIssueCode,
  ValidationContext,
} from './types.js';

// ─── Helper Functions ───
export {
  createValidationIssue,
  createValidationContext,
  resolveValidationOptions,
  hasValidationErrors,
  filterIssuesBySeverity,
  filterIssuesByCode,
} from './types.js';

// ─── Path Extractor ───
export {
  extractValues,
  pathExists,
  findChoiceTypeField,
  normalizeChoicePath,
  extractChoiceTypeSuffix,
} from './path-extractor.js';

// ─── Validation Rules ───
export {
  validateCardinality,
  validateRequired,
  validateType,
  validateChoiceType,
  inferFhirType,
} from './validation-rules.js';

// ─── Errors ───
export {
  ValidatorError,
  ProfileNotFoundError,
  ValidationFailedError,
} from './errors.js';
