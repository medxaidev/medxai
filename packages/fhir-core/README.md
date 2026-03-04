# @medxai/fhir-core

[![npm version](https://badge.fury.io/js/@medxai%2Ffhir-core.svg)](https://www.npmjs.com/package/@medxai/fhir-core)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

FHIR R4 Core Library - TypeScript implementation with parser, validator, context, and profile support.

## Verification

- ✅ **US Core IG v9.0.0**: 70 profiles, 236 examples validated
- ✅ **Stress Tested**: Adversarial input, large-scale data, concurrent operations
- ✅ **248 Tests**: API contracts, comprehensive pipeline, stress scenarios
- ✅ **Production Ready**: Zero regressions, clean builds, memory-safe

## Features

- **FHIR Model** - Complete TypeScript type definitions for FHIR R4 resources
- **Parser** - Parse and serialize FHIR JSON with full validation
- **Context** - Load and manage StructureDefinitions with inheritance resolution
- **Profile** - Generate snapshots from differential profiles
- **Validator** - Validate resources against FHIR profiles with FHIRPath invariants
- **FHIRPath** - Full FHIRPath expression evaluator
- **Production Verified** - US Core IG v9.0.0 compatible, stress tested

## Installation

```bash
npm install @medxai/fhir-core
```

## Usage

### Parse FHIR JSON

```typescript
import { parseFhirJson } from "@medxai/fhir-core";

const result = parseFhirJson<Patient>('{"resourceType": "Patient", ...}');
if (result.success) {
  const patient = result.value;
}
```

### Validate Resources

```typescript
import { StructureValidator, FhirContextImpl } from "@medxai/fhir-core";

const context = new FhirContextImpl();
await context.preloadCoreDefinitions();

const profile = await context.getStructureDefinition(
  "http://hl7.org/fhir/StructureDefinition/Patient",
);
const validator = new StructureValidator();
const result = validator.validate(resource, profile);
```

### Generate Snapshots

```typescript
import { SnapshotGenerator } from "@medxai/fhir-core";

const generator = new SnapshotGenerator(context);
const result = await generator.generate(differential);
```

### Evaluate FHIRPath

```typescript
import { evalFhirPath } from "@medxai/fhir-core";

const result = evalFhirPath("Patient.name.given", patient);
```

## API Documentation

Full API documentation is available in the TypeScript definitions.

## License

Apache-2.0

## Author

Fangjun <fangjun20208@gmail.com>

## Repository

https://github.com/medxaidev/medxai
