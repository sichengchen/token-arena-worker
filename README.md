# tokens-burned

一个面向多应用场景的 monorepo，用来统计不同 coding agent 每天烧掉了多少 token。

## 目录结构

```txt
.
├── cli                      # Commander CLI
├── web                      # Next.js Web App
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 当前 CLI 骨架

`cli` 里已经预置了：

- `daily`：查看某天的 token 汇总
- `agents`：查看当前支持的 agent 列表
- `ingest`：预留给后续接入各类 usage / log parser

目前先保持扁平结构，只保留 `web` 和 `cli` 两个 workspace；等后面真的出现大量共享逻辑时，再考虑拆出独立 package。

## 推荐下一步

```bash
pnpm install
pnpm dev:cli
pnpm dev:web
pnpm build
```

> 说明：这次主要完成了 monorepo 结构与 CLI 基础骨架。根目录的 lockfile 需要你执行 `pnpm install` 后重新生成。
