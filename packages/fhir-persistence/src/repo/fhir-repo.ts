/**
 * FHIR Repository — PostgreSQL Implementation
 *
 * Implements `ResourceRepository` with full CRUD, versioning, history,
 * soft delete, and optimistic locking against PostgreSQL.
 *
 * Design follows Medplum's write path (WF-E2E-001):
 * - UPSERT for main table (create & update share same SQL path)
 * - INSERT for history table (every write = new version snapshot)
 * - All writes in a single transaction
 * - App-side UUID generation for `id` and `versionId`
 *
 * @module fhir-persistence/repo
 */

import { randomUUID } from 'node:crypto';

import type { DatabaseClient } from '../db/client.js';
import type {
  FhirResource,
  PersistedResource,
  ResourceRepository,
  CreateResourceOptions,
  UpdateResourceOptions,
  HistoryOptions,
  HistoryEntry,
  SearchOptions,
  SearchResult,
} from './types.js';
import type { SearchRequest } from '../search/types.js';
import { executeSearch } from '../search/search-executor.js';
import {
  ResourceNotFoundError,
  ResourceGoneError,
  ResourceVersionConflictError,
} from './errors.js';
import { buildResourceRow, buildDeleteRow, buildHistoryRow, buildDeleteHistoryRow } from './row-builder.js';
import { buildUpsertSQL, buildInsertSQL, buildSelectByIdSQL, buildSelectVersionSQL, buildInstanceHistorySQL, buildTypeHistorySQL } from './sql-builder.js';

// =============================================================================
// Section 1: FhirRepository Class
// =============================================================================

export class FhirRepository implements ResourceRepository {
  private readonly db: DatabaseClient;
  private readonly registry: import('../registry/search-parameter-registry.js').SearchParameterRegistry | undefined;

  constructor(
    db: DatabaseClient,
    registry?: import('../registry/search-parameter-registry.js').SearchParameterRegistry,
  ) {
    this.db = db;
    this.registry = registry;
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async createResource<T extends FhirResource>(
    resource: T,
    options?: CreateResourceOptions,
  ): Promise<T & PersistedResource> {
    const now = new Date().toISOString();
    const id = options?.assignedId ?? randomUUID();
    const versionId = randomUUID();

    const persisted = {
      ...resource,
      id,
      meta: {
        ...resource.meta,
        versionId,
        lastUpdated: now,
      },
    } as T & PersistedResource;

    const mainRow = buildResourceRow(persisted);
    const historyRow = buildHistoryRow(persisted);

    await this.db.withTransaction(async (client) => {
      const upsert = buildUpsertSQL(resource.resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resource.resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);
    });

    return persisted;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async readResource(resourceType: string, id: string): Promise<PersistedResource> {
    const sql = buildSelectByIdSQL(resourceType);
    const result = await this.db.query<{ content: string; deleted: boolean }>(sql, [id]);

    if (result.rows.length === 0) {
      throw new ResourceNotFoundError(resourceType, id);
    }

    const row = result.rows[0];
    if (row.deleted) {
      throw new ResourceGoneError(resourceType, id);
    }

    return JSON.parse(row.content) as PersistedResource;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  async updateResource<T extends FhirResource>(
    resource: T,
    options?: UpdateResourceOptions,
  ): Promise<T & PersistedResource> {
    const resourceType = resource.resourceType;
    const id = resource.id;

    if (!id) {
      throw new Error('Resource must have an id for update');
    }

    // Read existing for validation and optimistic locking
    const existing = await this.readResource(resourceType, id);

    // Optimistic locking check
    if (options?.ifMatch && existing.meta.versionId !== options.ifMatch) {
      throw new ResourceVersionConflictError(
        resourceType,
        id,
        options.ifMatch,
        existing.meta.versionId,
      );
    }

    const now = new Date().toISOString();
    const versionId = randomUUID();

    const persisted = {
      ...resource,
      id,
      meta: {
        ...resource.meta,
        versionId,
        lastUpdated: now,
      },
    } as T & PersistedResource;

    const mainRow = buildResourceRow(persisted);
    const historyRow = buildHistoryRow(persisted);

    await this.db.withTransaction(async (client) => {
      const upsert = buildUpsertSQL(resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);
    });

    return persisted;
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async deleteResource(resourceType: string, id: string): Promise<void> {
    // Verify exists and not already deleted
    await this.readResource(resourceType, id);

    const now = new Date().toISOString();
    const versionId = randomUUID();

    const mainRow = buildDeleteRow(resourceType, id, now);
    const historyRow = buildDeleteHistoryRow(id, versionId, now);

    await this.db.withTransaction(async (client) => {
      const upsert = buildUpsertSQL(resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);
    });
  }

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  async readHistory(
    resourceType: string,
    id: string,
    options?: HistoryOptions,
  ): Promise<HistoryEntry[]> {
    const { sql, values } = buildInstanceHistorySQL(
      `${resourceType}_History`,
      id,
      options,
    );
    const result = await this.db.query<HistoryRawRow>(sql, values);
    return result.rows.map((row) => toHistoryEntry(row, resourceType));
  }

  async readTypeHistory(
    resourceType: string,
    options?: HistoryOptions,
  ): Promise<HistoryEntry[]> {
    const { sql, values } = buildTypeHistorySQL(
      `${resourceType}_History`,
      options,
    );
    const result = await this.db.query<HistoryRawRow>(sql, values);
    return result.rows.map((row) => toHistoryEntry(row, resourceType));
  }

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  async searchResources(
    request: SearchRequest,
    options?: SearchOptions,
  ): Promise<SearchResult> {
    if (!this.registry) {
      throw new Error('SearchParameterRegistry is required for search operations');
    }
    return executeSearch(this.db, request, this.registry, options);
  }

  // ---------------------------------------------------------------------------
  // Version Read
  // ---------------------------------------------------------------------------

  async readVersion(
    resourceType: string,
    id: string,
    versionId: string,
  ): Promise<PersistedResource> {
    const sql = buildSelectVersionSQL(`${resourceType}_History`);
    const result = await this.db.query<{ content: string }>(sql, [id, versionId]);

    if (result.rows.length === 0) {
      throw new ResourceNotFoundError(resourceType, `${id}/_history/${versionId}`);
    }

    const content = result.rows[0].content;
    if (content === '') {
      throw new ResourceGoneError(resourceType, id);
    }

    return JSON.parse(content) as PersistedResource;
  }
}

// =============================================================================
// Section 2: Internal Helpers
// =============================================================================

interface HistoryRawRow {
  id: string;
  versionId: string;
  lastUpdated: string;
  content: string;
}

function toHistoryEntry(row: HistoryRawRow, resourceType: string): HistoryEntry {
  const isDeleted = row.content === '';
  return {
    resource: isDeleted ? null : (JSON.parse(row.content) as PersistedResource),
    versionId: row.versionId,
    lastUpdated: typeof row.lastUpdated === 'string'
      ? row.lastUpdated
      : new Date(row.lastUpdated as unknown as number).toISOString(),
    deleted: isDeleted,
    resourceType,
    id: row.id,
  };
}
