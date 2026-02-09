# 中文原生支持 (Native Chinese Language Support)

**Status:** Core Development Principle  
**Last Updated:** 2026-02-10  
**Applies to:** All phases of MedXAI FHIR implementation

---

## 核心原则 (Core Principles)

MedXAI FHIR 实现将**中文作为一等公民**，而非事后翻译。这意味着从架构设计、数据模型、API 设计到用户界面，都必须在设计之初就考虑中文语言特性与中国医疗场景需求。

**Native Chinese support** means treating Chinese as a **first-class citizen** from the ground up, not as an afterthought translation layer. This applies to architecture design, data models, API design, and user interfaces.

---

## 两个核心层面 (Two Core Dimensions)

### 1. 架构设计的原生支持 (Architecture-Level Native Support)

从底层技术架构开始，就必须为中文语言特性预留设计空间：

#### A. 搜索与索引 (Search & Indexing)

**要求 (Requirements):**
- **汉语拼音支持**: SearchParameter 实现必须支持拼音首字母、全拼、中文分词检索
- **多音字处理**: 考虑中文多音字的检索策略（如"重庆"的"重"）
- **同义词与别名**: 支持医学术语的多种中文表达（如"高血压"/"血压升高"）

**技术策略 (Technical Strategy):**
- PostgreSQL: `pg_trgm` + `zhparser`/`jieba` 分词 + 拼音索引扩展
- 或引入 OpenSearch/Elasticsearch 的中文分析器
- SearchParameter 扩展：定义 `:pinyin` modifier 或默认行为

**落地阶段 (Implementation Phase):** Phase 3 (fhir-context) / Phase 4 (SearchParameter)

---

#### B. Profile 设计 (Profile Design)

**要求 (Requirements):**
- **中文元数据优先**: ElementDefinition 的 `short`/`definition`/`comment` 默认提供中文
- **多语言支持机制**: 利用 FHIR `translation` extension 或自定义策略
- **中国特色扩展**: 支持身份证、医保号、户籍、民族等中国特有字段

**技术策略 (Technical Strategy):**
- Profile 工具链支持"中文优先"的 StructureDefinition 编写
- 中文 Profile 库独立管理（见下文"医疗数据支持"）
- 验证器能够识别并正确处理中文字段约束

**落地阶段 (Implementation Phase):** Phase 4 (fhir-profile)

---

#### C. 错误信息与验证 (Error Messages & Validation)

**要求 (Requirements):**
- **中文错误提示**: ParseIssue/ValidationIssue 提供中文错误消息
- **路径本地化**: 错误路径如 `Patient.name.given` 可选展示为"患者姓名-名"
- **上下文化帮助**: 错误信息包含中文帮助文档链接

**技术策略 (Technical Strategy):**
- 错误码 → 中文错误模板映射（带参数插值）
- i18n 框架集成（如 `i18next`）
- 路径翻译字典（基于 StructureDefinition 的中文 `short`）

**落地阶段 (Implementation Phase):** Phase 5 (fhir-validator)

---

#### D. API 设计 (API Design)

**要求 (Requirements):**
- **中文参数支持**: 允许中文搜索参数值（如 `name=张三`）
- **响应本地化**: 支持 `Accept-Language: zh-CN` 头部
- **术语服务**: 提供中文 display 查询 API（类似 `$lookup`）

**技术策略 (Technical Strategy):**
- FHIR REST API 完全兼容标准，同时支持中文输入
- 术语服务端点：`/terminology/$lookup?system=...&code=...&language=zh`
- 响应中优先返回中文 display（如果可用）

**落地阶段 (Implementation Phase):** Phase 6+ (Server API)

---

#### E. 用户界面 (User Interface)

**要求 (Requirements):**
- **全中文界面**: 菜单、按钮、提示、空状态、错误信息全部中文
- **日期/数字本地化**: 使用中国习惯格式（如 `2026年2月10日`）
- **语言切换**: 支持中/英切换，默认中文

**技术策略 (Technical Strategy):**
- React i18n 框架（如 `react-i18next`）
- 日期库本地化（如 `dayjs` 中文 locale）
- 所有 UI 组件从设计开始就考虑中文排版

**落地阶段 (Implementation Phase):** Phase 7+ (UI)

---

### 2. 医疗数据的中文支持 (Medical Data Chinese Support)

中文医疗数据不可能由单一项目完成，需要**独立的中文医疗资源项目**逐步建设。

#### A. 中文术语数据源策略 (Chinese Terminology Data Sources)

**官方数据源 (Official Sources):**
- 国家医保局术语库: ICD-10-CN、医保目录、诊疗项目编码
- 卫健委标准: WS 363-2011（卫生信息数据元目录）等
- SNOMED CT 中文版（如可获得授权）
- LOINC 中文版（部分公开）
- 国家药监局: 药品通用名、商品名

**社区/自建数据源 (Community/Self-Built Sources):**
- 常用药品名称（通用名/商品名）
- 常用检查/检验项目
- 常用诊断/症状
- 地区性术语（如地方病名称）

**数据格式要求 (Data Format Requirements):**
- 存储为 FHIR CodeSystem/ValueSet 资源
- 每个概念包含：
  - `code`: 官方编码
  - `display`: 中文标准名称
  - `designation`: 同义词、简称、全称
  - `property`: 拼音（用于检索）、分类、状态等
- 通过 FHIR Terminology Service API 提供查询

**落地策略 (Implementation Strategy):**
- **第一阶段**: 20-30 个高频 CodeSystem（性别、民族、证件类型、常用诊断）
- **第二阶段**: 扩展到药品、检查、手术、材料等
- **持续维护**: 独立 Git 仓库 + 版本管理 + CI/CD

---

#### B. 中文 Profile 库策略 (Chinese Profile Library Strategy)

**基线 Profile (Baseline Profiles):**
- **CN-Patient**: 中国患者（身份证、医保号、户籍、民族等扩展）
- **CN-Practitioner**: 中国医护人员（医师资格证、执业证书等）
- **CN-Organization**: 中国医疗机构（统一社会信用代码、医疗机构执业许可证）
- **CN-MedicationRequest**: 中国处方（医保目录、限定支付范围、用法用量中文）
- **CN-DiagnosticReport**: 中国检验报告（符合 LIS 规范）
- **CN-Observation**: 中国检验/检查结果（中文项目名、参考范围）

**Profile 管理 (Profile Management):**
- 独立 Git 仓库: `fhir-cn-profiles`
- 版本管理: 遵循语义化版本（Semantic Versioning）
- 发布机制: npm 包 + FHIR Package Registry
- 与 fhir-core 集成: npm 依赖或运行时加载

**质量保证 (Quality Assurance):**
- 每个 Profile 有测试 fixture（真实场景数据）
- 通过 fhir-validator 验证
- 有完整中文文档与使用示例

---

#### C. 数据采集与维护策略 (Data Collection & Maintenance Strategy)

**启动方式 (Bootstrap Approach):**
1. **最小可用集 (MVP)**: 20-30 个高频 CodeSystem
   - 性别（GB/T 2261.1）
   - 民族（GB/T 3304）
   - 证件类型（GA 325）
   - 婚姻状况、学历、职业等
   - 常用诊断（ICD-10-CN 高频 100 条）
2. **逐步扩展**: 按医疗场景优先级扩展
   - 门诊场景: 常用诊断、检查、药品
   - 住院场景: 手术、材料、护理
   - 检验场景: LOINC 中文高频项目

**数据质量标准 (Data Quality Standards):**
- 每个 CodeSystem 必须有:
  - 官方来源引用
  - 版本号与生效日期
  - 至少 5 个测试用例
  - 拼音索引（用于检索）
- 通过 FHIR 验证器验证
- 有中文文档说明使用场景

**维护机制 (Maintenance Mechanism):**
- 定期更新（跟随官方术语库更新）
- 社区贡献机制（Pull Request + Review）
- 版本发布流程（Changelog + Migration Guide）

---

## 独立项目规划 (Independent Project Planning)

### 项目名称 (Project Name)
**fhir-cn-resources** (FHIR 中国医疗资源库)

### 项目范围 (Project Scope)
- **CodeSystem/ValueSet**: 中文术语数据
- **Profile**: 中国场景 StructureDefinition
- **Examples**: 真实场景示例数据
- **Documentation**: 中文使用文档

### 项目结构 (Project Structure)
```
fhir-cn-resources/
├── terminology/
│   ├── codesystems/
│   │   ├── gender.json
│   │   ├── ethnicity.json
│   │   ├── id-type.json
│   │   └── ...
│   └── valuesets/
│       ├── administrative-gender.json
│       └── ...
├── profiles/
│   ├── CN-Patient.json
│   ├── CN-Practitioner.json
│   └── ...
├── examples/
│   ├── patient-example-cn.json
│   └── ...
├── tests/
│   └── ...
└── docs/
    └── ...
```

### 与 MedXAI 集成方式 (Integration with MedXAI)
- **开发阶段**: Git submodule 或 npm link
- **生产阶段**: npm 依赖 `@medxai/fhir-cn-resources`
- **运行时加载**: 通过 fhir-context 模块加载 Profile 与术语

---

## 各 Phase 的中文化要求 (Chinese Support Requirements by Phase)

### Phase 1: fhir-model ✅
- **状态**: 已完成，模型定义语言无关
- **中文化**: 无特殊要求（TypeScript 类型定义）

### Phase 2: fhir-parser ✅
- **状态**: 即将完成
- **中文化要求**:
  - ParseIssue 错误码需预留 i18n 映射点（见 ADR-004）
  - 测试 fixture 包含中文字符串（验证 UTF-8 处理正确）

### Phase 3: fhir-context 🔄
- **中文化要求**:
  - SearchParameter 设计时考虑中文检索策略
  - 预留拼音索引扩展点
  - 术语服务 API 设计（`$lookup` 支持 `language` 参数）

### Phase 4: fhir-profile 🔄
- **中文化要求**:
  - Profile 工具支持中文元数据编写
  - 集成 `fhir-cn-resources` 项目
  - 验证器支持中文字段约束

### Phase 5: fhir-validator 🔄
- **中文化要求**:
  - 错误信息 i18n 框架
  - 中文错误模板与路径翻译

### Phase 6+: Server & UI 🔄
- **中文化要求**:
  - API 支持中文参数与响应本地化
  - UI 全中文界面 + 语言切换
  - 术语 display 自动补全

---

## 成功标准 (Success Criteria)

一个具备"中文原生支持"的 MedXAI FHIR 实现应该满足：

1. **架构层面**:
   - ✅ 中文检索（拼音 + 分词）在 SearchParameter 层面原生支持
   - ✅ Profile 可以用中文编写元数据并正确验证
   - ✅ 错误信息默认中文，路径可本地化

2. **数据层面**:
   - ✅ 至少 20 个高频 CodeSystem 有完整中文 display
   - ✅ 至少 5 个中国场景 Profile（Patient/Practitioner/Organization/MedicationRequest/DiagnosticReport）
   - ✅ 所有术语数据有拼音索引

3. **用户体验层面**:
   - ✅ UI 全中文，无英文残留
   - ✅ 中文搜索体验流畅（支持拼音首字母）
   - ✅ Code 自动展示中文 display

---

## 参考资料 (References)

- **FHIR R4 Specification**: https://hl7.org/fhir/R4/
- **FHIR Translation Extension**: https://hl7.org/fhir/R4/extension-translation.html
- **国家卫健委标准**: http://www.nhc.gov.cn/
- **国家医保局**: http://www.nhsa.gov.cn/
- **ICD-10-CN**: 国家卫健委发布的中国版 ICD-10
- **GB/T 标准**: 中国国家标准（性别、民族、证件类型等）

---

## 相关文档 (Related Documents)

- [ADR-004: Native Chinese Language Support Strategy](./decisions/ADR-004-Native-Chinese-Language-Support-Strategy.md)
- [Phase 3 Detailed Plan](./stages/Phase-3-Detailed-Plan.md) (待创建)
- [Phase 4 Detailed Plan](./stages/Phase-4-Detailed-Plan.md) (待创建)

---

**本文档是 MedXAI FHIR 实现的核心开发原则，所有开发者必须遵循。**
