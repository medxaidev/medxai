# ADR-002: Single Package fhir-core with Module Subdirectories

## Status

**Status:** Accepted  
**Date:** 2026-02-07  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Superseded by:** None

---

## Context

The architecture documents (ARCHITECTURE.md, MODULES.md) define five logical Core FHIR modules:

- `fhir-model` — Canonical type definitions
- `fhir-parser` — JSON/XML parsing
- `fhir-context` — Definition registry and resolution
- `fhir-profile` — Snapshot generation
- `fhir-validator` — Structural validation

The original design implied these could be separate npm packages within the monorepo (e.g., `packages/fhir-model`, `packages/fhir-parser`, etc.).

### Key Considerations

1. **All five modules share the same stability level** (Very High) and release cadence
2. **Cross-module dependencies are dense** — `fhir-profile` depends on `fhir-model`, `fhir-parser`, and `fhir-context`; `fhir-validator` depends on all four
3. **No external consumers need individual modules** — downstream packages always need the full Core FHIR Engine
4. **Multi-package overhead** — separate packages require independent versioning, build pipelines, and cross-package dependency management
5. **Stage-1 scope** — we are building a single cohesive engine, not a library ecosystem

---

## Decision

We adopt a **single npm package `@medxai/fhir-core`** with **module subdirectories** to represent logical boundaries:

```
packages/fhir-core/
  src/
    model/          ← fhir-model (types only, no logic)
    parser/         ← fhir-parser
    context/        ← fhir-context
    profile/        ← fhir-profile
    validator/      ← fhir-validator
    index.ts        ← Public API barrel export
```

### Core Principles

1. **Logical boundaries preserved**: Each subdirectory corresponds exactly to one module defined in MODULES.md. The dependency rules between modules remain enforced by convention and code review.

2. **Single package, single version**: `@medxai/fhir-core` is versioned, built, and published as one unit. This eliminates cross-package version drift.

3. **Internal imports are explicit**: Modules import from sibling directories using relative paths. Circular dependency detection can be enforced via ESLint rules (e.g., `eslint-plugin-import` with `no-cycle`).

4. **Public API is controlled**: Only `src/index.ts` defines the public surface. Internal module details are not exposed.

5. **Future split is possible**: If a module needs independent versioning or external consumers need it separately, it can be extracted into its own package without changing the internal code structure.

### Mapping to MODULES.md

| MODULES.md Module | fhir-core Subdirectory | Responsibility |
|-------------------|----------------------|----------------|
| `fhir-model` | `src/model/` | FHIR primitive types, StructureDefinition, ElementDefinition, Canonical model |
| `fhir-parser` | `src/parser/` | JSON parsing into model types |
| `fhir-context` | `src/context/` | Definition registry, URL resolution, caching |
| `fhir-profile` | `src/profile/` | Snapshot generation, constraint merging |
| `fhir-validator` | `src/validator/` | Structural validation against profiles |

### Dependency Rules (Still Enforced)

```
model ← parser ← context ← profile ← validator
  ↑                ↑          ↑
  └────────────────┴──────────┘
```

- `model/` MUST NOT import from any sibling directory
- `parser/` MAY import from `model/` only
- `context/` MAY import from `model/` and `parser/`
- `profile/` MAY import from `model/`, `parser/`, and `context/`
- `validator/` MAY import from all other directories

Violations are caught in code review. Future enforcement via ESLint `no-restricted-imports` or `dependency-cruiser`.

---

## Consequences

### Positive

1. **Simpler build pipeline**: One `tsc` + one `esbuild` invocation builds everything
2. **No version drift**: All modules always at same version
3. **Easier refactoring**: Moving types between modules is a file move, not a cross-package migration
4. **Reduced boilerplate**: One `package.json`, one `tsconfig.json`, one test config
5. **Faster CI**: Single build step vs. topological multi-package build

### Negative

1. **Weaker boundary enforcement**: Module boundaries are convention-based, not package-based. Requires discipline and tooling.
2. **Monolithic release**: Cannot release `fhir-model` types independently (acceptable for Stage-1)
3. **Larger package size**: Consumers get all modules even if they only need types (mitigated by tree-shaking)

### Mitigation

1. **Lint rules**: Add `eslint-plugin-import` with `no-cycle` and custom `no-restricted-imports` rules to enforce module boundaries
2. **Code review checklist**: Verify import directions in every PR
3. **Future extraction**: If independent versioning becomes necessary, extract modules with minimal code changes

---

## References

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — Layered architecture definition
- [MODULES.md](../architecture/MODULES.md) — Module responsibilities and dependency rules
- [ADR-001](./ADR-001-HAPI-Inspired-Architecture.md) — HAPI-inspired architecture decision

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-07 | 1.0 | Initial decision | Architecture Team |
