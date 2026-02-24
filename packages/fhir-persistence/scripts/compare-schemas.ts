/**
 * Schema Comparison Script
 * 
 * Compares medplum_all.sql vs medxai_all.sql to identify differences
 * in table structures, columns, indexes, and constraints.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pgdataDir = resolve(scriptDir, "..", "src", "__tests__", "pgdata");

const medxaiSql = readFileSync(resolve(pgdataDir, "medxai_all.sql"), "utf8");
const medplumSql = readFileSync(resolve(pgdataDir, "medplum_all.sql"), "utf8");

const outFile = resolve(scriptDir, "compare-output.txt");
writeFileSync(outFile, "", "utf8"); // clear
function log(msg: string) {
  console.log(msg);
  appendFileSync(outFile, msg + "\n", "utf8");
}

// =============================================================================
// 1. Extract table names
// =============================================================================

function extractTableNames(sql: string): string[] {
  const regex = /CREATE TABLE public\."([^"]+)"/g;
  const names: string[] = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    names.push(match[1]);
  }
  return names.sort();
}

const medxaiTables = extractTableNames(medxaiSql);
const medplumTables = extractTableNames(medplumSql);

console.log(`\n=== TABLE COUNT ===`);
console.log(`MedXAI:  ${medxaiTables.length} tables`);
console.log(`Medplum: ${medplumTables.length} tables`);

// Tables only in one side
const onlyMedplum = medplumTables.filter((t) => !medxaiTables.includes(t));
const onlyMedxai = medxaiTables.filter((t) => !medplumTables.includes(t));

if (onlyMedplum.length > 0) {
  log(`\n=== ONLY IN MEDPLUM (${onlyMedplum.length}) ===`);
  for (const t of onlyMedplum) log(`  - ${t}`);
}
if (onlyMedxai.length > 0) {
  log(`\n=== ONLY IN MEDXAI (${onlyMedxai.length}) ===`);
  for (const t of onlyMedxai) log(`  - ${t}`);
}

// =============================================================================
// 2. Extract columns per table
// =============================================================================

interface TableDef {
  name: string;
  columns: Map<string, string>; // colName -> type
}

function extractTableDefs(sql: string): Map<string, TableDef> {
  const tableDefs = new Map<string, TableDef>();
  // Match CREATE TABLE ... ( ... );
  const regex = /CREATE TABLE public\."([^"]+)"\s*\(([\s\S]*?)\);/g;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const name = match[1];
    const body = match[2];
    const columns = new Map<string, string>();

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("--")) continue;

      // Match column definition: "colName" type ...
      const colMatch = trimmed.match(/^"?([^"]+)"?\s+([\w\s\[\]()]+)/);
      if (colMatch) {
        const colName = colMatch[1];
        let colType = colMatch[2].trim();
        // Normalize: remove DEFAULT, NOT NULL, etc.
        colType = colType.replace(/\s*(DEFAULT|NOT NULL|WITH TIME ZONE).*$/i, "").trim();
        // Keep "with time zone" for timestamp
        if (trimmed.toLowerCase().includes("with time zone")) {
          colType = colType + " with time zone";
        }
        // Skip if it looks like a constraint
        if (colName.toUpperCase() === "CONSTRAINT" || colName.toUpperCase() === "PRIMARY") continue;
        columns.set(colName, colType.toLowerCase());
      }
    }

    tableDefs.set(name, { name, columns });
  }
  return tableDefs;
}

const medxaiDefs = extractTableDefs(medxaiSql);
const medplumDefs = extractTableDefs(medplumSql);

// =============================================================================
// 3. Compare common tables (focus on FHIR standard resource types)
// =============================================================================

// Standard FHIR R4 resource types to compare (skip Medplum-custom like AccessPolicy, Address etc.)
const commonTables = medxaiTables.filter((t) => medplumTables.includes(t));
const mainTables = commonTables.filter(
  (t) => !t.endsWith("_History") && !t.endsWith("_References") && !t.endsWith("_Name")
);

console.log(`\n=== COMMON MAIN TABLES: ${mainTables.length} ===`);

let columnsOnlyMedplumCount = 0;
let columnsOnlyMedxaiCount = 0;
let typeMismatchCount = 0;
const detailedDiffs: string[] = [];

// Pick specific resource types for detailed comparison
const sampleTypes = [
  "Account", "Patient", "Observation", "Encounter", "Condition",
  "Procedure", "MedicationRequest", "DiagnosticReport", "Practitioner",
  "Organization", "AllergyIntolerance", "Immunization", "CarePlan",
  "ServiceRequest", "DocumentReference"
];

for (const tableName of mainTables) {
  const medxaiDef = medxaiDefs.get(tableName);
  const medplumDef = medplumDefs.get(tableName);
  if (!medxaiDef || !medplumDef) continue;

  const onlyInMedplum: string[] = [];
  const onlyInMedxai: string[] = [];
  const typeDiffs: string[] = [];

  for (const [col, type] of medplumDef.columns) {
    if (!medxaiDef.columns.has(col)) {
      onlyInMedplum.push(`${col} (${type})`);
      columnsOnlyMedplumCount++;
    } else {
      const medxaiType = medxaiDef.columns.get(col)!;
      // Normalize comparison
      const t1 = type.replace(/\s+/g, " ").replace(/with time zone/g, "tz");
      const t2 = medxaiType.replace(/\s+/g, " ").replace(/with time zone/g, "tz");
      if (t1 !== t2) {
        typeDiffs.push(`${col}: medplum=${type} vs medxai=${medxaiType}`);
        typeMismatchCount++;
      }
    }
  }

  for (const [col] of medxaiDef.columns) {
    if (!medplumDef.columns.has(col)) {
      onlyInMedxai.push(col);
      columnsOnlyMedxaiCount++;
    }
  }

  if (onlyInMedplum.length > 0 || onlyInMedxai.length > 0 || typeDiffs.length > 0) {
    if (sampleTypes.includes(tableName) || onlyInMedplum.length > 2 || typeDiffs.length > 0) {
      let detail = `\n  [${tableName}]`;
      if (onlyInMedplum.length > 0) {
        detail += `\n    Only in Medplum: ${onlyInMedplum.join(", ")}`;
      }
      if (onlyInMedxai.length > 0) {
        detail += `\n    Only in MedXAI:  ${onlyInMedxai.join(", ")}`;
      }
      if (typeDiffs.length > 0) {
        detail += `\n    Type mismatch:   ${typeDiffs.join("; ")}`;
      }
      detailedDiffs.push(detail);
    }
  }
}

console.log(`\n=== COLUMN DIFFERENCES SUMMARY ===`);
console.log(`Columns only in Medplum: ${columnsOnlyMedplumCount}`);
console.log(`Columns only in MedXAI:  ${columnsOnlyMedxaiCount}`);
console.log(`Type mismatches:         ${typeMismatchCount}`);

if (detailedDiffs.length > 0) {
  log(`\n=== DETAILED COLUMN DIFFS (${detailedDiffs.length} tables) ===`);
  for (const d of detailedDiffs) log(d);
}

// =============================================================================
// 4. Extensions and Functions
// =============================================================================

console.log(`\n=== EXTENSIONS ===`);
const medxaiExtensions = medxaiSql.match(/CREATE EXTENSION[^;]+/g) ?? [];
const medplumExtensions = medplumSql.match(/CREATE EXTENSION[^;]+/g) ?? [];
console.log(`MedXAI extensions:  ${medxaiExtensions.length}`);
for (const e of medxaiExtensions) log(`  ${e.trim().slice(0, 80)}`);
console.log(`Medplum extensions: ${medplumExtensions.length}`);
for (const e of medplumExtensions) log(`  ${e.trim().slice(0, 80)}`);

// Functions
const medxaiFunctions = medxaiSql.match(/CREATE FUNCTION[^;]+/g) ?? [];
const medplumFunctions = medplumSql.match(/CREATE FUNCTION[^;]+/g) ?? [];
console.log(`\nMedXAI functions:  ${medxaiFunctions.length}`);
console.log(`Medplum functions: ${medplumFunctions.length}`);
for (const f of medplumFunctions) log(`  ${f.trim().slice(0, 100)}`);

// =============================================================================
// 5. Indexes
// =============================================================================

const medxaiIndexes = (medxaiSql.match(/CREATE INDEX[^;]+/g) ?? []).length;
const medplumIndexes = (medplumSql.match(/CREATE INDEX[^;]+/g) ?? []).length;
const medxaiUniqueIndexes = (medxaiSql.match(/CREATE UNIQUE INDEX[^;]+/g) ?? []).length;
const medplumUniqueIndexes = (medplumSql.match(/CREATE UNIQUE INDEX[^;]+/g) ?? []).length;

console.log(`\n=== INDEXES ===`);
console.log(`MedXAI indexes:        ${medxaiIndexes} (${medxaiUniqueIndexes} unique)`);
console.log(`Medplum indexes:       ${medplumIndexes} (${medplumUniqueIndexes} unique)`);

// Sample index comparison for Patient
console.log(`\n=== SAMPLE: Patient indexes ===`);
const medxaiPatientIdx = medxaiSql.match(/CREATE (?:UNIQUE )?INDEX[^;]*"Patient"[^;]*/g) ?? [];
const medplumPatientIdx = medplumSql.match(/CREATE (?:UNIQUE )?INDEX[^;]*"Patient"[^;]*/g) ?? [];
console.log(`  MedXAI Patient indexes: ${medxaiPatientIdx.length}`);
for (const idx of medxaiPatientIdx.slice(0, 5)) log(`    ${idx.trim().slice(0, 120)}`);
if (medxaiPatientIdx.length > 5) log(`    ... and ${medxaiPatientIdx.length - 5} more`);
console.log(`  Medplum Patient indexes: ${medplumPatientIdx.length}`);
for (const idx of medplumPatientIdx.slice(0, 5)) log(`    ${idx.trim().slice(0, 120)}`);
if (medplumPatientIdx.length > 5) log(`    ... and ${medplumPatientIdx.length - 5} more`);

// =============================================================================
// 6. Constraints
// =============================================================================

const medxaiPK = (medxaiSql.match(/ADD CONSTRAINT[^;]*PRIMARY KEY[^;]*/g) ?? []).length;
const medplumPK = (medplumSql.match(/ADD CONSTRAINT[^;]*PRIMARY KEY[^;]*/g) ?? []).length;

console.log(`\n=== CONSTRAINTS ===`);
console.log(`MedXAI primary keys:  ${medxaiPK}`);
console.log(`Medplum primary keys: ${medplumPK}`);

// Naming pattern check: do we have same PK naming?
const medxaiAccountPK = medxaiSql.match(/ADD CONSTRAINT[^;]*"Account"[^;]*/)?.[0] ?? "N/A";
const medplumAccountPK = medplumSql.match(/ADD CONSTRAINT[^;]*"Account"[^;]*/)?.[0] ?? "N/A";
console.log(`\n  MedXAI Account PK:  ${medxaiAccountPK.trim().slice(0, 120)}`);
console.log(`  Medplum Account PK: ${medplumAccountPK.trim().slice(0, 120)}`);

console.log(`\n=== COMPARISON COMPLETE ===`);
