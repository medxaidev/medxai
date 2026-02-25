/**
 * Compare two SQL DDL files: extract tables, columns, and indexes, then diff.
 * Usage: npx tsx scripts/compare-ddl.ts <file1> <file2>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file1 = resolve(process.argv[2]);
const file2 = resolve(process.argv[3]);

const sql1 = readFileSync(file1, 'utf-8');
const sql2 = readFileSync(file2, 'utf-8');

// ─── Extract CREATE TABLE with columns ───────────────────────────────────────

interface TableInfo {
  name: string;
  columns: string[]; // sorted column names
  columnDefs: Map<string, string>; // col name -> type definition
}

function extractTables(sql: string): Map<string, TableInfo> {
  const tables = new Map<string, TableInfo>();
  // Match CREATE TABLE ... (...);
  const tableRe = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(?:public\.)?"([^"]+)"\s*\(([\s\S]*?)\);/g;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(sql)) !== null) {
    const name = m[1];
    const body = m[2];
    const columns: string[] = [];
    const columnDefs = new Map<string, string>();
    // Parse each line
    for (const line of body.split('\n')) {
      const trimmed = line.trim().replace(/,\s*$/, '');
      if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('CONSTRAINT') || trimmed.startsWith('PRIMARY KEY')) continue;
      // Column line: "colName" type ... or colName type ...
      const colMatch = trimmed.match(/^"?([^"\s]+)"?\s+(.+)/);
      if (colMatch) {
        const colName = colMatch[1];
        let colType = colMatch[2]
          .replace(/DEFAULT\s+\S+/gi, '')
          .replace(/NOT NULL/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
        // Normalize types
        colType = colType
          .replace(/timestamp with time zone/g, 'timestamptz')
          .replace(/character varying/g, 'varchar')
          .replace(/boolean/g, 'boolean')
          .replace(/integer/g, 'integer')
          .replace(/^uuid\[\]/g, 'uuid[]')
          .replace(/^uuid$/g, 'uuid')
          .replace(/^text\[\]/g, 'text[]')
          .replace(/^text$/g, 'text')
          .trim();
        columns.push(colName);
        columnDefs.set(colName, colType);
      }
    }
    columns.sort();
    tables.set(name, { name, columns, columnDefs });
  }
  return tables;
}

// ─── Extract indexes ─────────────────────────────────────────────────────────

interface IndexInfo {
  name: string;
  table: string;
  definition: string; // normalized
}

function extractIndexes(sql: string): Map<string, IndexInfo> {
  const indexes = new Map<string, IndexInfo>();
  // CREATE [UNIQUE] INDEX [IF NOT EXISTS] "name" ON [public.]"table" ...
  const idxRe = /CREATE\s+(UNIQUE\s+)?INDEX(?:\s+IF NOT EXISTS)?\s+"?([^"\s]+)"?\s+ON\s+(?:public\.)?"?([^"\s(]+)"?\s*(.*?);/gs;
  let m: RegExpExecArray | null;
  while ((m = idxRe.exec(sql)) !== null) {
    const unique = m[1] ? 'UNIQUE ' : '';
    const name = m[2];
    const table = m[3];
    let def = (unique + m[4]).trim()
      .replace(/public\./g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    indexes.set(name, { name, table, definition: def });
  }
  return indexes;
}

// ─── Compare ─────────────────────────────────────────────────────────────────

const tables1 = extractTables(sql1);
const tables2 = extractTables(sql2);
const indexes1 = extractIndexes(sql1);
const indexes2 = extractIndexes(sql2);

const label1 = 'medxai_all_1 (generated)';
const label2 = 'medxai_all_2 (pg_dump)';

console.log('='.repeat(80));
console.log('DDL COMPARISON REPORT');
console.log(`File 1: ${label1} — ${tables1.size} tables, ${indexes1.size} indexes`);
console.log(`File 2: ${label2} — ${tables2.size} tables, ${indexes2.size} indexes`);
console.log('='.repeat(80));

// 1. Table-level diff
const onlyIn1 = [...tables1.keys()].filter(t => !tables2.has(t)).sort();
const onlyIn2 = [...tables2.keys()].filter(t => !tables1.has(t)).sort();
const common = [...tables1.keys()].filter(t => tables2.has(t)).sort();

console.log(`\n## Tables: ${common.length} common, ${onlyIn1.length} only in file1, ${onlyIn2.length} only in file2`);
if (onlyIn1.length > 0) {
  console.log(`\n### Tables only in ${label1}:`);
  onlyIn1.forEach(t => console.log(`  - ${t}`));
}
if (onlyIn2.length > 0) {
  console.log(`\n### Tables only in ${label2}:`);
  onlyIn2.forEach(t => console.log(`  - ${t}`));
}

// 2. Column-level diff for common tables
let colDiffs = 0;
const colDiffDetails: string[] = [];
for (const tname of common) {
  const t1 = tables1.get(tname)!;
  const t2 = tables2.get(tname)!;
  const cols1Set = new Set(t1.columns);
  const cols2Set = new Set(t2.columns);
  const onlyCols1 = t1.columns.filter(c => !cols2Set.has(c));
  const onlyCols2 = t2.columns.filter(c => !cols1Set.has(c));
  // Type mismatches
  const typeMismatches: string[] = [];
  for (const col of t1.columns) {
    if (cols2Set.has(col)) {
      const type1 = t1.columnDefs.get(col)!;
      const type2 = t2.columnDefs.get(col)!;
      if (type1 !== type2) {
        typeMismatches.push(`  ${col}: "${type1}" vs "${type2}"`);
      }
    }
  }

  if (onlyCols1.length > 0 || onlyCols2.length > 0 || typeMismatches.length > 0) {
    colDiffs++;
    const lines: string[] = [`\n### ${tname}:`];
    if (onlyCols1.length > 0) lines.push(`  Columns only in file1: ${onlyCols1.join(', ')}`);
    if (onlyCols2.length > 0) lines.push(`  Columns only in file2: ${onlyCols2.join(', ')}`);
    if (typeMismatches.length > 0) {
      lines.push(`  Type mismatches:`);
      lines.push(...typeMismatches);
    }
    colDiffDetails.push(lines.join('\n'));
  }
}

console.log(`\n## Column differences: ${colDiffs} tables with differences`);
if (colDiffDetails.length > 0) {
  colDiffDetails.forEach(d => console.log(d));
}

// 3. Index-level diff
const idxOnlyIn1 = [...indexes1.keys()].filter(i => !indexes2.has(i)).sort();
const idxOnlyIn2 = [...indexes2.keys()].filter(i => !indexes1.has(i)).sort();
const commonIdx = [...indexes1.keys()].filter(i => indexes2.has(i)).sort();

console.log(`\n## Indexes: ${commonIdx.length} common, ${idxOnlyIn1.length} only in file1, ${idxOnlyIn2.length} only in file2`);
if (idxOnlyIn1.length > 0) {
  console.log(`\n### Indexes only in ${label1}:`);
  idxOnlyIn1.forEach(i => {
    const idx = indexes1.get(i)!;
    console.log(`  - ${i} ON ${idx.table}: ${idx.definition}`);
  });
}
if (idxOnlyIn2.length > 0) {
  console.log(`\n### Indexes only in ${label2}:`);
  idxOnlyIn2.forEach(i => {
    const idx = indexes2.get(i)!;
    console.log(`  - ${i} ON ${idx.table}: ${idx.definition}`);
  });
}

// 4. Index definition diff for common indexes
function normalizeIdxDef(def: string): string {
  // Strip all double quotes from identifiers for comparison
  return def.replace(/"/g, '')
    // normalize WHERE clause: "where deleted = false" vs "where (deleted = false)"
    .replace(/where \(([^)]+)\)/g, 'where $1')
    .trim();
}

let idxDefDiffsQuoteOnly = 0;
let idxDefDiffsReal = 0;
const idxDefRealDetails: string[] = [];
for (const iname of commonIdx) {
  const i1 = indexes1.get(iname)!;
  const i2 = indexes2.get(iname)!;
  if (i1.definition !== i2.definition) {
    const norm1 = normalizeIdxDef(i1.definition);
    const norm2 = normalizeIdxDef(i2.definition);
    if (norm1 === norm2) {
      idxDefDiffsQuoteOnly++;
    } else {
      idxDefDiffsReal++;
      idxDefRealDetails.push(`  ${iname} ON ${i1.table}:\n    file1: ${i1.definition}\n    file2: ${i2.definition}\n    norm1: ${norm1}\n    norm2: ${norm2}`);
    }
  }
}
console.log(`\n## Index definition comparison:`);
console.log(`  Quote-only differences (cosmetic): ${idxDefDiffsQuoteOnly}`);
console.log(`  REAL semantic differences: ${idxDefDiffsReal}`);
if (idxDefRealDetails.length > 0) {
  console.log(`\n### Real index definition mismatches:`);
  idxDefRealDetails.forEach(d => console.log(d));
}

// 5. Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log(`Tables:  ${common.length} matching, ${onlyIn1.length} only-file1, ${onlyIn2.length} only-file2`);
console.log(`Columns: ${colDiffs} tables with column differences`);
console.log(`Indexes: ${commonIdx.length} matching, ${idxOnlyIn1.length} only-file1, ${idxOnlyIn2.length} only-file2, ${idxDefDiffsQuoteOnly} quote-only, ${idxDefDiffsReal} REAL mismatches`);
console.log('='.repeat(80));
