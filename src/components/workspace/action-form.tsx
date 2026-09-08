"use client";
import { useActionState } from "react";
import type { ActionState } from "@/lib/validation";
const initial: ActionState = { ok: false, message: "" };
export function ActionForm({ action, children, submitLabel, className = "builder-form" }: { action: (state: ActionState, data: FormData) => Promise<ActionState>; children: React.ReactNode; submitLabel: string; className?: string }) { const [state, formAction, pending] = useActionState(action, initial); return <form action={formAction} className={className}>{children}{state.message && <p className={`notice ${state.ok ? "success" : "error"}`} role="status">{state.message}</p>}<button className="primary" disabled={pending}>{pending ? "Working…" : submitLabel}</button></form>; }
