# Module Summary: fhirtypes

```yaml
package: "@medplum/fhirtypes"
version: 5.0.13
path: packages/fhirtypes/dist/   # 注意：源码由 generator 生成，非手写
generator_source: packages/generator/src/index.ts
analysis_date: 2026-02-21
analyst: fangjun
status: Complete
```

---

## 1. 这个模块解决什么问题？

`fhirtypes` 是整个 Medplum 系统的**类型语言基础**。它将 FHIR R4 规范中的所有资源（Patient、Observation、Bundle 等）和数据类型（HumanName、CodeableConcept 等）转化为 TypeScript 接口，让整个代码库获得编译期类型安全。

**没有这个模块**：所有 FHIR 资源都是 `any` 类型，无法在编译期发现字段拼写错误、类型不匹配等问题。

**关键特征**：
- **纯类型包**：只有 `.d.ts` 声明文件，无运行时代码（`"main": ""`）
- **机器生成**：所有文件由 `packages/generator` 从 FHIR StructureDefinition JSON 自动生成
- **零依赖**：不依赖任何其他 Medplum 包，是依赖树的根节点

---

## 2. 对外 API（Public Interface）

入口文件：`dist/index.d.ts`（由 generator 生成）

| 名称 | 类型 | 用途 | 重要程度 |
|------|------|------|----------|
| `Resource` | union type | 所有 FHIR 资源类型的联合 | **High** |
| `ResourceType` | string union | 所有资源类型名称的字符串联合（`'Patient' \| 'Observation' \| ...`） | **High** |
| `ExtractResource<K>` | generic type | 从 ResourceType 提取具体资源接口 | **High** |
| `Patient` | interface | FHIR Patient 资源 | **High** |
| `Bundle<T>` | generic interface | FHIR Bundle，泛型支持 | **High** |
| `BundleEntry<T>` | generic interface | Bundle 条目，泛型支持 | **High** |
| `Reference<T>` | generic interface | FHIR Reference，泛型支持 | **High** |
| `OperationOutcome` | interface | FHIR 错误/结果描述 | **High** |
| `Observation` | interface | FHIR 观测资源 | **High** |
| `Practitioner` | interface | FHIR 从业者资源 | **Med** |
| `Organization` | interface | FHIR 机构资源 | **Med** |
| `CodeableConcept` | interface | 可编码概念（含 coding + text） | **High** |
| `Coding` | interface | 单个编码（system + code + display） | **High** |
| `HumanName` | interface | 人名结构 | **Med** |
| `Identifier` | interface | 标识符（system + value） | **Med** |
| `Period` | interface | 时间段（start + end） | **Low** |
| `Quantity` | interface | 数量（value + unit） | **Low** |
| `Extension` | interface | FHIR 扩展机制 | **Med** |
| `Meta` | interface | 资源元数据（versionId、lastUpdated、tag 等） | **Med** |
| `ElementDefinition` | interface | StructureDefinition 元素定义 | **Med** |
| `StructureDefinition` | interface | FHIR 结构定义 | **Med** |
| `SearchParameter` | interface | 搜索参数定义 | **Med** |
| `ValueSet` | interface | 值集定义 | **Med** |
| `CodeSystem` | interface | 代码系统定义 | **Med** |

> 完整资源列表约 150+ 个接口，覆盖 FHIR R4 全部资源类型。

---

## 3. 内部核心结构

### 生成机制（关键理解）

`fhirtypes` 本身**没有源码**，其 `dist/` 目录由 `generator` 包生成：

```
packages/definitions/src/fhir/r4/
  ├── profiles-types.json       ← FHIR 基础数据类型 StructureDefinition
  ├── profiles-resources.json   ← FHIR 资源 StructureDefinition
  ├── profiles-medplum.json     ← Medplum 自定义资源 StructureDefinition
  └── valuesets.json            ← 值集定义（用于 code 字段的字符串字面量类型）
          ↓
  generator/src/index.ts
    main()
      ├── indexStructureDefinitionBundle()  ← 加载并索引 StructureDefinition
      ├── writeIndexFile()                  → dist/index.d.ts
      ├── writeResourceFile()               → dist/Resource.d.ts
      ├── writeResourceTypeFile()           → dist/ResourceType.d.ts
      └── writeInterfaceFile(type)          → dist/[TypeName].d.ts (每个类型一个文件)
```

### 生成的文件结构

```
dist/
├── index.d.ts          ← 总入口，re-export 所有类型
├── Resource.d.ts       ← Resource = Patient | Observation | ... (union)
├── ResourceType.d.ts   ← ResourceType = Resource['resourceType']
│                          ExtractResource<K> = Extract<Resource, {resourceType: K}>
├── Patient.d.ts        ← Patient 接口 + 内嵌子类型
├── Bundle.d.ts         ← Bundle<T> 泛型接口
├── Reference.d.ts      ← Reference<T> 泛型接口（含 resource?: T 扩展字段）
├── OperationOutcome.d.ts
├── Observation.d.ts
└── ... (约 150+ 个文件)
```

### 类型映射规则（generator 核心逻辑）

| FHIR 原始类型 | TypeScript 类型 |
|--------------|----------------|
| `string`, `uri`, `url`, `id`, `code`, `markdown`, `base64Binary` | `string` |
| `date`, `dateTime`, `instant`, `time`, `integer64` | `string`（ISO 格式字符串） |
| `decimal`, `integer`, `positiveInt`, `unsignedInt` | `number` |
| `boolean` | `boolean` |
| `code`（有 ValueSet 绑定） | `'value1' \| 'value2' \| ...`（字符串字面量联合） |
| `Reference` | `Reference<TargetType1 \| TargetType2>` |
| `Element`, `BackboneElement` | 内嵌接口（`TypeNameFieldName`） |
| `ResourceList` | `Resource`（联合类型） |
| `[x]` 多态字段（如 `value[x]`） | 展开为多个字段（`valueString`, `valueQuantity` 等） |

### 特殊泛型处理

```ts
// Bundle 和 BundleEntry 使用泛型，默认 T = Resource
export interface Bundle<T extends Resource = Resource> { ... }
export interface BundleEntry<T extends Resource = Resource> { ... }

// Reference 泛型，支持强类型引用
export interface Reference<T extends Resource = Resource> {
  reference?: string;
  resource?: T;  // Medplum 扩展字段（非标准 FHIR）
}

// 工具类型
export type ResourceType = Resource['resourceType'];
export type ExtractResource<K extends ResourceType> = Extract<Resource, { resourceType: K }>;
```

---

## 4. 与其他模块的交互

### 依赖（import from）

| 模块 | 用途 |
|------|------|
| 无 | 零运行时依赖，纯类型包 |

### 被依赖（被谁 import）

| 上游模块 | 使用方式 |
|----------|----------|
| `@medplum/core` | 所有 FHIR 操作的类型基础 |
| `@medplum/server` | 数据库存储、API 响应的类型 |
| `@medplum/fhir-router` | 路由处理函数的参数/返回类型 |
| `@medplum/react` | UI 组件 props 类型 |
| `@medplum/mock` | Mock 数据的类型约束 |
| `@medplum/generator` | 生成时自引用（bootstrap 问题，用已有 dist） |

---

## 5. 是否可被独立抽离？

- **可抽离性**: **High**（5/5）
- **理由**: 纯类型声明，零运行时代码，零依赖。任何 TypeScript 项目可直接 `npm install @medplum/fhirtypes` 使用。
- **抽离最小依赖集**: 无依赖，直接使用即可。

---

## 6. 核心算法标记

`fhirtypes` 本身无算法。但其**生成过程**（`generator/src/index.ts`）包含一个重要算法：

| 算法 | 核心函数 | 算法 ID |
|------|----------|---------|
| StructureDefinition → TypeScript 类型映射 | `writeInterfaceFile()` + `getTypeScriptTypeForProperty()` | ALG-009（待建档） |
| ValueSet → 字符串字面量联合类型 | `getValueSetValues()` + `buildValueSetValues()` | ALG-010（待建档） |

---

## 7. 关键设计模式

- **Code Generation Pattern**: 类型定义不手写，从权威数据源（FHIR 规范 JSON）自动生成，确保与规范同步。
- **Generic Narrowing Pattern**: `ExtractResource<K>` 利用 TypeScript 条件类型，实现从字符串到具体接口的类型收窄（`ExtractResource<'Patient'>` → `Patient`）。
- **Phantom Type Pattern**: `Reference<T>` 的泛型参数在运行时不存在，仅用于编译期类型检查。
- **Bootstrap Pattern**: `generator` 在生成 `fhirtypes` 时，自身也 import `@medplum/fhirtypes`（使用已有的 dist），形成自举。

---

## 8. 待深入分析的函数

| 函数 | 原因 |
|------|------|
| `generator/src/index.ts: getTypeScriptTypeForProperty()` | 类型映射的核心逻辑，决定所有字段类型 |
| `generator/src/valuesets.ts: buildValueSetValues()` | ValueSet 展开逻辑，影响 code 字段的字面量类型 |
| `core/src/typeschema/: indexStructureDefinitionBundle()` | fhirtypes 生成的上游，理解 InternalTypeSchema 结构 |

---

## 9. 重要说明（For medxai）

> **medxai 不需要重新实现 fhirtypes**。直接安装 `@medplum/fhirtypes` 或复制 `dist/` 目录即可。
>
> 真正需要理解的是：
> 1. `Resource` union type 的结构 → 影响所有泛型函数的设计
> 2. `Reference<T>` 的 `resource?` 扩展字段 → Medplum 特有，非标准 FHIR
> 3. `ResourceType` + `ExtractResource<K>` 工具类型 → 在 medxai 中大量使用
