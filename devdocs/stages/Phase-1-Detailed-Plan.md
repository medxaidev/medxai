# Phase 1: Foundation — fhir-model 详细开发计划

## Status

**Status:** Active  
**Phase:** Phase 1 of Stage-1  
**Package:** `@medxai/fhir-core` → `src/model/`  
**Duration:** 5-7 days  
**Last Updated:** 2026-02-07

---

## Overview

Phase 1 的目标是在 `packages/fhir-core/src/model/` 中定义 **完整的 FHIR R4 类型系统**，包括：

1. FHIR 原始类型（Primitive Types）
2. StructureDefinition 模型
3. ElementDefinition 模型（最复杂）
4. 内部 Canonical 语义模型

**核心约束：纯类型定义，零逻辑代码。**

---

## 文件结构

```
packages/fhir-core/src/model/
  ├── primitives.ts              ← Task 1.1: FHIR 原始类型
  ├── structure-definition.ts    ← Task 1.2: StructureDefinition 模型
  ├── element-definition.ts      ← Task 1.3: ElementDefinition 模型
  ├── canonical-profile.ts       ← Task 1.4: 内部 Canonical 语义模型
  └── index.ts                   ← 统一导出
```

---

## Task 1.1: FHIR Primitive Types (Day 1)

**文件:** `src/model/primitives.ts`

### 需要定义的类型

根据 FHIR R4 规范 (https://hl7.org/fhir/R4/datatypes.html#primitive)，完整的原始类型列表：

| FHIR Type      | TypeScript 映射 | 正则/格式约束                                         |
| -------------- | --------------- | ----------------------------------------------------- |
| `boolean`      | `boolean`       | `true \| false`                                       |
| `integer`      | `number`        | `[0] \| [-+]?[1-9][0-9]*`                             |
| `string`       | `string`        | `[ \r\n\t\S]+`                                        |
| `decimal`      | `number`        | `-?(0\|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?`     |
| `uri`          | `string`        | `\S*`                                                 |
| `url`          | `string`        | `http{s}:` / `ftp:` / `mailto:` / `mllp:`             |
| `canonical`    | `string`        | URL with optional `\|version`                         |
| `base64Binary` | `string`        | `(\s*([0-9a-zA-Z\+=]){4}\s*)+`                        |
| `instant`      | `string`        | `YYYY-MM-DDThh:mm:ss.sss+zz:zz`                       |
| `date`         | `string`        | `YYYY(-MM(-DD)?)?`                                    |
| `dateTime`     | `string`        | `YYYY(-MM(-DD(Thh:mm:ss(.sss)?(Z\|(+\|-)hh:mm))?)?)?` |
| `time`         | `string`        | `hh:mm:ss(.sss)?`                                     |
| `code`         | `string`        | `[^\s]+(\s[^\s]+)*`                                   |
| `oid`          | `string`        | `urn:oid:[0-2](\.(0\|[1-9][0-9]*))+`                  |
| `id`           | `string`        | `[A-Za-z0-9\-\.]{1,64}`                               |
| `markdown`     | `string`        | same as string                                        |
| `unsignedInt`  | `number`        | `[0] \| ([1-9][0-9]*)`                                |
| `positiveInt`  | `number`        | `+?[1-9][0-9]*`                                       |
| `uuid`         | `string`        | RFC 4122                                              |

### 实现策略

使用 **branded types**（带品牌的类型别名），在编译时区分不同的原始类型，同时保持运行时零开销：

```typescript
// Branded type pattern
type FhirString = string & { readonly __brand: "FhirString" };
```

**注意：** 验证逻辑（正则校验等）不在此文件中实现，属于 `fhir-parser` 的职责。

### 额外需要定义的

- **通用枚举类型**：`PublicationStatus`, `FHIRVersion`, `StructureDefinitionKind`, `TypeDerivationRule` 等在多处使用的枚举值
- **基础复合类型**：`Element`, `Extension`, `Coding`, `CodeableConcept`, `Identifier`, `ContactDetail`, `UsageContext` 等被 StructureDefinition 和 ElementDefinition 引用的类型

### 验收标准

- [x] 所有 20 种 FHIR R4 原始类型已定义 (FhirBoolean ~ FhirXhtml, branded types)
- [x] 通用枚举类型已定义 (13 种: PublicationStatus, StructureDefinitionKind, BindingStrength, etc.)
- [x] 基础复合类型已定义 (16 个: Element, Extension, Coding, CodeableConcept, Identifier, Period, Reference, ContactDetail, ContactPoint, UsageContext, Quantity, Narrative, Meta, Resource, DomainResource, BackboneElement)
- [x] TypeScript 编译通过 (`tsc --noEmit` exit 0)
- [x] JSDoc 注释包含 FHIR 规范引用 (每个类型均有 `@see` 链接)

**Completed:** 2026-02-07

---

## Task 1.2: StructureDefinition Model (Day 2-3)

**文件:** `src/model/structure-definition.ts`

### 完整字段清单（FHIR R4 规范）

根据 https://hl7.org/fhir/R4/structuredefinition.html 的 Resource Content：

```typescript
interface StructureDefinition {
  // === Resource 基础字段 ===
  resourceType: "StructureDefinition";
  id?: string;
  meta?: Meta;
  implicitRules?: string; // uri
  language?: string; // code

  // === DomainResource 字段 ===
  text?: Narrative;
  contained?: Resource[];
  extension?: Extension[];
  modifierExtension?: Extension[];

  // === StructureDefinition 特有字段 ===
  url: string; // uri, 1..1
  identifier?: Identifier[]; // 0..*
  version?: string; // 0..1
  name: string; // 1..1 (computer-friendly)
  title?: string; // 0..1 (human-friendly)
  status: PublicationStatus; // 1..1 Required
  experimental?: boolean; // 0..1
  date?: string; // dateTime, 0..1
  publisher?: string; // 0..1
  contact?: ContactDetail[]; // 0..*
  description?: string; // markdown, 0..1
  useContext?: UsageContext[]; // 0..*
  jurisdiction?: CodeableConcept[]; // 0..*
  purpose?: string; // markdown, 0..1
  copyright?: string; // markdown, 0..1
  keyword?: Coding[]; // 0..*
  fhirVersion?: string; // code, 0..1

  // === Mapping ===
  mapping?: StructureDefinitionMapping[]; // 0..*

  // === 核心语义字段 ===
  kind: StructureDefinitionKind; // 1..1 Required
  abstract: boolean; // 1..1
  context?: StructureDefinitionContext[]; // 0..* (仅 Extension 类型)
  contextInvariant?: string[]; // 0..* (仅 Extension 类型)
  type: string; // uri, 1..1
  baseDefinition?: string; // canonical, 0..1
  derivation?: TypeDerivationRule; // 0..1

  // === Snapshot & Differential ===
  snapshot?: StructureDefinitionSnapshot;
  differential?: StructureDefinitionDifferential;
}
```

### 子类型

```typescript
interface StructureDefinitionMapping {
  identity: string; // id, 1..1
  uri?: string; // 0..1
  name?: string; // 0..1
  comment?: string; // 0..1
}

interface StructureDefinitionContext {
  type: ExtensionContextType; // 1..1
  expression: string; // 1..1
}

interface StructureDefinitionSnapshot {
  element: ElementDefinition[]; // 1..*
}

interface StructureDefinitionDifferential {
  element: ElementDefinition[]; // 1..*
}
```

### 枚举值

```typescript
type PublicationStatus = "draft" | "active" | "retired" | "unknown";
type StructureDefinitionKind =
  | "primitive-type"
  | "complex-type"
  | "resource"
  | "logical";
type TypeDerivationRule = "specialization" | "constraint";
type ExtensionContextType = "fhirpath" | "element" | "extension";
```

### 实现决策

**Stage-1 范围内需要完整定义的字段：**

- 所有核心语义字段（kind, abstract, type, baseDefinition, derivation）
- snapshot / differential
- url, name, status, version

**可简化处理的字段（定义但不深入子类型）：**

- meta, text, contained（Resource 基础设施，Stage-1 不需要深入）
- contact, useContext, jurisdiction（元数据，不影响语义处理）

### 验收标准

- [x] StructureDefinition 接口完整定义 (extends DomainResource, 36 字段全覆盖)
- [x] 所有子类型（Mapping, Context, Snapshot, Differential）已定义 (4 个 BackboneElement 子类型)
- [x] 所有相关枚举已定义 (复用 primitives.ts: PublicationStatus, StructureDefinitionKind, TypeDerivationRule, ExtensionContextType, FhirVersionCode)
- [x] TypeScript 编译通过 (`tsc --noEmit` exit 0)
- [x] JSDoc 注释标注每个字段的 cardinality 和 FHIR 规范引用 (每个字段均有 `@see` 链接)

**附带修改:** `primitives.ts` 中 `Resource.resourceType` 从 `FhirString` 改为 `string`，允许具体资源接口窄化为字符串字面量。

**Completed:** 2026-02-07

---

## Task 1.3: ElementDefinition Model (Day 3-4)

**文件:** `src/model/element-definition.ts`

**这是 Phase 1 中最复杂的类型定义。** ElementDefinition 有 ~40 个字段，包含多个嵌套子类型。

### 完整字段清单（FHIR R4 规范）

根据 https://hl7.org/fhir/R4/elementdefinition.html：

```typescript
interface ElementDefinition {
  // === 标识 ===
  id?: string;
  extension?: Extension[];
  modifierExtension?: Extension[];

  // === 核心路径 ===
  path: string; // 1..1
  representation?: PropertyRepresentation[]; // 0..*
  sliceName?: string; // 0..1
  sliceIsConstraining?: boolean; // 0..1
  label?: string; // 0..1
  code?: Coding[]; // 0..*

  // === Slicing ===
  slicing?: ElementDefinitionSlicing; // 0..1

  // === 文档 ===
  short?: string; // 0..1
  definition?: string; // markdown, 0..1
  comment?: string; // markdown, 0..1
  requirements?: string; // markdown, 0..1
  alias?: string[]; // 0..*

  // === Cardinality ===
  min?: number; // unsignedInt, 0..1
  max?: string; // 0..1 (number or "*")

  // === Base ===
  base?: ElementDefinitionBase; // 0..1

  // === Content Reference ===
  contentReference?: string; // uri, 0..1

  // === Type ===
  type?: ElementDefinitionType[]; // 0..*

  // === Value Constraints ===
  defaultValue?: unknown; // [x], 0..1 (any type)
  meaningWhenMissing?: string; // markdown, 0..1
  orderMeaning?: string; // 0..1
  fixed?: unknown; // [x], 0..1 (any type)
  pattern?: unknown; // [x], 0..1 (any type)

  // === Examples ===
  example?: ElementDefinitionExample[]; // 0..*

  // === Value Range ===
  minValue?: unknown; // [x], 0..1 (date|dateTime|instant|time|decimal|integer|positiveInt|unsignedInt|Quantity)
  maxValue?: unknown; // [x], 0..1 (same types)
  maxLength?: number; // integer, 0..1

  // === Constraints ===
  condition?: string[]; // id[], 0..*
  constraint?: ElementDefinitionConstraint[]; // 0..*

  // === Flags ===
  mustSupport?: boolean; // 0..1
  isModifier?: boolean; // 0..1
  isModifierReason?: string; // 0..1
  isSummary?: boolean; // 0..1

  // === Binding ===
  binding?: ElementDefinitionBinding; // 0..1

  // === Mapping ===
  mapping?: ElementDefinitionMapping[]; // 0..*
}
```

### 子类型

```typescript
// === Slicing ===
interface ElementDefinitionSlicing {
  discriminator?: SlicingDiscriminator[]; // 0..*
  description?: string; // 0..1
  ordered?: boolean; // 0..1
  rules: SlicingRules; // 1..1
}

interface SlicingDiscriminator {
  type: DiscriminatorType; // 1..1
  path: string; // 1..1
}

// === Base ===
interface ElementDefinitionBase {
  path: string; // 1..1
  min: number; // unsignedInt, 1..1
  max: string; // 1..1
}

// === Type ===
interface ElementDefinitionType {
  code: string; // uri, 1..1
  profile?: string[]; // canonical[], 0..*
  targetProfile?: string[]; // canonical[], 0..*
  aggregation?: AggregationMode[]; // 0..*
  versioning?: ReferenceVersionRules; // 0..1
}

// === Constraint ===
interface ElementDefinitionConstraint {
  key: string; // id, 1..1
  requirements?: string; // 0..1
  severity: ConstraintSeverity; // 1..1
  human: string; // 1..1
  expression?: string; // 0..1 (FHIRPath)
  xpath?: string; // 0..1
  source?: string; // canonical, 0..1
}

// === Binding ===
interface ElementDefinitionBinding {
  strength: BindingStrength; // 1..1
  description?: string; // 0..1
  valueSet?: string; // canonical, 0..1
}

// === Example ===
interface ElementDefinitionExample {
  label: string; // 1..1
  value: unknown; // [x], 1..1 (any type)
}

// === Mapping ===
interface ElementDefinitionMapping {
  identity: string; // id, 1..1
  language?: string; // code, 0..1
  map: string; // 1..1
  comment?: string; // 0..1
}
```

### 枚举值

```typescript
type PropertyRepresentation =
  | "xmlAttr"
  | "xmlText"
  | "typeAttr"
  | "cdaText"
  | "xhtml";
type DiscriminatorType = "value" | "exists" | "pattern" | "type" | "profile";
type SlicingRules = "closed" | "open" | "openAtEnd";
type AggregationMode = "contained" | "referenced" | "bundled";
type ReferenceVersionRules = "either" | "independent" | "specific";
type ConstraintSeverity = "error" | "warning";
type BindingStrength = "required" | "extensible" | "preferred" | "example";
```

### choice type [x] 字段处理策略

FHIR 的 `[x]` 字段（如 `defaultValue[x]`, `fixed[x]`, `pattern[x]`）在 JSON 中展开为具体类型名（如 `defaultValueString`, `fixedCodeableConcept`）。

**Stage-1 策略：** 使用 `unknown` 类型 + JSDoc 注释说明允许的类型。在 `fhir-parser`（Phase 2）中处理具体的类型解析。

### 验收标准

- [x] ElementDefinition 接口完整定义（37 字段，extends BackboneElement）
- [x] 所有子类型已定义（8 个：Slicing, SlicingDiscriminator, Base, Type, Constraint, Binding, Example, Mapping）
- [x] 所有枚举已定义（复用 primitives.ts 中 7 个枚举）
- [x] choice type [x] 字段有清晰的 JSDoc 说明（5 个 [x] 字段均标注 Stage-1 策略 + 允许类型）
- [x] TypeScript 编译通过（`tsc --noEmit` exit 0）

**Completed:** 2026-02-07

---

## Task 1.4: Canonical Profile Model (Day 5-6)

**文件:** `src/model/canonical-profile.ts`

### 设计目标

Canonical 模型是 **内部语义模型**，是 StructureDefinition 经过 snapshot 生成后的 **扁平化、已解析** 表示。它不是 FHIR 规范定义的类型，而是我们系统内部的语义抽象。

### 与 FHIR 模型的关系

```
StructureDefinition (FHIR R4 规范)
  → snapshot generation (fhir-profile)
    → CanonicalProfile (内部语义模型)
```

### 接口定义

```typescript
interface CanonicalProfile {
  url: string;
  version?: string;
  name: string;
  kind: StructureDefinitionKind;
  type: string;
  baseProfile?: string; // canonical URL of base
  abstract: boolean;
  derivation?: TypeDerivationRule;
  elements: Map<string, CanonicalElement>; // path → element
}

interface CanonicalElement {
  path: string;
  id: string;
  min: number;
  max: number | "unbounded"; // 将 "*" 转为语义值
  types: TypeConstraint[];
  binding?: BindingConstraint;
  constraints: Invariant[];
  slicing?: SlicingDefinition;
  mustSupport: boolean;
  isModifier: boolean;
  isSummary: boolean;
}

interface TypeConstraint {
  code: string;
  profiles?: string[];
  targetProfiles?: string[];
}

interface BindingConstraint {
  strength: BindingStrength;
  valueSetUrl?: string;
  description?: string;
}

interface Invariant {
  key: string;
  severity: ConstraintSeverity;
  human: string;
  expression?: string;
  source?: string;
}

interface SlicingDefinition {
  discriminators: SlicingDiscriminatorDef[];
  rules: SlicingRules;
  ordered: boolean;
  description?: string;
}

interface SlicingDiscriminatorDef {
  type: DiscriminatorType;
  path: string;
}
```

### 设计决策

1. **`max` 使用 `number | 'unbounded'`** 而非 FHIR 的 `string`，避免下游代码反复解析 `"*"`
2. **`elements` 使用 `Map<string, CanonicalElement>`** 而非数组，支持 O(1) 路径查找
3. **`constraints` 始终为数组**（不是 optional），简化下游代码
4. **`mustSupport` / `isModifier` / `isSummary` 始终有值**（默认 `false`），避免 undefined 检查

### 验收标准

- [x] CanonicalProfile 接口定义完整（9 字段，含 elements Map）
- [x] CanonicalElement 接口定义完整（11 字段，所有 flag 非可选）
- [x] 所有辅助类型已定义（TypeConstraint, BindingConstraint, Invariant, SlicingDefinition, SlicingDiscriminatorDef）
- [x] 设计决策在 JSDoc 中有说明（4 项决策均标注）
- [x] TypeScript 编译通过（`tsc --noEmit` exit 0）

**Completed:** 2026-02-08

---

## Task 1.5: 统一导出 & 编译验证 (Day 6-7)

### 工作项

1. **创建 `src/model/index.ts`** — 统一导出所有 model 类型
2. **更新 `src/index.ts`** — 从 model 重新导出公共 API
3. **运行 `tsc`** — 确保所有类型编译通过
4. **运行 `npm run build`** — 确保完整构建流程正常
5. **检查导出** — 确保 api-extractor 能正确生成 `.d.ts`

### 验收标准

- [x] `npm run build` 成功（clean → tsc → api-extractor → esbuild ESM+CJS）
- [x] `dist/index.d.ts` 包含所有公共类型（1607 行，70 个导出类型）
- [x] 无 TypeScript 编译错误（`tsc --noEmit` exit 0）
- [x] 无 api-extractor 警告（修复了 TSDoc 转义问题）

**Completed:** 2026-02-08

---

## Phase 1 总体验收标准

| 标准                                   | 状态 |
| -------------------------------------- | ---- |
| 所有 FHIR R4 原始类型已定义            | ✅   |
| StructureDefinition 模型完整           | ✅   |
| ElementDefinition 模型完整（~40 字段） | ✅   |
| Canonical 内部模型已定义               | ✅   |
| 所有枚举类型已定义                     | ✅   |
| JSDoc 注释完整（含 FHIR 规范引用）     | ✅   |
| TypeScript 编译通过                    | ✅   |
| `npm run build` 成功                   | ✅   |
| 零逻辑代码（纯类型）                   | ✅   |
| 代码审查通过                           | ⬜   |

---

## 依赖关系

```
primitives.ts ← structure-definition.ts
                      ↑
primitives.ts ← element-definition.ts
                      ↑
primitives.ts ← canonical-profile.ts
    + element-definition.ts 的枚举
```

**开发顺序必须为：** 1.1 → 1.2 & 1.3（可并行） → 1.4 → 1.5

---

## 风险与缓解

| 风险                       | 缓解措施                                         |
| -------------------------- | ------------------------------------------------ |
| ElementDefinition 字段遗漏 | 对照 FHIR R4 规范逐字段核对                      |
| choice type [x] 处理不当   | Stage-1 使用 `unknown`，Phase 2 再细化           |
| Canonical 模型设计不合理   | Phase 4（snapshot generation）会验证，可迭代调整 |
| 类型过于宽松               | 优先正确性，后续可收紧                           |

---

## References

- [FHIR R4 StructureDefinition](https://hl7.org/fhir/R4/structuredefinition.html)
- [FHIR R4 ElementDefinition](https://hl7.org/fhir/R4/elementdefinition.html)
- [FHIR R4 Data Types](https://hl7.org/fhir/R4/datatypes.html)
- [ADR-002: Single Package fhir-core](../decisions/ADR-002-Single-Package-fhir-core.md)
- [MODULES.md](../architecture/MODULES.md) — fhir-model 职责定义
