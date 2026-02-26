/**
 * FHIR Client Types
 *
 * Minimal FHIR resource types for the client SDK.
 * These are intentionally loose — the client does not validate
 * resource structure (that's the server's job).
 *
 * @module fhir-client
 */

// =============================================================================
// Section 1: Resource Types
// =============================================================================

/**
 * Minimal FHIR resource shape.
 */
export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * FHIR Bundle resource.
 */
export interface Bundle<T extends FhirResource = FhirResource> {
  resourceType: "Bundle";
  type: string;
  total?: number;
  link?: Array<{ relation: string; url: string }>;
  entry?: Array<{ fullUrl?: string; resource: T; search?: { mode: string } }>;
}

/**
 * FHIR OperationOutcome resource.
 */
export interface OperationOutcome {
  resourceType: "OperationOutcome";
  issue: Array<{
    severity: string;
    code: string;
    diagnostics?: string;
    details?: { text?: string };
  }>;
}

// =============================================================================
// Section 2: Auth Types
// =============================================================================

/**
 * Response from `POST /auth/login`.
 */
export interface LoginResponse {
  login: string;
  code: string;
  memberships?: Array<{
    id: string;
    project: { reference: string };
    profile?: { reference: string };
  }>;
}

/**
 * Response from `POST /oauth2/token`.
 */
export interface TokenResponse {
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  access_token: string;
  refresh_token?: string;
  project?: { reference: string };
  profile?: { reference: string };
}

/**
 * Combined result from the signIn convenience method.
 */
export interface SignInResult {
  /** The access token (already set on the client). */
  accessToken: string;
  /** The refresh token (if offline scope was requested). */
  refreshToken?: string;
  /** Token lifetime in seconds. */
  expiresIn: number;
  /** Project reference from the token response. */
  project?: { reference: string };
  /** Profile reference from the token response. */
  profile?: { reference: string };
}

// =============================================================================
// Section 3: Client Configuration
// =============================================================================

/**
 * Configuration for the MedXAI FHIR client.
 */
export interface MedXAIClientConfig {
  /** Base URL of the FHIR server (e.g., "http://localhost:8080"). */
  baseUrl: string;
  /** Optional access token for authenticated requests. */
  accessToken?: string;
  /** Optional fetch implementation (defaults to global fetch). */
  fetchImpl?: typeof fetch;
}

// =============================================================================
// Section 3: Error Types
// =============================================================================

/**
 * Error thrown by the FHIR client when the server returns an error response.
 */
export class FhirClientError extends Error {
  readonly status: number;
  readonly outcome?: OperationOutcome;

  constructor(status: number, message: string, outcome?: OperationOutcome) {
    super(message);
    this.name = "FhirClientError";
    this.status = status;
    this.outcome = outcome;
  }
}
