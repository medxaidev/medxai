# WF-CUS-008: Medplum App 平台全面分析

## 1. 概述

`packages/app` 是 Medplum 的**前端管理平台** (Admin Console)，提供 FHIR 资源浏览/编辑、项目管理、Bot 开发、用户管理等全部管理功能。它是一个纯前端 SPA，通过 `MedplumClient` 与后端 FHIR Server 通信。

### 1.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | React | 19.2.3 | UI 框架 |
| **路由** | react-router | 7.12.0 | SPA 路由 |
| **UI 库** | Mantine | 8.3.13 | 组件库 (core, hooks, notifications, dropzone, spotlight) |
| **图标** | @tabler/icons-react | 3.36.1 | 图标库 |
| **构建** | Vite | 7.3.1 | 开发/构建工具 |
| **CSS** | PostCSS + Mantine 预设 | - | CSS 处理 |
| **JSON Patch** | rfc6902 | 5.1.2 | 资源 Patch 操作 |
| **FHIR 客户端** | @medplum/core (MedplumClient) | 5.0.13 | API 通信 |
| **FHIR UI** | @medplum/react | 5.0.13 | FHIR 专用 React 组件 |
| **类型定义** | @medplum/fhirtypes | 5.0.13 | FHIR 资源 TypeScript 类型 |

### 1.2 项目结构

```
packages/app/
├── index.html          # SPA 入口 HTML
├── vite.config.ts      # Vite 配置 (端口 3000, resolve aliases)
├── package.json        # 依赖声明
├── .env.defaults       # 环境变量默认值
├── src/
│   ├── index.tsx       # 应用初始化入口
│   ├── App.tsx         # 根组件 (AppShell + 导航)
│   ├── AppRoutes.tsx   # 全部路由定义
│   ├── config.ts       # 环境配置
│   ├── utils.ts        # 通用工具函数
│   ├── admin/          # 管理页面 (16 个组件)
│   ├── resource/       # 资源详情页面 (30+ 个组件)
│   ├── lab/            # 实验室页面 (Assays, Panels)
│   ├── components/     # 共享组件 (Header, QuickStatus)
│   └── test-utils/     # 测试工具
└── static/             # 静态资源
```

### 1.3 环境配置

**文件**: `src/config.ts`

| 环境变量 | 类型 | 说明 |
|---------|------|------|
| `MEDPLUM_BASE_URL` | string | 后端 API 地址 |
| `MEDPLUM_CLIENT_ID` | string | OAuth 客户端 ID |
| `GOOGLE_CLIENT_ID` | string | Google 登录客户端 ID |
| `RECAPTCHA_SITE_KEY` | string | reCAPTCHA 站点密钥 |
| `MEDPLUM_REGISTER_ENABLED` | boolean | 是否允许注册 |
| `MEDPLUM_AWS_TEXTRACT_ENABLED` | boolean | 是否启用 AWS Textract |

### 1.4 应用初始化流程

```
index.html
  └→ src/index.tsx::initApp()
      ├→ getConfig()                          # 读取环境变量
      ├→ new MedplumClient({                  # 初始化 FHIR 客户端
      │     baseUrl, clientId,
      │     cacheTime: 60000,                 # 1 分钟缓存
      │     autoBatchTime: 100,               # 100ms 自动批量
      │     onUnauthenticated → /signin       # 未认证重定向
      │  })
      ├→ createTheme()                        # Mantine 主题
      ├→ createBrowserRouter([{ path: '*', element: <App /> }])
      └→ render:
            <StrictMode>
              <MedplumProvider>               # FHIR 上下文
                <MantineProvider>             # UI 主题
                  <Notifications />           # 通知系统
                  <RouterProvider />          # 路由
                </MantineProvider>
              </MedplumProvider>
            </StrictMode>
```

---

## 2. 路由全表

### 2.1 根组件 App

**文件**: `src/App.tsx`

- 使用 `@medplum/react` 的 `AppShell` 组件作为整体布局
- 左侧导航栏由 `UserConfiguration.menu` 动态生成
- 固定添加 "Settings > Security" 菜单项
- 根据资源类型自动匹配图标 (Tabler Icons)
- 使用 `Suspense` + `Loading` 进行懒加载

### 2.2 完整路由映射

**文件**: `src/AppRoutes.tsx`

#### 认证路由 (无需登录)

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/signin` | `SignInPage` | 登录 (邮箱/密码/Google) | `POST /auth/login`, `POST /auth/google` |
| `/oauth` | `OAuthPage` | OAuth2 授权流程 | `GET /auth/clientinfo/:id`, `POST /auth/login` |
| `/resetpassword` | `ResetPasswordPage` | 重置密码请求 | `POST /auth/resetpassword` |
| `/setpassword/:id/:secret` | `SetPasswordPage` | 设置新密码 | `POST /auth/setpassword` |
| `/verifyemail/:id/:secret` | `VerifyEmailPage` | 验证邮箱 | `POST /auth/verifyemail` |
| `/register` | `RegisterPage` | 注册新用户+项目 | `POST /auth/newuser`, `POST /auth/newproject` |

#### 用户设置路由 (需要登录)

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/changepassword` | `ChangePasswordPage` | 修改密码 | `POST /auth/changepassword` |
| `/security` | `SecurityPage` | 安全设置 (会话/MFA) | `GET /auth/me`, `POST /auth/revoke` |
| `/mfa` | `MfaPage` | MFA 注册/管理 | `GET /auth/mfa/status`, `POST /auth/mfa/enroll`, `POST /auth/mfa/disable` |

#### 核心功能路由

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/` | `HomePage` | 默认搜索页 (Patient) | `GET /fhir/R4/:resourceType` |
| `/:resourceType` | `HomePage` | 资源类型搜索列表 | `GET /fhir/R4/:resourceType` |
| `/batch` | `BatchPage` | Batch/Transaction 创建 | `POST /fhir/R4` |
| `/bulk/:resourceType` | `BulkAppPage` | 批量操作 (选中资源) | `GET /fhir/R4/Questionnaire` |
| `/smart` | `SmartSearchPage` | FHIRPath 高级搜索 | `GET /fhir/R4/:resourceType` |
| `/forms/:id` | `FormPage` | Questionnaire 填写 | `GET /fhir/R4/Questionnaire/:id`, `POST /fhir/R4/QuestionnaireResponse` |

#### 资源详情路由 (`/:resourceType/:id`)

**布局组件**: `ResourcePage` — 显示 PatientHeader / ResourceHeader + Tab 导航 + Outlet

| Tab / 子路径 | 组件 | 功能 | 调用的 API |
|-------------|------|------|-----------|
| (默认) / `timeline` | `TimelinePage` | 资源时间线 (按类型切换: Patient/Encounter/ServiceRequest/Default) | `GET /fhir/R4/:type` (时间线相关资源) |
| `details` | `DetailsPage` | 资源结构化展示 (支持 Profile 选择) | `GET /fhir/R4/:type/:id` |
| `edit` | `EditPage` | 表单编辑 (支持 PUT 和 JSON Patch) | `PUT /fhir/R4/:type/:id`, `PATCH /fhir/R4/:type/:id` |
| `json` | `JsonPage` | JSON 编辑器 | `PUT /fhir/R4/:type/:id` |
| `delete` | `DeletePage` | 删除确认 | `DELETE /fhir/R4/:type/:id` |
| `history` / `_history` | `HistoryPage` | 版本历史表 | `GET /fhir/R4/:type/:id/_history` |
| `history/:versionId` | `ResourceVersionPage` | 特定版本详情 | `GET /fhir/R4/:type/:id/_history/:vid` |
| `blame` | `BlamePage` | 版本差异视图 | `GET /fhir/R4/:type/:id/_history` |
| `event` | `AuditEventPage` | AuditEvent 审计日志 | `GET /fhir/R4/AuditEvent?entity=:ref` |
| `apps` | `AppsPage` | 关联的 Questionnaire + SMART App | `GET /fhir/R4/Questionnaire`, `GET /fhir/R4/ClientApplication` |
| `profiles` | `ProfilesPage` | Profile 管理 (StructureDefinition 约束) | `GET/PUT /fhir/R4/:type/:id` |
| `export` | `ExportPage` | Patient 导出 (仅 Patient) | Patient Bulk Export |
| `subscriptions` | `SubscriptionsPage` | Bot 关联的 Subscription | `GET /fhir/R4/Subscription` |
| `tools` | `ToolsPage` | Agent 工具 (仅 Agent) | `$status`, `$reload-config`, `$upgrade`, `$fetch-logs`, `$push` |

#### 资源类型专属 Tab

| 资源类型 | 额外 Tab | 组件 | 功能 |
|---------|---------|------|------|
| **Bot** | Editor | `BotEditor` | TypeScript 代码编辑 + 保存/部署/执行 |
| **Bot** | Subscriptions | `SubscriptionsPage` | Bot 关联的 Subscription |
| **Questionnaire** | Preview | `PreviewPage` | 问卷预览 |
| **Questionnaire** | Builder | `BuilderPage` (`QuestionnaireBuilder`) | 拖拽式问卷构建器 |
| **Questionnaire** | Bots | `QuestionnaireBotsPage` | 关联的 Bot |
| **Questionnaire** | Responses | `QuestionnaireResponsePage` | 填写结果列表 |
| **PlanDefinition** | Apply | `ApplyPage` (`PlanDefinitionApplyForm`) | PlanDefinition 应用 |
| **PlanDefinition** | Builder | `BuilderPage` (`PlanDefinitionBuilder`) | 计划构建器 |
| **ValueSet** | Preview | `PreviewPage` (`ValueSetPreview`) | ValueSet 展开预览 |
| **DiagnosticReport** | Report | `ReportPage` | 诊断报告视图 |
| **MeasureReport** | Report | `ReportPage` | 质量报告视图 |
| **RequestGroup** | Checklist | `ChecklistPage` | Checklist 视图 |
| **ObservationDefinition** | Ranges | `ReferenceRangesPage` | 参考范围编辑 |
| **Agent** | Tools | `ToolsPage` | Agent 管理工具 |
| **Patient** | Export | `ExportPage` | Patient Bulk Export |

#### 资源创建路由 (`/:resourceType/new`)

| 子路径 | 组件 | 功能 |
|--------|------|------|
| (默认) / `form` | `FormCreatePage` | 表单创建 (使用 ResourceForm) |
| `json` | `JsonCreatePage` | JSON 创建 |
| `profiles` | `FormCreatePage` | Profile 约束创建 |

#### 实验室路由

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/lab/assays` | `AssaysPage` | ObservationDefinition 列表 (检测项目) | `GET /fhir/R4/ObservationDefinition` |
| `/lab/panels` | `PanelsPage` | ActivityDefinition 矩阵 (检测面板) | `GET /fhir/R4/ActivityDefinition`, `GET /fhir/R4/ObservationDefinition` |

#### 项目管理路由 (`/admin`)

**布局组件**: `ProjectPage` — InfoBar + Tab 导航 (Details/Users/Patients/Clients/Bots/Secrets/Sites)

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/admin` (布局) | `ProjectPage` | 项目信息概览 | `GET /admin/projects/:id` |
| `/admin/details` | `ProjectDetailsPage` | 项目详情 | `GET /admin/projects/:id` |
| `/admin/project` | `ProjectDetailsPage` | 同上 (别名) | 同上 |
| `/admin/users` | `UsersPage` | 用户列表 (MembersTable) | `GET /admin/projects/:id` |
| `/admin/patients` | `PatientsPage` | 患者列表 (MembersTable) | `GET /admin/projects/:id` |
| `/admin/bots` | `BotsPage` | Bot 列表 (MembersTable) | `GET /admin/projects/:id` |
| `/admin/bots/new` | `CreateBotPage` | 创建 Bot | `POST /admin/projects/:id/bot` |
| `/admin/clients` | `ClientsPage` | ClientApplication 列表 | `GET /admin/projects/:id` |
| `/admin/clients/new` | `CreateClientPage` | 创建 ClientApplication | `POST /admin/projects/:id/client` |
| `/admin/invite` | `InvitePage` | 邀请用户 (含 AccessPolicy 选择) | `POST /admin/projects/:id/invite` |
| `/admin/secrets` | `SecretsPage` | 项目 Secrets 管理 | `POST /admin/projects/:id/secrets` |
| `/admin/sites` | `SitesPage` | 项目 Sites 管理 | `POST /admin/projects/:id/sites` |
| `/admin/members/:id` | `EditMembershipPage` | 编辑成员 (AccessPolicy/Admin/Profile) | `GET/POST/DELETE /admin/projects/:id/members/:mid` |
| `/admin/config` | `ProjectAdminConfigPage` | 项目 JSON 配置编辑 | `PUT /fhir/R4/Project/:id` |

#### 超级管理路由 (`/admin/super`)

| 路径 | 组件 | 功能 | 调用的 API |
|------|------|------|-----------|
| `/admin/super` | `SuperAdminPage` | 系统管理面板 (多个操作表单) | 多个 `POST /admin/super/*` |
| `/admin/super/asyncjob` | `SuperAdminAsyncDashboardPage` | AsyncJob 仪表板 + 迁移管理 | `GET /admin/super/migrations`, `POST /admin/super/migrate` |
| `/admin/super/db` | `DatabaseToolsPage` | 数据库工具 (GIN 索引/列统计) | `GET /fhir/R4/$db-indexes`, `GET/POST /fhir/R4/$db-column-statistics` |

---

## 3. 核心功能模块详细分析

### 3.1 资源搜索 (HomePage)

**文件**: `src/HomePage.tsx`, `src/HomePage.utils.ts`

**核心能力**:
- 基于 URL 解析 `SearchRequest` (resourceType + 查询参数)
- 使用 `UserConfiguration` 填充默认搜索字段和排序
- 持久化搜索偏好到 `localStorage`
- 默认按 `_lastUpdated` 降序排列
- 每个资源类型有预定义的默认显示字段

**SearchControl 功能**:

| 功能 | 说明 | 实现 |
|------|------|------|
| **搜索** | 支持过滤、排序、分页 | `medplum.search()` |
| **点击行** | 导航到资源详情 | `navigate(/:type/:id)` |
| **新建** | 导航到创建页 (Bot/Client 走 Admin 路由) | `navigate(/:type/new)` |
| **CSV 导出** | 下载搜索结果为 CSV | `GET /fhir/R4/:type/$csv` |
| **Transaction Bundle 导出** | 导出为 FHIR Transaction Bundle | `medplum.search()` → `convertToTransactionBundle()` |
| **批量删除** | 选中后批量删除 | `medplum.executeBatch()` (DELETE entries) |
| **批量操作** | 选中后跳转到 Bulk App 页 | `navigate(/bulk/:type?ids=...)` |
| **复选框** | 多选资源 | `checkboxesEnabled=true` |

### 3.2 资源时间线 (TimelinePage)

**文件**: `src/resource/TimelinePage.tsx`

按资源类型使用不同的 Timeline 组件:

| 资源类型 | 组件 | 说明 |
|---------|------|------|
| Patient | `PatientTimeline` | 患者相关的所有活动 |
| Encounter | `EncounterTimeline` | 就诊相关活动 |
| ServiceRequest | `ServiceRequestTimeline` | 工单相关活动 |
| 其他 | `DefaultResourceTimeline` | 通用资源历史 |

**右键菜单操作**:
- **Pin/Unpin**: Communication 置顶 (修改 `priority` 为 stat/routine)
- **Details**: 跳转到资源详情
- **Edit**: 跳转到编辑页
- **Resend Subscriptions**: 重发订阅通知 (Admin 专属)
- **AWS Textract**: OCR 文字提取 (DocumentReference/Media, 条件启用)
- **Delete**: 跳转到删除页

### 3.3 资源编辑 (EditPage)

**文件**: `src/resource/EditPage.tsx`

**两种提交模式**:
1. **Full Update (PUT)**: `medplum.updateResource(cleanResource(newResource))`
2. **JSON Patch (PATCH)**: `createPatch(original, newResource)` → `medplum.patchResource(type, id, ops)`

使用 `rfc6902` 库计算 JSON Patch 差异，最小化数据传输。

`cleanResource()` 函数移除 `meta.versionId`, `meta.lastUpdated`, `meta.author` 避免冲突。

### 3.4 Bot 编辑器 (BotEditor)

**文件**: `src/resource/BotEditor.tsx`

**功能规格**:

| 功能 | 实现 | 说明 |
|------|------|------|
| **代码编辑** | `CodeEditor` (iframe) | TypeScript 编辑 (支持 commonjs/esnext) |
| **保存** | `medplum.createAttachment()` × 2 + `medplum.patchResource()` | 上传源码 + 编译后代码到 Binary，Patch Bot.sourceCode/executableCode |
| **部署** | `medplum.post(fhirUrl('Bot', id, '$deploy'))` | 触发服务端部署 |
| **执行** | `medplum.post(fhirUrl('Bot', id, '$execute'), input, contentType)` | 执行 Bot 并显示结果 |
| **输入切换** | FHIR JSON / HL7 v2 | 支持两种输入格式 |
| **输出面板** | `BotRunner` (iframe) | 显示执行结果 |

### 3.5 Batch/Transaction 页面

**文件**: `src/BatchPage.tsx`

**两种输入方式**:
1. **文件上传**: 拖拽 JSON 文件 (Mantine Dropzone)
2. **JSON 编辑器**: 直接输入 JSON

**处理逻辑**: 
- 如果 Bundle.type 不是 batch/transaction，自动调用 `convertToTransactionBundle()` 转换
- 通过 `medplum.executeBatch()` 提交
- 结果以 Tab 形式展示 (支持多文件)

### 3.6 Questionnaire 表单 (FormPage)

**文件**: `src/FormPage.tsx`

**功能**:
- 根据 `id` 加载 Questionnaire 资源
- 支持 `?subject=` 参数指定主体 (多个用逗号分隔)
- 使用 `QuestionnaireForm` 组件渲染表单
- 提交后为每个 subject 创建 `QuestionnaireResponse`
- 显示 PatientHeader / ResourceHeader

### 3.7 安全设置 (SecurityPage + MfaPage)

**SecurityPage** (`src/SecurityPage.tsx`):
- 显示当前用户 Profile 信息
- 活跃会话列表 (OS, Browser, IP, Auth Method, Last Updated)
- 撤销会话 (`POST /auth/revoke`)
- 修改密码入口
- MFA 状态显示 + 注册入口

**MfaPage** (`src/MfaPage.tsx`):
- 未注册: 显示 QR 码 + 验证码输入 → `POST /auth/mfa/enroll`
- 已注册: 显示启用状态 + 禁用按钮 → `POST /auth/mfa/disable`

---

## 4. 管理面板详细分析

### 4.1 项目管理 (ProjectPage)

**文件**: `src/admin/ProjectPage.tsx`

**Tab 结构**: Details | Users | Patients | Clients | Bots | Secrets | Sites

每个 Tab 都是独立路由组件，通过 `Outlet` 渲染。

#### 用户邀请 (InvitePage)

**核心参数**:

| 字段 | 类型 | 说明 |
|------|------|------|
| resourceType | Practitioner / Patient / RelatedPerson | 被邀请者角色 |
| firstName, lastName | string | 姓名 |
| email | string | 邮箱 |
| accessPolicy | Reference\<AccessPolicy\> | 访问策略 |
| sendEmail | boolean | 是否发送邀请邮件 |
| isAdmin | boolean | 是否为项目管理员 |
| isProjectScoped | boolean | 是否项目级范围 |
| mfaRequired | boolean | 是否要求 MFA |

#### 成员编辑 (EditMembershipPage)

通过 `POST /admin/projects/:id/members/:mid` 更新:
- Profile 关联
- AccessPolicy 分配
- Admin 权限
- UserConfiguration 关联

#### Secrets 管理 (SecretsPage)

直接编辑 `Project.secret[]` 数组:
- name → `ProjectSecret.name`
- value → `ProjectSecret.valueString`

#### Sites 管理 (SitesPage)

编辑 `Project.site[]`:
- domain
- recaptchaSiteKey / secretKey
- googleClientId / clientSecret
- Google OAuth 回调 URL

### 4.2 超级管理 (SuperAdminPage)

**文件**: `src/admin/SuperAdminPage.tsx`

**权限**: `medplum.isSuperAdmin()` — 仅超级管理员可见

| 操作 | API | 说明 |
|------|-----|------|
| Rebuild StructureDefinitions | `POST /admin/super/structuredefinitions` | 重建资源定义表 (async) |
| Rebuild SearchParameters | `POST /admin/super/searchparameters` | 重建搜索参数表 (async) |
| Rebuild ValueSets | `POST /admin/super/valuesets` | 重建值集表 (async) |
| Reindex Resources | `POST /admin/super/reindex` | 重索引 (可指定类型/过滤器/版本/高级选项) |
| Purge Resources | `POST /admin/super/purge` | 清理 AuditEvent/Login (指定日期之前) |
| Remove Bot Jobs | `POST /admin/super/removebotidjobsfromqueue` | 移除队列中的 Bot 任务 |
| Force Set Password | `POST /admin/super/setpassword` | 强制设置用户密码 |
| Database Stats | `POST /fhir/R4/$db-stats` | 查询表统计信息 |
| Database Invalid Indexes | `POST /fhir/R4/$db-invalid-indexes` | 查找无效索引 |
| Schema Drift | `POST /fhir/R4/$db-schema-diff` | 显示 Schema 差异 |
| Reconcile Schema Drift | `POST /admin/super/reconcile-db-schema-drift` | 修复 Schema 漂移 (async) |
| Reload Cron | `POST /admin/super/reloadcron` | 重载 Cron Bot 队列 (async) |
| Explain Search | `POST /fhir/R4/$explain` | SQL EXPLAIN 分析 (支持 On Behalf Of) |

**Reindex 高级选项**:
- 资源类型、搜索过滤器
- 版本选择 (过时的/全部/特定版本)
- 批量大小 (20-1000, 默认 500)
- 搜索/更新查询超时
- 批次延迟、进度日志阈值
- 结束时间戳缓冲、最大迭代尝试

### 4.3 AsyncJob 仪表板

**文件**: `src/admin/SuperAdminAsyncJobPage.tsx`

**两个 Tab**:
1. **Post-deploy Migrations**: 数据库迁移版本管理
   - 显示每个版本的状态 (completed/pending/next/error)
   - 可启动待执行的迁移
   - 展开显示所有关联 AsyncJob 的历史记录
2. **System AsyncJob**: 系统级异步任务列表
   - 使用 SearchControl 显示无 project 的 AsyncJob

### 4.4 数据库工具

**文件**: `src/admin/DatabaseToolsPage.tsx`, `src/admin/db/`

**两个 Tab**:
1. **GIN Indexes**: 管理全文搜索索引
   - 显示索引配置
   - 启用/禁用索引
2. **Column Statistics**: 管理列统计
   - 显示统计配置
   - 调整 n_distinct 目标

---

## 5. @medplum/react 组件使用清单

App 大量依赖 `@medplum/react` 提供的 FHIR 专用组件:

### 5.1 布局组件

| 组件 | 用途 | 使用页面 |
|------|------|---------|
| `AppShell` | 应用外壳 (侧边栏+顶栏+内容区) | `App.tsx` |
| `Document` | 内容容器 (带 max-width) | 多个页面 |
| `Loading` | 加载指示器 | 全局 |
| `Logo` | Medplum Logo | `App.tsx`, `SignInPage` |
| `LinkTabs` | Tab 导航 (与路由联动) | `ResourcePage`, `ProjectPage`, `DatabaseToolsPage` |
| `InfoBar` | 信息栏 | `ProjectPage` |
| `Container`, `Panel` | 容器/面板 | `DatabaseToolsPage`, `SuperAdminAsyncDashboardPage` |

### 5.2 认证组件

| 组件 | 用途 | 使用页面 |
|------|------|---------|
| `SignInForm` | 登录表单 (支持 Google, MFA, 多步骤) | `SignInPage`, `OAuthPage` |
| `MfaForm` | MFA 表单 (QR 码 + 验证码) | `MfaPage` |

### 5.3 资源展示组件

| 组件 | 用途 | 使用页面 |
|------|------|---------|
| `ResourceTable` | 资源结构化表格 (支持 Profile) | `DetailsPage` |
| `ResourceForm` | 资源表单 (支持 Profile) | `EditPage`, `ProfilesPage`, `FormCreatePage` |
| `ResourceHistoryTable` | 版本历史表格 | `HistoryPage` |
| `ResourceName` | 资源名称显示 | `ToolsPage` |
| `PatientHeader` | 患者头部信息 | `ResourcePage`, `FormPage` |
| `PatientTimeline` | 患者时间线 | `TimelinePage` |
| `EncounterTimeline` | 就诊时间线 | `TimelinePage` |
| `ServiceRequestTimeline` | 工单时间线 | `TimelinePage` |
| `DefaultResourceTimeline` | 通用时间线 | `TimelinePage` |
| `SearchControl` | 搜索表格 (过滤/排序/分页/选中) | `HomePage`, `SuperAdminAsyncDashboardPage` |
| `ReferenceDisplay` | Reference 引用显示 | `SuperAdminPage` |
| `ReferenceInput` | Reference 引用输入 | `SuperAdminPage`, `InvitePage` |
| `ResourceInput` | 资源选择输入 | `InvitePage` |
| `StatusBadge` | 状态徽章 | `ToolsPage` |
| `CodeableConceptDisplay` | CodeableConcept 显示 | `AssaysPage`, `PanelsPage` |
| `RangeDisplay` | Range 显示 | `AssaysPage` |
| `OperationOutcomeAlert` | 操作结果告警 | 多个页面 |
| `DescriptionList` / `DescriptionListEntry` | 描述列表 | `SecurityPage` |

### 5.4 表单/编辑组件

| 组件 | 用途 | 使用页面 |
|------|------|---------|
| `Form` | 通用表单容器 | 多个页面 |
| `FormSection` | 表单分区 | `SuperAdminPage`, `InvitePage`, `CreateBotPage` |
| `SubmitButton` | 提交按钮 | `InvitePage` |
| `DateTimeInput` | 日期时间输入 | `SuperAdminPage` |

### 5.5 专业功能组件

| 组件 | 用途 | 使用页面 |
|------|------|---------|
| `QuestionnaireForm` | Questionnaire 表单渲染 | `FormPage` |
| `QuestionnaireBuilder` | Questionnaire 拖拽构建器 | `BuilderPage` |
| `PlanDefinitionBuilder` | PlanDefinition 构建器 | `BuilderPage` |
| `PatientExportForm` | Patient 导出表单 | `ExportPage` |
| `SmartAppLaunchLink` | SMART App 启动链接 | `AppsPage` |
| `MedplumLink` | 内部链接 | 多个页面 |
| `MemoizedFhirPathTable` | FHIRPath 表格 | `SmartSearchPage` |

### 5.6 Hooks

| Hook | 用途 | 使用页面 |
|------|------|---------|
| `useMedplum()` | 获取 MedplumClient 实例 | 几乎所有页面 |
| `useMedplumProfile()` | 获取当前用户 Profile | `SignInPage` |
| `useMedplumNavigate()` | 导航 (Medplum 包装) | `TimelinePage` |
| `useResource()` | 加载资源 | `DetailsPage`, `AppsPage`, `ExportPage` |
| `useSearchResources()` | 搜索资源列表 | `BulkAppPage`, `AssaysPage`, `PanelsPage`, `AppsPage` |
| `getAppName()` | 获取应用名称 | `SignInPage` |
| `sendCommand()` | 向 iframe 发送命令 | `BotEditor` |
| `exportJsonFile()` | 导出 JSON 文件 | `HomePage` |

---

## 6. API 调用模式

### 6.1 MedplumClient 方法使用频率

| 方法 | 使用次数 | 典型场景 |
|------|---------|---------|
| `medplum.post(url, body)` | 高频 | Admin API, Auth API, FHIR Operations |
| `medplum.get(url)` | 高频 | Admin API, Auth API, Agent 操作 |
| `medplum.updateResource(resource)` | 高频 | EditPage, JsonPage, TimelinePage, BuilderPage |
| `medplum.readResource(type, id)` | 中频 | EditPage, BotEditor, ProfilesPage |
| `medplum.deleteResource(type, id)` | 低频 | DeletePage |
| `medplum.patchResource(type, id, ops)` | 低频 | EditPage (Patch 模式), BotEditor |
| `medplum.search(type, query)` | 中频 | HomePage (通过 SearchControl), SuperAdmin |
| `medplum.executeBatch(bundle)` | 中频 | BatchPage, HomePage (批量删除) |
| `medplum.createResource(resource)` | 中频 | FormPage, FormCreatePage |
| `medplum.createAttachment(data)` | 低频 | BotEditor |
| `medplum.download(url)` | 低频 | HomePage (CSV), BotEditor |
| `medplum.readHistory(type, id)` | 低频 | HistoryPage, ResourcePage (恢复) |
| `medplum.invite(projectId, body)` | 低频 | InvitePage |
| `medplum.pushToAgent(ref, dest, body)` | 低频 | ToolsPage |
| `medplum.fhirUrl(type, id, op)` | 中频 | 构造 FHIR $operation URL |
| `medplum.requestSchema(type)` | 低频 | SuperAdminAsyncDashboardPage |
| `medplum.invalidateSearches(type)` | 中频 | 创建/删除后刷新缓存 |

### 6.2 API 端点使用映射

| 前端页面 | 后端路由类别 | 具体端点 |
|---------|------------|---------|
| SignInPage / OAuthPage | Auth | `/auth/login`, `/auth/google`, `/auth/clientinfo/:id` |
| RegisterPage | Auth | `/auth/newuser`, `/auth/newproject` |
| SecurityPage | Auth | `/auth/me`, `/auth/revoke` |
| MfaPage | Auth / MFA | `/auth/mfa/status`, `/auth/mfa/enroll`, `/auth/mfa/disable` |
| HomePage | FHIR CRUD | `GET /:type`, `GET /:type/$csv`, `POST /` (batch delete) |
| ResourcePage/* | FHIR CRUD | `GET/PUT/PATCH/DELETE /:type/:id`, `/:type/:id/_history` |
| BatchPage | FHIR CRUD | `POST /` (batch/transaction) |
| FormPage | FHIR CRUD | `GET /Questionnaire/:id`, `POST /QuestionnaireResponse` |
| BotEditor | FHIR Operations | `POST /Bot/:id/$deploy`, `POST /Bot/:id/$execute` |
| ToolsPage | FHIR Operations | `$status`, `$reload-config`, `$upgrade`, `$fetch-logs`, `$push` |
| ProjectPage / InvitePage | Admin | `/admin/projects/:id/*` |
| SuperAdminPage | Admin + FHIR Ops | `/admin/super/*`, `$db-stats`, `$explain` |

### 6.3 数据流模式

```
用户操作 → React 组件
  → MedplumClient API 调用 (自动带 Bearer Token)
    → HTTP Request → Medplum Server
      → FHIR Repository (数据库)
    ← HTTP Response (OperationOutcome / Resource / Bundle)
  ← 状态更新 (useState / useResource)
    ← showNotification (成功/失败)
← UI 更新
```

**关键模式**:
1. **乐观更新**: 不使用，所有操作等待服务端响应
2. **缓存失效**: 创建/删除后调用 `medplum.invalidateSearches(type)` 清除搜索缓存
3. **错误处理**: 统一使用 `normalizeErrorString(err)` + `showNotification()` 红色提示
4. **URL 驱动**: 搜索状态完全由 URL 驱动，刷新页面可恢复状态

---

## 7. 自定义组件分析

### 7.1 ResourceHeader

**文件**: `src/components/ResourceHeader.tsx`

显示资源的基本头部信息，包含资源类型和名称。

### 7.2 SpecimenHeader

**文件**: `src/components/SpecimenHeader.tsx`

Specimen 资源的专用头部，显示标本信息。

### 7.3 QuickStatus

**文件**: `src/components/QuickStatus.tsx`

ServiceRequest 快速状态切换组件:
- 从 ValueSet 加载可选状态
- 修改 `ServiceRequest.orderDetail[0].text`
- 仅在 UserConfiguration 配置了 `statusValueSet` 时显示

### 7.4 QuickServiceRequests

**文件**: `src/components/QuickServiceRequests.tsx`

显示与当前资源关联的 ServiceRequest 列表，提供快速跳转。

---

## 8. MedXAI 对比要点

### 8.1 必须实现的功能

| 功能模块 | 优先级 | 说明 |
|---------|--------|------|
| **登录/注册** | P0 | SignIn, Register, PasswordReset, OAuth |
| **资源搜索列表** | P0 | SearchControl 等价 (过滤/排序/分页) |
| **资源详情** | P0 | Details (结构化表格), JSON 视图 |
| **资源编辑** | P0 | Form 编辑 + JSON 编辑 + Patch 支持 |
| **资源创建** | P0 | Form 创建 + JSON 创建 |
| **资源删除** | P0 | 确认删除 |
| **版本历史** | P0 | History 列表 + 版本详情 |
| **安全设置** | P0 | 会话管理 + 密码修改 + MFA |
| **项目管理** | P0 | 用户邀请 + 成员管理 + Bot/Client 创建 |

### 8.2 建议实现的功能

| 功能模块 | 优先级 | 说明 |
|---------|--------|------|
| **时间线** | P1 | Patient/Encounter/ServiceRequest 专用时间线 |
| **Batch/Transaction** | P1 | 文件上传 + JSON 输入 |
| **Questionnaire** | P1 | 表单填写 + 结果查看 |
| **Bot 编辑器** | P1 | 代码编辑 + 部署 + 执行 (核心自动化) |
| **Questionnaire Builder** | P1 | 拖拽式问卷构建 |
| **Apps** | P1 | Questionnaire + SMART App 关联 |
| **Profiles** | P1 | Profile 管理 (StructureDefinition 约束) |
| **CSV 导出** | P1 | 搜索结果导出 |
| **Audit Event** | P1 | 审计日志查看 |
| **Blame** | P1 | 版本差异对比 |
| **Patient Export** | P1 | Bulk Export |

### 8.3 可延后的功能

| 功能模块 | 说明 |
|---------|------|
| **SuperAdmin 面板** | 系统运维工具 (Reindex/Purge/Migrate/DB Tools) |
| **Agent Tools** | Agent 状态/Ping/升级/日志 (本地设备网关) |
| **Lab (Assays/Panels)** | 实验室检测项目/面板管理 |
| **SmartSearch** | FHIRPath 高级搜索 |
| **PlanDefinition Builder** | 计划定义构建器 |
| **AWS Textract** | OCR 文字提取 |
| **Quick Status** | ServiceRequest 快速状态切换 |
| **Database Tools** | GIN 索引/列统计管理 |

### 8.4 技术架构对比

| 方面 | Medplum App | MedXAI 建议 |
|------|-------------|------------|
| **框架** | React 19 + Vite | Next.js (SSR/SSG) 或 React 19 + Vite |
| **UI 库** | Mantine 8 | shadcn/ui + TailwindCSS (更灵活) |
| **路由** | react-router 7 (CSR) | Next.js App Router 或 react-router |
| **状态管理** | MedplumClient 内置缓存 + useState | 等价实现 (可选 Zustand/Jotai) |
| **图标** | @tabler/icons-react | Lucide React (更轻量) |
| **FHIR 组件** | @medplum/react (紧耦合) | 自建 FHIR 组件库 (参考 @medplum/react 接口) |
| **认证** | MedplumClient + MedplumProvider | 等价的 AuthProvider + API Client |
| **Notification** | Mantine Notifications | Toast 系统 (sonner 或 shadcn) |

### 8.5 关键设计模式 (需要复制)

1. **URL 驱动搜索**: 搜索参数完全序列化到 URL，支持浏览器前进/后退
2. **自动批量 (autoBatchTime)**: 100ms 内的多个请求自动合并为 Batch
3. **搜索偏好持久化**: 每个资源类型的上次搜索保存到 localStorage
4. **UserConfiguration 驱动菜单**: 侧边栏完全由服务端 UserConfiguration.menu 配置
5. **资源类型动态路由**: `/:resourceType/:id` 通配所有 FHIR 资源
6. **Tab 与路由同步**: Tab 导航与 URL 路由完全同步
7. **Profile 感知**: Details/Edit 页面支持选择 Profile 切换展示/编辑方式
8. **cleanResource()**: 编辑前移除服务端管理字段防止 412 冲突

---

## 9. 页面统计

| 类别 | 页面数 | 说明 |
|------|--------|------|
| 认证 | 6 | signin, oauth, register, resetpassword, setpassword, verifyemail |
| 用户设置 | 3 | changepassword, security, mfa |
| 核心功能 | 5 | home (search), batch, bulk, smart, forms |
| 资源详情 Tab | 18 | timeline, details, edit, json, delete, history, blame, event, apps, profiles, export, subscriptions, tools, preview, builder, bots, responses, report, checklist, ranges |
| 资源创建 | 3 | form, json, profiles |
| 项目管理 | 11 | project, details, users, patients, bots, bots/new, clients, clients/new, invite, secrets, sites, members |
| 超级管理 | 3 | super, asyncjob, db |
| 实验室 | 2 | assays, panels |
| **总计** | **~51** | |

---

## 10. 交叉引用

- [WF-CUS-001: 自定义资源总览](WF-CUS-001_custom-resource-overview.md)
- [WF-CUS-006: MedplumClient 核心能力](WF-CUS-006_medplum-client.md) — App 前端使用的 API 客户端
- [WF-CUS-007: Server 路由全表](WF-CUS-007_server-routes.md) — App 前端调用的全部后端端点
