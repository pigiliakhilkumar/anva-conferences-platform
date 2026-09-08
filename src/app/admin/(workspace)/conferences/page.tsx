import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/text";
export default async function ConferencesAdmin() {
  const conferences = await db.conference.findMany({ orderBy: { updatedAt: "desc" } });
  return <><header className="admin-header"><div><p className="eyebrow">Content management</p><h1>Conferences</h1></div><Link className="button primary" href="/admin/conferences/new">Create Conference</Link></header><section className="admin-panel">{conferences.length ? <div className="responsive-table"><table><thead><tr><th>Conference</th><th>Dates</th><th>Classification</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{conferences.map(c=><tr key={c.id}><td><strong>{c.title}</strong><small>/{c.slug}</small></td><td>{formatDate(c.startDate)} – {formatDate(c.endDate)}</td><td>{c.scope} · {c.deliveryMode}</td><td><span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span></td><td><Link href={`/admin/conferences/${c.id}/edit`}>Edit</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No conferences created yet</h2><p>Create the first conference as a draft. Nothing is published automatically.</p><Link className="button primary" href="/admin/conferences/new">Create Conference</Link></div>}</section></>;
}
