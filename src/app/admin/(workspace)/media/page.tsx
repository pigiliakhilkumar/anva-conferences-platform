import { db } from "@/lib/db";
import { MediaUploadForm } from "@/components/admin/media-upload-form";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaAdminPage({ searchParams }: { searchParams: Promise<{ conferenceId?: string }> }) {
  const [{ conferenceId }, conferences, assets] = await Promise.all([
    searchParams,
    db.conference.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.mediaAsset.findMany({ include: { conference: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const selectedConferenceId = conferences.some((conference) => conference.id === conferenceId) ? conferenceId : undefined;

  return <>
    <header className="admin-header"><div><p className="eyebrow">Asset management</p><h1>Media</h1><p>Validated files are stored outside the public application directory and delivered through controlled URLs.</p></div></header>
    <section className="admin-panel"><MediaUploadForm conferences={conferences} selectedConferenceId={selectedConferenceId} /></section>
    <section className="admin-panel">
      <h2>Media library</h2>
      {assets.length ? <div className="responsive-table"><table><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Association</th><th>Created</th><th>URL</th></tr></thead><tbody>
        {assets.map((asset) => <tr key={asset.id}><td><strong>{asset.originalName}</strong>{asset.altText && <small>{asset.altText}</small>}</td><td>{asset.kind}</td><td>{formatBytes(asset.byteSize)}</td><td>{asset.conference?.title || "Platform media"}</td><td>{asset.createdAt.toLocaleDateString("en")}</td><td><a href={`/media/${asset.id}`} target="_blank" rel="noreferrer">Open</a></td></tr>)}
      </tbody></table></div> : <div className="empty-state"><h2>No media uploaded</h2><p>Upload a validated image or PDF. Files are not committed to Git.</p></div>}
    </section>
  </>;
}
