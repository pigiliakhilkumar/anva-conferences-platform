import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE_NAME = "anva_admin_session";
const SESSION_DAYS = 7;

function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || !session.user.active) return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATOR") redirect("/admin/login");
  return user;
}

export async function requireAccount() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/workspace");
  return user;
}

export async function requireReviewer() {
  const user = await getCurrentUser();
  if (!user || !["REVIEWER", "CONFERENCE_MANAGER", "ADMINISTRATOR"].includes(user.role)) redirect("/login?returnTo=/workspace/reviews");
  return user;
}

export async function requireManager() {
  const user = await getCurrentUser();
  if (!user || !["CONFERENCE_MANAGER", "ADMINISTRATOR"].includes(user.role)) redirect("/login?returnTo=/workspace/manage");
  return user;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function verifyAuthSecret() {
  const secret = process.env.AUTH_SECRET || "";
  return secret.length >= 32 && !timingSafeEqual(Buffer.from(secret.slice(0, 8).padEnd(8)), Buffer.from("generate"));
}
