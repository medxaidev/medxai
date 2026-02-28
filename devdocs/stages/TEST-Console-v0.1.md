# MedXAI Console 测试手册 v0.1

> 日期：2026-02-28
> 前置：DESIGN-Console-v0.1.md (C1 已完成)

---

## 0. 架构概览

```
┌─────────────┐         ┌─────────────────┐         ┌────────────┐
│  Console    │  proxy   │  FHIR Server    │         │ PostgreSQL │
│  :3001      │ ──────→  │  :8080          │ ──────→ │ :5433      │
│  (Vite+React)│         │  (Fastify)      │         │            │
└─────────────┘         └─────────────────┘         └────────────┘
```

- **Console** (`packages/console`)：Vite dev server，端口 3001，所有 `/fhir`、`/auth`、`/oauth2`、`/admin`、`/metadata` 请求代理到 8080
- **FHIR Server** (`packages/fhir-server`)：Fastify 应用，端口 8080，需要先启动
- **PostgreSQL**：端口 5433，数据库 `medxai_dev`

---

## 1. 环境准备

### 1.1 确认 PostgreSQL 运行

```powershell
# 检查 PostgreSQL 是否在 5433 端口运行
pg_isready -h localhost -p 5433
# 或
psql -h localhost -p 5433 -U postgres -d medxai_dev -c "SELECT 1"
# 密码：assert
```

如果数据库不存在或需要重建：

```powershell
# 进入 fhir-persistence 包目录
cd d:\Programming\MedXAI\coding\medxai\packages\fhir-persistence
npx tsx scripts/init-db.ts --reset
```

### 1.2 启动 FHIR Server

我已创建了一个开发服务器启动脚本：

```powershell
cd d:\Programming\MedXAI\coding\medxai\packages\fhir-server
npx tsx scripts/dev-server.mts
```

启动成功会显示：

```
╔═══════════════════════════════════════════╗
║  🚀 Server running at http://localhost:8080
╠═══════════════════════════════════════════╣
║  Admin:  admin@medxai.test
║  Pass:   medxai123
╚═══════════════════════════════════════════╝
```

**默认种子数据**：
| 资源 | 说明 |
|------|------|
| **Project** | "Super Admin" (superAdmin=true) |
| **User** | admin@medxai.test / medxai123 |
| **ClientApplication** | 默认 OAuth2 客户端 |
| **ProjectMembership** × 2 | admin→project (admin=true), client→project |

可通过环境变量自定义：

```powershell
$env:ADMIN_EMAIL="your@email.com"
$env:ADMIN_PASSWORD="your-password"
$env:PORT="8080"
npx tsx scripts/dev-server.mts
```

### 1.3 启动 Console

```powershell
# 另开一个终端
cd d:\Programming\MedXAI\coding\medxai\packages\console
npx vite
```

打开 http://127.0.0.1:3001

---

## 2. 测试流程

### Phase A：认证流程 ✦ 优先级最高

#### A1. 管理员登录

1. 打开 http://127.0.0.1:3001
2. 应自动跳转到 `/signin` 页面
3. 输入：
   - Email: `admin@medxai.test`
   - Password: `medxai123`
4. 点击 **Sign In**

**预期结果**：
- ✅ 跳转到 `/Patient` 资源列表页
- ✅ 右上角显示 email: `admin@medxai.test`
- ✅ 右上角 Chip 显示 Project 名称 "Super Admin"
- ✅ 左侧 Drawer 导航菜单可见

#### A2. Auth Guard 验证

1. 打开新的隐身窗口
2. 直接访问 http://127.0.0.1:3001/Patient

**预期结果**：
- ✅ 自动跳转到 `/signin`

#### A3. 退出登录

1. 点击右上角退出按钮 (Logout)

**预期结果**：
- ✅ 跳转到 `/signin`
- ✅ 再次访问 `/Patient` 仍然跳转 `/signin`

#### A4. Session 恢复

1. 登录成功后
2. 刷新页面 (F5)

**预期结果**：
- ✅ 短暂 Loading 后仍然停留在当前页面（不跳转 `/signin`）
- ✅ 用户信息恢复正常显示

---

### Phase B：资源 CRUD ✦ 核心功能

#### B1. 资源列表 — 浏览

1. 登录后，默认进入 `/Patient` 页面
2. 左上方 Autocomplete 可切换资源类型

**测试操作**：
- 切换到 `Organization`、`Observation`、`CodeSystem` 等
- URL 应同步变化（如 `/Organization`）

**预期结果**：
- ✅ 表格显示 ID、Type、Summary、Last Updated、Version
- ✅ 分页器显示总数
- ✅ 数据库为空时显示 "No resources found"

#### B2. 创建资源

1. 点击右上角 **New** 按钮或导航到 `/:resourceType/new`
2. 编辑器中会显示 JSON 模板
3. 修改 JSON（例如改 Patient 的姓名）
4. 点击 **Create**

**测试示例** — 创建 Patient：

```json
{
  "resourceType": "Patient",
  "name": [{ "family": "张", "given": ["三"] }],
  "gender": "male",
  "birthDate": "1990-01-01"
}
```

**预期结果**：
- ✅ 成功提示 "Created Patient/xxx"
- ✅ 自动跳转到详情页 `/Patient/{id}`
- ✅ 返回列表可看到新创建的资源

#### B3. 创建前验证

1. 在创建页面，输入不合法的 JSON
2. 点击 **Validate** 按钮

**测试示例** — 缺少必需字段：

```json
{
  "resourceType": "Observation"
}
```

**预期结果**：
- ✅ 显示 OperationOutcome 验证结果
- ✅ 出现 error/warning 信息

#### B4. 查看资源详情

1. 在列表页点击任意一行
2. 进入详情页

**预期结果**：
- ✅ 面包屑导航: `Patient > abc123...`
- ✅ 显示 version chip 和 lastUpdated
- ✅ JSON Tab: 只读 JSON 展示
- ✅ 4 个 Tab: JSON / Edit / History / Delete

#### B5. 编辑资源

1. 在详情页切换到 **Edit** Tab
2. 修改 JSON（例如修改 patient.gender 为 "female"）
3. 点击 **Save**

**预期结果**：
- ✅ 成功提示 "Resource updated"
- ✅ Version 增加
- ✅ 切回 JSON Tab 可见更新
- ✅ Reset 按钮恢复到最新服务端版本

#### B6. 查看历史

1. 在详情页切换到 **History** Tab

**预期结果**：
- ✅ 表格显示所有版本（Version、Last Updated）
- ✅ 每行有 **View** 按钮

#### B7. VRead — 查看历史版本

1. 在 History Tab，点击某个版本的 **View**

**预期结果**：
- ✅ Dialog 弹出，显示该版本的完整 JSON
- ✅ Dialog 标题显示版本号和时间

#### B8. 删除资源

1. 在详情页切换到 **Delete** Tab
2. 点击 **Confirm Delete**
3. 在确认对话框中点击 **Delete**

**预期结果**：
- ✅ 成功提示 "Deleted Patient/xxx"
- ✅ 自动返回资源列表
- ✅ 被删除的资源不再出现在列表中

#### B9. 搜索过滤

1. 在列表页的搜索框输入过滤条件
2. 例如输入 `name=张`，点击 Search

**预期结果**：
- ✅ URL 更新 `?_filter=name=张`
- ✅ 表格仅显示匹配结果
- ✅ 浏览器前进/后退保留搜索状态

#### B10. 分页

1. 在有多条数据的列表中
2. 修改每页行数（10/20/50/100）
3. 点击下一页/上一页

**预期结果**：
- ✅ 数据正确切换
- ✅ URL 参数 `_page` 和 `_count` 同步

---

### Phase C：Batch / Transaction

#### C1. 执行 Batch

1. 导航到 **Batch** 页面
2. 选择 **Batch** 模式
3. 使用默认模板或自定义 Bundle
4. 点击 **Execute**

**预期结果**：
- ✅ 响应区域显示 Bundle 响应
- ✅ 成功提示 "batch executed — N entries"

#### C2. 执行 Transaction

1. 切换到 **Transaction** 模式
2. 执行

**预期结果**：
- ✅ Transaction 是原子性的 — 全部成功或全部失败
- ✅ 可以在列表页验证新创建的资源

#### C3. 错误处理

1. 输入不合法的 Bundle（例如 type 不是 batch/transaction）
2. 执行

**预期结果**：
- ✅ 显示 OperationOutcome 错误信息

---

### Phase D：术语浏览器

#### D1. CodeSystem 列表

1. 导航到 **Terminology → CodeSystems**

**预期结果**：
- ✅ 如果已加载种子术语数据（`seedConformanceResources`），显示 CodeSystem 列表
- ✅ 如果没有，显示空表
- ✅ 支持名称过滤

> **注意**：如果列表为空，需要先加载术语种子数据。详见 Phase G。

#### D2. CodeSystem 详情

1. 点击某个 CodeSystem
2. 查看 Concepts Tab

**预期结果**：
- ✅ 概念表格显示 Code / Display / Definition
- ✅ 层级结构通过缩进展示

#### D3. $lookup 操作

1. 在 CodeSystem 详情页，切换到 **$lookup** Tab
2. 输入一个已知 code
3. 点击 Lookup

**预期结果**：
- ✅ 显示 Parameters 资源 — name、display、property 等

#### D4. $subsumes 操作

1. 切换到 **$subsumes** Tab
2. 输入两个 code（如父子关系的 code）
3. 点击 Check

**预期结果**：
- ✅ 显示 subsumption 结果

#### D5. ValueSet 列表

1. 导航到 **Terminology → ValueSets**

**预期结果**：
- ✅ 列表显示 Name / URL / Version / Status

#### D6. ValueSet $expand

1. 点击某个 ValueSet
2. 默认进入 **Expansion** Tab

**预期结果**：
- ✅ 自动展开概念列表（System / Code / Display）
- ✅ 支持 Filter 文本过滤
- ✅ 支持 EN/ZH 语言切换（如有多语言 designation）
- ✅ 点击 **Expand** 重新展开

#### D7. ValueSet Compose

1. 切换到 **Compose** Tab

**预期结果**：
- ✅ 显示 compose.include 信息（system、concepts、filters）

---

### Phase E：Profile Viewer

#### E1. Profile 列表

1. 导航到 **Conformance → Profiles**

**预期结果**：
- ✅ 显示 StructureDefinition 列表（Name / Type / Kind / URL / Status）
- ✅ 支持名称过滤

#### E2. Profile 详情 — Snapshot

1. 点击某个 StructureDefinition
2. 默认 **Snapshot** Tab

**预期结果**：
- ✅ 元素表格：Path / Type / Cardinality / Short / Binding
- ✅ 层级路径通过缩进展示

#### E3. Profile 详情 — Differential

1. 切换到 **Differential** Tab

**预期结果**：
- ✅ 仅显示该 Profile 自定义/约束的元素

---

### Phase F：Validation Runner

#### F1. 基本验证

1. 导航到 **Conformance → Validation**
2. 选择 Patient 模板
3. 点击 **Validate**

**预期结果**：
- ✅ 显示 "Valid" chip（绿色）
- ✅ 右侧显示 OperationOutcome

#### F2. 无效资源验证

1. 删除必需字段或添加非法值
2. 点击 **Validate**

**预期结果**：
- ✅ 显示 "Invalid" chip（红色）
- ✅ OperationOutcome 显示 error 级别 issues

#### F3. 不同资源类型

1. 切换到 Observation / Condition 模板
2. 分别验证

**预期结果**：
- ✅ 各自模板正确加载
- ✅ 验证结果正确

---

### Phase G：Admin 模块

#### G1. Project 详情

1. 导航到 **Admin → Project**

**预期结果**：
- ✅ 显示 Project 名称和 ID
- ✅ 下方 Raw JSON 展示完整 Project 数据

#### G2. 成员列表

1. 点击 **Members** 按钮或导航到 `/admin/members`

**预期结果**：
- ✅ 表格显示 Membership ID / User / Profile / Role
- ✅ admin 用户标记为 "Admin"
- ✅ ClientApplication 标记为 "Member"

#### G3. 邀请用户

1. 导航到 **Admin → Invite User**
2. 填写 Email / First Name / Last Name
3. 点击 **Send Invite**

**预期结果**：
- ✅ 成功提示 "User invited successfully"
- ✅ 显示创建的 User + Membership JSON
- ✅ 返回成员列表可见新成员

#### G4. 使用新用户登录

1. 退出当前登录
2. 使用邀请时的 email 登录

> **注意**：当前 invite 接口需要确认是否设置了初始密码。
> 如果 invite 不支持设置密码，可以通过 `/auth/newuser` 注册。

---

### Phase H：Server Info

#### H1. CapabilityStatement

1. 导航到 **Admin → Server Info**

**预期结果**：
- ✅ 显示完整的 CapabilityStatement JSON
- ✅ 包含 rest 交互、搜索参数、支持的资源类型

---

### Phase G（补充）：加载术语种子数据

如果 CodeSystem/ValueSet/StructureDefinition 列表为空，需要加载术语种子数据：

```powershell
# 确保 FHIR Server 正在运行（8080 端口）
# 在另一个终端中执行
cd d:\Programming\MedXAI\coding\medxai\packages\fhir-server

# 检查是否存在术语种子脚本
# 如果已有 seed-conformance 脚本:
npx tsx scripts/seed-conformance.mts
```

或者通过 Batch 页面手动创建 CodeSystem/ValueSet 进行测试：

```json
{
  "resourceType": "Bundle",
  "type": "batch",
  "entry": [
    {
      "request": { "method": "POST", "url": "CodeSystem" },
      "resource": {
        "resourceType": "CodeSystem",
        "url": "http://example.com/cs/test",
        "name": "TestCodeSystem",
        "status": "active",
        "content": "complete",
        "concept": [
          { "code": "A", "display": "Alpha", "definition": "First letter" },
          { "code": "B", "display": "Beta", "definition": "Second letter" }
        ]
      }
    },
    {
      "request": { "method": "POST", "url": "ValueSet" },
      "resource": {
        "resourceType": "ValueSet",
        "url": "http://example.com/vs/test",
        "name": "TestValueSet",
        "status": "active",
        "compose": {
          "include": [
            {
              "system": "http://example.com/cs/test",
              "concept": [
                { "code": "A", "display": "Alpha" },
                { "code": "B", "display": "Beta" }
              ]
            }
          ]
        }
      }
    }
  ]
}
```

---

## 3. 多租户测试 (进阶)

### 3.1 创建新 Project

使用 SuperAdmin 登录后，通过 API（暂无 Console UI）创建新 Project：

```powershell
# 先获取 Token
$loginResp = Invoke-RestMethod -Method POST -Uri "http://localhost:8080/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@medxai.test","password":"medxai123","scope":"openid offline"}'

$tokenResp = Invoke-RestMethod -Method POST -Uri "http://localhost:8080/oauth2/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=authorization_code&code=$($loginResp.code)"

$token = $tokenResp.access_token

# 创建新 Project
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/admin/projects" `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"name":"Test Clinic","description":"测试诊所项目"}'
```

### 3.2 邀请用户到新 Project

```powershell
$projectId = "<新Project的ID>"

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8080/admin/projects/$projectId/invite" `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"email":"doctor@test.com","firstName":"Doctor","lastName":"Test"}'
```

### 3.3 注册新用户 (Self-service)

```powershell
$projectId = "<Project ID>"

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/auth/newuser" `
  -ContentType "application/json" `
  -Body "{`"email`":`"nurse@test.com`",`"password`":`"Nurse123!`",`"firstName`":`"Nurse`",`"lastName`":`"Test`",`"projectId`":`"$projectId`"}"
```

然后在 Console 使用 `nurse@test.com` / `Nurse123!` 登录。

---

## 4. 常见问题

### Q1: 登录返回 401 或 "Sign in failed"

**原因**：
- FHIR Server 没启动（8080 端口无响应）
- 数据库未 seed（没有 User 资源）
- 密码不正确

**排查**：
```powershell
# 测试服务器是否可达
Invoke-RestMethod -Uri "http://localhost:8080/metadata"

# 测试登录 API
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@medxai.test","password":"medxai123"}'
```

### Q2: Console 页面显示但 API 调用失败

**原因**：Vite proxy 配置问题或 FHIR Server 未启动

**排查**：
- 检查 `vite.config.ts` 中 proxy 目标是否为 `http://localhost:8080`
- 检查浏览器 DevTools → Network tab → 查看 API 请求的实际响应

### Q3: 术语页面为空

**原因**：数据库中没有 CodeSystem / ValueSet 数据

**解决**：使用 Phase G 补充方法加载种子数据或通过 Batch 页面手动创建

### Q4: Admin 页面 403

**原因**：当前用户不是 Project Admin 或 SuperAdmin

**解决**：确认使用 seed admin 账号登录

### Q5: vite dev 启动失败

**排查**：
```powershell
cd d:\Programming\MedXAI\coding\medxai\packages\console
npm install   # 确保依赖安装
npx tsc --noEmit   # 检查 TypeScript 错误
npx vite      # 重新启动
```

---

## 5. 测试检查清单

| # | 模块 | 测试项 | 通过 |
|---|------|--------|------|
| A1 | Auth | 管理员登录 | ☐ |
| A2 | Auth | Auth Guard 跳转 | ☐ |
| A3 | Auth | 退出登录 | ☐ |
| A4 | Auth | Session 恢复 | ☐ |
| B1 | Explorer | 资源列表浏览 + 切换类型 | ☐ |
| B2 | CRUD | 创建 Patient | ☐ |
| B3 | CRUD | 创建前验证 | ☐ |
| B4 | Explorer | 资源详情 JSON Tab | ☐ |
| B5 | CRUD | 编辑资源 | ☐ |
| B6 | Explorer | 查看历史 | ☐ |
| B7 | Explorer | VRead 历史版本 | ☐ |
| B8 | CRUD | 删除资源 | ☐ |
| B9 | Explorer | 搜索过滤 | ☐ |
| B10 | Explorer | 分页 | ☐ |
| C1 | Batch | 执行 Batch | ☐ |
| C2 | Batch | 执行 Transaction | ☐ |
| C3 | Batch | 错误处理 | ☐ |
| D1 | Terminology | CodeSystem 列表 | ☐ |
| D2 | Terminology | CodeSystem 概念表 | ☐ |
| D3 | Terminology | $lookup | ☐ |
| D4 | Terminology | $subsumes | ☐ |
| D5 | Terminology | ValueSet 列表 | ☐ |
| D6 | Terminology | ValueSet $expand | ☐ |
| D7 | Terminology | ValueSet Compose | ☐ |
| E1 | Profile | StructureDefinition 列表 | ☐ |
| E2 | Profile | Snapshot 元素表 | ☐ |
| E3 | Profile | Differential 元素表 | ☐ |
| F1 | Validation | 合法资源验证 | ☐ |
| F2 | Validation | 非法资源验证 | ☐ |
| F3 | Validation | 多资源类型 | ☐ |
| G1 | Admin | Project 详情 | ☐ |
| G2 | Admin | 成员列表 | ☐ |
| G3 | Admin | 邀请用户 | ☐ |
| H1 | Server | CapabilityStatement | ☐ |

---

## 6. 快速启动命令总结

```powershell
# 终端 1: FHIR Server
cd d:\Programming\MedXAI\coding\medxai\packages\fhir-server
npx tsx scripts/dev-server.mts

# 终端 2: Console
cd d:\Programming\MedXAI\coding\medxai\packages\console
npx vite

# 浏览器
# http://127.0.0.1:3001
# 登录: admin@medxai.test / medxai123
```
