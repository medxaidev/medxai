# Prompt Guidelines / 提示词指南

This document defines how to formulate prompts when using AI
for development in this project.

The goal is not to maximize output quantity,
but to obtain results that are reviewable, traceable,
and aligned with the documented architecture.

本文档定义了在本项目中使用 AI 进行开发时如何制定提示词。

目标不是最大化输出数量，
而是获得可审查、可追溯、
并与记录的架构一致的结果。

---

## 1. Prompting Philosophy / 提示词哲学

Good prompts produce outputs that can be:

- Read and understood line by line
- Mapped to existing architecture and stages
- Verified through tests or documentation
- Maintained without further AI assistance

Prompts that produce large, opaque, or unverifiable outputs
are considered invalid.

好的提示词产生的输出应该：

- 可以逐行阅读和理解
- 可以映射到现有架构和阶段
- 可以通过测试或文档验证
- 可以在没有进一步 AI 辅助的情况下维护

产生大型、不透明或不可验证输出的提示词
被视为无效。

---

## 2. Always Provide Context / 始终提供上下文

Every prompt must include sufficient context.
At minimum, specify:

- The purpose of the task
- The scope and constraints
- The relevant architectural or stage references

**Example:**

> This is part of Stage 1 (Foundation).  
> The architecture defines a pull-based parser.  
> Generate a TypeScript skeleton consistent with this constraint.

Never assume the AI "already knows" the project context.

每个提示词都必须包含足够的上下文。
至少指定：

- 任务的目的
- 范围和约束
- 相关的架构或阶段引用

**示例：**

> 这是阶段 1（基础）的一部分。  
> 架构定义了基于拉取的解析器。  
> 生成与此约束一致的 TypeScript 框架。

永远不要假设 AI "已经知道" 项目上下文。

---

## 3. Ask for Structure Before Detail / 先要求结构再要求细节

Prefer prompts that request:

- Outlines
- Interfaces
- Data shapes
- Control flow descriptions

before asking for full implementations.

**Good pattern:**

1. Ask for a high-level approach
2. Review and adjust
3. Ask for concrete code

Avoid single-step prompts that request
complete implementations without prior structure.

优先请求以下内容的提示词：

- 大纲
- 接口
- 数据形状
- 控制流描述

然后再要求完整实现。

**好的模式：**

1. 要求高层方法
2. 审查和调整
3. 要求具体代码

避免在没有先前结构的情况下
请求完整实现的单步提示词。

---

## 4. Constrain the Output Explicitly / 明确约束输出

Prompts should state clear constraints, such as:

- Language and runtime
- Architectural rules
- What must _not_ be done
- What is out of scope

**Example constraints:**

- Do not introduce new dependencies
- Do not change public interfaces
- Focus on correctness, not performance

Unconstrained prompts tend to produce unusable results.

提示词应该说明明确的约束，例如：

- 语言和运行时
- 架构规则
- 什么**不**能做
- 什么不在范围内

**示例约束：**

- 不要引入新的依赖
- 不要更改公共接口
- 专注于正确性，而不是性能

无约束的提示词往往产生不可用的结果。

---

## 5. Small, Inspectable Outputs / 小型可检查的输出

Prefer multiple small prompts over a single large one.

- One module at a time
- One function at a time
- One concept at a time

If the output cannot be reasonably reviewed
within a short reading session,
the prompt was too broad.

优先使用多个小提示词而不是单个大型提示词。

- 一次一个模块
- 一次一个函数
- 一次一个概念

如果输出无法在短时间阅读内
合理审查，
则提示词过于宽泛。

---

## 6. Make Assumptions Explicit / 明确假设

If assumptions are required, instruct the AI to:

- State them clearly
- Separate assumptions from conclusions
- Avoid silently inventing behavior

If the AI must guess, it should say so.

Hidden assumptions are a source of long-term defects.

如果需要假设，指示 AI：

- 清楚地说明它们
- 将假设与结论分开
- 避免默默地发明行为

如果 AI 必须猜测，它应该说明。

隐藏的假设是长期缺陷的来源。

---

## 7. Require Explanations for Non-trivial Logic / 为非平凡逻辑要求解释

For algorithms, validation rules, or transformations,
explicitly request:

- Step-by-step reasoning
- Explanation of edge cases
- Justification for chosen approaches

If the explanation is weak or unclear,
the generated code should not be trusted.

对于算法、验证规则或转换，
明确请求：

- 逐步推理
- 边缘情况的解释
- 所选方法的理由

如果解释薄弱或不清楚，
则不应信任生成的代码。

---

## 8. Treat AI Output as a Draft / 将 AI 输出视为草稿

AI-generated content is a starting point, not a final result.

Expected post-processing includes:

- Renaming for clarity
- Simplifying logic
- Aligning with existing conventions
- Adding or refining tests
- Updating documentation

Prompts should aim to reduce thinking cost,
not eliminate thinking.

AI 生成的内容是起点，不是最终结果。

预期的后处理包括：

- 为清晰性重命名
- 简化逻辑
- 与现有约定对齐
- 添加或完善测试
- 更新文档

提示词应该旨在减少思考成本，
而不是消除思考。

---

## 9. When Not to Use AI / 何时不使用 AI

Avoid prompting AI when:

- The problem is not yet understood
- The architecture is undecided
- The requirements are ambiguous
- The task requires reading primary specifications
- A quick manual implementation is clearer

AI is most effective after the problem is framed,
not while it is still vague.

在以下情况下避免提示 AI：

- 问题尚未理解
- 架构未决定
- 需求模糊
- 任务需要阅读主要规范
- 快速手动实现更清晰

AI 在问题被框定后最有效，
而不是在问题仍然模糊时。

---

## 10. Guiding Principle / 指导原则

Prompt for clarity, not cleverness.

If a prompt cannot be explained to another developer,
it is not a good prompt.

为清晰性而提示，而不是为巧妙性。

如果提示词无法向另一个开发者解释，
那就不是一个好的提示词。
