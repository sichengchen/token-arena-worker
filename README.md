# tokens-burned

**你每天烧了多少 token？**

tokens-burned 是一个开源的 AI 编码助手用量追踪工具。它能自动采集本地 AI coding CLI 的使用数据，让你在简洁的 Web 仪表盘中一目了然地看到每天的 token 消耗、会话活跃度和多维度分析。

## 为什么做这个项目？

用 Cursor、Claude Code、Copilot 这些工具写代码很爽，但你有没有好奇过：

- 每天到底花了多少 token？
- 哪个项目最费 token？
- 输入、输出、reasoning、缓存的比例是多少？
- 一天里什么时候最活跃？

tokens-burned 帮你回答这些问题。

## 功能概览

- **Usage 总览** — 按 1 天 / 7 天 / 30 天 / 自定义区间查看 token 用量
- **多维度分析** — 按设备、工具、模型、项目分组查看数据
- **详细指标** — 总 token、输入、输出、reasoning、缓存命中、活跃时长、会话数、消息数
- **多工具支持** — 支持采集多种本地 AI CLI 的 usage 数据
- **隐私优先** — 项目名称默认按 hash 匿名上传，你自行决定是否公开
- **多语言 & 深色模式** — 支持中英文切换和主题切换
- **Docker 一键部署** — 几行命令即可跑起来

## 快速开始

### Docker 部署（推荐）

```bash
git clone https://github.com/poco-ai/tokens-burned.git
cd tokens-burned
chmod +x start.sh
./start.sh
```

启动脚本会自动创建配置文件、生成安全密钥并启动所有服务。

### 本地开发

```bash
pnpm install
pnpm dev:web    # 启动 Web 仪表盘
pnpm dev:cli    # 启动 CLI 工具
```

本地开发需要 PostgreSQL，Web 端环境变量配置在 `web/.env`：

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tokens_burned
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
```

## 使用流程

1. **注册账号** — 打开 Web 页面注册并登录
2. **创建 API Key** — 在 Settings 中生成 CLI 用的 API key
3. **初始化 CLI** — 运行 `pnpm --filter ./cli dev -- init`，输入服务地址和 API key
4. **同步数据** — 运行 `pnpm --filter ./cli dev -- sync`，数据会上传到 Web 端
5. **开启自动同步（macOS）** — 运行 `pnpm --filter ./cli dev -- service install`，注册为 LaunchAgent 定时同步
6. **查看分析** — 打开 `/usage` 页面查看你的 token 用量分析

## CLI 自动同步（macOS）

CLI 现在支持注册为 macOS `launchd` 后台服务，按固定间隔自动执行同步。

```bash
# 安装后台自动同步（默认 5 分钟）
pnpm --filter ./cli dev -- service install

# 指定同步间隔（毫秒）
pnpm --filter ./cli dev -- service install --interval 600000

# 查看状态
pnpm --filter ./cli dev -- service status

# 停止 / 启动 / 重启
pnpm --filter ./cli dev -- service stop
pnpm --filter ./cli dev -- service start
pnpm --filter ./cli dev -- service restart

# 查看最近日志
pnpm --filter ./cli dev -- service logs

# 卸载后台服务
pnpm --filter ./cli dev -- service uninstall
```

后台服务会：

- 以当前用户的 LaunchAgent 形式运行
- 默认每 5 分钟执行一次 `tokens-burned sync`
- 将运行状态写入 `~/.tokens-burned/runtime/status.json`
- 将日志写入 `~/.tokens-burned/logs/service.log`

## 部署说明

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `BETTER_AUTH_SECRET` | 认证密钥 | `openssl rand -base64 32` 生成 |
| `BETTER_AUTH_URL` | 应用对外访问 URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://postgres:postgres@db:5432/tokens_burned` |
| `POSTGRES_USER` | PostgreSQL 用户名 | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL 密码 | `postgres` |
| `POSTGRES_DB` | PostgreSQL 数据库名 | `tokens_burned` |

### Docker 常用命令

```bash
docker compose logs -f          # 查看日志
docker compose down              # 停止服务
docker compose pull && docker compose up -d  # 更新并重启
docker compose down -v           # 停止并删除数据
```

## 技术栈

| 层 | 技术 |
|----|------|
| CLI | TypeScript, Commander |
| Web | Next.js (App Router), React, shadcn/ui |
| 数据库 | PostgreSQL, Prisma |
| 认证 | better-auth |
| 构建 | pnpm monorepo |
| 部署 | Docker Compose |

## License

MIT
