/**
 * Phase 19 — Lookup Tables, Trigram Indexes, Shared Tokens — Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { SearchParameterRegistry } from '../../registry/search-parameter-registry.js';
import type { SearchParameterImpl } from '../../registry/search-parameter-registry.js';
import { buildResourceTableSet } from '../../schema/table-schema-builder.js';
import { generateCreateLookupTable } from '../../schema/ddl-generator.js';
import { StructureDefinitionRegistry } from '../../registry/structure-definition-registry.js';

// =============================================================================
// Helpers
// =============================================================================

function makeImpl(overrides: Partial<SearchParameterImpl> & { code: string; type: SearchParameterImpl['type'] }): SearchParameterImpl {
  return {
    resourceTypes: ['Patient'],
    expression: '',
    strategy: 'column',
    columnName: overrides.code,
    columnType: 'TEXT',
    array: false,
    ...overrides,
  };
}

function makeMinimalRegistries() {
  const sdRegistry = new StructureDefinitionRegistry();
  sdRegistry.index({
    resourceType: 'StructureDefinition',
    id: 'Patient',
    url: 'http://hl7.org/fhir/StructureDefinition/Patient',
    name: 'Patient',
    status: 'active',
    kind: 'resource',
    abstract: false,
    type: 'Patient',
    snapshot: { element: [{ id: 'Patient', path: 'Patient' }] },
  } as any);

  const spRegistry = new SearchParameterRegistry();
  return { sdRegistry, spRegistry };
}

// =============================================================================
// Lookup Table Schema
// =============================================================================

describe('Phase 19 — lookup table schema generation', () => {
  it('generates lookup sub-tables for lookup-table strategy params', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    spRegistry.indexImpl('Patient', makeImpl({
      code: 'name',
      type: 'string',
      strategy: 'lookup-table',
      columnName: 'name',
    }));
    spRegistry.indexImpl('Patient', makeImpl({
      code: 'address',
      type: 'string',
      strategy: 'lookup-table',
      columnName: 'address',
    }));

    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);
    expect(tableSet.lookupTables).toBeDefined();
    expect(tableSet.lookupTables).toHaveLength(2);

    const nameTable = tableSet.lookupTables!.find(t => t.searchParamCode === 'name');
    expect(nameTable).toBeDefined();
    expect(nameTable!.tableName).toBe('Patient_Name');
    expect(nameTable!.columns).toHaveLength(4); // resourceId, index, value, system
    expect(nameTable!.compositePrimaryKey).toEqual(['resourceId', 'index']);

    const addrTable = tableSet.lookupTables!.find(t => t.searchParamCode === 'address');
    expect(addrTable).toBeDefined();
    expect(addrTable!.tableName).toBe('Patient_Address');
  });

  it('does not generate lookup tables for non-lookup-table strategy', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    spRegistry.indexImpl('Patient', makeImpl({
      code: 'gender',
      type: 'token',
      strategy: 'token-column',
      columnName: 'gender',
    }));

    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);
    expect(tableSet.lookupTables).toBeUndefined();
  });

  it('generates valid DDL for lookup table', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    spRegistry.indexImpl('Patient', makeImpl({
      code: 'name',
      type: 'string',
      strategy: 'lookup-table',
      columnName: 'name',
    }));

    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);
    const ddl = generateCreateLookupTable(tableSet.lookupTables![0]);
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS "Patient_Name"');
    expect(ddl).toContain('"resourceId" UUID NOT NULL');
    expect(ddl).toContain('"value" TEXT NOT NULL');
    expect(ddl).toContain('PRIMARY KEY');
  });
});

// =============================================================================
// Shared Token Columns
// =============================================================================

describe('Phase 19 — shared token columns in schema', () => {
  it('main table includes __sharedTokens and __sharedTokensText columns', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);

    const colNames = tableSet.main.columns.map(c => c.name);
    expect(colNames).toContain('__sharedTokens');
    expect(colNames).toContain('__sharedTokensText');
  });

  it('main table includes GIN index on __sharedTokens', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);

    const indexNames = tableSet.main.indexes.map(i => i.name);
    expect(indexNames).toContain('Patient___sharedTokens_idx');
  });
});

// =============================================================================
// Trigram Indexes
// =============================================================================

describe('Phase 19 — trigram indexes in schema', () => {
  it('generates trigram indexes for token-column text columns', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    spRegistry.indexImpl('Patient', makeImpl({
      code: 'identifier',
      type: 'token',
      strategy: 'token-column',
      columnName: 'identifier',
    }));

    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);
    const indexNames = tableSet.main.indexes.map(i => i.name);
    expect(indexNames).toContain('Patient___identifierText_trgm_idx');
  });

  it('generates trigram indexes for fixed metadata text columns', () => {
    const { sdRegistry, spRegistry } = makeMinimalRegistries();
    const tableSet = buildResourceTableSet('Patient', sdRegistry, spRegistry);

    const indexNames = tableSet.main.indexes.map(i => i.name);
    expect(indexNames).toContain('Patient___tagText_trgm_idx');
    expect(indexNames).toContain('Patient___securityText_trgm_idx');
  });
});
