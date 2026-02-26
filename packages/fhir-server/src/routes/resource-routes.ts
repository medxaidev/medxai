/**
 * FHIR Resource Route Handlers
 *
 * Implements the 6 FHIR REST interactions for resource CRUD + history:
 * - POST /:resourceType (create)
 * - GET /:resourceType/:id (read)
 * - PUT /:resourceType/:id (update)
 * - DELETE /:resourceType/:id (delete)
 * - GET /:resourceType/:id/_history (history-instance)
 * - GET /:resourceType/:id/_history/:vid (vread)
 *
 * @module fhir-server/routes
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ResourceRepository, FhirResource, HistoryOptions } from "@medxai/fhir-persistence";
import { buildHistoryBundle } from "@medxai/fhir-persistence";
import { FHIR_JSON, buildETag, buildLastModified, buildLocationHeader, parseETag } from "../fhir/response.js";
import { allOk, badRequest, errorToOutcome } from "../fhir/outcomes.js";
import type { ResourceValidator } from "../app.js";
import { getOperationContext } from "../auth/middleware.js";

// =============================================================================
// Section 1: Route Parameter Types
// =============================================================================

interface ResourceTypeParams {
  resourceType: string;
}

interface ResourceIdParams extends ResourceTypeParams {
  id: string;
}

interface VersionIdParams extends ResourceIdParams {
  vid: string;
}

interface HistoryQuerystring {
  _since?: string;
  _count?: string;
}

// =============================================================================
// Section 2: Route Registration
// =============================================================================

/**
 * Register all FHIR resource routes on a Fastify instance.
 *
 * Expects `fastify.repo` to be decorated with a `ResourceRepository`.
 */
export async function resourceRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = (fastify as FastifyInstance & { repo: ResourceRepository }).repo;
  const validator = (fastify as FastifyInstance & { resourceValidator: ResourceValidator | null }).resourceValidator;

  // ── POST /:resourceType (create) ──────────────────────────────────────────
  fastify.post<{ Params: ResourceTypeParams; Body: FhirResource }>(
    "/:resourceType",
    async (request, reply) => {
      const { resourceType } = request.params;
      const body = request.body;

      if (!body || typeof body !== "object") {
        return sendOutcome(reply, 400, badRequest("Request body is required"));
      }

      if (body.resourceType && body.resourceType !== resourceType) {
        return sendOutcome(
          reply,
          400,
          badRequest(
            `Resource type in body (${body.resourceType}) does not match URL (${resourceType})`,
          ),
        );
      }

      const resource: FhirResource = { ...body, resourceType };

      // Validation gate — if validator is configured, validate before persistence
      if (validator) {
        const vResult = await validator(resource as unknown as Record<string, unknown>);
        if (!vResult.valid) {
          return sendOutcome(reply, 422, {
            resourceType: "OperationOutcome",
            issue: (vResult.issues ?? []).map((i) => ({
              severity: i.severity as "error",
              code: i.code,
              diagnostics: i.diagnostics,
            })),
          });
        }
      }

      try {
        const context = getOperationContext(request);
        const created = await repo.createResource(resource, undefined, context);
        const baseUrl = getBaseUrl(request);

        reply
          .status(201)
          .header("content-type", FHIR_JSON)
          .header("etag", buildETag(created.meta.versionId))
          .header("last-modified", buildLastModified(created.meta.lastUpdated))
          .header(
            "location",
            buildLocationHeader(baseUrl, resourceType, created.id, created.meta.versionId),
          );
        return created;
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );

  // ── GET /:resourceType/:id (read) ─────────────────────────────────────────
  fastify.get<{ Params: ResourceIdParams }>(
    "/:resourceType/:id",
    async (request, reply) => {
      const { resourceType, id } = request.params;

      try {
        const context = getOperationContext(request);
        const resource = await repo.readResource(resourceType, id, context);
        reply
          .header("content-type", FHIR_JSON)
          .header("etag", buildETag(resource.meta.versionId))
          .header("last-modified", buildLastModified(resource.meta.lastUpdated));
        return resource;
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );

  // ── PUT /:resourceType/:id (update) ───────────────────────────────────────
  fastify.put<{ Params: ResourceIdParams; Body: FhirResource }>(
    "/:resourceType/:id",
    async (request, reply) => {
      const { resourceType, id } = request.params;
      const body = request.body;

      if (!body || typeof body !== "object") {
        return sendOutcome(reply, 400, badRequest("Request body is required"));
      }

      if (body.resourceType && body.resourceType !== resourceType) {
        return sendOutcome(
          reply,
          400,
          badRequest(
            `Resource type in body (${body.resourceType}) does not match URL (${resourceType})`,
          ),
        );
      }

      if (body.id && body.id !== id) {
        return sendOutcome(
          reply,
          400,
          badRequest(
            `Resource id in body (${body.id}) does not match URL (${id})`,
          ),
        );
      }

      const resource: FhirResource = { ...body, resourceType, id };

      // Validation gate — if validator is configured, validate before persistence
      if (validator) {
        const vResult = await validator(resource as unknown as Record<string, unknown>);
        if (!vResult.valid) {
          return sendOutcome(reply, 422, {
            resourceType: "OperationOutcome",
            issue: (vResult.issues ?? []).map((i) => ({
              severity: i.severity as "error",
              code: i.code,
              diagnostics: i.diagnostics,
            })),
          });
        }
      }

      // Parse If-Match header for optimistic locking
      const ifMatchHeader = request.headers["if-match"];
      const ifMatch = ifMatchHeader ? parseETag(ifMatchHeader as string) : undefined;

      try {
        const context = getOperationContext(request);
        const updated = await repo.updateResource(resource, { ifMatch }, context);
        reply
          .header("content-type", FHIR_JSON)
          .header("etag", buildETag(updated.meta.versionId))
          .header("last-modified", buildLastModified(updated.meta.lastUpdated));
        return updated;
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );

  // ── DELETE /:resourceType/:id (delete) ────────────────────────────────────
  fastify.delete<{ Params: ResourceIdParams }>(
    "/:resourceType/:id",
    async (request, reply) => {
      const { resourceType, id } = request.params;

      try {
        const context = getOperationContext(request);
        await repo.deleteResource(resourceType, id, context);
        reply.header("content-type", FHIR_JSON);
        return allOk(`Deleted ${resourceType}/${id}`);
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );

  // ── GET /:resourceType/:id/_history (history-instance) ────────────────────
  fastify.get<{ Params: ResourceIdParams; Querystring: HistoryQuerystring }>(
    "/:resourceType/:id/_history",
    async (request, reply) => {
      const { resourceType, id } = request.params;
      const { _since, _count } = request.query;

      const options: HistoryOptions = {};
      if (_since) {
        options.since = _since;
      }
      if (_count) {
        const count = parseInt(_count, 10);
        if (!isNaN(count) && count > 0) {
          options.count = count;
        }
      }

      try {
        // Note: readHistory does not yet accept OperationContext — future enhancement
        const entries = await repo.readHistory(resourceType, id, options);
        const baseUrl = getBaseUrl(request);
        const bundle = buildHistoryBundle(entries, {
          baseUrl,
          selfUrl: `${baseUrl}/${resourceType}/${id}/_history`,
        });
        reply.header("content-type", FHIR_JSON);
        return bundle;
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );

  // ── GET /:resourceType/:id/_history/:vid (vread) ──────────────────────────
  fastify.get<{ Params: VersionIdParams }>(
    "/:resourceType/:id/_history/:vid",
    async (request, reply) => {
      const { resourceType, id, vid } = request.params;

      try {
        // Note: readVersion does not yet accept OperationContext — future enhancement
        const resource = await repo.readVersion(resourceType, id, vid);
        reply
          .header("content-type", FHIR_JSON)
          .header("etag", buildETag(resource.meta.versionId))
          .header("last-modified", buildLastModified(resource.meta.lastUpdated));
        return resource;
      } catch (err) {
        const { status, outcome } = errorToOutcome(err);
        return sendOutcome(reply, status, outcome);
      }
    },
  );
}

// =============================================================================
// Section 3: Helpers
// =============================================================================

/**
 * Send an OperationOutcome response with the given status code.
 */
function sendOutcome(
  reply: FastifyReply,
  status: number,
  outcome: { resourceType: string; issue: unknown[] },
): { resourceType: string; issue: unknown[] } {
  reply.status(status).header("content-type", FHIR_JSON);
  return outcome;
}

/**
 * Extract the base URL from a Fastify request.
 */
function getBaseUrl(request: FastifyRequest): string {
  const protocol = request.protocol;
  const host = request.hostname;
  return `${protocol}://${host}`;
}
