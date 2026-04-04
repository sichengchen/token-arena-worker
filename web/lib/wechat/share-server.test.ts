import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildWechatProfileSharePayload,
  getWechatAccessToken,
  resetWechatAccessTokenCache,
} from "./share-server";

describe("wechat share server utilities", () => {
  const env = {
    NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,
    WECHAT_OPEN_APP_SECRET: process.env.WECHAT_OPEN_APP_SECRET,
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_ORIGIN = "https://tokenarena.example";
    process.env.WECHAT_OPEN_APP_ID = "wx_app_123";
    process.env.WECHAT_OPEN_APP_SECRET = "secret_123";
    resetWechatAccessTokenCache();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_ORIGIN = env.NEXT_PUBLIC_APP_ORIGIN;
    process.env.BETTER_AUTH_URL = env.BETTER_AUTH_URL;
    process.env.WECHAT_OPEN_APP_ID = env.WECHAT_OPEN_APP_ID;
    process.env.WECHAT_OPEN_APP_SECRET = env.WECHAT_OPEN_APP_SECRET;
    resetWechatAccessTokenCache();
    vi.restoreAllMocks();
  });

  it("builds a zh profile share payload with absolute URLs", () => {
    const payload = buildWechatProfileSharePayload({
      appid: "wx_app_123",
      ticket: "ticket_123",
      locale: "zh",
      username: "alice",
      displayName: "Alice",
      bio: "一个热爱 AI 的人",
      source: "timeline",
    });

    expect(payload).toEqual({
      appid: "wx_app_123",
      ticket: "ticket_123",
      url: "https://tokenarena.example/zh/u/alice",
      title: "Alice 的 Token Arena 主页",
      desc: "一个热爱 AI 的人",
      thumburl: "https://tokenarena.example/logo_green.svg",
      source: "timeline",
      timeout: 30000,
    });
  });

  it("reuses cached access token until expiry window", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access_token_1",
          expires_in: 7200,
        }),
        { status: 200 },
      ),
    );

    await expect(getWechatAccessToken(fetchMock)).resolves.toBe(
      "access_token_1",
    );
    await expect(getWechatAccessToken(fetchMock)).resolves.toBe(
      "access_token_1",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
