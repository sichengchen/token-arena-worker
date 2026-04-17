import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        "Please enter a valid email address.",
      );
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain("Password is required.");
    }
  });

  it("rejects short passwords", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        "Password must be at least 8 characters.",
      );
    }
  });
});

describe("registerSchema", () => {
  it("accepts a valid name, email, and password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      username: "test_user",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      username: "test_user",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Name must be at least 2 characters.",
      );
    }
  });

  it("rejects one-character names", () => {
    const result = registerSchema.safeParse({
      name: "Q",
      username: "test_user",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects names longer than 50 characters", () => {
    const result = registerSchema.safeParse({
      name: "a".repeat(51),
      username: "test_user",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      username: "test_user",
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        "Password must be at least 8 characters.",
      );
    }
  });

  it("rejects missing username", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      username: "",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.username).toContain("Username is required.");
    }
  });

  it("rejects invalid username characters", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      username: "test-user",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.username).toContain(
        "Username may only contain letters, numbers, underscores, and periods.",
      );
    }
  });
});
