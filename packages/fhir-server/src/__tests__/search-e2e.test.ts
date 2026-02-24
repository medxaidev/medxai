/**
 * Search HTTP E2E Tests — Real PostgreSQL (Task 14.4)
 *
 * Full HTTP path tests: Fastify inject() → search routes → real DB.
 * Verifies the complete search pipeline from HTTP request to Bundle response.
 *
 * Requires `npm run db:init` in fhir-persistence to have been run first.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';

import {
  DatabaseClient,
  FhirRepository,
  SearchParameterRegistry,
} from '@medxai/fhir-persistence';
import type { SearchParameterBundle, FhirResource } from '@medxai/fhir-persistence';
import { createApp } from '../app.js';

// =============================================================================
// Setup
// =============================================================================

function loadEnv(): void {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  // Navigate from fhir-server/src/__tests__ to fhir-persistence/.env
  const envPath = resolve(scriptDir, '..', '..', '..', 'fhir-persistence', '.env');
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

let db: DatabaseClient;
let repo: FhirRepository;
let spRegistry: SearchParameterRegistry;
let app: FastifyInstance;

const RUN_ID = randomUUID().slice(0, 8);
const BASE_URL = 'http://localhost:8080/fhir/R4';

beforeAll(async () => {
  loadEnv();
  db = new DatabaseClient({
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5433', 10),
    database: process.env['DB_NAME'] ?? 'medxai_dev',
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'assert',
  });

  const alive = await db.ping();
  if (!alive) {
    throw new Error('Cannot connect to PostgreSQL. Run `npm run db:init` first.');
  }

  // Load SearchParameterRegistry
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const specDir = resolve(scriptDir, '..', '..', '..', '..', 'spec', 'fhir', 'r4');
  const spBundlePath = resolve(specDir, 'search-parameters.json');
  if (!existsSync(spBundlePath)) {
    throw new Error(`search-parameters.json not found at ${spBundlePath}`);
  }
  const spBundle = JSON.parse(readFileSync(spBundlePath, 'utf8')) as SearchParameterBundle;
  spRegistry = new SearchParameterRegistry();
  spRegistry.indexBundle(spBundle);

  repo = new FhirRepository(db, spRegistry);

  app = await createApp({
    repo,
    searchRegistry: spRegistry,
    logger: false,
    baseUrl: BASE_URL,
  });
}, 30_000);

afterAll(async () => {
  try {
    await db.query(
      `DELETE FROM "Observation_History" WHERE "id" IN (SELECT "id" FROM "Observation" WHERE "content"::text LIKE $1)`,
      [`%${RUN_ID}%`],
    );
    await db.query(`DELETE FROM "Observation" WHERE "content"::text LIKE $1`, [`%${RUN_ID}%`]);
    await db.query(
      `DELETE FROM "Patient_History" WHERE "id" IN (SELECT "id" FROM "Patient" WHERE "content"::text LIKE $1)`,
      [`%${RUN_ID}%`],
    );
    await db.query(`DELETE FROM "Patient" WHERE "content"::text LIKE $1`, [`%${RUN_ID}%`]);
  } catch { /* ignore */ }

  if (db && !db.isClosed) {
    await db.close();
  }
});

// =============================================================================
// Helpers
// =============================================================================

async function createPatient(overrides?: Partial<FhirResource>): Promise<FhirResource> {
  return repo.createResource({
    resourceType: 'Patient',
    name: [{ family: `E2E-${RUN_ID}`, given: ['Test'] }],
    birthDate: '1990-01-15',
    gender: 'male',
    active: true,
    ...overrides,
  });
}

// =============================================================================
// Section 1: GET /:resourceType search
// =============================================================================

describe('HTTP Search E2E — GET', () => {
  let patientId1: string;
  let patientId2: string;

  beforeAll(async () => {
    const p1 = await createPatient({
      gender: 'male',
      birthDate: '1990-01-15',
      name: [{ family: `E2E-${RUN_ID}-A`, given: ['Alpha'] }],
    });
    patientId1 = p1.id!;

    const p2 = await createPatient({
      gender: 'female',
      birthDate: '1985-06-20',
      name: [{ family: `E2E-${RUN_ID}-B`, given: ['Beta'] }],
    });
    patientId2 = p2.id!;
  });

  it('GET /Patient?_id=... returns searchset Bundle with match', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.resourceType).toBe('Bundle');
    expect(body.type).toBe('searchset');
    expect(body.entry).toHaveLength(1);
    expect(body.entry[0].resource.id).toBe(patientId1);
  });

  it('GET /Patient?gender=male filters correctly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1},${patientId2}&gender=male`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.resourceType).toBe('Bundle');
    const entries = body.entry ?? [];
    const ids = entries.map((e: any) => e.resource.id);
    expect(ids).toContain(patientId1);
    expect(ids).not.toContain(patientId2);
  });

  it('GET /Patient?_count=1 limits results', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1},${patientId2}&_count=1`,
    });
    const body = JSON.parse(res.body);
    expect(body.entry.length).toBeLessThanOrEqual(1);
  });

  it('Bundle.link.self has correct URL', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1}`,
    });
    const body = JSON.parse(res.body);
    const selfLink = body.link?.find((l: { relation: string }) => l.relation === 'self');
    expect(selfLink).toBeDefined();
    expect(selfLink.url).toContain('Patient');
  });

  it('search entries have search.mode = match', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1}`,
    });
    const body = JSON.parse(res.body);
    for (const entry of body.entry) {
      expect(entry.search?.mode).toBe('match');
    }
  });

  it('search with no matches returns empty Bundle (200)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${randomUUID()}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.resourceType).toBe('Bundle');
    expect(body.type).toBe('searchset');
    expect(body.entry ?? []).toHaveLength(0);
  });

  it('GET /Patient?_total=accurate includes total', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1},${patientId2}&_total=accurate`,
    });
    const body = JSON.parse(res.body);
    expect(body.total).toBe(2);
  });

  it('GET /Patient?birthdate=ge1990-01-01 date prefix search', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1},${patientId2}&birthdate=ge1990-01-01`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const entries = body.entry ?? [];
    const ids = entries.map((e: any) => e.resource.id);
    expect(ids).toContain(patientId1);
    expect(ids).not.toContain(patientId2);
  });

  it('content-type is application/fhir+json', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${patientId1}`,
    });
    expect(res.headers['content-type']).toContain('application/fhir+json');
  });
});

// =============================================================================
// Section 2: POST /:resourceType/_search
// =============================================================================

describe('HTTP Search E2E — POST _search', () => {
  let patientId: string;

  beforeAll(async () => {
    const p = await createPatient({
      gender: 'other',
      name: [{ family: `E2E-${RUN_ID}-POST`, given: ['Post'] }],
    });
    patientId = p.id!;
  });

  it('POST /Patient/_search with form body returns searchset Bundle', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/Patient/_search',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `_id=${patientId}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.resourceType).toBe('Bundle');
    expect(body.type).toBe('searchset');
    expect(body.entry).toHaveLength(1);
    expect(body.entry[0].resource.id).toBe(patientId);
  });
});

// =============================================================================
// Section 3: Phase 15 — Metadata Search HTTP E2E
// =============================================================================

describe('HTTP Search E2E — Phase 15 metadata params', () => {
  let taggedPatientId: string;
  let profiledPatientId: string;
  let sourcedPatientId: string;
  let securedPatientId: string;

  beforeAll(async () => {
    const tagged = await repo.createResource({
      resourceType: 'Patient',
      name: [{ family: `E2E-Tag-${RUN_ID}` }],
      meta: {
        tag: [{ system: 'http://example.com/tags', code: `e2e-${RUN_ID}` }],
      },
    });
    taggedPatientId = tagged.id!;

    const profiled = await repo.createResource({
      resourceType: 'Patient',
      name: [{ family: `E2E-Profile-${RUN_ID}` }],
      meta: {
        profile: [`http://example.com/fhir/StructureDefinition/e2e-${RUN_ID}`],
      },
    });
    profiledPatientId = profiled.id!;

    const sourced = await repo.createResource({
      resourceType: 'Patient',
      name: [{ family: `E2E-Source-${RUN_ID}` }],
      meta: {
        source: `http://example.com/source-${RUN_ID}`,
      },
    });
    sourcedPatientId = sourced.id!;

    const secured = await repo.createResource({
      resourceType: 'Patient',
      name: [{ family: `E2E-Security-${RUN_ID}` }],
      meta: {
        security: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality', code: 'R' }],
      },
    });
    securedPatientId = secured.id!;
  });

  it('GET /Patient?_tag=system|code finds tagged resource', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_tag=${encodeURIComponent(`http://example.com/tags|e2e-${RUN_ID}`)}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const ids = (body.entry ?? []).map((e: any) => e.resource.id);
    expect(ids).toContain(taggedPatientId);
  });

  it('GET /Patient?_profile=url finds profiled resource', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_profile=${encodeURIComponent(`http://example.com/fhir/StructureDefinition/e2e-${RUN_ID}`)}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const ids = (body.entry ?? []).map((e: any) => e.resource.id);
    expect(ids).toContain(profiledPatientId);
  });

  it('GET /Patient?_source=url finds sourced resource', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_source=${encodeURIComponent(`http://example.com/source-${RUN_ID}`)}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const ids = (body.entry ?? []).map((e: any) => e.resource.id);
    expect(ids).toContain(sourcedPatientId);
  });

  it('GET /Patient?_security=system|code finds secured resource', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/Patient?_id=${securedPatientId}&_security=${encodeURIComponent('http://terminology.hl7.org/CodeSystem/v3-Confidentiality|R')}`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.entry).toHaveLength(1);
    expect(body.entry[0].resource.id).toBe(securedPatientId);
  });
});
