import Link from "next/link";
import { EmptyState, publicStyles as styles } from "@/components/public/PublicUI";
export default function ConferenceNotFound() { return <div className={`${styles.container} ${styles.section}`}><EmptyState title="Conference not found">This conference is unavailable or is not currently published. <Link href="/conferences">Browse public conferences</Link>.</EmptyState></div>; }
