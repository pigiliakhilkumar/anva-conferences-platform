"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/actions/subscribe";
import type { ActionState } from "@/lib/validation";
import styles from "./Public.module.css";

const initialState: ActionState = { ok: false, message: "" };

export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribeAction, initialState);
  return <form action={action}>
    <label htmlFor="newsletter-email">Email address</label>
    <div className={styles.search}>
      <input id="newsletter-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <button type="submit" disabled={pending}>{pending ? "Saving…" : "Subscribe"}</button>
    </div>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
