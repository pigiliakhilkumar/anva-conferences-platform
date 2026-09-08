import Link from "next/link";
import { requireAccount } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/text";

export default async function WorkspacePage() {
  const user = await requireAccount();
  const submissions = await db.submission.findMany({ where: { ownerId: user.id }, include: { conference: { select: { title: true } }, decisions: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return <><header className="admin-header"><div><p className="eyebrow">Author workspace</p><h1>My submissions</h1></div><Link className="button primary" href="/workspace/submissions/new">New submission</Link></header><section className="admin-panel">{submissions.length ? <div className="responsive-table"><table><thead><tr><th>Submission</th><th>Conference</th><th>Status</th><th>Updated</th></tr></thead><tbody>{submissions.map(item => <tr key={item.id}><td><Link href={`/workspace/submissions/${item.id}`}><strong>{item.title}</strong></Link><small>{item.kind.replaceAll("_", " ")}</small></td><td>{item.conference.title}</td><td><span className="badge">{item.status.replaceAll("_", " ")}</span>{item.decisions[0] && <small>Latest decision: {item.decisions[0].type.replaceAll("_", " ")}</small>}</td><td>{formatDate(item.updatedAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No submissions yet</h2><p>Start a draft for a conference that is currently accepting work.</p><Link className="button primary" href="/workspace/submissions/new">Create a submission</Link></div>}</section></>;
}
