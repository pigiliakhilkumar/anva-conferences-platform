import Link from "next/link";
import { db } from "@/lib/db";
import { PUBLIC_STATUSES } from "@/lib/conferences";
import { ConferenceCard, EmptyState, SectionHeading, formatDate, formatEnum, publicStyles as styles } from "@/components/public/PublicUI";
import { SubscribeForm } from "@/components/public/SubscribeForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();
  const [featured, upcoming, international, national, categories, deadlines, posts] = await Promise.all([
    db.conference.findMany({ where: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null }, featured: true }, include: { categories: { include: { category: true } } }, orderBy: { startDate: "asc" }, take: 3 }),
    db.conference.findMany({ where: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null }, endDate: { gte: now } }, include: { categories: { include: { category: true } } }, orderBy: { startDate: "asc" }, take: 3 }),
    db.conference.findMany({ where: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null }, scope: "INTERNATIONAL", endDate: { gte: now } }, include: { categories: { include: { category: true } } }, orderBy: { startDate: "asc" }, take: 3 }),
    db.conference.findMany({ where: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null }, scope: "NATIONAL", endDate: { gte: now } }, include: { categories: { include: { category: true } } }, orderBy: { startDate: "asc" }, take: 3 }),
    db.category.findMany({ where: { conferences: { some: { conference: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null } } } } }, orderBy: { name: "asc" }, take: 15 }),
    db.importantDate.findMany({ where: { date: { gte: now }, conference: { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null } } }, include: { conference: true }, orderBy: { date: "asc" }, take: 6 }),
    db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return <>
    <section className={styles.hero}>
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div><p className={styles.eyebrow}>Academic &amp; Scientific Conferences</p><h1>Ideas meet. Disciplines connect.</h1><p>Discover clear, current information for conferences hosted on ANVA Conferences—a scholarly events initiative of ANVA Publishing.</p>
          <form className={styles.search} action="/conferences"><label className={styles.srOnly} htmlFor="hero-search">Search conferences</label><input id="hero-search" name="q" type="search" placeholder="Search by title, acronym, discipline or place" /><button>Search conferences</button></form>
        </div>
        <aside className={styles.heroAside}><h2>Find the right event</h2><p>Explore international and national events across physical, virtual and hybrid formats.</p><Link className={styles.button} href="/conferences/upcoming">Browse upcoming</Link></aside>
      </div>
    </section>

    <section className={styles.section}><div className={styles.container}><SectionHeading eyebrow="Selected events" title="Featured conferences" href="/conferences" />{featured.length ? <div className={styles.grid3}>{featured.map(c => <ConferenceCard key={c.id} conference={c} />)}</div> : <EmptyState title="No featured conferences">Featured conferences will appear here when they are published.</EmptyState>}</div></section>
    <section className={styles.sectionAlt}><div className={styles.container}><SectionHeading eyebrow="Plan ahead" title="Upcoming conferences" href="/conferences/upcoming" />{upcoming.length ? <div className={styles.grid3}>{upcoming.map(c => <ConferenceCard key={c.id} conference={c} />)}</div> : <EmptyState title="No upcoming conferences">No upcoming conferences are currently published. Please check again later.</EmptyState>}</div></section>
    <section className={styles.section}><div className={styles.container}><div className={styles.grid2}>
      <div><SectionHeading eyebrow="Across borders" title="International" href="/international" />{international.length ? international.slice(0, 2).map(c => <ConferenceCard key={c.id} conference={c} />) : <EmptyState title="No international conferences">No international conferences are currently published.</EmptyState>}</div>
      <div><SectionHeading eyebrow="Within country" title="National" href="/national" />{national.length ? national.slice(0, 2).map(c => <ConferenceCard key={c.id} conference={c} />) : <EmptyState title="No national conferences">No national conferences are currently published.</EmptyState>}</div>
    </div></div></section>
    <section className={styles.sectionAlt}><div className={styles.container}><SectionHeading eyebrow="Disciplines" title="Browse by subject" />{categories.length ? <div className={styles.grid3}>{categories.map(category => <Link className={styles.card} key={category.id} href={`/conferences?category=${category.slug}`}><strong>{category.name}</strong><span aria-hidden="true"> →</span></Link>)}</div> : <EmptyState title="Categories will appear here">Disciplines become available as published conferences are categorized.</EmptyState>}</div></section>
    <section className={styles.section}><div className={styles.container}><SectionHeading eyebrow="Dates to note" title="Important upcoming deadlines" />{deadlines.length ? <div>{deadlines.map(item => <div className={styles.deadline} key={item.id}><div><strong>{item.type === "CUSTOM" ? item.customLabel : formatEnum(item.type)}</strong><br /><Link href={`/conferences/${item.conference.slug}`}>{item.conference.title}</Link></div><time dateTime={item.date.toISOString()}>{formatDate(item.date)}</time></div>)}</div> : <EmptyState title="No upcoming deadlines">Deadlines will appear when published conferences add them.</EmptyState>}</div></section>
    <section className={styles.sectionAlt}><div className={styles.container}><div className={styles.grid2}><div><SectionHeading eyebrow="Why participate" title="A clear path to scholarly exchange" /><ul className={styles.featureList}><li><strong>Discover relevant events</strong><br />Search across disciplines, formats and locations.</li><li><strong>Plan with confidence</strong><br />Review organizer-supplied dates, tracks and practical information.</li><li><strong>Connect across formats</strong><br />Explore physical, virtual and hybrid conferences.</li></ul></div><div><SectionHeading eyebrow="Conference formats" title="Designed for every setting" /><div className={styles.grid3}><div className={styles.card}><h3>Physical</h3><p>In-person scholarly events at a stated venue.</p></div><div className={styles.card}><h3>Virtual</h3><p>Online events with access information supplied by organizers.</p></div><div className={styles.card}><h3>Hybrid</h3><p>Events combining in-person and online participation.</p></div></div></div></div></div></section>
    <section className={styles.section}><div className={styles.container}><SectionHeading eyebrow="News" title="Latest announcements" href="/blog" />{posts.length ? <div className={styles.grid3}>{posts.map(post => <article className={styles.card} key={post.id}><p className={styles.meta}>{post.publishedAt && formatDate(post.publishedAt)}</p><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p></article>)}</div> : <EmptyState title="No news published">Published platform news and announcements will appear here.</EmptyState>}</div></section>
    <section className={styles.section} id="newsletter"><div className={styles.container}><div className={styles.newsletter}><h2>Conference updates</h2><p>Subscribe to be included in the ANVA Conferences newsletter list. Email delivery may be introduced separately.</p><SubscribeForm /></div></div></section>
  </>;
}
