# R&D Rules (Strong Constraints) / 研发规则（强约束）

1. Architecture precedes code. / 架构优先于代码
   Any non-trivial implementation must be traceable to an architectural intent
   documented in devdocs.
   任何非平凡的实现都必须能够追溯到在 devdocs 中记录的架构意图。

2. Interfaces are defined before implementations. / 接口在实现之前定义
   Public APIs, module boundaries, and data contracts must be written
   before or alongside their implementations.
   公共 API、模块边界和数据合约必须在实现之前或与实现同时编写。

3. Documentation is part of the deliverable. / 文档是交付物的一部分
   A feature is considered incomplete if its corresponding documentation
   is missing or outdated.
   如果相应文档缺失或过时，则功能被视为未完成。

4. Stage completion requires documentation freeze. / 阶段完成需要文档冻结
   A development stage is not considered complete until all relevant
   devdocs (architecture, stage notes, decisions) are updated and reviewed.
   在所有相关的 devdocs（架构、阶段说明、决策）更新和审查之前，
   开发阶段不被视为完成。

5. Long-term or irreversible decisions must be recorded. / 长期或不可逆决策必须记录
   Any decision that affects architecture, data models, or public interfaces
   must be documented as an ADR.
   任何影响架构、数据模型或公共接口的决策必须作为 ADR 记录。

6. AI-generated code is untrusted by default. / AI 生成的代码默认不可信
   All AI-assisted code must be reviewed, understood, and validated
   before being accepted into the codebase.
   所有 AI 辅助的代码在被接受到代码库之前，必须经过审查、理解和验证。

7. Tests are mandatory for core logic. / 核心逻辑必须测试
   Core logic includes algorithms, data transformations, validation rules,
   and any code whose failure would compromise correctness.
   核心逻辑包括算法、数据转换、验证规则，以及任何失败会损害正确性的代码。

8. Uncertain designs must be explicitly documented. / 不确定的设计必须明确记录
   Exploratory or unresolved designs must be recorded in devdocs,
   clearly marked as provisional, and revisited before being promoted
   to stable architecture.
   探索性或未解决的设计必须在 devdocs 中记录，明确标记为临时性，
   并在提升为稳定架构之前重新审视。
