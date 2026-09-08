"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createObjectKey, MediaValidationError, persistUpload, removeStoredMedia, validateUpload } from "@/lib/media";
import type { ActionState } from "@/lib/validation";

export async function uploadMediaAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const candidate = formData.get("file");
  if (!(candidate instanceof File)) return { ok: false, message: "Choose a file to upload." };

  const conferenceId = String(formData.get("conferenceId") || "").trim() || null;
  if (conferenceId && !(await db.conference.findUnique({ where: { id: conferenceId }, select: { id: true } }))) {
    return { ok: false, message: "The selected conference no longer exists." };
  }

  const altText = String(formData.get("altText") || "").trim();
  if (altText.length > 300) return { ok: false, message: "Alternative text must be 300 characters or fewer." };

  let objectKey: string | undefined;
  try {
    const upload = await validateUpload(candidate);
    if (upload.kind === "IMAGE" && !altText) {
      return { ok: false, message: "Describe the image for people using assistive technology." };
    }
    objectKey = createObjectKey(upload.kind, upload.extension);
    await persistUpload(upload, objectKey);
    const asset = await db.mediaAsset.create({ data: {
      kind: upload.kind,
      objectKey,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      byteSize: upload.byteSize,
      altText: altText || null,
      conferenceId,
    } });
    await audit("MEDIA_UPLOADED", user.id, "MediaAsset", asset.id, { kind: asset.kind, byteSize: asset.byteSize });
    revalidatePath("/admin/media");
    if (conferenceId) revalidatePath(`/admin/conferences/${conferenceId}/edit`);
    return { ok: true, message: "Media uploaded successfully." };
  } catch (error) {
    if (objectKey) await removeStoredMedia(objectKey).catch(() => undefined);
    if (error instanceof MediaValidationError) return { ok: false, message: error.message };
    console.error("Media upload failed", error);
    return { ok: false, message: "The upload could not be completed. Check the storage configuration and try again." };
  }
}

export async function assignConferenceMediaAction(conferenceId: string, formData: FormData) {
  const user = await requireAdmin();
  const assetId = String(formData.get("assetId") || ""), role = String(formData.get("role") || "");
  const asset = await db.mediaAsset.findFirst({ where: { id: assetId, OR: [{ conferenceId }, { conferenceId: null }] } });
  if (!asset) throw new Error("Media asset not found");
  if (["LOGO", "BANNER", "SOCIAL"].includes(role) && asset.kind !== "IMAGE") throw new Error("Brand assets must be images");
  if (role === "LOGO") await db.conference.update({ where: { id: conferenceId }, data: { logoId: asset.id } });
  else if (role === "BANNER") await db.conference.update({ where: { id: conferenceId }, data: { bannerId: asset.id } });
  else if (role === "SOCIAL") await db.conference.update({ where: { id: conferenceId }, data: { socialImageId: asset.id } });
  else if (role === "DOCUMENT" && asset.kind === "DOCUMENT") await db.conferenceDocument.create({ data: { conferenceId, mediaId: asset.id, title: String(formData.get("title") || asset.originalName).slice(0, 200), documentType: String(formData.get("documentType") || "Other").slice(0, 80) } });
  else throw new Error("Invalid media assignment");
  await audit("MEDIA_ASSIGNED", user.id, "Conference", conferenceId, { role });
  revalidatePath(`/admin/conferences/${conferenceId}/edit`);
}
