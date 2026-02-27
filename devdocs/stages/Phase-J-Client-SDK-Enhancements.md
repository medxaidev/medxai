# Phase J: Client SDK 完善

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-27
completed_at: 2026-02-27
scope: Auto-Batch, Binary/Attachment, PKCE Login
risk_level: ZERO — Layer 3 only (fhir-client), no backend changes
layer_impact: Layer 3 only (fhir-client)
```

---

## 概述

Phase J 为 Client SDK 添加三项增强功能：
1. **Auto-Batch** — 将多个独立 CRUD 操作自动合并为单个 Batch Bundle 发送
2. **Binary/Attachment** — 上传/下载二进制附件，支持原始字节和 Base64
3. **PKCE Login** — 适用于 SPA/移动端的安全 OAuth2 授权码流程

## 子任务

| 子任务 | 内容 | 状态 |
|--------|------|------|
| J1 | Auto-Batch：`setAutoBatch()`, `flushBatch()`, `pushToBatch()` | ✅ |
| J2 | Binary/Attachment：`uploadBinary()`, `downloadBinary()`, `createBinary()` | ✅ |
| J3 | PKCE Login：`generatePkceChallenge()`, `buildPkceAuthorizationUrl()`, `exchangeCodeWithPkce()` | ✅ |
| J4 | Unit tests + regression | ✅ |

## 实现细节

### J1: Auto-Batch

| 方法 | 说明 |
|------|------|
| `setAutoBatch(enabled, delay?)` | 启用/禁用自动批处理，默认 50ms 延迟 |
| `flushBatch()` | 手动刷新队列，将所有排队操作合并为 Batch Bundle |
| `pushToBatch(method, url, resource?)` | 将请求加入队列，返回 Promise |
| `isAutoBatchEnabled()` | 检查是否启用 |

**工作原理**：调用 `pushToBatch` 将操作加入内部队列，到达延迟时间后自动调用 `flushBatch`，
将所有排队操作打包为一个 `Bundle { type: "batch" }` 通过 `executeBatch` 发送，
然后按顺序将每个响应 entry 分发给对应的 Promise。

### J2: Binary/Attachment

| 方法 | 说明 |
|------|------|
| `uploadBinary(data, contentType, securityContext?)` | 上传原始二进制数据 (POST /Binary) |
| `downloadBinary(id)` | 下载二进制数据返回 Blob |
| `createBinary(contentType, data)` | 通过 FHIR CRUD 创建 Base64 编码的 Binary 资源 |

### J3: PKCE Login

| 方法 | 说明 |
|------|------|
| `MedXAIClient.generatePkceChallenge()` | 静态方法，生成 code_verifier 和 code_challenge (S256) |
| `buildPkceAuthorizationUrl(options)` | 构建授权 URL (含 code_challenge, state 等参数) |
| `exchangeCodeWithPkce(code, verifier, redirectUri?)` | 用 PKCE verifier 交换 token |

**安全设计**：
- `code_verifier` 使用 `crypto.getRandomValues(32)` 生成
- `code_challenge` 使用 `SHA-256(code_verifier)` 的 Base64URL 编码
- Base64URL 编码不含 `+`, `/`, `=` 字符

## 新增/修改文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `fhir-client/src/client.ts` | 修改 | 新增 J1/J2/J3 方法 + base64UrlEncode 辅助函数 |
| `fhir-client/src/types.ts` | 修改 | 新增 BatchQueueEntry 类型 |
| `fhir-client/src/index.ts` | 修改 | 导出 BatchQueueEntry |
| `fhir-client/src/__tests__/client-phase-j.test.ts` | 新增 | 18 tests |

## 测试结果

| 测试集 | 通过数 | 说明 |
|--------|--------|------|
| Phase J 新增测试 | 18/18 | client-phase-j.test.ts |
| 已有 client 测试 | 38/38 | client-unit.test.ts |
| 合计 | 56/56 | |
| **tsc --noEmit** | clean | fhir-client |
| **回归** | **0 failures** | **0 regressions** |
