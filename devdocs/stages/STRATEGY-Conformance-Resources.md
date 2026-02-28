# 策略分析：Conformance Resources（CodeSystem / ValueSet / StructureDefinition）

> 状态：✅ Phase T0 + T1 已完成
> 日期：2026-02-28
> 关联：Phase P1 前置设计决策

---

## 0. 问题总览

在进入 Platform 前端开发之前，需要明确以下 6 个核心问题：

| #   | 问题                                     | 简述                                             |
| --- | ---------------------------------------- | ------------------------------------------------ |
| Q1  | FHIR R4 核心 CodeSystem/ValueSet 策略    | 是否写入数据库？                                 |
| Q2  | Server 端如何调用/读取                   | 术语操作的数据源                                 |
| Q3  | Client 端如何设计                        | 前端如何获取术语数据                             |
| Q4  | 自定义 CodeSystem/ValueSet 加载机制      | 类似 StructureDefinition 的 spec/platform 模式？ |
| Q5  | 多语言支持                               | CodeSystem/ValueSet 的 designation               |
| Q6  | StructureDefinition 是否也需要存入数据库 | 前端表单生成的需求                               |

---

## 1. Medplum 的做法（参考分析）

### 1.1 数据存储策略

Medplum 采用**双层架构**：

```
Layer A: 静态规范文件（@medplum/definitions 包）
  ├── profiles-types.json           → StructureDefinition（类型）
  ├── profiles-resources.json       → StructureDefinition（资源）
  ├── profiles-medplum.json         → StructureDefinition（自定义）
  ├── valuesets.json                → FHIR R4 核心 ValueSet
  ├── valuesets-medplum.json        → Medplum 自定义 ValueSet
  ├── v2-tables.json                → HL7 v2 表格
  ├── v3-codesystems.json           → HL7 v3 CodeSystem
  └── search-parameters*.json       → SearchParameter

Layer B: 数据库（PostgreSQL）
  ├── CodeSystem 表                 → 用户创建的 CodeSystem
  ├── ValueSet 表                   → 用户创建的 ValueSet
  └── StructureDefinition 表       → 用户创建的 StructureDefinition / Profile
```

**关键点**：

- **FHIR R4 核心 ValueSet/CodeSystem 不存入数据库** — 它们是静态规范数据，通过 `readJson()` 在启动时加载到内存
- **用户自定义的 CodeSystem/ValueSet 存入数据库** — 通过标准 FHIR CRUD 管理
- **术语操作（$expand, $lookup, $validate-code）同时查两层** — 先查数据库，再查静态数据
- **StructureDefinition 同理** — 核心 R4 定义是静态的，用户 Profile 存数据库
- **Admin 有 `POST /admin/super/valuesets` 和 `POST /admin/super/structuredefinitions`** — 用于将静态文件重新导入数据库（rebuild）

### 1.2 术语操作路由

| 端点                                  | Medplum         | MedXAI 现状              |
| ------------------------------------- | --------------- | ------------------------ |
| `ValueSet/$expand`                    | ✅ 查 DB + 静态 | ✅ 仅查 DB               |
| `ValueSet/$validate-code`             | ✅              | ⚠️ 通过 $expand 间接实现 |
| `CodeSystem/$lookup`                  | ✅              | ✅ 仅查 DB               |
| `CodeSystem/$validate-code`           | ✅              | ✅ 仅查 DB               |
| `CodeSystem/$subsumes`                | ✅              | ❌ 未实现                |
| `CodeSystem/$import`                  | ✅              | ❌ 未实现                |
| `ConceptMap/$translate`               | ✅              | ❌ 未实现                |
| `StructureDefinition/$expand-profile` | ✅              | ❌ 未实现                |

### 1.3 客户端访问

Medplum 客户端通过标准 FHIR CRUD + search 访问：

```ts
// 读取 ValueSet
const vs = await medplum.readResource("ValueSet", id);

// $expand
const expanded = await medplum.searchOne("ValueSet", { url: "http://..." });

// 获取 StructureDefinition（用于表单渲染）
const sd = await medplum.searchOne("StructureDefinition", { type: "Patient" });
```

客户端**不嵌入静态规范数据** — 全部通过 HTTP API 按需获取。

---

## 2. MedXAI 现状分析

### 2.1 已有的部分

| 组件                               | 状态        | 说明                                               |
| ---------------------------------- | ----------- | -------------------------------------------------- |
| `TerminologyService`               | ✅ 已实现   | $expand, $validate-code, $lookup — 但仅查 DB       |
| `terminology-routes.ts`            | ✅ 已实现   | 6 个路由端点                                       |
| `spec/fhir/r4/valuesets.json`      | ✅ 已有文件 | FHIR R4 核心 ValueSet（未加载到 DB）               |
| `spec/fhir/r4/v3-codesystems.json` | ✅ 已有文件 | HL7 v3 CodeSystem（未加载到 DB）                   |
| `spec/fhir/r4/v2-tables.json`      | ✅ 已有文件 | HL7 v2 表格（未加载到 DB）                         |
| `spec/platform/`                   | ✅ 已有目录 | 自定义 StructureDefinition + SearchParameter       |
| `BundleLoader`                     | ✅ 已实现   | 加载 StructureDefinition Bundle → CanonicalProfile |
| `fhir-core/context/`               | ✅ 已实现   | 73 个核心定义 JSON 文件（内存中）                  |
| `fhir-client` 术语方法             | ❌ 缺失     | 无 $expand / $lookup / $validate-code 便利方法     |

### 2.2 缺失的部分

1. **核心 ValueSet/CodeSystem 未加载到数据库** — TerminologyService 只能查到用户手动创建的
2. **fhir-client 缺少术语便利方法** — 前端无法方便地调用 $expand
3. **StructureDefinition 无 HTTP 按需查询** — 前端生成表单时无法获取结构
4. **无种子数据加载机制** — 启动时不会将 R4 核心术语资源写入 DB

---

## 3. 推荐策略（逐问回答）

### Q1: FHIR R4 核心 CodeSystem/ValueSet — 是否写入数据库？

**推荐：✅ 写入数据库**

理由：

1. **TerminologyService 已经通过 `repo.searchResources()` 查询** — 如果不在 DB 中，$expand 找不到 R4 核心 ValueSet
2. **统一查询路径** — 不需要维护"先查 DB，再查静态文件"的双层逻辑
3. **FHIR CRUD 一致性** — `GET /ValueSet?url=http://hl7.org/fhir/ValueSet/...` 直接可用
4. **前端只需一个 API** — 不区分"核心" vs "自定义"

**实现方式**：

```
服务器启动 / 数据库初始化时：
  1. 读取 spec/fhir/r4/valuesets.json（~2000+ ValueSet）
  2. 读取 spec/fhir/r4/v3-codesystems.json（~400+ CodeSystem）
  3. 读取 spec/fhir/r4/v2-tables.json
  4. 通过 repo.createResource() 或批量 INSERT 写入数据库
  5. 使用 upsert 语义 — 已存在则跳过（幂等）
```

**注意**：R4 核心 ValueSet 约 2000+，完整 CodeSystem 数据量较大。可以采用以下策略：

- **Phase 1**：只加载常用子集（~200 个高频 ValueSet + 对应 CodeSystem）
- **Phase 2**：全量加载（可配置）
- 或者标记为 `_source: "hl7.org"` 以区分核心 vs 用户自定义

### Q2: Server 端调用/读取设计

**现有 `TerminologyService` 已经是正确架构** — 它通过 `repo` 读取，只需确保数据在 DB 中即可。

需要新增的：

1. **种子加载函数** `seedTerminologyResources(repo, options)` — 在 DB init 时调用
2. **可选：内存缓存层** — 对高频 ValueSet（如 AdministrativeGender）做 LRU 缓存，避免每次 $expand 都查 DB

```ts
// 新增：packages/fhir-server/src/terminology/seed.ts
export async function seedTerminologyResources(
  repo: ResourceRepository,
  options?: {
    valueSetsPath?: string;
    codeSystemsPath?: string;
    skipIfExists?: boolean;
  },
): Promise<SeedResult>;
```

### Q3: Client 端设计

在 `MedXAIClient` 中新增术语便利方法：

```ts
// 术语操作
async expandValueSet(params: { url?: string; id?: string; filter?: string }): Promise<ValueSet>
async lookupCode(params: { system: string; code: string }): Promise<Parameters>
async validateCode(params: { url?: string; system?: string; code: string }): Promise<Parameters>

// 结构定义（表单生成用）
async getStructureDefinition(type: string): Promise<StructureDefinition>
async getProfileElements(type: string): Promise<ElementDefinition[]>
```

**前端表单生成流程**：

```
Platform UI 组件 → client.getStructureDefinition('Patient')
                → GET /StructureDefinition?type=Patient&_count=1
                → 服务器返回 StructureDefinition JSON
                → 前端解析 element[] 生成表单字段
                → 对 CodeableConcept 字段调用 client.expandValueSet({ url: binding.valueSet })
                → 渲染下拉选择器
```

### Q4: 自定义 CodeSystem/ValueSet 加载

**推荐：✅ 与 StructureDefinition 相同的 `spec/platform/` 模式**

```
spec/platform/
  ├── profiles-medxai.json              ← 自定义 StructureDefinition（已有）
  ├── search-parameters-medxai.json     ← 自定义 SearchParameter（已有）
  ├── valuesets-medxai.json             ← 新增：自定义 ValueSet Bundle
  └── codesystems-medxai.json           ← 新增：自定义 CodeSystem Bundle
```

加载顺序（服务器启动时）：

```
1. spec/fhir/r4/valuesets.json          → R4 核心 ValueSet
2. spec/fhir/r4/v3-codesystems.json     → HL7 v3 CodeSystem
3. spec/platform/valuesets-medxai.json   → MedXAI 自定义 ValueSet
4. spec/platform/codesystems-medxai.json → MedXAI 自定义 CodeSystem
```

后加载的会覆盖同 `url` 的早期版本 — 与 StructureDefinition 的 `loadBundlesFromFiles` 逻辑一致。

### Q5: 多语言支持

**FHIR 原生支持多语言** — 通过 `designation` 机制：

```json
{
  "resourceType": "CodeSystem",
  "concept": [
    {
      "code": "male",
      "display": "Male",
      "designation": [
        { "language": "zh-CN", "value": "男" },
        { "language": "ja", "value": "男性" }
      ]
    }
  ]
}
```

**ValueSet $expand 也支持 `displayLanguage` 参数**：

```
GET /ValueSet/$expand?url=http://...&displayLanguage=zh-CN
```

**MedXAI 实现建议**：

1. **数据层**：CodeSystem/ValueSet 的 `designation` 字段自然存储在 JSON `content` 列中 — **无需额外 schema**
2. **$expand 增强**：在 `TerminologyService.expandValueSet()` 中增加 `displayLanguage` 参数过滤
3. **自定义翻译**：在 `spec/platform/codesystems-medxai.json` 中为常用码表添加中文 `designation`
4. **Phase L（中文本地化）** 时集中处理 — 当前阶段只需确保数据结构支持

**注意**：FHIR R4 核心 ValueSet/CodeSystem 本身**不包含中文翻译** — 需要 MedXAI 自行添加 designation 或使用覆盖机制。

### Q6: StructureDefinition 是否存入数据库？

**推荐：✅ 必须存入数据库**

理由：

1. **前端表单生成** — 浏览器无法加载全部 256 个 StructureDefinition（几十 MB），必须按需通过 API 获取
2. **自定义 Profile** — 用户或管理员可能创建自定义 Profile（约束子集），需要通过 FHIR CRUD 管理
3. **$validate 操作** — 服务器端验证需要读取 StructureDefinition，DB 查询更高效
4. **一致的 FHIR 语义** — `GET /StructureDefinition?type=Patient` 应该返回结果

**加载方式**：与 ValueSet 相同，在 DB 初始化时批量导入：

```
spec/fhir/r4/profiles-types.json      → 基础类型 StructureDefinition
spec/fhir/r4/profiles-resources.json   → 资源 StructureDefinition
spec/platform/profiles-medxai.json     → MedXAI 自定义
```

**服务器端仍然保留内存 Registry**：

```
内存 Registry（启动时加载，用于验证/搜索参数解析）
   ↕ 同步
数据库（持久化，用于 FHIR CRUD API 访问）
```

---

## 4. 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     FHIR R4 规范文件                          │
│  spec/fhir/r4/                                              │
│  ├── profiles-types.json        (StructureDefinition)       │
│  ├── profiles-resources.json    (StructureDefinition)       │
│  ├── valuesets.json             (ValueSet)                  │
│  ├── v3-codesystems.json        (CodeSystem)                │
│  └── v2-tables.json             (CodeSystem)                │
├─────────────────────────────────────────────────────────────┤
│                     MedXAI 自定义                            │
│  spec/platform/                                             │
│  ├── profiles-medxai.json       (StructureDefinition)       │
│  ├── valuesets-medxai.json      (ValueSet)         ← 新增   │
│  ├── codesystems-medxai.json    (CodeSystem)       ← 新增   │
│  └── search-parameters-medxai.json (SearchParameter)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
              DB Init / Seed（服务器启动时）
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 数据库                          │
│                                                             │
│  CodeSystem 表    ← R4 核心 + 自定义 + 用户创建              │
│  ValueSet 表      ← R4 核心 + 自定义 + 用户创建              │
│  StructureDefinition 表 ← R4 核心 + 自定义 + 用户创建       │
│  SearchParameter 表（已有）                                  │
│  ... 其他 FHIR 资源表                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
              FHIR REST API（已有）
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    fhir-server                               │
│                                                             │
│  标准 CRUD:                                                  │
│    GET /CodeSystem/:id                                      │
│    GET /ValueSet?url=...                                    │
│    GET /StructureDefinition?type=Patient                    │
│                                                             │
│  术语操作（已有，自动受益于 DB 数据）:                          │
│    POST /ValueSet/$expand                                   │
│    POST /CodeSystem/$lookup                                 │
│    POST /CodeSystem/$validate-code                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
              fhir-client SDK
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Platform 前端                              │
│                                                             │
│  表单生成:                                                   │
│    client.readResource('StructureDefinition', id)           │
│    → 解析 element[] → 生成表单字段                            │
│                                                             │
│  下拉选择器:                                                  │
│    client.expandValueSet({ url: binding })                  │
│    → 获取 Coding[] → 渲染 <Select>                           │
│                                                             │
│  术语验证:                                                   │
│    client.validateCode({ system, code })                    │
│    → 输入验证 + 实时提示                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 实现路径（建议）

### Phase T0: 种子数据加载（在 Platform 前完成）

| #    | 任务                                                   | 说明                                               | 预计工时 |
| ---- | ------------------------------------------------------ | -------------------------------------------------- | -------- |
| T0.1 | 创建 `seedConformanceResources()`                      | 加载 ValueSet/CodeSystem/StructureDefinition 到 DB | 1d       |
| T0.2 | 在 DB init 脚本中调用 seed                             | `--seed-conformance` 选项                          | 0.5d     |
| T0.3 | 创建 `spec/platform/valuesets-medxai.json` 空 Bundle   | 自定义 ValueSet 的占位                             | 0.5h     |
| T0.4 | 创建 `spec/platform/codesystems-medxai.json` 空 Bundle | 自定义 CodeSystem 的占位                           | 0.5h     |
| T0.5 | fhir-client 添加术语方法                               | expandValueSet, lookupCode, validateCode           | 0.5d     |
| T0.6 | fhir-client 添加 SD 便利方法                           | getStructureDefinition                             | 0.5h     |
| T0.7 | 测试                                                   | 种子加载 + 术语查询 E2E                            | 1d       |

**总计：~3-4 天**

### Phase T1: $expand 增强（可与 Platform 并行）

| #    | 任务                                   | 说明                           |
| ---- | -------------------------------------- | ------------------------------ |
| T1.1 | `displayLanguage` 支持                 | $expand 按语言过滤 designation |
| T1.2 | ValueSet `compose.include` filter 支持 | 正则/前缀匹配                  |
| T1.3 | CodeSystem `$subsumes` 实现            | 层级关系判断                   |

### Phase T2: 中文术语（Phase L 的子任务）

| #    | 任务                             | 说明                               |
| ---- | -------------------------------- | ---------------------------------- |
| T2.1 | 常用 CodeSystem 中文 designation | gender, maritalStatus, language 等 |
| T2.2 | 自定义 ValueSet 中文翻译         | MedXAI 特有                        |

---

## 6. 数据量评估

| 资源类型                         | R4 核心数量 | 单条平均大小 | 总计       |
| -------------------------------- | ----------- | ------------ | ---------- |
| ValueSet                         | ~2,700      | ~5KB         | ~13.5 MB   |
| CodeSystem（v3）                 | ~400        | ~10KB        | ~4 MB      |
| CodeSystem（v2 tables）          | ~200        | ~15KB        | ~3 MB      |
| StructureDefinition（types）     | ~63         | ~20KB        | ~1.3 MB    |
| StructureDefinition（resources） | ~149        | ~50KB        | ~7.5 MB    |
| StructureDefinition（others）    | ~44         | ~20KB        | ~0.9 MB    |
| **总计**                         | **~3,556**  | —            | **~30 MB** |

这个数据量对 PostgreSQL 完全不成问题。初始导入约需 30-60 秒。

---

## 7. 决策点（已确认 2026-02-28）

| #    | 问题                                     | 决策                           | 状态      |
| ---- | ---------------------------------------- | ------------------------------ | --------- |
| T-D1 | R4 核心 ValueSet/CodeSystem 是否全量导入 | 全量                           | ✅ 已确认 |
| T-D2 | StructureDefinition 是否全量导入         | 全量                           | ✅ 已确认 |
| T-D3 | 种子加载时机                             | DB init (`--seed-conformance`) | ✅ 已确认 |
| T-D4 | 是否需要 `$import` 操作                  | Phase T1 延后                  | ✅ 已确认 |
| T-D5 | 是否需要 `ConceptMap/$translate`         | Phase T1 延后                  | ✅ 已确认 |
| T-D6 | Phase T0 在 P1 前还是与 P1 并行          | **P1 前**                      | ✅ 已确认 |

---

## 8. 执行结果（2026-02-28 完成）

| 项目                            | 状态 | 结果                                                                                            |
| ------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| T0.1 seedConformanceResources() | ✅   | `fhir-server/src/terminology/seed-conformance.ts` — 290 行，支持 upsert/dedup/progress          |
| T0.2 导出集成                   | ✅   | `fhir-server/src/index.ts` 新增 TerminologyService + seed 导出                                  |
| T0.3 valuesets-medxai.json      | ✅   | `spec/platform/valuesets-medxai.json` 空 Bundle 占位                                            |
| T0.4 codesystems-medxai.json    | ✅   | `spec/platform/codesystems-medxai.json` 空 Bundle 占位                                          |
| T0.5 fhir-client 术语方法       | ✅   | `expandValueSet()`, `lookupCode()`, `validateCode()` — 支持 GET/POST 两种模式                   |
| T0.6 fhir-client SD 便利方法    | ✅   | `getStructureDefinition()`, `getStructureDefinitionByUrl()`, `getValueSet()`, `getCodeSystem()` |
| T0.7 测试                       | ✅   | 17 server + 12 client = **29 新增测试**，全部通过                                               |
| T1.1 displayLanguage            | ✅   | `resolveDisplay()` — 支持 exact match + prefix match (zh → zh-CN)                               |
| T1.2 compose.include filter     | ✅   | `applyIncludeFilters()` — 支持 =, in, not-in, regex, is-a                                       |
| T1.3 $subsumes                  | ✅   | `subsumes()` + `subsumesById()` + 2 routes (POST + GET)                                         |
| tsc --noEmit                    | ✅   | fhir-server + fhir-client 均 clean                                                              |
| 全量回归                        | ✅   | server 404/404, client 93/93, persistence 960/961 (1 pre-existing timeout)                      |

### 新增文件 (5)

- `packages/fhir-server/src/terminology/seed-conformance.ts`
- `packages/fhir-server/src/__tests__/t0-terminology.test.ts`
- `packages/fhir-client/src/__tests__/terminology-methods.test.ts`
- `spec/platform/valuesets-medxai.json`
- `spec/platform/codesystems-medxai.json`

### 修改文件 (4)

- `packages/fhir-server/src/index.ts` — 新增 terminology 导出
- `packages/fhir-server/src/terminology/terminology-service.ts` — T1.1/T1.2/T1.3 增强
- `packages/fhir-server/src/terminology/terminology-routes.ts` — $subsumes 路由 + extractExpandOptions
- `packages/fhir-client/src/client.ts` — 术语 + 合规性便利方法

### 测试总计

| 包               | 测试文件 | 测试数   | 结果                                 |
| ---------------- | -------- | -------- | ------------------------------------ |
| fhir-server      | 20       | 404      | ✅ 全通过                            |
| fhir-client      | 5        | 93       | ✅ 全通过                            |
| fhir-persistence | 37       | 961      | ✅ 960 通过 / 1 pre-existing timeout |
| **总计**         | **62**   | **1458** | **✅**                               |
