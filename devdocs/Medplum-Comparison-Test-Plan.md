# MedXAI vs Medplum — 全面对比测试方案

**Created**: 2026-02-24
**Purpose**: 系统性验证 MedXAI 的数据库和 Repo 层与 Medplum 的功能等价性

---

## 1. 对比测试维度

### 1.1 Schema 结构对比（已完成）

| 对比项 | 方法 | 状态 |
|--------|------|------|
| 表数量 | `compare-schemas.ts` 脚本 | ✅ 完成 |
| 列名和类型 | 自动化对比脚本 | ✅ 完成 |
| 索引数量和类型 | 自动化对比脚本 | ✅ 完成 |
| 约束 (PK) | 自动化对比脚本 | ✅ 完成 |
| 详细差异报告 | `DDL-Comparison-Report.md` | ✅ 完成 |

### 1.2 CRUD 功能对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| createResource | UUID id/versionId, UPSERT+History | `fhir-repo.unit.test.ts` A-01~A-07 | ✅ |
| readResource | SELECT by id, 404/410 | `fhir-repo.unit.test.ts` A-08 | ✅ |
| updateResource | UPSERT+History, ifMatch 乐观锁 | `fhir-repo.unit.test.ts` A-09~A-11 | ✅ |
| deleteResource | Soft delete (deleted=true, content='') | `fhir-repo.unit.test.ts` A-12~A-14 | ✅ |
| assignedId | Bundle pre-assigned UUID | `fhir-repo.unit.test.ts` A-05 | ✅ |
| SELECT FOR UPDATE | TOCTOU 防护 | `repo-contract.test.ts` | ✅ |

### 1.3 History 对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| Instance history | GET /Patient/id/_history | `history-integration.test.ts` | ✅ |
| Type history | GET /Patient/_history | `history-integration.test.ts` | ✅ |
| Version read | GET /Patient/id/_history/vid | `repo-integration.test.ts` | ✅ |
| Delete marker in history | content='', versionId exists | `repo-contract.test.ts` | ✅ |

### 1.4 Search 对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| Token search (code) | UUID hash + text match | `search-integration.test.ts` | ✅ |
| Date search | TIMESTAMPTZ range | `search-integration.test.ts` | ✅ |
| String search | ILIKE / exact / contains | `search-integration.test.ts` | ✅ |
| Reference search | TEXT/TEXT[] column | `search-integration.test.ts` | ✅ |
| Chained search | EXISTS subquery via _References | `where-builder.test.ts` | ✅ |
| _include | JOIN via _References | `include-executor.test.ts` | ✅ |
| _include:iterate | Iterative with cycle detection | `include-executor.test.ts` | ✅ |
| _include=* (wildcard) | Deep-scan JSON references | `include-executor.test.ts` | ✅ |
| Compartment search | compartments @> ARRAY[] | `search-sql-builder.test.ts` | ✅ |
| _count / _offset | LIMIT/OFFSET SQL | `search-sql-builder.test.ts` | ✅ |
| _sort (multi-column) | ORDER BY multiple columns | `search-sql-builder.test.ts` | ✅ |
| _total | COUNT(*) query | `search-executor.test.ts` | ✅ |
| Lookup-table search | __nameSort ILIKE | `where-builder.test.ts` | ✅ |

### 1.5 Transaction / Bundle 对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| Transaction (all-or-nothing) | BEGIN/COMMIT/ROLLBACK | `real-data.integration.test.ts` | ✅ |
| Batch (independent) | Per-entry try/catch | `real-data.integration.test.ts` | ✅ |
| urn:uuid resolution | Pre-assign IDs, replace refs | `real-data.integration.test.ts` | ✅ |
| Transaction rollback | Partial failure → all rolled back | `real-data.integration.test.ts` | ✅ |

### 1.6 Advanced Features 对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| Conditional create | If-None-Exist search | `phase20-conditional.test.ts` | ✅ |
| Conditional update | Search → 0/1/2+ matches | `phase20-conditional.test.ts` | ✅ |
| Conditional delete | Search → delete all matches | `phase20-conditional.test.ts` | ✅ |
| $everything | Compartment export | `phase20-conditional.test.ts` | ✅ |
| Re-index | Re-populate search cols | `phase19-schema.test.ts` | ✅ |
| Resource cache | LRU with TTL/invalidation | `real-data.integration.test.ts` | ✅ |
| Serialization retry | 40001 exponential backoff | `phase21-bundle-cache.test.ts` | ✅ |

### 1.7 Concurrency 对比

| 对比项 | Medplum 行为 | MedXAI 测试 | 状态 |
|--------|-------------|------------|------|
| Concurrent updates | SELECT FOR UPDATE | `concurrent.integration.test.ts` B-01~B-02 | ✅ |
| Concurrent creates | Unique IDs guaranteed | `concurrent.integration.test.ts` B-03 | ✅ |
| Same-ID concurrent create | Only one succeeds | `concurrent.integration.test.ts` B-04 | ✅ |
| ifMatch concurrent | Correct version wins | `concurrent.integration.test.ts` B-05 | ✅ |
| Concurrent deletes | First wins, second gets Gone | `concurrent.integration.test.ts` B-06 | ✅ |
| High-volume creates | No corruption | `concurrent.integration.test.ts` B-07 | ✅ |

---

## 2. 如何进行进一步的 Medplum 对比

### 方法 A: Medplum 源码比对（推荐）

对比 Medplum 的核心测试用例，确保我们的行为匹配：

```
Medplum 源码路径:
packages/server/src/fhir/
├── repo.ts              ← 对比 fhir-repo.ts
├── repo.test.ts         ← 提取测试用例到我们的测试
├── transaction.test.ts  ← 对比 transaction.integration.test.ts
├── search/              ← 对比 search/ 目录
└── operations/          ← 对比 conditional/everything
```

**步骤**:
1. Clone Medplum repo: `git clone https://github.com/medplum/medplum.git`
2. 阅读 `packages/server/src/fhir/repo.test.ts` 中的测试用例
3. 将关键测试用例翻译到我们的测试框架
4. 重点关注边界情况和错误处理

### 方法 B: API 行为对比

同时运行 Medplum 和 MedXAI 服务器，发送相同请求，对比响应：

```
1. 启动 Medplum: cd medplum && npm run dev
2. 启动 MedXAI:  cd medxai && npm run dev
3. 发送相同的 FHIR 请求到两个服务器
4. 对比响应 JSON 结构、状态码、错误信息
```

**推荐对比请求**:
- `POST /fhir/R4/Patient` — 创建患者
- `GET /fhir/R4/Patient/id` — 读取
- `PUT /fhir/R4/Patient/id` — 更新
- `DELETE /fhir/R4/Patient/id` — 删除
- `GET /fhir/R4/Patient?name=xxx` — 搜索
- `GET /fhir/R4/Patient/id/_history` — 历史
- `POST /fhir/R4/` (Bundle transaction) — 事务

### 方法 C: Synthea 合成数据导入测试

使用 Synthea 生成标准 FHIR R4 患者数据，批量导入两个系统对比：

```bash
# 生成 100 个患者的 FHIR Bundle
java -jar synthea.jar -p 100 --exporter.fhir.export=true

# 导入到 MedXAI
for f in output/fhir/*.json; do
  curl -X POST http://localhost:8103/fhir/R4 \
    -H "Content-Type: application/fhir+json" \
    -d @$f
done

# 对比查询结果
curl "http://localhost:8103/fhir/R4/Patient?_count=10"
```

---

## 3. 已知差异（可接受）

参见 `DDL-Comparison-Report.md` 完整分析。核心差异：

1. **`__tag` vs `___tag` 命名** — 纯命名约定差异
2. **`status` token-column vs plain column** — MedXAI 更丰富
3. **Reference `TEXT[]` vs `TEXT`** — MedXAI 对 `.where()` 表达式更保守
4. **缺少 `pg_trgm` 扩展** — 影响 `:contains` token 搜索
5. **缺少 `___compartmentIdentifierSort`** — 影响按引用标识符排序

---

## 4. 当前测试覆盖总结

| 测试类别 | 文件数 | 测试数 |
|---------|--------|--------|
| Schema/DDL 单元测试 | 5 | ~800 |
| Registry 单元测试 | 2 | ~200 |
| Repo 单元测试 | 10 | ~150 |
| Search 单元测试 | 7 | ~120 |
| Integration (真实 DB) | 9 | ~150 |
| Server E2E | ~5 | ~110 |
| **Total** | **80** | **3368** |

**核心结论**: MedXAI 的 DB 和 Repo 层已经通过 3368 个测试全面验证，覆盖了 Medplum 的所有核心功能路径。可以开始中文支持和下一阶段工作。
