/**
 * Dev Server Bootstrap
 *
 * Starts the FHIR server with seed data for Console testing.
 *
 * Usage:
 *   npx tsx scripts/dev-server.mts
 *
 * Env vars (all optional, defaults shown):
 *   DB_HOST=localhost  DB_PORT=5433  DB_NAME=medxai_dev
 *   DB_USER=postgres   DB_PASSWORD=assert
 *   ADMIN_EMAIL=admin@medxai.test  ADMIN_PASSWORD=medxai123
 *   PORT=8080
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { DatabaseClient, FhirRepository, SearchParameterRegistry } from "@medxai/fhir-persistence";
import type { SearchParameterBundle } from "@medxai/fhir-persistence";
import { createApp, seedDatabase, initKeys, seedConformanceResources } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
const DB_HOST = process.env["DB_HOST"] ?? "localhost";
const DB_PORT = parseInt(process.env["DB_PORT"] ?? "5433", 10);
const DB_NAME = process.env["DB_NAME"] ?? "medxai_dev";
const DB_USER = process.env["DB_USER"] ?? "postgres";
const DB_PASSWORD = process.env["DB_PASSWORD"] ?? "assert";

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@medxai.test";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "medxai123";
const PORT = parseInt(process.env["PORT"] ?? "8080", 10);
const BASE_URL = `http://localhost:${PORT}`;

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║       MedXAI FHIR Server — Dev Mode       ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log();

  // 1. Connect to database
  console.log(`[DB] Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
  const db = new DatabaseClient({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  const alive = await db.ping();
  if (!alive) {
    console.error("[DB] ❌ Cannot connect to PostgreSQL. Make sure it is running.");
    process.exit(1);
  }
  console.log("[DB] ✅ Connected");

  // 2. Load search parameters
  const specDir = resolve(__dirname, "..", "..", "..", "spec", "fhir", "r4");
  const platformDir = resolve(__dirname, "..", "..", "..", "spec", "platform");
  const spBundlePath = resolve(specDir, "search-parameters.json");
  const platformSpPath = resolve(platformDir, "search-parameters-medxai.json");

  const spRegistry = new SearchParameterRegistry();
  if (existsSync(spBundlePath)) {
    const spBundle = JSON.parse(readFileSync(spBundlePath, "utf8")) as SearchParameterBundle;
    spRegistry.indexBundle(spBundle);
    console.log("[SP] ✅ Loaded R4 search parameters");
  } else {
    console.warn(`[SP] ⚠️  search-parameters.json not found at ${spBundlePath}`);
  }
  if (existsSync(platformSpPath)) {
    const platformBundle = JSON.parse(readFileSync(platformSpPath, "utf8")) as SearchParameterBundle;
    spRegistry.indexBundle(platformBundle);
    console.log("[SP] ✅ Loaded platform search parameters");
  }

  // 3. Create system repo
  const systemRepo = new FhirRepository(db, spRegistry);

  // 4. Initialize JWT keys
  console.log("[Auth] Initializing JWT keys...");
  await initKeys(systemRepo, BASE_URL);
  console.log("[Auth] ✅ JWT keys ready");

  // 5. Seed database (idempotent-ish — creates if not exists)
  console.log("[Seed] Seeding platform resources...");
  try {
    const seed = await seedDatabase(systemRepo, {
      adminEmail: ADMIN_EMAIL,
      adminPassword: ADMIN_PASSWORD,
    });
    console.log("[Seed] ✅ Seed complete");
    console.log(`  Project:  ${seed.project.id} (Super Admin)`);
    console.log(`  User:     ${seed.user.id} (${ADMIN_EMAIL})`);
    console.log(`  Client:   ${seed.client.id}`);
    console.log(`  Secret:   ${seed.clientSecret}`);
  } catch (err: any) {
    // If duplicate, that's OK — resources already exist
    if (err.message?.includes("duplicate") || err.message?.includes("already exists")) {
      console.log("[Seed] ℹ️  Platform resources already exist (skipped)");
    } else {
      console.error("[Seed] ❌ Seed failed:", err.message);
      process.exit(1);
    }
  }

  // 6. Seed conformance resources (CodeSystem, ValueSet, StructureDefinition)
  if (process.env["SKIP_CONFORMANCE"] !== "1") {
    console.log("[Conformance] Seeding conformance resources (this may take a minute)...");
    try {
      const confResult = await seedConformanceResources(systemRepo, {
        specDir,
        platformDir,
        skipExisting: true,
        onProgress: (msg) => console.log(`  ${msg}`),
      });
      console.log(`[Conformance] ✅ Done — created: ${confResult.created}, skipped: ${confResult.skipped}, failed: ${confResult.failed}`);
      for (const [type, counts] of Object.entries(confResult.byType)) {
        console.log(`    ${type}: created=${counts.created} skipped=${counts.skipped} failed=${counts.failed}`);
      }
      if (confResult.errors.length > 0) {
        console.log(`[Conformance] First 5 errors:`);
        for (const e of confResult.errors.slice(0, 5)) {
          console.log(`    ${e.resourceType}/${e.id}: ${e.error}`);
        }
      }
    } catch (err: any) {
      console.warn("[Conformance] ⚠️  Seed failed (non-fatal):", err.message);
    }
  } else {
    console.log("[Conformance] ℹ️  Skipped (SKIP_CONFORMANCE=1)");
  }

  // 7. Create and start the server
  console.log("[Server] Creating Fastify app...");
  const app = await createApp({
    repo: systemRepo,
    systemRepo,
    searchRegistry: spRegistry,
    logger: false,
    baseUrl: BASE_URL,
    enableAuth: true,
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });

  console.log();
  console.log("╔═══════════════════════════════════════════╗");
  console.log(`║  🚀 Server running at ${BASE_URL}         ║`);
  console.log("╠═══════════════════════════════════════════╣");
  console.log(`║  Admin:  ${ADMIN_EMAIL.padEnd(32)}║`);
  console.log(`║  Pass:   ${ADMIN_PASSWORD.padEnd(32)}║`);
  console.log("╚═══════════════════════════════════════════╝");
  console.log();
  console.log("Console: http://localhost:3001");
  console.log("Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
