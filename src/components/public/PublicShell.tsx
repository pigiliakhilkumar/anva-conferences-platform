"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PublicShell.module.css";

const primaryLinks = [
  ["Conferences", "/conferences"],
  ["International", "/international"],
  ["National", "/national"],
  ["Proceedings", "/proceedings"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Help", "/help"],
  ["Contact", "/contact"],
];

export function PublicShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/workspace") || pathname.startsWith("/account")) return <>{children}</>;
  return <div className={styles.shell}>
    <a className={styles.skip} href="#main-content">Skip to main content</a>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="ANVA Conferences home">
          <strong>ANVA Conferences</strong>
          <span>ACADEMIC &amp; SCIENTIFIC CONFERENCES</span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {primaryLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link className={styles.login} href="/login">Register / Login</Link>
        </nav>
      </div>
    </header>
    <main className={styles.main} id="main-content">{children}</main>
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <section><h2>ANVA Conferences</h2><p>Academic &amp; Scientific Conferences<br />A scholarly events initiative of ANVA Publishing.</p></section>
        <section><h3>Explore</h3><Link href="/conferences/upcoming">Upcoming conferences</Link><Link href="/international">International</Link><Link href="/national">National</Link><Link href="/proceedings">Proceedings</Link></section>
        <section><h3>Support</h3><Link href="/help">Help</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><a href="mailto:contact@anvapublishing.com">contact@anvapublishing.com</a></section>
        <p className={styles.legal}>© {new Date().getFullYear()} ANVA Publishing. Conference information is maintained by authorized administrators.</p>
      </div>
    </footer>
  </div>;
}
