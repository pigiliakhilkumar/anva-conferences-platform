import { db } from "@/lib/db";
export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return <><header className="admin-header"><div><p className="eyebrow">Newsletter</p><h1>Subscribers</h1><p>Subscription records only. Phase 1 does not send email.</p></div></header><section className="admin-panel">{subscribers.length ? <div className="responsive-table"><table><thead><tr><th>Email</th><th>Status</th><th>Recorded</th></tr></thead><tbody>{subscribers.map(s=><tr key={s.id}><td>{s.email}</td><td>{s.active ? "Active" : "Unsubscribed"}</td><td>{s.createdAt.toLocaleDateString("en")}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No subscribers</h2><p>Validated newsletter subscriptions will appear here.</p></div>}</section></>;
}
