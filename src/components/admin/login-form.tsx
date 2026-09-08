"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
const initial = { ok: false, message: "" };
export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return <form action={action} className="auth-form">
    <input type="hidden" name="returnTo" value={returnTo || "/admin"} />
    <label>Email<input type="email" name="email" autoComplete="username" required /></label>
    <label>Password<input type="password" name="password" autoComplete="current-password" minLength={10} required /></label>
    {state.message && <p className="notice error" role="alert">{state.message}</p>}
    <button className="button primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
