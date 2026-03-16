# grok-agent-kit v0 发布清单

这个清单用于准备面向社区的正式发布。

## 发布前检查

- 确认工作区干净，`main` 已和远端同步。
- 同步更新 `README.md` 和 `README.zh-CN.md`。
- 复查 `docs/clients/` 与 `docs/clients/*.zh-CN.md` 下的客户端接入文档。
- 确认 `apps/cli/package.json` 里的包元信息仍然与公开仓库保持一致。

## 验证

运行发布前必须通过的验证命令：

```bash
npm test
npm run build
npm run typecheck
npm run pack:cli
npm run smoke:pack-install
```

- 确认打包产物既能通过 `npx` 执行，也能在安装后正常运行。
- 确认打包进去的 CLI README 同时说明了 `npx` 用法和 `npm install -g grok-agent-kit` 用法。

## 发布

- 确认当前 npm 账号拥有发布 `grok-agent-kit` 的权限。
- 触发 `.github/workflows/publish.yml` 之前，先确认 npm 已为当前包和 `.github/workflows/publish.yml` 配置 Trusted Publishing。
- 如需最后一次人工确认，可先本地运行 `npm publish --workspace apps/cli --access public --dry-run`。
- 所有验证通过后，再用 GitHub Actions 执行正式发布。
- 迁移完成后，删除仓库里不再使用的旧 `NPM_TOKEN` 密钥。

## 发布后

- 测试 `npx -y grok-agent-kit doctor`。
- 至少在一台干净机器或一个干净 shell 环境里测试 `npm install -g grok-agent-kit`。
- 用最终 npm 版本号更新 release notes 和社区发布帖。
- 保持英文与简体中文发布说明同步。

## 重点复查文件

- `README.md`
- `README.zh-CN.md`
- `apps/cli/README.md`
- `docs/clients/README.md`
- `docs/clients/README.zh-CN.md`
- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`
