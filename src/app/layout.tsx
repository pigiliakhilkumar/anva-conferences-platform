import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import shellStyles from "@/components/public/PublicShell.module.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://conferences.anvapublishing.com"),
  title: { default: "ANVA Conferences", template: "%s | ANVA Conferences" },
  description: "Discover academic and scientific conferences hosted through ANVA Conferences.",
  applicationName: "ANVA Conferences",
  openGraph: { siteName: "ANVA Conferences", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={shellStyles.body}><PublicShell>{children}</PublicShell></body></html>;
}
