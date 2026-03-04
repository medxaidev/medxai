# @medxai/cli

> MedXAI FHIR Engine CLI — Operational Console for FHIR R4 structure analysis and validation

[![npm version](https://img.shields.io/npm/v/@medxai/cli)](https://www.npmjs.com/package/@medxai/cli)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

## Overview

`@medxai/cli` is a command-line interface for the [`@medxai/fhir-core`](https://www.npmjs.com/package/@medxai/fhir-core) FHIR R4 engine. It provides five core commands for parsing, validating, and analyzing FHIR resources — all powered by the engine's frozen v0.1 API.

**Key features:**

- **Zero runtime dependencies** (besides `@medxai/fhir-core`)
- **Deterministic** — same input always produces the same output
- **No side effects** — no cache files, no network access, no file mutation
- **Human-readable + JSON output** for every command

## Installation

```bash
npm install -g @medxai/cli
```

Or use directly with npx:

```bash
npx @medxai/cli --help
```

## Commands

### `medxai parse <file>`

Parse a FHIR R4 JSON file and report its structure.

```bash
medxai parse Patient.json
medxai parse Patient.json --pretty    # Pretty-print parsed output
medxai parse Patient.json --json      # Machine-readable JSON
medxai parse Patient.json --silent    # Exit code only
```

### `medxai validate <resource.json>`

Validate a FHIR resource against a profile.

```bash
medxai validate Patient.json --core spec/fhir/r4
medxai validate Patient.json --profile us-core-patient.json --core spec/fhir/r4
medxai validate Patient.json --json --core spec/fhir/r4
```

| Option                  | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `--profile <url\|file>` | Profile to validate against (canonical URL or local file) |
| `--core <dir>`          | Directory containing R4 core definitions                  |
| `--json`                | Machine-readable JSON output                              |

### `medxai evaluate <expression> <resource.json>`

Evaluate a FHIRPath expression against a FHIR resource.

```bash
medxai evaluate "Patient.name.family" Patient.json
medxai evaluate "Patient.name.exists()" Patient.json --boolean
medxai evaluate "Observation.value.ofType(Quantity).value" Obs.json --json
```

### `medxai snapshot <structureDefinition.json>`

Generate a complete snapshot for a StructureDefinition.

```bash
medxai snapshot us-core-patient.json --core spec/fhir/r4
medxai snapshot us-core-patient.json --output snapshot.json --core spec/fhir/r4
medxai snapshot us-core-patient.json --json --core spec/fhir/r4
```

### `medxai capabilities`

Display engine capability summary.

```bash
medxai capabilities
medxai capabilities --json
```

Output:

```
@medxai/fhir-core v0.1.0
  FHIR Version:  R4 (4.0.1)

  Modules:
    parsing        ✓ supported
    context        ✓ supported (73 core definitions)
    snapshot       ✓ supported (HAPI-equivalent)
    validation     ✓ supported (9 structural rules)
    fhirpath       ✓ supported (60+ functions)
    terminology    ✗ not supported
    search         ✗ not supported
```

## Exit Codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 0    | Success                                         |
| 1    | FHIR error (validation failed, parse error)     |
| 2    | CLI usage error (missing args, unknown command) |
| 3    | Engine crash (unexpected error)                 |

## Architecture

The CLI is a **thin presentation layer** over `@medxai/fhir-core` — it does not implement any FHIR logic itself.

```
┌──────────────────────────────────────────┐
│  Interaction Layer (arg parsing, output)  │
├──────────────────────────────────────────┤
│  Command Layer (parse, validate, etc.)    │
├──────────────────────────────────────────┤
│  Runtime Layer (engine init, profiles)    │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  @medxai/fhir-core v0.1.0 (frozen API)   │
└──────────────────────────────────────────┘
```

## Requirements

- **Node.js** >= 18.0.0
- **FHIR R4** core definitions (for validate/snapshot commands)

## License

[Apache-2.0](LICENSE)
