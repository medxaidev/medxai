# WF-CUS-007: Medplum Server 路由全表

## 1. 概述

Medplum Server 基于 Express.js 构建，路由分为 **16 个模块**，涵盖 FHIR REST API、OAuth2 认证、项目管理、实时通信等全部功能。

**入口文件**: `packages/server/src/app.ts`

**路由挂载层级**:
```
app.use('/api/', apiRouter)   // API 前缀
app.use('/', apiRouter)       // 根路径 (兼容)

apiRouter 内部挂载:
  /.well-known/   -> wellKnownRouter
  /admin/         -> adminRouter
  /auth/          -> authRouter
  /cds-services/  -> cdsRouter
  /dicom/PS3/     -> dicomRouter
  /email/v1/      -> emailRouter
  /fhir/R4/       -> fhirRouter         (核心 FHIR API)
  /fhircast/STU2/ -> fhircastSTU2Router
  /fhircast/STU3/ -> fhircastSTU3Router
  /keyvalue/v1/   -> keyValueRouter
  /oauth2/        -> oauthRouter
  /scim/v2/       -> scimRouter
  /storage/       -> storageRouter
  /webhook/       -> webhookRouter
  /mcp            -> mcpRouter          (条件启用)

特殊挂载 (在 apiRouter 之前):
  /fhir/R4/Binary -> binaryRouter       (独立于 body-parser)
  POST /fhir/R4   -> asyncBatchHandler  (Prefer: respond-async)
```

**全局中间件链**:
```
standardHeaders -> cors -> compression -> attachRequestContext -> [logRequests] -> rateLimitHandler
```

**认证标记**: Auth = 是否需要认证, Admin = 是否需要管理员权限

---

## 2. FHIR REST 标准操作 (FhirRouter)

**路径前缀**: `/fhir/R4`
**源文件**: `packages/fhir-router/src/fhirrouter.ts`
**Auth**: 全部需要认证 (protectedRoutes)

FhirRouter 自动注册以下标准 FHIR REST 路由:

| HTTP | 端点 | 核心函数 | 交互类型 | 说明 |
|------|------|---------|---------|------|
| GET | `/` | `searchMultipleTypes` | search-system | 跨类型搜索 (`_type` 参数) |
| POST | `/` | `batch` / `processBatch` | batch | Batch/Transaction 处理 |
| GET | `/:resourceType` | `search` | search-type | 资源类型搜索 |
| POST | `/:resourceType/_search` | `searchByPost` | search-type | POST 方式搜索 |
| POST | `/:resourceType` | `createResource` | create | 创建资源 (支持 `If-None-Exist` 条件创建) |
| GET | `/:resourceType/:id` | `readResourceById` | read | 读取资源 |
| GET | `/:resourceType/:id/_history` | `readHistory` | history-instance | 资源版本历史 |
| GET | `/:resourceType/:id/_history/:vid` | `readVersion` | vread | 读取特定版本 |
| PUT | `/:resourceType/:id` | `updateResource` | update | 更新资源 (支持 `If-Match`) |
| PUT | `/:resourceType` | `conditionalUpdate` | update | 条件更新 |
| DELETE | `/:resourceType/:id` | `deleteResource` | delete | 删除资源 |
| DELETE | `/:resourceType` | `conditionalDelete` | delete | 条件删除 |
| PATCH | `/:resourceType/:id` | `patchResource` | patch | JSON Patch 更新 |
| PATCH | `/:resourceType` | `conditionalPatch` | patch | 条件 Patch |
| POST | `/$graphql` | `graphqlHandler` | operation | FHIR GraphQL |

---

## 3. FHIR 公开路由 (无需认证)

**路径前缀**: `/fhir/R4`
**源文件**: `packages/server/src/fhir/routes.ts`
**Auth**: 无

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/metadata` | `getCapabilityStatement` | CapabilityStatement (服务能力声明) |
| GET | `/$versions` | (内联) | 支持的 FHIR 版本 (`4.0`) |
| GET | `/.well-known/smart-configuration` | `smartConfigurationHandler` | SMART-on-FHIR 配置 |
| GET | `/.well-known/smart-styles.json` | `smartStylingHandler` | SMART 样式配置 |

---

## 4. FHIR $operations (自定义操作)

**路径前缀**: `/fhir/R4`
**源文件**: `packages/server/src/fhir/routes.ts` (Express 直接路由 + FhirRouter 注册)
**Auth**: 全部需要认证

### 4.1 Express 直接路由

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET/POST | `/:resourceType/$csv` | `csvHandler` | `operations/csv.ts` | CSV 导出 |
| POST | `/$ai` | `aiOperationHandler` | `operations/ai.ts` | AI 操作 (支持流式响应) |
| POST | `/Agent/$push` | `agentPushHandler` | `operations/agentpush.ts` | Agent 推送 (HL7/DICOM 输出) |
| POST | `/Agent/:id/$push` | `agentPushHandler` | `operations/agentpush.ts` | Agent 推送 (指定 ID) |
| GET/POST | `/Bot/$execute` | `executeHandler` | `operations/execute.ts` | Bot 执行 |
| GET/POST | `/Bot/:id/$execute` | `executeHandler` | `operations/execute.ts` | Bot 执行 (指定 ID) |

### 4.2 FhirRouter 注册操作

#### 项目/系统级操作

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET/POST | `/$export` | `bulkExportHandler` | `operations/export.ts` | 系统级批量导出 |
| POST | `/Project/:id/$clone` | `projectCloneHandler` | `operations/projectclone.ts` | 项目克隆 |
| POST | `/Project/$init` | `projectInitHandler` | `operations/projectinit.ts` | 项目初始化 |
| POST | `/User/:id/$update-email` | `updateUserEmailOperation` | `operations/update-user-email.ts` | 更新用户邮箱 |

#### 术语服务 (Terminology)

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET/POST | `/ValueSet/$expand` | `expandOperator` | `operations/expand.ts` | ValueSet 展开 |
| GET/POST | `/ValueSet/$validate-code` | `valueSetValidateOperation` | `operations/valuesetvalidatecode.ts` | ValueSet 验证码 |
| GET/POST | `/ValueSet/:id/$validate-code` | `valueSetValidateOperation` | 同上 | ValueSet 验证码 (实例) |
| GET/POST | `/CodeSystem/$lookup` | `codeSystemLookupHandler` | `operations/codesystemlookup.ts` | CodeSystem 查找 |
| GET/POST | `/CodeSystem/:id/$lookup` | `codeSystemLookupHandler` | 同上 | CodeSystem 查找 (实例) |
| GET/POST | `/CodeSystem/$validate-code` | `codeSystemValidateCodeHandler` | `operations/codesystemvalidatecode.ts` | CodeSystem 验证码 |
| GET/POST | `/CodeSystem/:id/$validate-code` | `codeSystemValidateCodeHandler` | 同上 | CodeSystem 验证码 (实例) |
| GET/POST | `/CodeSystem/$subsumes` | `codeSystemSubsumesOperation` | `operations/subsumes.ts` | CodeSystem 蕴含关系 |
| GET/POST | `/CodeSystem/:id/$subsumes` | `codeSystemSubsumesOperation` | 同上 | CodeSystem 蕴含关系 (实例) |
| POST | `/CodeSystem/$import` | `codeSystemImportHandler` | `operations/codesystemimport.ts` | CodeSystem 导入 |
| POST | `/CodeSystem/:id/$import` | `codeSystemImportHandler` | 同上 | CodeSystem 导入 (实例) |
| GET/POST | `/ConceptMap/$translate` | `conceptMapTranslateHandler` | `operations/conceptmaptranslate.ts` | ConceptMap 翻译 |
| GET/POST | `/ConceptMap/:id/$translate` | `conceptMapTranslateHandler` | 同上 | ConceptMap 翻译 (实例) |
| POST | `/ConceptMap/$import` | `conceptMapImportHandler` | `operations/conceptmapimport.ts` | ConceptMap 导入 |
| POST | `/ConceptMap/:id/$import` | `conceptMapImportHandler` | 同上 | ConceptMap 导入 (实例) |

#### Agent 操作

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET | `/Agent/$status` | `agentStatusHandler` | `operations/agentstatus.ts` | Agent 状态 |
| GET | `/Agent/:id/$status` | `agentStatusHandler` | 同上 | Agent 状态 (实例) |
| GET | `/Agent/$bulk-status` | `agentBulkStatusHandler` | `operations/agentbulkstatus.ts` | Agent 批量状态 |
| GET | `/Agent/$reload-config` | `agentReloadConfigHandler` | `operations/agentreloadconfig.ts` | Agent 重载配置 |
| GET | `/Agent/:id/$reload-config` | `agentReloadConfigHandler` | 同上 | Agent 重载配置 (实例) |
| GET | `/Agent/$upgrade` | `agentUpgradeHandler` | `operations/agentupgrade.ts` | Agent 升级 |
| GET | `/Agent/:id/$upgrade` | `agentUpgradeHandler` | 同上 | Agent 升级 (实例) |
| GET | `/Agent/$fetch-logs` | `agentFetchLogsHandler` | `operations/agentfetchlogs.ts` | Agent 获取日志 |
| GET | `/Agent/:id/$fetch-logs` | `agentFetchLogsHandler` | 同上 | Agent 获取日志 (实例) |

#### Patient 操作

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET/POST | `/Patient/$export` | `patientExportHandler` | `operations/export.ts` | Patient 批量导出 |
| GET/POST | `/Patient/:id/$everything` | `patientEverythingHandler` | `operations/patienteverything.ts` | Patient $everything |
| GET/POST | `/Patient/:id/$summary` | `patientSummaryHandler` | `operations/patientsummary.ts` | Patient IPS 摘要 |
| GET/POST | `/Patient/:id/$ccda-export` | `ccdaExportHandler` | `operations/ccdaexport.ts` | Patient C-CDA 导出 |

#### 其他 FHIR 操作

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| GET/POST | `/Group/:id/$export` | `groupExportHandler` | `operations/groupexport.ts` | Group 批量导出 |
| POST | `/Measure/:id/$evaluate-measure` | `evaluateMeasureHandler` | `operations/evaluatemeasure.ts` | 质量评估 |
| POST | `/PlanDefinition/:id/$apply` | `planDefinitionApplyHandler` | `operations/plandefinitionapply.ts` | PlanDefinition 应用 |
| POST | `/ChargeItemDefinition/:id/$apply` | `chargeItemDefinitionApplyHandler` | `operations/chargeitemdefinitionapply.ts` | ChargeItemDefinition 应用 |
| GET | `/:resourceType/:id/$graph` | `resourceGraphHandler` | `operations/resourcegraph.ts` | GraphDefinition 遍历 |
| POST | `/:resourceType/:id/$set-accounts` | `setAccountsHandler` | `operations/set-accounts.ts` | 设置资源账户 |
| GET/POST | `/QuestionnaireResponse/:id/$extract` | `extractHandler` | `operations/extract.ts` | QuestionnaireResponse 提取 |
| POST | `/QuestionnaireResponse/$extract` | `extractHandler` | 同上 | QuestionnaireResponse 提取 (类型级) |
| POST | `/:resourceType/$validate` | (内联) `repo.validateResourceStrictly` | `routes.ts` | 资源验证 |
| POST | `/:resourceType/:id/$reindex` | (内联) `repo.reindexResource` | `routes.ts` | 资源重索引 |
| POST | `/:resourceType/:id/$resend` | (内联) `repo.resendSubscriptions` | `routes.ts` | 重发订阅通知 |
| POST | `/:resourceType/:id/$expunge` | `expungeHandler` | `operations/expunge.ts` | 彻底清除资源 |
| GET | `/Subscription/:id/$get-ws-binding-token` | `getWsBindingTokenHandler` | `operations/getwsbindingtoken.ts` | WebSocket 绑定 Token |
| POST | `/StructureDefinition/$expand-profile` | `structureDefinitionExpandProfileHandler` | `operations/structuredefinitionexpandprofile.ts` | Profile 展开 |
| GET | `/ClientApplication/:id/$smart-launch` | `appLaunchHandler` | `operations/launch.ts` | SMART App 启动 |
| POST | `/ClientApplication/:id/$rotate-secret` | `rotateSecretHandler` | `operations/rotatesecret.ts` | 客户端密钥轮换 |
| POST | `/Claim/$export` | `claimExportPostHandler` | `operations/claimexport.ts` | Claim 导出 |
| GET | `/Claim/:id/$export` | `claimExportGetHandler` | 同上 | Claim 导出 (实例) |
| GET | `/Schedule/:id/$find` | `scheduleFindHandler` | `operations/find.ts` | Schedule 查找可用时段 |
| POST | `/:resourceType/:id/$aws-textract` | `awsTextractHandler` | `cloud/aws/textract.ts` | AWS Textract OCR |
| POST | `/Bot/:id/$deploy` | `deployHandler` | `operations/deploy.ts` | Bot 部署代码 |
| POST | `/AsyncJob/:id/$cancel` | `asyncJobCancelHandler` | `operations/asyncjobcancel.ts` | 取消异步任务 |

#### SuperAdmin 数据库操作

| HTTP | 端点 | 核心函数 | 源文件 | 说明 |
|------|------|---------|--------|------|
| POST | `/$db-stats` | `dbStatsHandler` | `operations/dbstats.ts` | 数据库统计 |
| POST | `/$db-schema-diff` | `dbSchemaDiffHandler` | `operations/dbschemadiff.ts` | Schema 差异 |
| POST | `/$db-invalid-indexes` | `dbInvalidIndexesHandler` | `operations/dbinvalidindexes.ts` | 无效索引检查 |
| POST | `/$explain` | `dbExplainHandler` | `operations/explain.ts` | SQL EXPLAIN |
| GET | `/$db-indexes` | `dbIndexesHandler` | `operations/dbindexes.ts` | 索引列表 |
| POST | `/$db-configure-indexes` | `dbConfigureIndexesHandler` | `operations/db-configure-indexes.ts` | 配置索引 |
| GET | `/$db-column-statistics` | `getColumnStatisticsHandler` | `operations/db-column-statistics.ts` | 列统计 |
| POST | `/$db-configure-column-statistics` | `configureColumnStatisticsHandler` | `operations/db-configure-column-statistics.ts` | 配置列统计 |

---

## 5. Binary 路由

**路径前缀**: `/fhir/R4/Binary`
**源文件**: `packages/server/src/fhir/binary.ts`
**Auth**: 需要认证
**特殊**: 独立于 body-parser，直接处理原始流数据

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| POST | `/` | `handleBinaryWriteRequest` -> `uploadBinaryData` | 创建 Binary (流式上传) |
| PUT | `/:id` | `handleBinaryWriteRequest` -> `uploadBinaryData` | 更新 Binary |
| GET | `/:id` | (内联) `repo.readResource('Binary', id)` | 读取 Binary 内容 |

---

## 6. Bulk Data / Job 路由

**路径前缀**: `/fhir/R4/bulkdata` 和 `/fhir/R4/job`
**源文件**: `packages/server/src/fhir/bulkdata.ts`, `packages/server/src/fhir/job.ts`
**Auth**: 需要认证

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/bulkdata/export/:id` | (内联) 读取 `AsyncJob`/`BulkDataExport` | 查询批量导出状态/结果 |
| DELETE | `/bulkdata/export/:id` | (内联) 设置 `status=cancelled` | 取消批量导出 |
| GET | `/job/:id/status` | (内联) 读取 `AsyncJob` 状态 | 查询异步任务状态 |
| DELETE | `/job/:id/status` | `asyncJobCancelHandler` | 取消异步任务 |

---

## 7. 异步 Batch

**路径**: `POST /fhir/R4` (带 `Prefer: respond-async`)
**源文件**: `packages/server/src/async-batch.ts`
**Auth**: 需要认证

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| POST | `/fhir/R4` | `asyncBatchHandler` -> `queueBatchProcessing` | 异步 Batch 处理 (不支持 Transaction) |

---

## 8. OAuth2 路由

**路径前缀**: `/oauth2`
**源文件**: `packages/server/src/oauth/routes.ts`

| HTTP | 端点 | Auth | 核心函数 | 源文件 | 说明 |
|------|------|------|---------|--------|------|
| GET | `/authorize` | 无 | `authorizeGetHandler` | `oauth/authorize.ts` | OAuth2 授权端点 (GET) |
| POST | `/authorize` | 无 | `authorizePostHandler` | `oauth/authorize.ts` | OAuth2 授权端点 (POST) |
| POST | `/token` | 无 | `tokenHandler` | `oauth/token.ts` | Token 端点 (多种 grant_type) |
| GET | `/userinfo` | 认证 | `userInfoHandler` | `oauth/userinfo.ts` | OpenID Connect UserInfo |
| POST | `/userinfo` | 认证 | `userInfoHandler` | `oauth/userinfo.ts` | OpenID Connect UserInfo (POST) |
| GET | `/logout` | 认证 | `logoutHandler` | `oauth/logout.ts` | 登出 |
| POST | `/logout` | 认证 | `logoutHandler` | `oauth/logout.ts` | 登出 (POST) |
| POST | `/introspect` | 无 | `tokenIntrospectHandler` | `oauth/introspect.ts` | Token 自省 (RFC 7662) |
| POST | `/register` | 无 | `registerHandler` | `oauth/register.ts` | 动态客户端注册 (RFC 7591) |

---

## 9. Auth 路由

**路径前缀**: `/auth`
**源文件**: `packages/server/src/auth/routes.ts`

| HTTP | 端点 | Auth | 核心函数 | 源文件 | 说明 |
|------|------|------|---------|--------|------|
| POST | `/login` | 无 | `loginHandler` | `auth/login.ts` | 邮箱/密码登录 |
| POST | `/method` | 无 | `methodHandler` | `auth/method.ts` | 查询可用认证方法 |
| GET | `/external` | 无 | `externalCallbackHandler` | `auth/external.ts` | 外部 IdP 回调 |
| GET | `/me` | 认证 | `meHandler` | `auth/me.ts` | 当前用户信息 (SessionDetails) |
| POST | `/newuser` | 无 | `newUserHandler` | `auth/newuser.ts` | 注册新用户 (需 reCAPTCHA) |
| POST | `/newproject` | 无 | `newProjectHandler` | `auth/newproject.ts` | 创建新项目 |
| POST | `/newpatient` | 无 | `newPatientHandler` | `auth/newpatient.ts` | 注册新患者 |
| POST | `/profile` | 无 | `profileHandler` | `auth/profile.ts` | 选择登录 Profile (多成员身份) |
| POST | `/scope` | 无 | `scopeHandler` | `auth/scope.ts` | 设置 OAuth scope |
| POST | `/changepassword` | 认证 | `changePasswordHandler` | `auth/changepassword.ts` | 修改密码 |
| POST | `/resetpassword` | 无 | `resetPasswordHandler` | `auth/resetpassword.ts` | 请求密码重置 (需 reCAPTCHA) |
| POST | `/setpassword` | 无 | `setPasswordHandler` | `auth/setpassword.ts` | 设置新密码 (带 token) |
| POST | `/verifyemail` | 无 | `verifyEmailHandler` | `auth/verifyemail.ts` | 验证邮箱 |
| POST | `/google` | 无 | `googleHandler` | `auth/google.ts` | Google 登录 |
| POST | `/exchange` | 无 | `exchangeHandler` | `auth/exchange.ts` | Token 交换 |
| POST | `/revoke` | 认证 | `revokeHandler` | `auth/revoke.ts` | 撤销 Login |
| GET | `/login/:login` | 无 | `statusHandler` | `auth/status.ts` | 查询 Login 状态 |
| GET | `/clientinfo/:clientId` | 无 | `clientInfoHandler` | `auth/clientinfo.ts` | 查询 ClientApplication 信息 |

### 9.1 MFA 子路由 (`/auth/mfa`)

**源文件**: `packages/server/src/auth/mfa.ts`

| HTTP | 端点 | Auth | 核心函数 | 说明 |
|------|------|------|---------|------|
| GET | `/status` | 认证 | (内联) | 查询 MFA 状态 + 生成 QR 码 |
| POST | `/login-enroll` | 无 | (内联) | 登录流程中注册 MFA |
| POST | `/enroll` | 认证 | (内联) | 已登录状态注册 MFA |
| POST | `/verify` | 无 | (内联) `verifyMfaToken` | 验证 MFA Token |
| POST | `/disable` | 认证 | (内联) | 禁用 MFA |

---

## 10. .well-known 路由

**路径前缀**: `/.well-known`
**源文件**: `packages/server/src/wellknown.ts`
**Auth**: 无 (全部公开)

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/jwks.json` | `getJwks` | JWKS 公钥集 |
| GET | `/oauth-authorization-server` | `handleOAuthConfig` | OAuth2 服务发现 |
| GET | `/openid-configuration` | `handleOAuthConfig` | OpenID Connect 发现 |
| GET | `/oauth-protected-resource` | `handleOauthProtectedResource` | OAuth Protected Resource (RFC 9728) |
| GET | `/smart-configuration` | `smartConfigurationHandler` | SMART-on-FHIR 配置 |
| GET | `/smart-styles.json` | `smartStylingHandler` | SMART 样式 |

---

## 11. Admin 路由

### 11.1 项目管理 (`/admin/projects`)

**源文件**: `packages/server/src/admin/project.ts`
**Auth**: 需要认证 + projectAdmin

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/:projectId` | (内联) | 获取项目元数据 |
| POST | `/:projectId/bot` | `createBotHandler` | 创建 Bot |
| POST | `/:projectId/client` | `createClientHandler` | 创建 ClientApplication |
| POST | `/:projectId/invite` | `inviteHandler` | 邀请用户加入项目 |
| POST | `/setpassword` | (内联) `setPassword` | 项目管理员重置用户密码 |
| POST | `/:projectId/secrets` | (内联) `repo.updateResource` | 管理项目 secrets |
| POST | `/:projectId/sites` | (内联) `repo.updateResource` | 管理项目 sites |
| GET | `/:projectId/members/:membershipId` | (内联) `repo.readResource` | 获取成员详情 |
| POST | `/:projectId/members/:membershipId` | (内联) `repo.updateResource` | 更新成员信息 |
| DELETE | `/:projectId/members/:membershipId` | (内联) `repo.deleteResource` | 移除成员 (不能删除 owner) |

### 11.2 超级管理 (`/admin/super`)

**源文件**: `packages/server/src/admin/super.ts`
**Auth**: 需要认证 + superAdmin

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| POST | `/valuesets` | `rebuildR4ValueSets` | 重建 ValueSet 表 (async) |
| POST | `/structuredefinitions` | `rebuildR4StructureDefinitions` | 重建 StructureDefinition 表 (async) |
| POST | `/searchparameters` | `rebuildR4SearchParameters` | 重建 SearchParameter 表 (async) |
| POST | `/reindex` | `addReindexJob` | 资源重索引 (async, 多参数) |
| POST | `/setpassword` | `setPassword` | 超级管理员重置任意用户密码 |
| POST | `/purge` | `repo.purgeResources` | 清理旧的 AuditEvent/Login |
| POST | `/removebotidjobsfromqueue` | `removeBullMQJobByKey` | 移除 Bot 队列任务 |
| POST | `/rebuildprojectid` | (内联 SQL) | 重建 projectId 列 (async) |
| GET | `/migrations` | (内联) | 查询待执行的迁移 |
| POST | `/migrate` | `maybeStartPostDeployMigration` | 执行数据库迁移 (async) |
| POST | `/reconcile-db-schema-drift` | `generateMigrationActions` | 修复 Schema 漂移 (async) |
| POST | `/setdataversion` | `markPostDeployMigrationCompleted` | 手动设置数据版本 (危险) |
| POST | `/tablesettings` | (内联 SQL) `ALTER TABLE SET` | 设置表参数 (autovacuum 等) |
| POST | `/vacuum` | (内联 SQL) `VACUUM [ANALYZE]` | 表 VACUUM (async) |
| POST | `/reloadcron` | `reloadCronBots` | 重载 Cron Bot 队列 (async) |

---

## 12. SCIM 路由

**路径前缀**: `/scim/v2`
**源文件**: `packages/server/src/scim/routes.ts`
**Auth**: 需要认证 + projectAdmin
**协议**: SCIM 2.0 (RFC 7644)

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/Users` | `searchScimUsers` | 搜索用户 |
| POST | `/Users` | `createScimUser` | 创建用户 |
| GET | `/Users/:id` | `readScimUser` | 读取用户 |
| PUT | `/Users/:id` | `updateScimUser` | 更新用户 |
| PATCH | `/Users/:id` | `patchScimUser` | Patch 用户 |
| DELETE | `/Users/:id` | `deleteScimUser` | 删除用户 |

---

## 13. CDS Hooks 路由

**路径前缀**: `/cds-services`
**源文件**: `packages/server/src/cds/routes.ts`
**Auth**: 需要认证

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/` | (内联) 搜索有 `cdsService` 的 Bot | CDS 服务发现 |
| POST | `/:id` | `executeBot` | 调用 CDS 服务 (执行 Bot) |

---

## 14. Email 路由

**路径前缀**: `/email/v1`
**源文件**: `packages/server/src/email/routes.ts`
**Auth**: 需要认证 + 项目启用 `email` feature + projectAdmin

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| POST | `/send` | `sendEmail` | 发送邮件 |

---

## 15. Key-Value 路由

**路径前缀**: `/keyvalue/v1`
**源文件**: `packages/server/src/keyvalue/routes.ts`
**Auth**: 需要认证

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/:key` | `getValue` | 读取值 |
| PUT | `/:key` | `setValue` | 设置值 |
| DELETE | `/:key` | `deleteValue` | 删除值 |

---

## 16. FHIRcast 路由

**路径前缀**: `/fhircast/STU2` 和 `/fhircast/STU3`
**源文件**: `packages/server/src/fhircast/routes.ts`

### 16.1 公开路由

| HTTP | 端点 | Auth | 核心函数 | 说明 |
|------|------|------|---------|------|
| GET | `/.well-known/fhircast-configuration` | 无 | (内联) | FHIRcast 配置发现 |

### 16.2 受保护路由

| HTTP | 端点 | Auth | 核心函数 | 说明 |
|------|------|------|---------|------|
| POST | `/` | 认证 | `handleSubscriptionRequest` / `handleContextChangeRequest` | 订阅或发布事件 |
| POST | `/:topic` | 认证 | `handleContextChangeRequest` | 发布上下文变更 |
| GET | `/:topic` (STU2) | 认证 | (内联) `getCurrentContext` | 获取当前上下文 (STU2 格式) |
| GET | `/:topic` (STU3) | 认证 | (内联) `getCurrentContext` | 获取当前上下文 (STU3 格式) |

---

## 17. Storage 路由

**路径前缀**: `/storage`
**源文件**: `packages/server/src/storage/routes.ts`
**Auth**: 无 (URL 签名验证)

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| GET | `/:id/:versionId?` | (内联) 签名验证 + `getBinaryStorage().readBinary` | 预签名 URL 读取 Binary |

---

## 18. Webhook 路由

**路径前缀**: `/webhook`
**源文件**: `packages/server/src/webhook/routes.ts`
**Auth**: 无 (匿名访问, Bot 需设置 `publicWebhook=true`)

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| POST | `/:id` | `webhookHandler` -> `executeBot` | 公开 Webhook (通过 ProjectMembership ID 路由到 Bot) |

---

## 19. DICOM 路由

**路径前缀**: `/dicom/PS3`
**源文件**: `packages/server/src/dicom/routes.ts`
**Auth**: 需要认证
**状态**: Stub (所有端点返回 200, 无实际实现)

| HTTP | 端点 | 说明 |
|------|------|------|
| GET/POST | `/studies` | DICOMweb WADO Studies |
| GET/POST | `/studies/:study` | 获取/存储 Study |
| GET | `/studies/:study/rendered` | Study 渲染 |
| GET | `/studies/:study/series` | Series 列表 |
| GET | `/studies/:study/series/:series` | 获取 Series |
| GET | `/studies/:study/series/:series/rendered` | Series 渲染 |
| GET | `/studies/:study/series/:series/metadata` | Series 元数据 |
| GET | `/studies/:study/series/:series/instances` | Instance 列表 |
| GET | `/studies/:study/series/:series/instances/:instance` | 获取 Instance |
| GET | `/studies/:study/series/:series/instances/:instance/rendered` | Instance 渲染 |
| GET | `/studies/:study/series/:series/instances/:instance/metadata` | Instance 元数据 |
| GET | `/studies/:study/series/:series/instances/:instance/frames/:frame` | 获取 Frame |
| GET | `/:bulkdataUriReference` | BulkData URI 引用 |

---

## 20. MCP 路由

**路径前缀**: `/mcp`
**源文件**: `packages/server/src/mcp/routes.ts`
**Auth**: 需要认证
**条件**: `config.mcpEnabled = true`

| HTTP | 端点 | 核心函数 | 说明 |
|------|------|---------|------|
| ALL | `/stream` | `StreamableHTTPServerTransport` | MCP Streamable HTTP (新协议) |
| GET | `/sse` | `SSEServerTransport` | MCP SSE 连接 (旧协议) |
| POST | `/sse` | (内联) Redis publish | MCP SSE 消息发送 |

---

## 21. WebSocket 端点

**源文件**: `packages/server/src/websockets.ts`
**协议**: WebSocket (ws://)

| 路径 | 处理函数 | 源文件 | 说明 |
|------|---------|--------|------|
| `/ws/echo` | `handleEchoConnection` | `websockets.ts` | 回声测试 (Redis pub/sub) |
| `/ws/agent` | `handleAgentConnection` | `agent/websockets.ts` | Agent WebSocket 连接 |
| `/ws/fhircast/:endpoint` | `handleFhircastConnection` | `fhircast/websocket.ts` | FHIRcast WebSocket |
| `/ws/subscriptions-r4` | `handleR4SubscriptionConnection` | `subscriptions/websockets.ts` | FHIR R4 Subscription 通知 |

---

## 22. 根级路由

| HTTP | 端点 | 说明 |
|------|------|------|
| GET | `/` | 返回 200 OK |
| GET | `/robots.txt` | 返回 `User-agent: *\nDisallow: /` |
| GET | `/healthcheck` | 健康检查 |
| GET | `/openapi.json` | OpenAPI 规范 |

---

## 23. 统计总表

| 路由模块 | 端点数量 | Auth | 说明 |
|---------|---------|------|------|
| **FHIR CRUD** (FhirRouter) | 15 | 认证 | 标准 FHIR REST |
| **FHIR 公开** | 4 | 无 | metadata, versions, SMART |
| **FHIR $operations** | ~55 | 认证 | 自定义操作 |
| **Binary** | 3 | 认证 | 流式上传/下载 |
| **Bulk Data / Job** | 4 | 认证 | 异步任务管理 |
| **OAuth2** | 9 | 混合 | OpenID Connect |
| **Auth** | 18 + 5 (MFA) | 混合 | 认证流程 |
| **.well-known** | 6 | 无 | 服务发现 |
| **Admin 项目** | 10 | projectAdmin | 项目管理 |
| **Admin 超级** | 15 | superAdmin | 系统运维 |
| **SCIM** | 6 | projectAdmin | 用户同步 |
| **CDS Hooks** | 2 | 认证 | 临床决策支持 |
| **Email** | 1 | 认证+admin | 邮件发送 |
| **Key-Value** | 3 | 认证 | KV 存储 |
| **FHIRcast** | 5 | 混合 | 临床上下文同步 |
| **Storage** | 1 | URL签名 | 预签名 Binary 下载 |
| **Webhook** | 1 | 无 | 公开 Bot 触发 |
| **DICOM** | 13 | 认证 | DICOMweb (stub) |
| **MCP** | 3 | 认证 | Model Context Protocol |
| **WebSocket** | 4 | - | 实时通信 |
| **根级** | 4 | 无 | 健康检查等 |
| **总计** | **~182** | | |

---

## 24. MedXAI 对比要点

### 24.1 必须实现

| 模块 | 端点 | 理由 |
|------|------|------|
| FHIR CRUD | 全部 15 个标准路由 | FHIR 合规性基础 |
| Binary | 创建/读取/更新 | 文件上传下载 |
| OAuth2 | authorize, token, userinfo, logout | 认证基础 |
| Auth | login, me, changepassword, newuser | 用户管理基础 |
| .well-known | jwks, openid-configuration, smart-configuration | 服务发现 |
| $validate | `/:resourceType/$validate` | 数据质量 |
| $expand | `/ValueSet/$expand` | 术语搜索 |
| Batch/Transaction | `POST /` | 批量操作 |

### 24.2 建议实现

| 模块 | 端点 | 理由 |
|------|------|------|
| GraphQL | `/$graphql` | 灵活查询 |
| Patient $everything | `/Patient/:id/$everything` | 患者数据汇总 |
| WS Subscriptions | `/ws/subscriptions-r4` + `$get-ws-binding-token` | 实时通知 |
| Admin 项目 | invite, members CRUD | 多租户管理 |
| MFA | status, enroll, verify, disable | 安全增强 |
| Bulk Export | `$export` | 数据迁移/分析 |

### 24.3 可延后

| 模块 | 理由 |
|------|------|
| SCIM | 仅企业 IdP 集成需要 |
| CDS Hooks | 临床决策支持，后续需求 |
| FHIRcast | 临床工作流同步 |
| DICOM | 影像系统集成 (目前 stub) |
| MCP | AI/LLM 集成 |
| Agent 操作 | 本地设备网关 |
| SuperAdmin 数据库操作 | 运维工具 |
| C-CDA 导出 | 美国特定需求 |
| AWS Textract | 云厂商绑定 |
