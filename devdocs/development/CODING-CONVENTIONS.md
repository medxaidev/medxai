# Coding Conventions / 编码约定

This document defines the coding conventions for this project.
The goal is not stylistic perfection, but consistency, clarity,
and long-term maintainability.

Code is treated as a communication medium first,
and as an execution artifact second.

本文档定义了本项目的编码约定。
目标不是风格上的完美，而是一致性、清晰度
和长期可维护性。

代码首先被视为沟通媒介，
其次才是执行产物。

---

## 1. General Principles / 通用原则

1. Readability over cleverness
2. Explicitness over implicit behavior
3. Consistency over personal preference
4. Simplicity over premature optimization

5. 可读性优于巧妙性
6. 明确性优于隐式行为
7. 一致性优于个人偏好
8. 简单性优于过早优化

If code requires explanation to be understood,
it should be rewritten.

如果代码需要解释才能被理解，
它应该被重写。

---

## 2. Naming Conventions / 命名约定

### 2.1 Files and Directories / 文件和目录

- Use `kebab-case` for file and directory names
- File names should describe responsibility, not implementation detail

- 文件和目录名使用 `kebab-case`
- 文件名应描述职责，而不是实现细节

**Examples / 示例:**

- `structure-definition-parser.ts`
- `validation-context.ts`

Avoid / 避免:

- Abbreviations without strong domain justification
- Generic names such as `utils`, `helpers`, `common`

- 没有强域理由的缩写
- 通用名称如 `utils`、`helpers`、`common`

---

### 2.2 Types, Classes, and Interfaces / 类型、类和接口

- Use `PascalCase`
- Names should reflect domain concepts, not technical patterns

- 使用 `PascalCase`
- 名称应反映域概念，而不是技术模式

**Good / 好的:**

- `StructureDefinition`
- `ElementConstraint`
- `ValidationResult`

Avoid / 避免:

- Suffixes like `Manager`, `Handler`, `Processor` unless necessary
- Encoding implementation details into names

- 除非必要，否则避免使用 `Manager`、`Handler`、`Processor` 等后缀
- 将实现细节编码到名称中

---

### 2.3 Functions and Methods / 函数和方法

- Use `camelCase`
- Prefer verb-based names
- A function name should clearly indicate _what it does_

- 使用 `camelCase`
- 优先使用基于动词的名称
- 函数名应清楚地表明它**做什么**

**Good / 好的:**

- `parseElement`
- `validateConstraint`
- `resolveTypeReference`

Avoid / 避免:

- Ambiguous verbs (`handle`, `process`, `do`)
- Overloaded meanings in a single function

- 模糊的动词（`handle`、`process`、`do`）
- 单个函数中的重载含义

---

## 3. Function Design / 函数设计

### 3.1 Single Responsibility / 单一职责

A function should do one thing.
If it needs extensive comments to explain its behavior,
it likely does too much.

函数应该做一件事。
如果需要大量注释来解释其行为，
它可能做得太多了。

### 3.2 Function Size / 函数大小

- Prefer small, composable functions
- Large functions must be justified by domain necessity

- 优先使用小型、可组合的函数
- 大函数必须由域必要性证明其合理性

As a guideline / 作为指导原则:

- If a function spans more than one screen,
  reconsider its structure.

- 如果函数跨越超过一个屏幕，
  重新考虑其结构。

---

## 4. Types and Data Structures / 类型和数据结构

- Prefer explicit types over inferred complexity
- Domain types should be defined centrally
- Avoid using raw primitives where domain meaning exists

- 优先使用显式类型而不是推断的复杂性
- 域类型应该集中定义
- 在存在域含义的地方避免使用原始原语

**Example / 示例:**

- Prefer `PatientId` over `string`
- Prefer structured objects over loosely shaped dictionaries

- 优先使用 `PatientId` 而不是 `string`
- 优先使用结构化对象而不是松散形状的字典

Type safety is a design tool, not a burden.

类型安全是设计工具，而不是负担。

---

## 5. Error Handling / 错误处理

- Errors must be explicit and meaningful
- Avoid silent failures
- Error messages should help identify cause and context

- 错误必须明确和有意义
- 避免静默失败
- 错误消息应帮助识别原因和上下文

Prefer / 优先:

- Domain-specific error types
- Clear error propagation

- 域特定的错误类型
- 清晰的错误传播

Avoid / 避免:

- Catch-and-ignore patterns
- Overusing generic errors

- 捕获并忽略模式
- 过度使用通用错误

---

## 6. Comments and Documentation / 注释和文档

### 6.1 When to Comment / 何时注释

Comments should explain **why**, not **what**.

Write comments when:

- The intent is non-obvious
- A decision has non-trivial trade-offs
- A constraint comes from external specifications

Avoid comments that restate the code.

注释应解释**为什么**，而不是**什么**。

在以下情况下编写注释：

- 意图不明显
- 决策有非平凡的权衡
- 约束来自外部规范

避免重述代码的注释。

---

### 6.2 Documentation Synchronization / 文档同步

Public-facing code, core logic, and non-obvious behavior
must be consistent with devdocs.

If documentation and code diverge,
the code is considered incorrect until reconciled.

面向公众的代码、核心逻辑和非明显行为
必须与 devdocs 一致。

如果文档和代码分歧，
代码在被协调之前被视为不正确。

---

## 7. Code Organization / 代码组织

- Group code by domain responsibility
- Avoid deep or tangled dependency graphs
- Dependencies should point inward toward core logic

Cross-module dependencies must be intentional
and aligned with documented architecture.

- 按域职责分组代码
- 避免深度或纠缠的依赖图
- 依赖应指向核心逻辑

跨模块依赖必须是有意的
并与记录的架构一致。

---

## 8. Refactoring Rules / 重构规则

Refactoring is encouraged when it improves:

- Readability
- Testability
- Architectural alignment

Refactoring must not:

- Change observable behavior without tests
- Introduce undocumented concepts
- Violate architectural constraints

Significant refactors require documentation updates.

当重构改善以下内容时，鼓励重构：

- 可读性
- 可测试性
- 架构对齐

重构不得：

- 在没有测试的情况下改变可观察行为
- 引入未记录的概念
- 违反架构约束

重大重构需要文档更新。

---

## 9. Style Consistency / 风格一致性

Automated formatting tools may be used,
but tools do not replace judgment.

When in doubt:

- Follow existing patterns
- Optimize for future readers, not current writers

可以使用自动格式化工具，
但工具不能替代判断。

如有疑问：

- 遵循现有模式
- 为未来的读者优化，而不是当前的作者

---

## 10. Guiding Principle / 指导原则

Write code as if the next person maintaining it
is unfamiliar with the implementation
but familiar with the domain.

Clarity compounds.

编写代码时，假设下一个维护它的人
不熟悉实现
但熟悉域。

清晰度会复合增长。
