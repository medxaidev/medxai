# @medxai/fhir-core

FHIR R4 Core Library - TypeScript implementation with parser, validator, context, and profile support.

## Features

- **FHIR Model** - Complete TypeScript type definitions for FHIR R4 resources
- **Parser** - Parse and serialize FHIR JSON with full validation
- **Context** - Load and manage StructureDefinitions with inheritance resolution
- **Profile** - Generate snapshots from differential profiles
- **Validator** - Validate resources against FHIR profiles with FHIRPath invariants
- **FHIRPath** - Full FHIRPath expression evaluator

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
