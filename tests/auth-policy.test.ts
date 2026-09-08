import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn(),
  sessionCreate: vi.fn(),
  sessionDeleteMany: vi.fn(),
  sessionFindUnique: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/db", () => ({
  db: {
    session: {
      create: mocks.sessionCreate,
      deleteMany: mocks.sessionDeleteMany,
      findUnique: mocks.sessionFindUnique,
    },
  },
}));

import {
  createSession,
  destroySession,
  getCurrentUser,
  requireAdmin,
  verifyAuthSecret,
} from "@/lib/auth";

const admin = {
  id: "admin-test-id",
  email: "admin@example.test",
  name: "Test administrator",
  passwordHash: "not-returned-to-clients",
  role: "ADMINISTRATOR",
  active: true,
  createdAt: new Date("2027-01-01T00:00:00.000Z"),
  updatedAt: new Date("2027-01-01T00:00:00.000Z"),
};

function cookieJar(token?: string) {
  return {
    get: vi.fn(() => (token ? { value: token } : undefined)),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

describe("administrator authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue(cookieJar());
  });

  it("returns no user when the request has no session cookie", async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.sessionFindUnique).not.toHaveBeenCalled();
  });

  it("redirects an unauthorized request to the administrator login", async () => {
    await requireAdmin();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("rejects expired and inactive sessions", async () => {
    mocks.cookies.mockResolvedValue(cookieJar("opaque-token"));
    mocks.sessionFindUnique
      .mockResolvedValueOnce({
        expiresAt: new Date(Date.now() - 1_000),
        user: admin,
      })
      .mockResolvedValueOnce({
        expiresAt: new Date(Date.now() + 60_000),
        user: { ...admin, active: false },
      });

    await expect(getCurrentUser()).resolves.toBeNull();
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns an active administrator from a valid server-side session", async () => {
    mocks.cookies.mockResolvedValue(cookieJar("opaque-token"));
    mocks.sessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user: admin,
    });

    await expect(requireAdmin()).resolves.toEqual(admin);
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.sessionFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) },
        include: { user: true },
      }),
    );
  });

  it("redirects an authenticated non-administrator", async () => {
    mocks.cookies.mockResolvedValue(cookieJar("opaque-token"));
    mocks.sessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...admin, role: "CONFERENCE_MANAGER" },
    });

    await requireAdmin();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/login");
  });
});

describe("session cookie security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a hash server-side and sets an HttpOnly SameSite cookie", async () => {
    const jar = cookieJar();
    mocks.cookies.mockResolvedValue(jar);
    mocks.sessionCreate.mockResolvedValue({ id: "session-test-id" });
    vi.stubEnv("NODE_ENV", "production");

    await createSession(admin.id);

    const stored = mocks.sessionCreate.mock.calls[0][0].data;
    const [cookieName, rawToken, options] = jar.set.mock.calls[0];
    expect(cookieName).toBe("anva_admin_session");
    expect(rawToken).not.toBe(stored.tokenHash);
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });

    vi.unstubAllEnvs();
  });

  it("invalidates the database session during logout", async () => {
    const jar = cookieJar("opaque-token");
    mocks.cookies.mockResolvedValue(jar);

    await destroySession();

    expect(mocks.sessionDeleteMany).toHaveBeenCalledWith({
      where: { tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) },
    });
    expect(jar.delete).toHaveBeenCalledWith("anva_admin_session");
  });
});

describe("authentication secret checks", () => {
  it("rejects missing, short, and documented placeholder secrets", () => {
    vi.stubEnv("AUTH_SECRET", "");
    expect(verifyAuthSecret()).toBe(false);
    vi.stubEnv("AUTH_SECRET", "too-short");
    expect(verifyAuthSecret()).toBe(false);
    vi.stubEnv("AUTH_SECRET", "generate-a-random-secret-of-at-least-32-characters");
    expect(verifyAuthSecret()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("accepts a sufficiently long non-placeholder secret", () => {
    vi.stubEnv("AUTH_SECRET", "J7d0!ZQw-x2Md8vcC5@kN1ybU6rP9sLA");
    expect(verifyAuthSecret()).toBe(true);
    vi.unstubAllEnvs();
  });
});
