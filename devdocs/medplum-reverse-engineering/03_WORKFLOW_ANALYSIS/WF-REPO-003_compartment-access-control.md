# Workflow Analysis: Compartment & Access Control

```yaml
workflow_id: WF-REPO-003
workflow_name: Compartment Calculation & Access Control
entry_point: "Repository.getCompartments() / addSecurityFilters()"
exit_point: "compartments UUID[] 列值 / SQL WHERE 条件"
phase: Phase-Server (Runtime CRUD — Security Layer)
source_files:
  - packages/server/src/fhir/repo.ts (getCompartments, addSecurityFilters, addProjectFilters, addAccessPolicyFilters, canPerformInteraction, isResourceWriteable)
  - packages/server/src/fhir/patient.ts (getPatients)
parent_workflow: WF-REPO-001
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. 核心问题

Medplum 的安全模型由三层组成：
1. **Project 隔离**：每个资源属于一个 Project，用户只能访问自己 Project 的资源
2. **Compartment**：FHIR 定义的资源分组机制（Patient compartment 等）
3. **AccessPolicy**：细粒度的访问控制策略

---

## 2. Compartment 计算 (getCompartments)

### 算法

```ts
// repo.ts:1728-1768
private getCompartments(resource: WithId<Resource>): Reference[] {
  const compartments = new Set<string>();

  // 1. Project compartment（已废弃，保留兼容）
  if (resource.meta?.project && isUUID(resource.meta.project)) {
    compartments.add('Project/' + resource.meta.project);
  }

  // 2. User 的 project compartment（已废弃）
  if (resource.resourceType === 'User' && resource.project?.reference) {
    compartments.add(resource.project.reference);
  }

  // 3. Account compartments
  if (resource.meta?.accounts) {
    for (const account of resource.meta.accounts) {
      // 排除 Project/ 前缀的引用（已在 projectId 列中）
      if (!account.reference?.startsWith('Project/') && isUUID(resolveId(account))) {
        compartments.add(account.reference);
      }
    }
  } else if (resource.meta?.account) {
    // 单 account 兼容
    if (!resource.meta.account.reference?.startsWith('Project/')) {
      compartments.add(resource.meta.account.reference);
    }
  }

  // 4. Patient compartments — 核心
  for (const patient of getPatients(resource)) {
    const patientId = resolveId(patient);
    if (patientId && isUUID(patientId)) {
      compartments.add(patient.reference);
    }
  }

  return Array.from(compartments).map(ref => ({ reference: ref }));
}
```

### Patient Compartment 提取 (getPatients)

`getPatients(resource)` 函数根据 FHIR CompartmentDefinition 规则，从资源中提取所有 Patient 引用：

```
资源类型          → Patient 引用字段
─────────────────────────────────────
Observation       → subject (if Patient), performer (if Patient)
Encounter         → subject (if Patient)
Condition         → subject (if Patient)
MedicationRequest → subject (if Patient)
DiagnosticReport  → subject (if Patient)
Task              → for (if Patient), owner (if Patient)
Patient           → 自身 (Patient/{id})
...               → 根据 CompartmentDefinition 规则
```

### Compartments 列的存储

```
compartments UUID[] = [
  'Project/550e8400-...',     // Project compartment（已废弃）
  'Organization/660e8400-...', // Account compartment
  'Patient/770e8400-...',      // Patient compartment
]
→ 存储为 UUID 数组（只存 ID 部分，不存 resourceType/）
```

**注意**：`compartments` 列存储的是 UUID 数组，通过 `resolveId()` 从 Reference 中提取 ID。

---

## 3. Project 过滤 (addProjectFilters)

### 写入时

```ts
// repo.ts:1975-2002
private getProjectId(existing, updated): string | undefined {
  // Project 资源 → projectId = resource.id
  // ProjectMembership → projectId = resource.project
  // protectedResourceTypes → undefined（系统资源）
  // superAdmin + 指定 meta.project → 使用指定值
  // 默认 → existing.meta.project ?? context.projects[0].id
}
```

### 读取时

```ts
// repo.ts:1553-1569
private addProjectFilters(builder, resourceType): void {
  if (this.context.projects?.length) {
    const projectIds = [this.context.projects[0].id]; // 主项目

    for (let i = 1; i < this.context.projects.length; i++) {
      const project = this.context.projects[i];
      // 包含条件：
      // - 搜索 Project 类型时，包含所有项目
      // - 当前项目
      // - 未指定 exportedResourceType 的项目（全部导出）
      // - 指定了 exportedResourceType 且包含当前 resourceType 的项目
      if (满足条件) {
        projectIds.push(project.id);
      }
    }

    builder.where('projectId', 'IN', projectIds);
  }
  // superAdmin 无 projects → 不添加 projectId 过滤
}
```

**多项目访问**：用户通常有 2 个项目：
1. 自己的项目（`projects[0]`）
2. 基础 R4 项目（`syntheticR4Project`，包含标准 FHIR 资源）

---

## 4. AccessPolicy 过滤 (addAccessPolicyFilters)

### 读取时的 SQL 过滤

```ts
// repo.ts:1576-1634
private addAccessPolicyFilters(builder, resourceType): void {
  const accessPolicy = this.context.accessPolicy;
  if (!accessPolicy?.resource) return;
  if (resourceType === 'Binary') return; // Binary 无搜索参数

  const expressions: Expression[] = [];

  for (const policy of accessPolicy.resource) {
    if (policy.resourceType === resourceType || policy.resourceType === '*') {

      if (policy.compartment) {
        // 方式1：Compartment 限制（已废弃）
        // WHERE compartments @> ARRAY[compartmentId]::UUID[]
        expressions.push(
          new Condition('compartments', 'ARRAY_OVERLAPS_AND_IS_NOT_NULL', compartmentId, 'UUID[]')
        );

      } else if (policy.criteria) {
        // 方式2：Criteria 限制（推荐）
        // 将 criteria 字符串解析为 SearchRequest
        // 然后构建 SQL WHERE 条件
        const searchRequest = parseSearchRequest(criteria);
        const expr = buildSearchExpression(this, builder, resourceType, searchRequest);
        expressions.push(expr);

      } else {
        // 方式3：无限制 → 允许访问所有资源
        return;
      }
    }
  }

  if (expressions.length > 0) {
    // 多个策略之间是 OR 关系
    builder.predicate.expressions.push(new Disjunction(expressions));
  }
}
```

### 写入时的权限检查

```ts
// 1. supportsInteraction — 粗粒度检查
supportsInteraction(interaction, resourceType): boolean {
  // protectedResourceTypes 只有 superAdmin 可访问
  // 检查 AccessPolicy 是否允许该 interaction
}

// 2. canPerformInteraction — 细粒度检查
canPerformInteraction(interaction, resource): AccessPolicyResource | undefined {
  // protectedResourceTypes 检查
  // 读操作：资源必须属于用户的某个 project
  // 写操作：资源必须属于用户的主项目 (projects[0])
  // 检查 AccessPolicy 的具体规则
}

// 3. isResourceWriteable — 写约束检查
isResourceWriteable(previous, current, interaction): boolean {
  // 检查 writeConstraint（FHIRPath 表达式）
  // 例如：%after.status != 'completed' （禁止修改已完成的资源）
  evalFhirPathTyped(constraint.expression, [current], {
    '%before': previous,
    '%after': current,
  });
}
```

---

## 5. 安全过滤的完整 SQL 示例

```sql
-- 普通用户搜索 Patient
SELECT content, deleted FROM "Patient"
WHERE
  deleted = false                                    -- 排除已删除
  AND "projectId" IN ('proj-1', 'r4-project')       -- Project 过滤
  AND (                                              -- AccessPolicy 过滤
    "compartments" @> ARRAY['org-123']::UUID[]       -- Compartment 限制
    OR ("status" = 'active')                         -- Criteria 限制
  )
  AND "birthdate" >= '1990-01-01'                    -- 用户搜索条件
ORDER BY "lastUpdated" DESC
LIMIT 20;
```

---

## 6. 权限检查时序

### 创建资源

```
1. supportsInteraction(CREATE, resourceType)     — 粗粒度
2. preCommitValidation()                          — 资源级钩子
3. [无 existing] 跳过 canPerformInteraction
4. rewriteAttachments + replaceConditionalReferences
5. 设置 meta (project, compartment, author, ...)
6. validateResource()                             — FHIR 验证
7. isResourceWriteable(undefined, result, CREATE) — 写约束
8. handleStorage()                                — 持久化
```

### 更新资源

```
1. supportsInteraction(UPDATE, resourceType)      — 粗粒度
2. preCommitValidation()
3. checkExistingResource() → readResourceImpl()
4. canPerformInteraction(UPDATE, existing)         — 检查旧版本
5. [ifMatch] 乐观锁检查
6. rewriteAttachments + replaceConditionalReferences
7. 设置 meta
8. validateResource()
9. isNotModified(existing, result)?                — 无变化则跳过
10. isResourceWriteable(existing, result, UPDATE)  — 写约束（含 %before/%after）
11. handleStorage()
```

### 读取资源

```
1. supportsInteraction(READ, resourceType)         — 粗粒度
2. [缓存命中] canPerformInteraction(READ, cached)  — 细粒度
3. [缓存未命中] readResourceFromDatabase()
   → addSecurityFilters(builder, resourceType)
     ├─ addProjectFilters()    — WHERE projectId IN (...)
     └─ addAccessPolicyFilters() — WHERE (compartment OR criteria)
4. removeHiddenFields(resource)                    — 隐藏字段
```

---

## 7. 隐藏字段与只读字段

```ts
// 读取时：移除 hiddenFields
removeHiddenFields(input): T {
  // AccessPolicy.hiddenFields → 删除指定字段
  // 非 extendedMode → 删除 meta.author, meta.project, meta.account, meta.compartment
}

// 写入时：恢复 readonlyFields
restoreReadonlyFields(input, original): T {
  // AccessPolicy.readonlyFields + hiddenFields → 从 original 恢复
  // 防止用户修改受保护的字段
}
```

---

## 8. RepositoryContext 完整结构

```ts
interface RepositoryContext {
  author: Reference;              // 当前用户引用
  onBehalfOf?: Reference;         // 代理操作
  remoteAddress?: string;         // 客户端 IP
  projects?: WithId<Project>[];   // 可访问的项目列表
  currentProject?: WithId<Project>; // 当前项目
  accessPolicy?: AccessPolicy;    // 访问控制策略
  superAdmin?: boolean;           // 系统管理员
  projectAdmin?: boolean;         // 项目管理员
  strictMode?: boolean;           // 严格验证模式
  checkReferencesOnWrite?: boolean; // 写入时验证引用
  validateTerminology?: boolean;  // 术语验证
  extendedMode?: boolean;         // 扩展元数据模式
}
```

---

## 9. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| 多租户隔离？ | projectId 列 + SQL WHERE | 必须实现，基础安全需求 |
| Compartment？ | UUID[] 列 + GIN 索引 | FHIR 规范要求，用于 Patient 级访问控制 |
| AccessPolicy？ | Criteria 字符串 → SQL WHERE | 灵活但复杂，可简化为角色+资源类型 |
| 写约束？ | FHIRPath 表达式 | 强大但性能开销大，按需启用 |
| 隐藏字段？ | AccessPolicy.hiddenFields | 好的设计，支持字段级权限 |
| superAdmin？ | 跳过所有安全检查 | 必须有，但要严格控制 |
| 缓存与安全？ | 事务中不读缓存 | 正确，避免脏读 |
