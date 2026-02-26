# 后台稳定化路线图 (Backend Stability Roadmap)

```yaml
document_type: roadmap
version: v1.0
status: DRAFT
created_at: 2026-02-26
scope: From current state (Phase 22 + P1 Audit Fixes) to Client-Ready Backend
prerequisite: REVIEW-005 v1.2 (all P1 fixes applied, 3549/3549 tests passing)
goal: Backend fully stable → unlock Client development
```

---

## 当前状态 (Current State)

### 已完成

| 层级 | 能力 | 状态 |
|------|------|------|
| **fhir-core** | Model + Parser + Context + Profile + Validator | ✅ 完整 |
| **fhir-persistence** | CRUD + History + Search + Bundle + Conditional + Schema + DDL | ✅ 完整 |
| **fhir-server** | REST API (CRUD + Search + Metadata + Bundle) | ✅ 完整 |
| **Schema** | 与 Medplum 对齐 (4726 DDL, 0 errors) | ✅ 完整 |
| **审计** | REVIEW-005 v1.2, 9/11 P1 修复 | ✅ 完整 |

### 未完成 (影响后台稳定的关键缺口)

| 缺口 | 影响范围 | 风险等级 |
|------|----------|----------|
| **平台资源定义缺失** | 无 Project/User/Login 等平台资源 → 无法实现多租户 | 🔴 阻塞 |
| **profiles-platform.json 为空** | schema 无法生成平台表 → 无法存储租户/用户数据 | 🔴 阻塞 |
| **无认证/授权** (R-010) | 任何人可读写任何数据 | 🔴 阻塞 |
| **无审计日志** (R-029) | 无法追溯数据变更 | 🟡 重要 |
| **无术语服务** | CodeSystem/ValueSet 无法 $expand/$validate-code | 🟡 重要 |
| **无中文适配** | 搜索/错误信息/Profile 全英文 | 🟡 重要 (功能层面) |
| **验证门控未激活** | R-028 hook 已接入，但无 profile 加载 → 实际未验证 | 🟡 重要 |

---

## 阶段规划 (Stage Plan)

### 总体依赖关系

```
S1: 平台资源 + 多租户设计
 │
 ├── S2: 中文底层适配 (i18n框架 + 搜索扩展)
 │    │
 │    └── S3: 中文 Profile + 数据 (可与S2后半段并行)
 │
 ├── S4: 术语服务 + 初始数据 (可与S2并行)
 │
 └── S5: 认证/授权 (依赖S1的User/Project/AccessPolicy)
      │
      └── S6: Client SDK (所有后台能力就绪后)
```

**核心原则**: S1 必须最先完成，因为它改变数据结构的根基。

---

## S1: 平台资源定义 + 多租户设计

### 为什么必须第一个做

1. **Schema 影响**: 平台资源 (Project, User, Login, Bot, AccessPolicy...) 需要生成对应的 PostgreSQL 表
2. **租户隔离影响**: 所有后续资源（包括中文 Profile 产生的资源）都需要在租户边界内操作
3. **当前 `profiles-platform.json` 为空**: schema 生成管线已预留加载位，但内容为空
4. **Auth 依赖**: S5 的认证/授权完全依赖这里定义的 User/Login/AccessPolicy

### 需要从 Medplum 分析的内容

| 分析项 | Medplum 文件/模块 | 输出 |
|--------|-------------------|------|
| **平台资源清单** | `profiles-medplum.json` | MedXAI 需要哪些平台资源？ |
| **Project 资源结构** | Project StructureDefinition | 多租户隔离的核心实体 |
| **User/Login 模型** | User, Login, ClientApplication SDs | 认证实体模型 |
| **AccessPolicy 结构** | AccessPolicy SD | 授权规则模型 |
| **Bot 资源** | Bot SD | 是否需要？评估取舍 |
| **ProjectMembership** | ProjectMembership SD | 用户-租户关联 |
| **租户隔离 SQL 策略** | `repo.ts` 中的 project filter | compartments 还是 project column？ |
| **平台 SearchParameter** | `search-parameters-medplum.json` | 平台资源的搜索参数 |

### 关键设计决策 (需要 ADR)

1. **租户隔离策略**
   - **方案 A**: Medplum 式 — 共享 schema，每行有 `project_id` (即 `compartments` 列已有此能力)
   - **方案 B**: Schema-per-tenant — 每个租户独立 PostgreSQL schema
   - **方案 C**: Database-per-tenant — 每个租户独立数据库
   - **建议**: 方案 A (与 Medplum 一致，利用已有 compartments 机制，中小型医院场景足够)

2. **平台资源裁剪**
   - Medplum 有 ~50 个自定义资源类型，MedXAI 不需要全部
   - 最小必要集: **Project, User, Login, ClientApplication, AccessPolicy, ProjectMembership**
   - 可选: Bot (自动化), BulkDataExport, AsyncJob, UserConfiguration
   - 暂不需要: Agent, SmartAppLaunch, PasswordChangeRequest (可后续添加)

3. **平台资源是否走标准 FHIR 持久化路径**
   - Medplum 的做法: 是 — 平台资源与临床资源共享同一 repo/schema 管线
   - 建议: 遵循 Medplum，利用已有基础设施

### 交付物

| 交付物 | 描述 |
|--------|------|
| `ADR-006-Platform-Resource-Strategy.md` | 平台资源设计决策 |
| `ADR-007-Multi-Tenant-Isolation.md` | 租户隔离策略决策 |
| `spec/platform/profiles-platform.json` (填充) | 平台资源 StructureDefinition Bundle |
| `spec/platform/search-parameters-platform.json` (填充) | 平台资源 SearchParameter Bundle |
| Schema 重新生成 | 包含平台表的完整 DDL |
| `FhirRepository` 租户过滤 | CRUD/Search 操作自动限定租户范围 |
| 单元测试 + 集成测试 | 平台资源 CRUD + 租户隔离验证 |

### 预估工作量

- **Medplum 分析**: 2-3 个工作会话 (提取 profiles-medplum.json 的核心子集)
- **ADR 编写**: 1 个工作会话
- **profiles-platform.json 编写**: 2-3 个工作会话 (6-10 个平台 SD)
- **Schema 生成验证**: 1 个工作会话
- **租户过滤集成**: 2-3 个工作会话
- **测试**: 2 个工作会话
- **合计**: ~10-14 个工作会话

### 完成标准 (Exit Criteria)

- [ ] `profiles-platform.json` 包含至少 6 个平台资源 SD
- [ ] DDL 重新生成，包含平台表，0 errors
- [ ] CRUD 操作支持租户隔离 (project scope)
- [ ] 搜索操作自动限定租户范围
- [ ] 全部测试通过 (0 regression)
- [ ] tsc --noEmit clean

---

## S2: 中文底层适配

### 前提条件

- **S1 完成** — 平台资源结构确定后，中文化才知道适配范围

### 工作内容

#### 2a. i18n 错误消息框架

| 模块 | 工作 |
|------|------|
| `fhir-core` (ParseIssue) | 添加 error code → 中文消息映射 |
| `fhir-core` (ValidationIssue) | 添加中文验证错误模板 |
| `fhir-server` (OperationOutcome) | 支持 `Accept-Language: zh-CN`，输出中文 diagnostics |

#### 2b. 搜索层中文适配

| 组件 | 工作 |
|------|------|
| PostgreSQL 扩展 | `zhparser` 或 `pg_jieba` 中文分词扩展安装 |
| 拼音索引 | `pgroonga` 或自定义拼音列 + GIN 索引 |
| SearchParameter | `:pinyin` modifier 或默认行为调整 |
| Lookup Table | HumanName 表增加拼音列 (pinyin, pinyin_initial) |

#### 2c. 验证层中文元数据

| 组件 | 工作 |
|------|------|
| StructureDefinition | `short`/`definition`/`comment` 中文默认 |
| FHIR translation extension | 支持多语言 display |

### 对持久化/Repo 的影响

- **HumanName lookup table**: 需要新增 `pinyin` TEXT, `pinyin_initial` TEXT 列
- **Address lookup table**: 可能需要中国行政区划支持
- **GIN 索引**: 需要 tsvector 中文分词配置
- **这些都是 schema 变更** → 必须在 S1 之后，确保 schema 管线稳定后再叠加

### 完成标准

- [ ] 错误消息支持中英文切换
- [ ] HumanName 搜索支持拼音首字母
- [ ] 中文全文搜索基本可用
- [ ] 不引入 schema 回归

---

## S3: 中文 Profile + 数据库内容

### 前提条件

- **S1 完成** — Profile 需要在平台资源/租户架构之上
- **S2 至少 2a 完成** — i18n 框架就绪

### 工作内容

#### 3a. 中文 Profile 库 (`fhir-cn-resources` 或 `spec/cn/`)

| Profile | 核心扩展 |
|---------|----------|
| CN-Patient | 身份证号 (Extension), 医保号, 民族 (GB/T 3304), 户籍 |
| CN-Practitioner | 医师资格证, 执业证书编号 |
| CN-Organization | 统一社会信用代码, 医疗机构执业许可证号 |
| CN-MedicationRequest | 医保目录编码, 限定支付范围 |
| CN-Encounter | 挂号类型, 就诊科室 |
| CN-DiagnosticReport | 检验报告 (LIS 规范) |

#### 3b. Profile → Schema 影响

- CN-Patient 的身份证/医保号扩展 → 可能需要新的搜索列或 Identifier 扩展
- 这些变更通过已有的 `profiles-platform.json` 或 `spec/cn/profiles-cn.json` 加载管线处理
- Schema 自动生成 → 无需手工 DDL

#### 3c. 与 S2 的并行关系

```
S2 开始 → [2a: i18n框架] → [2b: 搜索层中文] → [2c: 验证层中文]
                                ↓ (2a完成后)
S3 开始 → [3a: CN-Patient等Profile编写] → [3b: Schema生成验证] → [3c: 测试]
```

S3 可以在 S2 的 2a 完成后启动，与 2b/2c 并行。

### 完成标准

- [ ] 至少 5 个中国场景 Profile 定义完成
- [ ] Profile 通过 StructureValidator 验证
- [ ] Schema 自动生成包含 CN 扩展列
- [ ] 中文 Patient 示例资源完整 CRUD 测试

---

## S4: CodeSystem / ValueSet 初始数据策略

### 前提条件

- **S1 完成** — 术语资源也需要租户上下文
- 可与 S2/S3 并行

### 关键设计决策

1. **存储策略**
   - **方案 A**: 术语资源作为标准 FHIR 资源存入 DB (Medplum 做法)
   - **方案 B**: 文件加载 + 内存缓存 (类似 HAPI 的 DefaultProfileValidationSupport)
   - **方案 C**: 混合 — 核心术语文件加载，自定义术语入 DB
   - **建议**: 方案 C — 高频只读术语走文件/缓存，可编辑术语走 DB

2. **加载时机**
   - 服务器启动时预加载核心 CodeSystem
   - 或懒加载 (首次 $expand 时加载)
   - **建议**: 核心 20-30 个预加载，其余懒加载

3. **术语操作**
   - `$expand`: ValueSet 展开
   - `$validate-code`: 编码验证
   - `$lookup`: 概念查询 (需支持中文 display)
   - `$translate`: ConceptMap 转换 (低优先级)

### 初始数据规划

| 优先级 | CodeSystem | 来源 | 概念数 |
|--------|-----------|------|--------|
| P0 | 行政性别 | GB/T 2261.1 + FHIR AdministrativeGender | ~10 |
| P0 | 民族 | GB/T 3304 | 56 |
| P0 | 证件类型 | GA 325 | ~15 |
| P0 | 婚姻状况 | GB/T 2261.2 | ~10 |
| P1 | ICD-10-CN (高频100) | 卫健委 | 100 |
| P1 | 常用检验项目 | LOINC 中文 (高频) | 50-100 |
| P1 | 常用药品分类 | 国家药监局 | 50-100 |
| P2 | 完整 ICD-10-CN | 卫健委 | ~26,000 |
| P2 | 手术/操作编码 | ICD-9-CM-3 | ~10,000 |

### 对持久化/Repo 的影响

- CodeSystem/ValueSet 作为标准 FHIR 资源 → 复用已有 CRUD
- 需要实现 `$expand` / `$validate-code` operation 路由
- 可能需要 CodeSystem 索引表优化大术语集查询 (类似 Medplum 的 `CodeSystem_Property` 表)

### 完成标准

- [ ] 术语加载管线可用 (文件 → DB 或 内存)
- [ ] $expand / $validate-code / $lookup 端点可用
- [ ] 至少 P0 级别的 4 个 CodeSystem 加载并可查询
- [ ] 中文 display 正确返回

---

## S5: 认证/授权策略

### 前提条件

- **S1 完成** — User, Login, ClientApplication, AccessPolicy 资源已定义并可持久化

### 关键设计决策

1. **认证方式**
   - OAuth 2.0 + OpenID Connect (行业标准)
   - JWT access token + refresh token
   - 需要实现: `/auth/login`, `/auth/token`, `/auth/register`
   - 密码存储: bcrypt/argon2 哈希

2. **授权模型**
   - **RBAC**: 基于角色 (admin, doctor, nurse, patient)
   - **AccessPolicy**: 基于 Medplum 的 AccessPolicy 资源，定义资源级别的 read/write 权限
   - **Compartment-based**: 患者只能访问自己的 compartment

3. **中间件集成**
   - Fastify `preHandler` hook 验证 JWT
   - 每个请求注入 `project_id` + `user_id` 上下文
   - `FhirRepository` 操作自动限定到用户可访问的范围

### 对持久化/Repo 的影响

- **所有 CRUD 操作** 需要增加 auth context 参数
- **Search** 需要基于 AccessPolicy 过滤可见资源
- 这是对 `ResourceRepository` 接口最大的一次变更
- **必须仔细设计** 避免破坏已有 3549 个测试

### 实施策略

```
Phase 1: Auth middleware (JWT验证, 不影响现有API)
Phase 2: Repository context injection (auth context参数, 向后兼容)
Phase 3: AccessPolicy enforcement (查询条件自动注入)
Phase 4: 管理端点 (/auth/login, /auth/register, etc.)
```

### 完成标准

- [ ] JWT 认证流程完整 (login → token → refresh)
- [ ] 未认证请求返回 401
- [ ] 租户隔离通过认证上下文强制执行
- [ ] AccessPolicy 控制资源级读写权限
- [ ] 0 regression

---

## S6: Client SDK

### 前提条件

- **S1-S5 全部完成** — 后台功能完整且稳定

### 参考 Medplum Client 架构

Medplum 的 `@medplum/core` MedplumClient 提供:

| 能力 | 描述 |
|------|------|
| **FHIR CRUD** | `createResource()`, `readResource()`, `updateResource()`, `deleteResource()` |
| **Search** | `searchResources()`, `searchOne()` — 返回类型化结果 |
| **Auth** | `signIn()`, `signOut()`, `getAccessToken()` — OAuth2 流程 |
| **Batch/Transaction** | `executeBatch()` |
| **Operations** | `$validate`, `$expand`, `$everything` |
| **Subscriptions** | WebSocket 实时更新 |
| **Media** | Binary 资源上传/下载 |

### MedXAI Client SDK 设计建议

```typescript
// @medxai/fhir-client
class MedXAIClient {
  // Auth
  signIn(email: string, password: string): Promise<LoginResult>
  signOut(): Promise<void>
  getAccessToken(): string | undefined

  // CRUD (typed)
  createResource<T extends Resource>(resource: T): Promise<T>
  readResource<T extends Resource>(type: string, id: string): Promise<T>
  updateResource<T extends Resource>(resource: T): Promise<T>
  deleteResource(type: string, id: string): Promise<void>

  // Search
  searchResources<T extends Resource>(type: string, query?: URLSearchParams): Promise<Bundle<T>>
  searchOne<T extends Resource>(type: string, query?: URLSearchParams): Promise<T | undefined>

  // Operations
  validateResource(resource: Resource): Promise<OperationOutcome>
  expandValueSet(params: ExpandParams): Promise<ValueSet>
  
  // Batch
  executeBatch(bundle: Bundle): Promise<Bundle>
}
```

### 完成标准

- [ ] Client SDK 发布为 `@medxai/fhir-client` npm 包
- [ ] 完整类型化的 CRUD + Search API
- [ ] 认证流程集成
- [ ] 可在浏览器和 Node.js 环境使用
- [ ] 完整单元测试 + 集成测试

---

## 阶段间风险分析

### 最高风险: S1 → S5 的 Repo 接口变更

S1 (租户隔离) 和 S5 (授权) 都需要修改 `FhirRepository` 的公共接口。如果分两次改，每次都可能引起大量测试回归。

**建议**: S1 设计时就预留 auth context 参数 (即使 S5 之前暂时不用)：

```typescript
interface OperationContext {
  project?: string;      // S1: 租户标识
  user?: string;         // S5: 用户标识
  accessPolicy?: string; // S5: 策略标识
}

// S1 就改一次接口，S5 只扩展 context 内容
createResource(resource, options?, context?: OperationContext)
```

这样 S5 时不需要再次修改接口签名，只需要增加 context 的解析逻辑。

### 中等风险: S2/S3 的 Schema 变更

中文适配会增加 lookup table 列 (pinyin)。需要确保 schema diff/migration 管线能正确处理增量变更。

**建议**: S2 开始前先确保有 schema migration 能力 (目前是 --reset 全量重建)。

### 低风险: S4 术语服务

术语操作是新增端点，不修改已有 CRUD 路径，风险最低。

---

## 时间线建议

```
Week  1-3:  S1 — 平台资源 + 多租户 (含 Medplum 分析)
Week  4-5:  S2a — i18n 错误消息框架
Week  5-7:  S2b — 搜索层中文适配 + S3 启动 (并行)
Week  6-8:  S4 — 术语服务 (与 S2b/S3 并行)
Week  8-10: S3 — 中文 Profile 完成 + S2c 验证层中文
Week 10-13: S5 — 认证/授权
Week 13-15: S6 — Client SDK
```

**里程碑**:
- **M1 (Week 3)**: 平台资源就绪，多租户隔离可用 → "后台数据结构稳定"
- **M2 (Week 8)**: 中文搜索 + 术语服务可用 → "后台中文能力就绪"
- **M3 (Week 13)**: Auth 完成 → "后台安全稳定" ← **这是转入 Client 端的门槛**
- **M4 (Week 15)**: Client SDK 就绪 → "前端开发可以全面启动"

---

## 下一步行动 (Immediate Next Step)

**S1 的第一个子任务: Medplum profiles-medplum.json 分析**

需要完成:
1. 下载/阅读 Medplum `profiles-medplum.json`
2. 提取所有平台资源 StructureDefinition 清单
3. 分析 Project 的多租户隔离机制
4. 输出: `devdocs/medplum-reverse-engineering/WF-PLATFORM-001_platform-resources.md`
5. 输出: `ADR-006-Platform-Resource-Strategy.md` (草案)

**是否开始 S1 分析？**
