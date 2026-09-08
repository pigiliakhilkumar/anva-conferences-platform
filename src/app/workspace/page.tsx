import Link from "next/link";
import { requireAccount } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/text";

export default async function WorkspacePage() {
  const user = await requireAccount();
  const [submissions, notifications] = await Promise.all([db.submission.findMany({ where: { ownerId: user.id }, include: { conference: { select: { title: true } }, decisions: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } }), db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 })]);
  return <><header className="admin-header"><div><p className="eyebrow">Author workspace</p><h1>My submissions</h1></div><Link className="button primary" href="/workspace/submissions/new">New submission</Link></header>{notifications.length > 0 && <section className="admin-panel"><h2>Recent notifications</h2><ul>{notifications.map(n => <li key={n.id}><strong>{n.title}</strong> — {n.body}</li>)}</ul></section>}<section className="admin-panel"><h2>My conferences and submissions</h2>{submissions.length ? <div className="responsive-table"><table><thead><tr><th>Reference / submission</th><th>Conference</th><th>Status</th><th>Updated</th></tr></thead><tbody>{submissions.map(item => <tr key={item.id}><td><Link href={`/workspace/submissions/${item.id}`}><strong>{item.referenceNumber}</strong><small>{item.title}</small></Link></td><td>{item.conference.title}</td><td><span className="badge">{item.status.replaceAll("_", " ")}</span>{item.decisions[0] && <small>Latest decision: {item.decisions[0].type.replaceAll("_", " ")}</small>}</td><td>{formatDate(item.updatedAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>You have not submitted to any conferences yet.</h2><p>Start a draft for a conference that is currently accepting work.</p><Link className="button primary" href="/workspace/submissions/new">Create a submission</Link></div>}</section></>;
}
