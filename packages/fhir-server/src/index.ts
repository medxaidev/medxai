/**
 * `@medxai/fhir-server` — Public API
 *
 * FHIR R4 REST API server built on Fastify v5.
 * Exposes the `@medxai/fhir-persistence` repository layer as HTTP endpoints.
 *
 * @packageDocumentation
 */

// ─── App Factory ────────────────────────────────────────────────────────────
export { createApp } from "./app.js";
export type { AppOptions, ResourceValidator, ResourceValidationResult } from "./app.js";

// ─── FHIR Helpers ───────────────────────────────────────────────────────────
export {
  operationOutcome,
  allOk,
  notFound,
  gone,
  conflict,
  badRequest,
  serverError,
  notSupported,
  errorToOutcome,
  issueCodeToStatus,
} from "./fhir/outcomes.js";
export type {
  IssueSeverity,
  IssueCode,
  OperationOutcomeIssue,
  OperationOutcome,
  OutcomeWithStatus,
} from "./fhir/outcomes.js";

export {
  FHIR_JSON,
  buildETag,
  parseETag,
  buildLastModified,
  buildLocationHeader,
  buildResourceHeaders,
} from "./fhir/response.js";
export type { FhirResponseHeaders } from "./fhir/response.js";

export { buildCapabilityStatement } from "./fhir/metadata.js";
export type {
  CapabilityStatement,
  CapabilityStatementRest,
  CapabilityStatementRestResource,
  CapabilityStatementOptions,
} from "./fhir/metadata.js";

// ─── Routes ─────────────────────────────────────────────────────────────────
export { resourceRoutes } from "./routes/resource-routes.js";
export { metadataRoute } from "./routes/metadata-route.js";
