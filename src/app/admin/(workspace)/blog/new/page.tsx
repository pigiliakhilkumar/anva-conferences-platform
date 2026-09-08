import { createBlogPostAction } from "@/app/actions/blog";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { db } from "@/lib/db";

export default async function NewBlogPostPage() {
  const images = await db.mediaAsset.findMany({ where: { kind: "IMAGE" }, orderBy: { createdAt: "desc" }, take: 100 });
  return <><header className="admin-header"><div><p className="eyebrow">Publishing</p><h1>Create blog post</h1><p>Save privately as a draft or publish immediately.</p></div></header><BlogPostForm action={createBlogPostAction} images={images} /></>;
}
