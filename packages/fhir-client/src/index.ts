/**
 * `@medxai/fhir-client` — Public API
 *
 * TypeScript FHIR R4 client SDK for MedXAI.
 *
 * @packageDocumentation
 */

export { MedXAIClient } from './client.js';
export type {
  FhirResource,
  Bundle,
  OperationOutcome,
  MedXAIClientConfig,
  LoginResponse,
  TokenResponse,
  SignInResult,
  PatchOperation,
  RequestOptions,
  ResourceArray,
} from './types.js';
export { FhirClientError } from './types.js';
