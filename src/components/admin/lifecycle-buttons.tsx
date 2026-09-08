"use client";
import { useTransition } from "react";
import type { ConferenceStatus } from "@prisma/client";
import { transitionConferenceAction } from "@/app/actions/conferences";
export function LifecycleButtons({ id, status }: { id: string; status: ConferenceStatus }) {
  const [pending, start] = useTransition();
  const act = (next: ConferenceStatus, confirmText?: string) => { if (confirmText && !window.confirm(confirmText)) return; start(async () => transitionConferenceAction(id, next)); };
  return <div className="action-row">{status !== "PUBLISHED" && <button className="button primary" disabled={pending} onClick={()=>act("PUBLISHED")}>Publish</button>}{status === "PUBLISHED" && <button className="button" disabled={pending} onClick={()=>act("DRAFT", "Unpublish this conference? It will disappear from public pages.")}>Unpublish</button>}{status !== "ARCHIVED" && <button className="button danger" disabled={pending} onClick={()=>act("ARCHIVED", "Archive this conference? The record will be retained.")}>Archive</button>}{status !== "CANCELLED" && <button className="button danger" disabled={pending} onClick={()=>act("CANCELLED", "Mark this conference as cancelled?")}>Cancel conference</button>}</div>;
}
