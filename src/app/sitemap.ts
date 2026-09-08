import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://conferences.anvapublishing.com").replace(/\/$/, "");
  const [conferences, posts] = await Promise.all([
    db.conference.findMany({ where: { status: { in: ["PUBLISHED", "ONGOING", "COMPLETED"] }, publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
  ]);
  const routes = ["", "/conferences", "/conferences/upcoming", "/conferences/past", "/international", "/national", "/proceedings", "/blog", "/about", "/faq", "/help", "/contact"];
  return [
    ...routes.map(path => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...conferences.map(item => ({ url: `${base}/conferences/${item.slug}`, lastModified: item.updatedAt })),
    ...posts.map(item => ({ url: `${base}/blog/${item.slug}`, lastModified: item.updatedAt })),
  ];
}
