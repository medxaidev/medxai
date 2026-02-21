# Medplum 系统逆向工程知识库

> 版本：Medplum 5.0.13 | 维护者：fangjun | 更新：2026-02-21
> 目标：把 Medplum 拆解成可迁移的算法模块，转化为 medxai 的知识资产与算法模板

---

## 分析框架（5层）

| 层级 | 名称                  | 目录                      | 目标                           |
| ---- | --------------------- | ------------------------- | ------------------------------ |
| L1   | Static Inventory      | 01_STATIC_INVENTORY/      | 函数级全量记录                 |
| L2   | Module Summaries      | 02_MODULE_SUMMARIES/      | 模块职责抽象                   |
| L3   | Workflow Analysis     | 03_WORKFLOW_ANALYSIS/     | 数据流追踪（函数级调用链）     |
| L4   | Algorithm Abstraction | 04_ALGORITHM_ABSTRACTION/ | 通用算法提取（带合约的伪代码） |
| L5   | Test Validation       | 05_COMPARATIVE_ANALYSIS/  | 测试驱动验证                   |

---

## Package 总览

| package     | 类型           | 核心职责                           | L1  | L2  |
| ----------- | -------------- | ---------------------------------- | --- | --- |
| fhirtypes   | types          | FHIR R4 TypeScript 类型定义        | ⬜  | ⬜  |
| definitions | data           | FHIR StructureDefinition JSON 数据 | ⬜  | ⬜  |
| core        | library        | FHIR 客户端、验证、FHIRPath、HL7   | ⬜  | ⬜  |
| fhir-router | library        | FHIR 路由、Repository 抽象接口     | ⬜  | ⬜  |
| server      | application    | HTTP 服务、FHIR REST API、持久化   | ⬜  | ⬜  |
| mock        | library        | 测试用 Mock 实现                   | ⬜  | ⬜  |
| react       | library        | FHIR 感知 React 组件库             | ⬜  | ⬜  |
| react-hooks | library        | FHIR 数据获取 Hooks                | ⬜  | ⬜  |
| app         | application    | Medplum 管理前端                   | ⬜  | ⬜  |
| agent       | application    | 边缘设备代理（HL7/DICOM 网关）     | ⬜  | ⬜  |
| cli         | tool           | 命令行工具                         | ⬜  | ⬜  |
| hl7         | library        | HL7 v2 消息解析（独立）            | ⬜  | ⬜  |
| ccda        | library        | C-CDA 文档处理                     | ⬜  | ⬜  |
| cdk         | infrastructure | AWS CDK 部署脚本                   | ⬜  | ⬜  |
| generator   | tool           | 代码生成器（生成 fhirtypes）       | ⬜  | ⬜  |

---

## Workflow 索引

| ID            | 名称                                    | 入口                                   | L3  | L4  |
| ------------- | --------------------------------------- | -------------------------------------- | --- | --- |
| WF-GEN-001    | fhirtypes Generation Pipeline           | npm run fhirtypes (generator)          | ✅  | ⬜  |
| WF-SERVER-001 | Server Startup Schema Init              | initApp() → loadStructureDefinitions() | ✅  | ⬜  |
| WF-MIG-001    | Migration Pipeline 总控                 | npm run migrate                        | ✅  | ⬜  |
| WF-MIG-002    | Resource Table Schema Strategy          | buildCreateTables()                    | ✅  | ⬜  |
| WF-MIG-003    | Search Parameter → Column/Index Mapping | buildSearchColumns()                   | ✅  | ⬜  |
| WF-MIG-004    | Lookup Table Strategy                   | buildLookupTable()                     | ✅  | ⬜  |
| WF-MIG-005    | Schema Diff & Migration Generation      | generateMigrationActions()             | ✅  | ⬜  |
| WF-001        | Create Patient Resource                 | POST /fhir/R4/Patient                  | ⬜  | ⬜  |
| WF-002        | Search Resources                        | GET /fhir/R4/{type}?...                | ⬜  | ⬜  |
| WF-003        | FHIR Batch/Transaction                  | POST /fhir/R4/                         | ⬜  | ⬜  |
| WF-004        | OAuth2 Login                            | POST /auth/login                       | ⬜  | ⬜  |
| WF-005        | Bot Execution                           | POST /fhir/R4/Bot/$execute             | ⬜  | ⬜  |
| WF-006        | Subscription Trigger                    | Resource change event                  | ⬜  | ⬜  |
| WF-007        | FHIRPath Evaluation                     | evalFhirPath()                         | ⬜  | ⬜  |
| WF-008        | Resource Validation                     | validateResource()                     | ⬜  | ⬜  |

---

## 算法索引

| ID      | 算法名称                                             | 来源模块                 | 可迁移评分 | 状态 |
| ------- | ---------------------------------------------------- | ------------------------ | ---------- | ---- |
| ALG-001 | Structured Schema Parser (StructureDefinitionParser) | core/typeschema          | 5/5        | ✅   |
| ALG-002 | FHIRPath Expression Evaluation                       | core/fhirpath            | 5/5        | ⬜   |
| ALG-003 | Search Parameter Indexing                            | server/fhir/search       | 4/5        | ⬜   |
| ALG-004 | Access Policy Enforcement                            | server/fhir/accesspolicy | 4/5        | ⬜   |
| ALG-005 | FHIR Bundle Transaction                              | fhir-router/batch        | 4/5        | ⬜   |
| ALG-006 | HL7 v2 Message Parsing                               | core/hl7                 | 5/5        | ⬜   |
| ALG-007 | JWT Auth Flow                                        | server/oauth             | 3/5        | ⬜   |
| ALG-008 | FHIR Subscription Matching                           | server/subscriptions     | 4/5        | ⬜   |

---

## 可迁移评分标准

| 分数 | 含义                                |
| ---- | ----------------------------------- |
| 5/5  | 完全通用，可直接移植到任何语言/系统 |
| 4/5  | 逻辑通用，需少量适配（数据格式）    |
| 3/5  | 逻辑通用，但强依赖 FHIR 规范知识    |
| 2/5  | 部分可迁移，依赖 Medplum 内部结构   |
| 1/5  | 几乎不可迁移，高度 Medplum 耦合     |

---

## 函数分析状态定义

| 状态          | 含义                   |
| ------------- | ---------------------- |
| NotVisited    | 尚未查看               |
| Read          | 已阅读代码             |
| Understood    | 理解了逻辑             |
| Tested        | 结合测试验证了理解     |
| Abstracted    | 已提取为算法抽象       |
| Reimplemented | 已在 medxai 中重新实现 |
