"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/text";
import type { ActionState } from "@/lib/validation";

const blogSchema = z.object({
  title: z.string().trim().min(5).max(200),
  slug: z.string().trim().min(3).max(100).transform(slugify).refine(Boolean, "Enter a valid slug."),
  excerpt: z.string().trim().min(20).max(500),
  body: z.string().trim().min(30).max(50000),
  authorName: z.string().trim().max(120).optional().or(z.literal("")),
  coverId: z.string().trim().max(64).optional().or(z.literal("")),
  publicationDate: z.string().trim().max(40).optional().or(z.literal("")),
  intent: z.enum(["SAVE", "PUBLISH", "ARCHIVE"]),
});

function parseBlog(formData: FormData) {
  return blogSchema.safeParse(Object.fromEntries(formData.entries()));
}

async function validateCover(coverId: string) {
  if (!coverId) return true;
  return Boolean(await db.mediaAsset.findFirst({ where: { id: coverId, kind: "IMAGE" }, select: { id: true } }));
}

function resolvePublicationDate(value: string, intent: "SAVE" | "PUBLISH" | "ARCHIVE", current?: Date | null) {
  if (value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) return { error: "Enter a valid publication date." } as const;
    return { value: parsed } as const;
  }
  return { value: intent === "PUBLISH" ? current || new Date() : current || null } as const;
}

export async function createBlogPostAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = parseBlog(formData);
  if (!parsed.success) return { ok: false, message: "Correct the blog information.", errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  if (data.intent === "ARCHIVE") return { ok: false, message: "Create the post as a draft before archiving it." };
  if (await db.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } })) return { ok: false, message: "That blog slug is already in use." };
  if (!(await validateCover(data.coverId ?? ""))) return { ok: false, message: "Choose a valid image from the media library." };
  const date = resolvePublicationDate(data.publicationDate ?? "", data.intent);
  if ("error" in date) return { ok: false, message: date.error || "Enter a valid publication date." };

  const post = await db.blogPost.create({ data: {
    title: data.title, slug: data.slug, excerpt: data.excerpt, body: data.body,
    authorName: data.authorName || null, coverId: data.coverId || null,
    status: data.intent === "PUBLISH" ? "PUBLISHED" : "DRAFT", publishedAt: date.value,
  } });
  await audit("BLOG_POST_CREATED", user.id, "BlogPost", post.id);
  if (post.status === "PUBLISHED") await audit("BLOG_POST_PUBLISHED", user.id, "BlogPost", post.id);
  revalidatePath("/blog");
  redirect(`/admin/blog/${post.id}/edit?created=1`);
}

export async function updateBlogPostAction(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "This blog post no longer exists." };
  const parsed = parseBlog(formData);
  if (!parsed.success) return { ok: false, message: "Correct the blog information.", errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  if (await db.blogPost.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } })) return { ok: false, message: "That blog slug is already in use." };
  if (!(await validateCover(data.coverId ?? ""))) return { ok: false, message: "Choose a valid image from the media library." };
  if (data.intent === "ARCHIVE" && formData.get("confirmArchive") !== "on") return { ok: false, message: "Confirm that you want to archive this post." };
  const date = resolvePublicationDate(data.publicationDate ?? "", data.intent, existing.publishedAt);
  if ("error" in date) return { ok: false, message: date.error || "Enter a valid publication date." };
  const status = data.intent === "PUBLISH" ? "PUBLISHED" : data.intent === "ARCHIVE" ? "ARCHIVED" : existing.status;
  const post = await db.blogPost.update({ where: { id }, data: {
    title: data.title, slug: data.slug, excerpt: data.excerpt, body: data.body,
    authorName: data.authorName || null, coverId: data.coverId || null, status, publishedAt: date.value,
  } });
  await audit("BLOG_POST_UPDATED", user.id, "BlogPost", post.id);
  if (status === "PUBLISHED" && existing.status !== "PUBLISHED") await audit("BLOG_POST_PUBLISHED", user.id, "BlogPost", post.id);
  if (status === "ARCHIVED" && existing.status !== "ARCHIVED") await audit("BLOG_POST_ARCHIVED", user.id, "BlogPost", post.id);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}/edit`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, message: status === "PUBLISHED" ? "Blog post published." : status === "ARCHIVED" ? "Blog post archived." : "Changes saved." };
}
