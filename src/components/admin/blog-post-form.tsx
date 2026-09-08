"use client";

import { useActionState } from "react";
import type { BlogPost, MediaAsset } from "@prisma/client";
import type { ActionState } from "@/lib/validation";

type BlogAction = (state: ActionState, formData: FormData) => Promise<ActionState>;
const initialState: ActionState = { ok: false, message: "" };

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <small className="error">{errors[0]}</small> : null;
}

export function BlogPostForm({ post, images, action }: { post?: BlogPost; images: MediaAsset[]; action: BlogAction }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const date = post?.publishedAt ? new Date(post.publishedAt.getTime() - post.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  return <form action={formAction} className="builder-form">
    {state.message && <p className={`notice ${state.ok ? "success" : "error"}`} role="status">{state.message}</p>}
    <fieldset><legend>Article content</legend>
      <label>Title<input name="title" defaultValue={post?.title || ""} required minLength={5} maxLength={200} /><FieldError errors={state.errors?.title} /></label>
      <label>URL slug<input name="slug" defaultValue={post?.slug || ""} required minLength={3} maxLength={100} /><FieldError errors={state.errors?.slug} /></label>
      <label>Display attribution<input name="authorName" defaultValue={post?.authorName || ""} maxLength={120} /></label>
      <label>Publication date<input name="publicationDate" type="datetime-local" defaultValue={date} /><small>Leave blank to use the first publication time.</small></label>
      <label className="wide">Excerpt<textarea name="excerpt" defaultValue={post?.excerpt || ""} required minLength={20} maxLength={500} rows={3} /><FieldError errors={state.errors?.excerpt} /></label>
      <label className="wide">Body<textarea name="body" defaultValue={post?.body || ""} required minLength={30} maxLength={50000} rows={14} /><small>Phase 1 stores and renders this as safe plain text.</small><FieldError errors={state.errors?.body} /></label>
      <label>Cover image<select name="coverId" defaultValue={post?.coverId || ""}><option value="">No cover image</option>{images.map((image) => <option value={image.id} key={image.id}>{image.originalName}</option>)}</select></label>
    </fieldset>
    {post && <label><input type="checkbox" name="confirmArchive" /> Confirm archival before using Archive</label>}
    <div className="button-row">
      <button className="button" name="intent" value="SAVE" disabled={pending}>{pending ? "Saving…" : post ? "Save changes" : "Save draft"}</button>
      <button className="button primary" name="intent" value="PUBLISH" disabled={pending}>{pending ? "Working…" : "Publish"}</button>
      {post && <button className="button" name="intent" value="ARCHIVE" disabled={pending}>Archive</button>}
    </div>
  </form>;
}
