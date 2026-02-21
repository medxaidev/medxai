# Workflow Analysis: [WORKFLOW_NAME]

```yaml
workflow_id: WF-XXX
workflow_name: [name]
entry_point: [HTTP method + path] OR [function signature]
exit_point: [output description]
phase: Phase-1 (Core Lib) | Phase-2 (Server Core) | Phase-3 (Auth) | Phase-4 (Workers)
analysis_status: NotStarted | InProgress | Complete
author: fangjun
last_update: YYYY-MM-DD
```

---

## 1. Workflow 概述

### 目标

> 一句话描述。格式："接收 X，经过 Y，返回 Z。"

### 输入

| 类型 | 示例 | 来源 |
|------|------|------|
| | | |

### 输出

| 类型 | 示例 |
|------|------|
| | |

---

## 2. 完整调用链（Call Graph）

### Happy Path

```
1. [package/file.ts] → [functionName(param: Type): ReturnType]
2. [package/file.ts] → [functionName(param: Type): ReturnType]
3. ...
```

### Error Path

```
[错误触发点] → [错误类型] → [处理函数] → [最终响应]
```

### 涉及文件

| package | file | 核心函数 | 角色 |
|---------|------|----------|------|
| | | | |

---

## 3. 关键状态对象

> 每个关键阶段，核心数据结构长什么样

### 阶段 1：[名称]
```ts
// 此阶段数据结构示例
{
  field: type,
}
```

### 阶段 2：[名称]
```ts
{
  field: type,
}
```

---

## 4. 核心算法拆解

### Algorithm A — [名称]

**文件**: `packages/[pkg]/src/[file].ts`
**函数签名**:
```ts
functionName(param: InputType): OutputType
```

**算法步骤**:
1.
2.
3.

**伪代码**:
```
ALGORITHM [名称]
INPUT:  param: Type
OUTPUT: result: Type
PRECONDITION:  [前置条件]
POSTCONDITION: [后置条件]

BEGIN
  ...
END
```

**复杂度**: 时间 O(?), 空间 O(?)

---

## 5. 权限与安全检查点

| 阶段 | 检查内容 | 处理函数 |
|------|----------|----------|
| | | |

---

## 6. 错误处理路径

| 错误类型 | 触发条件 | 响应 |
|----------|----------|------|
| 400 BadRequest | | OperationOutcome |
| 403 Forbidden | | OperationOutcome |
| 404 NotFound | | OperationOutcome |
| 500 ServerError | | OperationOutcome |

---

## 7. 测试分析

### 相关测试文件

| file | 测试目标 |
|------|----------|
| | |

### 场景覆盖

| 场景 | 覆盖 | 测试函数 |
|------|------|----------|
| 正常路径 | ✅/❌ | |
| 验证失败 | ✅/❌ | |
| 无权限 | ✅/❌ | |
| 系统错误 | ✅/❌ | |

---

## 8. 可还原实现指南

### 最小复现步骤

1.
2.
3.

### 必需依赖

- 

---

## 9. 抽象总结（For AI Learning）

```yaml
workflow_type: CRUD | Search | Auth | Event | Compute
resource_type: [FHIR resource type or N/A]
core_patterns:
  - validation
  - permission_check
  - persistence
  - response_builder
design_patterns:
  - repository_pattern
  - middleware
  - layered_architecture
algorithm_extractability_score: 1-5
notes: ""
```

---

## 10. 函数记录表联动

完成后在 `FUNCTION_INDEX.csv` 中更新以下行的 `workflowTag` 字段：
```
[package],[file],[type],[name],... ,WF-XXX
```
