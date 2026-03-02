/**
 * fhirtypes Generator Script
 *
 * Generates TypeScript type definitions (.d.ts) for all FHIR R4 resource types
 * and complex types from StructureDefinition bundles.
 *
 * Usage: npx tsx packages/fhir-core/scripts/generate-fhirtypes.ts
 *
 * Input:
 *   - spec/fhir/r4/profiles-types.json    (FHIR R4 data types)
 *   - spec/fhir/r4/profiles-resources.json (FHIR R4 resource types)
 *
 * Output:
 *   - packages/fhirtypes/dist/*.d.ts       (one file per type + index + Resource)
 *
 * Algorithm:
 *   1. Load all StructureDefinitions from spec bundles
 *   2. Build CanonicalProfile for each (via buildCanonicalProfile)
 *   3. Extract InnerTypes from each profile
 *   4. Generate .d.ts interfaces with correct TypeScript type mappings
 *
 * ## Medplum Parity
 *
 * This generator aims to produce output matching Medplum's fhirtypes:
 * - Code-bound enums rendered as string literal unions
 * - Reference<T> generic with target type parameters
 * - Bundle<T> / BundleEntry<T> generics
 * - Choice type union aliases (e.g., PatientDeceased)
 * - Inner type child elements NOT in parent interface
 * - All imports at file top, inner types appended after parent interface
 *
 * @module scripts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CanonicalProfile, CanonicalElement, TypeConstraint } from '../src/model/canonical-profile.js';
import { buildCanonicalProfile } from '../src/profile/canonical-builder.js';
import { extractInnerTypes, buildTypeName, isBackboneElementType } from '../src/context/inner-type-extractor.js';

// =============================================================================
// Section 1: Constants & Paths
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, '..', '..', '..');
const SPEC_DIR = resolve(WORKSPACE_ROOT, 'spec', 'fhir', 'r4');
const OUTPUT_DIR = resolve(WORKSPACE_ROOT, 'packages', 'fhirtypes', 'dist');

// =============================================================================
// Section 2: FHIR → TypeScript Type Mapping
// =============================================================================

const PRIMITIVE_TO_STRING = new Set([
  'base64Binary', 'canonical', 'code', 'id', 'markdown', 'oid',
  'string', 'uri', 'url', 'uuid', 'xhtml',
  'date', 'dateTime', 'instant', 'time',
  'http://hl7.org/fhirpath/System.String',
]);

const PRIMITIVE_TO_NUMBER = new Set([
  'decimal', 'integer', 'positiveInt', 'unsignedInt',
]);

const IS_PRIMITIVE = (code: string): boolean =>
  PRIMITIVE_TO_STRING.has(code) || PRIMITIVE_TO_NUMBER.has(code) || code === 'boolean';

// Types that get generic <T extends Resource = Resource>
const GENERIC_TYPES = new Set(['Bundle', 'BundleEntry', 'Reference']);

// Well-known required-binding ValueSets → string literal unions
// (Extracted from FHIR R4 spec value sets that are "required" strength)
const REQUIRED_VALUESET_LITERALS: Record<string, string[]> = {
  'http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1': ['male', 'female', 'other', 'unknown'],
  'http://hl7.org/fhir/ValueSet/bundle-type|4.0.1': ['document', 'message', 'transaction', 'transaction-response', 'batch', 'batch-response', 'history', 'searchset', 'collection'],
  'http://hl7.org/fhir/ValueSet/http-verb|4.0.1': ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  'http://hl7.org/fhir/ValueSet/search-entry-mode|4.0.1': ['match', 'include', 'outcome'],
  'http://hl7.org/fhir/ValueSet/link-type|4.0.1': ['replaced-by', 'replaces', 'refer', 'seealso'],
  'http://hl7.org/fhir/ValueSet/address-use|4.0.1': ['home', 'work', 'temp', 'old', 'billing'],
  'http://hl7.org/fhir/ValueSet/address-type|4.0.1': ['postal', 'physical', 'both'],
  'http://hl7.org/fhir/ValueSet/name-use|4.0.1': ['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden'],
  'http://hl7.org/fhir/ValueSet/contact-point-system|4.0.1': ['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'],
  'http://hl7.org/fhir/ValueSet/contact-point-use|4.0.1': ['home', 'work', 'temp', 'old', 'mobile'],
  'http://hl7.org/fhir/ValueSet/identifier-use|4.0.1': ['usual', 'official', 'temp', 'secondary', 'old'],
  'http://hl7.org/fhir/ValueSet/narrative-status|4.0.1': ['generated', 'extensions', 'additional', 'empty'],
  'http://hl7.org/fhir/ValueSet/quantity-comparator|4.0.1': ['<', '<=', '>=', '>'],
  'http://hl7.org/fhir/ValueSet/publication-status|4.0.1': ['draft', 'active', 'retired', 'unknown'],
  'http://hl7.org/fhir/ValueSet/request-status|4.0.1': ['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown'],
  'http://hl7.org/fhir/ValueSet/request-intent|4.0.1': ['proposal', 'plan', 'directive', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option'],
  'http://hl7.org/fhir/ValueSet/request-priority|4.0.1': ['routine', 'urgent', 'asap', 'stat'],
  'http://hl7.org/fhir/ValueSet/event-status|4.0.1': ['preparation', 'in-progress', 'not-done', 'on-hold', 'stopped', 'completed', 'entered-in-error', 'unknown'],
  'http://hl7.org/fhir/ValueSet/observation-status|4.0.1': ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown'],
  'http://hl7.org/fhir/ValueSet/encounter-status|4.0.1': ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown'],
  'http://hl7.org/fhir/ValueSet/composition-status|4.0.1': ['preliminary', 'final', 'amended', 'entered-in-error'],
  'http://hl7.org/fhir/ValueSet/document-reference-status|4.0.1': ['current', 'superseded', 'entered-in-error'],
  'http://hl7.org/fhir/ValueSet/fm-status|4.0.1': ['active', 'cancelled', 'draft', 'entered-in-error'],
  'http://hl7.org/fhir/ValueSet/episode-of-care-status|4.0.1': ['planned', 'waitlist', 'active', 'onhold', 'finished', 'cancelled', 'entered-in-error'],
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Map a FHIR type code to its TypeScript representation.
 * Handles code enums, Reference<T> generics, and BackboneElement naming.
 */
function mapFhirTypeToTS(
  element: CanonicalElement,
  typeConstraint: TypeConstraint,
  elementPath: string,
  isArray: boolean,
  allTypeNames: Set<string>,
): string {
  const code = typeConstraint.code;
  let tsType: string;

  if (code === 'boolean') {
    tsType = 'boolean';
  } else if (PRIMITIVE_TO_NUMBER.has(code)) {
    tsType = 'number';
  } else if (PRIMITIVE_TO_STRING.has(code)) {
    // Check for required-binding enum literals
    tsType = getEnumLiterals(element) ?? 'string';
  } else if (code === 'code') {
    tsType = getEnumLiterals(element) ?? 'string';
  } else if (code === 'BackboneElement' || code === 'Element') {
    tsType = buildTypeName(elementPath.split('.'));
  } else if (code === 'ResourceList' || code === 'Resource') {
    tsType = 'Resource';
  } else if (code === 'Reference') {
    tsType = buildReferenceType(typeConstraint, allTypeNames);
  } else {
    tsType = code;
  }

  return isArray ? `${tsType}[]` : tsType;
}

/**
 * Build Reference<T> with target type parameters from targetProfiles.
 */
function buildReferenceType(typeConstraint: TypeConstraint, allTypeNames: Set<string>): string {
  const targets = typeConstraint.targetProfiles;
  if (!targets || targets.length === 0) return 'Reference';

  const typeNames: string[] = [];
  for (const profile of targets) {
    // Extract type name from canonical URL: http://hl7.org/fhir/StructureDefinition/Patient → Patient
    const parts = profile.split('/');
    const name = parts[parts.length - 1];
    if (allTypeNames.has(name)) {
      typeNames.push(name);
    }
  }

  if (typeNames.length === 0) return 'Reference';
  return `Reference<${typeNames.join(' | ')}>`;
}

/**
 * Get string literal union type from required-strength binding.
 */
function getEnumLiterals(element: CanonicalElement): string | undefined {
  const binding = element.binding;
  if (!binding || binding.strength !== 'required' || !binding.valueSetUrl) return undefined;

  const literals = REQUIRED_VALUESET_LITERALS[binding.valueSetUrl];
  if (!literals || literals.length === 0) return undefined;

  return literals.map((v) => `'${v}'`).join(' | ');
}

// =============================================================================
// Section 3: Load StructureDefinitions
// =============================================================================

interface FhirBundle {
  resourceType: string;
  entry?: Array<{ resource?: Record<string, unknown> }>;
}

function loadBundle(filePath: string): Record<string, unknown>[] {
  const raw = readFileSync(filePath, 'utf-8');
  const bundle = JSON.parse(raw) as FhirBundle;
  const results: Record<string, unknown>[] = [];
  for (const entry of bundle.entry ?? []) {
    if (entry.resource?.resourceType === 'StructureDefinition') {
      results.push(entry.resource);
    }
  }
  return results;
}

// =============================================================================
// Section 4: Build Profiles with InnerTypes
// =============================================================================

interface TypeEntry {
  profile: CanonicalProfile;
  isResource: boolean;
  sd: Record<string, unknown>;
}

function buildAllProfiles(structureDefs: Record<string, unknown>[]): Map<string, TypeEntry> {
  const allTypes = new Map<string, TypeEntry>();

  for (const sd of structureDefs) {
    const kind = sd.kind as string;
    const name = sd.name as string;
    const abstract = sd.abstract as boolean;

    // Skip primitive types (they map to TS primitives directly)
    if (kind === 'primitive-type') continue;

    // Skip abstract base types that we handle manually
    if (name === 'Resource' || name === 'DomainResource') continue;

    // Build CanonicalProfile from snapshot
    const snapshot = sd.snapshot as { element?: unknown[] } | undefined;
    if (!snapshot?.element || snapshot.element.length === 0) continue;

    try {
      const profile = buildCanonicalProfile(sd as any);
      const innerTypes = extractInnerTypes(profile);
      profile.innerTypes = innerTypes;

      const isResource = kind === 'resource' && !abstract;
      allTypes.set(name, { profile, isResource, sd });

      // Register inner types as well (for import resolution)
      for (const [innerName, innerProfile] of innerTypes) {
        allTypes.set(innerName, { profile: innerProfile, isResource: false, sd });
      }
    } catch {
      // Skip SDs that fail to build (e.g., incomplete definitions)
    }
  }

  return allTypes;
}

// =============================================================================
// Section 5: Generate .d.ts Files
// =============================================================================

/**
 * Collect all paths that belong to a BackboneElement subtree.
 * These paths should be EXCLUDED from the parent interface.
 */
function collectBackboneChildPaths(profile: CanonicalProfile): Set<string> {
  const excluded = new Set<string>();
  for (const [path, element] of profile.elements) {
    if (!path.includes('.')) continue;
    if (isBackboneElementType(element)) {
      const prefix = path + '.';
      for (const childPath of profile.elements.keys()) {
        if (childPath.startsWith(prefix)) {
          excluded.add(childPath);
        }
      }
    }
  }
  return excluded;
}

/**
 * Generate the complete file content for a top-level type + its inner types.
 * All imports are collected into one block at the top of the file.
 */
function generateTypeFile(
  profile: CanonicalProfile,
  isResource: boolean,
  allTypeNames: Set<string>,
): string {
  const allImports = new Set<string>();
  const bodyLines: string[] = [];
  const choiceAliases: string[] = [];
  const typeName = profile.name;

  // Generate the main interface
  generateInterfaceBody(
    profile, isResource, allTypeNames, allImports, bodyLines, choiceAliases, typeName,
  );

  // Generate choice type union aliases after the main interface
  if (choiceAliases.length > 0) {
    bodyLines.push('');
    bodyLines.push(...choiceAliases);
  }

  // Generate inner type interfaces
  if (profile.innerTypes) {
    const sorted = Array.from(profile.innerTypes.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const innerProfile of sorted) {
      bodyLines.push('');
      generateInterfaceBody(
        innerProfile, false, allTypeNames, allImports, bodyLines, [], typeName,
      );
    }
  }

  // Build import block (all at top)
  const importLines: string[] = [];
  for (const imp of Array.from(allImports).sort()) {
    importLines.push(`import { ${imp} } from './${imp}';`);
  }

  if (importLines.length > 0) {
    return importLines.join('\n') + '\n\n' + bodyLines.join('\n') + '\n';
  }
  return bodyLines.join('\n') + '\n';
}

/**
 * Generate the interface body for a single type (main or inner).
 */
function generateInterfaceBody(
  profile: CanonicalProfile,
  isResource: boolean,
  allTypeNames: Set<string>,
  imports: Set<string>,
  lines: string[],
  choiceAliases: string[],
  rootTypeName: string,
): void {
  const typeName = profile.name;
  const excludedPaths = collectBackboneChildPaths(profile);

  // Generic modifier for Bundle, BundleEntry, Reference
  const genericModifier = GENERIC_TYPES.has(typeName) ? '<T extends Resource = Resource>' : '';

  lines.push(`/**`);
  lines.push(` * FHIR R4 ${typeName}`);
  lines.push(` * @see https://hl7.org/fhir/R4/${isResource ? typeName.toLowerCase() : 'datatypes'}.html`);
  lines.push(` */`);
  lines.push(`export interface ${typeName}${genericModifier} {`);

  if (isResource) {
    lines.push('');
    lines.push(`  /**`);
    lines.push(`   * This is a ${typeName} resource`);
    lines.push(`   */`);
    lines.push(`  readonly resourceType: '${typeName}';`);
  }

  for (const [path, element] of profile.elements) {
    // Skip root element
    if (!path.includes('.')) continue;

    // *** Bug 1 fix: Skip elements that belong to a BackboneElement subtree ***
    if (excludedPaths.has(path)) continue;

    // Get property name (last segment)
    const segments = path.split('.');
    const propName = segments[segments.length - 1];

    // Handle choice types [x]
    if (propName.endsWith('[x]')) {
      const baseName = propName.slice(0, -3);
      const choiceTypes: string[] = [];

      for (const t of element.types) {
        const concreteName = baseName + capitalize(t.code);
        const isArr = element.max === 'unbounded' || (typeof element.max === 'number' && element.max > 1);
        const tsType = mapFhirTypeToTS(element, t, path, isArr, allTypeNames);
        collectImport(imports, t, rootTypeName, allTypeNames);
        const optional = element.min === 0 ? '?' : '';
        lines.push('');
        lines.push(`  /**`);
        lines.push(`   * ${getDescription(element, path)}`);
        lines.push(`   */`);
        lines.push(`  ${concreteName}${optional}: ${tsType};`);
        choiceTypes.push(tsType);
      }

      // Generate choice type union alias (deduplicated)
      if (choiceTypes.length > 1) {
        const aliasName = typeName + capitalize(baseName);
        const uniqueTypes = [...new Set(choiceTypes)];
        const union = uniqueTypes.join(' | ');
        choiceAliases.push(`/**`);
        choiceAliases.push(` * ${getDescription(element, path)}`);
        choiceAliases.push(` */`);
        choiceAliases.push(`export type ${aliasName} = ${union};`);
      }

      continue;
    }

    if (element.types.length === 0) continue;

    const primaryType = element.types[0];
    const isArr = element.max === 'unbounded' || (typeof element.max === 'number' && element.max > 1);
    const tsType = mapFhirTypeToTS(element, primaryType, path, isArr, allTypeNames);
    const optional = element.min === 0 ? '?' : '';

    collectImport(imports, primaryType, rootTypeName, allTypeNames);

    lines.push('');
    lines.push(`  /**`);
    lines.push(`   * ${getDescription(element, path)}`);
    lines.push(`   */`);
    lines.push(`  ${propName}${optional}: ${tsType};`);
  }

  // Special: Reference gets a resource?: T field
  if (typeName === 'Reference') {
    lines.push('');
    lines.push(`  /**`);
    lines.push(`   * Optional Resource referred to by this reference.`);
    lines.push(`   */`);
    lines.push(`  resource?: T;`);
  }

  lines.push(`}`);
}

function getDescription(_element: CanonicalElement, path: string): string {
  // CanonicalElement doesn't carry `short` or `definition` yet.
  // Use the path as a fallback description (matches our current schema).
  return path;
}

function collectImport(
  imports: Set<string>,
  typeConstraint: TypeConstraint,
  rootTypeName: string,
  allTypeNames: Set<string>,
): void {
  const code = typeConstraint.code;

  // Don't import primitives
  if (IS_PRIMITIVE(code)) return;
  if (code === 'BackboneElement' || code === 'Element') return;

  // For Reference, import Reference + target types
  if (code === 'Reference') {
    imports.add('Reference');
    if (typeConstraint.targetProfiles) {
      for (const profile of typeConstraint.targetProfiles) {
        const parts = profile.split('/');
        const name = parts[parts.length - 1];
        if (allTypeNames.has(name) && name !== rootTypeName) {
          imports.add(name);
        }
      }
    }
    return;
  }

  if (code === 'ResourceList' || code === 'Resource') {
    imports.add('Resource');
    return;
  }

  // Don't import inner types (they're in the same file)
  // Only import top-level types
  const isUpperCase = code.charAt(0) >= 'A' && code.charAt(0) <= 'Z';
  if (isUpperCase && !code.includes('.') && code !== rootTypeName) {
    imports.add(code);
  }
}

// =============================================================================
// Section 6: Write Output
// =============================================================================

function writeTypeFile(name: string, content: string): void {
  writeFileSync(resolve(OUTPUT_DIR, `${name}.d.ts`), content, 'utf-8');
}

function writeIndexFile(allTypes: Map<string, TypeEntry>): void {
  const topLevelTypes = new Set<string>();
  for (const [name, entry] of allTypes) {
    // Only export top-level types (not inner types)
    if (!entry.profile.parentType) {
      topLevelTypes.add(name);
    }
  }

  const sorted = Array.from(topLevelTypes).sort();
  const lines = sorted.map((name) => `export type { ${name} } from './${name}';`);
  lines.push(`export type { Resource } from './Resource';`);
  lines.push(`export type { ResourceType } from './ResourceType';`);
  writeFileSync(resolve(OUTPUT_DIR, 'index.d.ts'), lines.join('\n') + '\n', 'utf-8');
}

function writeResourceFile(allTypes: Map<string, TypeEntry>): void {
  const resourceNames = Array.from(allTypes.entries())
    .filter(([, e]) => e.isResource)
    .map(([name]) => name)
    .sort();

  const imports = resourceNames.map((n) => `import type { ${n} } from './${n}';`);
  const union = resourceNames.join('\n  | ');
  const content = imports.join('\n') + `\n\nexport type Resource = ${union};\n`;
  writeFileSync(resolve(OUTPUT_DIR, 'Resource.d.ts'), content, 'utf-8');
}

function writeResourceTypeFile(): void {
  const content = `import type { Resource } from './Resource';\n\nexport type ResourceType = Resource['resourceType'];\nexport type ExtractResource<K extends ResourceType> = Extract<Resource, { resourceType: K }>;\n`;
  writeFileSync(resolve(OUTPUT_DIR, 'ResourceType.d.ts'), content, 'utf-8');
}

// =============================================================================
// Section 7: Main
// =============================================================================

export function generate(): { typeCount: number; resourceCount: number; innerTypeCount: number } {
  console.log('[generate-fhirtypes] Loading StructureDefinition bundles...');

  const typesSDs = loadBundle(resolve(SPEC_DIR, 'profiles-types.json'));
  const resourcesSDs = loadBundle(resolve(SPEC_DIR, 'profiles-resources.json'));
  const allSDs = [...typesSDs, ...resourcesSDs];

  console.log(`[generate-fhirtypes] Loaded ${allSDs.length} StructureDefinitions`);
  console.log('[generate-fhirtypes] Building profiles and extracting InnerTypes...');

  const allTypes = buildAllProfiles(allSDs);

  // Build set of all known type names for Reference<T> resolution
  const allTypeNames = new Set(allTypes.keys());

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write individual type files (only top-level, inner types are embedded)
  let resourceCount = 0;
  let innerTypeCount = 0;
  let topLevelCount = 0;

  for (const [name, entry] of allTypes) {
    if (entry.profile.parentType) {
      innerTypeCount++;
      continue; // Inner types are written inside their parent file
    }
    topLevelCount++;
    if (entry.isResource) resourceCount++;

    const content = generateTypeFile(entry.profile, entry.isResource, allTypeNames);
    writeTypeFile(name, content);
  }

  // Write aggregate files
  writeIndexFile(allTypes);
  writeResourceFile(allTypes);
  writeResourceTypeFile();

  console.log(`[generate-fhirtypes] Generated ${topLevelCount} type files (${resourceCount} resources, ${innerTypeCount} inner types)`);
  console.log(`[generate-fhirtypes] Output: ${OUTPUT_DIR}`);

  return { typeCount: topLevelCount, resourceCount, innerTypeCount };
}

// Run if executed directly
if (process.argv[1]?.endsWith('generate-fhirtypes.ts')) {
  generate();
}
