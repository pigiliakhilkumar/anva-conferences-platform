import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MediaImage, formatDate, publicStyles as styles } from "@/components/public/PublicUI";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await db.blogPost.findFirst({ where: { slug: (await params).slug, status: "PUBLISHED", publishedAt: { lte: new Date() } } });
  return post ? { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${post.slug}` } } : { title: "Post not found" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await db.blogPost.findFirst({ where: { slug: (await params).slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, include: { cover: true } });
  if (!post) notFound();
  return <article><header className={styles.pageHead}><div className={styles.narrow}><nav className={styles.breadcrumbs}><Link href="/blog">Blog</Link> / Article</nav><h1>{post.title}</h1><p>{post.excerpt}</p><p className={styles.meta}>{post.publishedAt && formatDate(post.publishedAt)}{post.authorName ? ` · ${post.authorName}` : ""}</p></div></header><div className={`${styles.narrow} ${styles.content}`}><MediaImage assetId={post.coverId} alt={post.cover?.altText || ""} /><div className={styles.prose}>{post.body}</div></div></article>;
}
