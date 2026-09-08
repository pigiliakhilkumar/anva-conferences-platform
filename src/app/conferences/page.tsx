import { ConferenceDirectory, type DirectorySearchParams } from "@/components/public/ConferenceDirectory";

export const metadata = { title: "Conferences", description: "Search published academic and scientific conferences." };
export const dynamic = "force-dynamic";
export default async function ConferencesPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  return <ConferenceDirectory searchParams={await searchParams} />;
}
