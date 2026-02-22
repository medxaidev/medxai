# spec/platform/ — MedXAI Platform Custom Definitions

This directory contains platform-specific FHIR StructureDefinitions and
SearchParameters that extend the official FHIR R4 specification.

## Files

| File | Purpose |
|------|---------|
| `profiles-platform.json` | Custom resource/profile StructureDefinitions (FHIR Bundle) |
| `search-parameters-platform.json` | Custom SearchParameter definitions (FHIR Bundle) |

## Status

**Phase 9** will populate these files with multi-tenant and platform-specific
resource definitions. Currently they are empty Bundle stubs.

## Loading Order

The schema generation pipeline loads bundles in this order:

1. `spec/fhir/r4/profiles-types.json` — FHIR R4 type system
2. `spec/fhir/r4/profiles-resources.json` — FHIR R4 clinical resources
3. `spec/fhir/r4/profiles-others.json` — FHIR R4 conformance resources
4. `spec/platform/profiles-platform.json` — Platform custom resources (this directory)

Later bundles override earlier ones for the same canonical URL, allowing
platform definitions to extend or constrain official FHIR resources.

## Future Directories

- `spec/cn/` — Chinese localization profiles (Stage-3+, not yet created)
