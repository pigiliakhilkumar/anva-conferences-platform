import Link from "next/link";
import { accountLogoutAction } from "@/app/actions/account";
import { requireAccount } from "@/lib/auth";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAccount();
  const canReview = ["REVIEWER", "CONFERENCE_MANAGER", "ADMINISTRATOR"].includes(user.role);
  const canManage = ["CONFERENCE_MANAGER", "ADMINISTRATOR"].includes(user.role);
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/workspace" className="admin-brand">ANVA <span>Author workspace</span></Link><nav aria-label="Workspace navigation"><Link href="/workspace">My submissions</Link><Link href="/workspace/submissions/new">New submission</Link>{canReview && <Link href="/workspace/reviews">Peer reviews</Link>}{canManage && <Link href="/workspace/manage">Editorial management</Link>}<Link href="/conferences">Public site</Link></nav><div className="admin-account"><strong>{user.name || "Account"}</strong><span>{user.email}</span><form action={accountLogoutAction}><button>Log out</button></form></div></aside><main className="admin-main">{children}</main></div>;
}
