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
import { buildResourceRow, buildResourceRowWithSearch, buildDeleteRow, buildHistoryRow, buildDeleteHistoryRow } from './row-builder.js';
import { buildUpsertSQL, buildInsertSQL, buildSelectByIdSQL, buildSelectVersionSQL, buildInstanceHistorySQL, buildTypeHistorySQL } from './sql-builder.js';
import { extractReferences } from './reference-indexer.js';

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
  // Private — Row Building
  // ---------------------------------------------------------------------------

  /**
   * Build a main table row, including search columns when registry is available.
   */
  private buildRow(resource: PersistedResource): import('./types.js').ResourceRow {
    if (this.registry) {
      const impls = this.registry.getForResource(resource.resourceType);
      return buildResourceRowWithSearch(resource, impls);
    }
    return buildResourceRow(resource);
  }

  /**
   * Write reference rows for a resource. Deletes existing rows first (replace strategy).
   */
  private async writeReferences(
    client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
    resource: PersistedResource,
  ): Promise<void> {
    if (!this.registry) return;

    const resourceType = resource.resourceType;
    const refTable = `${resourceType}_References`;

    // Delete existing references for this resource
    await this.deleteReferences(client, resourceType, resource.id);

    // Extract and insert new references
    const impls = this.registry.getForResource(resourceType);
    const rows = extractReferences(resource, impls);
    if (rows.length === 0) return;

    for (const row of rows) {
      // Skip rows with non-UUID targetId (References table uses UUID columns)
      if (!isValidUuid(row.targetId)) continue;

      const sql = `INSERT INTO "${refTable}" ("resourceId", "targetId", "code") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`;
      await client.query(sql, [row.resourceId, row.targetId, row.code]);
    }
  }

  /**
   * Delete all reference rows for a resource.
   */
  private async deleteReferences(
    client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
    resourceType: string,
    id: string,
  ): Promise<void> {
    const refTable = `${resourceType}_References`;
    try {
      await client.query(`DELETE FROM "${refTable}" WHERE "resourceId" = $1`, [id]);
    } catch {
      // Table may not exist — skip silently
    }
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

    const mainRow = this.buildRow(persisted);
    const historyRow = buildHistoryRow(persisted);

    await this.db.withTransaction(async (client) => {
      const upsert = buildUpsertSQL(resource.resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resource.resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);

      // Write reference rows
      await this.writeReferences(client, persisted);
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

    const mainRow = this.buildRow(persisted);
    const historyRow = buildHistoryRow(persisted);

    await this.db.withTransaction(async (client) => {
      // Read existing row inside transaction with FOR UPDATE to prevent TOCTOU races
      const lockResult = await client.query(
        `SELECT "content", "deleted" FROM "${resourceType}" WHERE "id" = $1 FOR UPDATE`,
        [id],
      );

      if (lockResult.rows.length === 0) {
        throw new ResourceNotFoundError(resourceType, id);
      }

      const existingRow = lockResult.rows[0] as { content: string; deleted: boolean };
      if (existingRow.deleted) {
        throw new ResourceGoneError(resourceType, id);
      }

      // Optimistic locking check (under row lock — no race possible)
      if (options?.ifMatch) {
        const existing = JSON.parse(existingRow.content) as PersistedResource;
        if (existing.meta.versionId !== options.ifMatch) {
          throw new ResourceVersionConflictError(
            resourceType,
            id,
            options.ifMatch,
            existing.meta.versionId,
          );
        }
      }

      const upsert = buildUpsertSQL(resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);

      // Update reference rows (delete old, write new)
      await this.writeReferences(client, persisted);
    });

    return persisted;
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async deleteResource(resourceType: string, id: string): Promise<void> {
    const now = new Date().toISOString();
    const versionId = randomUUID();

    const mainRow = buildDeleteRow(resourceType, id, now);
    const historyRow = buildDeleteHistoryRow(id, versionId, now);

    await this.db.withTransaction(async (client) => {
      // Read existing row inside transaction with FOR UPDATE to prevent TOCTOU races
      const lockResult = await client.query(
        `SELECT "deleted" FROM "${resourceType}" WHERE "id" = $1 FOR UPDATE`,
        [id],
      );

      if (lockResult.rows.length === 0) {
        throw new ResourceNotFoundError(resourceType, id);
      }

      const existingRow = lockResult.rows[0] as { deleted: boolean };
      if (existingRow.deleted) {
        throw new ResourceGoneError(resourceType, id);
      }

      const upsert = buildUpsertSQL(resourceType, mainRow);
      await client.query(upsert.sql, upsert.values);

      const histInsert = buildInsertSQL(`${resourceType}_History`, historyRow);
      await client.query(histInsert.sql, histInsert.values);

      // Delete reference rows for deleted resource
      await this.deleteReferences(client, resourceType, id);
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
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
