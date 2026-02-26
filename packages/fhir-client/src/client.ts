/**
 * MedXAI FHIR Client
 *
 * TypeScript SDK for interacting with a MedXAI FHIR R4 server.
 * Provides typed CRUD operations, search, and history access.
 *
 * Uses the standard Fetch API — works in Node.js 18+ and browsers.
 *
 * @module fhir-client
 */

import type {
  FhirResource,
  Bundle,
  OperationOutcome,
  MedXAIClientConfig,
  LoginResponse,
  TokenResponse,
  SignInResult,
} from "./types.js";
import { FhirClientError } from "./types.js";

// =============================================================================
// Section 1: Constants
// =============================================================================

const FHIR_JSON = "application/fhir+json";

// =============================================================================
// Section 2: MedXAIClient
// =============================================================================

/**
 * FHIR R4 client for the MedXAI server.
 *
 * @example
 * ```ts
 * const client = new MedXAIClient({ baseUrl: "http://localhost:8080" });
 *
 * // Create
 * const patient = await client.createResource({
 *   resourceType: "Patient",
 *   name: [{ family: "Smith", given: ["John"] }],
 * });
 *
 * // Read
 * const read = await client.readResource("Patient", patient.id!);
 *
 * // Search
 * const bundle = await client.search("Patient", { name: "Smith" });
 *
 * // Update
 * await client.updateResource({ ...read, active: true });
 *
 * // Delete
 * await client.deleteResource("Patient", patient.id!);
 * ```
 */
export class MedXAIClient {
  private baseUrl: string;
  private accessToken?: string;
  private refreshToken?: string;
  private readonly fetchFn: typeof fetch;

  constructor(config: MedXAIClientConfig) {
    // Strip trailing slash
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.accessToken = config.accessToken;
    this.fetchFn = config.fetchImpl ?? globalThis.fetch;
  }

  // ===========================================================================
  // Auth helpers
  // ===========================================================================

  /**
   * Set the access token for authenticated requests.
   */
  setAccessToken(token: string | undefined): void {
    this.accessToken = token;
  }

  /**
   * Get the current access token.
   */
  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * Get the current refresh token.
   */
  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  // ===========================================================================
  // Auth — Sign In / Sign Out / Refresh
  // ===========================================================================

  /**
   * Sign in with email and password.
   *
   * This is a convenience method that calls `POST /auth/login` to get
   * an authorization code, then exchanges it via `POST /oauth2/token`
   * for access and refresh tokens. The access token is automatically
   * set on this client instance.
   *
   * @param email - The user's email.
   * @param password - The user's password.
   * @param scope - OAuth2 scope (default: "openid offline").
   * @returns Sign-in result with tokens and profile info.
   */
  async signIn(
    email: string,
    password: string,
    scope: string = "openid offline",
  ): Promise<SignInResult> {
    // Step 1: Login to get authorization code
    const loginResult = await this.startLogin(email, password, scope);

    // Step 2: Exchange code for tokens
    const tokenResult = await this.exchangeCode(loginResult.code);

    // Step 3: Set tokens on this client
    this.accessToken = tokenResult.access_token;
    this.refreshToken = tokenResult.refresh_token;

    return {
      accessToken: tokenResult.access_token,
      refreshToken: tokenResult.refresh_token,
      expiresIn: tokenResult.expires_in,
      project: tokenResult.project,
      profile: tokenResult.profile,
    };
  }

  /**
   * Sign out — clear tokens from this client.
   *
   * Note: This only clears local state. The server-side Login resource
   * remains valid until it expires or is explicitly revoked.
   */
  signOut(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
  }

  /**
   * Refresh the access token using the stored refresh token.
   *
   * @returns Updated sign-in result with new tokens.
   * @throws FhirClientError if no refresh token is available.
   */
  async refreshAccessToken(): Promise<SignInResult> {
    if (!this.refreshToken) {
      throw new FhirClientError(400, "No refresh token available — sign in first");
    }

    const url = `${this.baseUrl}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
    }).toString();

    const response = await this.fetchFn(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body,
    });

    const tokenResult = await this.handleJsonResponse<TokenResponse>(response);

    // Update stored tokens
    this.accessToken = tokenResult.access_token;
    if (tokenResult.refresh_token) {
      this.refreshToken = tokenResult.refresh_token;
    }

    return {
      accessToken: tokenResult.access_token,
      refreshToken: tokenResult.refresh_token,
      expiresIn: tokenResult.expires_in,
      project: tokenResult.project,
      profile: tokenResult.profile,
    };
  }

  /**
   * Low-level: POST /auth/login to get an authorization code.
   */
  async startLogin(
    email: string,
    password: string,
    scope?: string,
  ): Promise<LoginResponse> {
    const url = `${this.baseUrl}/auth/login`;
    const response = await this.fetchFn(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password, scope }),
    });
    return this.handleJsonResponse<LoginResponse>(response);
  }

  /**
   * Low-level: POST /oauth2/token with authorization_code grant.
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    const url = `${this.baseUrl}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }).toString();

    const response = await this.fetchFn(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body,
    });
    return this.handleJsonResponse<TokenResponse>(response);
  }

  // ===========================================================================
  // CRUD Operations
  // ===========================================================================

  /**
   * Create a new resource.
   *
   * @param resource - The resource to create (must have `resourceType`).
   * @returns The created resource with `id` and `meta` populated by the server.
   */
  async createResource<T extends FhirResource>(resource: T): Promise<T> {
    const url = `${this.baseUrl}/${resource.resourceType}`;
    const response = await this.fetchFn(url, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(resource),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Read a resource by type and ID.
   *
   * @param resourceType - The FHIR resource type (e.g., "Patient").
   * @param id - The resource ID.
   * @returns The resource.
   * @throws FhirClientError if not found (404) or gone (410).
   */
  async readResource<T extends FhirResource>(
    resourceType: string,
    id: string,
  ): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Update an existing resource.
   *
   * @param resource - The resource to update (must have `resourceType` and `id`).
   * @returns The updated resource with new `meta.versionId`.
   */
  async updateResource<T extends FhirResource>(resource: T): Promise<T> {
    if (!resource.id) {
      throw new FhirClientError(400, "Resource must have an id for update");
    }
    const url = `${this.baseUrl}/${resource.resourceType}/${resource.id}`;
    const response = await this.fetchFn(url, {
      method: "PUT",
      headers: this.buildHeaders(),
      body: JSON.stringify(resource),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Delete a resource by type and ID.
   *
   * @param resourceType - The FHIR resource type.
   * @param id - The resource ID.
   * @returns The OperationOutcome from the server.
   */
  async deleteResource(
    resourceType: string,
    id: string,
  ): Promise<OperationOutcome> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    const response = await this.fetchFn(url, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<OperationOutcome>(response);
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  /**
   * Search for resources.
   *
   * @param resourceType - The FHIR resource type to search.
   * @param params - Search parameters as key-value pairs.
   * @returns A Bundle containing matching resources.
   *
   * @example
   * ```ts
   * const bundle = await client.search("Patient", { name: "Smith", _count: "10" });
   * ```
   */
  async search<T extends FhirResource>(
    resourceType: string,
    params?: Record<string, string>,
  ): Promise<Bundle<T>> {
    const url = new URL(`${this.baseUrl}/${resourceType}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    const response = await this.fetchFn(url.toString(), {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<Bundle<T>>(response);
  }

  /**
   * Search using POST (for long query strings).
   *
   * @param resourceType - The FHIR resource type to search.
   * @param params - Search parameters as key-value pairs.
   * @returns A Bundle containing matching resources.
   */
  async searchPost<T extends FhirResource>(
    resourceType: string,
    params: Record<string, string>,
  ): Promise<Bundle<T>> {
    const url = `${this.baseUrl}/${resourceType}/_search`;
    const body = new URLSearchParams(params).toString();
    const response = await this.fetchFn(url, {
      method: "POST",
      headers: {
        ...this.buildHeaders(),
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });
    return this.handleResponse<Bundle<T>>(response);
  }

  // ===========================================================================
  // History
  // ===========================================================================

  /**
   * Read the history of a specific resource.
   *
   * @param resourceType - The FHIR resource type.
   * @param id - The resource ID.
   * @returns A history Bundle.
   */
  async readHistory<T extends FhirResource>(
    resourceType: string,
    id: string,
  ): Promise<Bundle<T>> {
    const url = `${this.baseUrl}/${resourceType}/${id}/_history`;
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<Bundle<T>>(response);
  }

  /**
   * Read a specific version of a resource.
   *
   * @param resourceType - The FHIR resource type.
   * @param id - The resource ID.
   * @param versionId - The version ID.
   * @returns The resource at that version.
   */
  async readVersion<T extends FhirResource>(
    resourceType: string,
    id: string,
    versionId: string,
  ): Promise<T> {
    const url = `${this.baseUrl}/${resourceType}/${id}/_history/${versionId}`;
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  // ===========================================================================
  // Metadata
  // ===========================================================================

  /**
   * Read the server's CapabilityStatement.
   */
  async readMetadata(): Promise<FhirResource> {
    const url = `${this.baseUrl}/metadata`;
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<FhirResource>(response);
  }

  // ===========================================================================
  // Internal
  // ===========================================================================

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "content-type": FHIR_JSON,
      accept: FHIR_JSON,
    };
    if (this.accessToken) {
      headers["authorization"] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private async handleJsonResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let body: unknown;

    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      throw new FhirClientError(
        response.status,
        `Invalid JSON response: ${text.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      // Auth endpoints return { error, error_description } or OperationOutcome
      const obj = body as Record<string, unknown> | undefined;
      const message = (obj?.error_description as string)
        ?? (obj?.diagnostics as string)
        ?? (isOperationOutcome(body) ? body.issue?.[0]?.diagnostics : undefined)
        ?? `HTTP ${response.status} ${response.statusText}`;
      const outcome = isOperationOutcome(body) ? body : undefined;
      throw new FhirClientError(response.status, message, outcome);
    }

    return body as T;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let body: unknown;

    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      throw new FhirClientError(
        response.status,
        `Invalid JSON response: ${text.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      const outcome = isOperationOutcome(body) ? body : undefined;
      const message = outcome?.issue?.[0]?.diagnostics
        ?? outcome?.issue?.[0]?.details?.text
        ?? `HTTP ${response.status} ${response.statusText}`;
      throw new FhirClientError(response.status, message, outcome);
    }

    return body as T;
  }
}

// =============================================================================
// Section 3: Helpers
// =============================================================================

function isOperationOutcome(value: unknown): value is OperationOutcome {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).resourceType === "OperationOutcome"
  );
}
