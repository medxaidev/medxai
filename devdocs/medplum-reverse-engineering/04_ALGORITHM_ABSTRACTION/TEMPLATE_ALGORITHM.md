# Algorithm Abstraction: [ALGORITHM_NAME]

> 本文档不提及 Medplum，描述纯粹的通用算法。
> 目标：其他项目可以直接学习算法，而不是学习 Medplum 代码。

```yaml
algorithm_id: ALG-XXX
algorithm_name: [通用名称，不含 Medplum]
source_workflow: WF-XXX
source_file: packages/[pkg]/src/[file].ts
source_function: [functionName]
extractability_score: 1-5
analysis_date: YYYY-MM-DD
analyst: fangjun
```

---

## 1. 问题定义

### 这个算法解决什么问题？

> 用领域无关的语言描述。不能出现 FHIR/Medplum 专有词汇。

### 适用场景

-
-

---

## 2. 算法合约

### 输入

| 参数名 | 类型（抽象） | 约束 |
|--------|-------------|------|
| | | |

### 输出

| 返回值 | 类型（抽象） | 说明 |
|--------|-------------|------|
| | | |

### 前置条件（Preconditions）

1.
2.

### 后置条件（Postconditions）

1.
2.

### 不变量（Invariants）

> 算法执行过程中始终保持为真的条件

1.

---

## 3. 核心数据结构

```
[抽象数据结构名]
├── field1: type
├── field2: type
└── field3: type
```

---

## 4. 算法步骤

1.
2.
3.

---

## 5. 伪代码

```
ALGORITHM [名称]
INPUT:  input: InputType
OUTPUT: result: OutputType
PRECONDITION:  [条件]
POSTCONDITION: [条件]

BEGIN
  result = empty

  FOR each element IN input.schema:
    value = GET input[element.path]

    IF element.required AND value IS EMPTY THEN
      result.addError(REQUIRED, element.path)
    END IF

    IF value IS NOT EMPTY THEN
      IF NOT matchesType(value, element.type) THEN
        result.addError(TYPE_MISMATCH, element.path)
      END IF
    END IF
  END FOR

  RETURN result
END
```

---

## 6. 复杂度分析

- **时间复杂度**: O(?)，原因：
- **空间复杂度**: O(?)，原因：
- **瓶颈**: 哪一步最慢？

---

## 7. 边界情况

| 场景 | 处理方式 |
|------|----------|
| 空输入 | |
| 嵌套结构 | |
| 循环引用 | |

---

## 8. 已知的实现变体

| 实现 | 差异点 |
|------|--------|
| Medplum (本文来源) | |
| HAPI FHIR | |
| medxai (待实现) | |

---

## 9. 迁移指南

### 实现此算法需要的前置知识

-

### 最小实现步骤

1.
2.
3.

### 可复用的测试用例（来自 Medplum 测试）

| 测试场景 | 来源文件 | 预期结果 |
|----------|----------|----------|
| | | |
