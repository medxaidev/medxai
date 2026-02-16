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

### Task 5.5: Slicing Validation (Day 6, ~1 day)

#### 文件: `validator/slicing-validator.ts`

实现 slicing 验证逻辑。

#### 核心功能

```typescript
/**
 * Validate slicing for an array element.
 */
export function validateSlicing(
  slicingRoot: CanonicalElement,
  sliceElements: CanonicalElement[],
  values: unknown[],
  issues: ValidationIssue[],
): void {
  if (!slicingRoot.slicing) return;

  const { discriminator, rules, ordered } = slicingRoot.slicing;

  // Match each value to a slice
  const sliceMatches = new Map<string, unknown[]>();
  const unmatchedValues: unknown[] = [];

  for (const value of values) {
    const matchedSlice = findMatchingSlice(value, sliceElements, discriminator);

    if (matchedSlice) {
      const sliceName = matchedSlice.sliceName!;
      if (!sliceMatches.has(sliceName)) {
        sliceMatches.set(sliceName, []);
      }
      sliceMatches.get(sliceName)!.push(value);
    } else {
      unmatchedValues.push(value);
    }
  }

  // Validate slice cardinality
  for (const slice of sliceElements) {
    if (!slice.sliceName) continue;
    const sliceValues = sliceMatches.get(slice.sliceName) || [];
    validateCardinality(slice, sliceValues, issues);
  }

  // Check slicing rules
  if (rules === "closed" && unmatchedValues.length > 0) {
    issues.push(
      createValidationIssue(
        "error",
        "SLICING_DISCRIMINATOR_MISMATCH",
        `Slicing at '${slicingRoot.path}' is closed, but ${unmatchedValues.length} value(s) do not match any slice`,
        { path: slicingRoot.path },
      ),
    );
  }

  // Check ordering
  if (ordered && !isSliceOrderValid(values, sliceElements, discriminator)) {
    issues.push(
      createValidationIssue(
        "error",
        "SLICING_DISCRIMINATOR_MISMATCH",
        `Slicing at '${slicingRoot.path}' requires ordered slices, but values are out of order`,
        { path: slicingRoot.path },
      ),
    );
  }
}

/**
 * Find which slice a value matches based on discriminators.
 */
export function findMatchingSlice(
  value: unknown,
  slices: CanonicalElement[],
  discriminators: SlicingDiscriminatorDef[],
): CanonicalElement | undefined {
  for (const slice of slices) {
    if (!slice.sliceName) continue;

    let allMatch = true;
    for (const disc of discriminators) {
      if (!matchesDiscriminator(value, slice, disc)) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) return slice;
  }

  return undefined;
}

/**
 * Check if a value matches a single discriminator.
 */
export function matchesDiscriminator(
  value: unknown,
  slice: CanonicalElement,
  discriminator: SlicingDiscriminatorDef,
): boolean {
  const { type, path } = discriminator;

  switch (type) {
    case "value": {
      // Extract value at discriminator path
      const actualValue = extractValueAtPath(value, path);
      const expectedValue = getSliceDiscriminatorValue(slice, path);
      return deepEqual(actualValue, expectedValue);
    }

    case "type": {
      const actualType = inferFhirType(extractValueAtPath(value, path));
      const expectedTypes = getSliceTypes(slice, path);
      return expectedTypes.includes(actualType);
    }

    case "profile": {
      // Check if value conforms to slice's profile constraint
      // (simplified: check meta.profile or type)
      return true; // Placeholder
    }

    case "exists": {
      const exists = pathExists(value as any, path);
      return exists; // Or !exists depending on slice definition
    }

    default:
      return false;
  }
}
```

#### 测试用例（≥15）

- Simple value discriminator (identifier.system)
- Type discriminator (value[x] → valueString vs valueQuantity)
- Multiple discriminators (system + code)
- Closed slicing with unmatched value → error
- Open slicing with unmatched value → valid
- Ordered slicing, correct order → valid
- Ordered slicing, wrong order → error
- Slice cardinality violation → error
- Extension slicing (discriminator = url)

#### 验收标准

- [ ] `validateSlicing` 实现完整
- [ ] `findMatchingSlice` 支持 4 种 discriminator type (value/type/profile/exists)
- [ ] `matchesDiscriminator` 正确处理所有 type
- [ ] 支持 closed/open/openAtEnd slicing rules
- [ ] 支持 ordered slicing 检查
- [ ] ≥15 测试用例全部通过

---

### Task 5.6: StructureValidator (Orchestrator) (Day 7, ~1 day)

#### 文件: `validator/structure-validator.ts`

实现主验证器类，协调所有验证规则。

#### 核心类

```typescript
/**
 * Main validator class for structural validation.
 */
export class StructureValidator {
  private readonly context: FhirContext;
  private readonly options: ValidationOptions;

  constructor(context: FhirContext, options?: ValidationOptions) {
    this.context = context;
    this.options = {
      validateSlicing: true,
      validateFixed: true,
      maxDepth: 50,
      failFast: false,
      ...options,
    };
  }

  /**
   * Validate a resource instance against a profile.
   */
  async validate(
    resource: Resource,
    profileUrl?: string,
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // 1. Determine profile URL
    const targetProfile = profileUrl || this.extractProfileFromMeta(resource);
    if (!targetProfile) {
      throw new ProfileNotFoundError("No profile specified");
    }

    // 2. Load profile snapshot
    const sd = await this.context.getStructureDefinition(targetProfile);
    if (!sd?.snapshot) {
      throw new ProfileNotFoundError(targetProfile);
    }

    // 3. Convert to CanonicalProfile
    const profile = buildCanonicalProfile(sd);

    // 4. Validate root element
    const rootElement = profile.elements.get(profile.type);
    if (!rootElement) {
      throw new ValidatorError(
        `Profile '${targetProfile}' has no root element`,
      );
    }

    // Check resource type matches
    if (resource.resourceType !== profile.type) {
      issues.push(
        createValidationIssue(
          "error",
          "RESOURCE_TYPE_MISMATCH",
          `Expected resourceType '${profile.type}', but found '${resource.resourceType}'`,
        ),
      );

      if (this.options.failFast) {
        throw new ValidationFailedError("Resource type mismatch", issues);
      }
    }

    // 5. Validate all elements
    this.validateElements(resource, profile, issues);

    // 6. Return result
    return {
      valid: !issues.some((i) => i.severity === "error"),
      resource,
      issues,
      profileUrl: targetProfile,
    };
  }

  /**
   * Validate all elements in the profile against the resource.
   */
  private validateElements(
    resource: Resource,
    profile: CanonicalProfile,
    issues: ValidationIssue[],
  ): void {
    for (const element of profile.elements.values()) {
      // Skip root element (already validated)
      if (element.path === profile.type) continue;

      // Extract values from resource
      const values = extractValues(resource, element.path);

      // Validate cardinality
      validateCardinality(element, values, issues);

      // Validate each value
      for (const value of values) {
        // Type validation
        validateType(element, value, issues);

        // Fixed/pattern validation
        if (this.options.validateFixed) {
          validateFixed(element, value, issues);
          validatePattern(element, value, issues);
        }

        // Reference validation
        if (element.types.some((t) => t.code === "Reference")) {
          validateReference(element, value, issues);
        }
      }

      // Slicing validation
      if (this.options.validateSlicing && element.slicing) {
        const sliceElements = this.getSliceElements(profile, element.path);
        validateSlicing(element, sliceElements, values, issues);
      }

      // Fail fast if requested
      if (this.options.failFast && issues.some((i) => i.severity === "error")) {
        throw new ValidationFailedError("Validation failed", issues);
      }
    }
  }

  /**
   * Get all slice elements for a slicing root.
   */
  private getSliceElements(
    profile: CanonicalProfile,
    slicingRootPath: string,
  ): CanonicalElement[] {
    const slices: CanonicalElement[] = [];

    for (const element of profile.elements.values()) {
      if (element.path === slicingRootPath && element.sliceName) {
        slices.push(element);
      }
    }

    return slices;
  }

  /**
   * Extract profile URL from resource.meta.profile.
   */
  private extractProfileFromMeta(resource: Resource): string | undefined {
    return resource.meta?.profile?.[0] as string | undefined;
  }
}
```

#### 测试用例（≥20）

- Valid Patient resource → valid
- Patient missing required field (name) → error
- Patient with invalid type (name as string) → error
- Patient with cardinality violation (max=1, count=2) → error
- Patient with fixed value mismatch → error
- Patient with pattern value mismatch → error
- Patient with invalid reference target → error
- Patient with valid slicing → valid
- Patient with invalid slicing (closed, unmatched) → error
- Observation with choice type (valueQuantity) → valid
- Observation with invalid choice type → error
- Resource with unknown profile → error
- Resource with mismatched resourceType → error
- Nested validation (Patient.contact.name)
- Deep nesting (max depth check)
- failFast mode → throws on first error
- Collect all issues mode → returns all issues

#### 验收标准

- [ ] `StructureValidator` 类实现完整
- [ ] `validate()` 方法协调所有验证规则
- [ ] 支持 ValidationOptions 配置
- [ ] 正确处理 profile URL (参数 vs meta.profile)
- [ ] 集成所有 Task 5.2-5.5 的验证规则
- [ ] ≥20 集成测试用例全部通过
- [ ] failFast 模式正确工作
- [ ] 错误消息清晰且可操作

---

### Task 5.7: Integration Tests & Fixtures (Day 8-9, ~2 days)

#### 文件: `validator/__tests__/integration.test.ts` + fixtures

使用真实 FHIR R4 core definitions 和自定义 profiles 进行端到端测试。

#### 测试分类

**1. Base Resource Validation (5 tests)**

- Valid Patient (all required fields) → valid
- Valid Observation (all required fields) → valid
- Invalid Patient (missing name) → error
- Invalid Observation (missing status) → error
- Invalid type (name as string instead of HumanName) → error

**2. Custom Profile Validation (5 tests)**

- Valid ChinesePatient (with identifier slicing) → valid
- Invalid ChinesePatient (missing required slice) → error
- Valid US Core Patient (with mustSupport) → valid
- Profile with fixed value constraint → valid/error
- Profile with pattern value constraint → valid/error

**3. Slicing Validation (5 tests)**

- Valid identifier slicing (MRN + SSN) → valid
- Invalid identifier slicing (missing discriminator) → error
- Valid extension slicing → valid
- Closed slicing with unmatched value → error
- Ordered slicing validation → valid/error

**4. Choice Type Validation (3 tests)**

- Valid Observation.valueQuantity → valid
- Valid Observation.valueString → valid
- Invalid Observation.valueBoolean (not in allowed types) → error

**5. Reference Validation (3 tests)**

- Valid reference to Patient → valid
- Invalid reference to wrong type → error
- Reference with targetProfile constraint → valid/error

**6. Complex Scenarios (4 tests)**

- Deeply nested validation (Patient.contact.name.family)
- Multiple issues accumulation (collect all errors)
- Large resource (100+ elements) performance
- Profile inheritance chain (3 levels)

#### Fixtures

创建 `__tests__/fixtures/validator/` 目录，包含：

- `01-base-resources/` — 5 个基础资源（valid + invalid）
- `02-custom-profiles/` — 5 个自定义 profile 实例
- `03-slicing/` — 5 个 slicing 场景
- `04-choice-types/` — 3 个 choice type 场景
- `05-references/` — 3 个 reference 场景
- `06-complex/` — 4 个复杂场景

#### 验收标准

- [ ] ≥25 集成测试用例全部通过
- [ ] 使用真实 FHIR R4 core definitions
- [ ] 测试覆盖所有 ValidationIssueCode
- [ ] 测试覆盖所有 ValidationOptions
- [ ] 25 个 JSON fixtures（valid + invalid pairs）
- [ ] 所有错误消息清晰且包含 path
- [ ] 性能测试：大资源验证 <100ms

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

| Metric                             | Target  | Actual |
| ---------------------------------- | ------- | ------ |
| Implementation files               | 5-7     | ⬜     |
| Test files                         | 5-7     | ⬜     |
| Total tests (Phase 5)              | 100-120 | ⬜     |
| Validation rule coverage           | 100%    | ⬜     |
| Base resource validation pass rate | 100%    | ⬜     |
| Build time                         | <5s     | ⬜     |
| Test execution time                | <5s     | ⬜     |
| Validation time (simple resource)  | <10ms   | ⬜     |
| Validation time (complex resource) | <50ms   | ⬜     |
| Total tests (all phases)           | 1290+   | ⬜     |

---

## Phase 5 Completion Checklist

- [ ] All 7 tasks completed (5.1-5.7)
- [ ] All acceptance criteria met
- [ ] ≥100 tests pass (unit + integration)
- [ ] Zero TypeScript errors (`tsc --noEmit` clean)
- [ ] Build succeeds (ESM + CJS + d.ts)
- [ ] All tests pass (Phase 1 + 2 + 3 + 4 + 5)
- [ ] Documentation updated (Phase-5-Detailed-Plan.md)
- [ ] Code review completed
- [ ] Phase-5-Detailed-Plan.md marked as complete

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
- ⬜ Phase 5 (fhir-validator) ← must complete first

---

**Phase 5 Status:** Planning → Ready for Implementation
