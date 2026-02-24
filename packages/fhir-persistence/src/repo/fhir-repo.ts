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

import { randomUUID } from "node:crypto";

import type { DatabaseClient } from "../db/client.js";
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
} from "./types.js";
import type { SearchRequest } from "../search/types.js";
import { executeSearch } from "../search/search-executor.js";
import {
  ResourceNotFoundError,
  ResourceGoneError,
  ResourceVersionConflictError,
  PreconditionFailedError,
} from "./errors.js";
import {
  buildResourceRow,
  buildResourceRowWithSearch,
  buildDeleteRow,
  buildHistoryRow,
  buildDeleteHistoryRow,
} from "./row-builder.js";
import {
  buildUpsertSQL,
  buildInsertSQL,
  buildSelectByIdSQL,
  buildSelectVersionSQL,
  buildInstanceHistorySQL,
  buildTypeHistorySQL,
} from "./sql-builder.js";
import { extractReferences } from "./reference-indexer.js";
import { ResourceCache } from "../cache/resource-cache.js";
import type { ResourceCacheConfig } from "../cache/resource-cache.js";

// =============================================================================
// Section 1: FhirRepository Class
// =============================================================================

export class FhirRepository implements ResourceRepository {
  private readonly db: DatabaseClient;
  private readonly registry:
    | import("../registry/search-parameter-registry.js").SearchParameterRegistry
    | undefined;
  private readonly cache: ResourceCache;

  constructor(
    db: DatabaseClient,
    registry?: import("../registry/search-parameter-registry.js").SearchParameterRegistry,
    cacheConfig?: ResourceCacheConfig,
  ) {
    this.db = db;
    this.registry = registry;
    this.cache = new ResourceCache(cacheConfig);
  }

  /**
   * Get cache statistics (hits, misses, size, hitRate).
   */
  get cacheStats() {
    return this.cache.stats;
  }

  /**
   * Clear the resource cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ---------------------------------------------------------------------------
  // Private — Row Building
  // ---------------------------------------------------------------------------

  /**
   * Build a main table row, including search columns when registry is available.
   */
  private buildRow(
    resource: PersistedResource,
  ): import("./types.js").ResourceRow {
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
      await client.query(`DELETE FROM "${refTable}" WHERE "resourceId" = $1`, [
        id,
      ]);
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

      const histInsert = buildInsertSQL(
        `${resource.resourceType}_History`,
        historyRow,
      );
      await client.query(histInsert.sql, histInsert.values);

      // Write reference rows
      await this.writeReferences(client, persisted);
    });

    return persisted;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async readResource(
    resourceType: string,
    id: string,
  ): Promise<PersistedResource> {
    // Check cache first
    const cached = this.cache.get(resourceType, id);
    if (cached) return cached;

    const sql = buildSelectByIdSQL(resourceType);
    const result = await this.db.query<{ content: string; deleted: boolean }>(
      sql,
      [id],
    );

    if (result.rows.length === 0) {
      throw new ResourceNotFoundError(resourceType, id);
    }

    const row = result.rows[0];
    if (row.deleted) {
      throw new ResourceGoneError(resourceType, id);
    }

    const resource = JSON.parse(row.content) as PersistedResource;
    this.cache.set(resourceType, id, resource);
    return resource;
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
      throw new Error("Resource must have an id for update");
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

      const existingRow = lockResult.rows[0] as {
        content: string;
        deleted: boolean;
      };
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

    // Invalidate cache after successful update
    this.cache.invalidate(resourceType, id);

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

    // Invalidate cache after successful delete
    this.cache.invalidate(resourceType, id);
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
      throw new Error(
        "SearchParameterRegistry is required for search operations",
      );
    }
    return executeSearch(this.db, request, this.registry, options);
  }

  // ---------------------------------------------------------------------------
  // Conditional Create (If-None-Exist)
  // ---------------------------------------------------------------------------

  /**
   * Conditional create: create only if no matching resource exists.
   *
   * @param resource - The resource to create.
   * @param searchRequest - Search criteria (If-None-Exist).
   * @returns The existing or newly created resource, and whether it was created.
   */
  async conditionalCreate<T extends FhirResource>(
    resource: T,
    searchRequest: SearchRequest,
  ): Promise<{ resource: T & PersistedResource; created: boolean }> {
    if (!this.registry) {
      throw new Error(
        "SearchParameterRegistry is required for conditional operations",
      );
    }

    // Search for existing match
    const result = await executeSearch(this.db, searchRequest, this.registry);
    if (result.resources.length > 0) {
      // Resource already exists — return it without creating
      return {
        resource: result.resources[0] as T & PersistedResource,
        created: false,
      };
    }

    // No match — create normally
    const created = await this.createResource(resource);
    return { resource: created, created: true };
  }

  // ---------------------------------------------------------------------------
  // Conditional Update
  // ---------------------------------------------------------------------------

  /**
   * Conditional update: search-based PUT.
   *
   * - 0 matches → create
   * - 1 match → update that resource
   * - 2+ matches → 412 Precondition Failed
   */
  async conditionalUpdate<T extends FhirResource>(
    resource: T,
    searchRequest: SearchRequest,
  ): Promise<{ resource: T & PersistedResource; created: boolean }> {
    if (!this.registry) {
      throw new Error(
        "SearchParameterRegistry is required for conditional operations",
      );
    }

    const result = await executeSearch(this.db, searchRequest, this.registry);

    if (result.resources.length > 1) {
      throw new PreconditionFailedError(
        resource.resourceType,
        result.resources.length,
      );
    }

    if (result.resources.length === 1) {
      // Update existing
      const existing = result.resources[0];
      const toUpdate = { ...resource, id: existing.id } as T;
      const updated = await this.updateResource(toUpdate);
      return { resource: updated, created: false };
    }

    // No match — create
    const created = await this.createResource(resource);
    return { resource: created, created: true };
  }

  // ---------------------------------------------------------------------------
  // Conditional Delete
  // ---------------------------------------------------------------------------

  /**
   * Conditional delete: delete all resources matching search criteria.
   *
   * @returns Number of resources deleted.
   */
  async conditionalDelete(
    resourceType: string,
    searchRequest: SearchRequest,
  ): Promise<number> {
    if (!this.registry) {
      throw new Error(
        "SearchParameterRegistry is required for conditional operations",
      );
    }

    const result = await executeSearch(this.db, searchRequest, this.registry);
    let count = 0;

    for (const resource of result.resources) {
      try {
        await this.deleteResource(resourceType, resource.id);
        count++;
      } catch {
        // Skip already-deleted or not-found
      }
    }

    return count;
  }

  // ---------------------------------------------------------------------------
  // $everything (Patient Compartment Export)
  // ---------------------------------------------------------------------------

  /**
   * Patient $everything: returns the Patient plus all resources in its compartment.
   *
   * Uses the compartments UUID[] column for efficient lookup.
   */
  async everything(
    resourceType: string,
    id: string,
    compartmentResourceTypes: string[],
  ): Promise<PersistedResource[]> {
    // Read the focal resource first
    const focal = await this.readResource(resourceType, id);
    const results: PersistedResource[] = [focal];

    // Search each compartment resource type
    for (const rt of compartmentResourceTypes) {
      try {
        const { rows } = await this.db.query<{
          content: string;
          deleted: boolean;
        }>(
          `SELECT "content", "deleted" FROM "${rt}" WHERE "deleted" = false AND "compartments" @> ARRAY[$1]::uuid[]`,
          [id],
        );
        for (const row of rows) {
          if (!row.deleted && row.content) {
            try {
              results.push(JSON.parse(row.content) as PersistedResource);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } catch {
        // Table may not exist — skip
      }
    }

    return results;
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
    const result = await this.db.query<{ content: string }>(sql, [
      id,
      versionId,
    ]);

    if (result.rows.length === 0) {
      throw new ResourceNotFoundError(
        resourceType,
        `${id}/_history/${versionId}`,
      );
    }

    const content = result.rows[0].content;
    if (content === "") {
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function toHistoryEntry(
  row: HistoryRawRow,
  resourceType: string,
): HistoryEntry {
  const isDeleted = row.content === "";
  return {
    resource: isDeleted ? null : (JSON.parse(row.content) as PersistedResource),
    versionId: row.versionId,
    lastUpdated:
      typeof row.lastUpdated === "string"
        ? row.lastUpdated
        : new Date(row.lastUpdated as unknown as number).toISOString(),
    deleted: isDeleted,
    resourceType,
    id: row.id,
  };
}
