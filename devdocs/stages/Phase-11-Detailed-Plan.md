# Phase 11: Server API — Basic CRUD — Detailed Plan

```yaml
status: Completed ✅
completed: 2026-02-23
duration: <1 day (actual; estimated 5-7 days)
complexity: Medium
risk: Low
depends_on: Phase 9 ✅, Phase 10 ✅
framework: Fastify v5.7.4
package: packages/fhir-server
tests: 59/59 passing (3 test files)
tsc: clean (0 errors)
```

---

## Overview

Phase 11 exposes the `fhir-persistence` repository layer as a FHIR R4 REST API using Fastify v5.
This is the first phase that introduces the `@medxai/fhir-server` package.

### FHIR REST Interactions (Phase 11 Scope)

| Method | URL                                   | Interaction      | Status Code |
| ------ | ------------------------------------- | ---------------- | ----------- |
| POST   | `/{resourceType}`                     | create           | 201         |
| GET    | `/{resourceType}/{id}`                | read             | 200         |
| PUT    | `/{resourceType}/{id}`                | update           | 200         |
| DELETE | `/{resourceType}/{id}`                | delete           | 204/200     |
| GET    | `/{resourceType}/{id}/_history`       | history-instance | 200         |
| GET    | `/{resourceType}/{id}/_history/{vid}` | vread            | 200         |
| GET    | `/metadata`                           | capabilities     | 200         |

### Excluded from Phase 11 (deferred)

- `GET /{resourceType}?...` (search) → Phase 13
- `POST /{resourceType}/_search` → Phase 13
- `POST /` (batch/transaction bundle) → Phase 14+
- Authentication / Authorization → Phase 15+

---

## Architecture

```
packages/fhir-server/src/
  ├── index.ts                    # Package barrel exports
  ├── app.ts                      # Fastify app factory (createApp)
  ├── routes/
  │   ├── resource-routes.ts      # CRUD + history + vread routes
  │   └── metadata-route.ts       # GET /metadata
  ├── fhir/
  │   ├── outcomes.ts             # OperationOutcome builders
  │   ├── response.ts             # FHIR response helpers (headers, ETag, Location)
  │   └── metadata.ts             # CapabilityStatement builder
  └── __tests__/
      ├── app.test.ts             # Server setup tests
      ├── create.test.ts          # POST /{type} tests
      ├── read.test.ts            # GET /{type}/{id} tests
      ├── update.test.ts          # PUT /{type}/{id} tests
      ├── delete.test.ts          # DELETE /{type}/{id} tests
      ├── history.test.ts         # GET /{type}/{id}/_history tests
      ├── vread.test.ts           # GET /{type}/{id}/_history/{vid} tests
      ├── metadata.test.ts        # GET /metadata tests
      └── outcomes.test.ts        # OperationOutcome unit tests
```

### Dependency Flow

```
HTTP Request
  → Fastify (routing, content-type, error handling)
    → Route Handler (parse params, call repo)
      → FhirRepository (from @medxai/fhir-persistence)
        → PostgreSQL
    → FHIR Response (status, headers, body)
```

---

## Task Breakdown

### Task 11.1: HTTP Server Setup ✦ Foundation

**Files:** `src/app.ts`, `src/index.ts`

- Fastify v5 app factory: `createApp(options)` returns configured Fastify instance
- FHIR content type: accept `application/fhir+json` and `application/json`
- Global error handler: catch all errors → OperationOutcome response
- Request logging (Fastify built-in pino logger)
- FhirRepository injection via `fastify.decorate('repo', repo)`
- Graceful shutdown hook (`onClose`)

**Key Design:**

```typescript
interface AppOptions {
  repo: FhirRepository;
  logger?: boolean;
  baseUrl?: string;
}

function createApp(options: AppOptions): FastifyInstance;
```

### Task 11.2: FHIR Route Handlers ✦ Core

**File:** `src/routes/resource-routes.ts`

7 route handlers with FHIR-compliant response headers:

| Route                                  | Handler          | Response Headers                           |
| -------------------------------------- | ---------------- | ------------------------------------------ |
| `POST /:resourceType`                  | `createHandler`  | `201`, `Location`, `ETag`, `Last-Modified` |
| `GET /:resourceType/:id`               | `readHandler`    | `200`, `ETag`, `Last-Modified`             |
| `PUT /:resourceType/:id`               | `updateHandler`  | `200`, `ETag`, `Last-Modified`             |
| `DELETE /:resourceType/:id`            | `deleteHandler`  | `200` + OperationOutcome body              |
| `GET /:resourceType/:id/_history`      | `historyHandler` | `200`, Bundle body                         |
| `GET /:resourceType/:id/_history/:vid` | `vreadHandler`   | `200`, `ETag`                              |

**Response Header Format (per FHIR R4 spec):**

- `ETag: W/"<versionId>"` — weak validator
- `Location: <baseUrl>/<resourceType>/<id>/_history/<versionId>` — on create
- `Last-Modified: <HTTP-date>` — UTC string format
- `Content-Type: application/fhir+json; charset=utf-8`

**If-Match Support:**

- `PUT` reads `If-Match` header → extracts versionId → passes as `ifMatch` to repo
- Format: `If-Match: W/"<versionId>"`

### Task 11.3: OperationOutcome Error Responses ✦ Error Handling

**File:** `src/fhir/outcomes.ts`

Error mapping from repository errors to FHIR OperationOutcome:

| Repository Error               | HTTP Status | OperationOutcome.issue.code |
| ------------------------------ | ----------- | --------------------------- |
| `ResourceNotFoundError`        | 404         | `not-found`                 |
| `ResourceGoneError`            | 410         | `deleted`                   |
| `ResourceVersionConflictError` | 409         | `conflict`                  |
| Validation error               | 400         | `invalid`                   |
| Unknown error                  | 500         | `exception`                 |

**OperationOutcome structure:**

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "<issue-code>",
      "diagnostics": "<human-readable message>"
    }
  ]
}
```

### Task 11.4: CapabilityStatement (`/metadata`) ✦ Conformance

**Files:** `src/fhir/metadata.ts`, `src/routes/metadata-route.ts`

Static CapabilityStatement declaring:

- `fhirVersion: "4.0.1"`
- `format: ["json"]`
- `kind: "instance"`
- `status: "active"`
- Per-resource-type interactions: `read`, `vread`, `update`, `delete`, `create`, `history-instance`
- `versioning: "versioned"`
- `readHistory: true`

Initial version: hardcoded list of common resource types (Patient, Observation, Condition, etc.).
Dynamic generation from `StructureDefinitionRegistry` can be added later.

### Task 11.5: Server Tests (55+) ✦ Verification

**Test Strategy:** Use Fastify's `inject()` method — no real HTTP server needed.

| Test File          | Tests | Coverage                                                    |
| ------------------ | ----- | ----------------------------------------------------------- |
| `app.test.ts`      | 5     | Server creation, content-type, error handling               |
| `create.test.ts`   | 8     | POST create, 201 + headers, validation errors, duplicate id |
| `read.test.ts`     | 6     | GET read, 200 + headers, 404, 410 (gone)                    |
| `update.test.ts`   | 8     | PUT update, 200 + headers, If-Match, 409 conflict, 404      |
| `delete.test.ts`   | 6     | DELETE, 200, 404, already deleted                           |
| `history.test.ts`  | 8     | History bundle, \_since, \_count, delete entries            |
| `vread.test.ts`    | 6     | Specific version, 404, 410                                  |
| `metadata.test.ts` | 4     | CapabilityStatement structure, interactions                 |
| `outcomes.test.ts` | 6     | OperationOutcome builders, error mapping                    |

**Total: ~57 tests**

**Test Setup:**

- Mock `FhirRepository` for unit tests (no DB dependency)
- `createApp({ repo: mockRepo })` → `app.inject()` for HTTP-level tests
- Real DB integration tests can be added later

---

## FHIR Response Headers Reference

### Create (POST)

```http
HTTP/1.1 201 Created
Content-Type: application/fhir+json; charset=utf-8
Location: http://localhost:8080/fhir/Patient/123/_history/abc
ETag: W/"abc"
Last-Modified: Sun, 23 Feb 2026 10:00:00 GMT
```

### Read (GET)

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json; charset=utf-8
ETag: W/"abc"
Last-Modified: Sun, 23 Feb 2026 10:00:00 GMT
```

### Update (PUT)

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json; charset=utf-8
ETag: W/"def"
Last-Modified: Sun, 23 Feb 2026 10:05:00 GMT
```

### Delete (DELETE)

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json; charset=utf-8

{ "resourceType": "OperationOutcome", "issue": [{ "severity": "information", "code": "informational", "diagnostics": "Deleted" }] }
```

### History (GET)

```http
HTTP/1.1 200 OK
Content-Type: application/fhir+json; charset=utf-8

{ "resourceType": "Bundle", "type": "history", ... }
```

---

## Medplum Reference Files

| Medplum File                  | Our Equivalent                  | Notes                                          |
| ----------------------------- | ------------------------------- | ---------------------------------------------- |
| `server/src/fhir/outcomes.ts` | `src/fhir/outcomes.ts`          | OperationOutcome construction pattern          |
| `server/src/fhir/metadata.ts` | `src/fhir/metadata.ts`          | CapabilityStatement structure                  |
| `server/src/fhir/response.ts` | `src/fhir/response.ts`          | ETag/Location/Last-Modified header format      |
| `server/src/fhir/routes.ts`   | `src/routes/resource-routes.ts` | Route structure (Express → Fastify adaptation) |

**Key difference:** Medplum uses Express; we use Fastify v5. Route handler signatures are completely different. Only the FHIR response format patterns are reusable.

---

## Acceptance Criteria

- [ ] All 7 FHIR interactions work correctly
- [ ] FHIR-compliant response headers (`ETag`, `Location`, `Last-Modified`)
- [ ] FHIR `OperationOutcome` for all error responses
- [ ] `CapabilityStatement` at `GET /metadata`
- [ ] `Content-Type: application/fhir+json` on all responses
- [ ] `If-Match` header support for optimistic locking
- [ ] 55+ tests passing
- [ ] `tsc --noEmit` clean
- [ ] No regressions in `fhir-persistence` tests
