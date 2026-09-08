import { ConferenceDirectory, type DirectorySearchParams } from "@/components/public/ConferenceDirectory";
export const metadata = { title: "International Conferences" };
export const dynamic = "force-dynamic";
export default async function InternationalPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  return <ConferenceDirectory searchParams={await searchParams} scope="INTERNATIONAL" heading="International conferences" />;
}
