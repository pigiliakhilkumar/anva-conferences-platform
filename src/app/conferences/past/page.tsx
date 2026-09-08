import { ConferenceDirectory, type DirectorySearchParams } from "@/components/public/ConferenceDirectory";
export const metadata = { title: "Past Conferences" };
export const dynamic = "force-dynamic";
export default async function PastPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  return <ConferenceDirectory searchParams={await searchParams} temporal="past" heading="Past conferences" />;
}
