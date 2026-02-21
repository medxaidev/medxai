# Development Stages

This document defines the progressive stages of the system architecture.
Each stage builds upon the previous one and introduces a new abstraction layer.

| Stage   | Name                        | Status       | Date    | Key Focus                                                                                  |
| ------- | --------------------------- | ------------ | ------- | ------------------------------------------------------------------------------------------ |
| Stage-0 | Vision & Principles         | ✅ Completed | 2026-01 | Architectural principles, scope definition                                                 |
| Stage-1 | FHIR Canonical Semantics    | ✅ Completed | 2026-02 | Model, parser, context, snapshot generation, validator, FHIRPath (Phases 1-6)              |
| Stage-2 | FHIR Persistence Platform   | 🚧 Planned   | 2026-03 | Per-resource tables, repository, history, REST CRUD, SearchParameter, search (Phases 7-13) |
| Stage-3 | Runtime & Validation Engine | ⏳ Planned   | TBD     | Runtime execution, advanced validation, constraint enforcement                             |
| Stage-4 | Application Integration     | ⏳ Planned   | TBD     | Business systems, UI, and external integrations                                            |
