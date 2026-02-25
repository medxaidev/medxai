/**
 * Extract column types from Medplum DDL to build a cardinality map.
 *
 * Compares column types between MedXAI and Medplum DDL files,
 * and outputs a map of search parameter expressions that need
 * their array/scalar determination corrected.
 */
import * as fs from 'fs';
import * as path from 'path';

interface TableColumns {
  [columnName: string]: string; // column type
}

interface AllTables {
  [tableName: string]: TableColumns;
}

function parseDDL(content: string): AllTables {
  const tables: AllTables = {};
  const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?"?(\w+)"?\s*\(([\s\S]*?)\);/gi;

  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns: TableColumns = {};

    // Parse each column definition
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().replace(/,$/, '');
      // Skip constraints, primary keys, etc.
      if (!trimmed || trimmed.startsWith('PRIMARY') || trimmed.startsWith('CONSTRAINT') ||
        trimmed.startsWith('UNIQUE') || trimmed.startsWith('CHECK') || trimmed.startsWith('--')) {
        continue;
      }

      // Match: "columnName" type or columnName type
      const colMatch = trimmed.match(/^"?(\w+)"?\s+([\w\s\[\]]+?)(?:\s+(?:NOT\s+NULL|DEFAULT|PRIMARY|REFERENCES|UNIQUE|CHECK).*)?$/i);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].trim().toLowerCase();
        columns[colName] = colType;
      }
    }

    tables[tableName] = columns;
  }

  return tables;
}

// Main resource table names (skip _History, _References)
function isMainTable(name: string): boolean {
  return !name.endsWith('_History') && !name.endsWith('_References') &&
    !['HumanName', 'Address', 'ContactPoint', 'Identifier'].includes(name);
}

const medxaiFile = process.argv[2] || 'packages/fhir-persistence/src/__tests__/pgdata/medxai_all_3.sql';
const medplumFile = process.argv[3] || 'packages/fhir-persistence/src/__tests__/pgdata/medplum_all.sql';

const medxaiContent = fs.readFileSync(medxaiFile, 'utf8');
const medplumContent = fs.readFileSync(medplumFile, 'utf8');

const medxaiTables = parseDDL(medxaiContent);
const medplumTables = parseDDL(medplumContent);

// Find all column type mismatches between MedXAI and Medplum
interface Mismatch {
  table: string;
  column: string;
  medxai: string;
  medplum: string;
  // Direction: 'scalar-to-array' means MedXAI has scalar, Medplum has array
  direction: 'scalar-to-array' | 'array-to-scalar' | 'type-change';
}

const mismatches: Mismatch[] = [];

for (const tableName of Object.keys(medxaiTables)) {
  if (!isMainTable(tableName)) continue;
  const medplumTable = medplumTables[tableName];
  if (!medplumTable) continue;

  const medxaiCols = medxaiTables[tableName];

  for (const colName of Object.keys(medxaiCols)) {
    const medxaiType = medxaiCols[colName];
    const medplumType = medplumTable[colName];
    if (!medplumType) continue; // Column only in MedXAI

    if (medxaiType !== medplumType) {
      let direction: Mismatch['direction'] = 'type-change';
      if (medxaiType.replace('[]', '') === medplumType) {
        direction = 'array-to-scalar'; // MedXAI array, Medplum scalar
      } else if (medxaiType === medplumType.replace('[]', '')) {
        direction = 'scalar-to-array'; // MedXAI scalar, Medplum array
      }
      mismatches.push({ table: tableName, column: colName, medxai: medxaiType, medplum: medplumType, direction });
    }
  }
}

// Group and summarize
const arrayToScalar = mismatches.filter(m => m.direction === 'array-to-scalar');
const scalarToArray = mismatches.filter(m => m.direction === 'scalar-to-array');
const typeChanges = mismatches.filter(m => m.direction === 'type-change');

console.log(`\n=== CARDINALITY MISMATCHES ===`);
console.log(`Total: ${mismatches.length}`);
console.log(`  MedXAI array → Medplum scalar: ${arrayToScalar.length}`);
console.log(`  MedXAI scalar → Medplum array: ${scalarToArray.length}`);
console.log(`  Other type changes: ${typeChanges.length}`);

// For array-to-scalar: MedXAI wrongly treats these as arrays
// These are references/dates that should be scalar
console.log(`\n=== MedXAI ARRAY → should be SCALAR (${arrayToScalar.length}) ===`);
const a2sByCol = new Map<string, string[]>();
for (const m of arrayToScalar) {
  const key = m.column;
  if (!a2sByCol.has(key)) a2sByCol.set(key, []);
  a2sByCol.get(key)!.push(m.table);
}
for (const [col, tables] of Array.from(a2sByCol.entries()).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${col} (${tables.length} tables): ${tables.slice(0, 5).join(', ')}${tables.length > 5 ? '...' : ''}`);
}

// For scalar-to-array: MedXAI wrongly treats these as scalar
console.log(`\n=== MedXAI SCALAR → should be ARRAY (${scalarToArray.length}) ===`);
const s2aByCol = new Map<string, string[]>();
for (const m of scalarToArray) {
  const key = m.column;
  if (!s2aByCol.has(key)) s2aByCol.set(key, []);
  s2aByCol.get(key)!.push(m.table);
}
for (const [col, tables] of Array.from(s2aByCol.entries()).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${col} (${tables.length} tables): ${tables.slice(0, 5).join(', ')}${tables.length > 5 ? '...' : ''}`);
}

// Other type changes
console.log(`\n=== OTHER TYPE CHANGES (${typeChanges.length}) ===`);
for (const m of typeChanges) {
  console.log(`  ${m.table}.${m.column}: ${m.medxai} → ${m.medplum}`);
}
