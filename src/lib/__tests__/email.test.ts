import { describe, it, expect, vi } from "vitest";

vi.mock("resend", async (importOriginal) => {
  const actual = await importOriginal<{ default: new (...args: unknown[]) => unknown }>();
  return {
    ...actual,
    default: class Resend {
      emails = {
        send: vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null }),
      };
    },
  };
});

describe("sendEmail", () => {
  it("exports a function", async () => {
    const mod = await import("@/lib/email");
    expect(typeof mod.sendEmail).toBe("function");
  });

  it("sends without error when RESEND_API_KEY is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const mod = await import("@/lib/email");
    await expect(
      mod.sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: null as unknown as React.ReactElement,
      }),
    ).resolves.not.toThrow();
    vi.unstubAllEnvs();
  });

  it("handles missing RESEND_API_KEY gracefully (no-op)", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const mod = await import("@/lib/email");
    await expect(
      mod.sendEmail({
        to: "test@example.com",
        subject: "Test",
        react: null as unknown as React.ReactElement,
      }),
    ).resolves.not.toThrow();
    vi.unstubAllEnvs();
  });
});
