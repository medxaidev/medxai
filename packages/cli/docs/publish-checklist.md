# @medxai/cli v0.1.0 发布检查清单

## 发布前检查项

### 1. 代码质量 ✅

- [x] TypeScript 编译无错误
  ```bash
  npx tsc --noEmit --project packages/cli/tsconfig.json
  ```
  
- [x] 所有测试通过 (49/49)
  ```bash
  npx vitest run packages/cli/src/__tests__/cli.test.ts
  ```

- [x] 无 fhir-core 回归 (136/136 contract tests)
  ```bash
  npx vitest run packages/fhir-core/src/__tests__/api-surface-contract.test.ts
  ```

### 2. 构建验证 ✅

- [x] 构建成功
  ```bash
  npm run build --workspace=packages/cli
  ```

- [x] 构建产物完整
  - `dist/bin/medxai.mjs` - CLI 可执行文件
  - `dist/esm/index.mjs` - ESM 模块
  - `dist/lib/*.d.ts` - TypeScript 类型定义

- [x] CLI 命令可执行
  ```bash
  node packages/cli/dist/bin/medxai.mjs --help
  node packages/cli/dist/bin/medxai.mjs --version
  ```

### 3. 文档完整性 ✅

- [x] README.md - 完整的使用说明
- [x] CHANGELOG.md - v0.1.0 发布说明
- [x] LICENSE - Apache-2.0 许可证
- [x] docs/usage.md - 详细使用指南
- [x] docs/publish-checklist.md - 本检查清单

### 4. package.json 配置 ✅

- [x] 版本号: `0.1.0`
- [x] 名称: `@medxai/cli`
- [x] 描述: 完整且准确
- [x] 关键词: 包含 fhir, cli, validator 等
- [x] 仓库信息: 正确的 GitHub URL
- [x] bin 入口: `./dist/bin/medxai.mjs`
- [x] main 入口: `./dist/esm/index.mjs`
- [x] types 入口: `./dist/lib/index.d.ts`
- [x] exports 配置: 正确的 ESM 导出
- [x] files 字段: 仅包含必要文件
- [x] engines: Node.js >= 18.0.0
- [x] dependencies: 仅 @medxai/fhir-core@0.1.0
- [x] publishConfig: access=public

### 5. 发布文件 ✅

- [x] .npmignore - 排除源码和测试文件
- [x] 确认 files 字段包含:
  - dist/
  - README.md
  - LICENSE
  - CHANGELOG.md

### 6. 依赖检查 ✅

- [x] @medxai/fhir-core@0.1.0 已发布到 npm
- [x] 无运行时依赖（除 fhir-core）
- [x] devDependencies 正确

### 7. 功能验证 ✅

所有 5 个命令手动测试通过：

- [x] `medxai parse` - 解析 FHIR 资源
- [x] `medxai validate` - 验证资源
- [x] `medxai evaluate` - FHIRPath 求值
- [x] `medxai snapshot` - 生成快照
- [x] `medxai capabilities` - 显示能力

### 8. 本地测试方式

#### 方式 1: 使用 tsx 运行源码（开发）
```bash
npx tsx packages/cli/src/bin/medxai.ts --help
npx tsx packages/cli/src/bin/medxai.ts parse Patient.json
```

#### 方式 2: 使用构建后的文件
```bash
npm run build --workspace=packages/cli
node packages/cli/dist/bin/medxai.mjs --help
```

#### 方式 3: 使用 npm link（推荐）
```bash
cd packages/cli
npm link
medxai --help
medxai capabilities
```

#### 方式 4: 本地 npm pack 测试
```bash
cd packages/cli
npm pack
# 会生成 medxai-cli-0.1.0.tgz
npm install -g ./medxai-cli-0.1.0.tgz
medxai --help
```

### 9. 发布前最终检查

- [ ] 确认 @medxai/fhir-core@0.1.0 已在 npm 上可用
- [ ] 确认所有更改已提交到 Git
- [ ] 确认在正确的分支（main/master）
- [ ] 确认 npm 登录状态
  ```bash
  npm whoami
  ```
- [ ] 确认 npm registry 配置正确
  ```bash
  npm config get registry
  # 应该是: https://registry.npmjs.org/
  ```

### 10. 发布步骤

```bash
# 1. 进入 CLI 包目录
cd packages/cli

# 2. 确认构建是最新的
npm run build

# 3. 预览将要发布的文件
npm pack --dry-run

# 4. 发布到 npm（首次发布）
npm publish

# 或者，如果需要指定 tag
npm publish --tag latest

# 5. 验证发布成功
npm view @medxai/cli

# 6. 全局安装测试
npm install -g @medxai/cli
medxai --version
medxai capabilities
```

### 11. 发布后验证

- [ ] npm 上的包页面正确显示
  - https://www.npmjs.com/package/@medxai/cli
  
- [ ] 全局安装测试
  ```bash
  npm install -g @medxai/cli
  medxai --version  # 应显示 0.1.0
  medxai capabilities
  ```

- [ ] 在新项目中安装测试
  ```bash
  mkdir test-cli
  cd test-cli
  npm init -y
  npm install @medxai/cli
  npx medxai --help
  ```

- [ ] 创建 Git tag
  ```bash
  git tag cli-v0.1.0
  git push origin cli-v0.1.0
  ```

### 12. 发布后任务

- [ ] 更新 GitHub Release 页面
- [ ] 在项目 README 中更新 CLI 安装说明
- [ ] 通知团队成员新版本发布
- [ ] 监控 npm 下载统计和问题反馈

## 回滚计划

如果发现严重问题需要回滚：

```bash
# 1. 废弃有问题的版本
npm deprecate @medxai/cli@0.1.0 "Critical bug, please use version X.X.X"

# 2. 发布修复版本
# 修复问题后，更新版本号为 0.1.1
npm publish

# 3. 通知用户
# 在 GitHub Issues 和相关渠道发布公告
```

## 已知限制（v0.1.0）

1. **不支持术语服务** - 无法验证 CodeSystem/ValueSet 绑定
2. **不支持搜索** - 无法执行 FHIR 搜索操作
3. **仅结构验证** - 不包括业务规则验证
4. **本地文件操作** - 不支持网络资源获取

## 下一版本计划

考虑在 v0.2.0 中添加：
- [ ] 批量验证模式
- [ ] 配置文件支持
- [ ] 更详细的错误报告
- [ ] 性能优化（大文件处理）
