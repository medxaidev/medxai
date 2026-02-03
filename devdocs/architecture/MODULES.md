# MODULES (Enforceable)

## Status

**Status:** Active
**Version:** v1.0
**Scope:** This document defines **all first-class modules** of the system, their responsibilities, and their allowed dependency relationships.

Any new module **MUST** conform to this document. Violations require a documented ADR.

---

## 1. Module Classification

All modules **MUST** belong to exactly one of the following layers:

1. **Core FHIR Layer** – FHIR semantics and algorithms
2. **Infrastructure Layer** – persistence and low-level technical concerns
3. **Platform Layer** – multi-tenant, auth, governance, and system services
4. **Application Layer** – clinical and operational applications
5. **Integration Layer** – external systems and adapters

Cross-layer dependencies are **strictly regulated**.

---

## 2. Core FHIR Layer (Mandatory, Stable)

### 2.1 Responsibility

The Core FHIR Layer defines the **semantic engine** of the platform.

It is responsible for:

- Parsing FHIR resources and definitions
- Validation against FHIR core + custom profiles
- Search semantics and evaluation
- Reference resolution
- Transaction and bundle execution
- Versioning and history rules

This layer is **conceptually inspired by HAPI FHIR**, but implemented independently.

---

### 2.2 Modules

#### `fhir-model`

**Responsibilities:**

- Define canonical internal representations
- Own resource identity, typing, and element addressing

**Stability:**

- Extremely high

**Must NOT:**

- Contain parsing or validation logic
- Depend on infrastructure or platform layers

---

#### `fhir-parser`

**Responsibilities:**

- Parse FHIR JSON/XML into internal canonical structures
- Normalize element paths and types

**Must NOT:**

- Access database
- Contain business logic

---

#### `fhir-validator`

**Responsibilities:**

- Structural validation
- Profile-based constraint evaluation
- Terminology hooks (no storage)

**Depends on:**

- `fhir-parser`

---

#### `fhir-search`

**Responsibilities:**

- Interpret FHIR SearchParameters
- Build abstract query plans

**Must NOT:**

- Execute SQL
- Assume any specific database

---

#### `fhir-reference`

**Responsibilities:**

- Resolve logical references
- Enforce reference integrity rules

---

#### `fhir-transaction`

**Responsibilities:**

- Execute Bundle transactions
- Enforce atomicity and ordering

---

#### `fhir-history`

**Responsibilities:**

- Manage resource versioning
- Support \_history interactions

---

## 3. Infrastructure Layer (Replaceable)

### 3.1 Responsibility

Provides **technical implementations** for persistence and indexing.

This layer has **no FHIR semantics of its own**.

---

### 3.2 Modules

#### `storage-postgres`

**Responsibilities:**

- Persist resources using PostgreSQL + JSONB
- Manage transactions

**Depends on:**

- Database drivers only

---

#### `index-engine`

**Responsibilities:**

- Create and maintain search indexes
- Translate abstract query plans into SQL

**Depends on:**

- `fhir-search`
- `storage-postgres`

---

## 4. Platform Layer (Governance)

### 4.1 Responsibility

The Platform Layer governs **who can do what, where, and under which tenant**.

---

### 4.2 Modules

#### `tenant-service`

**Responsibilities:**

- Tenant lifecycle management
- Tenant isolation policies

---

#### `auth-service`

**Responsibilities:**

- Authentication (OIDC/JWT)
- Identity resolution

---

#### `rbac-service`

**Responsibilities:**

- Role and permission evaluation
- Resource-level access control

---

#### `audit-service`

**Responsibilities:**

- AuditEvent generation
- Compliance logging

---

#### `workflow-engine`

**Responsibilities:**

- Workflow orchestration
- Task and approval flows

**Must NOT:**

- Embed clinical decision logic
- Bypass Core FHIR validation

---

## 5. Application Layer (Evolvable)

### 5.1 Responsibility

Application modules implement **Chinese medical workflows**, using but never modifying lower layers.

---

### 5.2 Modules

#### `app-emr`

- Electronic Medical Record management

#### `app-opd`

- Outpatient workflows

#### `app-lis`

- Laboratory management

#### `app-ris`

- Imaging and examination management

#### `app-prescription`

- Prescription and approval flows

---

## 6. Integration Layer (Adapters)

### Responsibility

Isolate all external system interactions.

Integration modules MUST NOT expose domain abstractions upstream.

---

### Modules

#### `adapter-his`

- Legacy HIS integration

#### `adapter-insurance-cn`

- Chinese insurance systems

---

## 7. Dependency Rules (Enforced)

- Core FHIR Layer **MUST NOT** depend on any other layer
- Infrastructure Layer **MAY** depend on public interfaces of Core FHIR
- Infrastructure Layer **MUST NOT** import internal symbols of Core FHIR
- Platform Layer **MAY** depend on Core + Infrastructure
- Application Layer **MAY** depend on all lower layers
- Integration Layer **MUST NOT** be depended upon

Violations require an ADR.

---

## 8. Module Lifecycle Rules

- Core FHIR modules are **high-stability**
- Platform modules are **medium-stability**
- Application modules are **low-stability**

Breaking changes must follow semantic versioning.

---

## 9. Extension Policy

- New FHIR behavior → Core FHIR Layer
- New governance rules → Platform Layer
- New medical workflows → Application Layer
- New external systems → Integration Layer

---

## 10. Stage-1 Module Allowlist (Enforced)

During Stage-1 development, only the following Core FHIR modules are permitted:

### Allowed Modules (Stage-1)

- fhir-model
- fhir-parser
- fhir-validator (StructureDefinition only)
- fhir-profile
- fhir-context

### Conditionally Allowed (Read-only / Test-only)

- terminology-assets (external, read-only)

### Explicitly Forbidden in Stage-1

- fhir-search
- fhir-reference (runtime resolution)
- fhir-transaction
- fhir-history
- index-engine
- storage-postgres
- any Platform / Application / Integration modules

Implementation of forbidden modules during Stage-1 is a violation.

---

**This document is enforceable.**
