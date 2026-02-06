# HAPI R4 `ElementDefinition` (Model) Study Deliverable

## Status

Active

## Scope / Purpose

This document covers Study Guide section **3. ElementDefinition.java (Model)**.

- Location: `org.hl7.fhir.r4.model.ElementDefinition`
- Focus:
  - Core fields (`path`, `min`, `max`, `type`, `binding`, `constraint`, `slicing`, `sliceName`)
  - Nested component structures (`TypeRefComponent`, `ElementDefinitionBindingComponent`, `ElementDefinitionConstraintComponent`, `ElementDefinitionSlicingComponent`, `...DiscriminatorComponent`)
  - Practical examples and path rules needed to implement snapshot generation and validation.

中文说明：

- 本交付文档面向你后续 TS 对标实现，重点是把 `ElementDefinition` 的“数据结构形状”讲清楚，并给出 `path/type/binding/constraint/slicing` 这些快照算法最关心字段的规则与示例。

---

## 1) Big picture: What `ElementDefinition` is

`ElementDefinition` is the schema-level description of **one element** in a StructureDefinition's `snapshot.element[]` or `differential.element[]`.

In practice:

- `StructureDefinition.snapshot.element[]` is the fully expanded element list.
- `StructureDefinition.differential.element[]` is a sparse list describing differences.

中文说明：

- `ElementDefinition` 是“结构定义中的一个节点”。
- 在 snapshot 里它表示完整定义；在 differential 里它表示约束/变化。

---

## 2) Core fields (with examples) (Checklist: Document all fields with examples)

Below are the most algorithm-relevant fields.

### 2.1 Identity / addressing

#### `path : string`

- Javadoc: dot-separated list of ancestors starting with resource/extension name.

Example:

- `Patient.name.family`
- `Observation.value[x]`
- `Observation.component.code`

中文说明：

- `path` 是树上的“绝对路径键”，snapshot/differential 的对齐、排序、合并都靠它。

#### `sliceName : string?`

- Used to name a particular slice under the same `path`.
- Constraints:
  - token-like: **no dots, no spaces**

Example:

- `Patient.identifier` with slices:
  - slice A: `path=Patient.identifier`, `sliceName=nationalId`
  - slice B: `path=Patient.identifier`, `sliceName=mrn`

中文说明：

- sliceName 是“同一路径下的不同切片”的区分 ID。

#### `sliceIsConstraining : boolean?`

- If true: this slice definition constrains a slice with the same name in an inherited profile.

中文说明：

- 这是 slice 的“覆盖/继承约束”的标记，处理多层 profile 继承时很重要。

### 2.2 Cardinality

#### `min : number?` (`UnsignedIntType`)

- Minimum occurrences.

Example:

- `min=0` (optional)
- `min=1` (required)

#### `max : string?` (`StringType`)

- Maximum occurrences, either a number or `*`.

Example:

- `max="1"`
- `max="*"`

中文说明：

- `min/max` 是快照算法中的核心收窄点（derived 只能更严格，不能更宽松）。

### 2.3 Base traceability

#### `base : ElementDefinitionBaseComponent?`

- Contains base path/min/max to avoid tracing across inheritance.
- Populated in HAPI by `ProfileUtilities.updateFromBase()`.

Shape:

- `base.path : string` (base element path)
- `base.min : number`
- `base.max : string`

中文说明：

- `base` 是快照合并后的“溯源信息”，不是 differential 作者直接写出来的主要内容。

### 2.4 Type constraints

#### `type[] : TypeRefComponent`

Field:

- `protected List<TypeRefComponent> type;`

`TypeRefComponent` fields (algorithm-critical):

- `code : uri` (required)
- `profile[] : canonical` (0..*)
- `targetProfile[] : canonical` (0..*)
- `aggregation[] : code` (0..*)
- `versioning : code` (0..1)

Examples:

- Primitive datatype:
  - `type[0].code = "string"`

- Choice type (conceptual):
  - `path = Observation.value[x]`
  - `type = [{code:"Quantity"}, {code:"string"}, ...]`

- Reference target constraints:
  - `type[0].code = "Reference"`
  - `type[0].targetProfile = ["http://hl7.org/fhir/StructureDefinition/Patient"]`

- Datatype profile constraints:
  - `type[0].code = "CodeableConcept"`
  - `type[0].profile = ["http://example.org/StructureDefinition/MyCodeableConceptProfile"]`

中文说明：

- `code` 决定“允许的类型”。
- `profile` 是对 datatype 本身施加 profile 约束。
- `targetProfile` 仅对 `Reference`/`canonical` 的“指向目标”施加 profile 约束。

### 2.5 Terminology binding

#### `binding : ElementDefinitionBindingComponent?`

Fields:

- `strength : BindingStrength` (required when binding present)
- `valueSet : canonical(ValueSet)`
- `description : string?`

Example:

- `binding.strength = required`
- `binding.valueSet = "http://hl7.org/fhir/ValueSet/administrative-gender"`

中文说明：

- binding 只对可绑定类型有意义（例如 `code`, `Coding`, `CodeableConcept`, `Quantity` 等）。
- HAPI 在 `updateFromDefinition()` 中会根据最终 `type` 是否可绑定来保留/清除 binding。

### 2.6 Invariants / constraints

#### `constraint[] : ElementDefinitionConstraintComponent`

Key fields:

- `key : id` (required)
- `severity : ConstraintSeverity` (`error` | `warning`) (required)
- `human : string` (required)
- `expression : string?` (FHIRPath)
- `xpath : string?`
- `source : canonical?`

Example:

- `key = "inv-1"`
- `severity = error`
- `human = "Must have either A or B"`
- `expression = "a.exists() xor b.exists()"`

中文说明：

- invariants 会在 HAPI 的合并过程中 **累加**（base + derived 都会进 snapshot 的 constraint 列表）。

### 2.7 Slicing metadata

#### `slicing : ElementDefinitionSlicingComponent?`

Key fields:

- `discriminator[] : ElementDefinitionSlicingDiscriminatorComponent`
- `description : string?`
- `ordered : boolean?`
- `rules : SlicingRules` (required when slicing present)

`ElementDefinitionSlicingDiscriminatorComponent` fields:

- `type : DiscriminatorType` (required)
  - `value | exists | pattern | type | profile`
- `path : string` (FHIRPath, required)

Example (extension slicing):

- `path = Patient.extension`
- `slicing.discriminator[0].type = value`
- `slicing.discriminator[0].path = "url"`
- `slicing.rules = open`
- `slicing.ordered = false`

中文说明：

- slicing 定义在“母元素（unsliced element）”上。
- 之后同一路径 + 不同 `sliceName` 的元素定义就是 slices。

---

## 3) `path` format rules (Checklist: Understand `path` format rules)

### 3.1 Basic rule

- Dot-separated: `Root.child.grandchild`.
- Root is usually the resource type name (e.g. `Patient`).

### 3.2 Choice type (`[x]`)

- In base snapshot, polymorphic elements use `[x]` suffix:
  - `Observation.value[x]`

- In differential and some processing steps, concrete expansions may appear:
  - `Observation.valueString`
  - `Observation.valueQuantity`

Important implication:

- Sorting and matching logic must treat `valueString` as matching base `value[x]`.

中文说明：

- `[x]` 是 choice 类型占位符。
- 在 HAPI 的排序与合并里，`valueString` 会被映射/匹配到 `value[x]`。

### 3.3 Slices are not encoded into `path`

Even though humans may write `path:sliceName`, in the model:

- `path` remains unchanged
- `sliceName` is stored separately

中文说明：

- slice 的“路径键”仍是 `path`，sliceName 是额外维度。

---

## 4) `type` structure details (Checklist: Understand `type` structure)

### 4.1 `code`

- Required
- Examples:
  - `"string"`, `"CodeableConcept"`, `"Reference"`, `"Extension"`

### 4.2 `profile[]`

- For constraining the datatype/resource itself.
- If present, instance must conform to at least one listed profile.

### 4.3 `targetProfile[]`

- Only relevant when `code` is `Reference` or `canonical`.
- Constrains the target resource profile(s).

中文说明：

- `profile` vs `targetProfile` 是 TS 对标实现时最容易写错的点：
  - `profile` 约束“值本身的结构”
  - `targetProfile` 约束“引用指向的资源结构”

---

## 5) `binding` structure (Checklist)

- `strength` (`required | extensible | preferred | example`) drives conformance strictness.
- `valueSet` is canonical URL.

中文说明：

- `required` 是最严格的绑定，HAPI 合并逻辑里也会对 base/derived 的 required 进行一致性校验（见 `updateFromDefinition()`）。

---

## 6) `constraint` structure (Checklist)

Minimum viable invariant:

- `key` + `severity` + `human`

Optional execution fields:

- `expression` (FHIRPath) is the common modern form
- `xpath` exists for legacy

中文说明：

- 你的 TS 实现如果要做 validator，需要重点支持 `expression`（FHIRPath）。

---

## 7) `slicing` structure (Checklist)

### 7.1 Discriminator types

- `value`: compare values of a named element
- `exists`: presence/absence
- `pattern`: evaluate against `pattern[x]`
- `type`: element type
- `profile`: conformance to a profile (special note: `.resolve()` implies target profile checks)

### 7.2 Rules

- `closed`: no additional slices
- `open`: additional slices allowed anywhere
- `openAtEnd`: additional slices allowed only at the end

### 7.3 Ordered

- `ordered=true` means slice order matters in instance matching.

中文说明：

- `openAtEnd` 在规范含义上依赖 ordered，但 HAPI 在不同环节对规则兼容性有自己实现（详见你前面 slicing 交付文档）。

---

## 8) Text-based Data Model Diagram (Deliverable)

```text
ElementDefinition
  - path : string
  - sliceName : string?
  - sliceIsConstraining : boolean?
  - slicing : SlicingComponent?
      - discriminator[] : Discriminator
          - type : DiscriminatorType
          - path : string (FHIRPath)
      - ordered : boolean?
      - rules : SlicingRules
      - description : string?

  - min : uint?
  - max : string?  ("0".."n" or "*")
  - base : BaseComponent?
      - path : string
      - min : uint
      - max : string

  - type[] : TypeRef
      - code : uri
      - profile[] : canonical
      - targetProfile[] : canonical
      - aggregation[] : AggregationMode
      - versioning : ReferenceVersionRules?

  - binding : Binding?
      - strength : BindingStrength
      - valueSet : canonical?
      - description : string?

  - constraint[] : Constraint
      - key : id
      - severity : error|warning
      - human : string
      - expression : string?
      - xpath : string?
      - source : canonical?

  (Plus many other fields: fixed/pattern/defaultValue/examples/minValue/maxValue/etc.)
```

---

## 9) Checklist Coverage (Study Guide 3)

- [x] Document all fields with examples
  - Covered key fields relevant to snapshot/profile algorithms, with examples.
- [x] Understand `path` format rules
  - Dot paths, `[x]` choice, slices via separate `sliceName`.
- [x] Understand `type` structure
  - `code`, `profile`, `targetProfile` and when each applies.
- [x] Understand `binding` structure
  - `strength`, `valueSet`.
- [x] Understand `constraint` structure
  - `key`, `severity`, `human`, `expression`.
- [x] Understand `slicing` structure
  - `discriminator`, `rules`, `ordered`.

---

## References

- `org.hl7.fhir.r4.model.ElementDefinition`
  - Nested components:
    - `TypeRefComponent`
    - `ElementDefinitionBindingComponent`
    - `ElementDefinitionConstraintComponent`
    - `ElementDefinitionSlicingComponent`
    - `ElementDefinitionSlicingDiscriminatorComponent`
  - Enums:
    - `DiscriminatorType`
    - `SlicingRules`
    - `ConstraintSeverity`
    - `Enumerations.BindingStrength`
