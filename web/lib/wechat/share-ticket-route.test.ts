import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOptionalSession: vi.fn(),
  findUnique: vi.fn(),
  isWechatShareConfigured: vi.fn(),
  createWechatProfileShareTicketPayload: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getOptionalSession: mocks.getOptionalSession,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("@/lib/wechat/share-server", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/wechat/share-server")
  >("@/lib/wechat/share-server");

  return {
    ...actual,
    isWechatShareConfigured: mocks.isWechatShareConfigured,
    createWechatProfileShareTicketPayload:
      mocks.createWechatProfileShareTicketPayload,
  };
});

describe("wechat share ticket route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.getOptionalSession.mockResolvedValue(null);

    const { POST } = await import(
      "@/app/api/integrations/wechat/share-ticket/route"
    );
    const response = await POST(
      new Request("https://example.com/api/integrations/wechat/share-ticket", {
        method: "POST",
        body: JSON.stringify({ source: "chat", locale: "zh" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 when public profile is disabled", async () => {
    mocks.getOptionalSession.mockResolvedValue({
      user: { id: "user_1" },
    });
    mocks.isWechatShareConfigured.mockReturnValue(true);
    mocks.findUnique.mockResolvedValue({
      name: "Alice",
      username: "alice",
      usagePreference: {
        bio: null,
        publicProfileEnabled: false,
        locale: "zh",
      },
    });

    const { POST } = await import(
      "@/app/api/integrations/wechat/share-ticket/route"
    );
    const response = await POST(
      new Request("https://example.com/api/integrations/wechat/share-ticket", {
        method: "POST",
        body: JSON.stringify({ source: "chat", locale: "zh" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns share payload for a public profile", async () => {
    mocks.getOptionalSession.mockResolvedValue({
      user: { id: "user_1" },
    });
    mocks.isWechatShareConfigured.mockReturnValue(true);
    mocks.findUnique.mockResolvedValue({
      name: "Alice",
      username: "alice",
      usagePreference: {
        bio: "Hello",
        publicProfileEnabled: true,
        locale: "zh",
      },
    });
    mocks.createWechatProfileShareTicketPayload.mockResolvedValue({
      appid: "wx_app_123",
      ticket: "ticket_123",
      url: "https://tokenarena.example/zh/u/alice",
      title: "Alice 的 Token Arena 主页",
      desc: "Hello",
      thumburl: "https://tokenarena.example/logo_green.svg",
      source: "chat",
      timeout: 30000,
    });

    const { POST } = await import(
      "@/app/api/integrations/wechat/share-ticket/route"
    );
    const response = await POST(
      new Request("https://example.com/api/integrations/wechat/share-ticket", {
        method: "POST",
        body: JSON.stringify({ source: "chat", locale: "zh" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      appid: "wx_app_123",
      ticket: "ticket_123",
      url: "https://tokenarena.example/zh/u/alice",
    });
  });
});
