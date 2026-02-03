# ADR-001: HAPI-Inspired Architecture for Core FHIR Engine

## Status

**Status:** Accepted  
**Date:** 2026-02-04  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Superseded by:** None

---

## Context

MedXAI aims to build a FHIR-first healthcare platform for the Chinese market, implemented in Node.js + TypeScript. We need to decide on the architectural approach for the **Core FHIR Engine**, which is responsible for interpreting FHIR definitions, validating resources, and providing semantic understanding.

### Key Requirements

1. **Correctness First**: FHIR semantics must be interpreted correctly and deterministically
2. **Production-Proven Algorithms**: Avoid reinventing complex algorithms (e.g., snapshot generation)
3. **Chinese Healthcare Focus**: Support Chinese medical semantics and workflows as first-class concerns
4. **Long-Term Maintainability**: Architecture must support evolution over 5+ years
5. **Technology Stack**: Must work within Node.js/TypeScript ecosystem

### Available Options

We evaluated three architectural approaches:

#### Option 1: Build from Scratch (Clean Slate)

**Pros:**
- Complete control over design decisions
- No legacy constraints
- Optimized for Node.js from day one

**Cons:**
- High risk of semantic interpretation errors
- 2-3 years to reach production maturity
- Reinventing well-solved problems (snapshot generation, profile inheritance)
- Limited community validation

#### Option 2: Fork/Port HAPI FHIR to TypeScript

**Pros:**
- Proven algorithms and semantics
- Comprehensive test coverage
- Battle-tested in production

**Cons:**
- HAPI is tightly coupled to Java/Spring ecosystem
- Direct port would bring Java idioms to TypeScript (not idiomatic)
- Massive codebase (100k+ lines) - most not relevant to our needs
- Ongoing maintenance burden to track HAPI updates

#### Option 3: Conceptually Inspired by HAPI, Independently Implemented ✅

**Pros:**
- Leverage HAPI's proven algorithms (snapshot generation, validation)
- Adapt to Node.js/TypeScript idioms and async patterns
- Keep only what's needed (no Spring, no JPA, no Java-specific features)
- Freedom to add Chinese healthcare extensions
- Clear reference implementation for complex algorithms

**Cons:**
- Requires deep understanding of HAPI's core algorithms
- Risk of subtle semantic differences if not careful
- No automatic benefit from HAPI bug fixes (must manually track)

---

## Decision

We adopt **Option 3: Conceptually Inspired by HAPI, Independently Implemented**.

### Core Principles

1. **Algorithm Reference**: Use HAPI as the authoritative reference for complex FHIR algorithms:
   - Snapshot generation (`ProfileUtilities.generateSnapshot()`)
   - Profile inheritance chain resolution
   - ElementDefinition constraint merging
   - Slicing semantics
   - Type constraint intersection

2. **Independent Implementation**: Implement in idiomatic TypeScript:
   - Async/await for I/O operations (not Java's blocking I/O)
   - Immutable data structures where appropriate
   - TypeScript type system for compile-time safety
   - Node.js ecosystem libraries (not Java libraries)

3. **Semantic Compatibility**: Ensure semantic equivalence with HAPI:
   - Same snapshot output for same StructureDefinition input
   - Same validation results for same resource + profile
   - Same interpretation of FHIR specification

4. **Divergence Where Necessary**: Explicitly diverge when:
   - Adding Chinese healthcare semantics (e.g., medical insurance codes)
   - Optimizing for Node.js performance characteristics
   - Simplifying for our specific use cases

### Architectural Mapping

| HAPI Component | MedXAI Equivalent | Notes |
|----------------|-------------------|-------|
| `FhirContext` | `fhir-context` module | Registry and lifecycle management |
| `ProfileUtilities` | `fhir-profile` module | Snapshot generation algorithm |
| `StructureDefinition` (model) | `fhir-model` types | Canonical type definitions |
| `IValidationSupport` | `fhir-context` + loaders | Definition resolution |
| `FhirValidator` | `fhir-validator` module | Structural validation |
| `JsonParser` | `fhir-parser` module | JSON/XML parsing |

### What We Take from HAPI

✅ **Algorithms** (logic, not code):
- Snapshot generation algorithm (6-step process)
- Element path normalization rules
- Cardinality constraint merging rules
- Type constraint intersection rules
- Binding strength comparison rules

✅ **Semantic Interpretation**:
- How to interpret StructureDefinition
- How to resolve profile inheritance
- How to handle slicing
- How to process choice types

✅ **Test Cases** (as validation):
- Use HAPI's test StructureDefinitions as reference
- Validate our snapshot generation produces same results

### What We Do NOT Take from HAPI

❌ **Java-Specific Patterns**:
- Spring dependency injection (use TypeScript DI or simple factories)
- JPA/Hibernate persistence (use PostgreSQL + custom DAL)
- Java's blocking I/O model (use async/await)

❌ **Unnecessary Features** (for Stage-1):
- Full FHIR server REST API (build incrementally)
- Narrative generation (defer to later stages)
- CDA conversion (out of scope)

❌ **Implementation Details**:
- Class hierarchies (use composition over inheritance)
- Exception handling patterns (use Result types or custom error handling)

---

## Consequences

### Positive

1. **Reduced Risk**: Leverage 10+ years of HAPI's production validation
2. **Faster Time to Correctness**: Don't reinvent snapshot generation
3. **Clear Reference**: When in doubt, check HAPI's behavior
4. **Community Alignment**: Semantic compatibility with widely-used implementation
5. **Flexibility**: Freedom to optimize for Node.js and Chinese healthcare

### Negative

1. **Learning Curve**: Team must understand HAPI's algorithms (not just use them)
2. **Manual Tracking**: Must manually track HAPI updates for bug fixes
3. **Semantic Debt**: Risk of subtle differences if we misunderstand HAPI's logic
4. **Documentation Burden**: Must document where and why we diverge

### Mitigation Strategies

1. **Deep Dive Sessions**: Schedule team sessions to study HAPI's core algorithms
2. **Reference Tests**: Create test suite that validates semantic equivalence with HAPI
3. **ADR for Divergence**: Require ADR for any intentional semantic divergence
4. **HAPI Version Tracking**: Monitor HAPI releases for relevant bug fixes

---

## Implementation Guidance

### Stage-1: Canonical FHIR Model

**MUST implement** (HAPI-inspired):
- Snapshot generation algorithm (reference: `ProfileUtilities.generateSnapshot()`)
- Profile inheritance chain resolution
- ElementDefinition constraint merging
- Path normalization (base, sliced, choice types)

**Reference HAPI Classes**:
- `org.hl7.fhir.r4.conformance.ProfileUtilities`
- `org.hl7.fhir.r4.model.StructureDefinition`
- `org.hl7.fhir.r4.model.ElementDefinition`

### Stage-2+: Runtime and Validation

**MUST implement** (HAPI-inspired):
- Structural validation logic
- FHIRPath evaluation (reference: `org.hl7.fhir.r4.utils.FHIRPathEngine`)
- Search parameter processing

**Diverge** (Node.js-specific):
- Async validation pipeline
- Streaming JSON parsing for large resources
- Event-driven architecture for real-time validation

---

## Validation Criteria

This decision is successful if:

1. ✅ MedXAI produces **identical snapshots** to HAPI for standard FHIR profiles
2. ✅ MedXAI validation results **match HAPI** for structural validation
3. ✅ Core algorithms are **documented with HAPI references**
4. ✅ Team can **explain** how our implementation differs from HAPI and why
5. ✅ Chinese healthcare extensions work **without breaking FHIR semantics**

---

## References

- [HAPI FHIR GitHub](https://github.com/hapifhir/hapi-fhir)
- [HAPI FHIR Documentation](https://hapifhir.io/hapi-fhir/docs/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [ProfileUtilities.java](https://github.com/hapifhir/org.hl7.fhir.core/blob/master/org.hl7.fhir.r4/src/main/java/org/hl7/fhir/r4/conformance/ProfileUtilities.java)

---

## Related Documents

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - System layering
- [MODULES.md](../architecture/MODULES.md) - Module definitions
- [Stage-1-Canonical-FHIR-Model.md](../stages/Stage-1-Canonical-FHIR-Model.md) - Snapshot generation details
- [GLOSSARY.md](../architecture/GLOSSARY.md) - Term definitions

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-04 | 1.0 | Initial decision | Architecture Team |
