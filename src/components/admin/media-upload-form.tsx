"use client";

import { useActionState } from "react";
import { uploadMediaAction } from "@/app/actions/media";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = { ok: false, message: "" };

export function MediaUploadForm({ conferences, selectedConferenceId }: {
  conferences: { id: string; title: string }[];
  selectedConferenceId?: string;
}) {
  const [state, action, pending] = useActionState(uploadMediaAction, initialState);
  return <form action={action} className="builder-form">
    {state.message && <p className={`notice ${state.ok ? "success" : "error"}`} role="status">{state.message}</p>}
    <fieldset>
      <legend>Upload media</legend>
      <label>File
        <input type="file" name="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" required />
        <small>JPEG, PNG, GIF and WebP up to 8 MB; PDF up to 15 MB.</small>
      </label>
      <label>Conference association
        <select name="conferenceId" defaultValue={selectedConferenceId || ""}>
          <option value="">Platform media / blog cover</option>
          {conferences.map((conference) => <option value={conference.id} key={conference.id}>{conference.title}</option>)}
        </select>
      </label>
      <label className="wide">Image alternative text
        <input name="altText" maxLength={300} placeholder="Required for images; leave blank for documents" />
      </label>
    </fieldset>
    <button className="button primary" disabled={pending}>{pending ? "Uploading…" : "Upload media"}</button>
  </form>;
}
