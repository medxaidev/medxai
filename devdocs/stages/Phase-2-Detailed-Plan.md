# Phase 2: fhir-parser — JSON 解析模块详细开发计划

**Phase:** 2 of 5  
**Duration:** 7-10 days  
**Complexity:** Medium  
**Risk:** Medium  
**Depends on:** Phase 1 (fhir-model types) ✅ Completed

---

## 目标概述

实现 `fhir-parser` 模块，将 FHIR R4 JSON 解析为 Phase 1 定义的 TypeScript 类型。
这是 Stage-1 中**第一个包含运行时逻辑的模块**，也是所有下游模块（context、profile、validator）的数据入口。

### 核心原则

1. **解析 ≠ 解释**: parser 只做 JSON → TypeScript 类型的结构映射，不做语义解释（语义属于 fhir-profile）
2. **防御性解析**: 所有输入视为不可信，必须验证结构完整性
3. **FHIR JSON 规范严格遵循**: 处理所有 FHIR R4 JSON 特殊约定（见下文）
4. **Round-trip 保真**: `serialize(parse(json))` 应产生语义等价的 JSON
5. **错误信息清晰**: 解析失败时提供精确的路径和原因

### 依赖规则 (MODULES.md)

```
fhir-parser MAY import from: fhir-model (types only)
fhir-parser MUST NOT import from: fhir-context, fhir-profile, fhir-validator
```

---

## FHIR R4 JSON 特殊约定（必须处理）

以下是 FHIR R4 JSON 格式与普通 JSON 的关键差异，parser 必须正确处理每一项：

### 1. 原始类型的双属性表示 (Primitive Element Split)

FHIR 原始类型在 JSON 中拆分为两个属性：

```json
{
  "birthDate": "1970-03-30",
  "_birthDate": {
    "id": "314159",
    "extension": [{ "url": "...", "valueString": "Easter 1970" }]
  }
}
```

- 值属性 (`birthDate`) 携带实际值
- 下划线属性 (`_birthDate`) 携带 `id` 和 `extension`
- 两者可以独立存在：值可以没有扩展，扩展可以没有值

### 2. 重复原始元素的 null 对齐 (Repeating Primitive Alignment)

```json
{
  "code": ["au", "nz"],
  "_code": [
    null,
    { "extension": [{ "url": "...", "valueString": "Kiwiland" }] }
  ]
}
```

- 两个数组必须长度对齐
- `null` 用于占位（值数组中表示无值，扩展数组中表示无扩展）

### 3. Choice Type [x] 属性名分发

```json
{
  "valueString": "hello",
  "defaultValueQuantity": { "value": 42, "unit": "kg" }
}
```

- JSON 属性名包含类型后缀
- 同一个 choice 字段只能出现一个变体
- 参见 [ADR-003](../decisions/ADR-003-FHIR-R4-Choice-Type-Strategy.md)

### 4. resourceType 位置不确定

```json
{ "text": { "status": "generated" }, "resourceType": "Patient" }
```

- `resourceType` 不保证是第一个属性
- Parser 不能假设属性顺序

### 5. 十进制精度丢失

```json
{ "value": 2.0 }
```

- JavaScript `JSON.parse()` 会将 `2.00` 转为 `2`
- FHIR 规范要求保留精度（对临床测量至关重要）
- **Stage-1 策略**: 使用标准 `JSON.parse()`，记录精度限制；如需精确精度，后续引入 BigNumber 库

### 6. XHTML 作为转义字符串

```json
{ "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p>...</p></div>" }
```

- Narrative.div 是转义的 XHTML 字符串，不是 JSON 对象
- Parser 直接作为字符串传递，不做 HTML 解析

---

## 文件结构

```
packages/fhir-core/src/parser/
  ├── index.ts                          # Barrel export
  ├── parse-error.ts                    # Task 2.1: 错误类型
  ├── json-parser.ts                    # Task 2.2: 核心 JSON 解析引擎
  ├── primitive-parser.ts               # Task 2.3: 原始类型解析 + _element 合并
  ├── choice-type-parser.ts             # Task 2.4: Choice type [x] 分发
  ├── structure-definition-parser.ts    # Task 2.5: StructureDefinition 专用解析
  └── serializer.ts                     # Task 2.6: JSON 序列化（反向）

packages/fhir-core/src/parser/__tests__/
  ├── json-parser.test.ts               # Task 2.7: 核心解析器测试
  ├── primitive-parser.test.ts          # Task 2.7: 原始类型测试
  ├── choice-type-parser.test.ts        # Task 2.7: Choice type 测试
  ├── structure-definition-parser.test.ts # Task 2.7: SD 解析测试
  ├── serializer.test.ts                # Task 2.7: 序列化测试
  ├── round-trip.test.ts                # Task 2.7: Round-trip 测试
  └── fixtures/                         # 测试数据
      ├── patient-base.json             # FHIR R4 Patient base StructureDefinition
      ├── observation-base.json         # FHIR R4 Observation base StructureDefinition
      ├── us-core-patient.json          # US Core Patient profile (constraint)
      └── edge-cases.json              # 边界情况测试数据
```

---

## Task 2.1: 解析错误类型 (Day 1, ~0.5 day)

### 文件: `parse-error.ts`

定义结构化的解析错误类型，提供精确的错误定位。

### 接口设计

```typescript
/**
 * 解析错误的严重级别
 */
export type ParseSeverity = "error" | "warning";

/**
 * 单个解析问题
 */
export interface ParseIssue {
  /** 严重级别 */
  severity: ParseSeverity;
  /** 机器可读的错误代码 */
  code: ParseErrorCode;
  /** 人类可读的错误描述 */
  message: string;
  /** JSON 中的路径 (e.g., "Patient.name[0].given") */
  path: string;
}

/**
 * 解析错误代码枚举
 */
export type ParseErrorCode =
  | "INVALID_JSON" // JSON 语法错误
  | "MISSING_RESOURCE_TYPE" // 缺少 resourceType
  | "UNKNOWN_RESOURCE_TYPE" // 未知的 resourceType
  | "INVALID_PRIMITIVE" // 原始类型值无效
  | "INVALID_STRUCTURE" // 结构不符合预期
  | "INVALID_CHOICE_TYPE" // Choice type 属性名无效
  | "MULTIPLE_CHOICE_VALUES" // 同一 choice 字段有多个值
  | "ARRAY_MISMATCH" // _element 数组长度不匹配
  | "UNEXPECTED_NULL" // 非预期的 null 值
  | "UNEXPECTED_PROPERTY"; // 未知属性（warning）

/**
 * 解析结果：成功时携带数据 + 可能的 warnings，失败时携带 errors
 */
export type ParseResult<T> =
  | { success: true; data: T; issues: ParseIssue[] }
  | { success: false; data: undefined; issues: ParseIssue[] };
```

### 设计决策

- **Result 类型而非异常**: 使用 `ParseResult<T>` 而非 throw，允许收集多个错误
- **Path 追踪**: 每个 issue 携带 JSON path，便于定位问题
- **Warning 支持**: 未知属性等非致命问题作为 warning 报告，不阻止解析

### 验收标准

- [x] `ParseResult<T>` 类型定义完整 ✅ (2026-02-08)
- [x] `ParseErrorCode` 覆盖所有已知错误场景 ✅ (2026-02-08)
- [x] `ParseIssue` 包含 severity、code、message、path ✅ (2026-02-08)
- [x] 编译通过 ✅ (2026-02-08)

### Implementation Notes (2026-02-08)

- **File**: `src/parser/parse-error.ts` (~180 lines)
- **Exports**: `ParseSeverity`, `ParseErrorCode` (10 codes), `ParseIssue`, `ParseResult<T>`, `parseSuccess`, `parseFailure`, `createIssue`, `hasErrors`
- **Tests**: `__tests__/parse-error.test.ts` — 21 tests

---

## Task 2.2: 核心 JSON 解析引擎 (Day 1-3, ~2.5 days)

### 文件: `json-parser.ts`

核心解析引擎，处理 FHIR JSON 的通用结构映射。

### 公共 API

```typescript
/**
 * 解析 FHIR JSON 字符串为 Resource 对象
 *
 * 这是 parser 的主入口。根据 resourceType 分发到具体的解析函数。
 * Stage-1 仅支持 StructureDefinition；其他资源类型返回通用 Resource。
 */
export function parseFhirJson(json: string): ParseResult<Resource>;

/**
 * 解析已经 JSON.parse() 过的对象
 *
 * 用于已经有 JavaScript 对象的场景（如从数据库读取）。
 */
export function parseFhirObject(obj: unknown): ParseResult<Resource>;
```

### 内部架构

```
parseFhirJson(json: string)
  │
  ├── JSON.parse() — 捕获语法错误
  │
  └── parseFhirObject(obj)
        │
        ├── 验证是 object 且非 null/array
        ├── 提取 resourceType
        ├── 根据 resourceType 分发:
        │     ├── 'StructureDefinition' → parseStructureDefinition()
        │     └── 其他 → parseGenericResource()
        │
        └── 收集并返回 ParseResult
```

### 核心内部函数

```typescript
/**
 * 解析 FHIR 复合类型对象的通用逻辑
 *
 * 处理:
 * - 普通属性映射
 * - _element 合并（委托给 primitive-parser）
 * - choice type [x] 分发（委托给 choice-type-parser）
 * - 数组处理（重复元素）
 * - 未知属性收集（warning）
 *
 * @param obj - 原始 JSON 对象
 * @param path - 当前 JSON path（用于错误报告）
 * @param knownProperties - 该类型已知的属性名集合
 */
function parseComplexType(
  obj: Record<string, unknown>,
  path: string,
  knownProperties: ReadonlySet<string>,
): { result: Record<string, unknown>; issues: ParseIssue[] };
```

### 关键实现细节

1. **属性遍历策略**: 遍历 JSON 对象的所有 key，分类处理：
   - 以 `_` 开头 → 原始类型扩展，与对应值属性合并
   - 匹配已知 choice type 前缀 → 委托给 choice-type-parser
   - 匹配已知属性名 → 直接映射
   - 其他 → 记录 warning（UNEXPECTED_PROPERTY）

2. **递归解析**: 复合类型属性递归调用 `parseComplexType`

3. **数组处理**:
   - 检查 FHIR 规范中该属性是否为数组类型
   - 数组元素逐个解析
   - 空数组视为不存在（FHIR 规范：JSON 对象和数组不能为空）

### 验收标准

- [x] `parseFhirJson()` 能解析有效的 FHIR JSON 字符串 ✅ (2026-02-08)
- [x] `parseFhirObject()` 能解析已解析的 JSON 对象 ✅ (2026-02-08)
- [x] 无效 JSON 返回 `INVALID_JSON` 错误 ✅ (2026-02-08)
- [x] 缺少 `resourceType` 返回 `MISSING_RESOURCE_TYPE` 错误 ✅ (2026-02-08)
- [x] 未知属性产生 warning 而非 error ✅ (2026-02-08)
- [x] 路径追踪正确（嵌套对象、数组索引） ✅ (2026-02-08)

### Implementation Notes (2026-02-08)

- **File**: `src/parser/json-parser.ts` (~450 lines)
- **Exports**: `parseFhirJson`, `parseFhirObject`, `parseComplexObject`, `isPlainObject`, `pathAppend`, `pathIndex`, `JsonObject`, `PropertyDescriptor`, `PropertySchema`, `ComplexParseResult`
- **Tests**: `__tests__/json-parser.test.ts` — 48 tests (11 fixtures in `fixtures/` and `fixtures/invalid/`)
- **Bug found by tests**: Pass 4 `_element` filtering used `consumedKeys.has(key.slice(1))` which incorrectly suppressed warnings for `_element` companions of non-primitive properties — fixed to `consumedKeys.has(key)`
- **Architecture**: 4-pass strategy (known props → \_element companions → choice type [x] → unexpected warnings), schema-driven via `PropertySchema`

---

## Task 2.3: 原始类型解析 + \_element 合并 (Day 3-4, ~1.5 days)

### 文件: `primitive-parser.ts`

处理 FHIR JSON 中原始类型的双属性表示。

### 核心函数

```typescript
/**
 * 合并原始值和其 _element 扩展
 *
 * FHIR JSON 将原始类型拆分为两个属性:
 * - `name`: 实际值 (string | number | boolean)
 * - `_name`: id 和 extension
 *
 * 此函数将两者合并为统一的内部表示。
 *
 * @example
 * // Input:
 * // "birthDate": "1970-03-30"
 * // "_birthDate": { "id": "314159", "extension": [...] }
 * // Output:
 * // { value: "1970-03-30" as FhirDate, id: "314159", extension: [...] }
 */
export function mergePrimitiveElement(
  value: unknown,
  elementExtension: unknown,
  path: string,
): { result: unknown; issues: ParseIssue[] };

/**
 * 合并重复原始元素数组和其 _element 数组
 *
 * 处理 null 对齐:
 * "code": ["au", "nz"]
 * "_code": [null, { "extension": [...] }]
 *
 * @returns 合并后的数组，每个元素包含值和可能的扩展
 */
export function mergePrimitiveArray(
  values: unknown[],
  elementExtensions: unknown[] | undefined,
  path: string,
): { result: unknown[]; issues: ParseIssue[] };
```

### 原始类型值验证

```typescript
/**
 * 验证原始类型值的 JavaScript 类型是否正确
 *
 * FHIR JSON 类型映射:
 * - boolean → JSON boolean
 * - integer, positiveInt, unsignedInt → JSON number (整数)
 * - decimal → JSON number
 * - 所有其他类型 → JSON string
 */
export function validatePrimitiveValue(
  value: unknown,
  fhirType: string,
  path: string,
): ParseIssue | null;
```

### \_element 处理规则

| 场景           | 值属性         | \_属性                              | 结果                                                 |
| -------------- | -------------- | ----------------------------------- | ---------------------------------------------------- |
| 正常           | `"1970-03-30"` | 无                                  | `{ value: "1970-03-30" }`                            |
| 有扩展         | `"1970-03-30"` | `{ "id": "x", "extension": [...] }` | `{ value: "1970-03-30", id: "x", extension: [...] }` |
| 仅扩展         | 无             | `{ "extension": [...] }`            | `{ extension: [...] }`                               |
| 数组对齐       | `["a", "b"]`   | `[null, { "ext": [...] }]`          | `[{ value: "a" }, { value: "b", ext: [...] }]`       |
| 数组长度不匹配 | `["a"]`        | `[null, { ... }]`                   | error: `ARRAY_MISMATCH`                              |

### Stage-1 简化策略

对于 Stage-1，原始类型解析采用**直通策略**：

- 值直接作为 branded type 传递（不做正则验证）
- `_element` 中的 `id` 和 `extension` 合并到 Element 基类属性
- 正则验证推迟到 fhir-validator（Phase 5）

**理由**: Parser 的职责是结构映射，不是值验证。值验证属于 validator 的职责范围。

### 验收标准

- [x] 正确合并值属性和 `_element` 属性 ✅ (2026-02-08)
- [x] 正确处理仅有 `_element` 无值的情况 ✅ (2026-02-08)
- [x] 正确处理重复原始元素的 null 对齐 ✅ (2026-02-08)
- [x] 数组长度不匹配时报告 `ARRAY_MISMATCH` 错误 ✅ (2026-02-08)
- [x] 验证原始值的 JavaScript 类型（boolean/number/string） ✅ (2026-02-08)

### Implementation Notes (2026-02-08)

- **File**: `src/parser/primitive-parser.ts` (~435 lines)
- **Exports**: `validatePrimitiveValue`, `getExpectedJsType`, `mergePrimitiveElement`, `mergePrimitiveArray`, `PrimitiveWithMetadata`, `ElementMetadata`, `PrimitiveJsType`
- **Tests**: `__tests__/primitive-parser.test.ts` — 58 tests covering all 20 FHIR primitive types, \_element merging, null alignment, array mismatch, and edge cases
- **Bug found by tests**: `mergePrimitiveArray` lost `INVALID_STRUCTURE` issue when falling back to values-only on non-array `_element` input — fixed by merging issues from recursive call
- **Stage-1 simplification**: No regex validation of primitive values (deferred to fhir-validator Phase 5). Parser only checks JS type correctness (boolean/number/string) and integer wholeness.

---

## Task 2.4: Choice Type [x] 解析 (Day 4-5, ~1.5 days)

### 文件: `choice-type-parser.ts`

处理 FHIR choice type `[x]` 的属性名分发。

### 核心函数

```typescript
/**
 * Choice type [x] 字段的定义
 */
export interface ChoiceTypeField {
  /** 基础属性名 (e.g., "value", "defaultValue") */
  baseName: string;
  /** 允许的类型后缀 (e.g., ["String", "Boolean", "Quantity"]) */
  allowedTypes: readonly string[];
}

/**
 * 从 JSON 对象中提取 choice type 值
 *
 * 扫描对象的所有属性名，查找匹配 `baseName` + 类型后缀的属性。
 *
 * @example
 * // choiceField = { baseName: "value", allowedTypes: ["String", "Boolean", ...] }
 * // obj = { "valueString": "hello" }
 * // → { typeName: "String", value: "hello", propertyName: "valueString" }
 *
 * @returns 提取的值和类型信息，或 null（如果不存在）
 */
export function extractChoiceValue(
  obj: Record<string, unknown>,
  choiceField: ChoiceTypeField,
  path: string,
): { result: ChoiceValue | null; issues: ParseIssue[]; consumedKeys: string[] };

/**
 * 解析后的 choice type 值
 *
 * 保留原始属性名以支持 round-trip 序列化。
 */
export interface ChoiceValue {
  /** 类型后缀 (e.g., "String", "Quantity") */
  typeName: string;
  /** 实际值 */
  value: unknown;
  /** 原始 JSON 属性名 (e.g., "valueString") — 用于序列化 */
  propertyName: string;
}
```

### Choice Type 注册表

```typescript
/**
 * 所有已知 choice type 字段的注册表
 *
 * 按宿主类型分组，列出每个 choice type 字段的基础名和允许的类型。
 */
export const CHOICE_TYPE_FIELDS: ReadonlyMap<string, ChoiceTypeField[]>;
```

**包含的 choice type 字段（来自 Phase 1 模型）:**

| 宿主类型                   | 基础名         | 允许的类型数量                                                                          |
| -------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `Extension`                | `value`        | ~50 (所有 FHIR 类型)                                                                    |
| `UsageContext`             | `value`        | 4 (CodeableConcept, Quantity, Range, Reference)                                         |
| `ElementDefinition`        | `defaultValue` | ~50                                                                                     |
| `ElementDefinition`        | `fixed`        | ~50                                                                                     |
| `ElementDefinition`        | `pattern`      | ~50                                                                                     |
| `ElementDefinition`        | `minValue`     | 9 (date, dateTime, instant, time, decimal, integer, positiveInt, unsignedInt, Quantity) |
| `ElementDefinition`        | `maxValue`     | 9                                                                                       |
| `ElementDefinitionExample` | `value`        | ~50                                                                                     |

### 多值检测

如果同一个 choice 字段出现多个变体（如同时有 `valueString` 和 `valueBoolean`），报告 `MULTIPLE_CHOICE_VALUES` 错误。

### 与 \_element 的交互

Choice type 的原始类型变体也可能有 `_element`：

```json
{
  "valueString": "hello",
  "_valueString": { "extension": [...] }
}
```

Parser 需要同时消费 `valueString` 和 `_valueString`。

### 验收标准

- [x] 正确从 JSON 对象中提取 choice type 值 ✅ (2026-02-08)
- [x] 保留原始属性名（`propertyName`）用于 round-trip ✅ (2026-02-08)
- [x] 检测并报告多值冲突 ✅ (2026-02-08)
- [x] 处理 choice type 的 `_element` 扩展 ✅ (2026-02-08)
- [x] 未知类型后缀报告 `INVALID_CHOICE_TYPE` 错误 ✅ (2026-02-08)
- [x] Choice type 注册表覆盖所有 8 个 choice 字段 ✅ (2026-02-08)

### Implementation Notes (2026-02-08)

- **File**: `src/parser/choice-type-parser.ts` (~340 lines)
- **Exports**: `ChoiceTypeField`, `ChoiceValue`, `extractChoiceValue`, `extractAllChoiceValues`, `getChoiceFieldBases`, `getChoiceFields`, `matchChoiceTypeProperty`, `CHOICE_TYPE_FIELDS`, `ALL_FHIR_TYPE_SUFFIXES` (~50 types), `MIN_MAX_VALUE_TYPE_SUFFIXES` (9 types), `USAGE_CONTEXT_VALUE_TYPE_SUFFIXES` (4 types)
- **Tests**: `__tests__/choice-type-parser.test.ts` — 43 tests covering extraction, multi-value conflicts, unknown suffixes, \_element companions, registry coverage, type suffix constants, and utility functions
- **Registry**: 4 host types (Extension, UsageContext, ElementDefinition, ElementDefinitionExample) × 8 total choice fields
- **No bugs found by tests** — all 43 tests passed on first run

---

## Task 2.5: StructureDefinition 专用解析 (Day 5-6, ~1.5 days)

### 文件: `structure-definition-parser.ts`

StructureDefinition 是 Stage-1 最重要的资源类型，需要专用解析器确保完整性。

### 公共 API

```typescript
/**
 * 解析 StructureDefinition JSON 对象
 *
 * 这是 Stage-1 中最重要的解析函数。所有后续模块
 * (fhir-context, fhir-profile, fhir-validator) 都依赖
 * 正确解析的 StructureDefinition。
 *
 * @param obj - 已解析的 JSON 对象（已验证 resourceType = "StructureDefinition"）
 * @param path - 当前路径（用于错误报告）
 */
export function parseStructureDefinition(
  obj: Record<string, unknown>,
  path: string,
): ParseResult<StructureDefinition>;

/**
 * 解析 ElementDefinition JSON 对象
 *
 * ElementDefinition 是 FHIR 中最复杂的数据类型，
 * 包含 ~37 个字段和 8 个子类型。
 */
export function parseElementDefinition(
  obj: Record<string, unknown>,
  path: string,
): { result: ElementDefinition; issues: ParseIssue[] };
```

### 解析策略

StructureDefinition 解析分为三层：

1. **顶层字段**: url, name, status, kind, type, abstract, etc.
2. **子类型**: mapping, context, snapshot, differential
3. **ElementDefinition 数组**: snapshot.element[], differential.element[]

ElementDefinition 解析是最复杂的部分：

```
parseElementDefinition(obj)
  ├── 基础字段: path, sliceName, min, max, ...
  ├── 子类型:
  │     ├── slicing → parseSlicing()
  │     ├── base → parseBase()
  │     ├── type[] → parseType()
  │     ├── constraint[] → parseConstraint()
  │     ├── binding → parseBinding()
  │     ├── example[] → parseExample()  ← 含 choice type
  │     └── mapping[] → parseMapping()
  └── Choice type 字段:
        ├── defaultValue[x] → extractChoiceValue()
        ├── fixed[x] → extractChoiceValue()
        ├── pattern[x] → extractChoiceValue()
        ├── minValue[x] → extractChoiceValue()
        └── maxValue[x] → extractChoiceValue()
```

### 已知属性集合

为每个类型维护已知属性名的 `Set`，用于检测未知属性：

```typescript
const STRUCTURE_DEFINITION_PROPERTIES = new Set([
  "resourceType",
  "id",
  "meta",
  "implicitRules",
  "language",
  "text",
  "contained",
  "extension",
  "modifierExtension",
  "url",
  "identifier",
  "version",
  "name",
  "title",
  "status",
  "experimental",
  "date",
  "publisher",
  "contact",
  "description",
  "useContext",
  "jurisdiction",
  "purpose",
  "copyright",
  "keyword",
  "fhirVersion",
  "mapping",
  "kind",
  "abstract",
  "context",
  "contextInvariant",
  "type",
  "baseDefinition",
  "derivation",
  "snapshot",
  "differential",
]);

const ELEMENT_DEFINITION_PROPERTIES = new Set([
  "id",
  "extension",
  "modifierExtension",
  "path",
  "representation",
  "sliceName",
  "sliceIsConstraining",
  "label",
  "code",
  "slicing",
  "short",
  "definition",
  "comment",
  "requirements",
  "alias",
  "min",
  "max",
  "base",
  "contentReference",
  "type",
  "meaningWhenMissing",
  "orderMeaning",
  "example",
  "maxLength",
  "condition",
  "constraint",
  "mustSupport",
  "isModifier",
  "isModifierReason",
  "isSummary",
  "binding",
  "mapping",
  // choice type 前缀由 choice-type-parser 处理
]);
```

### 验收标准

- [x] 正确解析完整的 StructureDefinition JSON ✅ (2026-02-09)
- [x] 正确解析 ElementDefinition 的所有 37 个字段 ✅ (2026-02-09)
- [x] 正确解析所有 8 个 ElementDefinition 子类型 ✅ (2026-02-09)
- [x] 正确处理 snapshot.element[] 和 differential.element[] ✅ (2026-02-09)
- [x] 正确处理 ElementDefinition 中的 5 个 choice type 字段 ✅ (2026-02-09)
- [x] 解析 FHIR R4 Patient base StructureDefinition 无错误 ✅ (2026-02-09)
- [x] 解析 FHIR R4 Observation base StructureDefinition 无错误 ✅ (2026-02-09)

### Implementation Notes (2026-02-09)

- **File**: `src/parser/structure-definition-parser.ts` (~765 lines)
- **Exports**: `parseStructureDefinition`, `parseElementDefinition`
- **Internal parsers**: 10 sub-type parsers (parseSlicing, parseDiscriminator, parseBase, parseEDType, parseConstraint, parseBinding, parseExample, parseEDMapping, parseSDMapping, parseSDContext) + parseElementContainer + parseObjectArray helper
- **Known property sets**: `STRUCTURE_DEFINITION_PROPERTIES` (36 keys), `ELEMENT_DEFINITION_PROPERTIES` (31 keys + choice type prefixes)
- **Choice type integration**: Uses `extractAllChoiceValues()` from choice-type-parser for 5 ED choice fields (defaultValue, fixed, pattern, minValue, maxValue) + example value[x]
- **Dispatch**: `json-parser.ts` → `parseFhirObject()` dispatches `resourceType=StructureDefinition` to dedicated parser

#### Test Files

- `__tests__/structure-definition-parser.test.ts` — 63 unit tests (required fields, optional metadata, sub-types, choice types, unknown properties, integration dispatch, fixture parsing, complex profile)
- `__tests__/structure-definition-fixtures.test.ts` — 93 fixture-based tests loading 45 JSON files

#### Test Fixtures (`__tests__/fixtures/structure-definition/`)

| Category                    | Files | Description                                                                                                                                                                                                                                                         |
| --------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-complete-sd/`           | 5     | Minimal, full metadata, extension-def, logical-model, datatype-def                                                                                                                                                                                                  |
| `02-element-fields/`        | 5     | Identity fields, cardinality+docs, flags+conditions, contentReference+maxLength, all-37-fields                                                                                                                                                                      |
| `03-element-subtypes/`      | 5     | Slicing+discriminator, base+type, constraints, binding+example, mapping                                                                                                                                                                                             |
| `04-snapshot-differential/` | 5     | Snapshot-only, differential-only, both, deep-nesting, large-element-array (19 elements)                                                                                                                                                                             |
| `05-choice-types/`          | 5     | fixed[x], pattern[x], defaultValue[x], minValue+maxValue[x], multiple-choice-fields                                                                                                                                                                                 |
| `06-base-resources/`        | 20    | Patient, Observation, Condition, Encounter, MedicationRequest, Procedure, DiagnosticReport, AllergyIntolerance, Immunization, Practitioner, Organization, CarePlan, Medication, Location, Claim, Bundle, Questionnaire, ServiceRequest, DocumentReference, ValueSet |

**Total**: 45 JSON fixture files, 156 tests (63 + 93), **326 total tests across 6 test files — all passing**

---

## Task 2.6: JSON 序列化 (Day 6-7, ~1.5 days)

### 文件: `serializer.ts`

将 TypeScript 模型对象序列化回 FHIR JSON。

### 公共 API

```typescript
/**
 * 将 Resource 对象序列化为 FHIR JSON 字符串
 *
 * 输出符合 FHIR R4 JSON 规范:
 * - 原始类型拆分为值属性和 _element 属性
 * - Choice type 使用正确的属性名后缀
 * - 空数组和 null 值被省略
 * - resourceType 作为第一个属性
 */
export function serializeToFhirJson(resource: Resource): string;

/**
 * 将 Resource 对象序列化为 JavaScript 对象（不做 JSON.stringify）
 */
export function serializeToFhirObject(
  resource: Resource,
): Record<string, unknown>;
```

### 序列化规则

1. **原始类型拆分**: 如果原始值有 `id` 或 `extension`，拆分为值属性和 `_` 属性
2. **Choice type 还原**: 使用 `ChoiceValue.propertyName` 还原原始属性名
3. **空值省略**: `undefined`、空数组 `[]`、空对象 `{}` 不输出
4. **属性排序**: `resourceType` 放第一位，其余按字母序（符合 FHIR canonical JSON）
5. **null 对齐**: 重复原始元素的 `_element` 数组使用 `null` 对齐

### 验收标准

- [x] 正确序列化 Resource 为 FHIR JSON 字符串
- [x] 原始类型正确拆分为值和 `_element`
- [x] Choice type 使用正确的属性名
- [x] 空值被正确省略
- [x] `resourceType` 作为第一个属性输出

### Implementation Notes (Completed 2026-02-10)

**Implementation file:** `packages/fhir-core/src/parser/serializer.ts` (~560 lines)

**Public API:**

- `serializeToFhirJson(resource: Resource): string` — pretty-printed JSON string
- `serializeToFhirObject(resource: Resource): Record<string, unknown>` — plain object

**Internal architecture (7 sections):**

1. Public API — dispatch by resourceType
2. StructureDefinition serializer — all top-level fields, alphabetical property ordering
3. Sub-type serializers — StructureDefinitionMapping, StructureDefinitionContext, element containers
4. ElementDefinition serializer — all 37+ fields, sub-types, choice type restoration
5. ElementDefinition sub-type serializers — Slicing, Discriminator, Base, Type, Constraint, Binding, Example, Mapping
6. Choice type serialization — `ChoiceValue` duck-typing detection, `propertyName` restoration, `_element` companion restoration
7. Utility helpers — `assignIfDefined`, `assignIfNotEmptyArray`

**Test file:** `__tests__/serializer.test.ts` — **53 tests** across 10 describe blocks:

- Public API (5 tests)
- Minimal SD serialization (2 tests)
- Full metadata serialization (5 tests)
- Slicing/discriminator serialization (3 tests)
- Base/type serialization (3 tests)
- Constraint serialization (2 tests)
- Binding/example serialization (3 tests)
- Choice type serialization (3 tests)
- Property ordering (2 tests)
- Round-trip parse→serialize→parse (15 tests)
- Edge cases (6 tests)
- Mapping serialization (1 test)
- Base resource round-trip (3 tests)

**Total test count after Task 2.6: 379 tests across 7 test files — all passing**

---

## Task 2.7: 测试套件 (Day 7-10, ~3 days)

### 测试策略

测试分为四个层次：

#### 层次 1: 单元测试 — 原始类型解析

```typescript
describe("primitive-parser", () => {
  // 基础值解析
  it("parses string primitive");
  it("parses boolean primitive");
  it("parses integer primitive");
  it("parses decimal primitive");

  // _element 合并
  it("merges value with _element extension");
  it("handles _element without value");
  it("handles value without _element");

  // 数组对齐
  it("merges primitive array with _element array");
  it("handles null alignment in arrays");
  it("reports ARRAY_MISMATCH for mismatched lengths");

  // 类型验证
  it("reports error for string where number expected");
  it("reports error for number where boolean expected");
});
```

#### 层次 2: 单元测试 — Choice Type 解析

```typescript
describe("choice-type-parser", () => {
  it("extracts valueString from Extension");
  it("extracts valueQuantity from Extension");
  it("extracts defaultValueBoolean from ElementDefinition");
  it("reports MULTIPLE_CHOICE_VALUES for conflicting values");
  it("reports INVALID_CHOICE_TYPE for unknown suffix");
  it("handles _valueString extension");
  it("returns null when no choice value present");
});
```

#### 层次 3: 集成测试 — StructureDefinition 解析

```typescript
describe("structure-definition-parser", () => {
  // 真实 FHIR R4 StructureDefinition JSON
  it("parses Patient base StructureDefinition");
  it("parses Observation base StructureDefinition");
  it("parses US Core Patient profile");

  // 字段完整性
  it("preserves all StructureDefinition top-level fields");
  it("preserves all ElementDefinition fields");
  it("preserves ElementDefinition.slicing");
  it("preserves ElementDefinition.type with profiles");
  it("preserves ElementDefinition.binding");
  it("preserves ElementDefinition.constraint");

  // 错误处理
  it("reports error for missing resourceType");
  it("reports error for wrong resourceType");
  it("reports warning for unknown properties");
});
```

#### 层次 4: Round-trip 测试

```typescript
describe("round-trip", () => {
  it("parse → serialize → parse produces equivalent StructureDefinition");
  it("parse → serialize preserves all ElementDefinition fields");
  it("parse → serialize preserves choice type property names");
  it("parse → serialize preserves _element extensions");
});
```

### 测试数据来源

1. **FHIR R4 官方 StructureDefinition JSON**: 从 https://hl7.org/fhir/R4/ 下载
   - `StructureDefinition-Patient.json`
   - `StructureDefinition-Observation.json`
2. **手工构造的边界情况**: 空数组、null 值、多 choice type 冲突等
3. **FHIR 官方边界情况文件**: https://hl7.org/fhir/R4/json-edge-cases.json

### 测试数量目标

| 类别                     | 预计测试数 |
| ------------------------ | ---------- |
| 原始类型解析             | 12-15      |
| Choice type 解析         | 8-10       |
| StructureDefinition 解析 | 10-12      |
| 序列化                   | 8-10       |
| Round-trip               | 5-8        |
| **总计**                 | **43-55**  |

### 验收标准

- [ ] 所有测试通过 (`vitest run`)
- [ ] 测试覆盖所有 FHIR JSON 特殊约定
- [ ] 至少 2 个真实 FHIR R4 StructureDefinition 解析成功
- [ ] Round-trip 测试通过
- [ ] 测试数量 ≥ 40

---

## Task 2.8: 统一导出 & 构建验证 (Day 10, ~0.5 day)

### 工作项

1. **创建 `src/parser/index.ts`** — 统一导出所有 parser 公共 API
2. **更新 `src/index.ts`** — 从 parser 重新导出公共 API
3. **运行 `tsc --noEmit`** — 确保编译通过
4. **运行 `npm run build`** — 确保完整构建流程正常
5. **运行 `vitest run`** — 确保所有测试通过
6. **更新文档** — 标记 Phase 2 完成

### 导出策略

```typescript
// src/parser/index.ts
export { parseFhirJson, parseFhirObject } from "./json-parser.js";
export { parseStructureDefinition } from "./structure-definition-parser.js";
export { serializeToFhirJson, serializeToFhirObject } from "./serializer.js";
export type {
  ParseResult,
  ParseIssue,
  ParseErrorCode,
  ParseSeverity,
} from "./parse-error.js";
export type { ChoiceValue } from "./choice-type-parser.js";

// 内部函数不导出:
// - mergePrimitiveElement (internal)
// - mergePrimitiveArray (internal)
// - extractChoiceValue (internal)
// - validatePrimitiveValue (internal)
```

### 验收标准

- [ ] `npm run build` 成功
- [ ] `vitest run` 所有测试通过
- [ ] `dist/index.d.ts` 包含所有新增公共类型
- [ ] 无 TypeScript 编译错误
- [ ] 无 api-extractor 警告
- [ ] 文档已更新

---

## Phase 2 总体验收标准

| 标准                                         | 状态 |
| -------------------------------------------- | ---- |
| `parseFhirJson()` 能解析有效 FHIR JSON       | ⬜   |
| 正确处理原始类型双属性表示                   | ⬜   |
| 正确处理 choice type [x] 分发                | ⬜   |
| 正确处理重复元素 null 对齐                   | ⬜   |
| 解析 FHIR R4 Patient StructureDefinition     | ⬜   |
| 解析 FHIR R4 Observation StructureDefinition | ⬜   |
| Round-trip 保真 (parse → serialize → parse)  | ⬜   |
| 错误信息包含精确路径                         | ⬜   |
| 测试数量 ≥ 40                                | ⬜   |
| `npm run build` 成功                         | ⬜   |
| 零 TypeScript 编译错误                       | ⬜   |
| 代码审查通过                                 | ⬜   |

---

## 依赖关系

```
Task 2.1 (parse-error)
  ↓
Task 2.2 (json-parser) ← Task 2.3 (primitive-parser)
                        ← Task 2.4 (choice-type-parser)
  ↓
Task 2.5 (structure-definition-parser)
  ↓
Task 2.6 (serializer)
  ↓
Task 2.7 (tests) — 可与 2.2-2.6 并行编写
  ↓
Task 2.8 (exports & build)
```

---

## 风险评估

| 风险                     | 概率 | 影响 | 缓解措施                      |
| ------------------------ | ---- | ---- | ----------------------------- |
| FHIR JSON 边界情况遗漏   | 中   | 中   | 使用官方 edge-cases.json 测试 |
| Choice type 注册表不完整 | 低   | 高   | 从 FHIR R4 规范自动生成       |
| 十进制精度丢失           | 高   | 低   | Stage-1 接受限制，文档记录    |
| 真实 SD JSON 解析失败    | 中   | 高   | 优先用真实数据测试，逐步修复  |
| Round-trip 不完全保真    | 中   | 中   | 接受语义等价而非字节等价      |

---

## 与 Stage-1 Roadmap 原始计划的差异

原始 Roadmap 中 Phase 2 的描述较为简略（3 个 task），本详细计划扩展为 8 个 task，主要增加了：

1. **结构化错误类型** (Task 2.1) — 原计划未明确
2. **原始类型 \_element 合并** (Task 2.3) — 原计划仅提到 "normalization"
3. **Choice type 解析** (Task 2.4) — 原计划未提及，但 ADR-003 明确要求
4. **序列化** (Task 2.6) — 原计划未提及，但 round-trip 保真需要
5. **更详细的测试分层** (Task 2.7) — 原计划 20+ 测试扩展到 40+

这些增加是基于 FHIR R4 JSON 规范的深入分析和 Phase 1 实施经验。
