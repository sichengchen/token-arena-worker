# tokens-burned

一个 pnpm monorepo，用来统一采集本地 AI coding CLI 的 usage 数据，并在 Web 仪表盘里查看每天的 token 消耗、会话活跃度和多维度分析。

## Workspace

```txt
.
├── cli/                     # Commander CLI：解析本地 usage 数据并上传
├── web/                     # Next.js + Prisma + better-auth Web 应用
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 已实现能力

### Web

- 邮箱 + 密码注册 / 登录（better-auth）
- `/usage` 总览页
  - 1 天 / 7 天 / 30 天 / 自定义区间
  - 总 token、输入、输出、reasoning、缓存
  - 活跃时长、总时长、会话数、消息数、用户消息数
  - 设备 / 工具 / 模型 / 项目分组分析
- `/usage/setup`
  - 账户统一时区设置
  - 项目隐私模式设置（`hashed | raw | disabled`）
  - CLI 初始化说明
- `/settings/keys`
  - 多 API key 管理
  - 创建、重命名、启用 / 停用、删除

### CLI

- 解析多种本地 AI CLI usage 数据
- 每个用户可配置多个 Web API key 中的任意一个
- 上传统一后的 bucket / session 数据
- 口径统一：
  - `outputTokens` 包含 reasoning
  - `reasoningTokens` 仍单独保留
  - `totalTokens = inputTokens + outputTokens + cachedTokens`
- 项目默认按 hash 匿名上传

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 Web

```bash
pnpm dev:web
```

### 3. 启动 CLI

```bash
pnpm dev:cli -- --help
```

## Web 环境变量

在 `web/.env` 中至少配置：

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tokens_burned
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
```

可选：

```bash
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tokens_burned_shadow
```

`SHADOW_DATABASE_URL` 主要用于 Prisma migration diff / shadow database 校验。

## 使用流程

### Web 端

1. 打开 `http://localhost:3000/register` 注册账号
2. 登录后进入 `http://localhost:3000/usage`
3. 进入 `http://localhost:3000/settings/keys` 创建一个 CLI API key
4. 进入 `http://localhost:3000/usage/setup` 设置时区和项目模式

### CLI 端

初始化：

```bash
pnpm --filter ./cli dev -- init
```

按照提示输入：

- Web 服务地址，例如 `http://localhost:3000`
- 刚刚创建的 API key

然后执行同步：

```bash
pnpm --filter ./cli dev -- sync
```

同步完成后，打开：

```txt
http://localhost:3000/usage
```

## 常用命令

```bash
pnpm dev:web
pnpm dev:cli -- --help
pnpm build
pnpm check
pnpm --filter ./web test
pnpm --filter ./cli test
```
