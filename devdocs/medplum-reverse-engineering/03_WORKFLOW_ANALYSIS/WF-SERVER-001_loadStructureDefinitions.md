# Workflow Analysis: Server Startup — loadStructureDefinitions

```yaml
workflow_id: WF-SERVER-001
workflow_name: Server Startup Schema & Search Parameter Initialization
entry_point: "server/src/app.ts → initApp() → initAppServices() → loadStructureDefinitions()"
exit_point: "DATA_TYPES + globalSchema 两个全局注册表完全填充"
phase: Phase-Server (Runtime Initialization)
related_workflow: WF-GEN-001 (生成阶段)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 目的与背景

### 与 WF-GEN-001 的关系

| 维度 | WF-GEN-001（生成阶段） | WF-SERVER-001（运行阶段） |
|------|----------------------|--------------------------|
| 时机 | 开发时，`npm run fhirtypes` | 服务器启动时，`initApp()` |
| 调用者 | generator 脚本 | server `initAppServices()` |
| 调用 `indexStructureDefinitionBundle` | ✅ 是 | ✅ 是（相同函数） |
| 目标 | 生成 `.d.ts` 文件 | 填充运行时 `DATA_TYPES` |
| 额外工作 | 无 | **填充 `globalSchema`（SearchParameter 索引）** |

**关键洞察**：`indexStructureDefinitionBundle` 在两个阶段都被调用，但目的不同：
- 生成阶段：读取 `InternalTypeSchema` 用于生成 TypeScript 代码
- 运行阶段：填充 `DATA_TYPES` 用于运行时验证、FHIRPath、搜索

### 幂等保护

```ts
let loaded = false;

export function loadStructureDefinitions(): void {
  if (!loaded) {
    // ... 所有初始化 ...
    loaded = true;
  }
}
```

`loaded` 标志确保整个初始化只执行一次，无论 `loadStructureDefinitions()` 被调用多少次。

---

## 2. 完整调用链

```
server/src/app.ts → initApp()
  └─ initAppServices()
       └─ loadStructureDefinitions()   [packages/server/src/fhir/structure.ts]
            │
            ├─ [阶段A] indexStructureDefinitionBundle × 3
            │    ├─ readJson('fhir/r4/profiles-types.json')
            │    │    → Bundle<StructureDefinition>（基础类型：string, HumanName, etc.）
            │    │    → indexStructureDefinitionBundle(bundle)
            │    │         ├─ indexDefaultSearchParameters(sds)  ← 副作用①
            │    │         └─ for each sd: loadDataType(sd)      ← 副作用②
            │    │
            │    ├─ readJson('fhir/r4/profiles-resources.json')
            │    │    → Bundle<StructureDefinition>（Patient, Observation, etc.）
            │    │    → indexStructureDefinitionBundle(bundle)
            │    │
            │    └─ readJson('fhir/r4/profiles-medplum.json')
            │         → Bundle<StructureDefinition>（Bot, Project, etc.）
            │         → indexStructureDefinitionBundle(bundle)
            │
            └─ [阶段B] indexSearchParameterBundle × 3
                 ├─ readJson('fhir/r4/search-parameters.json')
                 │    → Bundle<SearchParameter>（FHIR R4 标准搜索参数）
                 │    → indexSearchParameterBundle(bundle)      ← 副作用③
                 │
                 ├─ readJson('fhir/r4/search-parameters-medplum.json')
                 │    → Bundle<SearchParameter>（Medplum 扩展搜索参数）
                 │    → indexSearchParameterBundle(bundle)
                 │
                 └─ readJson('fhir/r4/search-parameters-uscore.json')
                      → Bundle<SearchParameter>（US Core 搜索参数）
                      → indexSearchParameterBundle(bundle)
```

---

## 3. 两个全局注册表

### 注册表 A：`DATA_TYPES`（类型系统）

- **位置**：`packages/core/src/typeschema/types.ts:97`
- **类型**：`DataTypesMap = Record<string, InternalTypeSchema>`
- **填充方式**：`loadDataType(sd)` → `parseStructureDefinition(sd)` → `DATA_TYPES[typeName] = schema`
- **内容**：所有 FHIR 类型的结构定义（字段、基数、类型、约束）
- **用途**：验证、FHIRPath、子集化

```ts
// 访问示例
const patientSchema = DATA_TYPES['Patient'];
// → InternalTypeSchema { name: 'Patient', elements: { id: ..., name: ..., ... } }
```

### 注册表 B：`globalSchema`（搜索参数）

- **位置**：`packages/core/src/types.ts:482`
- **类型**：`IndexedStructureDefinition = { types: Record<string, TypeInfo> }`
- **填充方式**：`indexDefaultSearchParameters()` + `indexSearchParameter()`
- **内容**：每个资源类型的可用搜索参数（按 code 索引）
- **用途**：搜索查询解析、SQL 生成、搜索参数验证

```ts
// globalSchema 结构
{
  types: {
    'Patient': {
      searchParams: {
        '_id':          SearchParameter { type: 'token', expression: 'Patient.id' },
        '_lastUpdated': SearchParameter { type: 'date',  expression: 'Patient.meta.lastUpdated' },
        'name':         SearchParameter { type: 'string', expression: 'Patient.name' },
        'birthdate':    SearchParameter { type: 'date',   expression: 'Patient.birthDate' },
        // ... 约 20-30 个搜索参数
      },
      searchParamsDetails: {
        // 延迟填充（首次搜索时）
      }
    },
    'Observation': { ... },
    // ...
  }
}
```

---

## 4. indexDefaultSearchParameters 详解

**位置**：`packages/core/src/types.ts:163`

```ts
export function indexDefaultSearchParameters(bundle: StructureDefinition[] | Bundle): void {
  const maybeSDs = Array.isArray(bundle) ? bundle : (bundle.entry?.map((e) => e.resource) ?? []);
  for (const sd of maybeSDs) {
    if (sd?.resourceType === 'StructureDefinition' && sd.kind === 'resource') {
      getOrInitTypeSchema(sd.type);
    }
  }
}
```

**作用**：为每个**资源类型**（`kind === 'resource'`）在 `globalSchema.types` 中创建条目，并预填充 7 个**通用搜索参数**：

| 参数 | 类型 | FHIRPath 表达式 |
|------|------|----------------|
| `_id` | token | `{ResourceType}.id` |
| `_lastUpdated` | date | `{ResourceType}.meta.lastUpdated` |
| `_compartment` | reference | `{ResourceType}.meta.compartment` |
| `_profile` | uri | `{ResourceType}.meta.profile` |
| `_security` | token | `{ResourceType}.meta.security` |
| `_source` | uri | `{ResourceType}.meta.source` |
| `_tag` | token | `{ResourceType}.meta.tag` |

**注意**：`Binary` 资源类型例外，不预填充搜索参数（`if (!typeSchema.searchParams && resourceType !== 'Binary')`）。

---

## 5. indexSearchParameterBundle / indexSearchParameter 详解

**位置**：`packages/core/src/types.ts:154`

```
indexSearchParameterBundle(bundle)
  └─ for each entry.resource (SearchParameter):
       indexSearchParameter(resource)
         └─ for each resourceType in searchParam.base:
              getOrInitTypeSchema(resourceType)
                → globalSchema.types[resourceType] （已存在则复用）
              typeSchema.searchParams[searchParam.code] = searchParam
```

**关键字段**：`SearchParameter.base`（适用的资源类型列表）、`SearchParameter.code`（查询字符串参数名）

**示例**：
```json
{
  "resourceType": "SearchParameter",
  "code": "birthdate",
  "base": ["Patient"],
  "type": "date",
  "expression": "Patient.birthDate"
}
```
→ `globalSchema.types['Patient'].searchParams['birthdate'] = { ... }`

**多资源共享搜索参数**：
```json
{
  "code": "identifier",
  "base": ["Patient", "Practitioner", "Organization", ...],
  "type": "token",
  "expression": "Patient.identifier | Practitioner.identifier | ..."
}
```
→ 同一个 `SearchParameter` 对象写入多个资源类型的 `searchParams`

---

## 6. 初始化顺序的重要性

```
阶段A: indexStructureDefinitionBundle（必须先执行）
  ↓ 副作用①: indexDefaultSearchParameters
       → 在 globalSchema 中为每个资源类型创建条目
       → 预填充 7 个通用搜索参数
  ↓ 副作用②: loadDataType
       → 填充 DATA_TYPES（类型系统）

阶段B: indexSearchParameterBundle（必须在阶段A之后）
  ↓ 副作用③: indexSearchParameter
       → 向 globalSchema 中已有的资源类型条目追加搜索参数
       → 若资源类型不存在（理论上不应发生），getOrInitTypeSchema 会创建
```

**为什么顺序重要**：阶段B的 `indexSearchParameter` 调用 `getOrInitTypeSchema`，若资源类型在阶段A未被初始化，会创建一个**没有通用搜索参数**的空条目，导致 `_id`、`_lastUpdated` 等通用参数缺失。

---

## 7. 数据流图

```
FHIR 规范 JSON 文件（@medplum/definitions）
    │
    ├── profiles-types.json      ──┐
    ├── profiles-resources.json  ──┤→ indexStructureDefinitionBundle()
    └── profiles-medplum.json    ──┘
                │
                ├──→ [DATA_TYPES]
                │      Record<typeName, InternalTypeSchema>
                │      用途：验证、FHIRPath、子集化
                │
                └──→ [globalSchema.types] (部分，仅资源类型 + 7个通用参数)
                       Record<resourceType, TypeInfo>

    ├── search-parameters.json         ──┐
    ├── search-parameters-medplum.json ──┤→ indexSearchParameterBundle()
    └── search-parameters-uscore.json  ──┘
                │
                └──→ [globalSchema.types] (追加资源特定搜索参数)
                       Record<resourceType, { searchParams: Record<code, SearchParameter> }>
```

---

## 8. globalSchema 的使用者

| 功能 | 调用函数 | 用途 |
|------|----------|------|
| 搜索查询解析 | `getSearchParameters(resourceType)` | 获取所有可用搜索参数 |
| 搜索参数查找 | `getSearchParameter(resourceType, code)` | 获取单个搜索参数 |
| SQL 搜索生成 | `server/src/fhir/search.ts` | 将搜索参数转为 SQL WHERE 条件 |
| 搜索参数详情 | `getSearchParameterDetails()` | 获取参数的列类型、JOIN 信息 |
| 客户端搜索 | `core/src/search/` | 搜索 URL 解析与验证 |

---

## 9. 与 WF-GEN-001 的对比

| 维度 | WF-GEN-001 | WF-SERVER-001 |
|------|-----------|---------------|
| 调用 `indexStructureDefinitionBundle` | ✅ | ✅ |
| 填充 `DATA_TYPES` | ✅ | ✅ |
| 调用 `indexSearchParameterBundle` | ❌ | ✅ |
| 填充 `globalSchema` | ❌ | ✅ |
| 生成 `.d.ts` 文件 | ✅ | ❌ |
| 生成 `base-schema.json` | ✅ | ❌ |

**结论**：服务器运行时比代码生成阶段多了一个关键步骤——搜索参数索引（`globalSchema`）。这是服务器能够处理 FHIR 搜索请求的基础。

---

## 10. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 是否需要 `globalSchema`？ | 模块级全局单例 | 若需要 FHIR 搜索功能，必须实现等价的搜索参数注册表 |
| 搜索参数来源？ | `@medplum/definitions` 中的 JSON 文件 | 可直接复用这些 JSON 文件 |
| 初始化时机？ | 服务器启动时一次性加载 | 建议同样在应用启动时加载，避免首次请求延迟 |
| 通用搜索参数（`_id` 等）？ | 硬编码在 `getOrInitTypeSchema()` 中 | 可直接复用此逻辑，或将通用参数提取为常量配置 |
| 是否需要 US Core 搜索参数？ | 可选（`search-parameters-uscore.json`） | 根据 medxai 是否需要 US Core 合规性决定 |
