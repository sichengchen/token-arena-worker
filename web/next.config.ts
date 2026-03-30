import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** Monorepo root (parent of `web/`), so Turbopack does not infer a wrong root from other lockfiles. */
const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "linux.do",
      },
      {
        protocol: "https",
        hostname: "watcha.tos-cn-beijing.volces.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
