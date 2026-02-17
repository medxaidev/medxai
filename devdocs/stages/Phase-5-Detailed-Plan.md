# Phase 5: fhir-validator — Detailed Implementation Plan

## Status

**Phase:** 5 (fhir-validator)  
**Status:** Planning → Ready for Implementation  
**Estimated Duration:** 7-9 days  
**Complexity:** Medium  
**Risk:** Low-Medium  
**Created:** 2026-02-16  
**Dependencies:** Phase 1, 2, 3, 4 (all complete)

---

## Overview

Phase 5 implements **structural validation** of FHIR resource instances against profile snapshots generated in Phase 4.

### Scope

**In Scope (Structural Validation):**

- Cardinality enforcement (min/max)
- Type constraint checking
- Required element presence validation
- Fixed/pattern value validation
- Slicing validation (discriminator-based matching)
- Choice type validation
- Reference target profile validation (metadata only)

**Out of Scope (Deferred to Phase 6):**

- FHIRPath invariants (`constraint.expression`)
- Terminology binding expansion/validation
- Cross-resource reference resolution
- CodeSystem/ValueSet lookup
- Full semantic validation

### Key Design Principles

1. **Snapshot-driven**: Validation logic operates on flattened snapshots (not differentials)
2. **Path-based traversal**: Navigate resource instances using element paths
3. **Issue accumulation**: Collect all issues (not fail-fast) for better UX
4. **Pluggable architecture**: Prepare extension points for FHIRPath (Phase 6)
5. **Clear error messages**: Include path, expected vs actual, and remediation hints

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      StructureValidator                         │
│  - validate(resource, profileUrl): ValidationResult             │
│  - validateElement(element, values, context): Issue[]           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                ┌─────────────▼──────────┐      ┌──────────────▼─────────┐
                │   PathExtractor        │      │   ValidationRules      │
                │  - extract(resource,   │      │  - cardinality         │
                │    path): any[]        │      │  - type                │
                │  - handles arrays,     │      │  - fixed/pattern       │
                │    choice types,       │      │  - slicing             │
                │    nested objects      │      │  - reference           │
                └────────────────────────┘      └────────────────────────┘
```

---

## Task Breakdown

### Task 5.1: Core Interfaces & Error Types (Day 1, ~1 day) ✅ Completed

#### 文件: `validator/types.ts` + `validator/errors.ts` + `validator/index.ts`

定义验证器的核心接口、结果类型和错误层次结构。

#### Implementation Notes

**已创建文件：**

1. **`validator/types.ts`** (~340 lines, 7 sections)
   - Section 1: `ValidationOptions` — 5 optional fields (profileUrl, validateSlicing, validateFixed, maxDepth, failFast)
   - Section 2: `ValidationResult` — valid, resource, profileUrl, profile (CanonicalProfile), issues
   - Section 3: `ValidationIssue` — severity, code, message, path?, expression?, diagnostics?
   - Section 4: `ValidationIssueCode` — 16 codes across 8 categories (cardinality, type, required, fixed/pattern, slicing, reference, profile, internal)
   - Section 5: `ValidationContext` — internal state for traversal (profile, issues, options, depth)
   - Section 6: Helpers — `createValidationIssue`, `createValidationContext`, `resolveValidationOptions`
   - Section 7: Filters — `hasValidationErrors`, `filterIssuesBySeverity`, `filterIssuesByCode`

2. **`validator/errors.ts`** (~120 lines, 3 error classes)
   - `ValidatorError` — base error with `Object.setPrototypeOf` for correct `instanceof`
   - `ProfileNotFoundError` — stores `profileUrl`, optional `cause`
   - `ValidationFailedError` — stores `issues[]`, for failFast mode

3. **`validator/index.ts`** (~40 lines, 3 export groups)
   - 5 type exports + 6 helper function exports + 3 error class exports

4. **`validator/__tests__/types.test.ts`** (~330 lines, **28 tests**)
   - createValidationIssue: 7 tests
   - createValidationContext: 5 tests
   - resolveValidationOptions: 4 tests
   - hasValidationErrors: 6 tests
   - filterIssuesBySeverity: 5 tests
   - filterIssuesByCode: 4 tests
   - ValidationIssueCode exhaustiveness: 1 test (16 codes)
   - Interface type checks: 4 tests

5. **`validator/__tests__/errors.test.ts`** (~230 lines, **34 tests**)
   - ValidatorError: 6 tests
   - ProfileNotFoundError: 6 tests
   - ValidationFailedError: 8 tests
   - Error hierarchy instanceof: 4 tests
   - Barrel exports: 2 tests

**Key design decisions:**

- `ValidationResult.profile` includes the resolved `CanonicalProfile` (not just URL) for downstream use
- 16 issue codes cover all structural validation scenarios + `INVARIANT_NOT_EVALUATED` placeholder for Phase 6
- `ValidationContext` is `@internal` — used by validation rules, not exposed to consumers
- Error classes use `Object.setPrototypeOf(this, new.target.prototype)` for correct `instanceof` after transpilation (same pattern as Phase 4)

#### 验收标准

- [x] `types.ts` 定义完整（ValidationOptions, ValidationResult, ValidationIssue, ValidationIssueCode, ValidationContext + 6 helpers）
- [x] `errors.ts` 定义完整（ValidatorError, ProfileNotFoundError, ValidationFailedError）
- [x] `index.ts` barrel exports 完整（5 types + 6 helpers + 3 errors）
- [x] 所有类型有 TSDoc 注释
- [x] `tsc --noEmit` 零错误
- [x] 62 tests 全部通过（28 types + 34 errors）
- [x] 1252/1252 测试通过（1190 原有 + 62 新增），零回归

---

### Task 5.2: Path Extractor (Day 2, ~1 day) ✅ Completed

#### 文件: `validator/path-extractor.ts`

实现从 resource 实例中按 element path 提取值的逻辑。

#### Implementation Notes

**已创建文件：**

1. **`validator/path-extractor.ts`** (~370 lines, 6 sections)
   - Section 1: `CHOICE_TYPE_SUFFIXES` — 43 known FHIR type suffixes (primitive + complex)
   - Section 2: `extractValues(resource, path)` — recursive path extraction with array expansion
   - Section 3: `pathExists(resource, path)` — property existence check (distinct from value extraction)
   - Section 4: `findChoiceTypeField(obj, baseName)` — locate concrete choice type property
   - Section 5: `normalizeChoicePath(basePath, concreteField)` — replace `[x]` with concrete suffix
   - Section 6: `extractChoiceTypeSuffix(concreteField, baseName)` — extract type name from property

2. **`validator/__tests__/path-extractor.test.ts`** (~620 lines, **108 tests**)
   - extractValues unit tests: 30 tests (scalar, array, missing, empty, choice type, deep nesting, edge cases, extension value[x])
   - pathExists unit tests: 10 tests
   - findChoiceTypeField unit tests: 9 tests
   - normalizeChoicePath unit tests: 6 tests
   - extractChoiceTypeSuffix unit tests: 7 tests
   - Fixture 01 (simple-patient): 11 tests
   - Fixture 02 (choice-types): 5 tests
   - Fixture 03 (deep-nesting): 7 tests
   - Fixture 04 (edge-cases): 11 tests
   - Fixture 05 (extensions-and-references): 7 tests
   - pathExists fixture-driven: 5 tests + 3 choice type tests

3. **5 JSON fixtures** (`validator/__tests__/fixtures/path-extractor/`)
   - `01-simple-patient.json` — scalar fields, arrays, nested paths, missing paths
   - `02-choice-types.json` — value[x], effective[x], component.value[x]
   - `03-deep-nesting.json` — contact.name.family, contact.address.line (4-level deep)
   - `04-edge-cases.json` — empty arrays, null values, primitives-only, deeply empty objects
   - `05-extensions-and-references.json` — extension.value[x] (3 different types), references

**Key design decisions:**

- `extractValues` returns `[null]` for properties that exist with value `null` (not `[]`)
- Array expansion is automatic at every level — `Patient.name.given` flattens all `given` arrays
- Choice type resolution uses known suffixes first (fast path), then fallback key scan
- `pathExists` is distinct from `extractValues(…).length > 0` — empty arrays still "exist"

**Bug fix during development:**

- Initial `extractFromNode` filtered out `null` values at the top of recursion. Fixed by moving the null check after the "all segments consumed" check, so `null` is returned as a valid leaf value.

#### 验收标准

- [x] `extractValues` 实现完整（含数组展开、choice type、深度嵌套）
- [x] `pathExists` 实现完整（含 choice type 支持）
- [x] `normalizeChoicePath` 实现完整
- [x] `findChoiceTypeField` 实现完整（known suffixes + fallback scan）
- [x] `extractChoiceTypeSuffix` 实现完整
- [x] 108 测试用例全部通过（远超 ≥20 要求）
- [x] 处理所有边界情况（undefined/null/空数组/空对象）
- [x] 支持任意深度嵌套（4+ levels tested）
- [x] Choice type 正确处理（value[x], effective[x], extension.value[x]）
- [x] 5 个 JSON 专项 fixtures 全部通过
- [x] 1360/1360 测试通过（1252 原有 + 108 新增），零回归

---

### Task 5.3: Validation Rules — Cardinality & Type (Day 3-4, ~2 days) ✅ Completed

#### 文件: `validator/validation-rules.ts`

实现核心验证规则：cardinality 和 type checking。

#### Implementation Notes

**已创建文件：**

1. **`validator/validation-rules.ts`** (~340 lines, 5 sections)
   - Section 1: `validateCardinality(element, values, issues)` — min/max cardinality checks
   - Section 2: `validateRequired(element, exists, issues)` — required element presence check
   - Section 3: `inferFhirType(value)` — heuristic FHIR type inference (15+ complex types: Coding, CodeableConcept, Quantity, Reference, Period, Ratio, HumanName, Address, Identifier, Attachment, Extension, Meta, Narrative, BackboneElement)
   - Section 4: `validateType(element, value, issues)` — type constraint validation with `isTypeCompatible` (handles string-like primitives, integer variants, Quantity sub-types, BackboneElement fallback)
   - Section 5: `validateChoiceType(element, suffix, issues)` — choice type suffix validation

2. **`validator/__tests__/validation-rules.test.ts`** (~680 lines, **122 tests**)
   - validateCardinality unit tests: 15 tests (valid, min violation, max violation, prohibited, message content)
   - validateRequired unit tests: 5 tests
   - inferFhirType unit tests: 30 tests (primitives + 15 complex types + null/array)
   - validateType unit tests: 22 tests (valid matches, mismatches, special cases, choice types, BackboneElement)
   - validateChoiceType unit tests: 7 tests
   - Fixture cardinality tests: 10 tests (6 fixture files)
   - Fixture type tests: 32 tests (6 fixture files)
   - Barrel exports: 1 test

3. **6 Cardinality JSON fixtures** (`fixtures/validation-rules/cardinality/`)
   - `01-optional-absent.json` — min=0, max=1, count=0 → valid
   - `02-required-missing.json` — min=1, max=\*, count=0 → CARDINALITY_MIN_VIOLATION
   - `03-max-exceeded.json` — min=0, max=1, count=2 → CARDINALITY_MAX_VIOLATION
   - `04-range-valid.json` — min=2, max=5, count=3 → valid
   - `05-range-both-violations.json` — 2 scenarios: below min + above max
   - `06-unbounded-max.json` — 4 scenarios: 0/1/5/100 values with unbounded max

4. **6 Type JSON fixtures** (`fixtures/validation-rules/type/`)
   - `01-primitive-types.json` — 5 scenarios: string, boolean, integer, decimal, integer→decimal
   - `02-type-mismatches.json` — 5 scenarios: number→string, string→boolean, decimal→integer, boolean→integer, string→CodeableConcept
   - `03-complex-types.json` — 6 scenarios: Coding, CodeableConcept, Quantity, Reference, HumanName, Period
   - `04-choice-types.json` — 5 scenarios: multi-type matches and mismatches
   - `05-backbone-and-special.json` — 5 scenarios: backbone, null, Identifier, Address, Extension
   - `06-choice-type-suffix.json` — 5 scenarios: allowed/disallowed suffixes

**Key design decisions:**

- `inferFhirType` uses shape-based heuristics (15+ complex types) — inherently imperfect but sufficient for structural validation
- `isTypeCompatible` handles FHIR type hierarchy: string-like primitives, integer variants, Quantity sub-types, BackboneElement fallback
- `validateType` skips null/undefined (handled by cardinality) and empty type arrays (backbone elements)
- `validateChoiceType` uses case-insensitive comparison for suffix matching
- Error messages include both expected and actual types with diagnostics

#### 验收标准

- [x] `validateCardinality` 实现完整（min/max/unbounded/prohibited）
- [x] `validateRequired` 实现完整
- [x] `validateType` 实现完整（含 type hierarchy 兼容性）
- [x] `validateChoiceType` 实现完整
- [x] `inferFhirType` 实现完整（支持 15+ FHIR 类型）
- [x] 122 测试用例全部通过（远超 ≥30 要求）
- [x] 错误消息清晰（包含 expected vs actual + diagnostics）
- [x] 支持 choice type 验证
- [x] 12 个 JSON 专项 fixtures 全部通过（6 cardinality + 6 type）
- [x] 1482/1482 测试通过（1360 原有 + 122 新增），零回归

---

### Task 5.4: Validation Rules — Fixed/Pattern & Reference (Day 5, ~1 day) ✅ Completed

#### 文件: `validator/validation-rules.ts` (continued)

实现 fixed/pattern value 和 reference target profile 验证。

#### Implementation Notes

**Model 变更：**

- 在 `CanonicalElement` 中新增 `fixed?: unknown` 和 `pattern?: unknown` 两个可选字段
- 使用 `unknown` 类型因为 fixed/pattern 值可以是任何 FHIR 类型（primitive 或 complex）

**已添加到 `validator/validation-rules.ts` 的新函数（Sections 6-9）：**

1. **`deepEqual(a, b)`** — 递归深度相等比较，处理 primitives、null、arrays（顺序敏感）、plain objects
2. **`validateFixed(element, value, issues)`** — fixed 值精确匹配验证（使用 deepEqual）
3. **`matchesPattern(value, pattern)`** — 递归部分匹配（pattern 是 value 的子集）
   - 对象：pattern 的所有字段必须存在于 value 中且值匹配
   - 数组：pattern 中每个元素必须在 value 数组中找到匹配
   - 原始类型：精确匹配
4. **`validatePattern(element, value, issues)`** — pattern 值部分匹配验证
5. **`extractReferenceType(reference)`** — 从 FHIR reference 字符串提取资源类型
   - 支持相对引用 (`Patient/123`)、绝对 URL、URN、fragment
6. **`validateReference(element, value, issues)`** — reference target profile 验证

**测试文件：`validator/__tests__/validation-rules-fixed-pattern.test.ts`** (~700 lines, **114 tests**)

- deepEqual unit tests: 22 tests
- validateFixed unit tests: 14 tests
- matchesPattern unit tests: 16 tests
- validatePattern unit tests: 6 tests
- extractReferenceType unit tests: 10 tests
- validateReference unit tests: 11 tests
- Fixture fixed tests: 8 tests (6 fixture files)
- Fixture pattern tests: 13 tests (6 fixture files)
- Fixture reference tests: 13 tests (5 fixture files)
- Barrel exports: 1 test

**17 个 JSON 专项 fixtures：**

- **6 Fixed fixtures** (`fixtures/validation-rules/fixed/`)
  - `01-fixed-string-match.json` — 字符串精确匹配
  - `02-fixed-string-mismatch.json` — 字符串不匹配
  - `03-fixed-coding-match.json` — CodeableConcept 精确匹配
  - `04-fixed-coding-mismatch.json` — CodeableConcept 不匹配
  - `05-fixed-quantity.json` — 3 scenarios: 精确匹配/值不同/多余字段
  - `06-fixed-no-constraint.json` — 无 fixed 约束

- **6 Pattern fixtures** (`fixtures/validation-rules/pattern/`)
  - `01-pattern-subset-match.json` — 子集匹配（value 有额外字段）
  - `02-pattern-system-mismatch.json` — system 不匹配
  - `03-pattern-primitive.json` — 5 scenarios: string/boolean/number 匹配和不匹配
  - `04-pattern-nested.json` — 3 scenarios: 嵌套对象匹配
  - `05-pattern-no-constraint.json` — 无 pattern 约束
  - `06-pattern-missing-field.json` — value 缺少 pattern 要求的字段

- **5 Reference fixtures** (`fixtures/validation-rules/reference/`)
  - `01-reference-valid-target.json` — 正确的 target profile
  - `02-reference-wrong-target.json` — 错误的 target type
  - `03-reference-no-constraint.json` — 无 targetProfile 约束
  - `04-reference-urn-warning.json` — URN 引用产生 warning
  - `05-reference-multiple-targets.json` — 5 scenarios: 多 target profiles + absolute URL + fragment

**Key design decisions:**

- `deepEqual` 自实现（不依赖 lodash），仅处理 FHIR JSON 相关类型
- `matchesPattern` 对数组使用"每个 pattern 元素必须在 value 中找到匹配"语义
- `validateFixed`/`validatePattern` 跳过 null/undefined 值（由 cardinality 处理）
- `validateReference` 对 URN/fragment 引用产生 warning 而非 error
- 错误消息包含 diagnostics（Expected/Actual 或 Pattern/Actual）

#### 验收标准

- [x] `validateFixed` 实现完整（支持 primitive + complex 类型精确匹配）
- [x] `validatePattern` 实现完整（支持 partial match + 嵌套对象 + 数组）
- [x] `validateReference` 实现完整（支持相对/绝对/URN/fragment 引用）
- [x] `matchesPattern` 正确处理嵌套对象和数组
- [x] `deepEqual` 自实现（递归比较 primitives/arrays/objects）
- [x] `extractReferenceType` 实现完整
- [x] `CanonicalElement` 新增 `fixed?` 和 `pattern?` 字段
- [x] 114 测试用例全部通过（远超 ≥20 要求）
- [x] 17 个 JSON 专项 fixtures 全部通过（6 fixed + 6 pattern + 5 reference）
- [x] 1596/1596 测试通过（1482 原有 + 114 新增），零回归

---

### Task 5.5: Slicing Validation (Day 6, ~1 day) ✅ Completed

#### 文件: `validator/slicing-validator.ts`

实现 slicing 验证逻辑。

#### Implementation Notes

**Model 变更：**

- 在 `CanonicalElement` 中新增 `sliceName?: string` 可选字段
- 对应 `ElementDefinition.sliceName`，用于标识命名切片

**新文件 `validator/slicing-validator.ts`（7 个 sections，7 个导出函数）：**

1. **`extractValueAtPath(value, path)`** — 轻量级路径提取器，用于 discriminator 评估
   - 支持 `$this`、点分隔路径、数组自动选择第一个元素、`resolve()` 剥离
2. **`getSliceDiscriminatorValue(slice, path)`** — 从 slice 的 fixed/pattern 约束中获取期望值
   - fixed 优先于 pattern
3. **`getSliceTypes(slice, path)`** — 从 slice 的 types 数组获取期望类型代码
4. **`matchesDiscriminator(value, slice, discriminator)`** — 检查单个 discriminator 匹配
   - 支持 5 种 discriminator type: value、pattern、type、exists、profile（placeholder）
5. **`findMatchingSlice(value, slices, discriminators)`** — 遍历 slices 找到匹配的命名切片
   - 所有 discriminators 必须全部匹配
6. **`isSliceOrderValid(values, slices, discriminators)`** — 验证有序切片约束
   - 跟踪最高切片索引，确保值按定义顺序出现
7. **`validateSlicing(slicingRoot, sliceElements, values, issues)`** — 主编排函数
   - Step 1: 匹配每个值到切片
   - Step 2: 验证每个切片的基数（复用 validateCardinality）
   - Step 3: 检查 slicing rules（closed → 不允许未匹配值；openAtEnd → 未匹配值必须在末尾）
   - Step 4: 检查有序约束

**测试文件：`validator/__tests__/slicing-validator.test.ts`** — **76 tests**

- extractValueAtPath: 9 tests
- getSliceDiscriminatorValue: 5 tests
- getSliceTypes: 2 tests
- matchesDiscriminator: 11 tests
- findMatchingSlice: 5 tests
- isSliceOrderValid: 5 tests
- validateSlicing unit: 6 tests
- Fixture discriminator: 16 tests (6 fixture files)
- Fixture rules: 12 tests (5 fixture files)
- Fixture order: 5 tests (5 fixture files)
- Barrel exports: 1 test

**16 个 JSON 专项 fixtures：**

- **6 Discriminator fixtures** (`fixtures/slicing/discriminator/`)
  - `01-value-discriminator-system.json` — identifier.system 值匹配（3 scenarios）
  - `02-value-discriminator-url.json` — extension url 值匹配（2 scenarios）
  - `03-type-discriminator.json` — value[x] 类型匹配（3 scenarios）
  - `04-exists-discriminator.json` — 字段存在性匹配（3 scenarios）
  - `05-multiple-discriminators.json` — 多 discriminator（system+code）（3 scenarios）
  - `06-pattern-discriminator.json` — pattern 子集匹配（2 scenarios）

- **5 Rules fixtures** (`fixtures/slicing/rules/`)
  - `01-closed-unmatched.json` — closed 不允许未匹配值（3 scenarios）
  - `02-open-unmatched.json` — open 允许未匹配值（3 scenarios）
  - `03-openAtEnd-valid.json` — openAtEnd 未匹配值必须在末尾（3 scenarios）
  - `04-closed-empty.json` — closed 空值无违规
  - `05-no-slicing-definition.json` — 无 slicing 定义时 validateSlicing 是 no-op

- **5 Order fixtures** (`fixtures/slicing/order/`)
  - `01-ordered-correct.json` — 正确顺序
  - `02-ordered-wrong.json` — 错误顺序 → SLICING_ORDER_VIOLATION
  - `03-ordered-single-slice.json` — 单值始终有效
  - `04-unordered-any-order.json` — 无序切片任何顺序有效
  - `05-slice-cardinality-max.json` — 切片基数上限超出

**Key design decisions:**

- `extractValueAtPath` 是轻量级实现，与 path-extractor.ts 的 `extractValues` 互补
- `matchesDiscriminator` 的 `profile` 类型返回 `true`（placeholder），完整实现需要 context 解析
- `validateSlicing` 复用 `validateCardinality` 进行切片基数检查
- `openAtEnd` 规则通过跟踪未匹配值索引和最后匹配值索引实现
- 错误消息包含 diagnostics 字段

#### 验收标准

- [x] `validateSlicing` 实现完整（4 步骤：匹配、基数、规则、排序）
- [x] `findMatchingSlice` 支持 5 种 discriminator type (value/pattern/type/exists/profile)
- [x] `matchesDiscriminator` 正确处理所有 type（含 unknown → false）
- [x] 支持 closed/open/openAtEnd slicing rules
- [x] 支持 ordered slicing 检查
- [x] `CanonicalElement` 新增 `sliceName?` 字段
- [x] 76 测试用例全部通过（远超 ≥15 要求）
- [x] 16 个 JSON 专项 fixtures 全部通过（6 discriminator + 5 rules + 5 order）
- [x] 1672/1672 测试通过（1596 原有 + 76 新增），零回归

---

### Task 5.6: StructureValidator (Orchestrator) (Day 7, ~1 day) ✅ Completed

#### 文件: `validator/structure-validator.ts`

实现主验证器类，协调所有验证规则。

#### Implementation Notes

**新文件 `validator/structure-validator.ts`：**

`StructureValidator` 类 — 主验证器，协调所有 Task 5.2-5.5 的验证规则。

**设计决策（与计划的差异）：**

- **同步 API**：`validate(resource, profile, options?)` 是同步方法，直接接受 `CanonicalProfile`
  - 计划中的 `async validate(resource, profileUrl?)` 依赖 FhirContext 异步加载
  - 实际实现将 profile 解析与验证解耦，FhirContext 集成留给 Task 5.7 的集成层
  - 这使得 StructureValidator 可以独立于 FhirContext 使用
- **per-call options override**：`validate()` 接受可选的 per-call options，覆盖构造函数 options
- **maxDepth 使用 `>=` 而非 `>`**：确保 `maxDepth=0` 正确跳过元素遍历

**验证流程（4 步）：**

1. **Resource type check** — 检查 `resource.resourceType` 是否匹配 `profile.type`
2. **Element traversal** — 遍历 profile 中所有非根、非切片元素
3. **Per-element validation** — 对每个元素执行：
   - 基数验证（validateCardinality）
   - 类型验证（validateType）
   - Fixed/Pattern 验证（validateFixed, validatePattern）— 受 `validateFixed` 选项控制
   - Reference 验证（validateReference）— 仅对 Reference 类型元素
   - Slicing 验证（validateSlicing）— 受 `validateSlicing` 选项控制
4. **failFast check** — 每步后检查是否需要提前终止

**测试文件：`validator/__tests__/structure-validator.test.ts`** — **38 tests**

- Constructor: 2 tests
- Basic validate: 7 tests (ProfileNotFoundError, valid, type mismatch, cardinality, profileUrl)
- Options: 7 tests (failFast, validateFixed, validateSlicing, per-call override, maxDepth)
- Advanced: 4 tests (fixed, pattern, reference, warnings)
- Fixture basic: 6 tests (6 fixture files)
- Fixture advanced: 6 tests (6 fixture files)
- Fixture options: 5 tests (5 fixture files)
- Barrel exports: 1 test

**17 个 JSON 专项 fixtures：**

- **6 Basic fixtures** (`fixtures/structure-validator/basic/`)
  - `01-valid-patient.json` — 有效最小 Patient
  - `02-missing-required.json` — 缺少必填字段 → CARDINALITY_MIN_VIOLATION
  - `03-wrong-resourcetype.json` — resourceType 不匹配 → RESOURCE_TYPE_MISMATCH
  - `04-cardinality-max-violation.json` — 基数上限超出 → CARDINALITY_MAX_VIOLATION
  - `05-multiple-errors.json` — 多个错误同时存在
  - `06-valid-observation.json` — 有效 Observation

- **6 Advanced fixtures** (`fixtures/structure-validator/advanced/`)
  - `01-fixed-value-mismatch.json` — fixed 值不匹配
  - `02-pattern-value-mismatch.json` — pattern 值不匹配
  - `03-reference-target-mismatch.json` — reference target 不匹配
  - `04-slicing-closed-violation.json` — closed slicing 违规
  - `05-valid-with-all-rules.json` — 所有规则类型都通过
  - `06-fixed-pattern-combined.json` — fixed + pattern 组合验证

- **5 Options fixtures** (`fixtures/structure-validator/options/`)
  - `01-failfast-throws.json` — failFast 模式抛出异常
  - `02-skip-fixed-validation.json` — validateFixed=false 跳过 fixed 检查
  - `03-skip-slicing-validation.json` — validateSlicing=false 跳过 slicing 检查
  - `04-no-profile-throws.json` — 无 profile → ProfileNotFoundError
  - `05-warnings-still-valid.json` — 仅 warning 不影响 valid 状态

#### 验收标准

- [x] `StructureValidator` 类实现完整（同步 API，接受 CanonicalProfile）
- [x] `validate()` 方法协调所有验证规则（cardinality, type, fixed, pattern, reference, slicing）
- [x] 支持 ValidationOptions 配置（构造函数 + per-call override）
- [x] 正确处理 profileUrl（options.profileUrl > profile.url）
- [x] 集成所有 Task 5.2-5.5 的验证规则
- [x] 38 测试用例全部通过（远超 ≥20 要求）
- [x] 17 个 JSON 专项 fixtures 全部通过（6 basic + 6 advanced + 5 options）
- [x] failFast 模式正确工作（抛出 ValidationFailedError，包含 issues）
- [x] maxDepth 正确工作（depth >= maxDepth 时产生 warning）
- [x] 错误消息清晰且可操作（包含 diagnostics）
- [x] 1710/1710 测试通过（1672 原有 + 38 新增），零回归

---

### Task 5.7: Integration Tests & Fixtures (Day 8-9, ~2 days) ✅ Completed

#### 文件: `validator/__tests__/integration.test.ts` + fixtures

使用 StructureValidator 进行端到端集成测试。

#### Implementation Notes

**测试文件：`validator/__tests__/integration.test.ts`** — **35 tests**

7 个 describe 块：

1. **Base Resources** (5 tests) — valid Patient/Observation/Condition, invalid Patient/Observation
2. **Custom Profiles** (5 tests) — ChinesePatient valid/invalid, fixed status, pattern category match/mismatch
3. **Slicing** (5 tests) — valid identifier slicing, missing required slice, closed unmatched, open unmatched ok, ordered wrong order
4. **Choice Type & Reference** (5 tests) — valid ref, wrong target, multi-target, URN warning, no constraint
5. **Complex Scenarios** (5 tests) — multiple issues, resourceType mismatch, empty resource, large resource perf, failFast
6. **Issue Code Coverage** (7 tests) — 验证 7 种 ValidationIssueCode 都能被正确产生
7. **Error Message Quality** (3 tests) — path 信息、human-readable message、profileUrl 填充

**25 个 JSON 专项 fixtures：**

- **5 Base Resource fixtures** (`fixtures/integration/01-base-resources/`)
  - `01-valid-patient.json` — 有效 Patient（所有常见字段）
  - `02-valid-observation.json` — 有效 Observation（status + code）
  - `03-invalid-patient-missing-name.json` — 缺少必填 name
  - `04-invalid-observation-missing-status.json` — 缺少必填 status
  - `05-valid-condition.json` — 有效 Condition（含 Reference）

- **5 Custom Profile fixtures** (`fixtures/integration/02-custom-profiles/`)
  - `01-chinese-patient-valid.json` — 有效 ChinesePatient（中国身份证号）
  - `02-chinese-patient-missing-identifier.json` — 缺少必填 identifier
  - `03-profile-fixed-status.json` — fixed status 不匹配
  - `04-profile-pattern-category.json` — pattern category 匹配
  - `05-profile-pattern-mismatch.json` — pattern category 不匹配

- **5 Slicing fixtures** (`fixtures/integration/03-slicing/`)
  - `01-valid-identifier-slicing.json` — MRN + SSN closed slicing 满足
  - `02-missing-required-slice.json` — 缺少必填 MRN slice
  - `03-closed-unmatched.json` — closed slicing 未匹配值
  - `04-open-slicing-unmatched-ok.json` — open slicing 允许额外值
  - `05-ordered-slicing-wrong-order.json` — 有序 slicing 顺序错误

- **5 Choice Type & Reference fixtures** (`fixtures/integration/04-choice-ref/`)
  - `01-valid-reference-patient.json` — 有效 Patient 引用
  - `02-invalid-reference-wrong-type.json` — 引用类型不匹配
  - `03-reference-multiple-targets.json` — 多目标引用（Practitioner 匹配）
  - `04-urn-reference-warning.json` — URN 引用产生 warning
  - `05-reference-no-constraint.json` — 无 targetProfile 约束

- **5 Complex fixtures** (`fixtures/integration/05-complex/`)
  - `01-multiple-issues.json` — 3+ 错误累积
  - `02-resourcetype-mismatch.json` — resourceType 不匹配
  - `03-empty-resource.json` — 空资源缺少所有必填字段
  - `04-large-resource.json` — 大资源性能测试（<100ms）
  - `05-failfast-stops-early.json` — failFast 模式提前终止

**Issue Code 覆盖：**

- ✅ CARDINALITY_MIN_VIOLATION
- ✅ FIXED_VALUE_MISMATCH
- ✅ PATTERN_VALUE_MISMATCH
- ✅ REFERENCE_TARGET_MISMATCH
- ✅ SLICING_NO_MATCH
- ✅ SLICING_ORDER_VIOLATION
- ✅ RESOURCE_TYPE_MISMATCH

#### 验收标准

- [x] 35 集成测试用例全部通过（远超 ≥25 要求）
- [x] 使用 StructureValidator 端到端验证（CanonicalProfile fixtures）
- [x] 测试覆盖 7 种 ValidationIssueCode
- [x] 测试覆盖所有 ValidationOptions（failFast, validateFixed, validateSlicing）
- [x] 25 个 JSON fixtures（5 categories × 5 fixtures）
- [x] 所有错误消息清晰且包含 path
- [x] 性能测试：大资源验证 <100ms（实测 <10ms）
- [x] 1745/1745 测试通过（1710 原有 + 35 新增），零回归

---

## 实现顺序与依赖关系

```
Task 5.1 (types/errors)
  ↓
Task 5.2 (path-extractor) ←── 独立，可与 5.1 并行
  ↓
Task 5.3 (cardinality + type) ←── 依赖 5.2
  ↓
Task 5.4 (fixed/pattern + reference) ←── 依赖 5.3
  ↓
Task 5.5 (slicing) ←── 依赖 5.2 + 5.3
  ↓
Task 5.6 (StructureValidator) ←── 依赖 5.2-5.5，编排器
  ↓
Task 5.7 (integration tests) ←── 依赖所有上游
```

### 建议的开发节奏

| 阶段           | Days    | Tasks | 重点                               |
| -------------- | ------- | ----- | ---------------------------------- |
| **基础层**     | Day 1   | 5.1   | 接口定义 + 错误类型                |
| **路径提取**   | Day 2   | 5.2   | Path extractor（核心工具）         |
| **核心规则 1** | Day 3-4 | 5.3   | Cardinality + Type（最常用）       |
| **核心规则 2** | Day 5   | 5.4   | Fixed/Pattern + Reference          |
| **Slicing**    | Day 6   | 5.5   | Slicing（第二复杂）                |
| **编排器**     | Day 7   | 5.6   | StructureValidator（集成所有规则） |
| **集成测试**   | Day 8-9 | 5.7   | End-to-end + fixtures              |

---

## Estimated Timeline

| Task                    | Duration | Dependencies |
| ----------------------- | -------- | ------------ |
| 5.1 Core Interfaces     | 1 day    | None         |
| 5.2 Path Extractor      | 1 day    | 5.1          |
| 5.3 Cardinality & Type  | 2 days   | 5.2          |
| 5.4 Fixed/Pattern & Ref | 1 day    | 5.3          |
| 5.5 Slicing Validation  | 1 day    | 5.2, 5.3     |
| 5.6 StructureValidator  | 1 day    | 5.2-5.5      |
| 5.7 Integration Tests   | 2 days   | All above    |

**Total: 7-9 days**（含缓冲；5.3 和 5.7 是关键路径）

---

## Dependencies & Risks

### Dependencies

| Dependency               | Status                | Impact if Delayed |
| ------------------------ | --------------------- | ----------------- |
| Phase 1 (fhir-model)     | ✅ Complete           | N/A               |
| Phase 2 (fhir-parser)    | ✅ Complete           | N/A               |
| Phase 3 (fhir-context)   | ✅ Complete           | N/A               |
| Phase 4 (fhir-profile)   | ✅ Complete           | N/A               |
| FHIR R4 Core Definitions | ✅ Complete (73 defs) | N/A               |

### Risks

| Risk                         | Probability | Impact | Mitigation                                 |
| ---------------------------- | ----------- | ------ | ------------------------------------------ |
| Path extraction 复杂度超预期 | Medium      | High   | 先实现简单路径，再加数组/choice type       |
| Slicing discriminator 边界多 | Medium      | Medium | 严格按 FHIR spec 实现；fixture-driven 开发 |
| Type inference 不准确        | Low         | Medium | 使用 heuristics + 明确的 type hints        |
| 性能问题（大资源）           | Low         | Low    | 先保证正确性；必要时加缓存/索引            |
| FHIRPath 需求蔓延            | Medium      | High   | 明确 Phase 5 不做 invariants；预留扩展点   |

### 风险缓解策略

1. **渐进式实现**: 先实现 cardinality/type（最常用），再加 fixed/pattern/slicing
2. **Fixture-driven 开发**: 每实现一个规则，立即用对应 fixture 验证
3. **频繁集成测试**: 每完成一个 Task 就运行全量测试，确保无回归
4. **明确边界**: Phase 5 不做 FHIRPath invariants，但预留 `InvariantValidator` 接口

---

## Success Metrics

| Metric                             | Target  | Actual                                                                                         |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Implementation files               | 5-7     | ✅ 6 (types, errors, path-extractor, validation-rules, slicing-validator, structure-validator) |
| Test files                         | 5-7     | ✅ 10 (6 unit + 1 fixture + 2 integration + 1 slicing)                                         |
| Total tests (Phase 5)              | 100-120 | ✅ 555 (远超目标)                                                                              |
| Validation rule coverage           | 100%    | ✅ 100% (cardinality, type, fixed, pattern, reference, slicing)                                |
| Base resource validation pass rate | 100%    | ✅ 100%                                                                                        |
| Build time                         | <5s     | ✅ ~3s                                                                                         |
| Test execution time                | <5s     | ✅ ~4s (全量 1745 tests)                                                                       |
| Validation time (simple resource)  | <10ms   | ✅ <2ms                                                                                        |
| Validation time (complex resource) | <50ms   | ✅ <10ms                                                                                       |
| Total tests (all phases)           | 1290+   | ✅ 1745                                                                                        |

---

## Phase 5 Completion Checklist

- [x] All 7 tasks completed (5.1-5.7)
- [x] All acceptance criteria met
- [x] ≥100 tests pass (unit + integration) — 555 Phase 5 tests, 1745 total
- [x] Zero TypeScript errors (`tsc --noEmit` clean)
- [x] Build succeeds (ESM + CJS + d.ts)
- [x] All tests pass (Phase 1 + 2 + 3 + 4 + 5) — 1745/1745
- [x] Documentation updated (Phase-5-Detailed-Plan.md)
- [ ] Code review completed
- [x] Phase-5-Detailed-Plan.md marked as complete

---

## Documentation Updates Required

After Phase 5 completion, update:

1. **`devdocs/architecture/MODULES.md`**
   - Mark `fhir-validator` as implemented
   - Update dependency graph

2. **`devdocs/architecture/DATAFLOW.md`**
   - Add validation flow diagram

3. **`devdocs/stages/Stage-1-Development-Roadmap.md`**
   - Mark Phase 5 as complete
   - Update overall progress

---

## Next Phase Preview: Phase 6 (FHIRPath + Invariants)

Phase 6 will implement **FHIRPath expression evaluation** and **invariant validation** (constraint.expression).

### Phase 6 Scope

- FHIRPath parser + AST
- FHIRPath evaluator (core functions: where, exists, all, resolve, etc.)
- Invariant validation (constraint.expression execution)
- Extension: custom FHIRPath functions
- Performance optimization (expression caching)

### Phase 6 Estimated Duration

**10-14 days** (High complexity)

### Phase 6 Dependencies

- ✅ Phase 1 (fhir-model)
- ✅ Phase 2 (fhir-parser)
- ✅ Phase 3 (fhir-context)
- ✅ Phase 4 (fhir-profile)
- ✅ Phase 5 (fhir-validator)

---

**Phase 5 Status:** ✅ COMPLETED (2026-02-17) — 7/7 tasks done, 555 Phase 5 tests, 1745 total tests, 92 JSON fixtures
