/**
 * FHIR Search Route Handlers
 *
 * Implements FHIR search interactions:
 * - GET /:resourceType (search via query string)
 * - POST /:resourceType/_search (search via form-encoded body)
 *
 * @module fhir-server/routes
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type {
  ResourceRepository,
  SearchParameterRegistry,
  SearchRequest,
} from "@medxai/fhir-persistence";
import {
  parseSearchRequest,
  buildSearchBundle,
  buildSelfLink,
  buildNextLink,
  buildPaginationContext,
  DEFAULT_SEARCH_COUNT,
} from "@medxai/fhir-persistence";
import { FHIR_JSON } from "../fhir/response.js";
import { errorToOutcome } from "../fhir/outcomes.js";

// =============================================================================
// Section 1: Route Parameter Types
// =============================================================================

interface ResourceTypeParams {
  resourceType: string;
}

// =============================================================================
// Section 2: Route Registration
// =============================================================================

/**
 * Register FHIR search routes on a Fastify instance.
 *
 * Expects:
 * - `fastify.repo` — ResourceRepository
 * - `fastify.searchRegistry` — SearchParameterRegistry
 * - `fastify.baseUrl` — Base URL string
 */
export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = (fastify as any).repo as ResourceRepository;
  const registry = (fastify as any).searchRegistry as SearchParameterRegistry;
  const serverBaseUrl = (fastify as any).baseUrl as string;

  // ── GET /:resourceType (search via query string) ─────────────────────────
  fastify.get<{ Params: ResourceTypeParams; Querystring: Record<string, string> }>(
    "/:resourceType",
    async (request, reply) => {
      const { resourceType } = request.params;
      const queryParams = request.query;

      try {
        return await handleSearch(
          repo,
          registry,
          resourceType,
          queryParams,
          request,
          reply,
          serverBaseUrl,
        );
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        reply.status(status).header("content-type", FHIR_JSON);
        return outcome;
      }
    },
  );

  // ── POST /:resourceType/_search (search via form body) ───────────────────
  fastify.post<{ Params: ResourceTypeParams; Body: Record<string, string> }>(
    "/:resourceType/_search",
    async (request, reply) => {
      const { resourceType } = request.params;
      const bodyParams = (request.body ?? {}) as Record<string, string>;

      try {
        return await handleSearch(
          repo,
          registry,
          resourceType,
          bodyParams,
          request,
          reply,
          serverBaseUrl,
        );
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        reply.status(status).header("content-type", FHIR_JSON);
        return outcome;
      }
    },
  );
}

// =============================================================================
// Section 3: Search Handler
// =============================================================================

/**
 * Shared search handler for both GET and POST search routes.
 */
async function handleSearch(
  repo: ResourceRepository,
  registry: SearchParameterRegistry,
  resourceType: string,
  queryParams: Record<string, string>,
  request: FastifyRequest,
  reply: FastifyReply,
  serverBaseUrl: string,
): Promise<unknown> {
  // Parse the search request
  const searchRequest: SearchRequest = parseSearchRequest(
    resourceType,
    queryParams,
    registry,
  );

  // Execute search
  const result = await repo.searchResources(searchRequest, {
    total: searchRequest.total,
  });

  // Build pagination context
  const baseUrl = serverBaseUrl || getBaseUrl(request);
  const count = searchRequest.count ?? DEFAULT_SEARCH_COUNT;
  const offset = searchRequest.offset ?? 0;

  const paginationCtx = buildPaginationContext(
    baseUrl,
    resourceType,
    queryParams,
    count,
    offset,
    result.resources.length,
  );

  // Build Bundle
  const bundle = buildSearchBundle(result.resources, {
    baseUrl,
    total: result.total,
    selfUrl: buildSelfLink(paginationCtx),
    nextUrl: buildNextLink(paginationCtx),
    included: result.included,
  });

  reply.header("content-type", FHIR_JSON);
  return bundle;
}

// =============================================================================
// Section 4: Helpers
// =============================================================================

/**
 * Extract the base URL from a Fastify request.
 */
function getBaseUrl(request: FastifyRequest): string {
  const protocol = request.protocol;
  const host = request.hostname;
  return `${protocol}://${host}`;
}
