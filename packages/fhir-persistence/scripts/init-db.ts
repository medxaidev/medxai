/**
 * Database Initialization Script (Cross-Platform)
 *
 * Generates the full FHIR schema DDL and executes it against PostgreSQL.
 *
 * ## Usage
 *
 * ```
 * npx tsx scripts/init-db.ts [options]
 *
 * Options:
 *   --reset         Drop and recreate all tables before init
 *   --sql-only      Only generate schema.sql, do not execute
 *   --output <path> Path for generated SQL file (default: schema.sql)
 *   --spec-dir <p>  Path to spec/fhir/r4/ (default: ../../spec/fhir/r4)
 * ```
 *
 * Requires a `.env` file or environment variables for DB connection.
 *
 * @module fhir-persistence/scripts
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { loadBundlesFromFiles } from '@medxai/fhir-core';

import { StructureDefinitionRegistry } from '../src/registry/structure-definition-registry.js';
import { SearchParameterRegistry } from '../src/registry/search-parameter-registry.js';
import type { SearchParameterBundle } from '../src/registry/search-parameter-registry.js';
import { buildSchemaDefinition } from '../src/schema/table-schema-builder.js';
import { generateSchemaDDL, generateSchemaDDLString } from '../src/schema/ddl-generator.js';

const { Pool } = pg;

// =============================================================================
// Section 1: .env Loader (minimal, no external dependency)
// =============================================================================

function loadEnvFile(envPath: string): void {
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// =============================================================================
// Section 2: Argument Parsing
// =============================================================================

interface InitOptions {
  reset: boolean;
  sqlOnly: boolean;
  output: string;
  specDir: string;
}

function parseArgs(args: string[]): InitOptions {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const pkgDir = resolve(scriptDir, '..');
  const rootDir = resolve(pkgDir, '..', '..');

  const options: InitOptions = {
    reset: false,
    sqlOnly: false,
    output: resolve(pkgDir, 'schema.sql'),
    specDir: resolve(rootDir, 'spec', 'fhir', 'r4'),
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--reset':
        options.reset = true;
        break;
      case '--sql-only':
        options.sqlOnly = true;
        break;
      case '--output':
        options.output = resolve(args[++i]);
        break;
      case '--spec-dir':
        options.specDir = resolve(args[++i]);
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: npx tsx scripts/init-db.ts [options]

Options:
  --reset         Drop and recreate all tables before init
  --sql-only      Only generate schema.sql, do not execute against DB
  --output <path> Path for generated SQL file (default: schema.sql)
  --spec-dir <p>  Path to spec/fhir/r4/ directory
  --help, -h      Show this help message
`);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

// =============================================================================
// Section 3: Schema Generation
// =============================================================================

function generateSchema(specDir: string): { ddlString: string; statements: string[]; resourceCount: number } {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const rootDir = resolve(scriptDir, '..', '..', '..');
  const platformDir = resolve(rootDir, 'spec', 'platform');

  // Load FHIR R4 profiles + MedXAI platform profiles (later overrides earlier)
  console.log(`[init-db] Loading FHIR R4 profiles from ${specDir}/profiles-resources.json ...`);
  console.log(`[init-db] Loading MedXAI platform profiles from ${platformDir}/profiles-medxai.json ...`);
  const profilesResult = loadBundlesFromFiles([
    resolve(specDir, 'profiles-resources.json'),
    resolve(platformDir, 'profiles-medxai.json'),
  ]);

  const sdRegistry = new StructureDefinitionRegistry();
  sdRegistry.indexAll(profilesResult.profiles);
  console.log(`[init-db] Indexed ${sdRegistry.getTableResourceTypes().length} resource types`);

  // Load FHIR R4 search parameters + MedXAI platform search parameters
  console.log(`[init-db] Loading search parameters from ${specDir}/search-parameters.json ...`);
  const spBundle = JSON.parse(
    readFileSync(resolve(specDir, 'search-parameters.json'), 'utf8'),
  ) as SearchParameterBundle;

  const spRegistry = new SearchParameterRegistry();
  spRegistry.indexBundle(spBundle);

  const platformSpPath = resolve(platformDir, 'search-parameters-medxai.json');
  console.log(`[init-db] Loading platform search parameters from ${platformSpPath} ...`);
  const platformSpBundle = JSON.parse(
    readFileSync(platformSpPath, 'utf8'),
  ) as SearchParameterBundle;
  const platformSpResult = spRegistry.indexBundle(platformSpBundle);
  console.log(`[init-db] Platform search params: ${platformSpResult.indexed} indexed, ${platformSpResult.skipped} skipped`);

  console.log('[init-db] Building schema definition ...');
  const schema = buildSchemaDefinition(sdRegistry, spRegistry);

  const ddlString = generateSchemaDDLString(schema);
  const statements = generateSchemaDDL(schema);

  return {
    ddlString,
    statements,
    resourceCount: schema.tableSets.length,
  };
}

// =============================================================================
// Section 4: Database Execution
// =============================================================================

async function createDatabaseIfNotExists(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}): Promise<void> {
  // Connect to 'postgres' database to check/create target database
  const adminPool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  try {
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database],
    );

    if (result.rowCount === 0) {
      console.log(`[init-db] Creating database "${config.database}" ...`);
      // Database names cannot be parameterized, but we control this value
      await adminPool.query(`CREATE DATABASE "${config.database}"`);
      console.log(`[init-db] Database "${config.database}" created.`);
    } else {
      console.log(`[init-db] Database "${config.database}" already exists.`);
    }
  } finally {
    await adminPool.end();
  }
}

async function executeSchema(
  statements: string[],
  config: { host: string; port: number; user: string; password: string; database: string },
  reset: boolean,
): Promise<void> {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log(`[init-db] Connected to ${config.host}:${config.port}/${config.database}`);

    if (reset) {
      console.log('[init-db] --reset: Dropping all tables ...');
      // Get all tables in public schema
      const tablesResult = await pool.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
      );
      for (const row of tablesResult.rows) {
        await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
      }
      console.log(`[init-db] Dropped ${tablesResult.rowCount} tables.`);
    }

    // Execute DDL statements
    console.log(`[init-db] Executing ${statements.length} DDL statements ...`);

    let executed = 0;
    let skipped = 0;
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < statements.length; i++) {
      try {
        await pool.query(statements[i]);
        executed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // "already exists" is expected with IF NOT EXISTS — count as skipped
        if (message.includes('already exists')) {
          skipped++;
        } else {
          errors.push({ index: i, error: message });
        }
      }

      // Progress indicator
      if ((i + 1) % 100 === 0 || i === statements.length - 1) {
        process.stdout.write(`\r[init-db] Progress: ${i + 1}/${statements.length}`);
      }
    }

    console.log(''); // newline after progress
    console.log(`[init-db] Done: ${executed} executed, ${skipped} skipped (already exist), ${errors.length} errors`);

    if (errors.length > 0) {
      console.error('[init-db] Errors:');
      for (const e of errors.slice(0, 10)) {
        console.error(`  [${e.index}] ${e.error}`);
      }
      if (errors.length > 10) {
        console.error(`  ... and ${errors.length - 10} more errors`);
      }
    }
  } finally {
    await pool.end();
  }
}

// =============================================================================
// Section 5: Main
// =============================================================================

async function main(): Promise<void> {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const pkgDir = resolve(scriptDir, '..');

  // Load .env
  loadEnvFile(resolve(pkgDir, '.env'));

  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // 1. Generate schema
  const { ddlString, statements, resourceCount } = generateSchema(options.specDir);

  // 2. Write SQL file
  writeFileSync(options.output, ddlString, 'utf8');
  console.log(`[init-db] Schema SQL written to ${options.output}`);
  console.log(`[init-db] ${resourceCount} resource types, ${statements.length} DDL statements`);

  if (options.sqlOnly) {
    console.log('[init-db] --sql-only: Skipping database execution.');
    return;
  }

  // 3. Execute against database
  const dbConfig = {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5433', 10),
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'assert',
    database: process.env['DB_NAME'] ?? 'medxai_dev',
  };

  await createDatabaseIfNotExists(dbConfig);
  await executeSchema(statements, dbConfig, options.reset);

  console.log('[init-db] Database initialization complete.');
}

main().catch((err) => {
  console.error('[init-db] Fatal error:', err);
  process.exit(1);
});
