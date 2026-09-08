import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const input = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(14).max(200).refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v), "Password needs upper/lowercase, a number and a symbol"),
  authSecret: z.string().min(32)
}).safeParse({ email: process.env.BOOTSTRAP_ADMIN_EMAIL, password: process.env.BOOTSTRAP_ADMIN_PASSWORD, authSecret: process.env.AUTH_SECRET });

if (!input.success) {
  console.error("Refusing bootstrap. Set BOOTSTRAP_ADMIN_EMAIL, a unique 14+ character BOOTSTRAP_ADMIN_PASSWORD, and AUTH_SECRET (32+ characters). No value is stored in source.");
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && process.env.CONFIRM_PRODUCTION_BOOTSTRAP !== "CREATE_FIRST_ANVA_ADMIN") {
  console.error("Refusing production bootstrap without CONFIRM_PRODUCTION_BOOTSTRAP=CREATE_FIRST_ANVA_ADMIN."); process.exit(1);
}
const db = new PrismaClient();
try {
  const adminCount = await db.user.count({ where: { role: "ADMINISTRATOR" } });
  if (adminCount !== 0) throw new Error("Refusing bootstrap because an administrator already exists.");
  const emailExists = await db.user.findUnique({ where: { email: input.data.email } });
  if (emailExists) throw new Error("Refusing bootstrap because that email is already registered.");
  await db.user.create({ data: { email: input.data.email, passwordHash: await bcrypt.hash(input.data.password, 12), role: "ADMINISTRATOR" } });
  console.log(`Administrator created for ${input.data.email}. Clear BOOTSTRAP_ADMIN_PASSWORD from the environment now.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Administrator bootstrap failed."); process.exitCode = 1;
} finally { await db.$disconnect(); }
