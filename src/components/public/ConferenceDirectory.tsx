import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ConferenceCard, EmptyState, PageHeader, publicStyles as styles } from "./PublicUI";

export type DirectorySearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export async function ConferenceDirectory({
  searchParams, scope, temporal, heading = "Conference directory",
}: {
  searchParams: DirectorySearchParams;
  scope?: "INTERNATIONAL" | "NATIONAL";
  temporal?: "upcoming" | "past";
  heading?: string;
}) {
  const q = one(searchParams.q)?.trim();
  const category = one(searchParams.category);
  const mode = one(searchParams.mode);
  const eventType = one(searchParams.eventType);
  const year = Number(one(searchParams.year));
  const location = one(searchParams.location)?.trim();
  const status = one(searchParams.status);
  const page = Math.max(1, Number(one(searchParams.page)) || 1);
  const now = new Date();
  const where: Prisma.ConferenceWhereInput = {
    status: { in: status === "ongoing" ? ["ONGOING"] : status === "completed" ? ["COMPLETED"] : ["PUBLISHED", "ONGOING", "COMPLETED"] },
    publishedAt: { not: null },
    ...(scope ? { scope } : {}),
    ...(mode && ["PHYSICAL", "VIRTUAL", "HYBRID"].includes(mode) ? { deliveryMode: mode as "PHYSICAL" | "VIRTUAL" | "HYBRID" } : {}),
    ...(eventType ? { eventType: eventType as never } : {}),
    ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
    ...(location ? { OR: [{ city: { contains: location } }, { region: { contains: location } }, { country: { contains: location } }, { venueName: { contains: location } }] } : {}),
  };
  if (q) where.AND = [{ OR: [{ title: { contains: q } }, { acronym: { contains: q } }, { shortDescription: { contains: q } }, { categories: { some: { category: { name: { contains: q } } } } }] }];
  if (temporal === "upcoming") where.endDate = { gte: now };
  if (temporal === "past") where.endDate = { lt: now };
  if (year >= 2000 && year <= 2200) {
    const yearRange = { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
    where.startDate = temporal === "upcoming" ? { ...yearRange, gte: now > yearRange.gte ? now : yearRange.gte } : yearRange;
  }
  const [conferences, total, categories] = await Promise.all([
    db.conference.findMany({ where, include: { categories: { include: { category: true } } }, orderBy: { startDate: temporal === "past" ? "desc" : "asc" }, skip: (page - 1) * 12, take: 12 }),
    db.conference.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 12));
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => { if (typeof value === "string" && key !== "page") params.set(key, value); });
    params.set("page", String(target));
    return `?${params.toString()}`;
  };

  return <>
    <PageHeader eyebrow="Discover" title={heading}>Search published academic and scientific conferences by discipline, format, date and location.</PageHeader>
    <section className={styles.section}><div className={styles.container}>
      <form className={styles.filters}>
        <label><span>Keyword or title</span><input className={styles.input} name="q" type="search" defaultValue={q} placeholder="Title, acronym, discipline" /></label>
        <label><span>Discipline</span><select className={styles.select} name="category" defaultValue={category ?? ""}><option value="">All disciplines</option>{categories.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
        <label><span>Format</span><select className={styles.select} name="mode" defaultValue={mode ?? ""}><option value="">All formats</option><option value="PHYSICAL">Physical</option><option value="VIRTUAL">Virtual</option><option value="HYBRID">Hybrid</option></select></label>
        <label><span>Year</span><input className={styles.input} name="year" inputMode="numeric" defaultValue={Number.isFinite(year) && year ? year : ""} placeholder="e.g. 2027" /></label>
        <label><span>Location</span><input className={styles.input} name="location" defaultValue={location} placeholder="City or country" /></label>
        <label><span>Event type</span><select className={styles.select} name="eventType" defaultValue={eventType ?? ""}><option value="">All event types</option>{["CONFERENCE", "CONGRESS", "SYMPOSIUM", "SUMMIT", "WORKSHOP", "SEMINAR", "COLLOQUIUM", "OTHER"].map(item => <option key={item} value={item}>{item[0] + item.slice(1).toLowerCase()}</option>)}</select></label>
        {!temporal && <label><span>Lifecycle</span><select className={styles.select} name="status" defaultValue={status ?? ""}><option value="">All public conferences</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></label>}
        <div className={styles.filtersActions}><button className={styles.button} type="submit">Apply filters</button><Link className={`${styles.button} ${styles.buttonSecondary}`} href={scope === "INTERNATIONAL" ? "/international" : scope === "NATIONAL" ? "/national" : temporal ? `/conferences/${temporal}` : "/conferences"}>Reset</Link></div>
      </form>
      <p aria-live="polite">{total} {total === 1 ? "conference" : "conferences"} found</p>
      {conferences.length ? <div className={styles.grid3}>{conferences.map(conference => <ConferenceCard key={conference.id} conference={conference} />)}</div> : <EmptyState title="No conferences match">Try adjusting your filters, or check again as new conferences are published.</EmptyState>}
      {pages > 1 && <nav className={styles.sectionHead} aria-label="Conference result pages"><span>Page {page} of {pages}</span><div>{page > 1 && <Link className={styles.buttonSecondary} href={pageHref(page - 1)}>← Previous</Link>} {page < pages && <Link className={styles.buttonSecondary} href={pageHref(page + 1)}>Next →</Link>}</div></nav>}
    </div></section>
  </>;
}
