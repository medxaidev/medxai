/**
 * Row Builder — Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  buildResourceRow,
  buildDeleteRow,
  buildHistoryRow,
  buildDeleteHistoryRow,
} from '../../repo/row-builder.js';
import { SCHEMA_VERSION, DELETED_SCHEMA_VERSION } from '../../repo/types.js';
import type { PersistedResource } from '../../repo/types.js';

// =============================================================================
// Helpers
// =============================================================================

function makePatient(overrides?: Partial<PersistedResource>): PersistedResource {
  return {
    resourceType: 'Patient',
    id: '550e8400-e29b-41d4-a716-446655440000',
    meta: {
      versionId: '660e8400-e29b-41d4-a716-446655440001',
      lastUpdated: '2026-02-23T06:00:00.000Z',
    },
    name: [{ family: 'Smith', given: ['John'] }],
    birthDate: '1990-01-01',
    ...overrides,
  } as PersistedResource;
}

// =============================================================================
// buildResourceRow
// =============================================================================

describe('buildResourceRow', () => {
  it('populates all fixed columns', () => {
    const patient = makePatient();
    const row = buildResourceRow(patient);

    expect(row.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(row.lastUpdated).toBe('2026-02-23T06:00:00.000Z');
    expect(row.deleted).toBe(false);
    expect(row.__version).toBe(SCHEMA_VERSION);
    expect(row.projectId).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('serializes resource as JSON in content column', () => {
    const patient = makePatient();
    const row = buildResourceRow(patient);

    const parsed = JSON.parse(row.content);
    expect(parsed.resourceType).toBe('Patient');
    expect(parsed.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(parsed.meta.versionId).toBe('660e8400-e29b-41d4-a716-446655440001');
    expect(parsed.name[0].family).toBe('Smith');
  });

  it('includes _source when present in meta', () => {
    const patient = makePatient({
      meta: {
        versionId: 'v1',
        lastUpdated: '2026-01-01T00:00:00Z',
        source: 'http://example.com',
      },
    });
    const row = buildResourceRow(patient);
    expect(row._source).toBe('http://example.com');
  });

  it('includes _profile when present in meta', () => {
    const patient = makePatient({
      meta: {
        versionId: 'v1',
        lastUpdated: '2026-01-01T00:00:00Z',
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      },
    });
    const row = buildResourceRow(patient);
    expect(row._profile).toEqual(['http://hl7.org/fhir/StructureDefinition/Patient']);
  });

  it('omits _source and _profile when not in meta', () => {
    const patient = makePatient();
    const row = buildResourceRow(patient);
    expect(row._source).toBeUndefined();
    expect(row._profile).toBeUndefined();
  });

  it('populates compartments with patient id for Patient resources', () => {
    const patient = makePatient();
    const row = buildResourceRow(patient);
    expect(row.compartments).toEqual(['550e8400-e29b-41d4-a716-446655440000']);
  });

  it('populates empty compartments for non-Patient resources', () => {
    const obs = {
      resourceType: 'Observation',
      id: 'obs-123',
      meta: { versionId: 'v1', lastUpdated: '2026-01-01T00:00:00Z' },
      status: 'final',
    } as PersistedResource;
    const row = buildResourceRow(obs);
    expect(row.compartments).toEqual([]);
  });

  it('uses meta.project as projectId when present', () => {
    const patient = makePatient({
      meta: {
        versionId: 'v1',
        lastUpdated: '2026-01-01T00:00:00Z',
        project: 'proj-abc-123',
      } as any,
    });
    const row = buildResourceRow(patient);
    expect(row.projectId).toBe('proj-abc-123');
  });
});

// =============================================================================
// buildDeleteRow
// =============================================================================

describe('buildDeleteRow', () => {
  it('sets deleted=true and content to empty string', () => {
    const row = buildDeleteRow('Patient', 'abc-123', '2026-01-01T00:00:00Z');

    expect(row.id).toBe('abc-123');
    expect(row.deleted).toBe(true);
    expect(row.content).toBe('');
    expect(row.__version).toBe(DELETED_SCHEMA_VERSION);
    expect(row.lastUpdated).toBe('2026-01-01T00:00:00Z');
  });

  it('uses DELETED_SCHEMA_VERSION (-1)', () => {
    const row = buildDeleteRow('Observation', 'x', '2026-01-01T00:00:00Z');
    expect(row.__version).toBe(-1);
  });

  it('sets projectId to nil UUID', () => {
    const row = buildDeleteRow('Patient', 'abc', '2026-01-01T00:00:00Z');
    expect(row.projectId).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('sets compartments to empty array for non-Binary', () => {
    const row = buildDeleteRow('Patient', 'abc', '2026-01-01T00:00:00Z');
    expect(row.compartments).toEqual([]);
  });

  it('omits compartments for Binary', () => {
    const row = buildDeleteRow('Binary', 'abc', '2026-01-01T00:00:00Z');
    expect(row.compartments).toBeUndefined();
  });
});

// =============================================================================
// buildHistoryRow
// =============================================================================

describe('buildHistoryRow', () => {
  it('populates all history columns', () => {
    const patient = makePatient();
    const row = buildHistoryRow(patient);

    expect(row.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(row.versionId).toBe('660e8400-e29b-41d4-a716-446655440001');
    expect(row.lastUpdated).toBe('2026-02-23T06:00:00.000Z');
    expect(row.content).toBeTruthy();
  });

  it('serializes full resource in content', () => {
    const patient = makePatient();
    const row = buildHistoryRow(patient);
    const parsed = JSON.parse(row.content);
    expect(parsed.resourceType).toBe('Patient');
    expect(parsed.birthDate).toBe('1990-01-01');
  });
});

// =============================================================================
// buildDeleteHistoryRow
// =============================================================================

describe('buildDeleteHistoryRow', () => {
  it('creates history row with empty content', () => {
    const row = buildDeleteHistoryRow('abc-123', 'ver-456', '2026-01-01T00:00:00Z');

    expect(row.id).toBe('abc-123');
    expect(row.versionId).toBe('ver-456');
    expect(row.lastUpdated).toBe('2026-01-01T00:00:00Z');
    expect(row.content).toBe('');
  });
});
