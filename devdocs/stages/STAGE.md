# Development Stages

This document defines the progressive stages of the system architecture.
Each stage builds upon the previous one and introduces a new abstraction layer.

| Stage   | Name                        | Status         | Date    | Key Focus                                                                               |
| ------- | --------------------------- | -------------- | ------- | --------------------------------------------------------------------------------------- |
| Stage-0 | Vision & Principles         | ✅ Completed   | 2026-01 | Architectural principles, scope definition                                              |
| Stage-1 | FHIR Canonical Semantics    | 🚧 In Progress | 2026-02 | Formal interpretation of FHIR canonical resources (StructureDefinition, ValueSet, etc.) |
| Stage-2 | Canonical Dataflow Model    | ⏳ Planned     | TBD     | Mapping canonical semantics into dataflow and transformation pipelines                  |
| Stage-3 | Runtime & Validation Engine | ⏳ Planned     | TBD     | Runtime execution, validation, and constraint enforcement                               |
| Stage-4 | Application Integration     | ⏳ Planned     | TBD     | Business systems, UI, and external integrations                                         |
