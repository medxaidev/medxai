/**
 * DDL Comparison Script v7
 * Compares medxai_all_6.sql vs medplum_all.sql
 * Extracts tables, columns, indexes, constraints and compares them systematically.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  default_?: string;
}

interface IndexDef {
  name: string;
  table: string;
  unique: boolean;
  expression: string; // the full index expression after ON
}

interface ConstraintDef {
  name: string;
  table: string;
  type: string; // PRIMARY KEY, UNIQUE, etc.
  columns: string;
}

interface TableDef {
  name: string;
  columns: Map<string, ColumnDef>;
  columnOrder: string[];
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseSql(sqlContent: string) {
  const tables = new Map<string, TableDef>();
  const indexes = new Map<string, IndexDef>();
  const constraints = new Map<string, ConstraintDef>();

  // Parse CREATE TABLE statements
  const tableRegex = /CREATE TABLE public\."(\w+)"\s*\(([\s\S]*?)\);/g;
  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = new Map<string, ColumnDef>();
    const columnOrder: string[] = [];

    const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    for (const line of lines) {
      // Match column definitions
      const colMatch = line.match(/^"?(\w+)"?\s+([\w\s\[\]()]+?)(?:\s+(DEFAULT\s+\S+))?(?:\s+(NOT NULL))?\s*,?$/i);
      if (colMatch) {
        const name = colMatch[1];
        let type = colMatch[2].trim().replace(/\s+/g, ' ');
        const default_ = colMatch[3] || undefined;
        const notNull = !!colMatch[4];

        // Normalize types
        type = type.replace('timestamp with time zone', 'TIMESTAMPTZ')
          .replace('double precision', 'DOUBLE PRECISION')
          .replace('boolean', 'BOOLEAN')
          .replace('integer', 'INTEGER')
          .replace('text', 'TEXT')
          .replace('uuid', 'UUID');

        columns.set(name, { name, type, nullable: !notNull, default_ });
        columnOrder.push(name);
      }
    }
    tables.set(tableName, { name: tableName, columns, columnOrder });
  }

  // Parse CREATE INDEX / CREATE UNIQUE INDEX
  const indexRegex = /CREATE\s+(UNIQUE\s+)?INDEX\s+"?(\w+)"?\s+ON\s+public\."(\w+)"\s+(.*?);/g;
  while ((match = indexRegex.exec(sqlContent)) !== null) {
    const unique = !!match[1];
    const name = match[2];
    const table = match[3];
    const expression = match[4].trim();
    indexes.set(name, { name, table, unique, expression });
  }

  // Parse ALTER TABLE ... ADD CONSTRAINT
  const constraintRegex = /ALTER TABLE ONLY public\."(\w+)"\s+ADD CONSTRAINT\s+(\w+)\s+(PRIMARY KEY|UNIQUE)\s*\(([^)]+)\)/g;
  while ((match = constraintRegex.exec(sqlContent)) !== null) {
    const table = match[1];
    const name = match[2];
    const type = match[3];
    const columns = match[4];
    constraints.set(name, { name, table, type, columns });
  }

  return { tables, indexes, constraints };
}

// ─── Comparison ──────────────────────────────────────────────────────────────

function classifyTable(name: string): 'main' | 'history' | 'references' | 'lookup' | 'other' {
  if (name.endsWith('_History')) return 'history';
  if (name.endsWith('_References')) return 'references';
  if (['HumanName', 'Address', 'ContactPoint', 'Identifier'].includes(name)) return 'lookup';
  // Medplum-only tables (not shared with MedXAI)
  if (['AsyncJob', 'BulkDataExport', 'DatabaseMigration', 'DomainConfiguration',
    'MedplumRevision', 'PasswordChangeRequest',
    'UserConfiguration'].includes(name)) return 'other';
  if (name.endsWith('_History') || name.endsWith('_References')) return 'other';
  return 'main';
}

// Platform types shared between MedXAI and Medplum
const SHARED_PLATFORM_TYPES = new Set([
  'AccessPolicy', 'ClientApplication', 'JsonWebKey', 'Login',
  'Project', 'ProjectMembership', 'User',
]);

// Platform types only in Medplum (not in MedXAI)
const MEDPLUM_ONLY_PLATFORM_TYPES = new Set([
  'AsyncJob', 'Bot', 'BulkDataExport',
  'DatabaseMigration', 'DomainConfiguration',
  'MedplumRevision', 'PasswordChangeRequest',
  'SmartAppLaunch', 'UserConfiguration', 'Agent',
]);

// All Medplum extra types (for backward compat)
const MEDPLUM_EXTRA_TYPES = new Set([
  ...SHARED_PLATFORM_TYPES, ...MEDPLUM_ONLY_PLATFORM_TYPES,
]);

function compare(medxai: ReturnType<typeof parseSql>, medplum: ReturnType<typeof parseSql>) {
  const output: string[] = [];
  const log = (s: string) => output.push(s);

  // ─── 1. Table-level comparison ─────────────────────────────────────────────
  log('# DDL Comparison Report v7');
  log(`# Generated: ${new Date().toISOString()}`);
  log(`# MedXAI: medxai_all_6.sql | Medplum: medplum_all.sql`);
  log('');

  const medxaiMainTables = new Set<string>();
  const medplumMainTables = new Set<string>();
  const medxaiPlatformTables = new Set<string>();
  const medplumPlatformTables_main = new Set<string>();

  for (const [name] of medxai.tables) {
    if (classifyTable(name) === 'main') {
      if (SHARED_PLATFORM_TYPES.has(name)) {
        medxaiPlatformTables.add(name);
      }
      medxaiMainTables.add(name);
    }
  }
  for (const [name] of medplum.tables) {
    if (classifyTable(name) === 'main') {
      if (SHARED_PLATFORM_TYPES.has(name)) {
        medplumPlatformTables_main.add(name);
      }
      if (!MEDPLUM_ONLY_PLATFORM_TYPES.has(name)) {
        medplumMainTables.add(name);
      }
    }
  }

  log('## 1. Table Coverage');
  log(`MedXAI main tables (incl. 7 platform): ${medxaiMainTables.size}`);
  log(`Medplum main tables (excl. Medplum-only platform): ${medplumMainTables.size}`);
  log(`MedXAI platform tables: ${medxaiPlatformTables.size} (${[...medxaiPlatformTables].sort().join(', ')})`);
  log(`Shared platform types: ${[...SHARED_PLATFORM_TYPES].sort().join(', ')}`);
  log(`Medplum-only platform types: ${[...MEDPLUM_ONLY_PLATFORM_TYPES].sort().join(', ')}`);

  const onlyMedxai = [...medxaiMainTables].filter(t => !medplumMainTables.has(t)).sort();
  const onlyMedplum = [...medplumMainTables].filter(t => !medxaiMainTables.has(t)).sort();
  const commonMain = [...medxaiMainTables].filter(t => medplumMainTables.has(t)).sort();

  if (onlyMedxai.length) {
    log(`\nOnly in MedXAI (${onlyMedxai.length}): ${onlyMedxai.join(', ')}`);
  }
  if (onlyMedplum.length) {
    log(`\nOnly in Medplum (${onlyMedplum.length}): ${onlyMedplum.join(', ')}`);
  }
  log(`\nCommon main tables: ${commonMain.length}`);

  // ─── 2. Platform tables comparison ─────────────────────────────────────────
  const medplumOnlyPlatformTables = [...medplum.tables.keys()]
    .filter(t => MEDPLUM_ONLY_PLATFORM_TYPES.has(t) || MEDPLUM_ONLY_PLATFORM_TYPES.has(t.replace(/_History$|_References$/, '')))
    .sort();
  log(`\n## 2. Medplum-Only Platform Tables (${medplumOnlyPlatformTables.length})`);
  log(medplumOnlyPlatformTables.join(', '));

  // ─── 2b. Shared platform tables comparison ────────────────────────────────
  log(`\n## 2b. Shared Platform Resource Comparison`);
  for (const rt of [...SHARED_PLATFORM_TYPES].sort()) {
    const mxT = medxai.tables.get(rt);
    const mpT = medplum.tables.get(rt);
    log(`\n### ${rt}`);
    if (!mxT && !mpT) { log('Not present in either'); continue; }
    if (!mxT) { log('**Only in Medplum**'); continue; }
    if (!mpT) { log('**Only in MedXAI**'); continue; }

    const mxCols = [...mxT.columns.keys()].sort();
    const mpCols = [...mpT.columns.keys()].sort();

    const common = mxCols.filter(c => mpCols.includes(c));
    const onlyMx = mxCols.filter(c => !mpCols.includes(c));
    const onlyMp = mpCols.filter(c => !mxCols.includes(c));

    log(`MedXAI columns (${mxCols.length}): ${mxCols.join(', ')}`);
    log(`Medplum columns (${mpCols.length}): ${mpCols.join(', ')}`);
    log(`Common: ${common.length} | Only MedXAI: ${onlyMx.length} | Only Medplum: ${onlyMp.length}`);
    if (onlyMx.length) log(`Only in MedXAI: ${onlyMx.join(', ')}`);
    if (onlyMp.length) log(`Only in Medplum: ${onlyMp.join(', ')}`);

    // Type diffs on common columns
    for (const col of common) {
      const mxType = mxT.columns.get(col)!.type;
      const mpType = mpT.columns.get(col)!.type;
      if (mxType.toUpperCase() !== mpType.toUpperCase()) {
        log(`  ⚠️ ${col}: MedXAI=${mxType} vs Medplum=${mpType}`);
      }
    }

    // Check History + References
    for (const suffix of ['_History', '_References']) {
      const mxH = medxai.tables.has(`${rt}${suffix}`);
      const mpH = medplum.tables.has(`${rt}${suffix}`);
      log(`  ${rt}${suffix}: MedXAI=${mxH ? '✅' : '❌'} Medplum=${mpH ? '✅' : '❌'}`);
    }
  }

  // ─── 3. History & References table coverage ────────────────────────────────
  log('\n## 3. History & References Table Coverage');
  let missingHistory = 0;
  let missingRefs = 0;
  const missingHistoryList: string[] = [];
  const missingRefsList: string[] = [];

  for (const rt of commonMain) {
    if (!medxai.tables.has(`${rt}_History`)) {
      missingHistory++;
      missingHistoryList.push(rt);
    }
    if (!medxai.tables.has(`${rt}_References`)) {
      missingRefs++;
      missingRefsList.push(rt);
    }
  }
  log(`Missing _History tables in MedXAI: ${missingHistory}`);
  if (missingHistoryList.length) log(`  ${missingHistoryList.join(', ')}`);
  log(`Missing _References tables in MedXAI: ${missingRefs}`);
  if (missingRefsList.length) log(`  ${missingRefsList.join(', ')}`);

  // ─── 4. Column-level comparison (common main tables) ──────────────────────
  log('\n## 4. Column Differences on Common Main Tables');

  interface ColumnDiff {
    table: string;
    column: string;
    issue: string;
    medxaiType?: string;
    medplumType?: string;
  }

  const columnDiffs: ColumnDiff[] = [];
  const missingInMedxai: { table: string; columns: string[] }[] = [];
  const missingInMedplum: { table: string; columns: string[] }[] = [];

  // Columns that are expected to differ
  const KNOWN_MEDPLUM_EXTRA_COLS = new Set([
    '___compartmentIdentifierSort',
    '___compartmentIdentifierText',
    '___compartmentIdentifier',
    '__sharedTokens',
    '__sharedTokensText',
  ]);

  for (const rt of commonMain) {
    const mxTable = medxai.tables.get(rt)!;
    const mpTable = medplum.tables.get(rt)!;

    const mxCols = new Set(mxTable.columns.keys());
    const mpCols = new Set(mpTable.columns.keys());

    // Columns only in MedXAI
    const onlyInMx = [...mxCols].filter(c => !mpCols.has(c));
    // Columns only in Medplum (excluding known extras)
    const onlyInMp = [...mpCols].filter(c => !mxCols.has(c) && !KNOWN_MEDPLUM_EXTRA_COLS.has(c));

    if (onlyInMx.length > 0) {
      missingInMedplum.push({ table: rt, columns: onlyInMx });
    }
    if (onlyInMp.length > 0) {
      missingInMedxai.push({ table: rt, columns: onlyInMp });
    }

    // Type differences on common columns
    const commonCols = [...mxCols].filter(c => mpCols.has(c));
    for (const col of commonCols) {
      const mxCol = mxTable.columns.get(col)!;
      const mpCol = mpTable.columns.get(col)!;

      // Normalize for comparison
      const mxType = mxCol.type.toUpperCase().replace(/\s+/g, ' ');
      const mpType = mpCol.type.toUpperCase().replace(/\s+/g, ' ');

      if (mxType !== mpType) {
        columnDiffs.push({
          table: rt,
          column: col,
          issue: 'type mismatch',
          medxaiType: mxCol.type,
          medplumType: mpCol.type,
        });
      }
    }
  }

  // Summarize column differences
  if (columnDiffs.length > 0) {
    log(`\n### 4a. Type Mismatches (${columnDiffs.length})`);
    log('| Table | Column | MedXAI | Medplum |');
    log('|-------|--------|--------|---------|');
    for (const d of columnDiffs) {
      log(`| ${d.table} | ${d.column} | ${d.medxaiType} | ${d.medplumType} |`);
    }
  } else {
    log('\n### 4a. Type Mismatches: NONE');
  }

  if (missingInMedxai.length > 0) {
    log(`\n### 4b. Columns Only in Medplum (excl. known extras) (${missingInMedxai.length} tables)`);
    for (const { table, columns } of missingInMedxai) {
      log(`- **${table}**: ${columns.join(', ')}`);
    }
  } else {
    log('\n### 4b. Columns Only in Medplum (excl. known extras): NONE');
  }

  if (missingInMedplum.length > 0) {
    log(`\n### 4c. Columns Only in MedXAI (${missingInMedplum.length} tables)`);
    for (const { table, columns } of missingInMedplum) {
      log(`- **${table}**: ${columns.join(', ')}`);
    }
  } else {
    log('\n### 4c. Columns Only in MedXAI: NONE');
  }

  // ─── 4d. Medplum known extra columns summary ──────────────────────────────
  log('\n### 4d. Medplum Known Extra Columns (present in Medplum, not in MedXAI)');
  const knownExtraCounts: Record<string, number> = {};
  for (const rt of commonMain) {
    const mpTable = medplum.tables.get(rt);
    if (!mpTable) continue;
    for (const colName of mpTable.columns.keys()) {
      if (KNOWN_MEDPLUM_EXTRA_COLS.has(colName)) {
        knownExtraCounts[colName] = (knownExtraCounts[colName] || 0) + 1;
      }
    }
  }
  for (const [col, count] of Object.entries(knownExtraCounts).sort()) {
    log(`- **${col}**: present on ${count} tables`);
  }

  // ─── 5. Index comparison ───────────────────────────────────────────────────
  log('\n## 5. Index Comparison');

  // Group indexes by table
  const medxaiIndexesByTable = new Map<string, IndexDef[]>();
  const medplumIndexesByTable = new Map<string, IndexDef[]>();

  for (const [, idx] of medxai.indexes) {
    if (!medxaiIndexesByTable.has(idx.table)) medxaiIndexesByTable.set(idx.table, []);
    medxaiIndexesByTable.get(idx.table)!.push(idx);
  }
  for (const [, idx] of medplum.indexes) {
    if (!medplumIndexesByTable.has(idx.table)) medplumIndexesByTable.set(idx.table, []);
    medplumIndexesByTable.get(idx.table)!.push(idx);
  }

  log(`MedXAI total indexes: ${medxai.indexes.size}`);
  log(`Medplum total indexes: ${medplum.indexes.size}`);

  // Compare indexes on common tables by name
  let indexNameMatches = 0;
  let indexNameMismatches = 0;
  const indexMismatchDetails: { table: string; indexName: string; issue: string; medxai?: string; medplum?: string }[] = [];
  const indexOnlyMedxai: { table: string; name: string }[] = [];
  const indexOnlyMedplum: { table: string; name: string }[] = [];

  for (const rt of commonMain) {
    const mxIdxs = medxaiIndexesByTable.get(rt) || [];
    const mpIdxs = medplumIndexesByTable.get(rt) || [];

    const mxNames = new Set(mxIdxs.map(i => i.name));
    const mpNames = new Set(mpIdxs.map(i => i.name));

    // Indexes only in one side
    for (const idx of mxIdxs) {
      if (!mpNames.has(idx.name)) {
        indexOnlyMedxai.push({ table: rt, name: idx.name });
      }
    }
    for (const idx of mpIdxs) {
      if (!mxNames.has(idx.name)) {
        indexOnlyMedplum.push({ table: rt, name: idx.name });
      }
    }

    // Common indexes — compare expression
    const mxMap = new Map(mxIdxs.map(i => [i.name, i]));
    const mpMap = new Map(mpIdxs.map(i => [i.name, i]));

    for (const [name, mxIdx] of mxMap) {
      const mpIdx = mpMap.get(name);
      if (!mpIdx) continue;

      const mxExpr = mxIdx.expression.replace(/\s+/g, ' ').trim();
      const mpExpr = mpIdx.expression.replace(/\s+/g, ' ').trim();

      if (mxExpr === mpExpr) {
        indexNameMatches++;
      } else {
        indexNameMismatches++;
        indexMismatchDetails.push({
          table: rt,
          indexName: name,
          issue: 'expression mismatch',
          medxai: mxExpr,
          medplum: mpExpr,
        });
      }
    }

    // Also check _History and _References tables
    for (const suffix of ['_History', '_References']) {
      const tbl = `${rt}${suffix}`;
      const mxHIdxs = medxaiIndexesByTable.get(tbl) || [];
      const mpHIdxs = medplumIndexesByTable.get(tbl) || [];
      const mxHNames = new Set(mxHIdxs.map(i => i.name));
      const mpHNames = new Set(mpHIdxs.map(i => i.name));

      for (const idx of mxHIdxs) {
        if (!mpHNames.has(idx.name)) {
          indexOnlyMedxai.push({ table: tbl, name: idx.name });
        }
      }
      for (const idx of mpHIdxs) {
        if (!mxHNames.has(idx.name)) {
          indexOnlyMedplum.push({ table: tbl, name: idx.name });
        }
      }
    }
  }

  log(`\nIndex name matches (same expression): ${indexNameMatches}`);
  log(`Index name matches (different expression): ${indexNameMismatches}`);

  if (indexMismatchDetails.length > 0) {
    log(`\n### 5a. Index Expression Mismatches (${indexMismatchDetails.length})`);
    // Group by pattern
    const patterns = new Map<string, typeof indexMismatchDetails>();
    for (const d of indexMismatchDetails) {
      // Create a generic pattern key
      const key = `MedXAI: ${d.medxai} vs Medplum: ${d.medplum}`;
      if (!patterns.has(key)) patterns.set(key, []);
      patterns.get(key)!.push(d);
    }

    if (patterns.size <= 20) {
      for (const [pattern, items] of patterns) {
        log(`\n**Pattern** (${items.length} indexes):`);
        log(`  ${pattern}`);
        if (items.length <= 5) {
          for (const i of items) log(`  - ${i.table}.${i.indexName}`);
        } else {
          for (const i of items.slice(0, 3)) log(`  - ${i.table}.${i.indexName}`);
          log(`  - ... and ${items.length - 3} more`);
        }
      }
    } else {
      // Too many patterns, just show count
      log(`(${patterns.size} distinct patterns, showing first 10)`);
      let shown = 0;
      for (const [pattern, items] of patterns) {
        if (shown >= 10) break;
        log(`\n**Pattern** (${items.length} indexes): ${items[0].table}.${items[0].indexName}`);
        log(`  MedXAI: ${items[0].medxai}`);
        log(`  Medplum: ${items[0].medplum}`);
        shown++;
      }
    }
  }

  // Summarize index-only lists
  if (indexOnlyMedxai.length > 0) {
    log(`\n### 5b. Indexes Only in MedXAI (${indexOnlyMedxai.length})`);
    // Group by common pattern
    const byPattern = new Map<string, string[]>();
    for (const { table, name } of indexOnlyMedxai) {
      // Strip resource type prefix to find pattern
      const stripped = name.replace(/^\w+_/, '');
      if (!byPattern.has(stripped)) byPattern.set(stripped, []);
      byPattern.get(stripped)!.push(table);
    }
    for (const [pattern, tables] of [...byPattern.entries()].sort()) {
      if (tables.length > 3) {
        log(`- **${pattern}**: ${tables.length} tables (${tables.slice(0, 3).join(', ')}, ...)`);
      } else {
        log(`- **${pattern}**: ${tables.join(', ')}`);
      }
    }
  }

  if (indexOnlyMedplum.length > 0) {
    log(`\n### 5c. Indexes Only in Medplum (${indexOnlyMedplum.length})`);
    const byPattern = new Map<string, string[]>();
    for (const { table, name } of indexOnlyMedplum) {
      const stripped = name.replace(/^\w+_/, '');
      if (!byPattern.has(stripped)) byPattern.set(stripped, []);
      byPattern.get(stripped)!.push(table);
    }
    for (const [pattern, tables] of [...byPattern.entries()].sort()) {
      if (tables.length > 3) {
        log(`- **${pattern}**: ${tables.length} tables (${tables.slice(0, 3).join(', ')}, ...)`);
      } else {
        log(`- **${pattern}**: ${tables.join(', ')}`);
      }
    }
  }

  // ─── 6. Lookup Table Comparison ────────────────────────────────────────────
  log('\n## 6. Global Lookup Tables');
  for (const lt of ['HumanName', 'Address', 'ContactPoint', 'Identifier']) {
    const mxT = medxai.tables.get(lt);
    const mpT = medplum.tables.get(lt);
    log(`\n### ${lt}`);
    if (!mxT && !mpT) { log('Not present in either'); continue; }
    if (!mxT) { log('**Only in Medplum**'); continue; }
    if (!mpT) { log('**Only in MedXAI**'); continue; }

    const mxCols = [...mxT.columns.keys()].sort();
    const mpCols = [...mpT.columns.keys()].sort();

    const common = mxCols.filter(c => mpCols.includes(c));
    const onlyMx = mxCols.filter(c => !mpCols.includes(c));
    const onlyMp = mpCols.filter(c => !mxCols.includes(c));

    log(`Common columns: ${common.join(', ')}`);
    if (onlyMx.length) log(`Only in MedXAI: ${onlyMx.join(', ')}`);
    if (onlyMp.length) log(`Only in Medplum: ${onlyMp.join(', ')}`);

    // Type diffs
    for (const col of common) {
      const mxType = mxT.columns.get(col)!.type;
      const mpType = mpT.columns.get(col)!.type;
      if (mxType.toUpperCase() !== mpType.toUpperCase()) {
        log(`  ${col}: MedXAI=${mxType} vs Medplum=${mpType}`);
      }
    }
  }

  // ─── 7. Constraint comparison ──────────────────────────────────────────────
  log('\n## 7. Constraints');
  log(`MedXAI constraints: ${medxai.constraints.size}`);
  log(`Medplum constraints: ${medplum.constraints.size}`);

  // ─── 8. Summary Statistics ─────────────────────────────────────────────────
  log('\n## 8. Summary Statistics');
  log(`| Metric | MedXAI | Medplum |`);
  log(`|--------|--------|---------|`);
  log(`| Total tables | ${medxai.tables.size} | ${medplum.tables.size} |`);
  log(`| Main resource tables | ${medxaiMainTables.size} | ${medplumMainTables.size} |`);
  log(`| Total indexes | ${medxai.indexes.size} | ${medplum.indexes.size} |`);
  log(`| Total constraints | ${medxai.constraints.size} | ${medplum.constraints.size} |`);

  // ─── 9. Per-resource detailed diff for sample tables ───────────────────────
  log('\n## 9. Sample Table Deep-Dive (Patient, Observation, Account)');
  for (const rt of ['Patient', 'Observation', 'Account']) {
    const mxT = medxai.tables.get(rt);
    const mpT = medplum.tables.get(rt);
    if (!mxT || !mpT) { log(`\n### ${rt}: Missing in one side`); continue; }

    log(`\n### ${rt}`);
    log('#### Columns');
    const allCols = new Set([...mxT.columns.keys(), ...mpT.columns.keys()]);
    log('| Column | MedXAI Type | Medplum Type | Status |');
    log('|--------|-------------|--------------|--------|');
    for (const col of [...allCols].sort()) {
      const mxCol = mxT.columns.get(col);
      const mpCol = mpT.columns.get(col);
      if (mxCol && mpCol) {
        const match = mxCol.type.toUpperCase() === mpCol.type.toUpperCase() ? '✅' : '⚠️ TYPE DIFF';
        log(`| ${col} | ${mxCol.type} | ${mpCol.type} | ${match} |`);
      } else if (mxCol) {
        log(`| ${col} | ${mxCol.type} | — | 🔵 MedXAI only |`);
      } else {
        log(`| ${col} | — | ${mpCol!.type} | 🟠 Medplum only |`);
      }
    }

    log('#### Indexes');
    const mxIdxs = medxaiIndexesByTable.get(rt) || [];
    const mpIdxs = medplumIndexesByTable.get(rt) || [];
    const allIdxNames = new Set([...mxIdxs.map(i => i.name), ...mpIdxs.map(i => i.name)]);
    const mxIdxMap = new Map(mxIdxs.map(i => [i.name, i]));
    const mpIdxMap = new Map(mpIdxs.map(i => [i.name, i]));

    log('| Index | MedXAI | Medplum | Status |');
    log('|-------|--------|---------|--------|');
    for (const name of [...allIdxNames].sort()) {
      const mx = mxIdxMap.get(name);
      const mp = mpIdxMap.get(name);
      if (mx && mp) {
        const mxExpr = mx.expression.replace(/\s+/g, ' ').trim();
        const mpExpr = mp.expression.replace(/\s+/g, ' ').trim();
        const match = mxExpr === mpExpr ? '✅' : '⚠️';
        log(`| ${name} | ${mxExpr.substring(0, 60)} | ${mpExpr.substring(0, 60)} | ${match} |`);
      } else if (mx) {
        log(`| ${name} | ${mx.expression.substring(0, 60)} | — | 🔵 |`);
      } else {
        log(`| ${name} | — | ${mp!.expression.substring(0, 60)} | 🟠 |`);
      }
    }
  }

  return output.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

const pgdataDir = path.join(__dirname, '..', 'packages', 'fhir-persistence', 'src', '__tests__', 'pgdata');
const medxaiSql = fs.readFileSync(path.join(pgdataDir, 'medxai_all_6.sql'), 'utf-8');
const medplumSql = fs.readFileSync(path.join(pgdataDir, 'medplum_all.sql'), 'utf-8');

const medxai = parseSql(medxaiSql);
const medplum = parseSql(medplumSql);

const result = compare(medxai, medplum);

const outputPath = path.join(__dirname, '..', 'compare-result-v7.txt');
fs.writeFileSync(outputPath, result, 'utf-8');

console.log(result);
console.log(`\n\nResults written to: ${outputPath}`);
