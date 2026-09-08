import { PageHeader, publicStyles as styles } from "@/components/public/PublicUI";
export const metadata = { title: "Frequently Asked Questions" };
const questions = [
  ["How do I find a conference?", "Use the conference directory to search by keyword and filter by discipline, format, event type, year or location. International and national conference listings are also available separately."],
  ["Where does the conference information come from?", "Conference details are entered and maintained by authorized administrators. A conference appears publicly only after it is published."],
  ["How can I find submission requirements?", "When supplied, call-for-papers and submission guidance appears on the individual conference page. If it is not shown, contact the conference using the details on that page."],
  ["Can I submit a paper through this site?", "Direct participant submission workflows are not available in Phase 1. Refer to the published guidance on the relevant conference page."],
  ["How do I register or pay?", "Conference pages may publish registration categories and fees for information. Online registration and payment processing are not currently available unless a conference explicitly supplies an external route."],
  ["Are dates and fees the same for every conference?", "No. Important dates, eligibility, fees and participation arrangements are conference-specific. Always review the relevant conference page."],
  ["Who should I contact?", "Use the conference-specific contact information for event questions. General platform enquiries can be sent to contact@anvapublishing.com, and scientific or editorial correspondence to editorial@anvapublishing.com."],
];
export default function FaqPage() { return <><PageHeader eyebrow="Answers" title="Frequently asked questions">Practical answers about discovering conferences and using the current platform.</PageHeader><div className={`${styles.narrow} ${styles.content}`}>{questions.map(([q,a]) => <details className={styles.card} key={q}><summary><strong>{q}</strong></summary><p>{a}</p></details>)}</div></>; }
