import { notFound } from "next/navigation";
import { updateBlogPostAction } from "@/app/actions/blog";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { db } from "@/lib/db";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, images] = await Promise.all([
    db.blogPost.findUnique({ where: { id } }),
    db.mediaAsset.findMany({ where: { kind: "IMAGE" }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!post) notFound();
  return <><header className="admin-header"><div><p className="eyebrow">Publishing · {post.status}</p><h1>{post.title}</h1><p>Publication and archival are recorded in the administrator audit log.</p></div></header><BlogPostForm post={post} images={images} action={updateBlogPostAction.bind(null, post.id)} /></>;
}
