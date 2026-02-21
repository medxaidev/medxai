# Algorithm Abstraction: Structured Schema Parser

> 本文档不提及 Medplum，描述纯粹的通用算法。
> 目标：其他项目可以直接学习算法，而不是学习 Medplum 代码。

```yaml
algorithm_id: ALG-001
algorithm_name: Structured Schema Parser (Sequential Cursor with Context Stack)
source_workflow: WF-GEN-001
source_file: packages/core/src/typeschema/types.ts
source_class: StructureDefinitionParser
source_function: StructureDefinitionParser.parse()
extractability_score: 5/5
analysis_date: 2026-02-21
analyst: fangjun
```

---

## 1. 问题定义

### 这个算法解决什么问题？

给定一个**扁平化的、有序的元素定义列表**（每个元素含路径、类型、基数等属性），将其还原为一棵**嵌套的类型树**，同时识别并处理列表中的特殊标记（分组开始标记、分组成员标记、内嵌子类型边界）。

核心挑战：输入是**线性序列**，输出是**层次结构**，且层次边界不是显式标记的，而是通过**路径前缀关系**隐式表达的。

### 适用场景

- 解析任何"扁平化快照"格式的规范文档（如 FHIR StructureDefinition snapshot）
- 将 XSD/JSON Schema 的扁平展开形式还原为嵌套类型树
- 解析具有路径层次结构的配置文件（如 protobuf descriptor）
- 任何需要从"深度优先遍历序列"重建树结构的场景

---

## 2. 算法合约

### 输入

| 参数名 | 类型（抽象） | 约束 |
|--------|-------------|------|
| `root` | `ElementDef` | 列表第一个元素，代表根节点 |
| `elements` | `ElementDef[]` | 有序元素列表（深度优先遍历顺序），不含根节点 |

其中 `ElementDef` 的最小结构：
```
ElementDef {
  path: string          // 点分隔路径，如 "Patient.name.given"
  type: TypeRef[]       // 类型引用列表
  min: number           // 最小基数（0 或正整数）
  max: string           // 最大基数（"0","1","*" 或正整数字符串）
  sliceName?: string    // 非空时：这是一个分组（slice）的起始标记
  id?: string           // 含 ":" 时：这是某个分组的成员元素
  slicing?: SlicingDef  // 非空时：此字段开始一个分组规则
  contentReference?: string  // 非空时：此元素引用另一个已见元素的定义
  isSummary?: boolean
  constraint?: ConstraintDef[]
}
```

### 输出

| 返回值 | 类型（抽象） | 说明 |
|--------|-------------|------|
| `schema` | `TypeSchema` | 根类型的完整嵌套结构 |

其中 `TypeSchema` 的结构：
```
TypeSchema {
  name: string
  path: string
  elements: Map<localPath, FieldSchema>   // 直接子字段
  innerTypes: TypeSchema[]                // 内嵌子类型（BackboneElement）
  constraints: Constraint[]
  summaryFields: Set<string>
  mandatoryFields: Set<string>
}

FieldSchema {
  path: string
  min: number
  max: number
  isArray: boolean
  type: TypeRef[]
  slicing?: SlicingRules    // 此字段有分组规则
  fixed?: Value
  pattern?: Value
  binding?: BindingDef
  constraints?: Constraint[]
}
```

### 前置条件（Preconditions）

1. `elements` 列表按**深度优先遍历顺序**排列（父节点在子节点之前）
2. 每个元素的 `path` 是合法的点分隔路径字符串
3. 若存在 `contentReference`，其引用的路径必须在列表中已出现过（向后引用不支持）
4. 若存在 `sliceName`，其前面必须已出现过对应的 `slicing` 字段

### 后置条件（Postconditions）

1. 输出 `schema.elements` 包含所有 `max > 0` 的直接子字段
2. 输出 `schema.innerTypes` 包含所有 `BackboneElement`/`Element` 类型的内嵌子类型
3. 每个内嵌子类型的 `elements` 只包含其直接子字段（不含孙字段）
4. 所有 `isSummary=true` 的字段路径收录在 `schema.summaryFields`
5. 所有 `min > 0` 的字段路径收录在 `schema.mandatoryFields`

### 不变量（Invariants）

1. **路径前缀不变量**：`backboneStack` 中任意元素的 `path` 都是当前处理元素 `path` 的前缀（或相等）
2. **切片上下文不变量**：`slicingContext` 非空时，当前处理元素的 `path` 必须与 `slicingContext.path` 兼容（相同或以其为前缀）
3. **游标单调递增**：`cursor` 只向前移动，不回退（除 `peek()` 外）

---

## 3. 核心数据结构

```
BackboneContext（上下文栈节点）
├── type: TypeSchema        // 正在构建的内嵌类型
├── path: string            // 此内嵌类型的根路径
└── parent?: BackboneContext // 父上下文（形成栈）

SlicingContext（分组上下文）
├── field: SlicingRules     // 当前分组规则（写入目标字段）
├── current?: SliceEntry    // 当前正在构建的分组条目
└── path: string            // 分组字段的路径

ElementIndex（已见元素索引）
└── Map<path, ElementDef>   // 用于解析 contentReference
```

---

## 4. 算法步骤

1. **初始化**：从根元素构建 `schema` 骨架；初始化空的 `backboneStack`、`slicingContext=null`、`elementIndex`
2. **主循环**（顺序遍历 `elements`）：
   - **a. 解析当前元素**：若有 `contentReference`，从 `elementIndex` 查找并替换为引用目标的副本
   - **b. 分类处理**：
     - `sliceName` 非空 → 分组起始，创建 `SliceEntry` 加入 `slicingContext.field.slices`
     - `id` 含 `:` → 分组成员，写入 `slicingContext.current.elements`
     - 其他 → 普通字段，执行步骤 c-f
   - **c. 转换字段**：将 `ElementDef` 转换为 `FieldSchema`（基数解析、类型解析、约束收集）
   - **d. 检查内嵌类型入口**：若字段类型为 `BackboneElement`/`Element` 且下一个元素是其子路径 → 压栈 `backboneStack`
   - **e. 检查分组上下文**：若当前路径与 `slicingContext.path` 不兼容 → 清空 `slicingContext`；若字段有 `slicing` 定义 → 建立新 `slicingContext`
   - **f. 写入字段**：遍历 `backboneStack`，找到第一个路径兼容的上下文，将字段写入其 `elements`；若无兼容上下文，写入根 `schema.elements`
   - **g. 检查内嵌类型出口**：若 `backboneStack` 顶部路径与当前元素路径不兼容 → 出栈，将完成的内嵌类型推入 `innerTypes`（可能连续出栈多层）
3. **收尾**：清空剩余 `backboneStack`，将所有未完成的内嵌类型推入 `innerTypes`
4. **返回** `schema`

---

## 5. 伪代码

```
ALGORITHM StructuredSchemaParser
INPUT:
  root: ElementDef          -- 根元素（列表第一项）
  elements: ElementDef[]    -- 有序元素列表（深度优先，不含根）
OUTPUT:
  schema: TypeSchema
PRECONDITION:
  elements is in depth-first traversal order
  all contentReference targets appear before their references
POSTCONDITION:
  schema.elements contains all direct child fields with max > 0
  schema.innerTypes contains all nested composite sub-types

BEGIN
  schema      = buildRootSchema(root)
  bbStack     = empty stack of BackboneContext
  sliceCtx    = null
  elemIndex   = empty map
  cursor      = 0

  WHILE cursor < elements.length:
    raw     = elements[cursor]
    cursor  = cursor + 1
    elemIndex[raw.path] = raw

    -- Resolve content references (for recursive structures)
    IF raw.contentReference IS SET THEN
      refPath = extractPath(raw.contentReference)
      ref     = elemIndex[refPath]
      IF ref IS NULL THEN SKIP  -- forward reference, not supported
      element = mergeOverride(ref, raw)  -- raw overrides min/max/id/path
    ELSE
      element = raw
    END IF

    -- Classify and dispatch
    IF element.sliceName IS SET THEN
      -- Start of a new slice entry
      IF sliceCtx IS NULL THEN
        RAISE Error("slice before discriminator")
      END IF
      entry = buildSliceEntry(element)
      sliceCtx.field.slices.append(entry)
      sliceCtx.current = entry

    ELSE IF element.id CONTAINS ':' THEN
      -- Element belonging to a slice entry
      IF sliceCtx.current IS SET THEN
        localPath = stripPrefix(element.path, sliceCtx.path)
        sliceCtx.current.elements[localPath] = convertField(element)
      END IF

    ELSE
      -- Normal field
      field = convertField(element)

      -- (d) Check backbone entry
      next = elements[cursor]  -- peek
      IF isCompositeType(element) AND isChildPath(next.path, element.path) THEN
        -- Unwind stack to element's parent first
        WHILE bbStack.top IS SET AND NOT isChildPath(element.path, bbStack.top.path):
          innerTypes.push(bbStack.pop().type)
        END WHILE
        bbStack.push(BackboneContext {
          type: buildSubSchema(element),
          path: element.path,
          parent: bbStack.top
        })
      END IF

      -- (e) Check slicing context
      IF sliceCtx IS SET AND NOT pathCompatible(sliceCtx.path, element.path) THEN
        sliceCtx = null
      END IF
      IF element.slicing IS SET AND sliceCtx IS NULL THEN
        field.slicing = buildSlicingRules(element)
        sliceCtx = SlicingContext { field: field.slicing, path: element.path }
      END IF

      -- (f) Write field to correct parent
      written = false
      ctx = bbStack.top
      WHILE ctx IS SET:
        IF element.path STARTS_WITH ctx.path + '.' THEN
          localPath = stripPrefix(element.path, ctx.path)
          ctx.type.elements[localPath] = field
          written = true
          BREAK
        END IF
        ctx = ctx.parent
      END WHILE
      IF NOT written THEN
        localPath = stripPrefix(element.path, root.path)
        schema.elements[localPath] = field
        IF element.isSummary THEN schema.summaryFields.add(localPath) END IF
        IF field.min > 0 THEN schema.mandatoryFields.add(localPath) END IF
      END IF

      -- (g) Check backbone exit
      nextElem = elements[cursor]  -- peek again
      WHILE bbStack.top IS SET AND NOT pathCompatible(bbStack.top.path, nextElem?.path):
        finished = bbStack.pop()
        innerTypes.push(finished.type)
        IF bbStack.top IS SET THEN
          -- also exit parent if needed
          CONTINUE
        END IF
      END WHILE

    END IF
  END WHILE

  -- Flush remaining backbone contexts
  WHILE bbStack IS NOT EMPTY:
    innerTypes.push(bbStack.pop().type)
  END WHILE

  schema.innerTypes = innerTypes
  RETURN schema
END


FUNCTION convertField(element: ElementDef) -> FieldSchema:
  max = parseCardinality(element.max)  -- "*" → +∞
  baseMax = element.base?.max ? parseCardinality(element.base.max) : max
  RETURN FieldSchema {
    path:        element.path,
    min:         element.min ?? 0,
    max:         max,
    isArray:     baseMax > 1,
    type:        resolveTypes(element),
    constraints: element.constraint ?? [],
    fixed:       extractFixedValue(element),
    pattern:     extractPatternValue(element),
    binding:     element.binding,
  }
END


FUNCTION parseCardinality(c: string) -> number:
  IF c == "*" THEN RETURN +Infinity
  ELSE RETURN parseInt(c)
END


FUNCTION pathCompatible(parent: string, child: string) -> boolean:
  RETURN child STARTS_WITH (parent + '.') OR child == parent
END
```

---

## 6. 复杂度分析

- **时间复杂度**: O(n × d)
  - n = `elements` 列表长度
  - d = BackboneElement 最大嵌套深度
  - 每个元素处理时，最坏情况需遍历整个 `bbStack`（深度 d）
  - 实际 FHIR 资源中 d ≤ 5，可视为 O(n)
- **空间复杂度**: O(n + d)
  - `elementIndex` 存储所有已见元素：O(n)
  - `bbStack` 最大深度 d：O(d)
  - 输出 `schema` 大小与输入成正比：O(n)
- **瓶颈**: `elementIndex` 的内存占用（大型规范文件约 1000+ 元素）

---

## 7. 边界情况

| 场景 | 处理方式 |
|------|----------|
| 空 `elements` 列表 | 直接返回只有根信息的 `schema`，`elements` 为空 |
| 多层嵌套 BackboneElement | `bbStack` 连续压栈，出口时连续出栈 |
| `contentReference` 自引用（递归结构） | 用 `elementIndex` 查找已见元素，合并 min/max 覆盖 |
| 分组（slicing）内含 BackboneElement | `slicingContext.current.elements` 接收子字段 |
| 分组后紧跟普通字段 | 路径不兼容时自动清空 `slicingContext` |
| 末尾 BackboneElement 未被后续元素触发出口 | 收尾阶段 `checkFieldExit()` 强制清空 `bbStack` |
| `max = "0"` 的字段 | 在 generator 中跳过（不写入接口），在验证中保留（用于约束检查） |

---

## 8. 已知的实现变体

| 实现 | 差异点 |
|------|--------|
| Medplum `StructureDefinitionParser` | 游标模式（`index` + `peek()`）；`bbStack` 用链表（`parent` 指针）而非数组；`contentReference` 在 `peek()` 中解析 |
| HAPI FHIR (Java) | 使用递归下降解析；显式构建树节点；不依赖路径前缀推断层次 |
| medxai（待实现） | 建议：游标模式 + 数组栈（更简单）；`contentReference` 在主循环中解析（更清晰） |

---

## 9. 迁移指南

### 实现此算法需要的前置知识

- 理解点分隔路径的前缀关系（`pathCompatible` 函数）
- 理解 FHIR 基数表示法（`"0"`, `"1"`, `"*"`, `"0..*"`）
- 理解 `BackboneElement` 的语义（内嵌复合类型）
- 理解 FHIR Slicing 的语义（同一字段的多个命名变体）

### 最小实现步骤

1. 实现 `parseCardinality(c: string): number`（`"*"` → `Infinity`）
2. 实现 `pathCompatible(parent, child): boolean`（前缀检查）
3. 实现 `convertField(element): FieldSchema`（基数 + 类型提取）
4. 实现主循环（游标 + `bbStack` + `sliceCtx`）
5. 实现 `contentReference` 解析（`elementIndex` 查找 + 字段合并）
6. 实现收尾逻辑（清空 `bbStack`）

### 可复用的测试用例（来自 Medplum 测试）

| 测试场景 | 来源文件 | 预期结果 |
|----------|----------|----------|
| 解析 Patient（标准资源） | `typeschema/types.test.ts` | `elements` 含 id/name/birthDate 等 |
| 解析含 BackboneElement 的资源（Patient.contact） | `typeschema/types.test.ts` | `innerTypes` 含 `PatientContact` |
| 解析含 slicing 的资源（Extension） | `typeschema/types.test.ts` | `elements.extension.slicing` 非空 |
| 解析含 contentReference 的资源（Questionnaire.item） | `typeschema/types.test.ts` | 递归字段正确解析 |
| 无 snapshot 的 StructureDefinition | `typeschema/types.test.ts` | 抛出错误 |

---

## 10. 关键洞察（For medxai 决策）

### 为什么这个算法重要？

`DATA_TYPES` 全局注册表是整个 FHIR 运行时的**类型系统基础**。以下功能都依赖它：

```
DATA_TYPES
  ├── 资源验证（validateResource）      → 获取字段约束
  ├── FHIRPath 求值                     → 获取字段类型
  ├── 搜索参数索引                       → 判断资源类型
  ├── 资源子集化（subsetResource）       → 获取字段列表
  └── 类型检查（isResourceType）         → 查询注册表
```

### medxai 的三个选择

| 选择 | 描述 | 适用场景 |
|------|------|----------|
| **A. 直接复用** | 调用 `indexStructureDefinitionBundle()` + `getDataType()` | medxai 使用 TypeScript，可直接依赖 `@medplum/core` |
| **B. 使用预生成数据** | 直接加载 `base-schema.json`，不重新解析 | medxai 只需验证标准 FHIR R4，不需要加载自定义 profile |
| **C. 自行实现** | 按本文档实现等价算法 | medxai 使用其他语言（Python/Go），或需要深度定制 |

### 全局单例 vs 依赖注入

Medplum 使用**模块级全局单例**（`const DATA_TYPES = ...`），优点是简单，缺点是：
- 测试间状态污染（需要 `clearAllDataTypes()` 清理）
- 无法在同一进程中维护多个独立的类型注册表

**medxai 建议**：若需要测试友好性，考虑将 `DataTypesMap` 作为依赖注入参数传递，而非全局单例。
