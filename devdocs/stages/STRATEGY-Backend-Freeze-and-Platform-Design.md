# 战略分析：后端冻结 + Platform 设计

```yaml
document_type: strategic_analysis
version: v1.0
status: DRAFT — 待讨论确认
created_at: 2026-02-28
scope: 后端最终完善/冻结 + Platform 前端设计方向
```

---

## 1. 整体定位

MedXAI 定位为 **HIS 信息平台**，未来承载门诊系统等一系列业务系统。
当前后端（fhir-core / fhir-persistence / fhir-server / fhir-client）已具备完整的 FHIR R4 能力。

**两条工作线：**

| 工作线                      | 目标                                                              | 风险             |
| --------------------------- | ----------------------------------------------------------------- | ---------------- |
| **A: 后端最终完善 → 冻结**  | 确保 persistence/repo 100% 正确，补齐遗漏的 server 路由，然后冻结 | 低 — 仅 additive |
| **B: Platform 设计 → 执行** | 功能设计 → 技术选型 → 分步实施                                    | 新包，零后端风险 |

---

## 2. 工作线 A：后端最终完善与冻结

### 2.1 当前后端能力盘点

#### fhir-persistence（Layer 1 — 结构冻结）

| 能力                                                     | 状态 | 备注                       |
| -------------------------------------------------------- | ---- | -------------------------- |
| 153 资源类型 DDL                                         | ✅   | 4897 DDL 语句              |
| CRUD（create/read/update/delete）                        | ✅   | TOCTOU 修复，FOR UPDATE 锁 |
| 软删除 + 历史版本                                        | ✅   |                            |
| 搜索（token/string/reference/date/number/uri/composite） | ✅   |                            |
| 搜索列索引（Row Indexer）                                | ✅   |                            |
| \_include / \_revinclude                                 | ✅   |                            |
| Chained Search                                           | ✅   |                            |
| Conditional Operations                                   | ✅   |                            |
| Lookup Tables                                            | ✅   |                            |
| Transaction/Batch                                        | ✅   | ACID                       |
| Multi-tenant（projectId 隔离）                           | ✅   | OperationContext           |
| Schema Migration 工具                                    | ✅   |                            |

#### fhir-server（Layer 2 — 功能稳定）

| 路由                          | 方法                            | 状态       |
| ----------------------------- | ------------------------------- | ---------- |
| `/:type`                      | POST (create)                   | ✅         |
| `/:type/:id`                  | GET (read)                      | ✅         |
| `/:type/:id`                  | PUT (update)                    | ✅         |
| `/:type/:id`                  | DELETE                          | ✅         |
| `/:type/:id`                  | PATCH (JSON Patch)              | ✅         |
| `/:type/:id/_history`         | GET (history)                   | ✅         |
| `/:type/:id/_history/:vid`    | GET (vread)                     | ✅         |
| `/:type`                      | GET (search)                    | ✅         |
| `/:type/_search`              | POST (search)                   | ✅         |
| `/:compartment/:id/:type`     | GET (compartment search)        | ✅         |
| `/`                           | POST (Bundle transaction/batch) | ✅         |
| `/:type/$validate`            | POST                            | ✅         |
| `/:type/:id/$everything`      | GET                             | ✅         |
| `/:type`                      | DELETE (conditional)            | ✅         |
| `/metadata`                   | GET (CapabilityStatement)       | ✅         |
| `/auth/login`                 | POST                            | ✅         |
| `/oauth2/token`               | POST                            | ✅         |
| `/.well-known/jwks.json`      | GET                             | ✅         |
| `/ValueSet/$expand`           | POST + GET/:id                  | ✅ Phase K |
| `/CodeSystem/$validate-code`  | POST + GET/:id                  | ✅ Phase K |
| `/CodeSystem/$lookup`         | POST + GET/:id                  | ✅ Phase K |
| `/admin/projects`             | POST + GET/:id                  | ✅ Phase I |
| `/admin/projects/:id/invite`  | POST                            | ✅ Phase I |
| `/admin/projects/:id/members` | GET                             | ✅ Phase I |
| `/admin/clients`              | POST + GET/:id                  | ✅ Phase I |

#### fhir-client（Layer 3）

| 能力                      | 状态       |
| ------------------------- | ---------- |
| CRUD + Search + History   | ✅         |
| Auto-Batch                | ✅ Phase J |
| Binary/Attachment         | ✅ Phase J |
| PKCE Login                | ✅ Phase J |
| ClientSubscriptionManager | ✅ Phase M |

### 2.2 与 Medplum Server 对比 — 缺失的路由

基于 Medplum Server 的路由分析，以下是 MedXAI fhir-server **尚未实现** 的端点：

| 类别                   | 端点                                    | Medplum 实现 | 优先级  | 说明                                                |
| ---------------------- | --------------------------------------- | ------------ | ------- | --------------------------------------------------- |
| **Bulk Export**        | `GET /$export`                          | ✅           | 🔴 高   | FHIR Bulk Data Access，对 Platform 数据导出至关重要 |
| **Bulk Export**        | `GET /:type/$export`                    | ✅           | 🔴 高   | Type-level bulk export                              |
| **GraphQL**            | `POST /$graphql`                        | ✅           | 🟡 中   | 前端查询效率大幅提升，但非必须                      |
| **GraphQL**            | `POST /:type/:id/$graphql`              | ✅           | 🟡 中   | Instance-level GraphQL                              |
| **Binary Streaming**   | `POST /Binary` + multipart              | ✅           | 🟡 中   | 大文件流式上传                                      |
| **Binary Streaming**   | `GET /Binary/:id`                       | ✅           | 🟡 中   | 流式下载                                            |
| **Bot**                | `POST /Bot/:id/$execute`                | ✅           | 🟢 低   | 自动化工作流引擎                                    |
| **Bot**                | `POST /Bot/:id/$deploy`                 | ✅           | 🟢 低   | Bot 部署                                            |
| **Email**              | `POST /$send`                           | ✅           | 🟢 低   | 邮件发送                                            |
| **SCIM**               | `/scim/v2/Users`                        | ✅           | 🔵 可选 | 企业用户同步                                        |
| **Agent**              | `/Agent/:id/$push`                      | ✅           | 🔵 可选 | 本地代理推送                                        |
| **Reindex**            | `POST /:type/$reindex`                  | ✅           | 🟡 中   | 搜索索引重建（运维必需）                            |
| **Async Jobs**         | `GET /_async/:id`                       | ✅           | 🟡 中   | 异步操作状态查询                                    |
| **System History**     | `GET /_history`                         | ✅           | 🟢 低   | 系统级历史                                          |
| **Type History**       | `GET /:type/_history`                   | ✅           | 🟢 低   | persistence 层已有 readTypeHistory                  |
| **Conditional Create** | `POST /:type` + If-None-Exist           | ✅           | 🟡 中   | persistence 层已支持                                |
| **Conditional Update** | `PUT /:type?search`                     | ✅           | 🟡 中   | persistence 层已支持                                |
| **$diff**              | `GET /:type/:id/$diff`                  | ✅           | 🟢 低   | 版本差异比较                                        |
| **$graph**             | `POST /:type/:id/$graph`                | ✅           | 🟢 低   | GraphDefinition 遍历                                |
| **SMART Config**       | `GET /.well-known/smart-configuration`  | ✅           | 🟡 中   | SMART on FHIR 标准                                  |
| **OpenID Config**      | `GET /.well-known/openid-configuration` | ✅           | 🟡 中   | OpenID Connect 发现                                 |
| **UserInfo**           | `GET /oauth2/userinfo`                  | ✅           | 🟡 中   | OAuth2 用户信息                                     |
| **Register**           | `POST /auth/register`                   | ✅           | 🟡 中   | 自助注册                                            |

### 2.3 建议的后端完善路径

按优先级分批次：

**批次 1（Platform 前端必需 — 阻塞 Platform 开发）:**

| 端点                                               | 原因                       |
| -------------------------------------------------- | -------------------------- |
| `GET /:type/_history`                              | 已有 persistence，仅需路由 |
| `PUT /:type?search` (conditional update)           | persistence 已支持         |
| `POST /:type` + If-None-Exist (conditional create) | persistence 已支持         |
| `GET /.well-known/openid-configuration`            | Platform 登录需要          |
| `GET /oauth2/userinfo`                             | Platform 登录需要          |
| `POST /auth/register`                              | 用户自助注册               |
| `POST /:type/$reindex`                             | 运维必需                   |

**批次 2（增强 — Platform 体验优化）:**

| 端点                                   | 原因               |
| -------------------------------------- | ------------------ |
| `POST /$graphql`                       | 前端复杂查询效率   |
| `POST/GET /Binary` streaming           | 文件管理           |
| `GET /$export`                         | 数据导出           |
| `GET /_async/:id`                      | 异步操作           |
| `GET /.well-known/smart-configuration` | SMART on FHIR 合规 |

**批次 3（锦上添花 — 可延后）:**

| 端点                 | 原因               |
| -------------------- | ------------------ |
| Bot $execute/$deploy | 自动化（暂不需要） |
| $send (email)        | 可外部集成         |
| $diff / $graph       | 高级功能           |
| SCIM / Agent         | 企业集成           |

### 2.4 Persistence/Repo 正确性保障

当前测试覆盖：

| 测试集                       | 数量       | 范围                                                           |
| ---------------------------- | ---------- | -------------------------------------------------------------- |
| fhir-core                    | ~2400+     | Model + Parser + Context + Validator                           |
| fhir-persistence unit        | ~600+      | SQL builder + Row builder + History + Repo unit                |
| fhir-persistence integration | ~350+      | Real PostgreSQL CRUD + Search + Transactions                   |
| fhir-server                  | 138        | HTTP routes + operations + admin + terminology + subscriptions |
| fhir-client                  | 56         | SDK unit + Phase J                                             |
| **合计**                     | **~3600+** | **0 failures**                                                 |

**建议的额外验证步骤（冻结前）：**

1. **Persistence 压力测试** — 并发写入 + 大数据量搜索性能基线
2. **Search 完整性审计** — 验证所有 search parameter types 的 WHERE 生成正确性
3. **Multi-tenant 渗透测试** — 确保跨项目无法读取/搜索到其他项目资源
4. **历史版本完整性** — 验证 update/delete 后历史链条完整
5. **事务回滚验证** — 确保 transaction bundle 中部分失败时完全回滚

完成上述验证后，**Layer 0 + Layer 1 正式冻结**，仅接受 Bug Fix。

---

## 3. 工作线 B：Platform 设计

### 3.1 "Platform" 命名分析

| 命名方案           | 优点                                                                    | 缺点                         |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------- |
| `@medxai/platform` | 清晰表达"平台管理"定位；与 HIS 平台概念一致；区别于 `app`（偏业务应用） | 可能与后端"平台层"概念混淆   |
| `@medxai/app`      | Medplum 惯例；简单直接                                                  | 不够突出"管理"属性           |
| `@medxai/admin`    | 明确是管理端                                                            | 过于狭窄，不涵盖未来业务组件 |
| `@medxai/console`  | AWS 风格                                                                | 偏运维，不适合医疗           |

**建议：`@medxai/platform` 合理且贴切。**

理由：

- MedXAI 定位为 HIS 信息平台，`platform` 天然呼应
- Platform 包含两个维度：**管理控制台**（项目/用户/权限管理） + **资源浏览器**（FHIR 数据可视化）
- 未来门诊系统等业务应用可以作为独立包（如 `@medxai/outpatient`），而 `platform` 是它们的管理入口
- 包名建议：`packages/platform`，页面路由前缀 `/platform/`

### 3.2 Medplum 架构对比分析

#### Medplum 的包结构

```
medplum/
├── packages/
│   ├── core/          # 类型 + Client SDK + 工具函数
│   ├── server/        # Express FHIR Server
│   ├── app/           # React Admin 前端应用
│   ├── react/         # 200+ React 组件库 (非常庞大)
│   ├── definitions/   # FHIR 定义数据
│   ├── fhirtypes/     # TypeScript FHIR 类型
│   ├── cli/           # 命令行工具
│   ├── agent/         # 本地代理
│   ├── cdk/           # AWS 基础设施
│   └── bot-layer/     # Lambda Bot
```

#### MedXAI 当前包结构

```
medxai/
├── packages/
│   ├── fhir-core/         # Model + Parser + Context + Validator + FHIRPath
│   ├── fhir-persistence/  # Schema + DDL + Repository + Search
│   ├── fhir-server/       # Fastify FHIR Server
│   ├── fhir-client/       # Client SDK
│   └── platform/          # 🆕 待建 — 前端管理应用
```

#### Medplum @medplum/react 分析

**规模：** 200+ 组件，是 Medplum 中代码量最大的包之一。

**核心组件分类：**

| 类别                  | 组件数量 | 代表组件                                                           | MUI 是否有等价物           |
| --------------------- | -------- | ------------------------------------------------------------------ | -------------------------- |
| **FHIR 数据类型输入** | ~30      | AddressInput, HumanNameInput, CodeableConceptInput, ReferenceInput | ❌ 无 — 需自建             |
| **搜索/表格**         | ~10      | SearchControl, ResourceTable                                       | ✅ MUI DataGrid 更强       |
| **资源表单**          | ~5       | ResourceForm, BackboneElementInput                                 | ❌ 无 — 需自建             |
| **布局/导航**         | ~15      | Header, Navbar, Document, TabPanel                                 | ✅ MUI 完整                |
| **认证**              | ~5       | SignInForm, RegisterForm, MedplumProvider                          | 部分 — 需定制              |
| **展示**              | ~20      | DiagnosticReportDisplay, Timeline, StatusBadge                     | 部分                       |
| **Hook**              | ~15      | useMedplum, useResource, useSearch, useSearchResources             | ❌ 需围绕 fhir-client 自建 |
| **基础 UI**           | ~30      | Button, TextInput, DateTimeInput                                   | ✅ MUI 完整                |

**关键结论：**

- Medplum 自建了大量 **FHIR 特化组件**（数据类型输入、资源表单、搜索控件），这部分无法用 MUI 替代
- 但 **基础 UI 层** Medplum 用了 Mantine（类似 MUI），这部分 MUI 完全可替代且更成熟
- MUI DataGrid 确实比 Medplum 的 ResourceTable/SearchControl 功能更丰富

### 3.3 MUI 选型分析

| 维度       | MUI                 | Mantine (Medplum 选择) | Ant Design |
| ---------- | ------------------- | ---------------------- | ---------- |
| 成熟度     | ⭐⭐⭐⭐⭐ 最成熟   | ⭐⭐⭐                 | ⭐⭐⭐⭐   |
| DataGrid   | ⭐⭐⭐⭐⭐ 行业最佳 | ❌ 无内置              | ⭐⭐⭐     |
| TypeScript | ⭐⭐⭐⭐⭐          | ⭐⭐⭐⭐               | ⭐⭐⭐⭐   |
| 主题定制   | ⭐⭐⭐⭐⭐          | ⭐⭐⭐⭐               | ⭐⭐⭐     |
| 企业场景   | ⭐⭐⭐⭐⭐          | ⭐⭐⭐                 | ⭐⭐⭐⭐   |
| 社区生态   | ⭐⭐⭐⭐⭐          | ⭐⭐⭐                 | ⭐⭐⭐⭐   |
| 包大小     | 较大                | 适中                   | 较大       |

**结论：MUI 是合理选择**，尤其是 DataGrid Pro 对于资源浏览、搜索结果展示、审计日志等表格密集场景非常适合。

**建议技术栈：**

```
前端技术栈:
├── React 18+
├── TypeScript 5+
├── MUI v5/v6 (组件库)
│   ├── @mui/material (核心组件)
│   ├── @mui/x-data-grid (表格)
│   └── @mui/icons-material (图标)
├── React Router v6 (路由)
├── @medxai/fhir-client (FHIR 通信)
├── Vite (构建工具)
└── Vitest (测试)
```

### 3.4 Platform 功能模块设计（初步）

#### 模块 1：认证与用户

| 页面               | 功能         | 后端依赖                       |
| ------------------ | ------------ | ------------------------------ |
| `/login`           | 登录表单     | ✅ /auth/login + /oauth2/token |
| `/register`        | 注册表单     | ⚠️ 需要 /auth/register 路由    |
| `/profile`         | 个人资料编辑 | ✅ CRUD User/Practitioner      |
| `/change-password` | 密码修改     | ⚠️ 需要新路由                  |

#### 模块 2：项目管理（Admin）

| 页面                          | 功能     | 后端依赖                           |
| ----------------------------- | -------- | ---------------------------------- |
| `/admin/projects`             | 项目列表 | ✅ GET /admin/projects             |
| `/admin/projects/:id`         | 项目详情 | ✅ GET /admin/projects/:id         |
| `/admin/projects/:id/members` | 成员管理 | ✅ GET /admin/projects/:id/members |
| `/admin/projects/:id/invite`  | 邀请用户 | ✅ POST /admin/projects/:id/invite |
| `/admin/projects/:id/clients` | 应用管理 | ✅ POST/GET /admin/clients         |
| `/admin/projects/:id/access`  | 权限策略 | ✅ CRUD AccessPolicy               |
| `/admin/projects/:id/bots`    | 自动化   | 🔵 未来                            |

#### 模块 3：资源浏览器

| 页面                           | 功能                    | 后端依赖                    |
| ------------------------------ | ----------------------- | --------------------------- |
| `/resources/:type`             | 资源列表（DataGrid）    | ✅ GET /:type (search)      |
| `/resources/:type/:id`         | 资源详情                | ✅ GET /:type/:id           |
| `/resources/:type/:id/edit`    | 资源编辑（JSON + Form） | ✅ PUT /:type/:id           |
| `/resources/:type/:id/history` | 版本历史                | ✅ GET /:type/:id/\_history |
| `/resources/:type/new`         | 新建资源                | ✅ POST /:type              |

#### 模块 4：术语管理

| 页面                        | 功能              | 后端依赖          |
| --------------------------- | ----------------- | ----------------- |
| `/terminology/code-systems` | CodeSystem 列表   | ✅ search         |
| `/terminology/value-sets`   | ValueSet 列表     | ✅ search         |
| `/terminology/expand`       | ValueSet 展开测试 | ✅ $expand        |
| `/terminology/validate`     | 编码验证测试      | ✅ $validate-code |

#### 模块 5：实时监控

| 页面                  | 功能       | 后端依赖             |
| --------------------- | ---------- | -------------------- |
| `/subscriptions`      | 订阅管理   | ✅ CRUD Subscription |
| `/subscriptions/live` | 实时事件流 | ✅ WebSocket         |
| `/audit`              | 审计日志   | ✅ search AuditEvent |

#### 模块 6（未来）：业务系统入口

| 页面                 | 功能     | 备注       |
| -------------------- | -------- | ---------- |
| `/clinic/outpatient` | 门诊系统 | 未来独立包 |
| `/clinic/pharmacy`   | 药房系统 | 未来独立包 |
| `/clinic/lab`        | 检验系统 | 未来独立包 |

### 3.5 需要自建的 FHIR 特化组件

这是无法从 MUI 直接获得的，参考 Medplum @medplum/react，但按需裁剪：

**Phase 1（MVP 必需）：**

| 组件                      | 说明                               | 复杂度 |
| ------------------------- | ---------------------------------- | ------ |
| `<FhirProvider>`          | Context Provider，包装 fhir-client | 低     |
| `useFhirClient()`         | Hook：获取 client 实例             | 低     |
| `useResource(type, id)`   | Hook：获取单个资源                 | 低     |
| `useSearch(type, params)` | Hook：搜索资源                     | 中     |
| `<ResourceTable>`         | 基于 MUI DataGrid 的资源表格       | 中     |
| `<ResourceForm>`          | JSON Editor + 基础表单             | 中     |
| `<ReferenceInput>`        | 引用选择器（autocomplete）         | 中     |
| `<CodeableConceptInput>`  | 编码输入（支持术语搜索）           | 中     |
| `<LoginForm>`             | 登录表单                           | 低     |

**Phase 2（体验增强）：**

| 组件                        | 说明              |
| --------------------------- | ----------------- |
| `<HumanNameInput>`          | 姓名结构化输入    |
| `<AddressInput>`            | 地址结构化输入    |
| `<DateTimeInput>`           | FHIR 日期时间输入 |
| `<IdentifierInput>`         | 标识符输入        |
| `<AttachmentInput>`         | 文件上传          |
| `<ResourceTimeline>`        | 资源时间线        |
| `<DiagnosticReportDisplay>` | 报告展示          |

---

## 4. 回答你的 8 个问题

### Q1：中文继续推后 ✅

同意。Layer 0+1 变更风险最高，应在 Platform 稳定后再做。
中文本地化涉及：i18n 框架 → 拼音搜索索引 → 中文 Profile → 中国术语集。
这些变更需要修改 fhir-core 和 persistence schema，与"冻结"目标冲突。

### Q2："Platform" 命名是否合理？✅ 合理

`@medxai/platform` 恰当地表达了：

- 不只是 admin 后台（还有资源浏览器、术语管理等）
- 不只是单一 app（是多个业务系统的管理入口）
- 与 MedXAI 的 HIS 平台定位一致

### Q3：需要详细功能设计？✅ 绝对需要

在编码前，建议产出以下设计文档：

1. **功能规格书** — 每个模块的页面、交互、数据流
2. **API 依赖矩阵** — 每个页面需要哪些 server 端点（有些还不存在）
3. **组件规划** — 需要自建哪些 FHIR 组件 vs 直接用 MUI
4. **路由规划** — URL 结构、嵌套布局、权限控制

### Q4：Medplum @medplum/react 非常庞大 — 是否需要全部对标？❌ 不需要

Medplum 的 200+ 组件是多年积累的结果。建议：

- **Phase 1** 只实现 ~10 个核心组件（见 3.5 节 Phase 1）
- **按需增长** — 业务需要什么就加什么
- **基础 UI 完全用 MUI** — 不重复造轮子

### Q5：是否分析 Medplum UI/App 功能？✅ 建议做

Medplum App 的功能模块（见 3.4 节）值得参考：

- **资源浏览器** — Medplum 的核心功能，我们必须有
- **Admin 页面** — 项目/成员/权限管理
- **搜索 UI** — 高级搜索条件构建
- **Bot 管理** — 可延后
- **GraphiQL** — 如果实现了 GraphQL 端点

但 **不需要 1:1 复制**，而是提取适合 HIS 场景的功能子集。

### Q6：是否整理 Medplum Server 全部路由？✅ 已在 2.2 节完成

关键发现：

- **高优先级缺失**：Bulk Export、/auth/register、/oauth2/userinfo、openid-configuration、conditional create/update（persistence 已支持但路由未暴露）、$reindex
- **中优先级**：GraphQL、Binary streaming、async jobs
- **低优先级**：Bot、Email、SCIM、Agent

**建议先补齐批次 1（~7 个路由）再开始 Platform 开发**，因为这些是 Platform 登录/注册/运维的必要接口。

### Q7：MUI + DataGrid ✅ 正确选择

- MUI DataGrid 是表格场景的行业最佳（排序/过滤/分页/列固定/虚拟滚动/导出）
- 资源浏览器、审计日志、搜索结果 — 都是表格密集场景
- MUI 企业生态成熟，长期维护有保障
- 对比 Medplum 选择的 Mantine，MUI DataGrid 明显更强

### Q8：确保 Persistence/Repo 100% 正确 ✅ 最高优先级

见 2.4 节的额外验证步骤建议。
在冻结前，建议执行一轮 **Persistence 正确性审计**，包括：

- 并发压力测试
- 搜索完整性验证
- 多租户渗透测试
- 历史版本链完整性
- 事务回滚验证

---

## 5. 建议的执行路线图

```
Phase P0: 后端完善（~1-2 周）
   ├── P0.1: Persistence 正确性审计 + 压力测试
   ├── P0.2: 补齐批次 1 路由（7 个）
   ├── P0.3: 全量回归测试
   └── P0.4: 正式冻结 Layer 0 + Layer 1 + Layer 2 核心
           （此后仅接受 Bug Fix + Additive Route）

Phase P1: Platform 设计（~1 周）
   ├── P1.1: 功能规格书
   ├── P1.2: API 依赖矩阵
   ├── P1.3: 路由规划 + 组件规划
   ├── P1.4: 技术架构设计（Vite + React + MUI + fhir-client）
   └── P1.5: 设计评审 → 确认

Phase P2: Platform MVP（~2-3 周）
   ├── P2.1: 项目脚手架（Vite + React + MUI + Router）
   ├── P2.2: 认证模块（Login / Register / Token 管理）
   ├── P2.3: 资源浏览器（列表 + 详情 + 编辑）
   ├── P2.4: Admin 模块（项目 + 成员 + 权限）
   └── P2.5: FHIR Hooks + 基础组件

Phase P3: Platform 增强（~2 周）
   ├── P3.1: 术语管理 UI
   ├── P3.2: 订阅 / 实时监控 UI
   ├── P3.3: 审计日志 UI
   ├── P3.4: FHIR 特化输入组件（Phase 2）
   └── P3.5: 补齐批次 2 路由（GraphQL, Binary, Export）

Phase L: 中文本地化（延后）
   └── 在 Platform 稳定后执行
```

---

## 6. 决策点（已确认 2026-02-28）

| #   | 问题     | 决策                        | 状态      |
| --- | -------- | --------------------------- | --------- |
| D1  | 包名     | `@medxai/platform`          | ✅ 已确认 |
| D2  | UI 框架  | MUI                         | ✅ 已确认 |
| D3  | 构建工具 | Vite（纯 SPA，无 SSR 需求） | ✅ 已确认 |
| D4  | 路由     | React Router v6             | ✅ 已确认 |
| D5  | 状态管理 | React Context + fhir-client | ✅ 已确认 |
| D6  | GraphQL  | Phase P3 后实现             | ✅ 已确认 |
| D7  | 执行顺序 | 串行 — 先 P0 再 P1          | ✅ 已确认 |

---

## 7. Phase P0 执行状态

> **Phase P0 已于 2026-02-28 完成。**
>
> - 详细执行记录见 `devdocs/stages/Phase-P0-Backend-Finalization.md`
> - 12 个新路由已实现，42 个新测试全部通过
> - fhir-server 全量回归：19 test files, 387/387 tests, 0 regressions
> - tsc --noEmit: clean (fhir-server + fhir-client)
> - **Layer 0 + Layer 1 + Layer 2 正式冻结，仅接受 Bug Fix**
>
> **下一步：Phase P1 — Platform 设计（等待用户启动）**
