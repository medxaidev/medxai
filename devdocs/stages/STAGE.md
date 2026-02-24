# Development Stages

This document defines the progressive stages of the system architecture.
Each stage builds upon the previous one and introduces a new abstraction layer.

| Stage   | Name                      | Status       | Date    | Key Focus                                                                                  |
| ------- | ------------------------- | ------------ | ------- | ------------------------------------------------------------------------------------------ |
| Stage-0 | Vision & Principles       | ✅ Completed | 2026-01 | Architectural principles, scope definition                                                 |
| Stage-1 | FHIR Canonical Semantics  | ✅ Completed | 2026-02 | Model, parser, context, snapshot generation, validator, FHIRPath (Phases 1-6)              |
| Stage-2 | FHIR Persistence Platform | ✅ Completed | 2026-02 | Per-resource tables, repository, history, REST CRUD, SearchParameter, search (Phases 7-13) |
| Stage-3 | Advanced Search & Runtime | 🚧 Active    | 2026-03 | Row indexer, search integration, metadata params, chained search, \_include (Phases 14-17) |
| Stage-4 | Application Integration   | ⏳ Planned   | TBD     | Business systems, UI, and external integrations                                            |
