# Testing Strategy / 测试策略

This document defines the testing strategy for this project.
Its purpose is to establish confidence in correctness while
keeping testing effort proportional and intentional.

Testing is treated as a design activity,
not as a mechanical afterthought.

本文档定义了本项目的测试策略。
其目的是在保持测试工作成比例和有意图的同时，
建立对正确性的信心。

测试被视为设计活动，
而不是机械的事后考虑。

---

## 1. Goals of Testing / 测试目标

Testing exists to:

- Validate correctness of core logic
- Prevent regressions during evolution
- Make assumptions and constraints explicit
- Support refactoring with confidence

Testing is not intended to:

- Prove absence of bugs
- Maximize coverage metrics
- Replace reasoning or documentation

测试的存在是为了：

- 验证核心逻辑的正确性
- 防止演进过程中的回归
- 明确假设和约束
- 支持有信心的重构

测试不旨在：

- 证明没有错误
- 最大化覆盖率指标
- 替代推理或文档

---

## 2. What Must Be Tested / 必须测试的内容

Testing is mandatory for **core logic**.

Core logic includes:

- Algorithms and validation rules
- Data transformations and normalization
- Interpretation of external specifications (e.g. FHIR)
- Any code whose failure would compromise correctness

Core logic must be testable in isolation.

**核心逻辑**的测试是强制性的。

核心逻辑包括：

- 算法和验证规则
- 数据转换和标准化
- 外部规范的解释（例如 FHIR）
- 任何失败会损害正确性的代码

核心逻辑必须可独立测试。

---

## 3. What May Be Tested Lightly or Not at All / 可轻测试或不测试的内容

Not all code requires the same level of testing.

The following may be tested lightly or omitted:

- Thin wrappers over well-tested libraries
- Pure data containers without behavior
- Trivial glue code
- Code that is immediately exercised by higher-level tests

Lack of tests must be a conscious choice,
not an oversight.

并非所有代码都需要相同级别的测试。

以下内容可轻测试或省略：

- 经过良好测试的库的薄包装器
- 没有行为的纯数据容器
- 简单的胶水代码
- 被更高级别测试立即执行的代码

缺乏测试必须是意识的选择，
而不是疏忽。

---

## 4. Testing Levels / 测试级别

Testing is structured in layers:

### 4.1 Unit Tests / 单元测试

- Focus on small, isolated units
- Validate logic and edge cases
- Fast, deterministic, and independent

Unit tests are the primary defense
for core logic.

- 专注于小型、独立的单元
- 验证逻辑和边缘情况
- 快速、确定性和独立

单元测试是核心逻辑的主要防御。

---

### 4.2 Integration Tests / 集成测试

- Validate interactions between components
- Ensure data flows and contracts hold
- Cover realistic usage scenarios

Integration tests trade speed for confidence.

- 验证组件之间的交互
- 确保数据流和合约保持
- 覆盖真实使用场景

集成测试以速度换取信心。

---

### 4.3 End-to-End Reasoning / 端到端推理

Not all behavior is best tested through automation.

For complex or specification-driven logic:

- Written reasoning
- Worked examples
- Cross-references to specifications

may supplement or partially replace automated tests.

Reasoned correctness must still be defensible.

并非所有行为都最适合通过自动化测试。

对于复杂或规范驱动的逻辑：

- 书面推理
- 工作示例
- 规范的交叉引用

可能补充或部分替代自动化测试。

推理的正确性仍必须是可辩护的。

---

## 5. Test Design Principles / 测试设计原则

Good tests should:

- Be readable and intention-revealing
- Fail for clear and specific reasons
- Minimize coupling to implementation details
- Reflect domain concepts, not technical artifacts

Tests that are hard to understand
are a maintenance burden.

好的测试应该：

- 可读且意图明确
- 因清晰和特定的原因失败
- 最小化与实现细节的耦合
- 反映域概念，而不是技术产物

难以理解的测试
是维护负担。

---

## 6. Test Data / 测试数据

Test data should:

- Be minimal but representative
- Reflect real-world constraints
- Explicitly encode edge cases

Avoid:

- Random or opaque test fixtures
- Overly large datasets without justification

Test data is part of the test design.

测试数据应该：

- 最小但具有代表性
- 反映真实世界的约束
- 明确编码边缘情况

避免：

- 随机或不透明的测试夹具
- 没有合理性的过大数据集

测试数据是测试设计的一部分。

---

## 7. Tests and Refactoring / 测试和重构

Refactoring is encouraged,
but must preserve observable behavior.

Before refactoring:

- Ensure existing tests express intended behavior

After refactoring:

- Tests should pass without modification
  unless behavior intentionally changed

If tests must be rewritten,
their intent must be reconsidered.

鼓励重构，
但必须保持可观察的行为。

重构前：

- 确保现有测试表达预期行为

重构后：

- 测试应该无需修改即可通过
  除非行为有意改变

如果测试必须重写，
其意图必须重新考虑。

---

## 8. Tests and AI-Generated Code / 测试和 AI 生成的代码

AI-generated code does not reduce testing requirements.

For AI-assisted implementations:

- Tests are mandatory for core logic
- Edge cases must be explicitly considered
- Human reasoning must confirm correctness

If confidence relies solely on AI output,
the test suite is insufficient.

AI 生成的代码不会减少测试要求。

对于 AI 辅助的实现：

- 核心逻辑的测试是强制性的
- 必须明确考虑边缘情况
- 人类推理必须确认正确性

如果信心仅依赖于 AI 输出，
测试套件是不充分的。

---

## 9. When Tests Are Not Enough / 当测试不足时

Some correctness properties cannot be fully captured by tests.

In such cases:

- Document assumptions
- Record reasoning in devdocs
- Reference authoritative specifications

Testing and documentation together
form the confidence boundary.

一些正确性属性无法完全通过测试捕获。

在这种情况下：

- 记录假设
- 在 devdocs 中记录推理
- 引用权威规范

测试和文档一起
形成信心边界。

---

## 10. Guiding Principle / 指导原则

Tests define the boundaries of trust.

If code cannot be confidently defended
through tests, reasoning, or documentation,
it is not ready to be considered stable.

测试定义了信任的边界。

如果代码无法通过测试、
推理或文档自信地辩护，
它就不准备好被视为稳定。
