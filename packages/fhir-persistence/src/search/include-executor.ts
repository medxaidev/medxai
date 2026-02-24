/**
 * Include / Revinclude Executor
 *
 * Implements `_include` and `_revinclude` FHIR search features.
 *
 * - `_include`: After primary search, load referenced resources.
 * - `_revinclude`: After primary search, load resources that reference the results.
 *
 * @module fhir-persistence/search
 */

import type { DatabaseClient } from '../db/client.js';
import type { PersistedResource } from '../repo/types.js';
import type { SearchParameterRegistry } from '../registry/search-parameter-registry.js';
import type { IncludeTarget } from './types.js';

// =============================================================================
// Section 1: _include Execution
// =============================================================================

/**
 * Execute `_include` — load resources referenced by the primary search results.
 *
 * Algorithm:
 * 1. For each include target, find the search parameter impl
 * 2. Extract reference column values from primary results
 * 3. Parse reference strings to get target type + ID
 * 4. Batch-load target resources
 * 5. Deduplicate
 *
 * @param db - Database client.
 * @param primaryResults - Primary search results (match resources).
 * @param includes - Parsed _include targets.
 * @param registry - SearchParameterRegistry for resolving reference params.
 * @returns Included resources (deduplicated).
 */
export async function executeInclude(
  db: DatabaseClient,
  primaryResults: PersistedResource[],
  includes: IncludeTarget[],
  registry: SearchParameterRegistry,
): Promise<PersistedResource[]> {
  if (primaryResults.length === 0 || includes.length === 0) {
    return [];
  }

  // Collect all target references: Map<targetResourceType, Set<targetId>>
  const targetsByType = new Map<string, Set<string>>();

  for (const include of includes) {
    const impl = registry.getImpl(include.resourceType, include.searchParam);
    if (!impl || impl.type !== 'reference') continue;

    // Filter primary results to matching source type
    const sourceResults = primaryResults.filter(
      (r) => r.resourceType === include.resourceType,
    );

    for (const resource of sourceResults) {
      const refs = extractReferenceStrings(resource, impl.columnName, impl.array);
      for (const ref of refs) {
        const parsed = parseReference(ref);
        if (!parsed) continue;

        // Apply target type filter if specified
        if (include.targetType && parsed.resourceType !== include.targetType) {
          continue;
        }

        const set = targetsByType.get(parsed.resourceType) ?? new Set();
        set.add(parsed.id);
        targetsByType.set(parsed.resourceType, set);
      }
    }
  }

  // Batch-load all targets
  return batchLoadResources(db, targetsByType, new Set(primaryResults.map((r) => `${r.resourceType}/${r.id}`)));
}

// =============================================================================
// Section 2: _revinclude Execution
// =============================================================================

/**
 * Execute `_revinclude` — load resources that reference the primary search results.
 *
 * Uses the `{ResourceType}_References` table to find reverse references.
 *
 * @param db - Database client.
 * @param primaryResults - Primary search results.
 * @param revincludes - Parsed _revinclude targets.
 * @returns Reverse-included resources (deduplicated).
 */
export async function executeRevinclude(
  db: DatabaseClient,
  primaryResults: PersistedResource[],
  revincludes: IncludeTarget[],
): Promise<PersistedResource[]> {
  if (primaryResults.length === 0 || revincludes.length === 0) {
    return [];
  }

  const primaryIds = primaryResults.map((r) => r.id);
  const primaryKeySet = new Set(primaryResults.map((r) => `${r.resourceType}/${r.id}`));
  const resultsByType = new Map<string, Set<string>>();

  for (const rev of revincludes) {
    const sourceType = rev.resourceType;
    const refTable = `${sourceType}_References`;

    // Query the references table for resources that point to our primary results
    const sql = `SELECT "resourceId" FROM "${refTable}" WHERE "targetId" = ANY($1) AND "code" = $2`;
    try {
      const { rows } = await db.query<{ resourceId: string }>(sql, [primaryIds, rev.searchParam]);
      for (const row of rows) {
        const set = resultsByType.get(sourceType) ?? new Set();
        set.add(row.resourceId);
        resultsByType.set(sourceType, set);
      }
    } catch {
      // Table may not exist or query may fail — skip silently
      continue;
    }
  }

  return batchLoadResources(db, resultsByType, primaryKeySet);
}

// =============================================================================
// Section 3: Helpers
// =============================================================================

/**
 * Extract reference strings from a resource's search column values.
 *
 * For _include, we need to read the reference values from the resource JSON
 * directly (not from search columns), since the search columns store
 * processed values.
 */
function extractReferenceStrings(
  resource: PersistedResource,
  columnName: string,
  isArray: boolean,
): string[] {
  // Navigate the resource JSON to find the reference field
  // The columnName corresponds to the search param code, which maps to a field
  // We need to check common reference field patterns
  const record = resource as unknown as Record<string, unknown>;

  // Try direct field access (e.g., "subject" → resource.subject)
  const value = record[columnName];
  if (!value) return [];

  if (isArray && Array.isArray(value)) {
    return value
      .map((v) => extractRefString(v))
      .filter((r): r is string => r !== null);
  }

  const ref = extractRefString(value);
  return ref ? [ref] : [];
}

/**
 * Extract a reference string from a value (Reference object or string).
 */
function extractRefString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const ref = (value as Record<string, unknown>).reference;
    if (typeof ref === 'string') return ref;
  }
  return null;
}

/**
 * Parse a FHIR reference string into resourceType + id.
 *
 * - `"Patient/123"` → `{ resourceType: "Patient", id: "123" }`
 * - `"http://example.com/fhir/Patient/123"` → `{ resourceType: "Patient", id: "123" }`
 * - `"#contained"` → null
 * - `"urn:uuid:..."` → null
 */
function parseReference(ref: string): { resourceType: string; id: string } | null {
  if (ref.startsWith('#') || ref.startsWith('urn:')) return null;

  // For absolute URLs, extract the last two segments (type/id)
  const segments = ref.split('/');
  if (segments.length < 2) return null;

  const id = segments[segments.length - 1];
  const resourceType = segments[segments.length - 2];

  if (!id || !resourceType) return null;

  return { resourceType, id };
}

/**
 * Batch-load resources by type and ID, excluding already-seen keys.
 */
async function batchLoadResources(
  db: DatabaseClient,
  targetsByType: Map<string, Set<string>>,
  excludeKeys: Set<string>,
): Promise<PersistedResource[]> {
  const results: PersistedResource[] = [];
  const seen = new Set(excludeKeys);

  for (const [resourceType, ids] of targetsByType) {
    const idArray = [...ids].filter((id) => !seen.has(`${resourceType}/${id}`));
    if (idArray.length === 0) continue;

    const sql = `SELECT "content" FROM "${resourceType}" WHERE "id" = ANY($1) AND "deleted" = false`;
    try {
      const { rows } = await db.query<{ content: string }>(sql, [idArray]);
      for (const row of rows) {
        try {
          const resource = JSON.parse(row.content) as PersistedResource;
          const key = `${resource.resourceType}/${resource.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push(resource);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    } catch {
      // Table may not exist — skip
    }
  }

  return results;
}
