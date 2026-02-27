# Phase I: 平台管理端点

```yaml
document_type: stage_record
version: v1.0
status: COMPLETED
started_at: 2026-02-27
completed_at: 2026-02-27
scope: Admin API routes for Project, User, ClientApplication management
risk_level: LOW — uses existing FHIR CRUD on platform resources + auth middleware
layer_impact: Layer 2 only (fhir-server) — new routes with auth guards
```

---

## 概述

Phase I 添加平台管理端点，提供 Project 创建、用户邀请、Client 注册等管理功能。
底层使用标准 FHIR CRUD 操作平台资源，路由层添加 superAdmin / project-admin 权限检查。

## 子任务

| 子任务 | 内容                                                                  | 状态 |
| ------ | --------------------------------------------------------------------- | ---- |
| I1     | `POST /admin/projects` — 创建 Project (superAdmin)                    | ✅   |
| I2     | `GET /admin/projects/:id` — 获取 Project 详情                         | ✅   |
| I3     | `POST /admin/projects/:id/invite` — 邀请用户 (创建 ProjectMembership) | ✅   |
| I4     | `POST /admin/clients` — 注册 ClientApplication (superAdmin)           | ✅   |
| I5     | `GET /admin/projects/:id/members` — 列出项目成员                      | ✅   |
| I6     | `GET /admin/clients/:id` — 获取 Client 详情 (secret 脱敏)             | ✅   |
| I7     | Tests + auth guards                                                   | ✅   |

## 实现细节

### 路由概览

| 方法 | 路径                          | 权限                    | 说明                                |
| ---- | ----------------------------- | ----------------------- | ----------------------------------- |
| POST | `/admin/projects`             | superAdmin              | 创建 Project                        |
| GET  | `/admin/projects/:id`         | superAdmin 或同项目成员 | 读取 Project                        |
| POST | `/admin/projects/:id/invite`  | superAdmin 或项目管理员 | 邀请用户加入项目                    |
| GET  | `/admin/projects/:id/members` | superAdmin 或同项目成员 | 列出项目 ProjectMembership          |
| POST | `/admin/clients`              | superAdmin              | 注册 ClientApplication，返回 secret |
| GET  | `/admin/clients/:id`          | superAdmin              | 读取 Client (secret 已脱敏)         |

### 权限模型

- **superAdmin**: 通过 `Project.superAdmin === true` 判定，可访问所有管理端点
- **项目成员**: `context.project === targetProjectId` 时可访问本项目的 GET 端点
- **未认证**: 所有 `/admin/*` 路由均使用 `requireAuth` preHandler，返回 401

### Client 安全

- `POST /admin/clients` 在创建时生成 secret 并在响应中返回（唯一一次可见）
- `GET /admin/clients/:id` 返回时删除 `secret` 字段
- Secret 使用 `generateSecret(32)` 生成 (来自 auth/keys.js)

### systemRepo 装饰

- `app.ts` 新增 `app.decorate("systemRepo", systemRepo ?? repo)`
- Admin 路由使用 systemRepo 进行跨项目操作（不受 OperationContext 限制）

## 新增/修改文件

| 文件                                             | 变更类型 | 说明                               |
| ------------------------------------------------ | -------- | ---------------------------------- |
| `fhir-server/src/routes/admin-routes.ts`         | 新增     | 6 个管理端点 + 权限检查            |
| `fhir-server/src/app.ts`                         | 修改     | 导入 adminRoutes + systemRepo 装饰 |
| `fhir-server/src/__tests__/admin-routes.test.ts` | 新增     | 15 tests                           |

## 测试结果

| 测试集                     | 通过数         | 说明                    |
| -------------------------- | -------------- | ----------------------- |
| Phase I 新增测试           | 15/15          | admin-routes.test.ts    |
| Phase H 测试               | 20/20          | fhir-operations.test.ts |
| 已有 CRUD/Outcome/Response | 85/85          | 4 test files            |
| **tsc --noEmit**           | clean          | fhir-server             |
| **回归**                   | **0 failures** | **0 regressions**       |
