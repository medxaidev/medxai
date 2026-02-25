/**
 * Generate a compact element cardinality map from FHIR R4 StructureDefinitions.
 * Output: packages/fhir-persistence/src/registry/element-cardinality.ts
 *
 * Map format: { "Patient.name": true, "Patient.gender": false, ... }
 * where true = isArray (max != '1'), false = scalar (max == '1')
 * Only includes elements with max != '1' (arrays) to keep the map small.
 * Missing entries are assumed scalar (max='1').
 */
import * as fs from 'fs';

interface ElementDefinition {
  path: string;
  max?: string;
}

interface StructureDefinition {
  resourceType: string;
  type?: string;
  kind?: string;
  snapshot?: { element: ElementDefinition[] };
}

interface Bundle {
  resourceType: string;
  entry?: Array<{ resource?: StructureDefinition }>;
}

// Set of paths where max != '1' (i.e., array elements)
const arrayPaths = new Set<string>();

function processSD(sd: StructureDefinition): void {
  if (!sd.snapshot?.element) return;
  // Only process resource and complex-type SDs
  if (sd.kind !== 'resource' && sd.kind !== 'complex-type') return;

  for (const elem of sd.snapshot.element) {
    if (!elem.path || !elem.max) continue;
    if (elem.max !== '1' && elem.max !== '0') {
      arrayPaths.add(elem.path);
    }
  }
}

const profilePaths = [
  'spec/fhir/r4/profiles-types.json',
  'spec/fhir/r4/profiles-resources.json',
  'spec/fhir/r4/profiles-others.json',
];

let totalSDs = 0;
for (const p of profilePaths) {
  if (!fs.existsSync(p)) { console.error(`Not found: ${p}`); continue; }
  const bundle: Bundle = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (bundle.entry) {
    for (const entry of bundle.entry) {
      if (entry.resource?.resourceType === 'StructureDefinition') {
        processSD(entry.resource);
        totalSDs++;
      }
    }
  }
}

console.log(`Processed ${totalSDs} StructureDefinitions`);
console.log(`Array element paths: ${arrayPaths.size}`);

// Sort for deterministic output
const sorted = Array.from(arrayPaths).sort();

// Generate TypeScript file
const lines: string[] = [];
lines.push('/**');
lines.push(' * FHIR R4 element cardinality map — auto-generated.');
lines.push(' *');
lines.push(' * Contains element paths where max != "1" (i.e., the element is an array).');
lines.push(' * If a path is NOT in this set, it is assumed to be scalar (max = "1").');
lines.push(' *');
lines.push(` * Generated from ${totalSDs} StructureDefinitions, ${sorted.length} array paths.`);
lines.push(' * DO NOT EDIT MANUALLY — regenerate with: npx tsx scripts/generate-cardinality-map.ts');
lines.push(' */');
lines.push('');
lines.push('/**');
lines.push(' * Set of FHIR element paths that have max cardinality != "1".');
lines.push(' * Format: "ResourceType.property" or "ResourceType.backbone.property"');
lines.push(' */');
lines.push('export const ARRAY_ELEMENT_PATHS: ReadonlySet<string> = new Set([');
for (const p of sorted) {
  lines.push(`  '${p}',`);
}
lines.push(']);');
lines.push('');

const outPath = 'packages/fhir-persistence/src/registry/element-cardinality.ts';
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Written to ${outPath} (${sorted.length} entries)`);
