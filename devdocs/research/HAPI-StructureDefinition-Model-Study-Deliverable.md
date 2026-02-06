# HAPI R4 `StructureDefinition` (Model) Study Deliverable

## Status

Active

## Scope / Purpose

This document covers Study Guide section **2. StructureDefinition.java (Model)**.

- Location: `org.hl7.fhir.r4.model.StructureDefinition`
- Focus: data structure, key fields, and how `snapshot`/`differential` relate to inheritance (`baseDefinition`) and derivation.

---

## 1) What `StructureDefinition` Represents

`StructureDefinition` is a **canonical definition of a structure** in FHIR:

- base specification definitions (Resources, primitive/complex datatypes)
- extensions
- profiles/constraints on existing definitions
- logical models

---

## 2) Relationship Between `snapshot` and `differential`

### 2.1 `differential`

- Field: `protected StructureDefinitionDifferentialComponent differential;`
- Definition: “relative to the base StructureDefinition - a statement of differences that it applies.”

Meaning:

- The differential is the **compact authoring form**.
- It may contain only the elements that changed vs base.
- It may repeat the same `path` multiple times to express slicing.

### 2.2 `snapshot`

- Field: `protected StructureDefinitionSnapshotComponent snapshot;`
- Definition: “standalone form that can be used and interpreted without considering the base.”

Meaning:

- The snapshot is the **fully expanded result** after merging base snapshot + differential constraints.
- `ProfileUtilities.generateSnapshot()` populates this.

### 2.3 Practical invariant in HAPI snapshot generation

- Input:
  - `base` (a StructureDefinition whose snapshot is the starting point)
  - `derived` (a StructureDefinition with a differential)
- Output:
  - `derived.snapshot` is constructed

In other words:

- differential is _applied_
- snapshot is _produced_

---

## 3) `baseDefinition` and Inheritance

### 3.1 Field

- `protected CanonicalType baseDefinition;`
- Definition: “base structure from which this type is derived, either by specialization or constraint.”

Meaning:

- `baseDefinition` is the canonical URL of the parent definition.
- It is the anchor for inheritance.

### 3.2 How HAPI uses it (snapshot context)

In snapshot generation, HAPI typically:

- resolves `baseDefinition` to fetch the base `StructureDefinition`
- then merges base snapshot + derived differential

Even when a profile is multiple-level derived, base traceability is maintained via:

- `ElementDefinition.base` components (populated by `updateFromBase()`)

---

## 4) Key Fields (Checklist: List all key fields)

`StructureDefinition` extends `MetadataResource`, so it inherits canonical and metadata fields (url, name, status, etc.).

Below are the key fields for profiling/snapshot generation (grouped by responsibility):

### 4.1 Identity / Publication

- `url` (canonical URL)
- `identifier[]`
- `version`
- `name` / `title`
- `status` (`PublicationStatus`)
- `experimental`
- `date`
- `publisher` / `contact[]`

### 4.2 Classification / Type system

- `fhirVersion`
- `kind` (see section 5)
- `abstract`
- `type` (the type defined or constrained)
- `baseDefinition` (inheritance)
- `derivation` (see section 6)

### 4.3 Extension context (only meaningful when defining extensions)

- `context[]`
- `contextInvariant[]`

### 4.4 Views

- `snapshot`
- `differential`

---

## 5) `kind` values (Checklist: Understand `kind`)

Enum: `StructureDefinitionKind`

Allowed codes:

- `primitive-type` => `PRIMITIVETYPE`
- `complex-type` => `COMPLEXTYPE`
- `resource` => `RESOURCE`
- `logical` => `LOGICAL`

中文说明（直译 + 场景）：

- `primitive-type`（原始类型）
  - 例如 `string`, `boolean` 这类
- `complex-type`（复杂数据类型）
  - 例如 `HumanName`, `Address`
- `resource`（资源）
  - 例如 `Patient`, `Observation`
- `logical`（逻辑模型）
  - 不是实际资源/数据类型，更像模板/信息模型

Snapshot 关联点（经验法则）：

- 绝大多数 profile（constraint）会是 `kind=resource` 或 `complex-type`。

---

## 6) `derivation` values (Checklist: Understand `derivation`)

Enum: `TypeDerivationRule`

Allowed codes:

- `specialization` => `SPECIALIZATION`
- `constraint` => `CONSTRAINT`

Meaning in the Javadoc:

- `specialization`:
  - defines a **new type** that adds new elements to the base type
- `constraint`:
  - adds additional rules to an **existing concrete type**

中文说明：

- `specialization`：派生出“新类型”（可能增加新元素）
- `constraint`：对已有具体类型施加“约束”（profile 的典型情况）

HAPI snapshot generation context:

- For typical profile snapshot generation, you usually expect:
  - `derived.derivation = constraint`
  - `derived.baseDefinition` points to the type/profile being constrained

---

## 7) Text-based Data Model Diagram (Deliverable)

Requested deliverable was a “data model diagram”. Below is a text-only diagram (easy to diff/version-control):

```text
StructureDefinition
  - url : uri (canonical)
  - name/title/version/status/... (MetadataResource)
  - kind : StructureDefinitionKind
  - abstract : boolean
  - type : uri
  - baseDefinition : canonical (0..1)
  - derivation : TypeDerivationRule (0..1)
  - snapshot : StructureDefinitionSnapshotComponent (0..1)
      - element[] : ElementDefinition
  - differential : StructureDefinitionDifferentialComponent (0..1)
      - element[] : ElementDefinition

Relationship:
  baseDefinition -> resolves to base StructureDefinition
  generateSnapshot(base, derived):
    derived.snapshot.element[] = merge(base.snapshot.element[], derived.differential.element[])
```

---

## References

- `org.hl7.fhir.r4.model.StructureDefinition`
  - `StructureDefinitionKind`
  - `TypeDerivationRule`
  - fields: `kind`, `type`, `baseDefinition`, `derivation`, `snapshot`, `differential`
