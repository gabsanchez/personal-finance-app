import { signup } from "@/lib/actions/auth";

// ── Mocks ───────────────────────────────────────────────

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

const mockCookieSet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ set: (...args: unknown[]) => mockCookieSet(...args) }),
}));

jest.mock("@/lib/auth", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// ── Helpers ─────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const validFields = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  confirmPassword: "password123",
  locale: "en",
};

// ── Tests ───────────────────────────────────────────────

describe("signup action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "uuid-1", ...validFields });
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const fd = makeFormData({ ...validFields, password: "short", confirmPassword: "short" });
    const result = await signup({}, fd);
    expect(result).toEqual({ error: "passwordTooShort" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const fd = makeFormData({ ...validFields, confirmPassword: "different123" });
    const result = await signup({}, fd);
    expect(result).toEqual({ error: "passwordMismatch" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects duplicate email", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" });
    const fd = makeFormData(validFields);
    const result = await signup({}, fd);
    expect(result).toEqual({ error: "emailExists" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates user with hashed password and locale", async () => {
    const fd = makeFormData({ ...validFields, locale: "es" });
    await signup({}, fd);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password",
        locale: "es",
      },
    });
  });

  it("sets NEXT_LOCALE cookie on successful signup", async () => {
    const fd = makeFormData({ ...validFields, locale: "es" });
    await signup({}, fd);
    expect(mockCookieSet).toHaveBeenCalledWith("NEXT_LOCALE", "es", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("signs in with credentials after creating user", async () => {
    const { signIn } = require("@/lib/auth");
    const fd = makeFormData(validFields);
    await signup({}, fd);
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: false,
    });
  });

  it("redirects to / after successful signup", async () => {
    const { redirect } = require("next/navigation");
    const fd = makeFormData(validFields);
    await signup({}, fd);
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
