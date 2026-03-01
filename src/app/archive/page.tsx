import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArchiveSection } from "@/components/archive/ArchiveSection";
import type { Kham } from "@/types/database";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: archiveRows } = await supabase
    .from("archive")
    .select("kham_id, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  const khamIds = (archiveRows ?? []).map((r) => r.kham_id);
  const { data: khams } =
    khamIds.length > 0
      ? await supabase.from("khams").select("*").in("id", khamIds)
      : { data: [] as Kham[] };

  const byYear: Record<string, Kham[]> = {};
  (khams ?? []).forEach((k) => {
    const y = new Date(k.created_at).getFullYear();
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(k);
  });
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
      <p className="text-gray-600 mt-1 font-bangla">
        Your saved Khāms, grouped by Eid year.
      </p>

      <div className="mt-8 space-y-8">
        {years.length === 0 && (
          <p className="text-gray-500">
            No Khāms in archive yet. Open a Khām and save it to add here.
          </p>
        )}
        {years.map((year) => (
          <ArchiveSection key={year} year={year} khams={byYear[year] ?? []} />
        ))}
      </div>
    </div>
  );
}
