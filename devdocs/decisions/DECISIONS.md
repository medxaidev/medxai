# Architecture Decisions

本目录记录所有对系统长期演进有影响的关键决策。

## Active ADRs

| ID                                                 | Title                                           | Status   | Date       | Impact                                     |
| -------------------------------------------------- | ----------------------------------------------- | -------- | ---------- | ------------------------------------------ |
| [ADR-001](./ADR-001-HAPI-Inspired-Architecture.md) | HAPI-Inspired Architecture for Core FHIR Engine | Accepted | 2026-02-04 | High - Defines core architectural approach |

## Planned ADRs

| ID      | Title                                            | Status | Date |
| ------- | ------------------------------------------------ | ------ | ---- |
| ADR-002 | FHIR Version Choice (R4 vs R5)                   | Draft  | TBD  |
| ADR-003 | Database Schema Design for FHIR Resources        | Draft  | TBD  |
| ADR-004 | Chinese Medical Terminology Integration Strategy | Draft  | TBD  |

## ADR Template

When creating a new ADR, use the following structure:

```markdown
# ADR-NNN: Title

## Status

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Deciders:** [List of decision makers]

## Context

[What is the issue we're facing? What constraints exist?]

## Decision

[What did we decide? What are the core principles?]

## Consequences

[What are the positive and negative outcomes?]

## References

[Links to related documents, discussions, or external resources]
```
