# Development Guide / 开发指南

This document describes how development work is approached in this project.
It defines the lifecycle of development activities, the thinking process
behind them, and how architecture, documentation, testing, and AI usage
fit together.

This is not a step-by-step procedure.
Concrete actions are defined in SOP documents.

本文档描述了本项目如何处理开发工作。
它定义了开发活动的生命周期、其背后的思维过程，
以及架构、文档、测试和 AI 使用如何结合在一起。

这不是一个逐步程序。
具体操作在 SOP 文档中定义。

---

## 1. Development Philosophy / 开发哲学

Development is treated as a process of progressively reducing uncertainty.

At the beginning of any work:

- Requirements may be incomplete
- Designs may be tentative
- Implementation details are unknown

The goal of development is not to eliminate uncertainty immediately,
but to make it explicit, controlled, and eventually resolved.

开发被视为逐步减少不确定性的过程。

在任何工作开始时：

- 需求可能不完整
- 设计可能是暂时的
- 实现细节未知

开发的目标不是立即消除不确定性，
而是使其明确、可控并最终解决。

---

## 2. Types of Development Work / 开发工作类型

Not all work follows the same path.
Common development categories include:

- Exploratory work
- Feature or module implementation
- Core algorithm development
- Refactoring and architectural evolution
- Bug fixing and stabilization

Each type requires a different balance of design, code, tests,
and documentation.

并非所有工作都遵循相同的路径。
常见的开发类别包括：

- 探索性工作
- 功能或模块实现
- 核心算法开发
- 重构和架构演进
- 错误修复和稳定化

每种类型需要不同的设计、代码、测试
和文档平衡。

---

## 3. From Idea to Implementation / 从想法到实现

All development work follows the same conceptual progression:

1. Clarify intent  
   What problem is being solved, and why it matters.

2. Identify scope  
   What is included, what is excluded, and what constraints apply.

3. Align with architecture  
   Determine how the work fits into existing architectural boundaries.

4. Design before implementation  
   Interfaces, data shapes, and responsibilities are defined
   before or alongside code.

5. Implement incrementally  
   Code is written in small, reviewable units.

6. Validate correctness  
   Through tests, reasoning, and comparison with specifications.

7. Document outcomes  
   Architecture, stages, and decisions are updated as needed.

This progression is conceptual and iterative,
not a rigid sequence.

所有开发工作都遵循相同的概念进展：

1. 明确意图  
   正在解决什么问题，以及为什么重要。

2. 识别范围  
   包括什么、排除什么、适用什么约束。

3. 与架构对齐  
   确定工作如何适应现有架构边界。

4. 实现前设计  
   接口、数据形状和职责在代码之前或与代码一起定义。

5. 增量实现  
   代码以小型、可审查的单元编写。

6. 验证正确性  
   通过测试、推理和与规范比较。

7. 记录结果  
   根据需要更新架构、阶段和决策。

这种进展是概念性和迭代的，
不是僵化的序列。

---

## 4. Architecture and Development / 架构与开发

Architecture provides the stable reference frame for development.

During development:

- Architecture guides implementation choices
- Implementation may reveal architectural gaps or flaws

When development exposes architectural changes:

- The architecture must be updated
- Or the deviation must be explicitly justified

Architecture is allowed to evolve,
but never implicitly.

架构为开发提供稳定的参考框架。

在开发期间：

- 架构指导实现选择
- 实现可能揭示架构缺陷或漏洞

当开发暴露架构变更时：

- 必须更新架构
- 或者必须明确证明偏差的合理性

架构允许演进，
但从不隐式地。

---

## 5. Stages and Progression / 阶段和进展

Development is organized into stages,
each representing a coherent set of goals and constraints.

A stage:

- Has a clear focus
- Introduces or stabilizes key concepts
- Produces both code and documentation

A stage is considered complete only when:

- Its objectives are met
- Its impact on architecture is documented
- Open questions are resolved or explicitly deferred

Stages are recorded in `devdocs/stages`.

开发被组织成阶段，
每个阶段代表一组一致的目标和约束。

一个阶段：

- 有明确的焦点
- 引入或稳定关键概念
- 产生代码和文档

一个阶段仅在以下情况下被视为完成：

- 其目标已实现
- 其对架构的影响已记录
- 开放问题已解决或明确推迟

阶段记录在 `devdocs/stages` 中。

---

## 6. Decisions and Trade-offs / 决策和权衡

Some choices have long-term consequences.

Decisions that affect:

- Architecture
- Data models
- Public interfaces
- Core algorithms

must be made explicit and recorded.

Short-term or local decisions may remain undocumented,
but must not accumulate hidden technical debt.

一些选择具有长期后果。

影响以下内容的决策：

- 架构
- 数据模型
- 公共接口
- 核心算法

必须明确并记录。

短期或本地决策可能保持未记录，
但不得积累隐藏的技术债务。

---

## 7. Testing and Confidence / 测试和信心

Testing is how confidence is built over time.

Not all code requires the same level of testing,
but core logic always does.

Testing should:

- Validate correctness
- Protect against regressions
- Reflect real usage scenarios

A feature is not considered stable
until its behavior is defensible through tests or reasoning.

测试是随时间建立信心的方式。

并非所有代码都需要相同级别的测试，
但核心逻辑总是需要。

测试应该：

- 验证正确性
- 防止回归
- 反映真实使用场景

功能不被视为稳定，
直到其行为可以通过测试或推理来辩护。

---

## 8. AI in the Development Process / 开发过程中的 AI

AI is used to accelerate execution,
not to replace understanding.

During development, AI may assist with:

- Drafting code or documentation
- Exploring alternatives
- Refactoring and summarization

AI-generated outputs must always be reviewed,
understood, and validated.

When AI influences design or architecture,
the result must be documented.

AI 用于加速执行，
而不是替代理解。

在开发期间，AI 可能协助：

- 起草代码或文档
- 探索替代方案
- 重构和总结

AI 生成的输出必须始终被审查、
理解和验证。

当 AI 影响设计或架构时，
结果必须被记录。

---

## 9. Documentation as Part of Development / 作为开发一部分的文档

Documentation is not a final step;
it evolves together with code.

Documentation is updated when:

- Architecture changes
- A stage is completed
- A significant decision is made
- Core logic is introduced or modified

Outdated documentation is treated as a defect.

文档不是最后一步；
它与代码一起演进。

文档在以下情况下更新：

- 架构变更
- 阶段完成
- 做出重大决策
- 引入或修改核心逻辑

过时的文档被视为缺陷。

---

## 10. Guiding Principle / 指导原则

Development progresses when uncertainty decreases
and understanding increases.

If progress is not accompanied by clearer intent,
cleaner structure, or stronger confidence,
it is likely not real progress.

当不确定性减少
和理解增加时，开发取得进展。

如果进展没有伴随更清晰的意图、
更清洁的结构或更强的信心，
它可能不是真正的进展。
