/**
 * Fastify App Factory
 *
 * Creates and configures a Fastify instance with FHIR routes,
 * content-type handling, and global error handling.
 *
 * @module fhir-server
 */

import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { ResourceRepository } from "@medxai/fhir-persistence";
import type { SearchParameterRegistry } from "@medxai/fhir-persistence";
import { resourceRoutes } from "./routes/resource-routes.js";
import { searchRoutes } from "./routes/search-routes.js";
import { metadataRoute } from "./routes/metadata-route.js";
import { FHIR_JSON } from "./fhir/response.js";
import { errorToOutcome } from "./fhir/outcomes.js";

// =============================================================================
// Section 1: Types
// =============================================================================

/**
 * Options for creating the FHIR server app.
 */
export interface AppOptions {
  /** The FhirRepository instance for persistence operations. */
  repo: ResourceRepository;
  /** SearchParameterRegistry for search operations. Optional — search disabled if not provided. */
  searchRegistry?: SearchParameterRegistry;
  /** Enable Fastify/pino logging. Default: false. */
  logger?: boolean;
  /** Base URL for the server (used in Location headers, Bundle links). */
  baseUrl?: string;
}

// =============================================================================
// Section 2: Type Guards
// =============================================================================

/**
 * Fastify validation error shape (e.g., schema validation failures).
 */
interface FastifyValidationError extends Error {
  validation: unknown[];
  validationContext?: string;
}

/**
 * Type guard for Fastify validation errors.
 */
function isFastifyValidationError(error: unknown): error is FastifyValidationError {
  return (
    error instanceof Error &&
    "validation" in error &&
    Array.isArray((error as FastifyValidationError).validation)
  );
}

// =============================================================================
// Section 3: App Factory
// =============================================================================

/**
 * Create a configured Fastify instance with all FHIR routes.
 *
 * Usage:
 * ```typescript
 * const app = await createApp({ repo, logger: true });
 * await app.listen({ port: 8080 });
 * ```
 */
export async function createApp(options: AppOptions): Promise<FastifyInstance> {
  const { repo, searchRegistry, logger = false, baseUrl } = options;

  const app = Fastify({
    logger,
  });

  // ── Decorate with repository and search registry ──────────────────────────
  app.decorate("repo", repo);
  app.decorate("searchRegistry", searchRegistry ?? null);
  app.decorate("baseUrl", baseUrl ?? "");

  // ── Content-Type parsing ──────────────────────────────────────────────────
  // Accept application/fhir+json as JSON
  app.addContentTypeParser(
    "application/fhir+json",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // ── Global error handler ──────────────────────────────────────────────────
  app.setErrorHandler((error: unknown, _request, reply) => {
    // Fastify validation errors (e.g., missing body, schema validation)
    if (isFastifyValidationError(error)) {
      reply
        .status(400)
        .header("content-type", FHIR_JSON)
        .send({
          resourceType: "OperationOutcome",
          issue: [
            {
              severity: "error",
              code: "invalid",
              diagnostics: error.message,
            },
          ],
        });
      return;
    }

    // Map all other errors to OperationOutcome
    const { status, outcome } = errorToOutcome(error);
    reply.status(status).header("content-type", FHIR_JSON).send(outcome);
  });

  // ── Content-Type parsing for form-encoded search ──────────────────────────
  app.addContentTypeParser(
    "application/x-www-form-urlencoded",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        const params: Record<string, string> = {};
        const pairs = (body as string).split("&");
        for (const pair of pairs) {
          const [key, value] = pair.split("=").map(decodeURIComponent);
          if (key) params[key] = value ?? "";
        }
        done(null, params);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // ── Register routes ───────────────────────────────────────────────────────
  await app.register(metadataRoute, { baseUrl });
  if (searchRegistry) {
    await app.register(searchRoutes);
  }
  await app.register(resourceRoutes);

  return app;
}
