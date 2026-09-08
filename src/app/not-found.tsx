import Link from "next/link";
import { EmptyState, publicStyles as styles } from "@/components/public/PublicUI";
export default function NotFound() { return <div className={`${styles.container} ${styles.section}`}><EmptyState title="Page not found">The requested page could not be found. <Link href="/">Return to the homepage</Link>.</EmptyState></div>; }
