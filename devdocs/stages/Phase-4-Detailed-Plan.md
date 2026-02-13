# Phase 4: fhir-profile — Snapshot 生成模块详细开发计划

**Phase:** 4 of 5  
**Duration:** 15-20 days  
**Complexity:** VERY HIGH ⭐  
**Risk:** HIGH  
**Depends on:** Phase 1 (fhir-model) ✅, Phase 2 (fhir-parser) ✅, Phase 3 (fhir-context) ✅

---

## 目标概述

实现 `fhir-profile` 模块，核心是 **Snapshot Generation Algorithm**（快照生成算法）。
这是 Stage-1 中**最复杂、最关键的算法**，概念上等价于 HAPI FHIR 的 `ProfileUtilities.generateSnapshot()`。

### 核心原则

1. **Base-driven 遍历**: 以 base snapshot 为驱动逐元素匹配 differential，非遍历 differential patch base
2. **语义等价于 HAPI**: 对同一输入产出的 snapshot 应与 HAPI R4 输出语义一致
3. **递归安全**: 快照生成可递归触发其他 profile 的快照生成，必须有循环检测和栈管理
4. **Differential 全覆盖验证**: 生成结束后所有 differential element 必须已被消费
5. **约束只能收紧**: derived profile 只能收紧 base 约束，不能放宽

### 依赖规则 (MODULES.md)

```
fhir-profile MAY import from: fhir-model, fhir-parser, fhir-context
fhir-profile MUST NOT import from: fhir-validator
```

### 已完成的前置研究（Phase 0 研究交付物）

| 研究交付物                                       | 对应 Task     |
| ------------------------------------------------ | ------------- |
| `HAPI-generateSnapshot-Study-Deliverable.md`     | Task 4.1, 4.5 |
| `HAPI-processPaths-Study-Deliverable.md`         | Task 4.4      |
| `HAPI-updateFromBase-Study-Deliverable.md`       | Task 4.3      |
| `HAPI-updateFromDefinition-Study-Deliverable.md` | Task 4.3      |
| `HAPI-processSlicing-Study-Deliverable.md`       | Task 4.6      |
| `HAPI-sortElements-Study-Deliverable.md`         | Task 4.7      |
| `hapi-json-fixtures/` (35 test fixtures)         | Task 4.9      |

---

## 架构概览

### 模块结构

```
packages/fhir-core/src/profile/
├── index.ts                          # Barrel exports
├── types.ts                          # Interfaces & types
├── errors.ts                         # Profile-specific errors
├── snapshot-generator.ts             # Orchestrator (generateSnapshot)
├── element-merger.ts                 # processPaths equivalent
├── constraint-merger.ts              # updateFromDefinition equivalent
├── path-utils.ts                     # Path matching & normalization
├── slicing-handler.ts                # Slicing processing
├── element-sorter.ts                 # Element ordering
├── canonical-builder.ts              # SD snapshot → CanonicalProfile
└── __tests__/
    ├── snapshot-generator.test.ts
    ├── element-merger.test.ts
    ├── constraint-merger.test.ts
    ├── path-utils.test.ts
    ├── slicing-handler.test.ts
    ├── element-sorter.test.ts
    ├── canonical-builder.test.ts
    ├── hapi-reference.test.ts
    ├── integration.test.ts
    └── fixtures/
```

### 数据流 (DATAFLOW.md A.2)

```
StructureDefinition (with differential only)
  → SnapshotGenerator.generate(sd)
  → Step 1: Load base SD via FhirContext (recursive if base lacks snapshot)
  → Step 2: Initialize snapshot = clone(base.snapshot.element)
  → Step 3: ElementMerger.processPaths() — base-driven merge
  → Step 4: Validate merged snapshot
  → Step 5: Verify all differential elements consumed
  → Step 6: Set IDs and sort elements
  → StructureDefinition (with complete snapshot)
  → (Optional) CanonicalBuilder → CanonicalProfile
  → Cache in FhirContext
```

---

## Task 4.1: 核心接口与错误类型 (Day 1, ~0.5 day) ✅ Completed

### 文件: `types.ts` + `errors.ts` + `index.ts`

定义 fhir-profile 模块的公共接口和内部类型。

### Implementation Notes

**已创建文件：**

1. **`profile/types.ts`** (~260 lines) — 核心接口与类型
   - `SnapshotGeneratorOptions` — 生成配置（throwOnError, maxRecursionDepth, generateCanonical）
   - `SnapshotResult` — 生成结果（SD + issues + success flag + optional CanonicalProfile）
   - `SnapshotIssue` + `SnapshotIssueCode` — 11 种 issue code 覆盖所有已知场景
   - `DiffElementTracker` — HAPI consumed marker 模式
   - `TraversalScope` — cursor-based 遍历范围（start/end inclusive）
   - `createSnapshotIssue()` — issue 工厂函数
   - `createDiffTracker()` — tracker 工厂函数

2. **`profile/errors.ts`** (~210 lines) — 错误层级
   - `ProfileError` — base class（含 `Object.setPrototypeOf` prototype chain 修复）
   - `SnapshotCircularDependencyError` — 循环依赖（url + chain）
   - `BaseNotFoundError` — base SD 未找到（derivedUrl + baseUrl + cause）
   - `ConstraintViolationError` — 约束违规（violationType + path）
   - `UnconsumedDifferentialError` — 未消费 diff（unconsumedPaths，截断显示前 5 个）

3. **`profile/index.ts`** (~35 lines) — Barrel exports

**设计决策：**

- 错误类风格与 `context/errors.ts` 保持一致（`Object.setPrototypeOf`、`override readonly name`、`ErrorOptions` cause 传递）
- `SnapshotResult.issues` 使用 `readonly SnapshotIssue[]` 而非 mutable array
- `createSnapshotIssue` 工厂函数避免 optional 字段的 undefined 赋值

### 验收标准

- [x] 所有公共接口定义完整（6 types + 2 helper functions）
- [x] 错误类型覆盖所有已知失败场景（4 error classes）
- [x] `DiffElementTracker` 实现 HAPI 的 consumed marker 模式
- [x] `TraversalScope` 支持 cursor-based 遍历
- [x] TypeScript 编译通过（`tsc --noEmit` 零错误）
- [x] 750/750 现有测试无回归

---

## Task 4.2: 路径工具函数 (Day 1-2, ~1.5 days) ✅ Completed

### 文件: `path-utils.ts`

路径匹配是 snapshot 生成的基础。HAPI 的 `processPaths()` 大量依赖路径操作。

### Implementation Notes

**已创建文件：**

1. **`profile/path-utils.ts`** (~290 lines, 5 sections) — 15 个导出函数
   - Section 1: 基础路径操作 — `pathMatches`, `isDirectChild`, `isDescendant`, `pathDepth`, `parentPath`, `tailSegment`
   - Section 2: Choice type 路径 — `isChoiceTypePath`, `matchesChoiceType`, `extractChoiceTypeName`
   - Section 3: Slice 路径 — `hasSliceName`, `extractSliceName`
   - Section 4: Scope 计算 — `getChildScope`, `getDiffMatches`, `hasInnerDiffMatches`
   - Section 5: 路径重写 — `rewritePath`

2. **`profile/__tests__/path-utils.test.ts`** (~450 lines, 15 describe blocks, **75 tests**)

**设计决策：**

- `pathDepth` 使用 charCode 循环而非 `split('.')` 以避免数组分配
- `matchesChoiceType` 通过 charCode 范围 65-90 检测大写字母（type name 首字母）
- `getDiffMatches` 同时支持精确匹配和 choice type 匹配（对应 HAPI `getDiffMatches`）
- `hasInnerDiffMatches` 支持普通后代和 choice type 后代（如 `value[x]` → `valueQuantity.unit`）
- `getChildScope` 返回 inclusive `[start, end]` 范围，与 `TraversalScope` 一致

### 验收标准

- [x] 所有路径工具函数实现并通过单元测试（15 个函数）
- [x] 精确匹配、前缀匹配、choice type 匹配全覆盖
- [x] Slice 路径（`:sliceName`）正确处理
- [x] `getDiffMatches` 行为与 HAPI 语义一致
- [x] `hasInnerDiffMatches` 正确检测后代 diff 元素
- [x] `getChildScope` 正确计算子元素范围
- [x] 路径重写（datatype 展开）正确
- [x] 测试覆盖 **75 个 case**（远超 ≥30 目标）
- [x] 825/825 测试通过（750 原有 + 75 新增），零回归

---

## Task 4.3: 约束合并引擎 (Day 2-4, ~3 days) ⭐ ✅ Completed

### 文件: `constraint-merger.ts`

对应 HAPI 的 `updateFromDefinition()` + `updateFromBase()`。
字段级别的合并逻辑，是最精细的部分。

### Implementation Notes

**已创建文件：**

1. **`profile/constraint-merger.ts`** (~370 lines, 8 sections) — 7 个导出函数 + 3 个内部 helper
   - Section 1: `mergeConstraints` — 主入口，处理所有字段类别
   - Section 2: `setBaseTraceability` — 设置 `element.base`（ancestry preservation）
   - Section 3: `mergeCardinality` — min/max 验证 + slice exception
   - Section 4: `mergeTypes` + `isTypeCompatible` — 类型兼容性检查（Extension, Element, \*, Resource, uri/string）
   - Section 5: `mergeBinding` — binding strength 验证（REQUIRED relaxation guard）
   - Section 6: `mergeConstraintList` — constraint 追加 + key 去重
   - Section 7: `mergeStringArray`, `mergeExampleList`, `mergeMappingList` — 并集追加
   - Section 8: `isLargerMax` — max 值比较（`"*"` = 无穷大）

2. **`profile/__tests__/constraint-merger.test.ts`** (~670 lines, 12 describe blocks, **65 tests**)
   - Unit tests: isLargerMax(8), mergeCardinality(6), mergeTypes(7), mergeBinding(5), mergeConstraintList(5), setBaseTraceability(3), mergeConstraints integration(6)
   - Fixture tests: 01-cardinality(5), 02-types(5), 03-binding(5), 04-constraints(5), 05-full-merge(5)

3. **25 JSON test fixtures** across 5 categories:
   - `01-cardinality/` — valid-tighten-min, valid-tighten-max, invalid-loosen-min, invalid-widen-max, slice-min-exception
   - `02-types/` — valid-subset, valid-extension-wildcard, valid-resource-compat, invalid-incompatible, valid-uri-string-compat
   - `03-binding/` — valid-tighten-strength, invalid-relax-required, valid-same-required, valid-add-binding, valid-tighten-example-to-preferred
   - `04-constraints/` — append-new-constraint, dedup-by-key, multiple-append, diff-only, no-diff-constraints
   - `05-full-merge/` — documentation-overwrite, value-constraints-overwrite, combined-cardinality-type-binding, multiple-violations, alias-example-mapping-union

**设计决策：**

- `mergeConstraints` 采用 HAPI "apply pattern"：if diff has field → compare → validate → apply
- Branded type 处理：实现文件使用 `as FhirString` / `as FhirUnsignedInt` cast 处理默认值；测试文件使用 `as unknown as ElementDefinition` 双重 cast
- `mergeCardinality` 的 slice exception：通过检查 `source.sliceName` 实现，与 HAPI `!derived.hasSliceName()` 语义一致
- `isTypeCompatible` 实现 6 种特殊兼容规则（Extension, Element, \*, Resource/DomainResource, uri/string）
- `mergeConstraintList` 按 key 去重时替换而非跳过（derived constraint 优先）

### 合并规则详表（来自 HAPI `updateFromDefinition` 研究）

| 字段                                                      | 合并策略   | 验证规则                                |
| --------------------------------------------------------- | ---------- | --------------------------------------- |
| `min`                                                     | 验证后覆盖 | `derived.min >= base.min`（slice 除外） |
| `max`                                                     | 验证后覆盖 | `derived.max <= base.max`               |
| `type[]`                                                  | 验证后替换 | derived types ⊆ base types              |
| `binding`                                                 | 验证后覆盖 | 不能放宽 REQUIRED binding               |
| `short`, `definition`, `comment`, `requirements`, `label` | 直接覆盖   | —                                       |
| `fixed[x]`, `pattern[x]`, `maxLength`                     | 直接覆盖   | —                                       |
| `mustSupport`                                             | 直接覆盖   | —                                       |
| `isModifier`                                              | 条件覆盖   | 仅 extension 可修改                     |
| `isSummary`                                               | 条件覆盖   | base 已有时不可修改                     |
| `constraint[]`                                            | 追加       | 按 key 去重                             |
| `alias[]`, `example[]`, `mapping[]`                       | 并集追加   | —                                       |

### 验收标准

- [x] `mergeConstraints` 正确处理所有字段类别（覆盖/验证后覆盖/追加）
- [x] `mergeCardinality` 检测 min/max 违规并记录 issue
- [x] `mergeTypes` 实现类型兼容性检查（含 6 种特殊兼容规则）
- [x] `mergeBinding` 实现 binding strength 比较（REQUIRED relaxation guard）
- [x] `mergeConstraintList` 正确追加并按 key 去重
- [x] `setBaseTraceability` 正确设置 `element.base`（含 ancestry preservation）
- [x] 测试覆盖 **65 个 case**（远超 ≥40 目标）+ 25 个 JSON fixtures
- [x] 890/890 测试通过（750 原有 + 75 path-utils + 65 constraint-merger），零回归

---

## Task 4.4: 核心合并循环 — ElementMerger (Day 4-7, ~4 days) ⭐⭐ ✅ Completed

### 文件: `element-merger.ts`

对应 HAPI 的 `processPaths()`。这是 snapshot 生成的**核心引擎**——base-driven 遍历循环。
这是整个 Phase 4 中最复杂的单个文件。

### Implementation Notes

**已创建文件：**

1. **`profile/element-merger.ts`** (~870 lines, 11 sections) — 3 个导出函数/接口 + 8 个内部 helper
   - Section 1: `MergeContext` interface + `createMergeContext` factory
   - Section 2: `cloneElement` — deep clone via structuredClone/JSON fallback
   - Section 3: `processPaths` — core base-driven merge loop (4 branches)
   - Section 4: `getDiffMatchesForPath`, `hasDiffSlicing`, `diffsConstrainTypes`, `getInnerDiffScope`
   - Section 5: `skipChildren`, `copyBaseChildren` — base traversal helpers
   - Section 6: `narrowChoiceType` — choice type `[x]` narrowing
   - Section 7: `expandDatatype` — datatype expansion via cache lookup + recursive processPaths
   - Section 8: `processTypeSlicing` — Branch C: synthetic slicing root + per-type recursion
   - Section 9: `processExplicitSlicing` — Branch D: slicing root + per-slice recursion
   - Section 10: `processBaseSliced` — base already sliced: align by sliceName, CLOSED guard
   - Section 11: `mergeSnapshot` — high-level convenience entry point

2. **`profile/__tests__/element-merger.test.ts`** (~590 lines, 14 describe blocks, **54 tests**)
   - Unit tests: mergeSnapshot(5), Branch A(3), Branch B(6), Choice type(4), Datatype expansion(5), Explicit slicing(2), Type slicing(1), Recursion depth(1), Diff consumed(2)
   - Fixture tests: 06-inherit-base(5), 07-single-merge(5), 08-datatype-expansion(5), 09-choice-type(5), 10-slicing(5)

3. **25 JSON test fixtures** across 5 categories:
   - `06-inherit-base/` — simple-inherit, inherit-with-children, partial-diff, base-traceability, empty-diff
   - `07-single-merge/` — tighten-cardinality, overwrite-documentation, set-must-support, multiple-elements, set-fixed-value
   - `08-datatype-expansion/` — identifier-system, humanname-family, no-type-error, missing-datatype, path-rewriting
   - `09-choice-type/` — narrow-to-quantity, narrow-to-string, keep-choice-path, narrow-to-codeable-concept, single-type-no-narrow
   - `10-slicing/` — explicit-slice-two, single-slice, type-slicing-choice, diff-consumed-check, unconsumed-diff-warning

**设计决策：**

- `MergeContext.datatypeCache` 使用 `Map<string, ElementDefinition[]>` 实现同步 datatype 查找，避免 async 复杂度
- `processPaths` 使用 cursor-based 遍历（`baseCursor/baseLimit`），与 HAPI 语义一致
- Branch A 中 base children 的处理：无 inner diff 时 copy as-is，有 inner diff 时递归或 datatype expansion
- Branch B 中 `skipChildren` 仅在已处理 children 后调用，避免跳过未处理的同级元素
- `diffsConstrainTypes` 检测：choice type concrete paths OR 不同 type constraints
- `narrowChoiceType`：从 `value[x]` + `valueString` 推导出 type 为 `string`，过滤 outcome.type
- `expandDatatype`：从 `datatypeCache` 查找 datatype snapshot，路径重写 `Identifier.system` → `Patient.identifier.system`
- `processBaseSliced`：按 sliceName 对齐 base/diff slices，CLOSED slicing 禁止新增 slice

**关键 bug 修复：**

- 初始实现中 `skipChildren` 在 Branch A 无条件调用，导致根元素后所有子元素被跳过
- 修复：改为 `getChildScope` + `bc++` 组合，仅在递归/copy 后跳过已处理的 children

### 验收标准

- [x] Base-driven 遍历正确处理所有四种分支
- [x] 无 diff 匹配时正确继承 base 元素（含 children copy）
- [x] 单匹配时正确调用 `mergeConstraints`（含 children 递归）
- [x] Datatype 展开（递归进入复杂类型 snapshot）正确（含路径重写）
- [x] Choice type `[x]` 路径匹配和类型缩窄正确
- [x] 递归深度保护生效（maxDepth guard + INTERNAL_ERROR issue）
- [x] Diff element consumed 标记正确设置（unconsumed → DIFFERENTIAL_NOT_CONSUMED warning）
- [x] 测试覆盖 **54 个 case** + 25 个 JSON fixtures
- [x] 944/944 测试通过（890 原有 + 54 element-merger），零回归

---

## Task 4.5: Snapshot Generator 编排器 (Day 7-8, ~2 days)

### 文件: `snapshot-generator.ts`

对应 HAPI 的 `generateSnapshot()` 方法。
这是**顶层编排器**，协调整个快照生成流程。

### 核心类

```typescript
/**
 * Snapshot Generator — 快照生成编排器。
 *
 * 对应 HAPI ProfileUtilities.generateSnapshot()。
 * 编排以下步骤：
 * 1. 输入验证
 * 2. 循环检测（snapshot generation stack）
 * 3. 加载 base SD（递归确保 base 有 snapshot）
 * 4. 初始化 snapshot（clone base.snapshot.element）
 * 5. 调用 ElementMerger.processPaths()
 * 6. 验证 differential 全覆盖
 * 7. 设置 element IDs
 * 8. 缓存结果
 */
export class SnapshotGenerator {
  constructor(
    private readonly context: FhirContext,
    private readonly options: SnapshotGeneratorOptions = {},
  ) {}

  /**
   * Generate snapshot for a StructureDefinition.
   *
   * @param sd - StructureDefinition with differential
   * @returns SnapshotResult with populated snapshot
   * @throws SnapshotCircularDependencyError if circular reference detected
   * @throws BaseNotFoundError if base SD cannot be loaded
   */
  async generate(sd: StructureDefinition): Promise<SnapshotResult>;
}
```

### 编排步骤详解

```typescript
async generate(sd: StructureDefinition): Promise<SnapshotResult> {
  // Step 1: Validate inputs
  //   - sd must not be null
  //   - sd.baseDefinition must exist (unless root type like Element/Resource)

  // Step 2: Circular dependency detection
  //   - Maintain a Set<string> of URLs currently being generated
  //   - If sd.url already in set → throw SnapshotCircularDependencyError
  //   - Push sd.url to set

  // Step 3: Load base StructureDefinition
  //   - base = await context.loadStructureDefinition(sd.baseDefinition)
  //   - If base has no snapshot → recursively generate(base)

  // Step 4: Initialize snapshot
  //   - snapshot = deepClone(base.snapshot.element)

  // Step 5: Prepare differential trackers
  //   - Clone differential elements into DiffElementTracker[]
  //   - Each tracker starts with consumed = false

  // Step 6: Call ElementMerger.processPaths()
  //   - Pass base scope, diff trackers, result array

  // Step 7: Post-processing
  //   - Verify all diff trackers are consumed
  //   - Unconsumed → record DIFFERENTIAL_NOT_CONSUMED issue
  //   - Set element IDs (ensureElementIds)
  //   - Sort elements if needed

  // Step 8: Assemble result
  //   - Set sd.snapshot = { element: result }
  //   - Optionally build CanonicalProfile
  //   - Pop sd.url from generation stack
  //   - Cache in context

  // Error handling: if exception during generation,
  //   set sd.snapshot = undefined, pop stack, re-throw
}
```

### 验收标准

- [ ] 输入验证（null SD, missing baseDefinition）
- [ ] 循环检测正确（A→B→A 抛出 SnapshotCircularDependencyError）
- [ ] 递归确保 base 有 snapshot（base 无 snapshot 时递归生成）
- [ ] Differential 全覆盖验证（未消费的 diff element 产生 issue）
- [ ] 异常时清理 snapshot（设为 undefined）并弹出 stack
- [ ] 结果缓存到 FhirContext
- [ ] 测试覆盖 ≥25 个 case

---

## Task 4.6: Slicing 处理 (Day 8-11, ~3 days) ⭐

### 文件: `slicing-handler.ts`

对应 HAPI `processPaths()` 中的 slicing 分支。
Slicing 是 snapshot 生成中**第二复杂的部分**（仅次于 processPaths 本身）。

### 核心概念（来自 HAPI-processSlicing-Study-Deliverable）

1. **Slicing 配置在 unsliced 元素上**（`ElementDefinition.slicing`）
2. **Slices 是同 path 不同 sliceName 的额外 ElementDefinition**
3. **两种主要场景**：
   - Case A: Base 未 sliced，differential 引入 slicing
   - Case B: Base 已 sliced，differential 修改/扩展 slices
4. **Snapshot 生成不评估 discriminator**——只复制/合并 slicing 元数据

### 核心函数

```typescript
/**
 * 处理 Case A: Base 未 sliced，differential 引入 slicing。
 *
 * 步骤：
 * 1. 创建 slicing root element（从 diff 或合成 extension slicing）
 * 2. 添加到 result
 * 3. 对每个 diff slice 递归 processPaths（同一 base 范围）
 */
export function handleNewSlicing(
  context: MergeContext,
  result: ElementDefinition[],
  currentBase: ElementDefinition,
  baseScope: TraversalScope,
  diffMatches: DiffElementTracker[],
  diffTrackers: readonly DiffElementTracker[],
): void;

/**
 * 处理 Case B: Base 已 sliced，differential 修改/扩展 slices。
 *
 * 步骤：
 * 1. 复制 base slicing root
 * 2. 获取 base slice siblings
 * 3. 按 sliceName 对齐 base slices 和 diff slices
 * 4. 匹配的 slice → 递归处理
 * 5. 不匹配的 base slice → 原样复制
 * 6. 剩余 diff slices → 作为新 slice 追加（仅 open/openAtEnd 允许）
 */
export function handleExistingSlicing(
  context: MergeContext,
  result: ElementDefinition[],
  currentBase: ElementDefinition,
  baseScope: TraversalScope,
  diffMatches: DiffElementTracker[],
  diffTrackers: readonly DiffElementTracker[],
): void;

/**
 * 获取 base 中同一 slicing 组的所有 sibling slices。
 * 对应 HAPI getSiblings()。
 */
export function getSliceSiblings(
  elements: readonly ElementDefinition[],
  slicingRootIndex: number,
): ElementDefinition[];

/**
 * 验证 differential slicing 元数据与 base slicing 兼容。
 * - discriminator 必须匹配（类型+路径）
 * - ordered 不能从 true 变为 false
 * - rules 不能从 closed 变为 open
 */
export function validateSlicingCompatibility(
  baseSlicing: ElementDefinitionSlicing,
  diffSlicing: ElementDefinitionSlicing,
  issues: SnapshotIssue[],
  path: string,
): boolean;

/**
 * 检测 diff matches 是否构成 type slicing。
 * 对应 HAPI diffsConstrainTypes()。
 */
export function diffsConstrainTypes(
  diffMatches: DiffElementTracker[],
  basePath: string,
  baseTypes: readonly ElementDefinitionType[] | undefined,
): boolean;

/**
 * 为 extension 元素生成默认 slicing 定义。
 * 对应 HAPI makeExtensionSlicing()。
 */
export function makeExtensionSlicing(): ElementDefinitionSlicing;
```

### 验收标准

- [ ] Case A（新 slicing）：正确创建 slicing root 并递归处理每个 slice
- [ ] Case B（已有 slicing）：正确对齐 base/diff slices 并保持顺序
- [ ] 新 slice 只能在 open/openAtEnd 时追加
- [ ] Closed slicing 拒绝新 slice
- [ ] Extension slicing 自动生成（`makeExtensionSlicing`）
- [ ] Type slicing 检测和处理正确
- [ ] Slicing 兼容性验证（discriminator、ordered、rules）
- [ ] 测试覆盖 ≥35 个 case

---

## Task 4.7: 元素排序 (Day 11-12, ~1 day)

### 文件: `element-sorter.ts`

对应 HAPI 的 `sortDifferential()` + `sortElements()`。

### 核心概念（来自 HAPI-sortElements-Study-Deliverable）

- 排序的权威顺序是 **base snapshot 中元素的顺序**，不是字典序
- Differential 在处理前可能需要预排序
- 排序通过构建树结构、按 base index 排序、再序列化回线性列表实现

### 核心函数

```typescript
/**
 * 对 differential 元素按 base snapshot 顺序排序。
 * 对应 HAPI sortDifferential()。
 *
 * 步骤：
 * 1. 构建 ElementDefinition 树
 * 2. 在每个层级按 base snapshot index 排序
 * 3. 序列化回线性列表
 */
export function sortDifferential(
  differential: ElementDefinition[],
  baseSnapshot: readonly ElementDefinition[],
  issues: SnapshotIssue[],
): ElementDefinition[];

/**
 * 在 base snapshot 中查找路径的 index。
 * 处理 choice type 和 contentReference 重定向。
 */
export function findBaseIndex(
  baseSnapshot: readonly ElementDefinition[],
  path: string,
): number;

/**
 * 验证 snapshot 元素顺序是否正确。
 * 用于生成后的最终验证。
 */
export function validateElementOrder(
  snapshot: readonly ElementDefinition[],
  issues: SnapshotIssue[],
): boolean;

/**
 * 确保所有 snapshot 元素有正确的 id。
 * 对应 HAPI setIds()。
 */
export function ensureElementIds(
  elements: ElementDefinition[],
  resourceType: string,
): void;
```

### 验收标准

- [ ] Differential 排序按 base snapshot 顺序
- [ ] Choice type 路径正确映射到 base index
- [ ] Slice 元素保持在 slicing root 之后
- [ ] `ensureElementIds` 正确生成 element id
- [ ] 测试覆盖 ≥15 个 case

---

## Task 4.8: CanonicalProfile 构建器 (Day 12-13, ~1.5 days)

### 文件: `canonical-builder.ts`

将生成的 StructureDefinition snapshot 转换为 Phase 1 定义的 `CanonicalProfile` 内部语义模型。

### 核心概念

`CanonicalProfile` 是 MedXAI 自有的语义抽象（定义在 `fhir-model/canonical-profile.ts`），
设计用于高效的下游消费（验证、运行时、应用层）。

转换规则：

- `ElementDefinition` → `CanonicalElement`
- `max: "*"` → `max: 'unbounded'`
- `mustSupport/isModifier/isSummary: undefined` → `false`
- `constraint: undefined` → `[]`
- `type: undefined` → `[]`
- `elements` 使用 `Map<string, CanonicalElement>`（O(1) lookup，保持插入顺序）

### 核心函数

```typescript
/**
 * 将 StructureDefinition（含 snapshot）转换为 CanonicalProfile。
 *
 * 前提：sd.snapshot 必须已存在（由 SnapshotGenerator 生成）。
 */
export function buildCanonicalProfile(
  sd: StructureDefinition,
): CanonicalProfile;

/**
 * 将单个 ElementDefinition 转换为 CanonicalElement。
 */
export function buildCanonicalElement(ed: ElementDefinition): CanonicalElement;

/**
 * 转换 ElementDefinitionType[] → TypeConstraint[]。
 */
export function buildTypeConstraints(
  types: readonly ElementDefinitionType[] | undefined,
): TypeConstraint[];

/**
 * 转换 ElementDefinitionBinding → BindingConstraint。
 */
export function buildBindingConstraint(
  binding: ElementDefinitionBinding | undefined,
): BindingConstraint | undefined;

/**
 * 转换 ElementDefinitionConstraint[] → Invariant[]。
 */
export function buildInvariants(
  constraints: readonly ElementDefinitionConstraint[] | undefined,
): Invariant[];

/**
 * 转换 ElementDefinitionSlicing → SlicingDefinition。
 */
export function buildSlicingDefinition(
  slicing: ElementDefinitionSlicing | undefined,
): SlicingDefinition | undefined;
```

### 验收标准

- [ ] `buildCanonicalProfile` 正确转换完整 SD
- [ ] `max: "*"` → `'unbounded'` 转换正确
- [ ] 所有 boolean flag 默认为 `false`（非 undefined）
- [ ] `constraints` 和 `types` 默认为 `[]`（非 undefined）
- [ ] `elements` Map 保持 snapshot 元素顺序
- [ ] Slicing 定义正确转换
- [ ] 测试覆盖 ≥20 个 case

---

## Task 4.9: HAPI 参考测试 + 集成测试 (Day 13-16, ~3 days)

### 文件: `hapi-reference.test.ts` + `integration.test.ts`

使用已有的 35 个 HAPI JSON fixtures 验证实现的语义正确性。

### HAPI 参考测试

已有 fixtures 位于 `devdocs/research/hapi-json-fixtures/`：

#### 1.1-generateSnapshot（20 个 fixtures）

| #   | Fixture                      | 测试重点                         |
| --- | ---------------------------- | -------------------------------- |
| 01  | minimal-no-diff              | 空 differential，snapshot = base |
| 02  | single-cardinality-tighten   | 单字段 min/max 收紧              |
| 03  | multiple-element-constraints | 多字段约束                       |
| 04  | nested-element-constraint    | 嵌套元素约束                     |
| 05  | choice-type-restrict         | Choice type 类型限制             |
| 06  | choice-type-rename           | Choice type 重命名               |
| 07  | simple-slicing-open          | 简单 open slicing                |
| 08  | slicing-closed               | Closed slicing                   |
| 09  | slicing-multiple-slices      | 多 slice                         |
| 10  | extension-slicing            | Extension slicing                |
| 11  | must-support-flags           | mustSupport 标记                 |
| 12  | binding-strength-tighten     | Binding 收紧                     |
| 13  | type-profile-constraint      | Type profile 约束                |
| 14  | fixed-value                  | Fixed value                      |
| 15  | pattern-value                | Pattern value                    |
| 16  | two-level-inheritance        | 两级继承                         |
| 17  | three-level-inheritance      | 三级继承                         |
| 18  | abstract-base                | 抽象 base                        |
| 19  | error-no-differential        | 错误：无 differential            |
| 20  | error-unresolvable-base      | 错误：无法解析 base              |

#### 1.2-processPaths（13+ fixtures）

路径匹配、choice type、slice path、contentReference 等。

### 集成测试

```typescript
describe("End-to-end snapshot generation", () => {
  // 使用真实 FHIR R4 核心定义（73 个已预加载）
  it("generates snapshot for Patient base resource");
  it("generates snapshot for simple Patient profile");
  it("generates snapshot for profile with slicing");
  it("generates snapshot for multi-level inheritance");
  it("generates snapshot for US Core Patient (if fixture available)");
  it("handles circular dependency gracefully");
  it("handles missing base gracefully");
  it("produces valid CanonicalProfile from generated snapshot");
});
```

### 测试策略

1. **Fixture-driven**: 每个 HAPI fixture 定义 input（base + differential）和 expected output（snapshot）
2. **Element-by-element 比较**: 比较生成的 snapshot 与 HAPI 输出的每个 element
3. **Issue 验证**: 错误 fixture 验证正确的 issue 产生
4. **容差策略**: 允许非语义差异（如 element id 格式、字段顺序）

### 验收标准

- [ ] 所有 20 个 generateSnapshot fixtures 通过（或记录已知差异）
- [ ] 所有 13 个 processPaths fixtures 通过
- [ ] 集成测试使用真实 FHIR R4 核心定义
- [ ] 简单 profile 100% 匹配 HAPI 输出
- [ ] 复杂 profile ≥95% 匹配（差异已记录）
- [ ] 错误场景正确产生 issue
- [ ] 测试覆盖 ≥60 个 case

---

## Task 4.10: Exports & Build 验证 (Day 16-17, ~1 day)

### 文件: `profile/index.ts` + `src/index.ts` 更新

### Barrel Exports (`profile/index.ts`)

```typescript
// ─── Types ───
export type {
  SnapshotGeneratorOptions,
  SnapshotResult,
  SnapshotIssue,
  SnapshotIssueCode,
} from "./types.js";

// ─── SnapshotGenerator ───
export { SnapshotGenerator } from "./snapshot-generator.js";

// ─── CanonicalBuilder ───
export { buildCanonicalProfile } from "./canonical-builder.js";

// ─── Errors ───
export {
  ProfileError,
  SnapshotCircularDependencyError,
  BaseNotFoundError,
  ConstraintViolationError,
  UnconsumedDifferentialError,
} from "./errors.js";

// ─── Path Utilities (for advanced consumers) ───
export {
  pathMatches,
  isDirectChild,
  isDescendant,
  isChoiceTypePath,
  matchesChoiceType,
} from "./path-utils.js";
```

### 主包 `src/index.ts` 更新

添加 profile 模块的 re-exports。

### 验收标准

- [ ] `profile/index.ts` barrel exports 完整
- [ ] `src/index.ts` 包含 profile 模块 re-exports
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 成功（ESM + CJS + d.ts）
- [ ] api-extractor 无新增错误
- [ ] Phase 1/2/3 测试无回归（750 + Phase 4 新增测试全部通过）

---

## 实现顺序与依赖关系

```
Task 4.1 (types/errors)
  ↓
Task 4.2 (path-utils) ←── 无外部依赖，可与 4.1 并行
  ↓
Task 4.3 (constraint-merger) ←── 依赖 4.1 types
  ↓
Task 4.4 (element-merger) ←── 依赖 4.2 + 4.3，核心引擎
  ↓
Task 4.5 (snapshot-generator) ←── 依赖 4.4，编排器
  ↓
Task 4.6 (slicing-handler) ←── 依赖 4.4，可与 4.5 部分并行
  ↓
Task 4.7 (element-sorter) ←── 依赖 4.2
  ↓
Task 4.8 (canonical-builder) ←── 依赖 4.1，可与 4.4-4.7 并行
  ↓
Task 4.9 (tests) ←── 依赖所有上游
  ↓
Task 4.10 (exports & build) ←── 依赖所有上游
```

### 建议的开发节奏

| 阶段               | Days      | Tasks     | 重点                                  |
| ------------------ | --------- | --------- | ------------------------------------- |
| **基础层**         | Day 1-2   | 4.1 + 4.2 | 接口定义 + 路径工具（可并行）         |
| **合并引擎**       | Day 2-4   | 4.3       | 约束合并（字段级）                    |
| **核心循环**       | Day 4-7   | 4.4       | ElementMerger（最复杂，预留充足时间） |
| **编排 + Slicing** | Day 7-11  | 4.5 + 4.6 | 编排器 + Slicing（第二复杂）          |
| **排序 + 转换**    | Day 11-13 | 4.7 + 4.8 | 排序 + CanonicalProfile（相对简单）   |
| **测试 + 集成**    | Day 13-16 | 4.9       | HAPI 参考测试 + 集成测试              |
| **收尾**           | Day 16-17 | 4.10      | Exports + Build + 回归验证            |

---

## Estimated Timeline

| Task                     | Duration | Dependencies |
| ------------------------ | -------- | ------------ |
| 4.1 Core Interfaces      | 0.5 day  | None         |
| 4.2 Path Utils           | 1.5 days | 4.1          |
| 4.3 Constraint Merger    | 3 days   | 4.1          |
| 4.4 Element Merger       | 4 days   | 4.2, 4.3     |
| 4.5 Snapshot Generator   | 2 days   | 4.4          |
| 4.6 Slicing Handler      | 3 days   | 4.4          |
| 4.7 Element Sorter       | 1 day    | 4.2          |
| 4.8 Canonical Builder    | 1.5 days | 4.1          |
| 4.9 HAPI Reference Tests | 3 days   | All above    |
| 4.10 Exports & Build     | 1 day    | All above    |

**Total: 15-17 days**（含缓冲；4.4 和 4.6 是关键路径）

---

## Dependencies & Risks

### Dependencies

| Dependency                 | Status                    | Impact if Delayed |
| -------------------------- | ------------------------- | ----------------- |
| Phase 1 (fhir-model)       | ✅ Complete               | N/A               |
| Phase 2 (fhir-parser)      | ✅ Complete               | N/A               |
| Phase 3 (fhir-context)     | ✅ Complete               | N/A               |
| HAPI Research Deliverables | ✅ Complete (8 docs)      | N/A               |
| HAPI JSON Fixtures         | ✅ Complete (35 fixtures) | N/A               |
| FHIR R4 Core Definitions   | ✅ Complete (73 defs)     | N/A               |

### Risks

| Risk                          | Probability | Impact | Mitigation                                          |
| ----------------------------- | ----------- | ------ | --------------------------------------------------- |
| `processPaths` 复杂度超预期   | **High**    | High   | 预留 4 天；先实现 Branch A+B，再加 C+D              |
| Slicing 边界情况多            | **High**    | Medium | 严格按 HAPI 研究交付物实现；fixture-driven 开发     |
| Datatype 展开递归问题         | Medium      | High   | 使用 FhirContext 已有的 73 个核心定义；递归深度保护 |
| HAPI 输出差异                 | Medium      | Low    | 记录差异，区分语义差异 vs 非语义差异                |
| 性能问题（深继承链）          | Low         | Medium | 先保证正确性；Phase 6 做性能优化                    |
| `CanonicalProfile` 模型不够用 | Low         | Medium | 必要时扩展 Phase 1 模型（向后兼容）                 |

### 风险缓解策略

1. **渐进式实现**: 先实现简单 profile（无 slicing），再逐步加入 slicing、type slicing
2. **Fixture-driven 开发**: 每实现一个分支，立即用对应 fixture 验证
3. **频繁集成测试**: 每完成一个 Task 就运行全量测试，确保无回归
4. **研究交付物对照**: 实现时逐行对照 HAPI 研究文档

---

## Success Metrics

| Metric                             | Target  | Actual |
| ---------------------------------- | ------- | ------ |
| Implementation files               | 8-10    | ⬜     |
| Test files                         | 8-10    | ⬜     |
| Total tests (Phase 4)              | 250-300 | ⬜     |
| HAPI fixture pass rate             | ≥95%    | ⬜     |
| Line coverage                      | ≥80%    | ⬜     |
| Build time                         | <30s    | ⬜     |
| Test execution time                | <10s    | ⬜     |
| Snapshot generation time (simple)  | <100ms  | ⬜     |
| Snapshot generation time (complex) | <1s     | ⬜     |
| Total tests (all phases)           | 1000+   | ⬜     |

---

## Phase 4 Completion Checklist

- [ ] All 10 tasks completed
- [ ] All acceptance criteria met
- [ ] HAPI reference tests ≥95% pass rate
- [ ] Test coverage ≥80%
- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] All tests pass (Phase 1 + 2 + 3 + 4)
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Phase-4-Detailed-Plan.md marked as complete

---

## Documentation Updates Required

After Phase 4 completion, update:

1. **`devdocs/architecture/MODULES.md`**
   - Mark `fhir-profile` as implemented
   - Update dependency graph

2. **`devdocs/architecture/DATAFLOW.md`**
   - Verify A.2 (Snapshot Generation Flow) matches implementation
   - Add any discovered sub-flows

3. **`devdocs/stages/Stage-1-Development-Roadmap.md`**
   - Mark Phase 4 as complete
   - Update overall progress

---

## Next Phase Preview: Phase 5 (fhir-validator)

Phase 5 will implement **structural validation** against profiles using the snapshots generated in Phase 4.

### Phase 5 Scope

- Validate resource instances against profile snapshots
- Cardinality enforcement (min/max)
- Type constraint checking
- Required element presence validation
- Terminology binding metadata (no expansion)

### Phase 5 Estimated Duration

**5-7 days** (Medium complexity)

### Phase 5 Dependencies

- ✅ Phase 1 (fhir-model)
- ✅ Phase 2 (fhir-parser)
- ✅ Phase 3 (fhir-context)
- ⬜ Phase 4 (fhir-profile) ← must complete first

---

**Phase 4 Status:** Planning → Ready for Implementation
