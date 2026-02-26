# S1 Phase A+B: 平台资源定义 + Repository 多租户集成

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
completed_at: 2026-02-26
scope: Platform resource definitions, DDL generation, OperationContext, multi-tenant filtering
prerequisite: Phase 22 + REVIEW-005 v1.2 (3549/3549 tests passing)
related_adr: ADR-006-Platform-Resource-and-Multi-Tenant-Strategy.md
```

---

## Phase A: 文件与 Schema (S1-A ~ S1-F)

### 交付物

| 步骤 | 交付物 | 状态 |
|------|--------|------|
| S1-A | ADR-006 平台资源+多租户+RBAC 策略设计文档 | ✅ 完成 |
| S1-B | `spec/platform/profiles-medxai.json` — 7 个核心平台资源 StructureDefinition | ✅ 完成 |
| S1-C | `spec/platform/search-parameters-medxai.json` — 20 个平台搜索参数 | ✅ 完成 |
| S1-D | `init-db.ts` + `generate-schema.ts` 加载平台 profiles + SP | ✅ 完成 |
| S1-E | DDL 验证 — 153 资源类型, 4896 DDL, 7 个平台表确认 | ✅ 完成 |
| S1-F | 测试验证 — tsc clean, 3549/3549 pass, 0 regressions | ✅ 完成 |

### 关键数据

- **资源类型**: 153 (146 标准 FHIR R4 + 7 MedXAI 平台)
- **DDL 语句数**: 4896 (此前为 4726)
- **平台搜索参数**: 20 个 indexed, 0 skipped
- **v7 DDL 对比**: 0 bugs, 所有差异为有意设计决策

### 7 个核心平台资源

| 资源类型 | Tier | 用途 |
|----------|------|------|
| Project | 1 | 多租户容器 |
| User | 1 | 人类用户账号 |
| ProjectMembership | 1 | 用户-项目-角色关联 |
| Login | 0 | OAuth2 登录会话 |
| ClientApplication | 2 | OAuth2 客户端应用 |
| AccessPolicy | 2 | 细粒度访问控制策略 |
| JsonWebKey | 0 | JWT 签名密钥 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `spec/platform/profiles-medxai.json` | 新建 — 7 个 StructureDefinition Bundle |
| `spec/platform/search-parameters-medxai.json` | 新建 — 20 个 SearchParameter Bundle |
| `packages/fhir-persistence/scripts/init-db.ts` | 加载平台 profiles + SP |
| `packages/fhir-persistence/src/cli/generate-schema.ts` | 同上 |

---

## Phase B: Repository 集成 (S1-G ~ S1-J)

### 交付物

| 步骤 | 交付物 | 状态 |
|------|--------|------|
| S1-G | OperationContext 接口 + PLATFORM/PROTECTED/PROJECT_ADMIN 常量 | ✅ 完成 |
| S1-H | FhirRepository CRUD 方法增加 `context?` 参数 + project 隔离检查 | ✅ 完成 |
| S1-I | Search 路径增加 project 过滤 (SearchRequest.project + SQL WHERE) | ✅ 完成 |
| S1-J | Phase B 测试验证 — tsc clean, 3549/3549 pass, 0 regressions | ✅ 完成 |

### OperationContext 接口

```typescript
export interface OperationContext {
  project?: string;       // S1: 多租户隔离
  author?: string;        // S5/Phase C: 操作执行者
  accessPolicy?: string;  // S5/Phase C: AccessPolicy ID
  superAdmin?: boolean;   // 超级管理员 (跳过 project 隔离)
}
```

### 平台资源类型常量

```typescript
PLATFORM_RESOURCE_TYPES     = Set(7): Project, User, ProjectMembership, Login, ClientApplication, AccessPolicy, JsonWebKey
PROTECTED_RESOURCE_TYPES    = Set(2): Project, JsonWebKey
PROJECT_ADMIN_RESOURCE_TYPES = Set(5): ProjectMembership, ClientApplication, AccessPolicy, User, Login
```

### 多租户隔离行为

| 操作路径 | 行为 |
|----------|------|
| **createResource** | `context.project` → `projectId` 列 (via `resolveProjectId()`) |
| **readResource** | 验证 `row.projectId === context.project`, 不匹配抛 404 |
| **updateResource** | FOR UPDATE 锁内检查 `projectId` 隔离 |
| **deleteResource** | 同上 |
| **searchResources** | 自动注入 `request.project = context.project` |
| **superAdmin** | 跳过所有 project 隔离检查 |
| **Cache** | project-scoped 读取绕过缓存, 防止跨租户泄漏 |

### Search SQL 变更

```sql
-- 当 request.project 存在时, buildSearchSQL/buildCountSQL 增加:
WHERE "deleted" = false AND "projectId" = $1 AND ...
```

### 修改文件

| 文件 | 变更 |
|------|------|
| `fhir-persistence/src/repo/types.ts` | OperationContext, 平台常量, ResourceRepository 接口更新 |
| `fhir-persistence/src/repo/fhir-repo.ts` | 所有 CRUD+search 方法接受 context, project 隔离检查 |
| `fhir-persistence/src/repo/row-builder.ts` | `resolveProjectId()`, context 参数透传 |
| `fhir-persistence/src/repo/sql-builder.ts` | `buildSelectByIdSQL` 返回 projectId |
| `fhir-persistence/src/search/types.ts` | `SearchRequest.project` 字段 |
| `fhir-persistence/src/search/search-sql-builder.ts` | projectId WHERE 过滤 |
| `fhir-persistence/src/repo/index.ts` | 导出 OperationContext + 常量 |
| `fhir-persistence/src/index.ts` | 再导出 OperationContext + 常量 |
| `fhir-persistence/src/__tests__/repo/sql-builder.test.ts` | 更新 projectId SELECT 预期 |

### 验证结果

| 指标 | 结果 |
|------|------|
| tsc --noEmit (fhir-persistence) | ✅ clean |
| tsc --noEmit (fhir-server) | ✅ clean |
| Tests | ✅ 3549/3549 pass, 84 files, 0 failures |
| Regressions | ✅ 0 |
| 向后兼容 | ✅ 所有 `context` 参数可选 |

---

## 下一步: Phase C — Auth 集成

参见: `S1-Phase-C-Auth-Integration.md`
