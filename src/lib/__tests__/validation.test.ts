import { describe, it, expect } from "vitest";
import { z } from "zod";

const waitlistSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  numberOfAssets: z.string().regex(/^\d+$/, "Must be a positive number"),
  preferredCities: z.string().min(1, "Please list at least one city"),
});

describe("waitlist validation", () => {
  it("accepts valid input", () => {
    const result = waitlistSchema.safeParse({
      companyName: "Test Corp",
      contactPerson: "John Doe",
      email: "john@test.com",
      phone: "+971501234567",
      numberOfAssets: "50",
      preferredCities: "Dubai, Riyadh",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company name", () => {
    const result = waitlistSchema.safeParse({
      companyName: "",
      contactPerson: "John Doe",
      email: "john@test.com",
      phone: "+971501234567",
      numberOfAssets: "50",
      preferredCities: "Dubai",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("companyName");
    }
  });

  it("rejects invalid email", () => {
    const result = waitlistSchema.safeParse({
      companyName: "Test Corp",
      contactPerson: "John Doe",
      email: "not-an-email",
      phone: "+971501234567",
      numberOfAssets: "50",
      preferredCities: "Dubai",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric numberOfAssets", () => {
    const result = waitlistSchema.safeParse({
      companyName: "Test Corp",
      contactPerson: "John Doe",
      email: "john@test.com",
      phone: "+971501234567",
      numberOfAssets: "abc",
      preferredCities: "Dubai",
    });
    expect(result.success).toBe(false);
  });
});
