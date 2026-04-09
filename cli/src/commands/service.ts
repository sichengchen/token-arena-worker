import { getServiceBackend } from "../infrastructure/service";
import {
  formatBullet,
  formatHeader,
  formatKeyValue,
  formatSection,
} from "../infrastructure/ui/format";
import { logger } from "../utils/logger";

export interface ServiceCommandOptions {
  action?: string;
  skipPrompt?: boolean;
}

function printUsage(backendName?: string): void {
  logger.info(formatHeader("TokenArena 后台服务管理"));
  if (backendName) {
    logger.info(formatKeyValue("当前实现", backendName));
  }
  logger.info(formatSection("可用操作"));
  logger.info(formatBullet("setup     - 创建并启用服务"));
  logger.info(formatBullet("start     - 启动服务"));
  logger.info(formatBullet("stop      - 停止服务"));
  logger.info(formatBullet("restart   - 重启服务"));
  logger.info(formatBullet("status    - 查看服务状态"));
  logger.info(formatBullet("uninstall - 卸载服务"));
}

export async function runServiceCommand(
  opts: ServiceCommandOptions,
): Promise<void> {
  const backend = getServiceBackend();
  if (!backend) {
    logger.info(
      formatBullet(
        "后台服务仅在 Linux(systemd) 和 macOS(launchd) 上支持。",
        "warning",
      ),
    );
    return;
  }

  const action = opts.action?.toLowerCase();
  if (!action) {
    printUsage(backend.displayName);
    const support = backend.canSetup();
    if (!support.ok && support.reason) {
      logger.info(
        formatBullet(`当前环境暂不可管理服务。${support.reason}`, "warning"),
      );
    }
    return;
  }

  switch (action) {
    case "setup":
      await backend.setup(opts.skipPrompt);
      break;
    case "start":
      await backend.start();
      break;
    case "stop":
      await backend.stop();
      break;
    case "restart":
      await backend.restart();
      break;
    case "status":
      await backend.status();
      break;
    case "uninstall":
      await backend.uninstall(opts.skipPrompt);
      break;
    default:
      logger.error(`未知操作: ${action}`);
      process.exit(1);
  }
}
