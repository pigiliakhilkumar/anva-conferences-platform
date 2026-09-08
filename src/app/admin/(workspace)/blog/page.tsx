import Link from "next/link";
import { db } from "@/lib/db";

export default async function BlogAdminPage() {
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return <>
    <header className="admin-header"><div><p className="eyebrow">Publishing</p><h1>Blog</h1><p>Create truthful platform news and publish it when ready.</p></div><Link className="button primary" href="/admin/blog/new">Create post</Link></header>
    <section className="admin-panel">{posts.length ? <div className="responsive-table"><table><thead><tr><th>Post</th><th>Status</th><th>Publication</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
      {posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><small>/{post.slug}</small></td><td><span className={`badge ${post.status.toLowerCase()}`}>{post.status}</span></td><td>{post.publishedAt?.toLocaleString("en") || "Not published"}</td><td>{post.updatedAt.toLocaleDateString("en")}</td><td><Link href={`/admin/blog/${post.id}/edit`}>Edit</Link></td></tr>)}
    </tbody></table></div> : <div className="empty-state"><h2>No blog posts created</h2><p>Create a draft when there is a real update to share. No filler content is generated.</p><Link className="button primary" href="/admin/blog/new">Create post</Link></div>}</section>
  </>;
}
