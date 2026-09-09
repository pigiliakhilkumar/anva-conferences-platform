import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MediaImage, formatDate, formatEnum, publicStyles as styles } from "@/components/public/PublicUI";

const visibleStatuses = ["PUBLISHED", "ONGOING", "COMPLETED"] as const;

async function getConference(slug: string) {
  return db.conference.findFirst({
    where: { slug, status: { in: [...visibleStatuses] }, publishedAt: { not: null } },
    include: {
      logo: true, banner: true,
      categories: { include: { category: true }, orderBy: { primary: "desc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      importantDates: { orderBy: { date: "asc" } },
      tracks: { orderBy: { sortOrder: "asc" } },
      committees: { include: { members: { include: { photo: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      speakers: { include: { photo: true }, orderBy: { sortOrder: "asc" } },
      organizers: { include: { logo: true }, orderBy: { sortOrder: "asc" } },
      fees: { orderBy: { sortOrder: "asc" } },
      programmeItems: { orderBy: [{ day: "asc" }, { sortOrder: "asc" }] },
      programmeSessions: { where: { visibility: "PUBLISHED" }, include: { day: true, room: true, track: true, assignments: { include: { submission: { select: { title: true } }, presenter: { select: { name: true } } }, orderBy: { sequence: "asc" } } }, orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }] },
      sponsors: { include: { logo: true }, orderBy: { sortOrder: "asc" } },
      documents: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      announcements: { where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const conference = await db.conference.findFirst({ where: { slug: (await params).slug, status: { in: [...visibleStatuses] }, publishedAt: { not: null } }, include: { socialImage: true } });
  if (!conference) return { title: "Conference not found" };
  return {
    title: conference.seoTitle || conference.title,
    description: conference.metaDescription || conference.shortDescription,
    alternates: { canonical: `/conferences/${conference.slug}` },
    openGraph: { title: conference.seoTitle || conference.title, description: conference.metaDescription || conference.shortDescription, type: "website", ...(conference.socialImage ? { images: [`/media/${conference.socialImage.id}`] } : {}) },
  };
}

export default async function ConferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const conference = await getConference((await params).slug);
  if (!conference) notFound();
  const configured = new Map(conference.sections.map(section => [section.key.toLowerCase(), section]));
  const show = (key: string, hasContent: boolean) => {
    const section = configured.get(key.toLowerCase());
    return section ? section.enabled && (hasContent || section.showWhenEmpty) : hasContent;
  };
  const callVisible = show("call-for-papers", Boolean(conference.callForPapers));
  const guidelinesVisible = show("submission-guidelines", Boolean(conference.submissionGuidelines));
  const venueVisible = show("venue", Boolean(conference.venueName || conference.venueDescription || conference.virtualInfo));
  const travelVisible = show("travel", Boolean(conference.travelInfo));
  const accommodationVisible = show("accommodation", Boolean(conference.accommodationInfo));
  const nav: { key: string; label: string; visible: boolean }[] = [
    { key: "about", label: "About", visible: show("about", Boolean(conference.about || conference.organizers.length)) },
    { key: "dates", label: "Important dates", visible: show("important-dates", Boolean(conference.importantDates.length)) },
    { key: "tracks", label: "Tracks", visible: show("tracks", Boolean(conference.tracks.length)) },
    { key: "submissions", label: "Submissions", visible: callVisible || guidelinesVisible },
    { key: "registration", label: "Registration", visible: show("registration", Boolean(conference.registrationInfo || conference.fees.length)) },
    { key: "speakers", label: "Speakers", visible: show("speakers", Boolean(conference.speakers.length)) },
    { key: "committees", label: "Committees", visible: show("committees", Boolean(conference.committees.length)) },
    { key: "programme", label: "Programme", visible: show("programme", Boolean(conference.programmeItems.length || conference.programmeSessions.length)) },
    { key: "venue", label: "Venue & travel", visible: venueVisible || travelVisible || accommodationVisible },
    { key: "sponsors", label: "Sponsors", visible: show("sponsors", Boolean(conference.sponsors.length)) },
    { key: "downloads", label: "Downloads", visible: show("downloads", Boolean(conference.documents.length)) },
    { key: "announcements", label: "Announcements", visible: show("announcements", Boolean(conference.announcements.length)) },
    { key: "faq", label: "FAQ", visible: show("faq", Boolean(conference.faqs.length)) },
    { key: "contact", label: "Contact", visible: show("contact", Boolean(conference.contactEmail || conference.contactText)) },
  ];
  const dateRange = `${formatDate(conference.startDate, { day: "numeric", month: "long", year: "numeric" })} – ${formatDate(conference.endDate, { day: "numeric", month: "long", year: "numeric" })}`;
  const location = [conference.venueName, conference.city, conference.region, conference.country].filter(Boolean).join(", ");
  const bannerStyle = conference.banner ? { backgroundImage: `url(/media/${encodeURIComponent(conference.banner.id)})` } : undefined;
  const empty = (text: string) => <p className={styles.notice}>{text}</p>;
  const eventSchema = {
    "@context": "https://schema.org", "@type": "Event", name: conference.title,
    startDate: conference.startDate.toISOString(), endDate: conference.endDate.toISOString(),
    eventAttendanceMode: conference.deliveryMode === "PHYSICAL" ? "https://schema.org/OfflineEventAttendanceMode" : conference.deliveryMode === "VIRTUAL" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled", description: conference.shortDescription,
    ...(location ? { location: { "@type": "Place", name: conference.venueName || conference.city || conference.country, address: [conference.city, conference.region, conference.country].filter(Boolean).join(", ") } } : {}),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema).replaceAll("<", "\\u003c") }} />
    <div className={styles.container}><nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/conferences">Conferences</Link> / <span>{conference.acronym || conference.title}</span></nav></div>
    <header className={styles.conferenceHero} style={bannerStyle}><div className={styles.conferenceHeroInner}>
      <span className={styles.badge}>{formatEnum(conference.scope)} {formatEnum(conference.eventType)}</span>
      <h1>{conference.title}</h1>{conference.theme && <p>{conference.theme}</p>}
      <p><strong>{dateRange}</strong>{location ? ` · ${location}` : ""} · {formatEnum(conference.deliveryMode)}</p>
    </div></header>
    <nav className={styles.localNav} aria-label={`${conference.acronym || conference.title} sections`}><div>{nav.filter(item => item.visible).map(item => <a key={item.key} href={`#${item.key}`}>{item.label}</a>)}</div></nav>
    <div className={`${styles.container} ${styles.content}`}>
      <div className={styles.details}><div>
        <p className={styles.eyebrow}>{conference.acronym || formatEnum(conference.eventType)}</p><p>{conference.shortDescription}</p>
        {nav.find(n => n.key === "about")?.visible && <section id="about"><h2>About the conference</h2>{conference.about ? <p className={styles.prose}>{conference.about}</p> : empty("Further conference information will be published when available.")}{conference.organizers.length > 0 && <><h3>Organizers</h3><div className={styles.grid2}>{conference.organizers.map(item => <article className={styles.card} key={item.id}><MediaImage assetId={item.logoId} alt={item.logo?.altText || `${item.name} logo`} className={styles.logo} /><span className={styles.badge}>{formatEnum(item.type)}</span><h3>{item.url ? <a href={item.url} rel="noopener noreferrer">{item.name}</a> : item.name}</h3>{item.description && <p>{item.description}</p>}</article>)}</div></>}</section>}
        {nav.find(n => n.key === "dates")?.visible && <section id="dates"><h2>Important dates</h2>{conference.importantDates.length ? conference.importantDates.map(item => { const past = item.date < new Date(); return <div className={`${styles.deadline} ${past ? styles.past : ""}`} key={item.id}><div><strong>{item.type === "CUSTOM" ? item.customLabel : formatEnum(item.type)}</strong>{item.notes && <><br /><span>{item.notes}</span></>}</div><time dateTime={item.date.toISOString()}>{formatDate(item.date)}{past ? " · Passed" : ""}</time></div>; }) : empty("Important dates will be published when available.")}</section>}
        {nav.find(n => n.key === "tracks")?.visible && <section id="tracks"><h2>Themes &amp; tracks</h2>{conference.tracks.length ? <div className={styles.grid2}>{conference.tracks.map(item => <article className={styles.card} key={item.id}><h3>{item.title}</h3>{item.description && <p className={styles.prose}>{item.description}</p>}</article>)}</div> : empty("Conference tracks will be announced when available.")}</section>}
        {nav.find(n => n.key === "submissions")?.visible && <section id="submissions"><h2>Call for papers &amp; submissions</h2>{callVisible && conference.callForPapers && <><h3>Call for papers</h3><p className={styles.prose}>{conference.callForPapers}</p></>}{guidelinesVisible && conference.submissionGuidelines && <><h3>Submission guidelines</h3><p className={styles.prose}>{conference.submissionGuidelines}</p></>}{(callVisible || guidelinesVisible) && conference.submissionTypes && <p><strong>Submission types:</strong> {conference.submissionTypes}</p>}<p><span className={styles.badge}>Submissions {formatEnum(conference.submissionState)}</span></p>{!conference.callForPapers && !conference.submissionGuidelines && empty("Submission information will be published when available.")}</section>}
        {nav.find(n => n.key === "registration")?.visible && <section id="registration"><h2>Registration</h2>{conference.registrationInfo && <p className={styles.prose}>{conference.registrationInfo}</p>}{conference.fees.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Category</th><th>Audience</th><th>Tier</th><th>Fee</th><th>Applicability</th></tr></thead><tbody>{conference.fees.map(fee => <tr key={fee.id}><td>{fee.category}</td><td>{fee.audience || "—"}</td><td>{fee.priceTier}</td><td>{fee.currency} {fee.amount.toString()}</td><td>{fee.startsAt ? formatDate(fee.startsAt) : ""}{fee.startsAt && fee.endsAt ? " – " : ""}{fee.endsAt ? formatDate(fee.endsAt) : ""}</td></tr>)}</tbody></table></div> : !conference.registrationInfo && empty("Registration information will be published when available.")}</section>}
        {nav.find(n => n.key === "speakers")?.visible && <section id="speakers"><h2>Speakers</h2>{conference.speakers.length ? <div className={styles.grid2}>{conference.speakers.map(person => <article className={styles.card} key={person.id}><MediaImage assetId={person.photoId} alt={person.photo?.altText || `Portrait of ${person.name}`} className={styles.portrait} /><span className={styles.badge}>{person.type === "OTHER" && person.customType ? person.customType : formatEnum(person.type)}</span><h3>{person.name}</h3><p>{[person.designation, person.affiliation, person.country].filter(Boolean).join(" · ")}</p>{person.talkTitle && <p><strong>Talk:</strong> {person.talkTitle}</p>}{person.biography && <p className={styles.prose}>{person.biography}</p>}{person.profileUrl && <a href={person.profileUrl} rel="noopener noreferrer">View profile ↗</a>}</article>)}</div> : empty("No speakers have been announced.")}</section>}
        {nav.find(n => n.key === "committees")?.visible && <section id="committees"><h2>Committees</h2>{conference.committees.length ? conference.committees.map(group => <div key={group.id}><h3>{group.name}</h3>{group.description && <p>{group.description}</p>}{group.members.length ? <div className={styles.grid2}>{group.members.map(person => <article className={styles.card} key={person.id}><MediaImage assetId={person.photoId} alt={person.photo?.altText || `Portrait of ${person.name}`} className={styles.portrait} /><h3>{person.name}</h3><p>{[person.role, person.affiliation, person.country].filter(Boolean).join(" · ")}</p>{person.biography && <p className={styles.prose}>{person.biography}</p>}</article>)}</div> : empty("Committee members will be listed when confirmed.")}</div>) : empty("Committee details will be published when available.")}</section>}
        {nav.find(n => n.key === "programme")?.visible && <section id="programme"><h2>Programme</h2>{conference.programmeSessions.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Day</th><th>Time</th><th>Session</th><th>Location</th></tr></thead><tbody>{conference.programmeSessions.map(s => <tr key={s.id}><td>{formatDate(s.day.date)}</td><td>{formatDate(s.startsAt, { hour: "2-digit", minute: "2-digit" })}–{formatDate(s.endsAt, { hour: "2-digit", minute: "2-digit" })}</td><td><strong>{s.title}</strong><small>{s.assignments.map(a => a.submission?.title || a.presenter?.name).filter(Boolean).join(" · ")}</small></td><td>{s.room?.name || "Online"}</td></tr>)}</tbody></table></div> : conference.programmeItems.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Day</th><th>Time</th><th>Session</th><th>Location</th></tr></thead><tbody>{conference.programmeItems.map(item => <tr key={item.id}><td>{formatDate(item.day)}</td><td>{item.startsAt ? formatDate(item.startsAt, { hour: "2-digit", minute: "2-digit" }) : "—"}{item.endsAt ? `–${formatDate(item.endsAt, { hour: "2-digit", minute: "2-digit" })}` : ""}</td><td><strong>{item.title}</strong>{item.description && <><br />{item.description}</>}</td><td>{item.room || "—"}</td></tr>)}</tbody></table></div> : empty("Programme details will be published when available.")}</section>}
        {nav.find(n => n.key === "venue")?.visible && <section id="venue"><h2>Venue &amp; attendance</h2>{venueVisible && location && <p><strong>{location}</strong></p>}{venueVisible && conference.venueDescription && <p className={styles.prose}>{conference.venueDescription}</p>}{venueVisible && conference.virtualInfo && <><h3>Virtual participation</h3><p className={styles.prose}>{conference.virtualInfo}</p></>}{venueVisible && conference.mapUrl && <p><a href={conference.mapUrl} rel="noopener noreferrer">View location ↗</a></p>}{travelVisible && conference.travelInfo && <><h3>Travel information</h3><p className={styles.prose}>{conference.travelInfo}</p></>}{accommodationVisible && conference.accommodationInfo && <><h3>Accommodation information</h3><p className={styles.prose}>{conference.accommodationInfo}</p></>}{!location && !conference.virtualInfo && !conference.travelInfo && !conference.accommodationInfo && empty("Venue and travel information will be published when available.")}</section>}
        {nav.find(n => n.key === "sponsors")?.visible && <section id="sponsors"><h2>Sponsors &amp; supporters</h2>{conference.sponsors.length ? <div className={styles.grid3}>{conference.sponsors.map(item => <article className={styles.card} key={item.id}><MediaImage assetId={item.logoId} alt={item.logo?.altText || `${item.name} logo`} className={styles.logo} /><h3>{item.url ? <a href={item.url} rel="noopener noreferrer">{item.name}</a> : item.name}</h3>{item.tier && <p>{item.tier}</p>}</article>)}</div> : empty("Sponsor and supporter information will be published when available.")}</section>}
        {nav.find(n => n.key === "downloads")?.visible && <section id="downloads"><h2>Downloads</h2>{conference.documents.length ? <div className={styles.grid2}>{conference.documents.map(item => <article className={styles.card} key={item.id}><span className={styles.badge}>{item.documentType}</span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<a href={`/media/${item.mediaId}`} download>Download document</a></article>)}</div> : empty("Conference documents will be added when available.")}</section>}
        {nav.find(n => n.key === "announcements")?.visible && <section id="announcements"><h2>Announcements</h2>{conference.announcements.length ? conference.announcements.map(item => <article key={item.id}><h3>{item.title}</h3>{item.publishedAt && <p className={styles.meta}>{formatDate(item.publishedAt)}</p>}<p className={styles.prose}>{item.body}</p></article>) : empty("Conference announcements will appear here when published.")}</section>}
        {nav.find(n => n.key === "faq")?.visible && <section id="faq"><h2>Frequently asked questions</h2>{conference.faqs.length ? conference.faqs.map(item => <details className={styles.card} key={item.id}><summary><strong>{item.question}</strong></summary><p className={styles.prose}>{item.answer}</p></details>) : empty("Conference-specific answers will be added when available.")}</section>}
        {nav.find(n => n.key === "contact")?.visible && <section id="contact"><h2>Conference contact</h2>{conference.contactName && <p><strong>{conference.contactName}</strong>{conference.contactRole ? `, ${conference.contactRole}` : ""}</p>}{conference.contactEmail && <p><a href={`mailto:${conference.contactEmail}`}>{conference.contactEmail}</a></p>}{conference.contactPhone && <p>{conference.contactPhone}</p>}{conference.contactText && <p className={styles.prose}>{conference.contactText}</p>}{!conference.contactEmail && !conference.contactText && empty("Conference contact details will be published when available.")}</section>}
      </div>{show("key-information", true) && <aside className={styles.sideCard}><MediaImage assetId={conference.logoId} alt={conference.logo?.altText || `${conference.title} logo`} className={styles.logo} /><h2>Key information</h2><dl><dt>Dates</dt><dd>{dateRange}</dd><dt>Format</dt><dd>{formatEnum(conference.deliveryMode)}</dd><dt>Classification</dt><dd>{formatEnum(conference.scope)}</dd><dt>Event type</dt><dd>{conference.eventType === "OTHER" && conference.customEventType ? conference.customEventType : formatEnum(conference.eventType)}</dd>{location && <><dt>Location</dt><dd>{location}</dd></>}{conference.categories.length > 0 && <><dt>Disciplines</dt><dd>{conference.categories.map(item => item.category.name).join(", ")}</dd></>}</dl></aside>}</div>
    </div>
  </>;
}
