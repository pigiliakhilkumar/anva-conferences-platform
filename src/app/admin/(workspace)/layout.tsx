import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">ANVA <span>Conferences</span></Link><nav aria-label="Administrator navigation"><Link href="/admin">Dashboard</Link><Link href="/admin/conferences">Conferences</Link><Link href="/workspace/manage">Editorial</Link><Link href="/admin/media">Media</Link><Link href="/admin/blog">Blog</Link><Link href="/admin/subscribers">Subscribers</Link><Link href="/admin/users">Users</Link><Link href="/admin/settings">Settings</Link></nav><div className="admin-account"><span>{user.email}</span><form action={logoutAction}><button>Log out</button></form></div></aside><main className="admin-main">{children}</main></div>;
}
