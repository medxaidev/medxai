# MedXAI Documentation Index

This directory serves as the root index for all MedXAI platform documentation.
Package-specific documentation lives alongside each package.

---

## Package Documentation

### @medxai/fhir-core

FHIR R4 structural engine — parsing, validation, snapshot generation, FHIRPath.

| Document | Path | Description |
|----------|------|-------------|
| Technical Overview | [`packages/fhir-core/docs/overview/fhir-core-overview.md`](../packages/fhir-core/docs/overview/fhir-core-overview.md) | Architecture, capabilities, usage examples |
| Capability Contract v0.1 | [`packages/fhir-core/docs/specs/engine-capability-contract-v0.1.md`](../packages/fhir-core/docs/specs/engine-capability-contract-v0.1.md) | Frozen behavioral guarantees, HAPI mapping |
| API Reference v0.1 | [`packages/fhir-core/docs/api/fhir-core-api-v0.1.md`](../packages/fhir-core/docs/api/fhir-core-api-v0.1.md) | Complete public export inventory (211 symbols) |

### @medxai/fhir-persistence

FHIR R4 persistence layer — PostgreSQL storage, search, DDL generation.

> Documentation forthcoming.

### @medxai/fhir-server

FHIR R4 REST server — Fastify-based HTTP API, auth, audit.

> Documentation forthcoming.

### @medxai/fhir-client

FHIR R4 client SDK.

> Documentation forthcoming.

### @medxai/fhirtypes

Generated TypeScript type definitions for all FHIR R4 resource types.

> Documentation forthcoming.

---

## Development Documentation

Internal development docs, architecture decisions, and phase execution records are in [`devdocs/`](../devdocs/).

| Category | Path | Description |
|----------|------|-------------|
| Architecture | `devdocs/architecture/` | System architecture documents |
| Decisions | `devdocs/decisions/` | Architecture Decision Records (ADRs) |
| Stages | `devdocs/stages/` | Phase execution records |
| Research | `devdocs/research/` | Research notes and analysis |
