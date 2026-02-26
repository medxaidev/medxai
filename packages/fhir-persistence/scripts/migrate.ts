/**
 * Schema Migration CLI
 *
 * Manages incremental database schema migrations.
 *
 * ## Usage
 *
 * ```
 * npx tsx scripts/migrate.ts <command> [options]
 *
 * Commands:
 *   up [version]    Apply pending migrations (optionally up to a version)
 *   down <version>  Revert migrations down to a version (0 = revert all)
 *   status          Show current migration status
 *
 * Options:
 *   --help, -h      Show this help message
 * ```
 *
 * Requires a `.env` file or environment variables for DB connection.
 *
 * @module fhir-persistence/scripts
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { DatabaseClient } from "../src/db/client.js";
import { MigrationRunner } from "../src/migrations/migration-runner.js";
import type { Migration } from "../src/migrations/types.js";

// =============================================================================
// Section 1: .env Loader
// =============================================================================

function loadEnvFile(envPath: string): void {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// =============================================================================
// Section 2: Migration Registry
// =============================================================================

/**
 * Load all migration definitions.
 *
 * In the future, migrations will be loaded from files in a migrations/ directory.
 * For now, they are defined inline here as a registry.
 */
function loadMigrations(): Migration[] {
  // V001: Initial schema baseline — marks the init-db schema as version 1
  const v001: Migration = {
    version: 1,
    description: "Initial schema baseline (marks existing init-db schema as v1)",
    up: [
      // No-op: the schema is already created by init-db.ts
      // This migration exists to establish a baseline version
      `SELECT 1 /* baseline: schema already exists from init-db */`,
    ],
    down: [
      // Reverting baseline would require dropping all tables
      // This is intentionally left as a no-op for safety
      `SELECT 1 /* baseline revert: use init-db --reset instead */`,
    ],
  };

  return [v001];
}

// =============================================================================
// Section 3: CLI
// =============================================================================

function printHelp(): void {
  console.log(`
Usage: npx tsx scripts/migrate.ts <command> [options]

Commands:
  up [version]    Apply pending migrations (optionally up to a version)
  down <version>  Revert migrations down to a version (0 = revert all)
  status          Show current migration status

Options:
  --help, -h      Show this help message

Environment:
  DB_HOST          PostgreSQL host (default: localhost)
  DB_PORT          PostgreSQL port (default: 5433)
  DB_NAME          Database name (default: medxai_dev)
  DB_USER          Database user (default: postgres)
  DB_PASSWORD      Database password (default: assert)
`);
}

async function main(): Promise<void> {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const pkgDir = resolve(scriptDir, "..");
  loadEnvFile(resolve(pkgDir, ".env"));

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  const db = new DatabaseClient({
    host: process.env["DB_HOST"] ?? "localhost",
    port: parseInt(process.env["DB_PORT"] ?? "5433", 10),
    database: process.env["DB_NAME"] ?? "medxai_dev",
    user: process.env["DB_USER"] ?? "postgres",
    password: process.env["DB_PASSWORD"] ?? "assert",
  });

  try {
    const alive = await db.ping();
    if (!alive) {
      console.error("[migrate] Cannot connect to PostgreSQL.");
      process.exit(1);
    }

    const migrations = loadMigrations();
    const runner = new MigrationRunner(db, migrations);

    switch (command) {
      case "up": {
        const targetVersion = args[1] ? parseInt(args[1], 10) : undefined;
        console.log(`[migrate] Applying migrations${targetVersion ? ` up to v${targetVersion}` : ""} ...`);
        const result = await runner.up(targetVersion);
        if (result.action === "none") {
          console.log("[migrate] No pending migrations.");
        } else {
          console.log(`[migrate] Applied: ${result.applied.map((v) => `v${v}`).join(", ")}`);
          if (result.errors.length > 0) {
            for (const e of result.errors) {
              console.error(`[migrate] Error at v${e.version}: ${e.error}`);
            }
          }
        }
        console.log(`[migrate] Current version: ${result.currentVersion}`);
        break;
      }

      case "down": {
        if (!args[1]) {
          console.error("[migrate] Usage: migrate down <version>");
          process.exit(1);
        }
        const targetVersion = parseInt(args[1], 10);
        console.log(`[migrate] Reverting migrations down to v${targetVersion} ...`);
        const result = await runner.down(targetVersion);
        if (result.action === "none") {
          console.log("[migrate] Nothing to revert.");
        } else {
          console.log(`[migrate] Reverted: ${result.applied.map((v) => `v${v}`).join(", ")}`);
          if (result.errors.length > 0) {
            for (const e of result.errors) {
              console.error(`[migrate] Error at v${e.version}: ${e.error}`);
            }
          }
        }
        console.log(`[migrate] Current version: ${result.currentVersion}`);
        break;
      }

      case "status": {
        const status = await runner.status();
        console.log(`[migrate] Current version: ${status.currentVersion}`);
        console.log(`[migrate] Applied: ${status.appliedVersions.length > 0 ? status.appliedVersions.map((v) => `v${v}`).join(", ") : "(none)"}`);
        console.log(`[migrate] Available: ${status.availableVersions.map((v) => `v${v}`).join(", ")}`);
        console.log(`[migrate] Pending: ${status.pendingVersions.length > 0 ? status.pendingVersions.map((v) => `v${v}`).join(", ") : "(none)"}`);
        break;
      }

      default:
        console.error(`[migrate] Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error("[migrate] Fatal error:", err);
  process.exit(1);
});
