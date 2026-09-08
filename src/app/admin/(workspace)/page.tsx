import Link from "next/link";
import { db } from "@/lib/db";
export default async function Dashboard() {
  const now = new Date();
  const [total, draft, published, upcoming, completed] = await Promise.all([
    db.conference.count(), db.conference.count({ where: { status: "DRAFT" } }), db.conference.count({ where: { status: "PUBLISHED" } }),
    db.conference.count({ where: { status: "PUBLISHED", startDate: { gt: now } } }), db.conference.count({ where: { status: "COMPLETED" } })
  ]);
  return <><header className="admin-header"><div><p className="eyebrow">Administrator workspace</p><h1>Dashboard</h1></div><Link className="button primary" href="/admin/conferences/new">Create Conference</Link></header><section className="metric-grid" aria-label="Conference overview">{[["Total conferences",total],["Draft",draft],["Published",published],["Upcoming",upcoming],["Completed",completed]].map(([label,value])=><article className="metric" key={label}><strong>{value}</strong><span>{label}</span></article>)}</section><section className="admin-panel"><h2>Start managing conferences</h2><p>Create a draft, complete its conference information, configure sections and publish it when ready.</p><Link href="/admin/conferences" className="text-link">View conference records →</Link></section></>;
}
