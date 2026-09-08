import Link from "next/link";
import { PageHeader, publicStyles as styles } from "@/components/public/PublicUI";
export const metadata = { title: "Help" };
export default function HelpPage() { return <><PageHeader eyebrow="Platform guide" title="Help using ANVA Conferences">Find the right event information and understand what is available in Phase 1.</PageHeader><div className={`${styles.narrow} ${styles.content}`}>
  <h2>Finding conferences</h2><p>Start in the <Link href="/conferences">conference directory</Link>. Search by title, acronym or subject, then narrow the results by discipline, delivery format, event type, year or location. You can also browse <Link href="/international">international</Link>, <Link href="/national">national</Link>, <Link href="/conferences/upcoming">upcoming</Link> or <Link href="/conferences/past">past</Link> events.</p>
  <h2>Understanding conference pages</h2><p>Each published microsite shows the information currently supplied for that event. Available sections may include important dates, tracks, submission guidance, registration information, speakers, committees, programme, venue, travel, accommodation, sponsors, documents, announcements and FAQs.</p>
  <h2>Important dates</h2><p>Dates are presented chronologically. Passed dates are identified on conference pages. Confirm timezone-sensitive requirements in the organizer-supplied guidance or with the conference contact.</p>
  <h2>Registration and submissions</h2><p>Phase 1 presents organizer-supplied registration and submission information. Participant accounts, direct submissions, payments and workflow tracking are not currently available on the public platform.</p>
  <h2>Contacting a conference</h2><p>Use the contact section on the relevant conference page whenever possible. For general platform support, write to <a href="mailto:contact@anvapublishing.com">contact@anvapublishing.com</a>.</p>
</div></>; }
