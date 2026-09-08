import { ConferenceDirectory, type DirectorySearchParams } from "@/components/public/ConferenceDirectory";
export const metadata = { title: "Upcoming Conferences" };
export const dynamic = "force-dynamic";
export default async function UpcomingPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  return <ConferenceDirectory searchParams={await searchParams} temporal="upcoming" heading="Upcoming conferences" />;
}
