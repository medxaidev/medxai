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

### Task 5.2: Path Extractor (Day 2, ~1 day)

#### 文件: `validator/path-extractor.ts`

实现从 resource 实例中按 element path 提取值的逻辑。

#### 核心功能

```typescript
/**
 * Extract values from a resource instance using an element path.
 *
 * @example
 * extractValues(patient, 'Patient.name')
 * // → [{ family: 'Smith', given: ['John'] }, { family: 'Doe' }]
 *
 * extractValues(patient, 'Patient.name.family')
 * // → ['Smith', 'Doe']
 *
 * extractValues(observation, 'Observation.value[x]')
 * // → [{ valueQuantity: { value: 120, unit: 'mmHg' } }]
 */
export function extractValues(
  resource: Record<string, unknown>,
  path: string,
): unknown[];

/**
 * Check if a path exists in the resource (even if value is null/undefined).
 */
export function pathExists(
  resource: Record<string, unknown>,
  path: string,
): boolean;

/**
 * Normalize a choice type path for extraction.
 *
 * @example
 * normalizeChoicePath('Observation.value[x]', 'valueQuantity')
 * // → 'Observation.valueQuantity'
 */
export function normalizeChoicePath(
  basePath: string,
  concreteField: string,
): string;
```

#### 实现要点

1. **路径解析**: `'Patient.name.family'` → `['Patient', 'name', 'family']`
2. **数组展开**: 如果中间节点是数组，递归展开所有元素
3. **Choice type 处理**: `value[x]` 需要检查所有可能的具体字段（`valueString`, `valueQuantity` 等）
4. **嵌套对象**: 支持任意深度嵌套
5. **边界情况**: `undefined` / `null` / 空数组

#### 测试用例（≥20）

- 简单路径提取（`Patient.id`）
- 嵌套路径提取（`Patient.name.family`）
- 数组字段提取（`Patient.name` → 多个 HumanName）
- 数组中嵌套字段（`Patient.name.given` → 所有 given 展开）
- Choice type 提取（`Observation.value[x]` → 找到 `valueQuantity`）
- 不存在的路径（返回 `[]`）
- Root 路径（`Patient` → 整个 resource）
- 深度嵌套（`Patient.contact.name.family`）

#### 验收标准

- [ ] `extractValues` 实现完整
- [ ] `pathExists` 实现完整
- [ ] `normalizeChoicePath` 实现完整
- [ ] ≥20 测试用例全部通过
- [ ] 处理所有边界情况（undefined/null/空数组）
- [ ] 支持任意深度嵌套
- [ ] Choice type 正确处理

---

### Task 5.3: Validation Rules — Cardinality & Type (Day 3-4, ~2 days)

#### 文件: `validator/validation-rules.ts`

实现核心验证规则：cardinality 和 type checking。

#### 核心函数

```typescript
/**
 * Validate cardinality (min/max) for an element.
 */
export function validateCardinality(
  element: CanonicalElement,
  values: unknown[],
  issues: ValidationIssue[],
): void {
  const count = values.length;

  // Check min
  if (element.min > 0 && count < element.min) {
    issues.push(
      createValidationIssue(
        "error",
        "CARDINALITY_MIN_VIOLATION",
        `Element '${element.path}' requires at least ${element.min} value(s), but found ${count}`,
        { path: element.path },
      ),
    );
  }

  // Check max
  if (element.max !== "unbounded") {
    const maxNum = parseInt(element.max, 10);
    if (count > maxNum) {
      issues.push(
        createValidationIssue(
          "error",
          "CARDINALITY_MAX_VIOLATION",
          `Element '${element.path}' allows at most ${element.max} value(s), but found ${count}`,
          { path: element.path },
        ),
      );
    }
  }
}

/**
 * Validate type constraints for an element.
 */
export function validateType(
  element: CanonicalElement,
  value: unknown,
  issues: ValidationIssue[],
): void {
  if (element.types.length === 0) return; // No type constraint

  const actualType = inferFhirType(value);
  const allowedTypes = element.types.map((t) => t.code);

  if (!allowedTypes.includes(actualType)) {
    issues.push(
      createValidationIssue(
        "error",
        "TYPE_MISMATCH",
        `Element '${element.path}' expects type(s) [${allowedTypes.join(", ")}], but found '${actualType}'`,
        { path: element.path },
      ),
    );
  }
}

/**
 * Infer FHIR type from a JavaScript value.
 */
export function inferFhirType(value: unknown): string {
  if (typeof value === "string") return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number")
    return Number.isInteger(value) ? "integer" : "decimal";
  if (value && typeof value === "object") {
    // Check for complex types by presence of specific fields
    if ("system" in value && "code" in value) return "Coding";
    if ("value" in value && "unit" in value) return "Quantity";
    if ("reference" in value) return "Reference";
    // ... more heuristics
    return "object"; // Generic complex type
  }
  return "unknown";
}
```

#### 测试用例（≥30）

**Cardinality (15 tests):**

- min=0, max=1, count=0 → valid
- min=0, max=1, count=1 → valid
- min=0, max=1, count=2 → error
- min=1, max=1, count=0 → error (required)
- min=1, max=1, count=1 → valid
- min=1, max=\*, count=0 → error
- min=1, max=\*, count=5 → valid
- min=0, max=\*, count=100 → valid
- min=2, max=5, count=1 → error
- min=2, max=5, count=3 → valid
- min=2, max=5, count=6 → error

**Type (15 tests):**

- string type, string value → valid
- string type, number value → error
- boolean type, boolean value → valid
- integer type, integer value → valid
- integer type, decimal value → error
- Coding type, Coding object → valid
- Coding type, string → error
- Quantity type, Quantity object → valid
- Reference type, Reference object → valid
- Choice type [string, Quantity], string → valid
- Choice type [string, Quantity], Quantity → valid
- Choice type [string, Quantity], boolean → error

#### 验收标准

- [ ] `validateCardinality` 实现完整
- [ ] `validateType` 实现完整
- [ ] `inferFhirType` 实现完整（支持 10+ FHIR 类型）
- [ ] ≥30 测试用例全部通过
- [ ] 错误消息清晰（包含 expected vs actual）
- [ ] 支持 choice type 验证

---

### Task 5.4: Validation Rules — Fixed/Pattern & Reference (Day 5, ~1 day)

#### 文件: `validator/validation-rules.ts` (continued)

实现 fixed/pattern value 和 reference target profile 验证。

#### 核心函数

```typescript
/**
 * Validate fixed value constraint.
 */
export function validateFixed(
  element: CanonicalElement,
  value: unknown,
  issues: ValidationIssue[],
): void {
  if (!element.fixed) return;

  if (!deepEqual(value, element.fixed)) {
    issues.push(
      createValidationIssue(
        "error",
        "FIXED_VALUE_MISMATCH",
        `Element '${element.path}' must have fixed value ${JSON.stringify(element.fixed)}, but found ${JSON.stringify(value)}`,
        { path: element.path },
      ),
    );
  }
}

/**
 * Validate pattern value constraint (partial match).
 */
export function validatePattern(
  element: CanonicalElement,
  value: unknown,
  issues: ValidationIssue[],
): void {
  if (!element.pattern) return;

  if (!matchesPattern(value, element.pattern)) {
    issues.push(
      createValidationIssue(
        "error",
        "PATTERN_VALUE_MISMATCH",
        `Element '${element.path}' must match pattern ${JSON.stringify(element.pattern)}`,
        { path: element.path },
      ),
    );
  }
}

/**
 * Check if a value matches a pattern (partial object match).
 */
export function matchesPattern(value: unknown, pattern: unknown): boolean {
  // Pattern is a subset match: all fields in pattern must exist in value
  // with the same values, but value can have additional fields
  if (typeof pattern !== "object" || pattern === null) {
    return deepEqual(value, pattern);
  }

  if (typeof value !== "object" || value === null) {
    return false;
  }

  for (const key in pattern) {
    if (!matchesPattern((value as any)[key], (pattern as any)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Validate reference target profile.
 */
export function validateReference(
  element: CanonicalElement,
  value: unknown,
  issues: ValidationIssue[],
): void {
  if (!isReference(value)) return;

  const ref = value as { reference?: string; type?: string };
  const targetProfiles = element.types
    .filter((t) => t.code === "Reference")
    .flatMap((t) => t.targetProfile || []);

  if (targetProfiles.length === 0) return; // No constraint

  // Extract resource type from reference
  const refType = extractReferenceType(ref.reference);

  if (!refType) {
    issues.push(
      createValidationIssue(
        "warning",
        "REFERENCE_TARGET_PROFILE_MISMATCH",
        `Element '${element.path}' reference format is invalid or cannot be checked`,
        { path: element.path },
      ),
    );
    return;
  }

  // Check if reference type matches any target profile
  const matchesProfile = targetProfiles.some((profile) =>
    profile.includes(refType),
  );

  if (!matchesProfile) {
    issues.push(
      createValidationIssue(
        "error",
        "REFERENCE_TARGET_PROFILE_MISMATCH",
        `Element '${element.path}' reference must target [${targetProfiles.join(", ")}], but found '${refType}'`,
        { path: element.path },
      ),
    );
  }
}
```

#### 测试用例（≥20）

**Fixed (8 tests):**

- Fixed string, matching value → valid
- Fixed string, different value → error
- Fixed CodeableConcept, matching → valid
- Fixed CodeableConcept, different → error
- Fixed Quantity, matching → valid
- Fixed Quantity, different → error
- No fixed constraint → valid (any value)

**Pattern (8 tests):**

- Pattern { system: 'X' }, value { system: 'X', code: 'Y' } → valid (subset match)
- Pattern { system: 'X' }, value { system: 'Z' } → error
- Pattern { value: 100 }, value { value: 100, unit: 'mg' } → valid
- Pattern { value: 100 }, value { value: 200 } → error
- Nested pattern → valid/error cases

**Reference (4 tests):**

- Reference to Patient, targetProfile = Patient → valid
- Reference to Observation, targetProfile = Patient → error
- Reference with no targetProfile constraint → valid
- Invalid reference format → warning

#### 验收标准

- [ ] `validateFixed` 实现完整
- [ ] `validatePattern` 实现完整（支持 partial match）
- [ ] `validateReference` 实现完整
- [ ] `matchesPattern` 正确处理嵌套对象
- [ ] `deepEqual` helper 实现（或使用 lodash）
- [ ] ≥20 测试用例全部通过

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
