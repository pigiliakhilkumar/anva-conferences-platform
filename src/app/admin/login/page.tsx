import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
export const metadata = { title: "Administrator sign in" };
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
 const user = await getCurrentUser();
if (user?.role === "ADMINISTRATOR") redirect("/admin");
  const q = await searchParams;
  return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">Secure administration</p><h1>Administrator sign in</h1><p>Use the administrator account established through the documented bootstrap command.</p><LoginForm returnTo={q.returnTo} /></section></main>;
}
