# Standard Operating Procedures (SOP) / 标准操作程序

This document defines the standard operating procedures
for development activities in this project.

SOPs describe _how_ work is executed.
They intentionally avoid explaining _why_;
rationale and philosophy are documented elsewhere.

本文档定义了本项目开发活动的标准操作程序。

SOP 描述工作**如何**执行。
它们有意避免解释**为什么**；
理由和哲学在其他地方记录。

---

## 1. Starting New Work / 开始新工作

Triggered when beginning / 在以下情况开始时触发：

- A new feature / 新功能
- A new module / 新模块
- A new stage / 新阶段
- Significant refactoring / 重大重构

### Procedure / 程序

- Confirm the scope and objective / 确认范围和目标
- Identify whether the work affects / 识别工作是否影响：
  - Architecture / 架构
  - Core logic / 核心逻辑
  - Public interfaces / 公共接口
- Determine required documentation updates / 确定所需的文档更新
- Decide whether exploratory work is needed / 决定是否需要探索性工作

No code is written before this classification is clear.
在此分类明确之前，不编写代码。

---

## 2. Exploratory Work SOP / 探索性工作 SOP

Triggered when / 在以下情况时触发：

- Requirements are unclear / 需求不明确
- Design space is still open / 设计空间仍然开放
- Multiple approaches are being evaluated / 正在评估多种方法

### Procedure / 程序

- Limit exploration scope explicitly / 明确限制探索范围
- Record assumptions and open questions / 记录假设和开放问题
- Keep experimental code isolated / 保持实验代码隔离
- Do not merge exploratory code into core paths / 不要将探索性代码合并到核心路径

Exploration must result in / 探索必须导致：

- A documented conclusion / 记录的结论
- Or a clearly stated unresolved question / 或明确陈述的未解决问题

---

## 3. Feature or Module Implementation SOP / 功能或模块实现 SOP

Triggered when / 在以下情况时触发：

- Scope and intent are defined / 范围和意图已定义
- Architectural alignment is clear / 架构对齐明确

### Procedure / 程序

- Define interfaces and data shapes first / 首先定义接口和数据形状
- Implement in small, reviewable increments / 以小型、可审查的增量实现
- Write tests for core logic / 为核心逻辑编写测试
- Keep changes aligned with documented architecture / 保持变更与记录的架构一致
- Update relevant documentation / 更新相关文档

A feature is not considered complete until
code, tests, and documentation are consistent.
在代码、测试和文档一致之前，
功能不被视为完成。

---

## 4. Core Logic Development SOP / 核心逻辑开发 SOP

Triggered when implementing / 在实现以下内容时触发：

- Algorithms / 算法
- Validation rules / 验证规则
- Data normalization or transformation logic / 数据标准化或转换逻辑

### Procedure / 程序

- Describe the logic in plain language / 用通俗语言描述逻辑
- Identify edge cases and failure modes / 识别边缘情况和失败模式
- Implement with test-first or test-along approach / 使用测试优先或测试伴随方法实现
- Review AI-assisted code line by line / 逐行审查 AI 辅助的代码
- Ensure behavior is defensible without AI / 确保行为在没有 AI 的情况下可辩护

Core logic without tests is not acceptable.
没有测试的核心逻辑是不可接受的。

---

## 5. Architecture Change SOP / 架构变更 SOP

Triggered when / 在以下情况时触发：

- Architectural assumptions are violated / 架构假设被违反
- New core abstractions are introduced / 引入新的核心抽象
- Module boundaries shift / 模块边界发生变化

### Procedure / 程序

- Pause implementation / 暂停实现
- Update architecture documentation / 更新架构文档
- Record an ADR if the change is long-term / 如果变更是长期的，记录 ADR
- Resume implementation only after alignment / 仅在对齐后恢复实现

Architecture changes must be explicit.
架构变更必须是明确的。

---

## 6. Stage Completion SOP / 阶段完成 SOP

Triggered when / 在以下情况时触发：

- Stage goals are met / 阶段目标已实现
- Major work within a stage is finished / 阶段内的主要工作已完成

### Procedure / 程序

- Review stage objectives / 审查阶段目标
- Resolve or document open questions / 解决或记录开放问题
- Update stage documentation / 更新阶段文档
- Verify architecture and decisions are consistent / 验证架构和决策一致
- Confirm tests cover stabilized behavior / 确认测试覆盖稳定的行为

A stage is not closed until documentation is updated.
在文档更新之前，阶段不关闭。

---

## 7. AI-Assisted Development SOP / AI 辅助开发 SOP

Triggered when using AI for / 在使用 AI 进行以下操作时触发：

- Code generation / 代码生成
- Design exploration / 设计探索
- Documentation drafting / 文档起草

### Procedure / 程序

- Provide explicit context and constraints / 提供明确的上下文和约束
- Treat all AI output as untrusted / 将所有 AI 输出视为不可信
- Review and understand generated content / 审查和理解生成的内容
- Add tests where required / 在需要的地方添加测试
- Update documentation if AI influences design / 如果 AI 影响设计，更新文档

Responsibility remains with the human developer.
责任仍然由人类开发者承担。

---

## 8. Pre-Merge Check SOP / 合并前检查 SOP

Triggered before merging changes.
在合并变更之前触发。

### Procedure / 程序

- Verify code follows coding conventions / 验证代码遵循编码约定
- Ensure tests pass and are meaningful / 确保测试通过且有意义
- Confirm documentation is up to date / 确认文档是最新的
- Check for undocumented decisions / 检查未记录的决策
- Review AI-generated contributions / 审查 AI 生成的贡献

Unjustified deviations must be resolved before merge.
无正当理由的偏差必须在合并前解决。

---

## 9. Post-Completion Review SOP / 完成后审查 SOP

Triggered after completing significant work.
在完成重要工作后触发。

### Procedure / 程序

- Reflect on what changed / 反思发生了什么变化
- Identify newly introduced assumptions / 识别新引入的假设
- Decide whether further documentation updates are needed / 决定是否需要进一步更新文档
- Capture lessons learned if applicable / 如适用，捕获经验教训

This review supports long-term project health.
此审查支持项目的长期健康。

---

## 10. Guiding Principle / 指导原则

SOPs exist to reduce variability, not judgment.
SOP 的存在是为了减少变异性，而不是判断。

When a situation does not fit an SOP,
slow down, document the deviation,
and adjust the system if needed.

当情况不符合 SOP 时，
放慢速度，记录偏差，
并在需要时调整系统。
