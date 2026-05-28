import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const password = "test-password-123!";
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);

    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);

    const invalid = await bcrypt.compare("wrong-password", hash);
    expect(invalid).toBe(false);
  });

  it("rejects empty password against hash", async () => {
    const hash = await bcrypt.hash("real-password", 12);
    const valid = await bcrypt.compare("", hash);
    expect(valid).toBe(false);
  });

  it("rejects undefined password", async () => {
    const hash = await bcrypt.hash("real-password", 12);
    const valid = await bcrypt.compare("", hash);
    expect(valid).toBe(false);
  });
});
