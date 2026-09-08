import Link from "next/link";
import { db } from "@/lib/db";
import { EmptyState, MediaImage, PageHeader, formatDate, publicStyles as styles } from "@/components/public/PublicUI";

export const metadata = { title: "News & Blog", description: "Published news and updates from ANVA Conferences." };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, include: { cover: true }, orderBy: { publishedAt: "desc" } });
  return <><PageHeader eyebrow="Updates" title="News & blog">Published announcements, guidance and updates from ANVA Conferences.</PageHeader><section className={styles.section}><div className={styles.container}>{posts.length ? <div className={styles.grid3}>{posts.map(post => <article className={styles.card} key={post.id}><MediaImage assetId={post.coverId} alt={post.cover?.altText || ""} /><p className={styles.meta}>{post.publishedAt && formatDate(post.publishedAt)}{post.authorName ? ` · ${post.authorName}` : ""}</p><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link href={`/blog/${post.slug}`}>Read article →</Link></article>)}</div> : <EmptyState title="No posts published">Published platform news and announcements will appear here.</EmptyState>}</div></section></>;
}
