# End-to-End Analysis: POST /Patient Write Path

```yaml
workflow_id: WF-E2E-001
workflow_name: "POST /fhir/R4/Patient — 完整写路径端到端分析"
entry_point: "HTTP POST /fhir/R4/Patient"
exit_point: "HTTP 201 Created + Patient JSON"
phase: Phase-Server (Runtime E2E)
source_files:
  - packages/server/src/app.ts (Express 路由挂载)
  - packages/server/src/fhir/routes.ts (FHIR 路由分发)
  - packages/fhir-router/src/fhirrouter.ts (FhirRouter URL 路由)
  - packages/fhir-router/src/repo.ts (FhirRepository 抽象类)
  - packages/server/src/fhir/repo.ts (Repository 具体实现)
  - packages/server/src/fhir/sql.ts (InsertQuery SQL 构建)
  - packages/server/src/fhir/token-column.ts (Token 列值构建)
  - packages/server/src/fhir/patient.ts (Patient compartment 计算)
related_workflows:
  - WF-REPO-001 (Write Path 架构)
  - WF-REPO-002 (Search Column 提取)
  - WF-REPO-003 (Compartment & Access Control)
  - WF-MIG-002 (Resource Table Schema)
analysis_status: Complete
author: fangjun
last_update: 2026-02-23
```

---

## 第一部分：HTTP 入口 → fhir-router → Repository

### 1.1 Express 路由挂载

```
app.ts:212
  apiRouter.use('/fhir/R4/', fhirRouter)
```

所有 `/fhir/R4/*` 请求进入 `fhirRouter`（Express Router）。

### 1.2 认证中间件

```
routes.ts:157-158
  const protectedRoutes = Router().use(authenticateRequest);
  fhirRouter.use(protectedRoutes);
```

`authenticateRequest` 中间件验证 Bearer token，构建 `AuthenticatedRequestContext`（包含 `repo: Repository`）。

### 1.3 默认路由 → FhirRouter 分发

```ts
// routes.ts:418-458
protectedRoutes.use('{*splat}', async function routeFhirRequest(req, res) {
  const ctx = getAuthenticatedContext();

  const request: FhirRequest = {
    method: req.method as HttpMethod,           // 'POST'
    url: stripPrefix(req.originalUrl, '/fhir/R4'), // '/Patient'
    pathname: '',
    params: req.params,
    query: Object.create(null),
    body: req.body ?? {},                       // Patient JSON
    headers: req.headers,
    config: { ... },
  };

  let result = await getInternalFhirRouter().handleRequest(request, ctx.repo);
  //                                                        ↑ FhirRequest  ↑ Repository实例
  await sendFhirResponse(req, res, result[0], result[1], result[2]);
});
```

**关键**：`ctx.repo` 是在认证中间件中创建的 `Repository` 实例，绑定了当前用户的上下文。

### 1.4 FhirRouter URL 匹配

```ts
// fhirrouter.ts:319
this.router.add('POST', ':resourceType', createResource, { interaction: 'create' });
```

`Router.find('POST', '/Patient')` 匹配到 `createResource` handler，提取 `params = { resourceType: 'Patient' }`。

```ts
// fhirrouter.ts:340-362
async handleRequest(req: FhirRequest, repo: FhirRepository): Promise<FhirResponse> {
  const result = this.find(req.method, req.url);  // 匹配路由
  const { handler, path, params, query } = result;
  req.params = params;                              // { resourceType: 'Patient' }
  req.pathname = path;
  return await handler(req, repo, this);            // → createResource()
}
```

### 1.5 fhir-router createResource handler

```ts
// fhirrouter.ts:138-165
async function createResource(req, repo, _router, options?): Promise<FhirResponse> {
  const { resourceType } = req.params;              // 'Patient'
  const resource = req.body as Resource;             // Patient JSON from request body

  // If-None-Exist header → conditional create
  if (req.headers?.['if-none-exist']) {
    const result = await repo.conditionalCreate(resource, parseSearchRequest(...), { assignedId });
    return [result.outcome, result.resource];
  }

  // 普通创建
  return createResourceImpl(resourceType, resource, repo, { assignedId });
}

async function createResourceImpl(resourceType, resource, repo, options?): Promise<FhirResponse> {
  if (resource.resourceType !== resourceType) {
    return [badRequest(...)];
  }
  const result = await repo.createResource(resource, options);  // ★ 进入 Repository
  return [created, result];                                      // HTTP 201
}
```

**到此为止的调用链**：
```
HTTP POST /fhir/R4/Patient
  → Express middleware (auth)
    → routeFhirRequest()
      → FhirRouter.handleRequest()
        → createResource() handler
          → createResourceImpl()
            → repo.createResource(patientJson)   ★ 进入 Repository
```

---

## 第二部分：Repository.createResource 完整实现

### 2.1 入口

```ts
// repo.ts:356-396
async createResource<T extends Resource>(resource: T, options?: CreateResourceOptions): Promise<WithId<T>> {
  // 1. 速率限制
  await this.rateLimiter()?.recordWrite();

  // 2. 资源配额检查
  await this.resourceCap()?.created();

  // 3. [batch模式] 检查 assignedId 是否已存在
  if (options?.assignedId && resource.id && !this.context.superAdmin) {
    const systemRepo = getSystemRepo();
    try {
      const existing = await systemRepo.readResourceImpl(resource.resourceType, resource.id);
      if (existing) throw new Error('Assigned ID is already in use');
    } catch (err) {
      if (!isNotFound(normalizeOperationOutcome(err))) throw err;
      // Not found = OK, can use this ID
    }
  }

  // ★ 4. ID 生成
  const resourceWithId = {
    ...resource,
    id: options?.assignedId && resource.id ? resource.id : this.generateId(),
    //                                                      ↑ uuid.v4()
  };

  // 5. 调用共享的 updateResourceImpl
  const result = await this.updateResourceImpl(resourceWithId, true);  // create=true

  // 6. 审计日志（postCommit）
  await this.postCommit(async () => {
    this.logEvent(CreateInteraction, AuditEventOutcome.Success, undefined, { resource: result, durationMs });
  });

  return result;
}
```

### 2.2 generateId() 实现

```ts
// repo.ts:398-400
generateId(): string {
  return v4();  // uuid 库的 v4()，应用端生成，纯随机 UUID
}
```

### 2.3 updateResourceImpl — 创建/更新共用核心

```ts
// repo.ts:757-840
private async updateResourceImpl<T extends Resource>(
  resource: T,
  create: boolean,           // true = 创建, false = 更新
  options?: UpdateResourceOptions
): Promise<WithId<T>> {

  // ── 阶段 A: 权限检查 ──
  const interaction = create ? CREATE : UPDATE;
  let validatedResource = this.checkResourcePermissions(resource, interaction);
  //  → 验证 id 存在且为 UUID
  //  → 添加默认 profile（从 Project 配置）
  //  → 检查 AccessPolicy 是否支持该 interaction

  // ── 阶段 B: 预提交钩子 ──
  const preCommitResult = await preCommitValidation(this, validatedResource, 'update');
  //  → Bot/Subscription 等资源的特殊验证

  // ── 阶段 C: 读取现有资源（仅 update） ──
  const existing = create ? undefined : await this.checkExistingResource(resourceType, id);
  if (existing) {
    existing.meta.compartment = this.getCompartments(existing);  // 用最新规则重算
    if (!this.canPerformInteraction(interaction, existing)) {
      throw forbidden;
    }
    // ★ 乐观锁检查（应用层）
    if (options?.ifMatch && existing.meta?.versionId !== options.ifMatch) {
      throw preconditionFailed;  // HTTP 412
    }
  }

  // ── 阶段 D: 资源预处理 ──
  let updated = await rewriteAttachments(REFERENCE, this, {
    ...this.restoreReadonlyFields(validatedResource, existing),
  });
  updated = await replaceConditionalReferences(this, updated);

  // ── 阶段 E: 构建 meta ──
  const resultMeta: Meta = {
    ...updated.meta,
    versionId: this.generateId(),                              // ★ 新 UUID（不是整数自增）
    lastUpdated: this.getLastUpdated(existing, validatedResource), // 当前时间或保留原值
    author: this.getAuthor(validatedResource),                 // 当前用户
    onBehalfOf: this.context.onBehalfOf,
  };

  const result = { ...updated, meta: resultMeta };

  // ── 阶段 F: Project / Account / Compartment ──
  const projectId = this.getProjectId(existing, updated);
  if (projectId) resultMeta.project = projectId;

  const accounts = await this.getAccounts(existing, updated);
  if (accounts) {
    resultMeta.account = accounts[0];
    resultMeta.accounts = accounts;
  }

  resultMeta.compartment = this.getCompartments(result);       // ★ 计算 compartments

  // ── 阶段 G: FHIR 验证 ──
  await this.validateResource(result);
  if (this.context.checkReferencesOnWrite) {
    await this.preCommit(async () => {
      await validateResourceReferences(this, result);
    });
  }

  // ── 阶段 H: 无变更检测（仅 update） ──
  if (this.isNotModified(existing, result)) {
    return existing;  // 跳过写入，直接返回
  }

  // ── 阶段 I: 写约束检查 ──
  if (!this.isResourceWriteable(existing, result, interaction)) {
    throw forbidden;
  }

  // ── 阶段 J: ★ 持久化 ──
  await this.handleStorage(result, create);

  // ── 阶段 K: 后续异步任务 ──
  await this.postCommit(async () => this.handleBinaryUpdate(existing, result));
  await this.postCommit(async () => {
    const project = await this.getProjectById(projectId);
    await addBackgroundJobs(result, existing, { project, interaction });
    //  → Subscription 触发、Bot 执行等
  });

  return this.removeHiddenFields(deepClone(result));
}
```

---

## 第三部分：数据库操作（事务内 3 步）

### 3.1 handleStorage → writeToDatabase

```ts
// repo.ts:896-922
private async handleStorage(resource, create): Promise<void> {
  if (!this.isCacheOnly(resource)) {
    await this.writeToDatabase(resource, create);   // ★ 数据库写入
  }
  if (resource.resourceType !== 'AuditEvent') {
    await this.setCacheEntry(resource);              // Redis 缓存
  }
}
```

### 3.2 writeToDatabase — 事务边界

```ts
// repo.ts:1118-1124
private async writeToDatabase(resource, create): Promise<void> {
  await this.ensureInTransaction(async (client) => {
    await this.writeResource(client, resource);        // Step 1: 主表 UPSERT
    await this.writeResourceVersion(client, resource); // Step 2: History 表 INSERT
    await this.writeLookupTables(client, resource, create); // Step 3: Lookup 表更新
  });
}
```

**事务边界**：这 3 步在**同一个 PostgreSQL 事务**中执行。默认隔离级别 `REPEATABLE READ`。

### 3.3 Step 1: writeResource — 主表 UPSERT

```ts
// repo.ts:1683-1685
private async writeResource(client, resource): Promise<void> {
  await new InsertQuery(resource.resourceType, [this.buildResourceRow(resource)])
    .mergeOnConflict()   // ON CONFLICT ("id") DO UPDATE SET ...
    .execute(client);
}
```

**生成的 SQL**（以 Patient 为例）：
```sql
INSERT INTO "Patient" (
  "id", "lastUpdated", "deleted", "projectId", "content", "__version",
  "compartments",
  "birthdate", "active", "gender",
  "__identifier", "__identifierText", "__identifierSort",
  "__code", "__codeText", "__codeSort",
  "__nameSort",
  -- ... 其他搜索列
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ...)
ON CONFLICT ("id") DO UPDATE SET
  "lastUpdated" = EXCLUDED."lastUpdated",
  "deleted" = EXCLUDED."deleted",
  "projectId" = EXCLUDED."projectId",
  "content" = EXCLUDED."content",
  "__version" = EXCLUDED."__version",
  "compartments" = EXCLUDED."compartments",
  "birthdate" = EXCLUDED."birthdate",
  -- ... 所有非冲突列
```

**`mergeOnConflict()` 实现**（sql.ts:1039-1153）：
- 默认冲突列 = `['id']`
- 生成 `ON CONFLICT ("id") DO UPDATE SET col = EXCLUDED.col` 对每个非 id 列
- 创建时：INSERT 成功（无冲突）
- 更新时：ON CONFLICT 触发 UPDATE（覆盖所有列）

### 3.4 Step 2: writeResourceVersion — History 表 INSERT

```ts
// repo.ts:1705-1718
private async writeResourceVersion(client, resource): Promise<void> {
  await new InsertQuery(resourceType + '_History', [{
    id: resource.id,                    // 资源 ID（不变）
    versionId: meta.versionId,          // ★ 新生成的 UUID
    lastUpdated: meta.lastUpdated,      // 时间戳
    content: stringify(resource),       // 该版本的完整 JSON
  }]).execute(client);
}
```

**生成的 SQL**：
```sql
INSERT INTO "Patient_History" ("id", "versionId", "lastUpdated", "content")
VALUES ($1, $2, $3, $4)
```

**关键**：
- History 表只 INSERT，**永不 UPDATE**
- 每次 create/update 都写入一条新的 History 行
- `versionId` 是 UUID，不是整数自增
- History 行的 `content` 是该版本的完整 JSON 快照

### 3.5 Step 3: writeLookupTables — Lookup 表更新

```ts
// repo.ts:1915-1919
private async writeLookupTables(client, resource, create): Promise<void> {
  for (const lookupTable of lookupTables) {
    await lookupTable.indexResource(client, resource, create);
  }
}
```

5 个 Lookup 表依次处理：`AddressTable`, `HumanNameTable`, `ReferenceTable`, `CodingTable`, `ConceptMappingTable`。

**更新策略**：先 `DELETE WHERE resourceId = ?`，再 `INSERT` 新行。

---

## 第四部分：Search Column 填充

### 4.1 填充时机

Search column 的填充发生在 `buildResourceRow()` 中，该函数在 `writeResource()` 内被调用。

```
writeToDatabase()
  └─ ensureInTransaction()
       ├─ writeResource()
       │    └─ buildResourceRow()          ★ 此处填充所有搜索列
       │         ├─ 基础列: id, lastUpdated, deleted, projectId, content, __version
       │         └─ for each searchParam:
       │              buildColumn(resource, row, searchParam)
       ├─ writeResourceVersion()
       └─ writeLookupTables()
```

**结论**：Search column 填充是**同步的**，在**INSERT 之前**（构建行数据时），在**同一个事务内**。

### 4.2 buildResourceRow 完整流程

```ts
// repo.ts:1636-1674
private buildResourceRow(resource): Record<string, any> {
  const row = {
    id: resource.id,
    lastUpdated: meta.lastUpdated,
    deleted: false,
    projectId: meta.project ?? systemResourceProjectId,
    content: stringify(resource),          // 完整 JSON
    __version: Repository.VERSION,         // 当前 = 13
  };

  const searchParams = getStandardAndDerivedSearchParameters(resourceType);
  for (const searchParam of searchParams) {
    this.buildColumn(resource, row, searchParam);
    //  → 根据策略填充不同列：
    //    COLUMN:       row['birthdate'] = '1990-01-01'
    //    TOKEN-COLUMN: row['__identifier'] = [uuid1, uuid2, ...]
    //    LOOKUP-TABLE: row['__nameSort'] = 'Smith, John' (仅排序列)
  }

  return row;
}
```

### 4.3 三种策略的填充细节

| 策略 | 填充位置 | 填充内容 | 示例 |
|------|----------|----------|------|
| **COLUMN** | `buildColumnValues()` | FHIRPath 求值 → 类型转换 → 标量/数组值 | `birthdate = '1990-01-01'` |
| **TOKEN-COLUMN** | `buildTokenColumns()` | FHIRPath 求值 → Token 提取 → UUID v5 哈希数组 | `__identifier = ['abc-uuid', ...]` |
| **LOOKUP-TABLE** | `writeLookupTables()` | 独立表 INSERT（主表只写排序列） | `__nameSort = 'Smith, John'` |

### 4.4 Token 哈希算法

```ts
// token-column.ts:129-131
function hashTokenColumnValue(value: string): string {
  return v5(value, NIL);  // UUID v5，命名空间 = NIL UUID (00000000-0000-0000-0000-000000000000)
}
```

输入示例：`'http://example.com\x01MRN123'` → 输出：确定性 UUID。

---

## 第五部分：History 写入时序

### 创建场景

```
时间线：
  T1: buildResourceRow()      → 构建行数据（含搜索列）
  T2: INSERT "Patient"        → 主表写入（新行）
  T3: INSERT "Patient_History" → History 写入（第一个版本）
  T4: writeLookupTables()     → Lookup 表写入
  T5: COMMIT                  → 事务提交
  T6: setCacheEntry()         → Redis 缓存（postCommit）
  T7: logEvent()              → AuditEvent（postCommit）
  T8: addBackgroundJobs()     → Subscription/Bot（postCommit）
```

### 更新场景

```
时间线：
  T0: readResourceImpl()      → 读取现有资源（existing）
  T1: buildResourceRow()      → 构建新版本行数据
  T2: UPSERT "Patient"        → 主表覆盖（ON CONFLICT DO UPDATE）
  T3: INSERT "Patient_History" → History 写入（★ 写的是新版本，不是旧版本）
  T4: writeLookupTables()     → Lookup 表更新（DELETE + INSERT）
  T5: COMMIT
```

**关键发现**：History 表写入的是**新版本**（当前写入的内容），而不是旧版本。旧版本已经在之前的写入中被记录到 History 表了。每次写入都产生一条新的 History 行。

---

## 第六部分：7 个关键问题解答

### a. UUID 生成

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 生成方式 | **应用端** `uuid.v4()`，纯随机 UUID | repo.ts:398-400 |
| 不是 DB 端 | 不使用 `gen_random_uuid()` | — |
| 用于 | resource.id 和 meta.versionId | repo.ts:377, 794 |

```ts
// repo.ts:398-400
generateId(): string {
  return v4();  // 来自 'uuid' npm 包
}
```

### b. version_id

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 类型 | **UUID**（不是 INTEGER） | repo.ts:794 |
| 初始值 | 随机 UUID（无 0 或 1 的概念） | — |
| 递增方式 | 每次写入生成新 UUID（无序） | — |
| 存储位置 | `meta.versionId`（JSON 内）+ `Patient_History.versionId` 列 | repo.ts:1711-1713 |

```ts
// repo.ts:792-794
const resultMeta: Meta = {
  ...updated.meta,
  versionId: this.generateId(),  // ★ 每次写入都是新 UUID
  lastUpdated: this.getLastUpdated(existing, validatedResource),
};
```

### c. History 写入时机

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 时机 | 在主表 UPSERT **之后**，同一事务内 | repo.ts:1118-1124 |
| 写入内容 | **新版本**的完整 JSON（不是旧版本） | repo.ts:1705-1718 |
| 创建时 | 写入第一个版本 | — |
| 更新时 | 写入新版本（旧版本已在之前的写入中记录） | — |

```ts
// repo.ts:1118-1124 — 执行顺序
await this.writeResource(client, resource);        // 1. 主表 UPSERT
await this.writeResourceVersion(client, resource); // 2. History INSERT（新版本）
await this.writeLookupTables(client, resource);    // 3. Lookup 表
```

### d. Soft delete

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 方式 | **软删除**：`deleted = true` | repo.ts:1295-1312 |
| 主表行 | 保留，`content = ''`（空字符串） | repo.ts:1294, 1300 |
| `__version` | 设为 `-1` | repo.ts:1301 |
| 搜索列 | 全部设为 `null`（通过对空资源求值） | repo.ts:1308-1310 |
| History | 写入一条 `content = ''` 的删除版本 | repo.ts:1314-1321 |
| Lookup 表 | `DELETE WHERE resourceId = ?` | repo.ts:1323 |
| 物理删除 | 仅 `expungeResource()`（需 superAdmin） | repo.ts:1392-1418 |

```ts
// repo.ts:1292-1323 — 删除操作
const columns = {
  id,
  lastUpdated,
  deleted: true,                    // ★ 软删除标记
  projectId: resource.meta?.project ?? systemResourceProjectId,
  content: '',                      // ★ 空内容
  __version: -1,                    // ★ 标记为已删除
};
// 搜索列通过 buildColumn 对空资源求值 → 全部为 null
for (const searchParam of getStandardAndDerivedSearchParameters(resourceType)) {
  this.buildColumn({ resourceType } as Resource, columns, searchParam);
}
await new InsertQuery(resourceType, [columns]).mergeOnConflict().execute(conn);
```

### e. Search columns

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 填充时机 | **同一个事务内**，在 INSERT 之前（构建行数据时） | repo.ts:1636-1674 |
| 同步/异步 | **同步**，`buildResourceRow()` 是同步计算 | — |
| 与 INSERT 关系 | 搜索列值作为 INSERT 语句的一部分写入 | repo.ts:1683-1685 |
| 不是后台任务 | 不是异步后台任务 | — |

### f. Compartments

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 计算方式 | **查 FHIR 规范**（CompartmentDefinition JSON） | patient.ts:25-28 |
| 不是硬编码 | 从 `compartmentdefinition-patient.json` 动态加载 | — |
| 数据来源 | `@medplum/definitions` 包中的 FHIR R4 规范文件 | patient.ts:5 |
| 算法 | 遍历 CompartmentDefinition.resource，用 FHIRPath 提取 Patient 引用 | patient.ts:56-75 |

```ts
// patient.ts:25-28
function getPatientCompartments(): CompartmentDefinition {
  patientCompartment ??= readJson('fhir/r4/compartmentdefinition-patient.json');
  return patientCompartment;
}

// patient.ts:56-75
function getPatients(resource): Reference[] {
  // 1. Patient 资源 → 自身引用
  if (resource.resourceType === 'Patient' && resource.id) {
    result.add('Patient/' + resource.id);
  }
  // 2. 其他资源 → 从 CompartmentDefinition 查找 Patient 引用字段
  const params = getPatientCompartmentParams(resource.resourceType);
  for (const code of params) {
    const searchParam = getSearchParameter(resource.resourceType, code);
    const values = evalFhirPath(searchParam.expression, resource);
    for (const value of values) {
      if (value.reference?.startsWith('Patient/')) {
        result.add(value.reference);
      }
    }
  }
  return Array.from(result).map(ref => ({ reference: ref }));
}
```

### g. Optimistic locking

| 问题 | 答案 | 源码位置 |
|------|------|----------|
| 检查方式 | **应用层**：先 SELECT 读取现有资源，再比较 versionId | repo.ts:775-784 |
| 不是 SQL 层 | 不使用 `WHERE version_id = ?` | — |
| 触发条件 | 仅当请求包含 `If-Match` header 时 | repo.ts:715-717 |
| 失败响应 | HTTP 412 Precondition Failed | repo.ts:783 |
| 事务保证 | `If-Match` 更新在 SERIALIZABLE 事务中执行 | repo.ts:715-717 |

```ts
// repo.ts:775-784
const existing = create ? undefined : await this.checkExistingResource(resourceType, id);
if (existing) {
  // ★ 应用层比较 versionId
  if (options?.ifMatch && existing.meta?.versionId !== options.ifMatch) {
    throw new OperationOutcomeError(preconditionFailed);  // HTTP 412
  }
}

// repo.ts:715-717 — If-Match 更新在事务中
if (options?.ifMatch) {
  result = await this.withTransaction(() => this.updateResourceImpl(resource, false, options));
}
```

---

## 第七部分：fhir-router 继承分析

### 7.1 继承关系

```
FhirRepository<TClient>          (packages/fhir-router/src/repo.ts)
  ↑ abstract class
  │
  ├─ abstract createResource()
  ├─ abstract readResource()
  ├─ abstract updateResource()
  ├─ abstract deleteResource()
  ├─ abstract search()
  ├─ abstract withTransaction()
  ├─ abstract generateId()
  │
  ├─ 具体方法（便利方法）:
  │  ├─ searchOne()              → 调用 search() + 取第一条
  │  ├─ searchResources()        → 调用 search() + 提取数组
  │  ├─ conditionalCreate()      → withTransaction + search + createResource
  │  ├─ conditionalUpdate()      → withTransaction + search + updateResource
  │  ├─ conditionalDelete()      → withTransaction + search + deleteResource
  │  └─ conditionalPatch()       → withTransaction + search + patchResource
  │
  └─ Repository                  (packages/server/src/fhir/repo.ts)
       ↑ extends FhirRepository<PoolClient>
       │
       ├─ 实现所有 abstract 方法
       ├─ 添加 PostgreSQL 特有逻辑
       ├─ 添加 Redis 缓存
       ├─ 添加 AccessPolicy 安全过滤
       └─ 添加事务管理（BEGIN/COMMIT/ROLLBACK/SAVEPOINT）
```

### 7.2 设计目的

| 目的 | 说明 |
|------|------|
| **解耦路由与存储** | `FhirRouter` 只依赖 `FhirRepository` 抽象，不知道底层是 PostgreSQL 还是内存 |
| **多实现支持** | `MemoryRepository`（测试用）和 `Repository`（生产用）共享相同接口 |
| **便利方法复用** | `conditionalCreate/Update/Delete` 等复杂逻辑在抽象类中实现一次，所有实现共享 |
| **类型安全** | 泛型 `TClient` 让事务回调能获得正确的客户端类型（`PoolClient`） |
| **测试友好** | 测试可以用 `MemoryRepository` 替代真实数据库，无需 PostgreSQL |

### 7.3 FhirRouter 与 Repository 的交互

```
FhirRouter                          FhirRepository (abstract)
┌──────────────────┐                ┌──────────────────────┐
│ URL 路由匹配      │                │ abstract CRUD 接口    │
│ POST :resourceType│──handler──→   │ createResource()     │
│ GET :resourceType │──handler──→   │ search()             │
│ PUT :resourceType/:id──handler──→ │ updateResource()     │
│ DELETE :resourceType/:id──────→   │ deleteResource()     │
│                   │                │                      │
│ 自定义操作注册     │                │ 便利方法:             │
│ router.add(...)   │                │ conditionalCreate()  │
│                   │                │ conditionalUpdate()  │
└──────────────────┘                └──────────┬───────────┘
                                               │ extends
                                    ┌──────────┴───────────┐
                                    │ Repository (server)   │
                                    │ PostgreSQL + Redis    │
                                    │ AccessPolicy          │
                                    │ Transaction mgmt      │
                                    └──────────────────────┘
```

---

## 第八部分：完整时序图

```
Client                Express           FhirRouter          Repository              PostgreSQL
  │                     │                   │                   │                       │
  │ POST /fhir/R4/Patient                   │                   │                       │
  │ Body: { resourceType: 'Patient', ... }  │                   │                       │
  │────────────────────→│                   │                   │                       │
  │                     │ authenticateRequest│                   │                       │
  │                     │ (创建 Repository)  │                   │                       │
  │                     │                   │                   │                       │
  │                     │ routeFhirRequest()│                   │                       │
  │                     │──────────────────→│                   │                       │
  │                     │                   │ find('POST','/Patient')                   │
  │                     │                   │ → createResource handler                  │
  │                     │                   │──────────────────→│                       │
  │                     │                   │                   │                       │
  │                     │                   │                   │ 1. rateLimiter.recordWrite()
  │                     │                   │                   │ 2. resourceCap.created()
  │                     │                   │                   │ 3. id = uuid.v4()
  │                     │                   │                   │ 4. checkResourcePermissions()
  │                     │                   │                   │ 5. preCommitValidation()
  │                     │                   │                   │ 6. rewriteAttachments()
  │                     │                   │                   │ 7. versionId = uuid.v4()
  │                     │                   │                   │ 8. getCompartments()
  │                     │                   │                   │    → evalFhirPath(CompartmentDef)
  │                     │                   │                   │ 9. validateResource()
  │                     │                   │                   │                       │
  │                     │                   │                   │ 10. BEGIN REPEATABLE READ
  │                     │                   │                   │──────────────────────→│
  │                     │                   │                   │                       │
  │                     │                   │                   │ 11. buildResourceRow()│
  │                     │                   │                   │   (搜索列同步填充)     │
  │                     │                   │                   │                       │
  │                     │                   │                   │ 12. INSERT "Patient"   │
  │                     │                   │                   │   ON CONFLICT DO UPDATE│
  │                     │                   │                   │──────────────────────→│
  │                     │                   │                   │                       │
  │                     │                   │                   │ 13. INSERT "Patient_History"
  │                     │                   │                   │──────────────────────→│
  │                     │                   │                   │                       │
  │                     │                   │                   │ 14. writeLookupTables()│
  │                     │                   │                   │   (Address, HumanName, │
  │                     │                   │                   │    Reference, ...)     │
  │                     │                   │                   │──────────────────────→│
  │                     │                   │                   │                       │
  │                     │                   │                   │ 15. processPreCommit() │
  │                     │                   │                   │ 16. COMMIT             │
  │                     │                   │                   │──────────────────────→│
  │                     │                   │                   │                       │
  │                     │                   │                   │ 17. processPostCommit()│
  │                     │                   │                   │   ├─ setCacheEntry()   │
  │                     │                   │                   │   │  → Redis SET       │
  │                     │                   │                   │   ├─ logEvent()        │
  │                     │                   │                   │   │  → AuditEvent      │
  │                     │                   │                   │   └─ addBackgroundJobs()
  │                     │                   │                   │      → Subscription    │
  │                     │                   │                   │                       │
  │                     │                   │←──────────────────│                       │
  │                     │                   │ [created, result]  │                       │
  │                     │←──────────────────│                   │                       │
  │                     │ sendFhirResponse() │                   │                       │
  │←────────────────────│                   │                   │                       │
  │ HTTP 201 Created    │                   │                   │                       │
  │ Body: Patient JSON  │                   │                   │                       │
```

---

## 第九部分：关键数据结构快照

### Patient 主表行（buildResourceRow 输出）

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "lastUpdated": "2026-02-23T05:53:00.000Z",
  "deleted": false,
  "projectId": "proj-abc-123",
  "content": "{\"resourceType\":\"Patient\",\"id\":\"550e8400-...\",\"meta\":{...},\"name\":[{\"family\":\"Smith\",\"given\":[\"John\"]}],\"birthDate\":\"1990-01-01\",\"gender\":\"male\",\"identifier\":[{\"system\":\"http://example.com\",\"value\":\"MRN123\"}]}",
  "__version": 13,
  "compartments": ["550e8400-e29b-41d4-a716-446655440000"],
  "birthdate": "1990-01-01",
  "active": null,
  "gender": "male",
  "__identifier": ["a1b2c3d4-...", "e5f6a7b8-..."],
  "__identifierText": ["MRN123"],
  "__identifierSort": "MRN123",
  "__nameSort": "Smith, John"
}
```

### Patient_History 行

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "versionId": "660e8400-e29b-41d4-a716-446655440001",
  "lastUpdated": "2026-02-23T05:53:00.000Z",
  "content": "{...same as above...}"
}
```
