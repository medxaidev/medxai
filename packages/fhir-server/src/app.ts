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
import { fhirOperationsRoutes } from "./routes/fhir-operations-routes.js";
import { adminRoutes } from "./routes/admin-routes.js";
import { terminologyRoutes } from "./terminology/terminology-routes.js";
import { FHIR_JSON } from "./fhir/response.js";
import { errorToOutcome } from "./fhir/outcomes.js";
import { buildAuthenticateToken, getOperationContext } from "./auth/middleware.js";
import { registerLoginRoutes } from "./auth/login.js";
import { registerTokenRoutes } from "./auth/token.js";
import { getJwks } from "./auth/keys.js";

// =============================================================================
// Section 1: Types
// =============================================================================

/**
 * Validation result from the resource validator.
 */
export interface ResourceValidationResult {
  valid: boolean;
  issues?: Array<{ severity: string; code: string; diagnostics: string }>;
}

/**
 * Optional resource validator function.
 *
 * Called before create/update persistence. If it returns `{ valid: false }`,
 * the server responds with 422 Unprocessable Entity + OperationOutcome.
 *
 * Wire in the StructureValidator + FhirContext to enable full validation.
 */
export type ResourceValidator = (
  resource: Record<string, unknown>,
) => ResourceValidationResult | Promise<ResourceValidationResult>;

/**
 * Options for creating the FHIR server app.
 */
export interface AppOptions {
  /** The FhirRepository instance for persistence operations. */
  repo: ResourceRepository;
  /** System-level repository for auth operations (no project/AccessPolicy restrictions). */
  systemRepo?: ResourceRepository;
  /** SearchParameterRegistry for search operations. Optional — search disabled if not provided. */
  searchRegistry?: SearchParameterRegistry;
  /** Enable Fastify/pino logging. Default: false. */
  logger?: boolean;
  /** Base URL for the server (used in Location headers, Bundle links). */
  baseUrl?: string;
  /** Optional resource validator — called before create/update. */
  resourceValidator?: ResourceValidator;
  /** Enable auth middleware and routes. Default: false. */
  enableAuth?: boolean;
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
  const { repo, systemRepo, searchRegistry, logger = false, baseUrl, resourceValidator, enableAuth = false } = options;

  const app = Fastify({
    logger,
    bodyLimit: 16_777_216, // 16 MB — explicit FHIR resource size limit
  });

  // ── Decorate with repository and search registry ──────────────────────────
  app.decorate("repo", repo);
  app.decorate("systemRepo", systemRepo ?? repo);
  app.decorate("searchRegistry", searchRegistry ?? null);
  app.decorate("baseUrl", baseUrl ?? "");
  app.decorate("resourceValidator", resourceValidator ?? null);

  // ── Content-Type parsing ──────────────────────────────────────────────────
  // Accept application/fhir+json as JSON
  app.addContentTypeParser(
    "application/fhir+json",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        const str = body as string;
        if (!str || str.trim() === "") {
          done(null, undefined);
          return;
        }
        const json = JSON.parse(str);
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

  // ── Content-Type parsing for JSON Patch (RFC 6902) ─────────────────────────
  app.addContentTypeParser(
    "application/json-patch+json",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        const str = body as string;
        if (!str || str.trim() === "") {
          done(null, undefined);
          return;
        }
        const json = JSON.parse(str);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

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

  // ── Health check endpoint ────────────────────────────────────────────
  app.get("/healthcheck", async (_request, reply) => {
    reply.header("content-type", "application/json");
    return { status: "ok", uptime: process.uptime() };
  });

  // ── Graceful shutdown ──────────────────────────────────────────────
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  // ── Auth middleware & routes ──────────────────────────────────────────────────
  const authRepo = systemRepo ?? repo;
  if (enableAuth) {
    // Global hook: attempt to resolve Bearer token into AuthState on every request
    app.addHook("onRequest", buildAuthenticateToken(authRepo));

    // Auth routes (no authentication required)
    registerLoginRoutes(app, authRepo);
    registerTokenRoutes(app, authRepo);

    // JWKS endpoint
    app.get("/.well-known/jwks.json", async (_request, reply) => {
      reply.header("content-type", "application/json");
      return getJwks();
    });
  }

  // Decorate request with auth helper
  app.decorate("getOperationContext", getOperationContext);

  // ── Register routes ───────────────────────────────────────────────────────────
  await app.register(metadataRoute, { baseUrl });

  // FHIR operations routes (Bundle, $validate, $everything, PATCH, conditional delete)
  // Must be registered BEFORE search routes to avoid route conflicts
  await app.register(fhirOperationsRoutes);

  if (searchRegistry) {
    await app.register(searchRoutes);
  }
  await app.register(resourceRoutes);

  // Terminology routes ($expand, $validate-code, $lookup)
  await app.register(terminologyRoutes);

  // Admin routes (require auth — each route has its own preHandler)
  await app.register(adminRoutes);

  return app;
}
