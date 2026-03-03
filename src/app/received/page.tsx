import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InteractiveKhamCard } from "@/components/kham/InteractiveKhamCard";
import { MailOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceivedPage() {
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

  // Fetch khams where this user is the receiver
  const { data: khams, error } = await supabase
    .from("khams")
    .select("id, slug, receiver_name, receiver_id, amount, created_at, scheduled_at, delivered_at, letter_text, anonymous, reaction, payment_method, payment_number, sender:profiles!sender_id(full_name, username, avatar_url, payment_methods)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Received Page Error:", error.message);
  }

  // DIAGNOSTIC
  const { data: allKhams } = await supabase.from("khams").select("id, receiver_id, sender_id").limit(5);
  console.log(`DIAGNOSTIC - Total Raw Khams (limit 5):`, allKhams);
  console.log(`DIAGNOSTIC - Received Page for User ${user.id}: Found ${khams?.length || 0} items`);

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
