import { notFound } from "next/navigation";
import { requireConferenceManager } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/text";

export default async function ManageSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.submission.findUnique({ where: { id }, include: { conference: true, owner: true, authors: { orderBy: { sortOrder: "asc" } }, versions: { include: { media: true }, orderBy: { versionNumber: "desc" } }, decisions: { orderBy: { createdAt: "desc" } }, history: { orderBy: { createdAt: "desc" } } } });
  if (!item || item.status === "DRAFT") notFound();
  await requireConferenceManager(item.conferenceId);
  return <><header className="admin-header"><p className="eyebrow">{item.conference.title}</p><h1>{item.referenceNumber}</h1><p>{item.title} — {item.owner.name || item.owner.email}</p><span className="badge">{item.status.replaceAll("_", " ")}</span></header><section className="admin-panel"><h2>Submission record</h2><p className="prose">{item.abstractText}</p><h3>Authors</h3><ul>{item.authors.map(a => <li key={a.id}>{a.name} ({a.email})</li>)}</ul><h3>Versions</h3>{item.versions.map(v => <p key={v.id}>Version {v.versionNumber}: {v.media?.originalName} — integrity {v.integrityHash?.slice(0, 12) || "not recorded"}</p>)}</section><section className="admin-panel"><h2>Decision history</h2>{item.decisions.length ? item.decisions.map(d => <article key={d.id}><strong>{d.type.replaceAll("_", " ")}</strong><p>{d.comments}</p><small>{formatDate(d.createdAt)}</small></article>) : <p>No decision has been issued.</p>}</section><section className="admin-panel"><h2>Status history</h2><ol>{item.history.map(h => <li key={h.id}>{h.fromStatus || "New"} → {h.toStatus} — {formatDate(h.createdAt)}</li>)}</ol></section></>;
}
