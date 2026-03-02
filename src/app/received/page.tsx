import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InteractiveKhamCard } from "@/components/kham/InteractiveKhamCard";
import { MailOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceivedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch khams where this user is the receiver
  const { data: khams } = await supabase
    .from("khams")
    .select("*, sender:profiles!sender_id(full_name, username, avatar_url, bkash_number, nagad_number, rocket_number, upay_number, dbbl_number)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl animate-in fade-in duration-500 pb-20">
      <h1 className="text-3xl font-black text-gray-900 font-bangla">গৃহীত অনুরোধ (Received)</h1>
      <p className="text-gray-500 mt-1 font-bangla text-lg">আপনার কাছে আসা সব সালামি রিকোয়েস্ট কার্ড এখান থেকেই খুলুন।</p>

      <div className="mt-8 space-y-6">
        {!khams?.length && (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-cream-dark shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-cream rounded-full mx-auto flex items-center justify-center text-primary/30 text-2xl">
              <MailOpen size={32} />
            </div>
            <p className="text-gray-500 font-bangla text-lg italic">আপনার কাছে এখনো কোনো রিকোয়েস্ট আসেনি।</p>
          </div>
        )}
        {khams?.map((k: any) => {
          const khamData = {
            ...k,
            sender: Array.isArray(k.sender) ? k.sender[0] : k.sender
          };
          return <InteractiveKhamCard key={k.id} kham={khamData} />;
        })}
      </div>
    </div>
  );
}
