/**
 * fhir-validator — Validation Rules: Cardinality & Type
 *
 * Implements the core structural validation rules:
 * - {@link validateCardinality} — min/max cardinality checks
 * - {@link validateType} — FHIR type constraint checks
 * - {@link inferFhirType} — heuristic FHIR type inference from JS values
 * - {@link validateRequired} — required element (min≥1) presence check
 *
 * These functions operate on individual {@link CanonicalElement} definitions
 * and produce {@link ValidationIssue} entries when violations are found.
 *
 * @module fhir-validator
 */

import type { CanonicalElement } from '../model/canonical-profile.js';
import type { ValidationIssue } from './types.js';
import { createValidationIssue } from './types.js';

// =============================================================================
// Section 1: validateCardinality
// =============================================================================

/**
 * Validate cardinality (min/max) for an element.
 *
 * Checks that the number of values found for an element falls within
 * the allowed range defined by `element.min` and `element.max`.
 *
 * @param element - The canonical element definition with min/max constraints.
 * @param values - The extracted values for this element.
 * @param issues - Mutable array to push validation issues into.
 *
 * @example
 * ```typescript
 * // element: min=1, max=1
 * validateCardinality(element, [], issues);
 * // → issues: [{ code: 'CARDINALITY_MIN_VIOLATION', ... }]
 * ```
 */
export function validateCardinality(
  element: CanonicalElement,
  values: unknown[],
  issues: ValidationIssue[],
): void {
  const count = values.length;

  // Check minimum cardinality
  if (element.min > 0 && count < element.min) {
    issues.push(
      createValidationIssue(
        'error',
        'CARDINALITY_MIN_VIOLATION',
        `Element '${element.path}' requires at least ${element.min} value(s), but found ${count}`,
        { path: element.path },
      ),
    );
  }

  // Check maximum cardinality
  if (element.max !== 'unbounded') {
    if (count > element.max) {
      issues.push(
        createValidationIssue(
          'error',
          'CARDINALITY_MAX_VIOLATION',
          `Element '${element.path}' allows at most ${element.max} value(s), but found ${count}`,
          { path: element.path },
        ),
      );
    }
  }
}

// =============================================================================
// Section 2: validateRequired
// =============================================================================

/**
 * Validate that a required element (min ≥ 1) is present.
 *
 * This is a convenience wrapper that checks element presence without
 * needing to extract values first. It only checks the `exists` flag.
 *
 * @param element - The canonical element definition.
 * @param exists - Whether the element exists in the resource.
 * @param issues - Mutable array to push validation issues into.
 */
export function validateRequired(
  element: CanonicalElement,
  exists: boolean,
  issues: ValidationIssue[],
): void {
  if (element.min > 0 && !exists) {
    issues.push(
      createValidationIssue(
        'error',
        'REQUIRED_ELEMENT_MISSING',
        `Required element '${element.path}' is missing (min=${element.min})`,
        { path: element.path },
      ),
    );
  }
}

// =============================================================================
// Section 3: inferFhirType
// =============================================================================

/**
 * Known FHIR primitive type names (lowercase) that map to JS `string`.
 *
 * @internal
 */
const STRING_FHIR_TYPES = new Set([
  'string',
  'uri',
  'url',
  'canonical',
  'code',
  'oid',
  'id',
  'markdown',
  'base64Binary',
  'instant',
  'date',
  'dateTime',
  'time',
  'uuid',
  'xhtml',
]);

/**
 * Infer the FHIR type from a JavaScript value.
 *
 * Uses heuristics to determine the most likely FHIR type based on
 * the JavaScript runtime type and object shape. This is inherently
 * imperfect — for example, a JS `string` could be any of the FHIR
 * string-like primitives. The inference returns the broadest matching
 * category.
 *
 * **Type mapping:**
 *
 * | JS type | Inferred FHIR type |
 * |---------|-------------------|
 * | `string` | `'string'` |
 * | `boolean` | `'boolean'` |
 * | `number` (integer) | `'integer'` |
 * | `number` (decimal) | `'decimal'` |
 * | `object` with `system`+`code` | `'Coding'` |
 * | `object` with `coding` array | `'CodeableConcept'` |
 * | `object` with `value`+`unit` or `value`+`system` | `'Quantity'` |
 * | `object` with `reference` | `'Reference'` |
 * | `object` with `start` or `end` | `'Period'` |
 * | `object` with `numerator`+`denominator` | `'Ratio'` |
 * | `object` with `line`+`city` or `city`+`state` | `'Address'` |
 * | `object` with `family` or `given` | `'HumanName'` |
 * | `object` with `system`+`value` (no `code`) | `'Identifier'` |
 * | `object` with `contentType` or `data` | `'Attachment'` |
 * | `object` with `url`+`value[x]` shape | `'Extension'` |
 * | other `object` | `'BackboneElement'` |
 * | `null`/`undefined` | `'null'` |
 *
 * @param value - The JavaScript value to infer type from.
 * @returns The inferred FHIR type name.
 */
export function inferFhirType(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    return 'string';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'decimal';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return inferComplexType(obj);
  }

  return 'unknown';
}

/**
 * Infer FHIR complex type from an object's shape.
 *
 * @internal
 */
function inferComplexType(obj: Record<string, unknown>): string {
  // Coding: { system, code }
  if ('system' in obj && 'code' in obj && !('value' in obj)) {
    return 'Coding';
  }

  // CodeableConcept: { coding: [...] }
  if ('coding' in obj && Array.isArray(obj.coding)) {
    return 'CodeableConcept';
  }

  // Quantity (and sub-types Age, Count, Distance, Duration, Money):
  // { value, unit } or { value, system, code }
  if ('value' in obj && typeof obj.value === 'number') {
    if ('unit' in obj || ('system' in obj && 'code' in obj)) {
      return 'Quantity';
    }
  }

  // Reference: { reference } or { reference, display }
  if ('reference' in obj && typeof obj.reference === 'string') {
    return 'Reference';
  }

  // Period: { start } or { end } or { start, end }
  if (('start' in obj || 'end' in obj) && !('value' in obj)) {
    return 'Period';
  }

  // Ratio: { numerator, denominator }
  if ('numerator' in obj && 'denominator' in obj) {
    return 'Ratio';
  }

  // HumanName: { family } or { given }
  if ('family' in obj || ('given' in obj && Array.isArray(obj.given))) {
    return 'HumanName';
  }

  // Address: { line, city } or { city, state }
  if (('line' in obj && 'city' in obj) || ('city' in obj && 'state' in obj)) {
    return 'Address';
  }

  // Identifier: { system, value } (no code)
  if ('system' in obj && 'value' in obj && !('code' in obj)) {
    return 'Identifier';
  }

  // ContactPoint: { system, value } with system being phone/fax/email/pager/url/sms/other
  if ('system' in obj && 'value' in obj && 'code' in obj) {
    // Already matched as Coding above, but just in case
    return 'Coding';
  }

  // Attachment: { contentType } or { data }
  if ('contentType' in obj || ('data' in obj && typeof obj.data === 'string')) {
    return 'Attachment';
  }

  // Extension: { url, value[x] }
  if ('url' in obj && typeof obj.url === 'string') {
    // Check for any value[x] property
    for (const key of Object.keys(obj)) {
      if (
        key.startsWith('value') &&
        key.length > 5 &&
        key[5] >= 'A' &&
        key[5] <= 'Z'
      ) {
        return 'Extension';
      }
    }
  }

  // Meta: { versionId } or { lastUpdated } or { profile }
  if ('versionId' in obj || 'lastUpdated' in obj || ('profile' in obj && Array.isArray(obj.profile))) {
    return 'Meta';
  }

  // Narrative: { status, div }
  if ('status' in obj && 'div' in obj) {
    return 'Narrative';
  }

  // Generic backbone/complex element
  return 'BackboneElement';
}

// =============================================================================
// Section 4: validateType
// =============================================================================

/**
 * Check if an inferred type is compatible with a set of allowed type constraints.
 *
 * Handles FHIR's type hierarchy where:
 * - All string-like primitives (uri, code, id, etc.) are compatible with `string`
 * - `integer`, `positiveInt`, `unsignedInt` are compatible with each other
 * - `Quantity` sub-types (Age, Count, Distance, Duration, Money) match `Quantity`
 * - `BackboneElement` is compatible with any complex type (structural match)
 *
 * @internal
 */
function isTypeCompatible(inferredType: string, allowedType: string): boolean {
  // Exact match
  if (inferredType === allowedType) {
    return true;
  }

  // String-like primitives are all compatible with 'string'
  if (inferredType === 'string' && STRING_FHIR_TYPES.has(allowedType)) {
    return true;
  }

  // Integer variants
  if (
    inferredType === 'integer' &&
    (allowedType === 'positiveInt' || allowedType === 'unsignedInt' || allowedType === 'integer')
  ) {
    return true;
  }

  // Decimal is compatible with integer (integer is a subset of decimal)
  if (inferredType === 'integer' && allowedType === 'decimal') {
    return true;
  }

  // Quantity sub-types
  if (
    inferredType === 'Quantity' &&
    (allowedType === 'Age' ||
      allowedType === 'Count' ||
      allowedType === 'Distance' ||
      allowedType === 'Duration' ||
      allowedType === 'Money' ||
      allowedType === 'SimpleQuantity')
  ) {
    return true;
  }

  // BackboneElement is a generic complex type — compatible with any complex type
  // This handles cases where we can't precisely infer the type from shape alone
  if (inferredType === 'BackboneElement') {
    // BackboneElement is compatible with any non-primitive type
    const primitives = new Set(['string', 'boolean', 'integer', 'decimal', 'null', 'array', 'unknown']);
    return !primitives.has(allowedType);
  }

  // Element type (base of all) — very permissive
  if (allowedType === 'Element' || allowedType === 'BackboneElement') {
    return true;
  }

  // Resource type — any object with resourceType
  if (allowedType === 'Resource') {
    return inferredType !== 'string' && inferredType !== 'boolean' &&
      inferredType !== 'integer' && inferredType !== 'decimal' &&
      inferredType !== 'null' && inferredType !== 'unknown';
  }

  return false;
}

/**
 * Validate type constraints for an element value.
 *
 * Checks that the inferred FHIR type of a value matches at least one
 * of the allowed types defined in the element's type constraints.
 *
 * If the element has no type constraints (backbone element), validation
 * is skipped. If the element allows multiple types (choice type), the
 * value must match at least one.
 *
 * @param element - The canonical element definition with type constraints.
 * @param value - The actual value to validate.
 * @param issues - Mutable array to push validation issues into.
 *
 * @example
 * ```typescript
 * // element.types = [{ code: 'string' }]
 * validateType(element, 42, issues);
 * // → issues: [{ code: 'TYPE_MISMATCH', ... }]
 * ```
 */
export function validateType(
  element: CanonicalElement,
  value: unknown,
  issues: ValidationIssue[],
): void {
  // No type constraints → backbone element, skip
  if (element.types.length === 0) {
    return;
  }

  // Null/undefined values are handled by cardinality, not type
  if (value === null || value === undefined) {
    return;
  }

  const inferredType = inferFhirType(value);

  // Check if inferred type matches any allowed type
  const isMatch = element.types.some((tc) => isTypeCompatible(inferredType, tc.code));

  if (!isMatch) {
    const allowedCodes = element.types.map((t) => t.code).join(', ');
    issues.push(
      createValidationIssue(
        'error',
        'TYPE_MISMATCH',
        `Element '${element.path}' expects type(s) [${allowedCodes}], but found '${inferredType}'`,
        {
          path: element.path,
          diagnostics: `Inferred type: ${inferredType}, allowed: [${allowedCodes}]`,
        },
      ),
    );
  }
}

// =============================================================================
// Section 5: validateChoiceType
// =============================================================================

/**
 * Validate that a choice type element uses an allowed type suffix.
 *
 * For elements like `Observation.value[x]`, checks that the concrete
 * property name (e.g., `valueQuantity`) uses a type suffix that matches
 * one of the allowed types in the element definition.
 *
 * @param element - The canonical element definition (must be a choice type).
 * @param concreteFieldSuffix - The type suffix from the concrete property
 *   (e.g., `'Quantity'` from `valueQuantity`).
 * @param issues - Mutable array to push validation issues into.
 */
export function validateChoiceType(
  element: CanonicalElement,
  concreteFieldSuffix: string,
  issues: ValidationIssue[],
): void {
  if (element.types.length === 0) {
    return;
  }

  const allowedCodes = element.types.map((t) => t.code);
  const isAllowed = allowedCodes.some(
    (code) => code === concreteFieldSuffix || code.toLowerCase() === concreteFieldSuffix.toLowerCase(),
  );

  if (!isAllowed) {
    issues.push(
      createValidationIssue(
        'error',
        'INVALID_CHOICE_TYPE',
        `Element '${element.path}' does not allow type '${concreteFieldSuffix}'; allowed: [${allowedCodes.join(', ')}]`,
        { path: element.path },
      ),
    );
  }
}
