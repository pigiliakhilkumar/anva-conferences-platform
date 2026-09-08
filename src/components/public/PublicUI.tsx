import Link from "next/link";
import styles from "./Public.module.css";

export { styles as publicStyles };

export type ConferenceCardData = {
  slug: string; title: string; acronym: string | null; shortDescription: string;
  scope: string; deliveryMode: string; startDate: Date; endDate: Date;
  city: string | null; country: string | null;
  categories?: { category: { name: string } }[];
};

export function formatDate(value: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", options ?? { day: "numeric", month: "short", year: "numeric" }).format(value);
}

export function formatEnum(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ConferenceCard({ conference }: { conference: ConferenceCardData }) {
  const place = [conference.city, conference.country].filter(Boolean).join(", ") || formatEnum(conference.deliveryMode);
  return <article className={styles.card}>
    <span className={styles.badge}>{formatEnum(conference.scope)}</span>
    <h3><Link href={`/conferences/${conference.slug}`}>{conference.title}</Link></h3>
    <div className={styles.meta}>
      <span>{formatDate(conference.startDate)}–{formatDate(conference.endDate)}</span>
      <span>{place}</span><span>{formatEnum(conference.deliveryMode)}</span>
    </div>
    <p>{conference.shortDescription}</p>
    <Link href={`/conferences/${conference.slug}`} aria-label={`View ${conference.title}`}>Conference details →</Link>
  </article>;
}

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.empty}><div className={styles.statelessIcon} aria-hidden="true">◇</div><h2>{title}</h2><p>{children}</p></div>;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return <header className={styles.pageHead}><div className={styles.container}>{eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}<h1>{title}</h1><p>{children}</p></div></header>;
}

export function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return <div className={styles.sectionHead}><div>{eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}<h2>{title}</h2></div>{href && <Link href={href}>{linkLabel ?? "View all"} →</Link>}</div>;
}

export function MediaImage({ assetId, alt, className }: { assetId?: string | null; alt: string; className?: string }) {
  if (!assetId) return null;
  // Media is served by an access-controlled local-storage route; intrinsic dimensions are optional metadata.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={`/media/${encodeURIComponent(assetId)}`} alt={alt} />;
}
