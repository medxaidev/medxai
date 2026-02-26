# S1 Phase D/E/F — 核心功能完善路线图

```yaml
document_type: roadmap
version: v1.0
status: IN-PROGRESS
scope: Phase D (Auth E2E + 验证激活) / Phase E (审计+Migration) / Phase F (fhir-client)
created_at: 2026-02-26
strategy: 集中完善核心功能，中文本地化延后
evidence_base: 3593 tests / 87 files / 0 failures (Phase C 完成后)
```

---

## 战略调整说明

在完成 Phase A (平台资源 + DDL), Phase B (OperationContext + 多租户), Phase C (Auth 集成) 后，决定：

1. **延后中文本地化** (S2-S6) — 中文部分主要涉及索引/显示/术语，不影响核心功能正确性
2. **集中完善核心功能** — 将已完成子系统的接线工作、验证激活、审计日志全部到位
3. **新增 fhir-client SDK** — 打通完整链路 (客户端 → 认证 → CRUD → 搜索 → 权限隔离)

---

## 延缓事项全盘点

### A 类：核心功能缺口（Phase D/E 解决）

| # | 来源 | 事项 | 风险 | 目标 Phase |
|---|------|------|------|-----------|
| A1 | R-010 | Auth E2E 集成测试 (真实 DB) | 🔴 | D1 |
| A2 | R-028 | 验证门控未真正激活 (FhirContext 未预加载) | 🟡 | D2 |
| A3 | R-004 | FHIRPath 未集成到验证器 | 🟡 | D3 |
| A4 | Phase C | AccessPolicy Layer 3 — 搜索 SQL 过滤 | 🟡 | D4 |
| A5 | R-029 | 审计日志 | 🟡 | E1 |
| A6 | R-007 | Schema Migration 工具 | 🟡 | E2 |
| A7 | R-026 | ResourceCache 未集成 | 🟢 | E3 |

### B 类：搜索/索引优化（延后，功能可用）

| # | 来源 | 事项 |
|---|------|------|
| B1 | Phase 16 | `_include:iterate` / `_include:recurse` |
| B2 | Phase 16 | `_include=*` 通配 |
| B3 | Phase 17 | 共享 Token 索引 (`__sharedTokens`) |
| B4 | Phase 19 | Re-index 不更新 lookup tables |
| B5 | Phase 19 | Re-index 不可恢复 |
| B6 | Phase 18 | 多级链式搜索 |
| B7 | Phase 20 | $everything 无分页 |
| B8 | R-013 | 游标分页 |
| B9 | — | 引用排序列 |
| B10 | — | Query EXPLAIN 日志 |

### C 类：中文/本地化（完全延后）

| # | 事项 |
|---|------|
| C1 | i18n 错误消息框架 |
| C2 | 搜索层中文适配 (zhparser/pg_jieba/拼音) |
| C3 | 中文 Profile (CN-Patient etc.) |
| C4 | 中国术语 (ICD-10-CN, GB/T 3304 etc.) |
| C5 | 中文 Profile snapshot 测试 (R-003) |

---

## Phase D: Auth E2E + 验证门控激活

**目标:** 将已完成的子系统真正接线，端到端验证功能正确性。

### D1: Auth E2E 集成测试

**文件:** `fhir-server/src/__tests__/auth/auth-e2e.test.ts`
**依赖:** Phase C (Auth 框架)，真实 PostgreSQL

**测试内容:**
1. `seedDatabase()` 在真实 DB 执行 — 创建 Project/User/ClientApplication/Membership
2. `initKeys()` 生成 JsonWebKey 到 DB
3. `POST /auth/login` (email + password → code)
4. `POST /oauth2/token` — authorization_code 换 access_token + refresh_token
5. `POST /oauth2/token` — client_credentials 流程
6. `POST /oauth2/token` — refresh_token 轮换
7. 带 Bearer token 的 CRUD (POST/GET/PUT/DELETE) 验证 OperationContext 注入
8. 多租户隔离: Project A 用户无法读取 Project B 数据
9. 无 token → 401 验证
10. AccessPolicy 基本隔离 (无 Patient 权限 → 403)

**验收标准:**
- 10+ 新测试通过
- 真实 DB 端到端
- 0 regressions

### D2: 验证门控激活

**文件:** `fhir-server/src/app.ts`, 新增 `fhir-server/src/context-loader.ts`

**内容:**
1. 服务器启动时创建 `FhirContextImpl` 实例
2. 加载 R4 核心 StructureDefinitions
3. 加载 `profiles-medxai.json` 平台 Profile
4. 用 `StructureValidator` 作为 `resourceValidator` 传入 `createApp()`
5. POST/PUT 请求自动触发结构验证

**验收标准:**
- 非法资源 → 422 + OperationOutcome
- 合法资源正常写入
- 验证不影响性能 (< 50ms per resource)

### D3: FHIRPath 集成到 Validator

**文件:** `fhir-core/src/validator/`

**内容:**
1. 接入 FHIRPath 引擎评估 `constraint.expression`
2. 违反 FHIRPath 约束 → validation issue
3. 解决 R-004 风险

**验收标准:**
- `Observation` 的 `obs-7` 约束可被检测
- 新增 10+ 测试

### D4: AccessPolicy Layer 3 — 搜索 SQL 过滤

**文件:** `fhir-persistence/src/search/`, `fhir-server/src/auth/access-policy.ts`

**内容:**
1. 解析 AccessPolicy.resource.criteria → SearchRequest
2. 在 `buildSearchSQL` 中注入额外 WHERE 条件
3. 搜索结果自动受 AccessPolicy 限制

**验收标准:**
- criteria = `?category=vital-signs` → 只返回生命体征 Observation
- 新增 10+ 测试

---

## Phase E: 审计日志 + Schema Migration + Cache

### E1: AuditEvent 审计日志

**内容:**
1. 定义 AuditEvent 资源写入策略
2. 每次状态变更操作 (create/update/delete) 自动写 AuditEvent
3. 关联 author/project/target 资源

### E2: Schema Migration 工具

**内容:**
1. 替代当前的 --reset 全量重建
2. 增量迁移: 版本号追踪 + up/down 脚本
3. 支持 DDL 变更的安全应用

### E3: ResourceCache 集成

**内容:**
1. 将已实现的 LRU Cache 接入 `FhirRepository.readResource()`
2. 写操作时失效缓存
3. 多租户安全 (project-scoped cache key)

---

## Phase F: fhir-client SDK

### F1: @medxai/fhir-client — 核心

**内容:**
1. `MedXAIClient` 主类
2. 类型化 CRUD: `client.readResource<Patient>('Patient', id)`
3. 类型化搜索: `client.search<Patient>('Patient', { name: 'Smith' })`
4. Bundle/Transaction 支持

### F2: Auth 集成

**内容:**
1. `client.signIn(email, password)` → 自动管理 token
2. Token 自动刷新 (refresh_token)
3. `client.signOut()` 清除会话

### F3: Client E2E 测试

**内容:**
1. 打通完整链路: 创建用户 → 登录 → CRUD → 搜索 → 权限隔离
2. 作为后端功能的最终验证

---

## 进度追踪

| Phase | 状态 | 测试 | 日期 |
|-------|------|------|------|
| D1: Auth E2E | ⬜ 未开始 | — | — |
| D2: 验证门控激活 | ⬜ 未开始 | — | — |
| D3: FHIRPath 集成 | ⬜ 未开始 | — | — |
| D4: AccessPolicy L3 | ⬜ 未开始 | — | — |
| E1: 审计日志 | ⬜ 未开始 | — | — |
| E2: Schema Migration | ⬜ 未开始 | — | — |
| E3: Cache 集成 | ⬜ 未开始 | — | — |
| F1: fhir-client 核心 | ⬜ 未开始 | — | — |
| F2: Client Auth | ⬜ 未开始 | — | — |
| F3: Client E2E | ⬜ 未开始 | — | — |
