# Module Summary: definitions

```yaml
package: "@medplum/definitions"
version: 5.0.13
path: packages/definitions/src/
analysis_date: 2026-02-21
analyst: fangjun
status: Complete
```

---

## 1. 这个模块解决什么问题？

`definitions` 是 Medplum 的**静态 FHIR 规范数据仓库**。它将 HL7 官方发布的 FHIR R4 规范 JSON 文件（StructureDefinition、ValueSet、SearchParameter 等）打包进 npm，让其他包在运行时可以直接读取这些规范数据，而不需要网络请求或外部文件系统依赖。

**没有这个模块**：`core` 的验证引擎无法加载 FHIR 类型定义，`generator` 无法生成 `fhirtypes`，`server` 无法索引搜索参数。

---

## 2. 对外 API（Public Interface）

入口文件：`src/index.ts`

| 名称 | 类型 | 用途 | 重要程度 |
|------|------|------|----------|
| `readJson(filename)` | function | 读取 definitions 包内的 FHIR JSON 数据文件 | **High** |
| `getDataDir()` | function | 定位数据目录（兼容 CJS/ESM/多版本路径） | **Med** |
| `SEARCH_PARAMETER_BUNDLE_FILES` | const string[] | 所有搜索参数 Bundle 文件路径列表 | **High** |

---

## 3. 内部核心结构

### 数据文件清单（`src/fhir/r4/`）

```
src/fhir/r4/
├── profiles-types.json          ← FHIR 基础数据类型 StructureDefinition (string, integer, HumanName 等)
├── profiles-resources.json      ← FHIR 资源 StructureDefinition (Patient, Observation 等)
├── profiles-medplum.json        ← Medplum 自定义资源 StructureDefinition (Bot, Project 等)
├── search-parameters.json       ← FHIR R4 标准搜索参数
├── search-parameters-medplum.json ← Medplum 自定义搜索参数
├── search-parameters-uscore.json  ← US Core 搜索参数
├── valuesets.json               ← FHIR R4 值集定义
├── valuesets-medplum.json       ← Medplum 自定义值集
├── valuesets-medplum-generated.json ← 生成的值集
├── v2-tables.json               ← HL7 v2 表格
├── v3-codesystems.json          ← HL7 v3 代码系统
└── ... (约 21 个文件)
```

### `readJson()` 实现

```ts
// 核心逻辑：同步读取 JSON 文件
export function readJson(filename: string): any {
  const filenamePath = resolve(getDataDir(), filename);
  return JSON.parse(readFileSync(filenamePath, 'utf8'));
}
```

### `getDataDir()` 路径解析策略

```
尝试以下相对路径（兼容不同构建输出结构）：
  './'      → dist/fhir/       (v4 及更早)
  '../'     → dist/../fhir/    (v5.0.0 CJS/ESM 子目录)
  './cjs/'  → dist/cjs/fhir/
  './esm/'  → dist/esm/fhir/
第一个存在 fhir/ 子目录的路径胜出，并缓存结果
```

### 数据流

```
调用方 (core/typeschema, generator, server)
  ↓ readJson('fhir/r4/profiles-resources.json')
getDataDir()  ← 缓存路径解析
  ↓
readFileSync(path, 'utf8')
  ↓
JSON.parse()
  ↓
Bundle (含 StructureDefinition[] / SearchParameter[] / ValueSet[])
```

---

## 4. 与其他模块的交互

### 依赖（import from）

| 模块 | 用途 |
|------|------|
| Node.js `fs` | `readFileSync`, `existsSync` |
| Node.js `path` | `resolve`, `dirname` |
| Node.js `url` | `fileURLToPath`（ESM 兼容） |

### 被依赖（被谁 import）

| 上游模块 | 使用方式 |
|----------|----------|
| `@medplum/core` | `indexStructureDefinitionBundle(readJson(...))` 加载类型定义 |
| `@medplum/generator` | 生成 fhirtypes 时读取所有规范数据 |
| `@medplum/server` | 启动时加载搜索参数、StructureDefinition |

---

## 5. 是否可被独立抽离？

- **可抽离性**: **High**（5/5）
- **理由**: 纯数据包 + 简单文件读取，无业务逻辑。
- **抽离最小依赖集**: 仅 Node.js 内置模块。
- **medxai 策略**: 直接复用此包，或将 JSON 文件嵌入 medxai 的数据目录。

---

## 6. 核心算法标记

无算法。纯数据存储 + 文件读取。

---

## 7. 关键设计模式

- **Data Package Pattern**: 将静态数据（FHIR 规范 JSON）打包为 npm 包，通过 API 访问，避免硬编码路径。
- **Lazy Caching**: `getDataDir()` 首次调用后缓存结果，避免重复文件系统探测。
- **Path Resolution Strategy**: 按优先级尝试多个相对路径，兼容不同构建输出结构（CJS/ESM）。
