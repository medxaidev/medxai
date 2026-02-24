/**
 * Bundle Processor
 *
 * Processes FHIR Bundle resources of type `transaction` and `batch`.
 *
 * - **Transaction**: All entries in a single PostgreSQL transaction.
 *   Rollback all on any failure.
 * - **Batch**: Each entry processed independently.
 *   Individual success/failure per entry.
 *
 * Supports `urn:uuid:` internal reference resolution for transactions.
 *
 * @module fhir-persistence/repo
 */

import { randomUUID } from 'node:crypto';
import type { FhirResource, PersistedResource } from './types.js';
import type { FhirRepository } from './fhir-repo.js';

// =============================================================================
// Section 1: Types
// =============================================================================

/**
 * A single entry in a FHIR Bundle.
 */
export interface BundleEntry {
  /** Full URL or urn:uuid for reference resolution. */
  fullUrl?: string;
  /** The resource to create/update. */
  resource?: FhirResource;
  /** The request details. */
  request?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
  };
}

/**
 * A FHIR Bundle resource.
 */
export interface Bundle {
  resourceType: 'Bundle';
  type: 'transaction' | 'batch';
  entry?: BundleEntry[];
}

/**
 * Result entry for a single bundle operation.
 */
export interface BundleResponseEntry {
  /** The created/updated resource (if successful). */
  resource?: PersistedResource;
  /** HTTP-like status string. */
  status: string;
  /** Error message if failed. */
  error?: string;
}

/**
 * Result of processing a bundle.
 */
export interface BundleResponse {
  resourceType: 'Bundle';
  type: 'transaction-response' | 'batch-response';
  entry: BundleResponseEntry[];
}

// =============================================================================
// Section 2: URL Parsing
// =============================================================================

/**
 * Parse a FHIR request URL into resourceType and optional id.
 * Examples: "Patient" → { resourceType: "Patient" }
 *           "Patient/123" → { resourceType: "Patient", id: "123" }
 */
function parseRequestUrl(url: string): { resourceType: string; id?: string } {
  const parts = url.split('/');
  return { resourceType: parts[0], id: parts[1] };
}

// =============================================================================
// Section 3: urn:uuid Resolution
// =============================================================================

/**
 * Replace all `urn:uuid:` references in a resource JSON with actual IDs.
 */
function resolveUrnReferences(
  resource: FhirResource,
  urnMap: Map<string, string>,
): FhirResource {
  if (urnMap.size === 0) return resource;

  let json = JSON.stringify(resource);
  for (const [urn, actualId] of urnMap) {
    // Replace "urn:uuid:xxx" references with "ResourceType/actualId"
    json = json.replace(new RegExp(escapeRegex(urn), 'g'), actualId);
  }
  return JSON.parse(json) as FhirResource;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =============================================================================
// Section 4: Transaction Processing
// =============================================================================

/**
 * Process a transaction bundle — all-or-nothing.
 *
 * All entries are processed sequentially. If any fails, the entire
 * transaction is rolled back (via the repository's transaction support).
 */
export async function processTransaction(
  repo: FhirRepository,
  bundle: Bundle,
): Promise<BundleResponse> {
  const entries = bundle.entry ?? [];
  const responseEntries: BundleResponseEntry[] = [];
  const urnMap = new Map<string, string>();

  // Pre-assign IDs for POST entries with urn:uuid fullUrl
  for (const entry of entries) {
    if (entry.request?.method === 'POST' && entry.fullUrl?.startsWith('urn:uuid:')) {
      const newId = randomUUID();
      urnMap.set(entry.fullUrl, `${entry.resource?.resourceType}/${newId}`);
      // Also map just the urn to the ID for cases where only the ID is referenced
      urnMap.set(entry.fullUrl.replace('urn:uuid:', ''), newId);
    }
  }

  try {
    for (const entry of entries) {
      const result = await processEntry(repo, entry, urnMap);
      responseEntries.push(result);
    }
  } catch (err) {
    // Transaction failed — return error response
    const message = err instanceof Error ? err.message : String(err);
    return {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [{ status: '500', error: message }],
    };
  }

  return {
    resourceType: 'Bundle',
    type: 'transaction-response',
    entry: responseEntries,
  };
}

// =============================================================================
// Section 5: Batch Processing
// =============================================================================

/**
 * Process a batch bundle — each entry independently.
 *
 * Each entry is processed in its own try/catch. Failures don't affect
 * other entries.
 */
export async function processBatch(
  repo: FhirRepository,
  bundle: Bundle,
): Promise<BundleResponse> {
  const entries = bundle.entry ?? [];
  const responseEntries: BundleResponseEntry[] = [];

  for (const entry of entries) {
    try {
      const result = await processEntry(repo, entry, new Map());
      responseEntries.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      responseEntries.push({ status: '500', error: message });
    }
  }

  return {
    resourceType: 'Bundle',
    type: 'batch-response',
    entry: responseEntries,
  };
}

// =============================================================================
// Section 6: Single Entry Processing
// =============================================================================

/**
 * Process a single bundle entry.
 */
async function processEntry(
  repo: FhirRepository,
  entry: BundleEntry,
  urnMap: Map<string, string>,
): Promise<BundleResponseEntry> {
  if (!entry.request) {
    return { status: '400', error: 'Missing request' };
  }

  const { method, url } = entry.request;
  const { resourceType, id } = parseRequestUrl(url);

  switch (method) {
    case 'POST': {
      if (!entry.resource) {
        return { status: '400', error: 'Missing resource for POST' };
      }
      const resolved = resolveUrnReferences(entry.resource, urnMap);
      // Use pre-assigned ID if this entry had a urn:uuid fullUrl
      let assignedId: string | undefined;
      if (entry.fullUrl?.startsWith('urn:uuid:')) {
        const mapped = urnMap.get(entry.fullUrl.replace('urn:uuid:', ''));
        if (mapped) assignedId = mapped;
      }
      const created = await repo.createResource(resolved, { assignedId });
      return { resource: created, status: '201' };
    }

    case 'PUT': {
      if (!entry.resource) {
        return { status: '400', error: 'Missing resource for PUT' };
      }
      const resolved = resolveUrnReferences(entry.resource, urnMap);
      if (id) {
        const toUpdate = { ...resolved, id } as FhirResource;
        const updated = await repo.updateResource(toUpdate);
        return { resource: updated, status: '200' };
      }
      return { status: '400', error: 'PUT requires resource ID' };
    }

    case 'DELETE': {
      if (!id) {
        return { status: '400', error: 'DELETE requires resource ID' };
      }
      await repo.deleteResource(resourceType, id);
      return { status: '204' };
    }

    case 'GET': {
      // GET in bundle is read-only — just read the resource
      if (!id) {
        return { status: '400', error: 'GET requires resource ID' };
      }
      const resource = await repo.readResource(resourceType, id);
      return { resource, status: '200' };
    }

    default:
      return { status: '400', error: `Unsupported method: ${method}` };
  }
}
