import { describe, expect, it } from "vitest";

import { createAccountSchema, signInSchema } from "./validation";

describe("authentication validation", () => {
  it("normalizes sign-in email addresses", () => {
    const result = signInSchema.parse({ email: " HRBP@Example.COM ", password: "password123" });
    expect(result.email).toBe("hrbp@example.com");
  });

  it("rejects short and mismatched account passwords", () => {
    const result = createAccountSchema.safeParse({
      name: "HR Partner",
      email: "hr@example.com",
      hrbpId: "42",
      password: "short",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
    }
  });
});