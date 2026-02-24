/**
 * Row Builder
 *
 * Converts a FHIR resource into a database row for the main table
 * and history table. Handles fixed columns and (future) search columns.
 *
 * Phase 9 MVP: populates fixed columns + content JSON only.
 * Search column population will be added incrementally.
 *
 * @module fhir-persistence/repo
 */

import type {
  PersistedResource,
  ResourceRow,
  HistoryRow,
} from './types.js';
import { SCHEMA_VERSION, DELETED_SCHEMA_VERSION } from './types.js';
import type { SearchParameterImpl } from '../registry/search-parameter-registry.js';
import { buildSearchColumns, buildMetadataColumns } from './row-indexer.js';

// =============================================================================
// Section 1: Main Table Row
// =============================================================================

/**
 * Build a main table row from a persisted FHIR resource.
 *
 * Populates:
 * - Fixed columns: `id`, `content`, `lastUpdated`, `deleted`, `__version`
 * - Meta columns: `_source`, `_profile`
 * - (Future) Search columns via SearchParameterRegistry + FHIRPath
 *
 * @param resource - The persisted resource (must have `id` and `meta`).
 * @returns A `ResourceRow` ready for SQL insertion.
 */
export function buildResourceRow(resource: PersistedResource): ResourceRow {
  const row: ResourceRow = {
    id: resource.id,
    content: JSON.stringify(resource),
    lastUpdated: resource.meta.lastUpdated,
    deleted: false,
    projectId: (resource.meta as Record<string, unknown>)['project'] as string ?? '00000000-0000-0000-0000-000000000000',
    __version: SCHEMA_VERSION,
    compartments: resource.resourceType === 'Binary'
      ? undefined
      : buildCompartments(resource),
  };

  // Optional meta columns
  if (resource.meta.source) {
    row._source = resource.meta.source;
  }

  if (resource.meta.profile && resource.meta.profile.length > 0) {
    row._profile = resource.meta.profile;
  }

  return row;
}

/**
 * Build a main table row with search column values populated.
 *
 * Extends `buildResourceRow()` by extracting search parameter values
 * from the resource JSON and merging them into the row.
 *
 * @param resource - The persisted resource.
 * @param searchImpls - SearchParameterImpl list for this resource type.
 * @returns A `ResourceRow` with both fixed and search columns.
 */
export function buildResourceRowWithSearch(
  resource: PersistedResource,
  searchImpls: SearchParameterImpl[],
): ResourceRow {
  const fixedRow = buildResourceRow(resource);
  const searchCols = buildSearchColumns(resource, searchImpls);
  const metadataCols = buildMetadataColumns(resource);
  return { ...fixedRow, ...searchCols, ...metadataCols };
}

// =============================================================================
// Section 1b: Compartment Extraction (MVP)
// =============================================================================

/**
 * Build compartments array for a resource.
 *
 * Phase 9 MVP: only Patient resources get their own ID as compartment.
 * Full FHIRPath-based compartment extraction (from CompartmentDefinition)
 * will be added in a future phase.
 *
 * @param resource - The persisted resource.
 * @returns Array of compartment UUIDs.
 */
function buildCompartments(resource: PersistedResource): string[] {
  if (resource.resourceType === 'Patient') {
    return [resource.id];
  }
  // Future: extract Patient references from CompartmentDefinition
  return [];
}

// =============================================================================
// Section 2: Delete Row
// =============================================================================

/**
 * Build a main table row for a soft-deleted resource.
 *
 * Sets `deleted=true`, `content=''`, `__version=-1`.
 * All search columns will be null (not populated).
 *
 * @param resourceType - The resource type.
 * @param id - The resource ID.
 * @param lastUpdated - The deletion timestamp.
 * @returns A `ResourceRow` representing the deleted state.
 */
export function buildDeleteRow(
  resourceType: string,
  id: string,
  lastUpdated: string,
): ResourceRow {
  return {
    id,
    content: '',
    lastUpdated,
    deleted: true,
    projectId: '00000000-0000-0000-0000-000000000000',
    __version: DELETED_SCHEMA_VERSION,
    compartments: resourceType === 'Binary' ? undefined : [],
  };
}

// =============================================================================
// Section 3: History Table Row
// =============================================================================

/**
 * Build a history table row from a persisted FHIR resource.
 *
 * @param resource - The persisted resource.
 * @returns A `HistoryRow` for the history table.
 */
export function buildHistoryRow(resource: PersistedResource): HistoryRow {
  return {
    id: resource.id,
    versionId: resource.meta.versionId,
    lastUpdated: resource.meta.lastUpdated,
    content: JSON.stringify(resource),
  };
}

/**
 * Build a history table row for a delete event.
 *
 * @param id - The resource ID.
 * @param versionId - The versionId for this delete event.
 * @param lastUpdated - The deletion timestamp.
 * @returns A `HistoryRow` with empty content.
 */
export function buildDeleteHistoryRow(
  id: string,
  versionId: string,
  lastUpdated: string,
): HistoryRow {
  return {
    id,
    versionId,
    lastUpdated,
    content: '',
  };
}
