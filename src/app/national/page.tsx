import { ConferenceDirectory, type DirectorySearchParams } from "@/components/public/ConferenceDirectory";
export const metadata = { title: "National Conferences" };
export const dynamic = "force-dynamic";
export default async function NationalPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  return <ConferenceDirectory searchParams={await searchParams} scope="NATIONAL" heading="National conferences" />;
}
