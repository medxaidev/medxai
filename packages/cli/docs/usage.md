# @medxai/cli Usage Guide

## Overview

`@medxai/cli` is a command-line interface for the MedXAI FHIR Engine, providing parsing, validation, snapshot generation, and FHIRPath expression evaluation for FHIR R4 resources.

## Installation

### Global Installation

```bash
npm install -g @medxai/cli
```

### Using npx (No Installation Required)

```bash
npx @medxai/cli --help
```

### Local Development Environment

Within the monorepo:

```bash
# Method 1: Run source code directly with tsx
npx tsx packages/cli/src/bin/medxai.ts --help

# Method 2: Build and run with node
npm run build --workspace=packages/cli
node packages/cli/dist/bin/medxai.mjs --help

# Method 3: Use npm link (recommended for frequent testing)
cd packages/cli
npm link
medxai --help
```

## Command Reference

### 1. parse - Parse FHIR Resources

Parse a FHIR R4 JSON file and report its structure.

**Syntax:**

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

### 2. validate - Validate Resources

Validate a FHIR resource's structural integrity against a profile.

**Syntax:**

```bash
medxai validate <resource.json> [options]
```

**Options:**

- `--profile <url|file>` - Profile to validate against (canonical URL or local file)
- `--core <dir>` - FHIR R4 core definitions directory (required)
- `--json` - JSON output format

**Examples:**

```bash
# Validate using core Patient profile
medxai validate Patient.json --core spec/fhir/r4

# Validate using custom profile
medxai validate Patient.json \
  --profile us-core-patient.json \
  --core spec/fhir/r4

# JSON output
medxai validate Patient.json --core spec/fhir/r4 --json
```

**Output Example:**

```
✓ Validation passed
  Profile:  http://hl7.org/fhir/StructureDefinition/Patient
  Valid:  true
  Issues:  0 errors, 0 warnings
```

**JSON Output Format:**

```json
{
  "valid": true,
  "profileUrl": "http://hl7.org/fhir/StructureDefinition/Patient",
  "issues": []
}
```

### 3. evaluate - Evaluate FHIRPath Expressions

Execute a FHIRPath expression against a FHIR resource.

**Syntax:**

```bash
medxai evaluate <expression> <resource.json> [options]
```

**Options:**

- `--boolean` - Return result as boolean value
- `--json` - JSON output format

**Examples:**

```bash
# Extract patient family name
medxai evaluate "Patient.name.family" Patient.json

# Boolean expression
medxai evaluate "Patient.name.exists()" Patient.json --boolean

# Complex expression
medxai evaluate "Observation.value.ofType(Quantity).value" Observation.json

# JSON output
medxai evaluate "Patient.gender" Patient.json --json
```

**Output Example:**

```
✓ FHIRPath evaluated
  Expression:  Patient.name.family
  Result:  ["Smith","Johnson"]
  Type:  string[]
  Count:  2
```

**JSON Output Format:**

```json
{
  "expression": "Patient.name.family",
  "results": ["Smith", "Johnson"],
  "count": 2,
  "type": "string"
}
```

**Boolean Mode Output:**

```json
{
  "expression": "Patient.name.exists()",
  "result": true,
  "type": "boolean"
}
```

### 4. snapshot - Generate Snapshots

Generate a complete snapshot for a StructureDefinition.

**Syntax:**

```bash
medxai snapshot <structureDefinition.json> [options]
```

**Options:**

- `--output <file>` - Save snapshot to file
- `--core <dir>` - FHIR R4 core definitions directory (required)
- `--json` - JSON output format

**Examples:**

```bash
# Generate snapshot
medxai snapshot us-core-patient.json --core spec/fhir/r4

# Save to file
medxai snapshot us-core-patient.json \
  --output snapshot.json \
  --core spec/fhir/r4

# JSON output
medxai snapshot us-core-patient.json --core spec/fhir/r4 --json
```

**Output Example:**

```
✓ Snapshot generated
  Profile:  USCorePatientProfile
  Base:  http://hl7.org/fhir/StructureDefinition/Patient
  Elements:  86
  Issues:  0 errors, 0 warnings
  Output:  /path/to/snapshot.json
```

**JSON Output Format:**

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

### 5. capabilities - Engine Capabilities

Display FHIR engine capability summary.

**Syntax:**

```bash
medxai capabilities [options]
```

**Options:**

- `--json` - JSON output format

**Examples:**

```bash
# Human-readable format
medxai capabilities

# JSON format
medxai capabilities --json
```

**Output Example:**

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

**JSON Output Format:**

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

## Exit Codes

The CLI uses standardized exit codes to indicate execution results:

| Code | Meaning      | Description                              |
| ---- | ------------ | ---------------------------------------- |
| 0    | Success      | Command executed successfully            |
| 1    | FHIR Error   | Validation failed, parse error, etc.     |
| 2    | Usage Error  | Missing arguments, unknown command, etc. |
| 3    | Engine Crash | Unexpected internal error                |

**Using Exit Codes in Scripts:**

```bash
#!/bin/bash

# Validate resource
medxai validate Patient.json --core spec/fhir/r4

if [ $? -eq 0 ]; then
  echo "Validation successful"
elif [ $? -eq 1 ]; then
  echo "Validation failed"
  exit 1
elif [ $? -eq 2 ]; then
  echo "Command usage error"
  exit 2
else
  echo "Engine error"
  exit 3
fi
```

## Common Use Cases

### Batch Validate Resources

```bash
#!/bin/bash
for file in resources/*.json; do
  echo "Validating: $file"
  medxai validate "$file" --core spec/fhir/r4 --silent
  if [ $? -ne 0 ]; then
    echo "✗ Failed: $file"
  else
    echo "✓ Success: $file"
  fi
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Validate FHIR Resources
  run: |
    npm install -g @medxai/cli
    medxai validate resources/Patient.json --core spec/fhir/r4
```

### Extract Data for Analysis

```bash
# Extract gender from all patients
for file in patients/*.json; do
  medxai evaluate "Patient.gender" "$file" --json | jq -r '.results[0]'
done
```

### Generate Profile Snapshots

```bash
# Generate snapshots for all US Core profiles
for sd in profiles/StructureDefinition-*.json; do
  output="snapshots/$(basename "$sd")"
  medxai snapshot "$sd" --output "$output" --core spec/fhir/r4
done
```

## Troubleshooting

### Core Definitions Not Found

**Error:**

```
Error: Profile not found: http://hl7.org/fhir/StructureDefinition/Patient
```

**Solution:**
Ensure you specify the FHIR R4 core definitions directory using the `--core` option. The directory should contain `profiles-resources.json` and `profiles-types.json`.

### Parse Error

**Error:**

```
Error: Unexpected token in JSON
```

**Solution:**
Ensure the JSON file is properly formatted. You can validate JSON syntax using `jq` or other tools:

```bash
jq . Patient.json > /dev/null && echo "JSON is valid"
```

### Out of Memory

For large resources or batch operations, you may need to increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=4096" medxai validate large-bundle.json --core spec/fhir/r4
```

## Performance Tips

1. **Cache Core Definitions**: The `--core` directory is loaded on every command execution; use a local cached copy
2. **Batch Operations**: For large numbers of files, consider writing scripts with parallel processing
3. **JSON Output**: Use `--json` option for faster output processing (no formatting overhead)
4. **Silent Mode**: Use `--silent` in scripts to reduce output overhead

## Limitations

Known limitations in the current version (v0.1.0):

1. **No Terminology Service**: Cannot validate CodeSystem/ValueSet bindings
2. **No Search Support**: Cannot execute FHIR search operations
3. **Structural Validation Only**: Only performs structural validation, not business rule validation
4. **Local Files Only**: All operations are based on local files; no network resource support

## Additional Resources

- [GitHub Repository](https://github.com/medxaidev/medxai)
- [Issue Tracker](https://github.com/medxaidev/medxai/issues)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [FHIRPath Specification](https://hl7.org/fhirpath/)
