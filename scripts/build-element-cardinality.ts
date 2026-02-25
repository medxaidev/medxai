/**
 * Build an element cardinality map from FHIR R4 StructureDefinitions.
 *
 * Scans all profiles-resources.json and profiles-types.json to build:
 *   { "Patient.name": "*", "Patient.gender": "1", "Observation.subject": "1", ... }
 *
 * This is used by resolveIsArray() to match Medplum's behavior.
 */
import * as fs from 'fs';
import * as path from 'path';

interface ElementDefinition {
  id?: string;
  path: string;
  max?: string;
  type?: Array<{ code: string }>;
}

interface StructureDefinition {
  resourceType: string;
  id?: string;
  name?: string;
  kind?: string;
  type?: string;
  snapshot?: {
    element: ElementDefinition[];
  };
  differential?: {
    element: ElementDefinition[];
  };
}

interface Bundle {
  resourceType: string;
  entry?: Array<{ resource?: StructureDefinition }>;
}

// Map: "ResourceType.property" -> max cardinality ("1" or "*")
const cardinalityMap: Record<string, string> = {};

function processStructureDefinition(sd: StructureDefinition): void {
  const elements = sd.snapshot?.element ?? sd.differential?.element ?? [];
  const resourceType = sd.type ?? sd.id ?? sd.name;
  if (!resourceType) return;

  for (const elem of elements) {
    if (!elem.path || !elem.max) continue;

    // Store by full path: e.g. "Patient.name" -> "*"
    cardinalityMap[elem.path] = elem.max;

    // Also store by short property: strip the resource prefix for nested paths
    // e.g. "Patient.contact.name" -> stored as is
  }
}

function processBundle(filePath: string): number {
  if (!fs.existsSync(filePath)) return 0;
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (content.resourceType === 'Bundle' && content.entry) {
    let count = 0;
    for (const entry of content.entry) {
      if (entry.resource?.resourceType === 'StructureDefinition') {
        processStructureDefinition(entry.resource);
        count++;
      }
    }
    return count;
  } else if (content.resourceType === 'StructureDefinition') {
    processStructureDefinition(content);
    return 1;
  }
  return 0;
}

let totalSDs = 0;

// Load full FHIR R4 profiles bundles
const profilePaths = [
  'spec/fhir/r4/profiles-types.json',
  'spec/fhir/r4/profiles-resources.json',
  'spec/fhir/r4/profiles-others.json',
];
for (const p of profilePaths) {
  if (fs.existsSync(p)) {
    totalSDs += processBundle(p);
  }
}

console.log(`Processed ${totalSDs} StructureDefinitions`);
console.log(`Total elements: ${Object.keys(cardinalityMap).length}`);

// Now let's check the specific columns that have cardinality mismatches
// Load search parameters to map code -> expression -> element path
const searchParamsPath = 'spec/fhir/r4/search-parameters.json';
if (!fs.existsSync(searchParamsPath)) {
  console.error(`Search parameters file not found: ${searchParamsPath}`);
  process.exit(1);
}

const searchParams = JSON.parse(fs.readFileSync(searchParamsPath, 'utf8'));
const entries = searchParams.entry ?? [];

// For each search parameter, resolve cardinality per resource type
interface ParamInfo {
  code: string;
  type: string;
  base: string[];
  expression: string;
  targets: string[];
}

const params: ParamInfo[] = [];
for (const entry of entries) {
  const r = entry.resource;
  if (!r || r.resourceType !== 'SearchParameter') continue;
  params.push({
    code: r.code,
    type: r.type,
    base: r.base ?? [],
    expression: r.expression ?? '',
    targets: r.target ?? [],
  });
}

/**
 * For a given expression like "AllergyIntolerance.patient | CarePlan.patient | ...",
 * extract only the fragment for the given resource type.
 */
function getExpressionForResourceType(resourceType: string, expression: string): string | undefined {
  const parts = expression.split('|').map(s => s.trim());
  for (const part of parts) {
    // Simple check: does this part start with ResourceType.
    if (part.startsWith(resourceType + '.')) {
      return part;
    }
    // Handle (ResourceType.field) with parens
    if (part.startsWith('(' + resourceType + '.')) {
      return part.replace(/^\(/, '').replace(/\)$/, '');
    }
  }
  // If expression has no | and doesn't start with resourceType, it might be a generic expression
  if (!expression.includes('|') && !expression.startsWith(resourceType + '.')) {
    return undefined;
  }
  if (!expression.includes('|')) {
    return expression;
  }
  return undefined;
}

/**
 * Given a FHIRPath expression like "Patient.contact.telecom" or
 * "AllergyIntolerance.patient", determine if the result is array.
 *
 * Walk each segment and check if ANY element along the path has max != "1".
 */
function isArrayFromExpression(resourceTypeExpr: string): boolean {
  // Strip .where(...), .as(...), .resolve(), .ofType(...), etc.
  let expr = resourceTypeExpr
    .replace(/\.where\([^)]*\)/g, '')
    .replace(/\.as\([^)]*\)/g, '')
    .replace(/\.resolve\(\)/g, '')
    .replace(/\.ofType\([^)]*\)/g, '')
    .replace(/\[0\]/g, '[0]'); // Keep [0] indexer

  // Handle [0] indexer — it makes things NOT array
  const hasIndexer = expr.includes('[0]');
  expr = expr.replace(/\[0\]/g, '');

  const segments = expr.split('.');
  if (segments.length < 2) return false;

  const resourceType = segments[0];
  let currentPath = resourceType;

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    currentPath += '.' + seg;

    const max = cardinalityMap[currentPath];
    if (max && max !== '1' && max !== '0') {
      // This element is an array (max = '*' or a number > 1)
      // But if the last segment had [0], it's not array
      if (i === segments.length - 1 && hasIndexer) {
        return false;
      }
      return true;
    }
  }

  return false;
}

// Now check each search parameter per resource type
let correctCount = 0;
let wrongCount = 0;

// Collect the cases where our current logic differs from element cardinality
const shouldBeArray: { code: string; resourceType: string; expr: string; path: string }[] = [];
const shouldBeScalar: { code: string; resourceType: string; expr: string; path: string }[] = [];
const unknown: { code: string; resourceType: string; expr: string }[] = [];

for (const param of params) {
  if (param.type === 'composite' || param.type === 'special') continue;
  // Skip ignored params
  if (['_id', '_lastUpdated', '_profile', '_compartment', '_source', '_version', 'version'].includes(param.code)) continue;

  for (const resourceType of param.base) {
    if (resourceType === 'Resource' || resourceType === 'DomainResource') continue;

    const rtExpr = getExpressionForResourceType(resourceType, param.expression);
    if (!rtExpr) continue;

    const isArray = isArrayFromExpression(rtExpr);

    // Current MedXAI logic
    const currentIsArray = param.type === 'token' ? true :
      (param.type === 'reference' && (param.expression.includes('|') || param.targets.length > 1));

    if (isArray !== currentIsArray && param.type !== 'token') {
      if (isArray && !currentIsArray) {
        shouldBeArray.push({ code: param.code, resourceType, expr: rtExpr, path: rtExpr });
      } else if (!isArray && currentIsArray) {
        shouldBeScalar.push({ code: param.code, resourceType, expr: rtExpr, path: rtExpr });
      }
      wrongCount++;
    } else {
      correctCount++;
    }
  }
}

console.log(`\n=== CARDINALITY RESOLUTION ===`);
console.log(`Correct: ${correctCount}`);
console.log(`Wrong: ${wrongCount}`);
console.log(`  Should be ARRAY but currently scalar: ${shouldBeArray.length}`);
console.log(`  Should be SCALAR but currently array: ${shouldBeScalar.length}`);

if (shouldBeScalar.length > 0) {
  console.log(`\n--- Should be SCALAR (currently array) ---`);
  for (const s of shouldBeScalar.slice(0, 30)) {
    console.log(`  ${s.resourceType}.${s.code}: ${s.expr}`);
  }
  if (shouldBeScalar.length > 30) console.log(`  ... and ${shouldBeScalar.length - 30} more`);
}

if (shouldBeArray.length > 0) {
  console.log(`\n--- Should be ARRAY (currently scalar) ---`);
  for (const s of shouldBeArray.slice(0, 30)) {
    console.log(`  ${s.resourceType}.${s.code}: ${s.expr}`);
  }
  if (shouldBeArray.length > 30) console.log(`  ... and ${shouldBeArray.length - 30} more`);
}

// Output element cardinality for paths that matter
console.log(`\n--- Sample element cardinalities ---`);
const samplePaths = [
  'Patient.name', 'Patient.gender', 'Patient.generalPractitioner',
  'AllergyIntolerance.patient', 'AllergyIntolerance.recorder',
  'Observation.subject', 'Observation.performer',
  'Encounter.participant', 'Encounter.location',
  'CarePlan.activity', 'CarePlan.subject',
  'Appointment.participant', 'Appointment.slot',
  'Claim.item.udi', 'Claim.item.encounter',
];
for (const p of samplePaths) {
  console.log(`  ${p}: max=${cardinalityMap[p] ?? 'NOT FOUND'}`);
}
