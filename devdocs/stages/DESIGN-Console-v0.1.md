# MedXAI Console 设计文档 v0.1

> 状态：✅ C1 已完成
> 日期：2026-02-28
> 关联：Phase P1 → Console 验证控制台

---

## 0. 定位

**MedXAI Console** 是一个用于验证 FHIR 内核、OAuth、多租户和语义层的可视化控制台。

**是**：

- ✅ 验证 FHIR 引擎（CRUD、Search、History、Validation）
- ✅ 验证 OAuth（登录、Token、刷新）
- ✅ 验证多租户（Project 隔离、成员管理）
- ✅ 可浏览 CodeSystem / ValueSet（$expand、$lookup、$subsumes）
- ✅ 可查看 Profile（StructureDefinition snapshot/differential）
- ✅ 可进行基础 CRUD（JSON 编辑器）

**不是**：

- ❌ 不做 HIS / CDSS / 复杂配置中心
- ❌ 不做自动表单生成（第一期用 Raw JSON）
- ❌ 不做 Bot / Subscription / Questionnaire

---

## 1. 技术栈

| 层级            | 技术                 | 版本      | 说明                               |
| --------------- | -------------------- | --------- | ---------------------------------- |
| **框架**        | React                | 19.2.4    | UI 框架                            |
| **路由**        | react-router-dom     | 7.13.1    | SPA 路由                           |
| **UI 库**       | MUI (Material UI)    | 6.x       | 组件库 (core, icons-material, lab) |
| **图标**        | @mui/icons-material  | 6.x       | Material 图标                      |
| **JSON 编辑**   | @monaco-editor/react | 4.x       | Monaco 代码编辑器                  |
| **构建**        | Vite                 | 7.3.1     | 开发/构建工具                      |
| **FHIR 客户端** | @medxai/fhir-client  | workspace | API 通信                           |
| **CSS**         | MUI sx / styled      | -         | 无 TailwindCSS                     |

### 1.1 不使用 TailwindCSS 的原因

MUI 自带完整的 sx prop 和 styled-components 系统，两套 CSS 方案共存会增加心智负担。Console 以数据展示和表格为主，MUI 的 DataGrid / Table 组件足够覆盖需求。

### 1.2 包关系

```
packages/
├── console/          ← 本设计文档的目标包
│   ├── src/
│   │   ├── main.tsx           # 入口
│   │   ├── App.tsx            # 根组件 (AppShell)
│   │   ├── routes.tsx         # 路由定义
│   │   ├── config.ts          # 环境配置
│   │   ├── context/           # React Context (Auth, Console)
│   │   ├── layouts/           # 布局组件
│   │   ├── pages/             # 页面组件 (按模块)
│   │   │   ├── auth/
│   │   │   ├── explorer/
│   │   │   ├── crud/
│   │   │   ├── terminology/
│   │   │   ├── profiles/
│   │   │   └── validation/
│   │   ├── components/        # 共享组件
│   │   └── hooks/             # 自定义 Hooks
│   └── index.html
├── fhir-client/      ← API 通信 SDK（已完成）
├── platform/         ← 未来完整平台（暂不开发）
└── fhir-server/      ← 后端 FHIR Server（已冻结）
```

---

## 2. 后端 API 审计

在设计 Console 之前，先确认后端已有哪些 API 可供调用。

### 2.1 可用 API 端点

| 类别            | 端点                                | 方法   | 状态            |
| --------------- | ----------------------------------- | ------ | --------------- |
| **元数据**      | `/metadata`                         | GET    | ✅              |
| **Well-known**  | `/.well-known/openid-configuration` | GET    | ✅              |
| **Well-known**  | `/.well-known/smart-configuration`  | GET    | ✅              |
| **Auth**        | `/auth/login`                       | POST   | ✅              |
| **Auth**        | `/auth/token`                       | POST   | ✅              |
| **Auth**        | `/oauth2/token`                     | POST   | ✅              |
| **Auth**        | `/auth/me`                          | GET    | ✅              |
| **Auth**        | `/userinfo`                         | GET    | ✅              |
| **CRUD**        | `POST /:type`                       | POST   | ✅              |
| **CRUD**        | `GET /:type/:id`                    | GET    | ✅              |
| **CRUD**        | `PUT /:type/:id`                    | PUT    | ✅              |
| **CRUD**        | `DELETE /:type/:id`                 | DELETE | ✅              |
| **CRUD**        | `PATCH /:type/:id`                  | PATCH  | ✅ (JSON Patch) |
| **Search**      | `GET /:type?params`                 | GET    | ✅              |
| **Search**      | `POST /:type/_search`               | POST   | ✅              |
| **History**     | `GET /:type/:id/_history`           | GET    | ✅              |
| **History**     | `GET /:type/_history`               | GET    | ✅              |
| **VRead**       | `GET /:type/:id/_history/:vid`      | GET    | ✅              |
| **Bundle**      | `POST /` (batch/transaction)        | POST   | ✅              |
| **Validate**    | `POST /:type/$validate`             | POST   | ✅              |
| **Everything**  | `GET /:type/:id/$everything`        | GET    | ✅              |
| **Reindex**     | `POST /:type/:id/$reindex`          | POST   | ✅              |
| **Terminology** | `POST /ValueSet/$expand`            | POST   | ✅              |
| **Terminology** | `GET /ValueSet/:id/$expand`         | GET    | ✅              |
| **Terminology** | `POST /CodeSystem/$lookup`          | POST   | ✅              |
| **Terminology** | `GET /CodeSystem/:id/$lookup`       | GET    | ✅              |
| **Terminology** | `POST /CodeSystem/$validate-code`   | POST   | ✅              |
| **Terminology** | `POST /CodeSystem/$subsumes`        | POST   | ✅              |
| **Terminology** | `GET /CodeSystem/:id/$subsumes`     | GET    | ✅              |
| **Admin**       | `POST /admin/projects`              | POST   | ✅              |
| **Admin**       | `GET /admin/projects/:id`           | GET    | ✅              |
| **Admin**       | `POST /admin/projects/:id/invite`   | POST   | ✅              |
| **Admin**       | `GET /admin/projects/:id/members`   | GET    | ✅              |
| **Admin**       | `POST /admin/clients`               | POST   | ✅              |
| **Admin**       | `GET /admin/clients/:id`            | GET    | ✅              |
| **Conditional** | `PUT /:type?search`                 | PUT    | ✅              |
| **Conditional** | `DELETE /:type?search`              | DELETE | ✅              |

### 2.2 结论

**全部 7 个 Console 模块所需的 API 均已就绪**，无需新增后端端点即可开始开发。

---

## 3. 模块设计

### 3.1 Module 1: Auth & Tenant Switcher

**目标**：OAuth 登录 → 获取 access_token → 显示当前 tenant → 支持切换

**路由**：

| 路径       | 组件         | 功能                         |
| ---------- | ------------ | ---------------------------- |
| `/signin`  | `SignInPage` | 邮箱/密码登录                |
| `/signout` | —            | 清除 token，重定向到 /signin |

**验证点**：

- 多租户隔离是否正确
- Token 是否被正确校验
- 刷新 Token 是否工作

**实现细节**：

```
context/AuthContext.tsx
  ├── MedXAIClient 实例管理
  ├── accessToken / refreshToken 状态
  ├── currentProject (当前 tenant)
  ├── signIn(email, password) → client.signIn()
  ├── signOut() → client.signOut()
  └── switchProject(projectId) → 切换 tenant 上下文

layouts/ConsoleLayout.tsx
  ├── AppBar (顶部栏)
  │   ├── Logo + "MedXAI Console"
  │   ├── Tenant Switcher (Select/Dropdown)
  │   ├── 当前用户 + 角色显示
  │   └── Sign Out 按钮
  ├── Drawer (左侧导航)
  │   ├── Resource Explorer
  │   ├── CodeSystem Browser
  │   ├── ValueSet Browser
  │   ├── Profile Viewer
  │   ├── Validation Runner
  │   └── Server Info
  └── Main Content (Outlet)
```

**API 调用**：

- `client.signIn(email, password, scope)` → `POST /auth/login` + `POST /oauth2/token`
- `client.get('/admin/projects/:id')` → 获取项目详情
- `client.get('/auth/me')` → 获取当前用户信息

---

### 3.2 Module 2: Resource Explorer（核心模块）

**目标**：选择 ResourceType → 列表展示 → 搜索 → 分页 → 点击查看详情

**路由**：

| 路径                 | 组件                 | 功能                   |
| -------------------- | -------------------- | ---------------------- |
| `/`                  | `ResourceListPage`   | 默认资源列表 (Patient) |
| `/:resourceType`     | `ResourceListPage`   | 按类型浏览             |
| `/:resourceType/:id` | `ResourceDetailPage` | 资源详情 (Tabs)        |

**验证点**：

- Search 是否正确
- 分页是否正确
- Tenant 隔离是否正确

**实现细节**：

```
pages/explorer/ResourceListPage.tsx
  ├── ResourceType 选择器 (Autocomplete，从 CapabilityStatement 获取列表)
  ├── 搜索参数输入区 (动态字段)
  ├── MUI DataGrid / Table
  │   ├── 列：id, resourceType, meta.lastUpdated, 摘要字段
  │   ├── 分页 (server-side via _count + _offset)
  │   ├── 排序 (_sort)
  │   └── 点击行 → navigate(/:type/:id)
  ├── 工具栏
  │   ├── 新建资源按钮 → navigate(/:type/new)
  │   └── 刷新按钮
  └── 总数显示

pages/explorer/ResourceDetailPage.tsx
  ├── Tab: JSON (只读 JSON 查看器)
  ├── Tab: Edit (JSON 编辑器 + Save)
  ├── Tab: History (版本历史表)
  └── Tab: Delete (删除确认)
```

**API 调用**：

- `client.search(resourceType, params)` → `GET /:type?params`
- `client.readResource(type, id)` → `GET /:type/:id`
- `client.readHistory(type, id)` → `GET /:type/:id/_history`

**关键设计参考 Medplum**：

- URL 驱动搜索：搜索参数完全序列化到 URL，支持浏览器前进/后退
- 默认按 `_lastUpdated` 降序
- 搜索偏好持久化到 localStorage

---

### 3.3 Module 3: Resource CRUD Panel

**目标**：新建（Raw JSON）→ 更新 → 删除 → 版本查看

**路由**：

| 路径                         | 组件                     | 功能      |
| ---------------------------- | ------------------------ | --------- |
| `/:resourceType/new`         | `ResourceCreatePage`     | JSON 创建 |
| `/:resourceType/:id/edit`    | (ResourceDetailPage Tab) | JSON 编辑 |
| `/:resourceType/:id/history` | (ResourceDetailPage Tab) | 版本历史  |
| `/:resourceType/:id/delete`  | (ResourceDetailPage Tab) | 删除确认  |

**验证点**：

- Validation Gate 是否触发 (422)
- History 是否记录
- ETag / If-Match 乐观锁是否工作
- JSON Patch 是否正确

**实现细节**：

```
pages/crud/ResourceCreatePage.tsx
  ├── ResourceType 选择 (如果从 URL 获取则固定)
  ├── Monaco JSON 编辑器 (带模板)
  ├── "Validate" 按钮 → POST /:type/$validate
  ├── "Create" 按钮 → client.createResource()
  └── 结果显示 (成功 → 跳转详情；失败 → OperationOutcome)

components/JsonEditor.tsx
  ├── Monaco Editor 包装
  ├── 语法高亮 + 自动格式化
  ├── 只读模式 / 编辑模式
  └── onChange 回调

components/OperationOutcomeAlert.tsx
  ├── 解析 OperationOutcome.issue[]
  ├── severity → MUI Alert color (error/warning/info)
  └── diagnostics 显示
```

**API 调用**：

- `client.createResource(resource)` → `POST /:type`
- `client.updateResource(resource)` → `PUT /:type/:id`
- `client.deleteResource(type, id)` → `DELETE /:type/:id`
- `client.patchResource(type, id, ops)` → `PATCH /:type/:id`
- `client.readHistory(type, id)` → `GET /:type/:id/_history`
- `client.readVersion(type, id, vid)` → `GET /:type/:id/_history/:vid`

---

### 3.4 Module 4: CodeSystem Browser

**目标**：CodeSystem 列表 → 查看概念 → 搜索 code → 显示 display

**路由**：

| 路径                           | 组件                   | 功能            |
| ------------------------------ | ---------------------- | --------------- |
| `/terminology/codesystems`     | `CodeSystemListPage`   | CodeSystem 列表 |
| `/terminology/codesystems/:id` | `CodeSystemDetailPage` | 概念浏览 + 操作 |

**验证点**：

- 中文 display 是否正确
- $lookup 是否返回正确结果
- $subsumes 是否正确
- CodeSystem 是否 tenant 隔离

**实现细节**：

```
pages/terminology/CodeSystemListPage.tsx
  ├── 搜索 CodeSystem (name, url)
  ├── 表格：name, url, version, status, concept count
  └── 点击行 → navigate(/terminology/codesystems/:id)

pages/terminology/CodeSystemDetailPage.tsx
  ├── 头部：name, url, version, status, description
  ├── Tab: Concepts
  │   ├── 概念表格 (code, display, definition)
  │   ├── 树形展示 (如果有层级)
  │   ├── 搜索过滤
  │   └── 支持展开子概念
  ├── Tab: $lookup
  │   ├── code 输入框
  │   ├── 执行按钮
  │   └── 结果显示 (name, display, property[])
  ├── Tab: $subsumes
  │   ├── codeA / codeB 输入
  │   ├── 执行按钮
  │   └── 结果显示 (outcome: equivalent/subsumes/subsumed-by/not-subsumed)
  └── Tab: JSON (原始 JSON)
```

**API 调用**：

- `client.search('CodeSystem', params)` → `GET /CodeSystem?params`
- `client.readResource('CodeSystem', id)` → `GET /CodeSystem/:id`
- `client.lookupCode({ system, code })` → `POST /CodeSystem/$lookup`
- `client.post('/CodeSystem/$subsumes', body)` → `POST /CodeSystem/$subsumes`

---

### 3.5 Module 5: ValueSet Browser

**目标**：查看 expansion → 展示概念 → 绑定 CodeSystem

**路由**：

| 路径                         | 组件                 | 功能             |
| ---------------------------- | -------------------- | ---------------- |
| `/terminology/valuesets`     | `ValueSetListPage`   | ValueSet 列表    |
| `/terminology/valuesets/:id` | `ValueSetDetailPage` | expansion + 操作 |

**验证点**：

- $expand 是否正常
- displayLanguage 切换是否正确
- compose.include 绑定是否正确
- filter 参数是否工作

**实现细节**：

```
pages/terminology/ValueSetListPage.tsx
  ├── 搜索 ValueSet (name, url)
  ├── 表格：name, url, version, status
  └── 点击行 → navigate

pages/terminology/ValueSetDetailPage.tsx
  ├── 头部：name, url, version, status, description
  ├── Tab: Expansion
  │   ├── 语言切换 (displayLanguage: en / zh-CN)
  │   ├── 文本过滤 (filter 输入框)
  │   ├── 概念表格 (system, code, display)
  │   └── 分页 (count / offset)
  ├── Tab: Compose
  │   ├── compose.include[] 展示
  │   ├── 每个 include 的 system + concept/filter 展示
  │   └── 跳转到关联 CodeSystem
  └── Tab: JSON (原始 JSON)
```

**API 调用**：

- `client.search('ValueSet', params)` → `GET /ValueSet?params`
- `client.expandValueSet({ id, filter, displayLanguage, count, offset })` → `GET /ValueSet/:id/$expand`

---

### 3.6 Module 6: Profile Viewer

**目标**：StructureDefinition 列表 → 查看 snapshot → 查看 differential → 元素结构

**路由**：

| 路径            | 组件                | 功能                       |
| --------------- | ------------------- | -------------------------- |
| `/profiles`     | `ProfileListPage`   | StructureDefinition 列表   |
| `/profiles/:id` | `ProfileDetailPage` | snapshot/differential 查看 |

**验证点**：

- Snapshot 是否正确
- 中文扩展是否展示
- 元素约束（cardinality, binding）是否正确

**实现细节**：

```
pages/profiles/ProfileListPage.tsx
  ├── 搜索 StructureDefinition (name, type, url, kind)
  ├── kind 过滤 (resource / complex-type / primitive-type)
  ├── 表格：name, type, url, kind, status
  └── 点击行 → navigate

pages/profiles/ProfileDetailPage.tsx
  ├── 头部：name, url, type, kind, status, version, publisher
  ├── Tab: Snapshot
  │   ├── 元素表格 (path, type, min..max, short, binding)
  │   ├── 树形缩进展示 path 层级
  │   └── 绑定 ValueSet 跳转链接
  ├── Tab: Differential
  │   ├── 同上但只展示 differential.element[]
  │   └── 高亮显示约束变更
  └── Tab: JSON (原始 JSON)
```

**API 调用**：

- `client.search('StructureDefinition', params)` → `GET /StructureDefinition?params`
- `client.readResource('StructureDefinition', id)` → `GET /StructureDefinition/:id`
- `client.getStructureDefinition(type)` → 搜索 by type

---

### 3.7 Module 7: Validation Runner

**目标**：粘贴 Resource JSON → 选择 Profile → Validate → 显示错误

**路由**：

| 路径          | 组件             | 功能     |
| ------------- | ---------------- | -------- |
| `/validation` | `ValidationPage` | 验证工具 |

**验证点**：

- 必填校验
- 绑定校验
- OperationOutcome 展示

**实现细节**：

```
pages/validation/ValidationPage.tsx
  ├── 左半区：Monaco JSON 编辑器 (粘贴 Resource)
  ├── 右上：ResourceType 选择 (自动检测或手选)
  ├── 右上：Profile 选择 (可选，未来扩展)
  ├── "Validate" 按钮
  ├── 右下：结果面板
  │   ├── 成功：绿色 ✅ "Valid"
  │   └── 失败：OperationOutcome issue 列表
  │       ├── severity 图标 (error ❌ / warning ⚠️ / info ℹ️)
  │       ├── diagnostics 文本
  │       └── 行号定位 (如果可能)
  └── 模板按钮：Patient / Observation / Condition 快速模板
```

**API 调用**：

- `client.post('/:type/$validate', resource)` → `POST /:type/$validate`

---

## 4. 共享组件

| 组件                    | 用途                      | 对应 Medplum          |
| ----------------------- | ------------------------- | --------------------- |
| `JsonViewer`            | 只读 JSON 展示 (语法高亮) | -                     |
| `JsonEditor`            | Monaco 编辑器包装         | CodeEditor            |
| `OperationOutcomeAlert` | OperationOutcome 展示     | OperationOutcomeAlert |
| `ResourceTypeSelector`  | ResourceType 自动完成下拉 | -                     |
| `FhirBreadcrumbs`       | 面包屑导航                | -                     |
| `LoadingOverlay`        | 加载遮罩                  | Loading               |
| `ConfirmDialog`         | 确认对话框                | -                     |
| `CopyButton`            | 复制到剪贴板              | -                     |

---

## 5. 路由总表

| 路径                              | 组件                   | 模块          | 需要登录 |
| --------------------------------- | ---------------------- | ------------- | -------- |
| `/signin`                         | SignInPage             | Auth          | ❌       |
| `/`                               | ResourceListPage       | Explorer      | ✅       |
| `/:resourceType`                  | ResourceListPage       | Explorer      | ✅       |
| `/:resourceType/new`              | ResourceCreatePage     | CRUD          | ✅       |
| `/:resourceType/:id`              | ResourceDetailPage     | Explorer+CRUD | ✅       |
| `/:resourceType/:id/history/:vid` | (ResourceDetail VRead) | CRUD          | ✅       |
| `/batch`                          | BatchPage              | CRUD          | ✅       |
| `/admin`                          | AdminProjectPage       | Admin         | ✅       |
| `/admin/members`                  | AdminMembersPage       | Admin         | ✅       |
| `/admin/invite`                   | AdminInvitePage        | Admin         | ✅       |
| `/server`                         | ServerInfoPage         | Info          | ✅       |
| `/terminology/codesystems`        | CodeSystemListPage     | Terminology   | ✅       |
| `/terminology/codesystems/:id`    | CodeSystemDetailPage   | Terminology   | ✅       |
| `/terminology/valuesets`          | ValueSetListPage       | Terminology   | ✅       |
| `/terminology/valuesets/:id`      | ValueSetDetailPage     | Terminology   | ✅       |
| `/profiles`                       | ProfileListPage        | Profile       | ✅       |
| `/profiles/:id`                   | ProfileDetailPage      | Profile       | ✅       |
| `/validation`                     | ValidationPage         | Validation    | ✅       |

**共 18 个路由，15 个页面组件**（审计后补入 A1-A6）

---

## 6. 依赖清单

需要新增到 `packages/console/package.json` 的依赖：

```json
{
  "dependencies": {
    "@medxai/fhir-client": "workspace:*",
    "@mui/material": "^6.6.0",
    "@mui/icons-material": "^6.6.0",
    "@mui/lab": "^6.0.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@monaco-editor/react": "^4.7.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-router": "7.13.1",
    "react-router-dom": "7.13.1"
  },
  "devDependencies": {
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react-swc": "4.2.3",
    "postcss": "8.5.6",
    "vite": "7.3.1",
    "typescript": "5.8.3"
  }
}
```

---

## 7. 分阶段执行计划

### Phase C1: 脚手架 + Auth + Resource Explorer + Admin（本期目标）

**预计 ~50 个文件，~3500 行代码**

| #     | 任务                 | 文件                                                            | 说明                                                                    |
| ----- | -------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| C1.1  | 项目配置             | `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` | 更新依赖、配置                                                          |
| C1.2  | 入口 + 主题          | `main.tsx`, `theme.ts`                                          | MUI ThemeProvider + CssBaseline                                         |
| C1.3  | Auth Context         | `context/AuthContext.tsx`                                       | MedXAIClient + signIn/signOut + token 管理                              |
| C1.4  | Console Layout       | `layouts/ConsoleLayout.tsx`                                     | AppBar + Drawer + Outlet + SnackbarProvider                             |
| C1.5  | 路由                 | `App.tsx`, `routes.tsx`                                         | react-router 配置 + auth guard                                          |
| C1.6  | SignIn Page          | `pages/auth/SignInPage.tsx`                                     | 登录表单                                                                |
| C1.7  | Resource List        | `pages/explorer/ResourceListPage.tsx`                           | 搜索 + 表格 + 分页                                                      |
| C1.8  | Resource Detail      | `pages/explorer/ResourceDetailPage.tsx`                         | JSON 查看 + Edit + History + VRead + Delete tabs                        |
| C1.9  | Resource Create      | `pages/crud/ResourceCreatePage.tsx`                             | JSON 编辑器 + Create                                                    |
| C1.10 | 共享组件             | `components/*.tsx`                                              | JsonEditor, OperationOutcomeAlert, cleanResource, SnackbarNotifier, etc |
| C1.11 | Config + Server Info | `config.ts`, `pages/server/ServerInfoPage.tsx`                  | 环境变量 + CapabilityStatement 展示                                     |
| C1.12 | Batch/Transaction    | `pages/crud/BatchPage.tsx`                                      | JSON 输入 → POST / (batch/transaction) [A1]                             |
| C1.13 | Admin 模块           | `pages/admin/*.tsx`                                             | 项目详情 + 成员列表 + 邀请用户 [A2/A3]                                  |

### Phase C2: 术语浏览器 + 补充功能

| #    | 任务              | 文件                                         |
| ---- | ----------------- | -------------------------------------------- |
| C2.1 | CodeSystem List   | `pages/terminology/CodeSystemListPage.tsx`   |
| C2.2 | CodeSystem Detail | `pages/terminology/CodeSystemDetailPage.tsx` |
| C2.3 | ValueSet List     | `pages/terminology/ValueSetListPage.tsx`     |
| C2.4 | ValueSet Detail   | `pages/terminology/ValueSetDetailPage.tsx`   |
| C2.5 | Register Page     | `pages/auth/RegisterPage.tsx` [B1]           |
| C2.6 | Change Password   | `pages/auth/ChangePasswordPage.tsx` [B2]     |
| C2.7 | AuditEvent Tab    | ResourceDetail 新增 Audit tab [B4]           |
| C2.8 | Version Diff      | ResourceDetail 新增 Blame tab [B3]           |

### Phase C3: Profile Viewer + Validation Runner

| #    | 任务              | 文件                                   |
| ---- | ----------------- | -------------------------------------- |
| C3.1 | Profile List      | `pages/profiles/ProfileListPage.tsx`   |
| C3.2 | Profile Detail    | `pages/profiles/ProfileDetailPage.tsx` |
| C3.3 | Validation Runner | `pages/validation/ValidationPage.tsx`  |

---

## 8. 设计决策点

| #     | 问题               | 建议                       | 理由                                               |
| ----- | ------------------ | -------------------------- | -------------------------------------------------- |
| C-D1  | UI 框架            | MUI v6                     | 用户指定，不用 TailwindCSS                         |
| C-D2  | 状态管理           | React Context + useState   | 轻量级足够，不引入 Zustand/Redux                   |
| C-D3  | JSON 编辑器        | Monaco Editor              | 功能丰富，VS Code 同款                             |
| C-D4  | 表单方式           | Raw JSON（第一期）         | 不做自动表单生成，降低复杂度                       |
| C-D5  | 认证方式           | MedXAIClient.signIn()      | 复用已有客户端 SDK                                 |
| C-D6  | 多租户切换         | AppBar 内 Project Selector | 参考 Medplum 的 project 切换模式                   |
| C-D7  | 搜索驱动           | URL 参数驱动               | 参考 Medplum，支持前进/后退                        |
| C-D8  | 执行阶段           | C1 → C2 → C3               | 先验证核心 CRUD，再验证语义层                      |
| C-D9  | Notification       | MUI Snackbar               | 统一成功/错误通知，参考 Medplum Notifications [B7] |
| C-D10 | cleanResource()    | 编辑前 strip meta 字段     | 防止 412 冲突，参考 Medplum [A5]                   |
| C-D11 | ETag / If-Match    | Update 时发送 If-Match     | 乐观锁，防止并发冲突 [D6]                          |
| C-D12 | Suspense + Loading | React.Suspense + fallback  | 异步加载体验 [D7]                                  |
| C-D13 | autoBatchTime      | MedXAIClient config        | 100ms 自动批量合并 [D2]                            |

---

## 9. 与 Medplum App 的对比

| 方面              | Medplum App (~51 页面)     | MedXAI Console (~18 路由)         |
| ----------------- | -------------------------- | --------------------------------- |
| **定位**          | 完整管理平台               | 验证控制台                        |
| **UI 库**         | Mantine 8                  | MUI 6                             |
| **表单**          | ResourceForm (自动生成)    | Raw JSON Editor                   |
| **时间线**        | Patient/Encounter Timeline | ❌ 不做                           |
| **Bot**           | 代码编辑 + 部署 + 执行     | ❌ 不做                           |
| **Questionnaire** | Builder + Form + Responses | ❌ 不做                           |
| **SuperAdmin**    | DB Tools / Reindex / Purge | ❌ 不做                           |
| **术语**          | ValueSet Preview (仅)      | CodeSystem + ValueSet + $subsumes |
| **Profile**       | Profile Tab (资源级)       | 独立 Profile Viewer               |
| **Validation**    | 隐式 (创建时)              | 独立 Validation Runner            |

**关键差异**：Console 大量裁剪了 Medplum 的业务功能（Bot、Questionnaire、Timeline），但增加了 Medplum 没有的独立术语浏览器和验证工具。

---

## 10. Medplum 对标审计（2026-02-28 已确认）

### A 类：补入 C1（验证必需）

| #   | 缺失项                    | 修复                                 |
| --- | ------------------------- | ------------------------------------ |
| A1  | Batch/Transaction         | 新增 `/batch` 页面                   |
| A2  | Admin 项目详情 + 成员列表 | 新增 `/admin` 模块 (3 页面)          |
| A3  | Admin 邀请用户            | 新增 `/admin/invite`                 |
| A4  | VRead 版本详情            | History Tab 内点击查看特定版本       |
| A5  | cleanResource()           | 编辑前 strip meta 字段               |
| A6  | Server Info               | 新增 `/server` (CapabilityStatement) |

### B 类：放入 C2

| #   | 缺失项               | 修复                 |
| --- | -------------------- | -------------------- |
| B1  | Register 页面        | C2.5                 |
| B2  | Change Password      | C2.6                 |
| B3  | Version Diff (Blame) | C2.8                 |
| B4  | AuditEvent Tab       | C2.7                 |
| B7  | Notification/Toast   | C1 内置 MUI Snackbar |

### D 类：设计模式补充

| #   | 模式               | 处理                          |
| --- | ------------------ | ----------------------------- |
| D2  | autoBatchTime      | config.ts 配置 100ms          |
| D5  | 缓存失效           | Create/Delete 后刷新列表      |
| D6  | ETag / If-Match    | Update 时发送 If-Match header |
| D7  | Suspense + Loading | React.Suspense + MUI Skeleton |

### 审计后总计

- **C1**: 18 路由 / 15 页面（从 12/10 增加到 18/15）
- **决策点**: 13 个（C-D1 ~ C-D13）
- **全部 A 类缺失已补入 C1，B 类放入 C2**

---

## 11. 执行结果

### C1 Phase — 2026-02-28 完成

**验证结果**：

- `tsc --noEmit`：✅ 零错误
- `vite build`：✅ 成功，5.98s，代码分割 20+ chunks
- `vite dev`：✅ 端口 3001 正常启动
- 总 bundle：472 kB gzipped ~151 kB

**文件清单** (`packages/console/src/`)：

| 文件                                         | 职责                                   |
| -------------------------------------------- | -------------------------------------- |
| `main.tsx`                                   | 入口                                   |
| `App.tsx`                                    | 路由 + Providers + Auth Guard          |
| `config.ts`                                  | 配置（baseUrl, autoBatch）             |
| `theme.ts`                                   | MUI 主题（Inter 字体）                 |
| `context/AuthContext.tsx`                    | 认证状态 + MedXAIClient                |
| `context/SnackbarContext.tsx`                | 全局通知 (C-D9)                        |
| `components/JsonEditor.tsx`                  | Monaco JSON 编辑器 (C-D3)              |
| `components/OperationOutcomeAlert.tsx`       | 验证结果显示                           |
| `components/cleanResource.ts`                | Strip meta 字段 (C-D10)                |
| `components/LoadingScreen.tsx`               | Suspense fallback (C-D12)              |
| `layouts/ConsoleLayout.tsx`                  | AppBar + Drawer + Outlet               |
| `pages/auth/SignInPage.tsx`                  | 登录页                                 |
| `pages/explorer/ResourceListPage.tsx`        | 资源列表 + 搜索 + 分页                 |
| `pages/explorer/ResourceDetailPage.tsx`      | 详情 + Edit + History + VRead + Delete |
| `pages/crud/ResourceCreatePage.tsx`          | 创建 + 验证                            |
| `pages/crud/BatchPage.tsx`                   | Batch / Transaction (A1)               |
| `pages/server/ServerInfoPage.tsx`            | CapabilityStatement (A6)               |
| `pages/admin/AdminProjectPage.tsx`           | 项目详情 (A2)                          |
| `pages/admin/AdminMembersPage.tsx`           | 成员列表 (A2)                          |
| `pages/admin/AdminInvitePage.tsx`            | 邀请用户 (A3)                          |
| `pages/terminology/CodeSystemListPage.tsx`   | CodeSystem 浏览器                      |
| `pages/terminology/CodeSystemDetailPage.tsx` | 概念 + $lookup + $subsumes             |
| `pages/terminology/ValueSetListPage.tsx`     | ValueSet 浏览器                        |
| `pages/terminology/ValueSetDetailPage.tsx`   | $expand + compose                      |
| `pages/profiles/ProfileListPage.tsx`         | Profile 列表                           |
| `pages/profiles/ProfileDetailPage.tsx`       | Snapshot + Differential                |
| `pages/validation/ValidationPage.tsx`        | 验证运行器                             |

**设计模式落地**：

| 决策点 | 落地方式                                                |
| ------ | ------------------------------------------------------- |
| C-D1   | MUI 6 ThemeProvider + CssBaseline                       |
| C-D2   | react-router-dom v7, lazy() + Suspense 代码分割         |
| C-D3   | @monaco-editor/react, JSON mode                         |
| C-D4   | Raw JSON 编辑（无自动表单）                             |
| C-D5   | MedXAIClient.signIn() + sessionStorage token            |
| C-D6   | AppBar Chip 显示当前 Project                            |
| C-D7   | useSearchParams 驱动搜索参数                            |
| C-D9   | SnackbarContext + MUI Alert                             |
| C-D10  | cleanResource() strip meta.versionId/lastUpdated/author |
| C-D12  | React.lazy + Suspense + LoadingScreen                   |
| C-D13  | client.setAutoBatch(true, 100) 自动批量                 |

**18 路由 / 15 页面全部实现，审计 A 类 6 项全部补入。**
