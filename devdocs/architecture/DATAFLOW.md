# DATAFLOW (Enforceable)

## Status

**Status:** Active
**Version:** v1.0
**Scope:** This document defines **authoritative runtime data flows** across modules defined in `MODULES.md`.

Any runtime path **MUST** conform to this document. Deviations require an ADR.

---

## 1. Purpose

This document answers one question only:

> **How does data move through the system at runtime?**

It does **not** define:

- Module responsibilities (see MODULES.md)
- Architectural principles (see ARCHITECTURE.md)

---

## 2. Canonical Runtime Model

All external interactions are normalized into a canonical flow:

```
Request
  → Auth / Tenant Resolution
  → FHIR Validation Gate
  → Core FHIR Semantics
  → Infrastructure Execution
  → Audit / History
  → Response
```

No module may bypass this sequence.

---

## 3. Common Entry Flow (All Requests)

### 3.1 Authentication & Tenant Resolution

**Modules involved:**

- `auth-service`
- `tenant-service`

**Flow:**

1. Authenticate identity
2. Resolve tenant context
3. Attach tenant + identity to request context

**Hard Rules:**

- No Core FHIR module may access auth or tenant state directly
- Tenant context MUST be immutable after resolution

---

### 3.2 Authorization (RBAC)

**Modules involved:**

- `rbac-service`

**Flow:**

1. Evaluate permissions against resource + operation
2. Reject unauthorized requests before FHIR execution

---

## 4. Read / vRead Flow

**Modules involved:**

- `fhir-model`
- `storage-postgres`
- `audit-service`

**Flow:**

1. Resolve resource identity
2. Load canonical representation
3. Return immutable resource snapshot
4. Emit audit event

**Must NOT:**

- Perform validation
- Modify resource state

---

## 5. Search Flow (Critical)

**Modules involved:**

- `fhir-search`
- `index-engine`
- `storage-postgres`

**Flow:**

1. Parse SearchParameters
2. Build abstract query plan (`fhir-search`)
3. Translate plan into executable query (`index-engine`)
4. Execute query (`storage-postgres`)
5. Rehydrate resources

**Hard Rules:**

- `fhir-search` MUST NOT generate SQL
- `index-engine` MUST NOT interpret FHIR semantics

---

## 6. Create / Update Flow

**Modules involved:**

- `fhir-parser`
- `fhir-validator`
- `fhir-reference`
- `fhir-transaction`
- `storage-postgres`
- `audit-service`

**Flow:**

1. Parse incoming resource
2. Validate structure and profiles
3. Resolve references
4. Execute transaction
5. Persist new version
6. Record history and audit

**Hard Rules:**

- Validation MUST precede persistence
- Transactions MUST be atomic

---

## 7. Transaction (Bundle) Flow

**Modules involved:**

- `fhir-transaction`

**Flow:**

1. Parse Bundle
2. Order entries deterministically
3. Execute each entry following Create/Update rules
4. Commit or rollback as a unit

---

## 8. Workflow Interaction Flow

**Modules involved:**

- `workflow-engine`
- Application modules

**Flow:**

1. Application emits workflow event
2. Workflow engine creates Tasks
3. Tasks drive state transitions

**Hard Rules:**

- Workflow MUST NOT mutate resources directly
- All mutations go through Core FHIR flows

---

## 9. Integration Flow

**Modules involved:**

- Integration adapters

**Flow:**

1. External system interaction
2. Map to internal DTO
3. Pass into Core FHIR entry points

**Hard Rules:**

- Integration modules MUST NOT bypass validation
- MUST NOT expose external abstractions upstream

---

## 10. Audit & History Flow

**Modules involved:**

- `audit-service`
- `fhir-history`

**Flow:**

1. Observe state-changing operations
2. Record immutable events

Audit and history MUST be append-only.

---

## 11. Forbidden Flows

The following are explicitly forbidden:

- Application → storage-postgres (direct access)
- Workflow → database writes
- Integration → Core FHIR internals
- Infrastructure → Platform logic

---

## 12. Stability & Evolution

- This document is **high-stability**
- Changes require strong justification
- New flows MUST be added explicitly

---

**This document is enforceable.**
