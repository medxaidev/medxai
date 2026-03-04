# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-04

### Verified

- US Core IG v9.0.0 compatibility (31 tests, 236 examples validated)
  - 70 StructureDefinitions parsed (55 resource profiles + 15 extension profiles)
  - 236 examples validated against profiles with 0 crashes
  - FHIRPath evaluation on all 236 examples across all types
  - 96% profile coverage (53/55 profiles covered)
- Production-grade stress testing (41 tests)
  - Adversarial input handling (malformed JSON, invalid types, circular references)
  - Large-scale data processing (1000+ resources, deep nesting, large arrays)
  - Memory management validation (leak detection, cleanup verification)
  - Concurrent operation safety (parallel parsing, validation, evaluation)
- API surface contract compliance (136 tests)
  - Export verification for all public APIs
  - Behavioral contracts for core functions
  - Full pipeline testing across 146 R4 resources

### Quality

- 248 total tests passing (4 test suites)
- 0 regressions from Phase 1-6
- Clean TypeScript compilation (tsc --noEmit)
- Memory-safe concurrent operations
- Production-ready freeze status

## [0.0.1] - 2026-03-01

### Added

- Initial release of @medxai/fhir-core
- FHIR R4 model type definitions (70+ types)
- JSON parser with primitive element handling and choice type support
- FHIR context with StructureDefinition loading and inheritance resolution
- Snapshot generator for differential profiles
- Structure validator with cardinality, type, fixed, pattern, and reference validation
- Slicing validator with discriminator support
- FHIRPath expression evaluator (60+ functions)
- Invariant validator with FHIRPath constraint evaluation
- Bundle loader for loading FHIR definition bundles
- Core definitions loader with 73 base FHIR R4 StructureDefinitions
- Dual package support (ESM + CJS)
- Full TypeScript type definitions

### Features

- **fhir-model**: Complete FHIR R4 resource and data type definitions
- **fhir-parser**: Parse and serialize FHIR JSON with validation
- **fhir-context**: Load and manage StructureDefinitions with caching
- **fhir-profile**: Generate snapshots from differential profiles
- **fhir-validator**: Validate resources against profiles
- **fhir-fhirpath**: Evaluate FHIRPath expressions

[Unreleased]: https://github.com/medxaidev/medxai/compare/fhir-core-v0.1.0...HEAD
[0.1.0]: https://github.com/medxaidev/medxai/releases/tag/fhir-core-v0.1.0
[0.0.1]: https://github.com/medxaidev/medxai/releases/tag/v0.0.1
