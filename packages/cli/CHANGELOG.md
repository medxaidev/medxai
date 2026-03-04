# Changelog

## 0.1.0 (2026-03-04)

### Initial Release

First public release of `@medxai/cli` — the Operational Console for the MedXAI FHIR Engine.

#### Commands

- **`medxai parse`** — Parse FHIR R4 JSON files and report structure
- **`medxai validate`** — Validate resources against profiles (structural validation)
- **`medxai evaluate`** — Evaluate FHIRPath expressions against resources
- **`medxai snapshot`** — Generate snapshots for StructureDefinitions
- **`medxai capabilities`** — Display engine capability summary

#### Features

- Human-readable and JSON output modes for all commands
- Exit code contract (0=success, 1=FHIR error, 2=usage error, 3=crash)
- Zero runtime dependencies (besides `@medxai/fhir-core`)
- Deterministic output (same input → same output)
- No side effects (no cache, no network, no file mutation)

#### Engine

- Built on `@medxai/fhir-core@0.1.0` (frozen API)
- FHIR R4 (4.0.1) support
- HAPI FHIR equivalent capabilities
