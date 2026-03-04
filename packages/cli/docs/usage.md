# @medxai/cli 使用指南

## 概述

`@medxai/cli` 是 MedXAI FHIR 引擎的命令行工具，提供 FHIR R4 资源的解析、验证、快照生成和 FHIRPath 表达式求值功能。

## 安装

### 全局安装

```bash
npm install -g @medxai/cli
```

### 使用 npx（无需安装）

```bash
npx @medxai/cli --help
```

### 本地开发环境

在 monorepo 中：

```bash
# 方式 1: 使用 tsx 直接运行源码
npx tsx packages/cli/src/bin/medxai.ts --help

# 方式 2: 构建后使用 node 运行
npm run build --workspace=packages/cli
node packages/cli/dist/bin/medxai.mjs --help

# 方式 3: 使用 npm link（推荐用于频繁测试）
cd packages/cli
npm link
medxai --help
```

## 命令详解

### 1. parse - 解析 FHIR 资源

解析 FHIR R4 JSON 文件并报告其结构。

**语法：**
```bash
medxai parse <file> [options]
```

**选项：**
- `--json` - 输出机器可读的 JSON 格式
- `--pretty` - 美化打印解析后的资源
- `--silent` - 静默模式，仅返回退出码

**示例：**

```bash
# 基本用法
medxai parse Patient.json

# JSON 输出
medxai parse Patient.json --json

# 美化输出
medxai parse Patient.json --pretty

# 静默模式（用于脚本）
medxai parse Patient.json --silent
echo $?  # 检查退出码
```

**输出示例：**

```
✓ Valid FHIR R4 resource
  Type:  Patient
  Id:  example
  Issues:  0 errors, 2 warnings

  WARN  Patient.text  Unknown property "text"
  WARN  Patient.identifier  Unknown property "identifier"
```

**JSON 输出格式：**

```json
{
  "success": true,
  "resourceType": "Patient",
  "id": "example",
  "issues": [
    {
      "severity": "warning",
      "code": "UNEXPECTED_PROPERTY",
      "message": "Unknown property \"text\"",
      "path": "Patient.text"
    }
  ]
}
```

### 2. validate - 验证资源

根据 FHIR 配置文件验证资源的结构完整性。

**语法：**
```bash
medxai validate <resource.json> [options]
```

**选项：**
- `--profile <url|file>` - 指定验证配置文件（URL 或本地文件）
- `--core <dir>` - FHIR R4 核心定义目录（必需）
- `--json` - 输出 JSON 格式

**示例：**

```bash
# 使用核心 Patient 配置文件验证
medxai validate Patient.json --core spec/fhir/r4

# 使用自定义配置文件
medxai validate Patient.json \
  --profile us-core-patient.json \
  --core spec/fhir/r4

# JSON 输出
medxai validate Patient.json --core spec/fhir/r4 --json
```

**输出示例：**

```
✓ Validation passed
  Profile:  http://hl7.org/fhir/StructureDefinition/Patient
  Valid:  true
  Issues:  0 errors, 0 warnings
```

**JSON 输出格式：**

```json
{
  "valid": true,
  "profileUrl": "http://hl7.org/fhir/StructureDefinition/Patient",
  "issues": []
}
```

### 3. evaluate - FHIRPath 表达式求值

对 FHIR 资源执行 FHIRPath 表达式。

**语法：**
```bash
medxai evaluate <expression> <resource.json> [options]
```

**选项：**
- `--boolean` - 将结果作为布尔值返回
- `--json` - 输出 JSON 格式

**示例：**

```bash
# 提取患者姓氏
medxai evaluate "Patient.name.family" Patient.json

# 布尔表达式
medxai evaluate "Patient.name.exists()" Patient.json --boolean

# 复杂表达式
medxai evaluate "Observation.value.ofType(Quantity).value" Observation.json

# JSON 输出
medxai evaluate "Patient.gender" Patient.json --json
```

**输出示例：**

```
✓ FHIRPath evaluated
  Expression:  Patient.name.family
  Result:  ["Smith","Johnson"]
  Type:  string[]
  Count:  2
```

**JSON 输出格式：**

```json
{
  "expression": "Patient.name.family",
  "results": ["Smith", "Johnson"],
  "count": 2,
  "type": "string"
}
```

**布尔模式输出：**

```json
{
  "expression": "Patient.name.exists()",
  "result": true,
  "type": "boolean"
}
```

### 4. snapshot - 生成快照

为 StructureDefinition 生成完整的快照（snapshot）。

**语法：**
```bash
medxai snapshot <structureDefinition.json> [options]
```

**选项：**
- `--output <file>` - 保存快照到文件
- `--core <dir>` - FHIR R4 核心定义目录（必需）
- `--json` - 输出 JSON 格式

**示例：**

```bash
# 生成快照
medxai snapshot us-core-patient.json --core spec/fhir/r4

# 保存到文件
medxai snapshot us-core-patient.json \
  --output snapshot.json \
  --core spec/fhir/r4

# JSON 输出
medxai snapshot us-core-patient.json --core spec/fhir/r4 --json
```

**输出示例：**

```
✓ Snapshot generated
  Profile:  USCorePatientProfile
  Base:  http://hl7.org/fhir/StructureDefinition/Patient
  Elements:  86
  Issues:  0 errors, 0 warnings
  Output:  /path/to/snapshot.json
```

**JSON 输出格式：**

```json
{
  "success": true,
  "profile": "USCorePatientProfile",
  "base": "http://hl7.org/fhir/StructureDefinition/Patient",
  "elementCount": 86,
  "issues": [],
  "outputFile": "/path/to/snapshot.json"
}
```

### 5. capabilities - 引擎能力

显示 FHIR 引擎的能力摘要。

**语法：**
```bash
medxai capabilities [options]
```

**选项：**
- `--json` - 输出 JSON 格式

**示例：**

```bash
# 人类可读格式
medxai capabilities

# JSON 格式
medxai capabilities --json
```

**输出示例：**

```
@medxai/fhir-core v0.1.0
  FHIR Version:  R4 (4.0.1)

  Modules:
    parsing        ✓ supported
    context        ✓ supported (73 core definitions)
    snapshot       ✓ supported (HAPI-equivalent)
    validation     ✓ supported (9 structural rules)
    fhirpath       ✓ supported (60+ functions)
    terminology    ✗ not supported
    search         ✗ not supported
```

**JSON 输出格式：**

```json
{
  "engineVersion": "0.1.0",
  "fhirVersion": "R4 (4.0.1)",
  "modules": {
    "parsing": true,
    "context": true,
    "snapshot": true,
    "validation": true,
    "fhirpath": true,
    "terminology": false,
    "search": false
  }
}
```

## 退出码

CLI 使用标准化的退出码来指示执行结果：

| 退出码 | 含义 | 说明 |
|--------|------|------|
| 0 | 成功 | 命令执行成功 |
| 1 | FHIR 错误 | 验证失败、解析错误等 FHIR 相关错误 |
| 2 | 使用错误 | 缺少参数、未知命令等 CLI 使用错误 |
| 3 | 引擎崩溃 | 意外的内部错误 |

**在脚本中使用退出码：**

```bash
#!/bin/bash

# 验证资源
medxai validate Patient.json --core spec/fhir/r4

if [ $? -eq 0 ]; then
  echo "验证成功"
elif [ $? -eq 1 ]; then
  echo "验证失败"
  exit 1
elif [ $? -eq 2 ]; then
  echo "命令使用错误"
  exit 2
else
  echo "引擎错误"
  exit 3
fi
```

## 常见用例

### 批量验证资源

```bash
#!/bin/bash
for file in resources/*.json; do
  echo "验证: $file"
  medxai validate "$file" --core spec/fhir/r4 --silent
  if [ $? -ne 0 ]; then
    echo "✗ 失败: $file"
  else
    echo "✓ 成功: $file"
  fi
done
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Validate FHIR Resources
  run: |
    npm install -g @medxai/cli
    medxai validate resources/Patient.json --core spec/fhir/r4
```

### 提取数据用于分析

```bash
# 提取所有患者的性别
for file in patients/*.json; do
  medxai evaluate "Patient.gender" "$file" --json | jq -r '.results[0]'
done
```

### 生成配置文件快照

```bash
# 为所有 US Core 配置文件生成快照
for sd in profiles/StructureDefinition-*.json; do
  output="snapshots/$(basename "$sd")"
  medxai snapshot "$sd" --output "$output" --core spec/fhir/r4
done
```

## 故障排除

### 找不到核心定义

**错误：**
```
Error: Profile not found: http://hl7.org/fhir/StructureDefinition/Patient
```

**解决方案：**
确保使用 `--core` 选项指定 FHIR R4 核心定义目录，该目录应包含 `profiles-resources.json` 和 `profiles-types.json`。

### 解析错误

**错误：**
```
Error: Unexpected token in JSON
```

**解决方案：**
确保 JSON 文件格式正确。可以使用 `jq` 或其他工具验证 JSON 语法：

```bash
jq . Patient.json > /dev/null && echo "JSON 有效"
```

### 内存不足

对于大型资源或批量操作，可能需要增加 Node.js 内存限制：

```bash
NODE_OPTIONS="--max-old-space-size=4096" medxai validate large-bundle.json --core spec/fhir/r4
```

## 性能提示

1. **缓存核心定义**：`--core` 目录在每次命令执行时都会加载，建议使用本地缓存的副本
2. **批量操作**：对于大量文件，考虑编写脚本并行处理
3. **JSON 输出**：使用 `--json` 选项可以更快地处理输出（无需格式化）
4. **静默模式**：在脚本中使用 `--silent` 可以减少输出开销

## 限制

当前版本（v0.1.0）的已知限制：

1. **不支持术语服务**：无法验证 CodeSystem/ValueSet 绑定
2. **不支持搜索**：无法执行 FHIR 搜索操作
3. **结构验证**：仅执行结构验证，不包括业务规则验证
4. **本地文件**：所有操作都基于本地文件，不支持网络资源

## 更多资源

- [GitHub 仓库](https://github.com/medxaidev/medxai)
- [问题追踪](https://github.com/medxaidev/medxai/issues)
- [FHIR R4 规范](https://hl7.org/fhir/R4/)
- [FHIRPath 规范](https://hl7.org/fhirpath/)
