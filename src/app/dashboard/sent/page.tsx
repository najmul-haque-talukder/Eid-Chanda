import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SentKhamRow } from "@/components/kham/SentKhamRow";

type Props = { searchParams: Promise<{ created?: string }> };

export default async function SentPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: khams } = await supabase
    .from("khams")
    .select("id, slug, receiver_name, amount, created_at, scheduled_at, delivered_at, reaction, letter_text")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const headersList = await (await import("next/headers")).headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const createdSlug = (await searchParams).created;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Sent</h1>
      <p className="text-gray-600 mt-1">Khāms you sent. Share the link with the receiver.</p>

      {createdSlug && (
        <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30">
          <p className="font-medium text-primary">Khām created!</p>
          <p className="text-sm text-gray-700 mt-1 break-all">{baseUrl}/k/{createdSlug}</p>
          <p className="text-xs text-gray-500 mt-1">Share this link with the receiver.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {!khams?.length && (
          <p className="text-gray-500">No Khāms sent yet. <Link href="/dashboard/send" className="text-primary underline">Send one</Link>.</p>
        )}
        {khams?.filter(k => k.slug).map((k) => (
          <SentKhamRow key={k.id} kham={k} baseUrl={baseUrl} />
        ))}
      </div>
    </div>
  );
}
