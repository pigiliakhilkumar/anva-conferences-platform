import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readStoredMedia } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id) || id.length > 64) return new Response("Not found", { status: 404 });

  const asset = await db.mediaAsset.findUnique({
    where: { id },
    select: { id: true, objectKey: true, originalName: true, mimeType: true, kind: true, conferenceId: true, submissionVersions: { select: { submission: { select: { ownerId: true, assignments: { select: { reviewerId: true } } } } } }, manualPaymentProofs: { select: { registration: { select: { userId: true, conferenceId: true } } } } },
  });
  if (!asset) return new Response("Not found", { status: 404 });

  const user = await getCurrentUser();
  const isAdmin = user?.active && ["ADMINISTRATOR", "CONFERENCE_MANAGER"].includes(user.role);
  const isSubmissionFile = asset.submissionVersions.length > 0;
  const isPaymentProof = asset.manualPaymentProofs.length > 0;
  let canReadPaymentProof = Boolean(user && asset.manualPaymentProofs.some(proof => proof.registration.userId === user.id));
  if (user && !canReadPaymentProof && user.role === "ADMINISTRATOR") canReadPaymentProof = isPaymentProof;
  if (user && !canReadPaymentProof && user.role === "CONFERENCE_MANAGER") { const conferences = await db.conferenceManagerAssignment.findMany({ where: { userId: user.id, active: true }, select: { conferenceId: true } }); canReadPaymentProof = asset.manualPaymentProofs.some(proof => conferences.some(c => c.conferenceId === proof.registration.conferenceId)); }
  const canReadSubmission = Boolean(user && asset.submissionVersions.some(version => version.submission.ownerId === user.id || version.submission.assignments.some(assignment => assignment.reviewerId === user.id)));
  let isPublic = false;
  if (asset.conferenceId && !isSubmissionFile && !isPaymentProof) {
    isPublic = Boolean(await db.conference.findFirst({ where: {
      id: asset.conferenceId,
      status: { in: ["PUBLISHED", "ONGOING", "COMPLETED"] },
      publishedAt: { not: null },
    }, select: { id: true } }));
  }
  if (!isPublic) {
    isPublic = Boolean(await db.blogPost.findFirst({ where: {
      coverId: asset.id,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    }, select: { id: true } }));
  }
  if (!isAdmin && !canReadSubmission && !canReadPaymentProof && !isPublic) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readStoredMedia(asset.objectKey);
    const safeName = asset.originalName.replace(/[\r\n"\\]/g, "_");
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${asset.kind === "DOCUMENT" ? "attachment" : "inline"}; filename="${safeName}"`,
      "Cache-Control": isPublic && !isSubmissionFile ? "public, max-age=3600, stale-while-revalidate=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Media delivery failed", error);
    return new Response("Not found", { status: 404 });
  }
}
