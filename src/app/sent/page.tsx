import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { SentKhamRow } from "@/components/kham/SentKhamRow";
import { CheckCircle2, PackageOpen } from "lucide-react";

type Props = { searchParams: Promise<{ created?: string }> };

export const dynamic = "force-dynamic";

export default async function SentPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Ensure profile exists
  let { data: myProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!myProfile) {
    const fallbackName = user.email?.split("@")[0] || "User";
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || fallbackName,
      username: user.user_metadata?.username || (fallbackName + Math.floor(Math.random() * 1000)),
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url
    });
  }

  const { data: khams, error } = await supabase
    .from("khams")
    .select("id, slug, receiver_name, receiver_id, amount, created_at, scheduled_at, delivered_at, letter_text, anonymous, reaction, receiver:profiles!receiver_id(username, full_name, avatar_url)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sent Page Error:", error.message);
  }

  // DIAGNOSTIC
  console.log(`DIAGNOSTIC - Sent Page for User ${user.id}: Found ${khams?.length || 0} items`);

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const createdSlug = (await searchParams).created;

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900 font-bangla">পাঠানো খাম (Sent)</h1>
      <p className="text-gray-500 mt-1 font-bangla text-lg">আপনার পাঠানো সব সালামি কার্ড এবং অনুরোধ এখানে থাকবে।</p>

      {createdSlug && (
        <div className="mt-6 p-6 rounded-[2rem] bg-primary/10 border-2 border-primary/20 shadow-xl shadow-primary/5 animate-bounce-short">
          <p className="font-black text-primary flex items-center gap-2">
            <CheckCircle2 size={18} /> Khām created successfully!
          </p>
          <div className="mt-3 flex items-center gap-2 bg-white/60 p-3 rounded-xl border border-primary/10">
            <p className="text-sm font-bold text-gray-700 break-all select-all">{baseUrl}/k/{createdSlug}</p>
          </div>
          <p className="text-xs font-bold text-primary/60 mt-2 uppercase tracking-widest">Share this link to receive Salami</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {!khams?.length && (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-cream-dark shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-cream rounded-full mx-auto flex items-center justify-center text-primary/30 text-2xl">
              <PackageOpen size={32} />
            </div>
            <p className="text-gray-500 font-bangla text-lg italic">আপনি এখনো কোনো খাম পাঠাননি।</p>
            <Link href="/send" className="inline-block bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              প্রথম খাম পাঠান
            </Link>
          </div>
        )}
        {khams?.filter(k => k.slug).map((k: any) => {
          const khamData = {
            ...k,
            receiver: Array.isArray(k.receiver) ? k.receiver[0] : k.receiver
          };
          return <SentKhamRow key={k.id} kham={khamData} baseUrl={baseUrl} />;
        })}
      </div>
    </div>
  );
}
