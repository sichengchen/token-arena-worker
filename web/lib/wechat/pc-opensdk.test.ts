import { describe, expect, it } from "vitest";
import { getWechatShareSupport, mapWechatShareErrorCode } from "./pc-opensdk";

describe("pc opensdk helpers", () => {
  it("detects https sdk support", () => {
    expect(
      getWechatShareSupport({
        locale: "zh",
        sdkLoaded: true,
        protocol: "https:",
        hostname: "tokenarena.example",
      }),
    ).toMatchObject({
      locale: "zh",
      isHttps: true,
      sdkLoaded: true,
      supported: true,
    });
  });

  it("maps common error codes to localized messages", () => {
    expect(mapWechatShareErrorCode(-11033, "zh")).toContain("HTTPS");
    expect(mapWechatShareErrorCode(-11036, "en")).toContain("PC WeChat");
  });
});
