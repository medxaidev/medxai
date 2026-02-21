# Workflow Analysis: FHIR StructureDefinition → TypeScript Types Generation

```yaml
workflow_id: WF-GEN-001
workflow_name: fhirtypes Generation Pipeline
entry_point: "npm run fhirtypes (packages/generator)"
exit_point: "fhirtypes/dist/*.d.ts + DATA_TYPES global registry populated"
phase: Phase-0 (Code Generation / Bootstrap)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. Workflow 概述

### 目标

接收 FHIR R4 官方规范 JSON（StructureDefinition Bundle），经过解析和类型映射，输出 TypeScript 类型声明文件（`.d.ts`），同时将解析结果写入全局运行时注册表 `DATA_TYPES`，供整个 `core` 包在运行时使用。

### 输入

| 类型 | 示例 | 来源 |
|------|------|------|
| `Bundle<StructureDefinition>` | `profiles-types.json` | `@medplum/definitions` |
| `Bundle<StructureDefinition>` | `profiles-resources.json` | `@medplum/definitions` |
| `Bundle<StructureDefinition>` | `profiles-medplum.json` | `@medplum/definitions` |

### 输出

| 类型 | 示例 |
|------|------|
| TypeScript 类型声明 | `fhirtypes/dist/Patient.d.ts`, `dist/Resource.d.ts`, `dist/index.d.ts` |
| 全局运行时注册表 | `DATA_TYPES: DataTypesMap`（内存，`core` 模块级单例） |
| 运行时验证数据 | `core/src/base-schema.json`（由 `npm run baseschema` 生成） |

---

## 2. 完整调用链（Call Graph）

### Happy Path — fhirtypes 生成

```
[npm run fhirtypes]
  ↓
1. generator/src/index.ts → main()
   │
   ├─ 2. definitions/src/index.ts → readJson('fhir/r4/profiles-types.json')
   │       → Bundle<StructureDefinition>（基础数据类型：string, HumanName, etc.）
   │
   ├─ 3. core/src/typeschema/types.ts → indexStructureDefinitionBundle(bundle)
   │       ├─ 过滤 bundle.entry → StructureDefinition[]
   │       ├─ core/src/types.ts → indexDefaultSearchParameters(sds)
   │       └─ for each sd: loadDataType(sd)
   │             ├─ parseStructureDefinition(sd)          ← 核心算法 ALG-001
   │             │     → new StructureDefinitionParser(sd).parse()
   │             │           → InternalTypeSchema
   │             ├─ 路由决策（写入哪个 DataTypesMap）：
   │             │     TYPE_SPECIAL_CASES[sd.url] → DATA_TYPES（特殊基础类型）
   │             │     sd.url === 官方 FHIR URL    → DATA_TYPES（标准类型）
   │             │     其他（profiles）            → PROFILE_DATA_TYPES[sd.url]
   │             ├─ DATA_TYPES[typeName] = schema
   │             ├─ for each innerType: DATA_TYPES[inner.name] = inner
   │             └─ PROFILE_SCHEMAS_BY_URL[sd.url] = schema
   │
   ├─ 4. [重复步骤2-3] profiles-resources.json（Patient, Observation, etc.）
   ├─ 5. [重复步骤2-3] profiles-medplum.json（Bot, Project, etc.）
   │
   ├─ 6. generator/src/index.ts → writeIndexFile()
   │       → getAllDataTypes() → 过滤 + 排序
   │       → 写出 fhirtypes/dist/index.d.ts
   │
   ├─ 7. generator/src/index.ts → writeResourceFile()
   │       → 写出 fhirtypes/dist/Resource.d.ts
   │
   ├─ 8. generator/src/index.ts → writeResourceTypeFile()
   │       → 写出 fhirtypes/dist/ResourceType.d.ts
   │
   └─ 9. for each type in DATA_TYPES:
           if isResourceTypeSchema || complex-type || logical:
             writeInterfaceFile(type)
               ├─ buildImports(type, included, referenced)
               ├─ writeInterface(b, type)
               │     ├─ for each element: writeInterfaceProperty()
               │     │     └─ getTypeScriptTypeForProperty()  ← 类型映射
               │     ├─ writeChoiceOfTypeDefinitions()         ← [x] 多态字段
               │     └─ for each innerType: writeInterface()  ← 递归
               └─ 写出 fhirtypes/dist/TypeName.d.ts

[cd ../fhirtypes && tsc]
  → TypeScript 编译检查生成的 .d.ts 文件
```

### Error Path

```
StructureDefinition 无 snapshot.element
  → StructureDefinitionParser constructor
  → throw new Error("No snapshot defined for StructureDefinition '${sd.name}'")

StructureDefinition 无 name
  → loadDataType()
  → throw new Error("Failed loading StructureDefinition from bundle")

slice 出现在 slicingContext 之前
  → parseSliceStart()
  → throw new Error("Invalid slice start before discriminator: ...")

不支持的 slicing discriminator type
  → enterSlice()
  → throw new Error("Unsupported slicing discriminator type: ...")
```

### 涉及文件

| package | file | 核心函数 | 角色 |
|---------|------|----------|------|
| `@medplum/generator` | `src/index.ts` | `main()`, `writeInterfaceFile()`, `getTypeScriptTypeForProperty()` | 生成器入口 + 类型映射 |
| `@medplum/generator` | `src/valuesets.ts` | `getValueSetValues()` | ValueSet → 字面量联合 |
| `@medplum/definitions` | `src/index.ts` | `readJson()` | 读取规范 JSON |
| `@medplum/core` | `src/typeschema/types.ts` | `indexStructureDefinitionBundle()`, `loadDataType()`, `parseStructureDefinition()` | **核心解析 + 全局注册** |
| `@medplum/core` | `src/typeschema/types.ts` | `StructureDefinitionParser` (class) | **核心解析算法** |
| `@medplum/core` | `src/base-schema-utils.ts` | `inflateBaseSchema()` | 初始化 DATA_TYPES |

---

## 3. 关键状态对象

### 阶段 1：输入（FHIR StructureDefinition）

```ts
// FHIR 官方格式
{
  resourceType: 'StructureDefinition',
  url: 'http://hl7.org/fhir/StructureDefinition/Patient',
  name: 'Patient',
  type: 'Patient',
  kind: 'resource',
  snapshot: {
    element: [
      { id: 'Patient', path: 'Patient', ... },           // root element
      { id: 'Patient.id', path: 'Patient.id', type: [{code: 'id'}], min: 0, max: '1' },
      { id: 'Patient.name', path: 'Patient.name', type: [{code: 'HumanName'}], min: 0, max: '*' },
      // ... 约 50-100 个 ElementDefinition
    ]
  }
}
```

### 阶段 2：解析中间状态（StructureDefinitionParser 内部）

```ts
// StructureDefinitionParser 内部状态
{
  root: ElementDefinition,           // snapshot.element[0]，根元素
  elements: ElementDefinition[],     // snapshot.element.slice(1)，待处理队列
  elementIndex: Record<string, ElementDefinition>,  // 路径 → 元素（用于 contentReference 解析）
  index: number,                     // 当前处理位置（游标）
  resourceSchema: InternalTypeSchema, // 正在构建的结果
  slicingContext: {                  // 当前切片上下文（处理 slicing 时）
    field: SlicingRules,
    current?: SliceDefinition,
    path: string
  } | undefined,
  innerTypes: InternalTypeSchema[],  // 收集的内嵌类型（BackboneElement）
  backboneContext: BackboneContext | undefined  // 当前 BackboneElement 上下文栈
}
```

### 阶段 3：输出（InternalTypeSchema）

```ts
// 解析后的内部表示
{
  name: 'Patient',
  type: 'Patient',
  path: 'Patient',
  url: 'http://hl7.org/fhir/StructureDefinition/Patient',
  kind: 'resource',
  description: 'Demographics and other administrative information...',
  elements: {
    'id':   { path: 'Patient.id', min: 0, max: 1, type: [{code: 'id'}], ... },
    'name': { path: 'Patient.name', min: 0, max: Infinity, isArray: true, type: [{code: 'HumanName'}], ... },
    'birthDate': { path: 'Patient.birthDate', min: 0, max: 1, type: [{code: 'date'}], ... },
    // ...
  },
  constraints: [...],           // FHIRPath 约束表达式
  innerTypes: [...],            // 内嵌 BackboneElement 类型
  summaryProperties: Set<string>,   // isSummary=true 的字段集合
  mandatoryProperties: Set<string>, // min>0 的字段集合
}
```

### 阶段 4：全局注册表（DATA_TYPES）

```ts
// 模块级单例，整个 core 包共享
const DATA_TYPES: DataTypesMap = {
  'Patient':      InternalTypeSchema,
  'Observation':  InternalTypeSchema,
  'HumanName':    InternalTypeSchema,
  'string':       InternalTypeSchema,  // 基础类型
  'PatientContact': InternalTypeSchema, // BackboneElement 内嵌类型
  // ... 约 600+ 个类型
}
```

---

## 4. 核心算法拆解

### Algorithm A — StructureDefinitionParser（核心）

**文件**: `packages/core/src/typeschema/types.ts:242`
**函数签名**:
```ts
class StructureDefinitionParser {
  constructor(sd: StructureDefinition)
  parse(): InternalTypeSchema
}
```

**算法步骤**:

1. **初始化**：从 `sd.snapshot.element[0]`（根元素）构建 `resourceSchema` 骨架
2. **顺序遍历** `snapshot.element[1..]`（游标模式，非递归）：
   - `element.sliceName` → 进入切片处理（`parseSliceStart`）
   - `element.id` 含 `:` → 切片子元素，写入当前切片的 `elements`
   - 普通字段 → `parseElementDefinition(element)` 转换为 `InternalSchemaElement`
3. **BackboneElement 上下文栈**：遇到 `BackboneElement`/`Element` 类型字段时，压栈 `backboneContext`；路径不兼容时出栈，将完成的内嵌类型推入 `innerTypes`
4. **Slicing 上下文**：遇到 `element.slicing` 时进入切片模式，收集 `SliceDefinition`；路径不兼容时退出
5. **contentReference 解析**：`peek()` 中处理，将引用替换为被引用元素的副本（用于递归结构如 `QuestionnaireItem`）
6. **收尾**：调用 `checkFieldExit()` 清空未完成的 BackboneElement 上下文

**伪代码**:
```
ALGORITHM StructureDefinitionParser
INPUT:  sd: StructureDefinition (must have sd.snapshot.element)
OUTPUT: schema: InternalTypeSchema
PRECONDITION:  sd.snapshot.element.length > 0
POSTCONDITION: schema.elements contains all non-zero-max fields
               schema.innerTypes contains all BackboneElement sub-types

BEGIN
  root    = sd.snapshot.element[0]
  queue   = sd.snapshot.element[1..]
  schema  = buildRootSchema(sd, root)
  cursor  = 0
  bbStack = empty stack
  sliceCtx = null

  WHILE cursor < queue.length:
    element = resolveContentReference(queue[cursor])
    cursor++

    IF element.sliceName IS SET THEN
      addSliceToCurrentSlicingContext(element)

    ELSE IF element.id CONTAINS ':' THEN
      IF sliceCtx.current IS SET THEN
        sliceCtx.current.elements[path] = parseElementDefinition(element)

    ELSE
      field = parseElementDefinition(element)

      IF isBackboneType(element) THEN
        unwindStackToParent(element.path, bbStack, schema.innerTypes)
        pushBackboneContext(element, bbStack)

      IF pathIncompatibleWithSliceCtx(element) THEN
        sliceCtx = null

      IF element.slicing IS SET AND sliceCtx IS NULL THEN
        field.slicing = buildSlicingRules(element)
        sliceCtx = { field: field.slicing, path: element.path }

      writeFieldToParentContext(element, field, bbStack, schema)

    checkExitBackboneContext(element, bbStack, schema.innerTypes)
  END WHILE

  flushRemainingBackboneContexts(bbStack, schema.innerTypes)
  schema.innerTypes = innerTypes
  RETURN schema
END
```

**复杂度**: 时间 O(n)（n = snapshot.element 数量），空间 O(d)（d = BackboneElement 最大嵌套深度）

### Algorithm B — 类型路由（loadDataType 中）

```ts
loadDataType(sd: StructureDefinition): void
```

**决策树**:
```
sd.url in TYPE_SPECIAL_CASES?
  YES → DATA_TYPES[specialCaseName] = schema
  NO  → sd.url === 官方 FHIR URL (hl7.org 或 medplum.com)?
          YES → DATA_TYPES[sd.type] = schema
          NO  → PROFILE_DATA_TYPES[sd.url][sd.type] = schema
```

**关键含义**：
- `DATA_TYPES` = 全局基础类型注册表（所有代码都能访问）
- `PROFILE_DATA_TYPES` = 按 profile URL 隔离的类型注册表（profile 验证时使用）

---

## 5. 全局 DATA_TYPES 的影响范围

`DATA_TYPES` 是整个 `core` 包的类型系统基础，以下功能都依赖它：

| 功能 | 访问方式 | 用途 |
|------|----------|------|
| 资源验证 | `getDataType(resourceType)` | 获取验证 schema |
| FHIRPath 求值 | `tryGetDataType(type)` | 获取字段类型信息 |
| 搜索参数索引 | `isResourceType(type)` | 判断是否为资源类型 |
| 资源子集化 | `DATA_TYPES[resource.resourceType]` | 获取字段列表 |
| 类型检查 | `isDataTypeLoaded(type)` | 检查类型是否已注册 |

**重要**：`DATA_TYPES` 在模块加载时通过 `inflateBaseSchema(baseSchema)` 预填充（来自 `base-schema.json`），`indexStructureDefinitionBundle()` 调用后追加/覆盖条目。

---

## 6. 权限与安全检查点

此 Workflow 为离线代码生成流程，无权限/安全检查。

---

## 7. 错误处理路径

| 错误类型 | 触发条件 | 处理位置 |
|----------|----------|----------|
| `Error: No snapshot defined` | StructureDefinition 无 snapshot | `StructureDefinitionParser` constructor |
| `Error: Failed loading StructureDefinition` | sd.name 为空 | `loadDataType()` |
| `Error: Invalid slice start` | sliceName 出现在 discriminator 之前 | `parseSliceStart()` |
| `Error: Unsupported slicing discriminator type` | discriminator.type 不是 value/pattern/type | `enterSlice()` |

---

## 8. 测试分析

### 相关测试文件

| file | 测试目标 |
|------|----------|
| `packages/core/src/typeschema/types.test.ts` | `parseStructureDefinition`, `indexStructureDefinitionBundle`, `loadDataType` |
| `packages/generator/src/index.test.ts` | `main()` 完整生成流程（smoke test） |

### 场景覆盖

| 场景 | 覆盖 | 说明 |
|------|------|------|
| 标准资源解析（Patient） | ✅ | types.test.ts |
| BackboneElement 内嵌类型 | ✅ | types.test.ts |
| Slicing 解析 | ✅ | types.test.ts |
| contentReference 解析 | ✅ | types.test.ts |
| 无 snapshot 错误 | ✅ | types.test.ts |
| 完整生成流程 | ✅ | index.test.ts（smoke） |

---

## 9. 抽象总结（For AI Learning）

```yaml
workflow_type: CodeGeneration
resource_type: StructureDefinition → InternalTypeSchema
core_patterns:
  - sequential_cursor_parsing    # 顺序游标遍历，非递归
  - context_stack                # BackboneElement 上下文栈
  - global_registry              # DATA_TYPES 全局注册表
  - type_routing                 # 官方类型 vs profile 类型分离
design_patterns:
  - parser_class                 # StructureDefinitionParser 封装解析状态
  - single_source_of_truth       # 规范 JSON → 代码，消除手工维护
  - bootstrap                    # 使用已有 dist 生成新版本
algorithm_extractability_score: 4
notes: >
  核心算法（StructureDefinitionParser）完全通用，可移植到任何语言。
  DATA_TYPES 全局注册表的设计模式（模块级单例 + 懒加载）在 medxai 中
  需要评估是否采用相同模式，或改为依赖注入。
  fhirtypes 产物对 medxai 无直接价值，但解析算法本身（ALG-001）是
  理解整个 FHIR 类型系统的基础。
```

---

## 10. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 是否需要 fhirtypes？ | 自动生成 | 直接使用 `@medplum/fhirtypes` 或等价类型库 |
| 是否需要 DATA_TYPES？ | 模块级全局单例 | 评估：全局单例 vs 依赖注入（测试友好性） |
| 是否需要 StructureDefinitionParser？ | 是，运行时验证需要 | 若 medxai 需要运行时 FHIR 验证，必须实现或复用 |
| base-schema.json 的作用？ | 预填充 DATA_TYPES，避免每次启动重新解析 | 若复用，直接使用 Medplum 生成的 base-schema.json |
