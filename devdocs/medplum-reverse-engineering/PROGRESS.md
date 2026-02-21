# Medplum 逆向工程进度追踪

> 版本：Medplum 5.0.13 | 维护者：fangjun

---

## 当前状态

**当前 Step**: 待确认下一步
**刚完成**: WF-MIG-001~005 数据库迁移系统完整分析
**上次更新**: 2026-02-21

---

## 总体进度

| Step           | 内容                                             | 状态          |
| -------------- | ------------------------------------------------ | ------------- |
| Step 1         | 框架设计与批判性审查                             | ✅ Done       |
| Step 2         | 生成所有模板文档                                 | ✅ Done       |
| Step 3         | 阶段0: fhirtypes + definitions 分析 (L1+L2)      | ✅ Done       |
| Step 3a        | generator/fhirtypes 生成流程深度分析 (L2+WF)     | ✅ Done       |
| Step 3a-ALG    | ALG-001 StructureDefinitionParser 算法抽象 (L4)  | ✅ Done       |
| Step 3b-server | WF-SERVER-001 loadStructureDefinitions 分析 (L3) | ✅ Done       |
| WF-MIG-001     | Migration Pipeline 总控流程 (L3)                 | ✅ Done       |
| WF-MIG-002     | Resource Table Schema Strategy (L3)              | ✅ Done       |
| WF-MIG-003     | Search Parameter → Column/Index Mapping (L3)     | ✅ Done       |
| WF-MIG-004     | Lookup Table Strategy (L3)                       | ✅ Done       |
| WF-MIG-005     | Schema Diff & Migration Generation (L3)          | ✅ Done       |
| Step 3b        | 阶段1: core/outcomes 分析 (L1+L2)                | ⬜ NotStarted |
| Step 3c        | 阶段2: core/utils 分析 (L1+L2)                   | ⬜ NotStarted |
| Step 4         | 阶段3-4: core/typeschema + fhirpath (L1+L2+L4)   | ⬜ NotStarted |
| Step 5         | 阶段5-6: core/search + core/client (L1+L2)       | ⬜ NotStarted |
| Step 6         | 阶段7: fhir-router (L1+L2)                       | ⬜ NotStarted |
| Step 7         | 阶段8-11: server 核心文件 (L1+L2)                | ⬜ NotStarted |
| Step 8         | WF-001 完整 Workflow 分析 (L3)                   | ⬜ NotStarted |
| Step 9         | ALG-001/ALG-002 算法抽象 (L4)                    | ⬜ NotStarted |

---

## 分析路线图

```
阶段0: fhirtypes        ← 纯类型，建立类型语言基础
阶段1: core/outcomes    ← 最简单，建立 OperationOutcome 认知
阶段2: core/utils       ← 工具函数，理解基础设施
阶段3: core/typeschema  ← 验证引擎 (ALG-001)
阶段4: core/fhirpath    ← FHIRPath 引擎 (ALG-002)
阶段5: core/search      ← 搜索解析
阶段6: core/client      ← HTTP 客户端
阶段7: fhir-router      ← 路由 + Repository 抽象
阶段8: server/context   ← 请求上下文
阶段9: server/fhir/sql  ← SQL 构建器
阶段10: server/fhir/repo ← 核心 Repository
阶段11: server/fhir/search ← 搜索实现
阶段12: WF-001 (L3+L4)  ← 第一个完整 Workflow
```

---

## 文件索引

| 文件                                              | 说明                                        |
| ------------------------------------------------- | ------------------------------------------- |
| `00_INDEX.md`                                     | 总索引，Package总览，Workflow索引，算法索引 |
| `01_STATIC_INVENTORY/FUNCTION_INDEX.csv`          | 函数记录表（持续更新）                      |
| `02_MODULE_SUMMARIES/TEMPLATE_MODULE_SUMMARY.md`  | 模块分析模板                                |
| `02_MODULE_SUMMARIES/[package].md`                | 每包模块分析（逐步生成）                    |
| `03_WORKFLOW_ANALYSIS/TEMPLATE_WORKFLOW.md`       | Workflow 分析模板                           |
| `03_WORKFLOW_ANALYSIS/WF-XXX_[name].md`           | 每个 Workflow 分析                          |
| `04_ALGORITHM_ABSTRACTION/TEMPLATE_ALGORITHM.md`  | 算法抽象模板                                |
| `04_ALGORITHM_ABSTRACTION/ALG-XXX_[name].md`      | 每个算法文档                                |
| `05_COMPARATIVE_ANALYSIS/TEMPLATE_COMPARATIVE.md` | 对比验证模板                                |
