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
import { resourceRoutes } from "./routes/resource-routes.js";
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
  const { repo, logger = false, baseUrl } = options;

  const app = Fastify({
    logger,
  });

  // ── Decorate with repository ──────────────────────────────────────────────
  app.decorate("repo", repo);

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

  // ── Register routes ───────────────────────────────────────────────────────
  await app.register(metadataRoute, { baseUrl });
  await app.register(resourceRoutes);

  return app;
}
