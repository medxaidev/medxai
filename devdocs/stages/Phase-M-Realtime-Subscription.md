# Phase M: 实时通信 — Subscription + WebSocket

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-28
completed_at: 2026-02-28
scope: Subscription resource management + WebSocket push notifications
risk_level: LOW-MEDIUM — Layer 2+3 (fhir-server + fhir-client), new subsystem
layer_impact: Layer 2 (fhir-server — Subscription engine + WS manager) + Layer 3 (fhir-client — ClientSubscriptionManager)
```

---

## 概述

Phase M 添加 FHIR Subscription 资源管理和实时 WebSocket 推送能力：

1. **Subscription 资源 CRUD** — 创建/读取/删除订阅（已有标准 FHIR CRUD 路径）
2. **SubscriptionManager** — 服务端在资源变更时评估订阅条件并触发通知
3. **WebSocketManager** — 管理 WS 连接、客户端绑定、通知路由
4. **ClientSubscriptionManager** — SDK 提供便捷订阅管理 API

## 子任务

| 子任务 | 内容                                            | 状态 |
| ------ | ----------------------------------------------- | ---- |
| M1     | 服务端 SubscriptionManager — 订阅评估引擎       | ✅   |
| M2     | WebSocketManager — WS 连接管理 + 通知路由       | ✅   |
| M3     | parseCriteria — 订阅条件解析器                  | ✅   |
| M4     | Client ClientSubscriptionManager — SDK 订阅 API | ✅   |
| M5     | E2E 测试 (21 tests)                             | ✅   |
| M6     | 回归测试                                        | ✅   |

## 实现细节

### 服务端架构

```
packages/fhir-server/src/subscriptions/
  subscription-manager.ts   — SubscriptionManager + parseCriteria
  ws-handler.ts             — WebSocketManager + notification Bundle builder
```

### SubscriptionManager

| 方法                                 | 说明                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| `loadActiveSubscriptions()`          | 从数据库加载所有 status=active 的 Subscription           |
| `addSubscription(sub)`               | 添加/更新活跃订阅                                        |
| `removeSubscription(id)`             | 移除订阅                                                 |
| `evaluateResource(resource, action)` | 评估资源变更是否匹配订阅条件，匹配则 emit "notification" |
| `getActiveCount()`                   | 获取活跃订阅数                                           |
| `clear()`                            | 清空所有订阅                                             |

### 评估逻辑

1. 检查 `resource.resourceType === subscription.criteria.resourceType`
2. 检查所有参数过滤条件（简单字符串匹配）
3. 匹配时 emit `SubscriptionNotification` 事件

### WebSocketManager

| 方法                   | 说明                                      |
| ---------------------- | ----------------------------------------- |
| `handleConnection(ws)` | 处理新 WS 连接，发送 connection-available |
| `getClientCount()`     | 获取连接客户端数                          |
| `getClient(id)`        | 获取指定客户端                            |
| `disconnectAll()`      | 断开所有连接                              |

### WebSocket 协议

1. 客户端连接 → 服务端发送 `{ type: "connection-available", connectionId }`
2. 客户端发送 `{ type: "bind", subscriptionId }` → 服务端回复 `{ type: "bound", subscriptionId }`
3. 客户端发送 `{ type: "unbind", subscriptionId }` → 服务端回复 `{ type: "unbound", subscriptionId }`
4. 资源匹配时，服务端向绑定客户端推送 notification Bundle

### 通知 Bundle 格式

```json
{
  "resourceType": "Bundle",
  "type": "history",
  "timestamp": "...",
  "entry": [
    { "resource": { "resourceType": "Parameters", "parameter": [...] } },
    { "fullUrl": "Patient/p-1", "resource": { ... } }
  ]
}
```

### Client SDK — ClientSubscriptionManager

```typescript
const mgr = new ClientSubscriptionManager({
  criteria: "Observation?patient=Patient/123",
});
mgr.on("notification", (event) => {
  console.log("Resources:", event.resources);
});
await mgr.connect(
  client.createResource.bind(client),
  "ws://server/ws/subscriptions",
);
mgr.disconnect();
```

| 方法/属性                  | 说明                                                  |
| -------------------------- | ----------------------------------------------------- |
| `on(event, handler)`       | 监听 connect/disconnect/notification/error/bound 事件 |
| `off(event, handler)`      | 移除事件监听                                          |
| `connect(createFn, wsUrl)` | 创建 Subscription 资源 + 建立 WS 连接 + 绑定          |
| `disconnect()`             | 断开 WS + 清理状态                                    |
| `connected`                | 是否已连接                                            |
| `getSubscriptionId()`      | 获取 Subscription 资源 ID                             |

## 新增/修改文件

| 文件                                                    | 变更类型 | 说明                                           |
| ------------------------------------------------------- | -------- | ---------------------------------------------- |
| `fhir-server/src/subscriptions/subscription-manager.ts` | 新增     | SubscriptionManager + parseCriteria            |
| `fhir-server/src/subscriptions/ws-handler.ts`           | 新增     | WebSocketManager + notification Bundle builder |
| `fhir-client/src/subscription-manager.ts`               | 新增     | ClientSubscriptionManager                      |
| `fhir-client/src/index.ts`                              | 修改     | 导出 ClientSubscriptionManager + types         |
| `fhir-server/src/__tests__/subscriptions.test.ts`       | 新增     | 21 tests                                       |

## 测试结果

| 测试集           | 通过数         | 说明                  |
| ---------------- | -------------- | --------------------- |
| Phase M 新增测试 | 21/21          | subscriptions.test.ts |
| 全部 server 测试 | 138/138        | 7 test files          |
| 全部 client 测试 | 56/56          | 2 test files          |
| **tsc --noEmit** | clean          | 两个包均 clean        |
| **回归**         | **0 failures** | **0 regressions**     |
