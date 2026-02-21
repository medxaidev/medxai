# Workflow Analysis: Repository Architecture & Write Path

```yaml
workflow_id: WF-REPO-001
workflow_name: Repository Architecture & Write Path (Create/Update/Delete)
entry_point: "Repository.createResource() / updateResource() / deleteResource()"
exit_point: "资源持久化到 PostgreSQL + Redis 缓存 + History 记录 + Lookup 表更新"
phase: Phase-Server (Runtime CRUD)
source_file: packages/server/src/fhir/repo.ts
related_workflows:
  - WF-MIG-002 (Resource Table Schema — 验证 Schema 设计)
  - WF-MIG-003 (Search Parameter Mapping — 验证列映射)
  - WF-MIG-004 (Lookup Table Strategy — 验证 Lookup 写入)
  - WF-REPO-002 (Search Column Value Extraction)
  - WF-REPO-003 (Compartment & Access Control)
  - WF-REPO-004 (Read & Search Path)
analysis_status: Complete
author: fangjun
last_update: 2026-02-21
```

---

## 1. Repository 类概览

```ts
// packages/server/src/fhir/repo.ts:265
export class Repository extends FhirRepository<PoolClient> implements Disposable {
  private readonly context: RepositoryContext;  // 请求上下文（author, projects, accessPolicy）
  private conn?: PoolClient;                    // 数据库连接（事务中复用）
  private transactionDepth = 0;                 // 嵌套事务深度
  private preCommitCallbacks: (() => Promise<void>)[] = [];
  private postCommitCallbacks: (() => Promise<void>)[] = [];
  static readonly VERSION: number = 13;         // Schema 版本号（用于 __version 列）
  mode: RepositoryMode;                         // WRITER / READER
}
```

**核心设计**：
- **每请求一个实例**：每个 HTTP 请求创建一个 Repository，绑定当前用户的上下文
- **继承 FhirRepository**：来自 `@medplum/fhir-router`，定义 FHIR CRUD 接口
- **Disposable**：实现 `Symbol.dispose`，自动释放数据库连接

---

## 2. 创建资源 (createResource)

### 完整调用链

```
createResource(resource, options?)
  │
  ├─ rateLimiter?.recordWrite()           // 速率限制
  ├─ resourceCap?.created()               // 资源配额检查
  │
  ├─ [if assignedId] 检查 ID 是否已存在
  │
  ├─ resource.id = options.assignedId ?? generateId()   // UUID v4
  │
  └─ updateResourceImpl(resourceWithId, create=true)
       │
       ├─ checkResourcePermissions(resource, CREATE)
       │    ├─ 验证 id 存在且为 UUID
       │    ├─ 添加默认 profile（从 Project 配置）
       │    └─ 检查 AccessPolicy 是否支持 CREATE
       │
       ├─ preCommitValidation(this, resource, 'update')
       │    → Bot/Subscription 等资源的预提交钩子
       │
       ├─ [create=false 时] checkExistingResource()
       │    → 读取现有资源，检查乐观锁
       │
       ├─ rewriteAttachments(REFERENCE, this, resource)
       │    → 将内联 attachment 转为引用
       │
       ├─ replaceConditionalReferences(this, resource)
       │    → 解析条件引用
       │
       ├─ 构建 resultMeta:
       │    ├─ versionId = generateId()          // 新版本 UUID
       │    ├─ lastUpdated = now() 或保留原值
       │    ├─ author = context.author 或保留原值
       │    ├─ project = getProjectId()           → WF-REPO-003
       │    ├─ accounts = getAccounts()
       │    └─ compartment = getCompartments()    → WF-REPO-003
       │
       ├─ validateResource(result)
       │    ├─ [strictMode] validateResourceStrictly()
       │    │    ├─ validateResource() (core)
       │    │    ├─ validateProfiles()
       │    │    └─ validateTerminology()
       │    └─ [非strictMode] validateResourceWithJsonSchema()
       │
       ├─ isNotModified(existing, result)?
       │    → 如果内容未变，直接返回（跳过写入）
       │
       ├─ isResourceWriteable(existing, result, interaction)?
       │    → 检查 writeConstraint（FHIRPath 表达式）
       │
       ├─ ★ handleStorage(result, create)         // 核心持久化
       │    │
       │    ├─ [非 cacheOnly] writeToDatabase(resource, create)
       │    │    └─ ensureInTransaction(async (client) => {
       │    │         ├─ writeResource(client, resource)        // 主表
       │    │         ├─ writeResourceVersion(client, resource) // History 表
       │    │         └─ writeLookupTables(client, resource)    // Lookup 表
       │    │       })
       │    │
       │    └─ setCacheEntry(resource)  // Redis 缓存
       │         → SET {ResourceType}/{id} JSON EX 86400
       │
       ├─ postCommit: handleBinaryUpdate()
       └─ postCommit: addBackgroundJobs()
            → Subscription 触发、Bot 执行等
```

---

## 3. 写入数据库详解 (writeToDatabase)

### 3.1 事务边界

```ts
// repo.ts:1118-1124
private async writeToDatabase(resource, create): Promise<void> {
  await this.ensureInTransaction(async (client) => {
    await this.writeResource(client, resource);        // 1. 主表 UPSERT
    await this.writeResourceVersion(client, resource); // 2. History 表 INSERT
    await this.writeLookupTables(client, resource);    // 3. Lookup 表更新
  });
}
```

**关键**：这3个操作在**同一个事务**中执行。

### 3.2 写入主表 (writeResource)

```ts
// repo.ts:1683-1685
private async writeResource(client, resource): Promise<void> {
  await new InsertQuery(resource.resourceType, [this.buildResourceRow(resource)])
    .mergeOnConflict()  // INSERT ... ON CONFLICT (id) DO UPDATE SET ...
    .execute(client);
}
```

**`buildResourceRow(resource)`** 构建完整的行数据：

```ts
// repo.ts:1636-1674
{
  id: resource.id,
  lastUpdated: meta.lastUpdated,
  deleted: false,
  projectId: meta.project ?? systemResourceProjectId,
  content: stringify(resource),    // 完整 JSON
  __version: Repository.VERSION,   // 当前 schema 版本 = 13

  // 以下由 buildColumn() 为每个 SearchParameter 生成
  // → 详见 WF-REPO-002
  compartments: [...],             // UUID[]
  birthdate: '1990-01-01',         // COLUMN 策略
  __code: [uuid1, uuid2, ...],     // TOKEN-COLUMN 策略
  __codeText: ['display1', ...],
  __codeSort: 'first_value',
  __nameSort: 'Smith, John',       // LOOKUP-TABLE 排序列
  // ...
}
```

**UPSERT 策略**：`INSERT ... ON CONFLICT (id) DO UPDATE SET ...`
- 创建时：INSERT 新行
- 更新时：ON CONFLICT 触发 UPDATE（覆盖所有列）

### 3.3 写入 History 表 (writeResourceVersion)

```ts
// repo.ts:1705-1718
private async writeResourceVersion(client, resource): Promise<void> {
  await new InsertQuery(resourceType + '_History', [{
    id: resource.id,
    versionId: meta.versionId,
    lastUpdated: meta.lastUpdated,
    content: stringify(resource),   // 该版本的完整 JSON
  }]).execute(client);
}
```

**注意**：History 表只 INSERT，不 UPDATE。每次写入都是新行。

### 3.4 写入 Lookup 表 (writeLookupTables)

```ts
// repo.ts:1915-1919
private async writeLookupTables(client, resource, create): Promise<void> {
  for (const lookupTable of lookupTables) {
    await lookupTable.indexResource(client, resource, create);
  }
}
```

**5 个 Lookup 表**依次处理：
1. `AddressTable.indexResource()` — 提取地址字段
2. `HumanNameTable.indexResource()` — 提取姓名字段
3. `ReferenceTable.indexResource()` — 提取引用关系 → `{ResourceType}_References` 表
4. `CodingTable.indexResource()` — 提取编码
5. `ConceptMappingTable.indexResource()` — 提取概念映射

**更新时的策略**：先删除旧行（`DELETE WHERE resourceId = ?`），再插入新行。

---

## 4. 更新资源 (updateResource)

```
updateResource(resource, options?)
  │
  ├─ rateLimiter?.recordWrite()
  │
  ├─ [if options.ifMatch]
  │    → withTransaction(() => updateResourceImpl(resource, false, options))
  │    （条件更新需要事务保证一致性）
  │
  └─ [else]
       → updateResourceImpl(resource, false)
```

**与 createResource 的区别**：
1. `create = false` → 会调用 `checkExistingResource()` 读取现有资源
2. 乐观锁检查：`if (options.ifMatch && existing.meta.versionId !== options.ifMatch)` → 412 Precondition Failed
3. `isNotModified()` 检查：如果内容未变，跳过写入直接返回
4. 现有资源的 compartment 会用最新规则重新计算

---

## 5. 删除资源 (deleteResource)

```
deleteResource(resourceType, id)
  │
  ├─ rateLimiter?.recordWrite()
  ├─ readResourceImpl() → 读取现有资源
  │    [如果已 gone] → 直接返回（幂等）
  │
  ├─ canPerformInteraction(DELETE, resource)?
  ├─ preCommitValidation(this, resource, 'delete')
  ├─ deleteCacheEntry(resourceType, id)  // 清除 Redis
  │
  └─ [非 cacheOnly] ensureInTransaction(async (conn) => {
       │
       ├─ 1. UPSERT 主表（软删除）:
       │    INSERT INTO {ResourceType} (id, lastUpdated, deleted, projectId, content, __version, compartments, ...搜索列)
       │    VALUES (id, now(), true, projectId, '', -1, [...], null, null, ...)
       │    ON CONFLICT (id) DO UPDATE SET ...
       │    
       │    关键：
       │    - deleted = true
       │    - content = ''（空字符串，不是 JSON）
       │    - __version = -1（标记为已删除）
       │    - 所有搜索列设为 null（通过 buildColumn 对空资源求值）
       │
       ├─ 2. INSERT History 表:
       │    { id, versionId: newUUID, lastUpdated: now(), content: '' }
       │
       ├─ 3. deleteFromLookupTables(conn, resource)
       │    → 每个 LookupTable.deleteValuesForResource()
       │    → DELETE FROM {LookupTable} WHERE resourceId = ?
       │
       └─ postCommit: logEvent + addSubscriptionJobs
     })
```

**关键设计决策**：
- **软删除**：`deleted = true`，主表行保留
- **History 保留**：删除版本也写入 History（content 为空）
- **Lookup 表清理**：删除时**清除** Lookup 表的行
- **搜索列清空**：所有搜索列设为 null，确保删除后的资源不会出现在搜索结果中

---

## 6. 物理删除 (expungeResource / purgeResources)

```ts
// expungeResources — 按 ID 永久删除
await this.withTransaction(async (client) => {
  for (const id of ids) {
    await this.deleteFromLookupTables(client, { resourceType, id });
  }
  await new DeleteQuery(resourceType).where('id', 'IN', ids).execute(db);
  await new DeleteQuery(resourceType + '_History').where('id', 'IN', ids).execute(db);
});

// purgeResources — 按时间永久删除
for (const lookupTable of lookupTables) {
  await lookupTable.purgeValuesBefore(client, resourceType, before);
}
await new DeleteQuery(resourceType).where('lastUpdated', '<=', before).execute(client);
await new DeleteQuery(resourceType + '_History').where('lastUpdated', '<=', before).execute(client);
```

**注意**：物理删除只有 superAdmin 和 projectAdmin 可以执行。

---

## 7. 事务管理

### 7.1 事务隔离级别

```ts
// 默认：REPEATABLE READ
// 可选：SERIALIZABLE（通过 options.serializable）
await conn.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
```

### 7.2 嵌套事务（SAVEPOINT）

```ts
// transactionDepth = 1 → BEGIN
// transactionDepth > 1 → SAVEPOINT sp{depth}
// commit: transactionDepth = 1 → COMMIT, > 1 → RELEASE SAVEPOINT
// rollback: transactionDepth = 1 → ROLLBACK, > 1 → ROLLBACK TO SAVEPOINT
```

### 7.3 重试机制

```ts
// 默认重试次数：2
// 可重试错误：SerializationFailure (40001)
// 退避策略：指数退避 + 随机抖动
// delayMs = baseDelay * 2^attempt * [0.75, 1.25]
// 默认 baseDelay = 50ms
// 嵌套事务中不重试（必须回滚整个事务）
```

### 7.4 Pre-commit / Post-commit 回调

```
事务生命周期：
  BEGIN
    ├─ writeResource()
    ├─ writeResourceVersion()
    ├─ writeLookupTables()
    ├─ processPreCommit()          // 引用验证等
  COMMIT
    └─ processPostCommit()         // AuditEvent、Subscription、缓存写入
```

**关键**：
- **preCommit** 回调在 COMMIT 前执行，失败会回滚事务
- **postCommit** 回调在 COMMIT 后执行，失败只记录日志不回滚
- 缓存写入（`setCacheEntry`）在事务中时会延迟到 postCommit

---

## 8. Redis 缓存策略

| 操作 | 缓存行为 |
|------|----------|
| 创建/更新 | `SET {ResourceType}/{id} JSON EX 86400`（24小时） |
| 删除 | `DEL {ResourceType}/{id}` |
| 读取命中 | 直接返回缓存（跳过 DB） |
| 读取未命中 | 查询 DB 后写入缓存 |
| AuditEvent | **不写入缓存**（高频写入但低频读取） |
| 事务中 | **不读取缓存**（避免脏读） |
| 事务中写入 | 延迟到 postCommit 执行 |

**缓存 key**：`{ResourceType}/{id}`（如 `Patient/550e8400-...`）
**缓存 value**：`{ resource: {...}, projectId: "..." }`

---

## 9. 特殊资源处理

| 资源类型 | 特殊行为 |
|----------|----------|
| **Binary** | 无 compartments 列；base64 数据写入 BinaryStorage |
| **AuditEvent** | 不写入 Redis 缓存 |
| **Login** (client/execute) | Cache-only，不写入数据库 |
| **Subscription** (websocket) | Cache-only + Redis Set 追踪 |
| **StructureDefinition** | 更新时清除 profile 缓存 |
| **Project** | projectId = resource.id |
| **ProjectMembership** | projectId = resource.project |
| **User** (superAdmin) | 可跨项目设置 projectId |

---

## 10. VERSION 版本号机制

```ts
static readonly VERSION: number = 13;
```

**用途**：`__version` 列记录资源写入时的 schema 版本。当 schema 变更（新增搜索列、修改索引策略）时，VERSION 递增。`reindexResource` 可以重新计算搜索列值。

**版本历史**（摘要）：
- v1: 添加 `__version` 列
- v3: 添加 `__tokens` 列（token-column 策略）
- v6: 每个 token 参数独立列
- v10: HumanName 排序列
- v13: 新增搜索参数

---

## 11. medxai 决策点

| 问题 | Medplum 方案 | medxai 建议 |
|------|-------------|------------|
| UPSERT 策略？ | `INSERT ON CONFLICT DO UPDATE` | 高效，建议保留 |
| 事务范围？ | 主表+History+Lookup 在同一事务 | 必须保持原子性 |
| 事务隔离级别？ | REPEATABLE READ（默认） | 适合大多数场景 |
| 重试机制？ | 指数退避 + 序列化失败重试 | 生产环境必须有 |
| 缓存策略？ | Redis，24小时TTL | 可调整 TTL |
| 软删除？ | deleted=true + content='' | 建议保留，FHIR 规范要求 |
| History 表？ | 每次写入都记录 | 存储成本高但审计必需 |
| VERSION 机制？ | 静态版本号 + reindex | 好的 schema 演进策略 |
