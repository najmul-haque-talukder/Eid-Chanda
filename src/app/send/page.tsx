import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SendKhamForm } from "@/components/kham/SendKhamForm";

export default async function SendKhamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const fallbackName = user.email?.split("@")[0] || "User";
    const { data: newProfile } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || fallbackName,
      username: user.user_metadata?.username || (fallbackName + Math.floor(Math.random() * 1000)),
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url
    }).select().single();
    profile = newProfile;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Send Salami Request</h1>
      <p className="text-gray-600 mt-1 font-bangla">
        Search for a username and send them a beautifully crafted Salami Request card!
      </p>
      <SendKhamForm senderId={profile?.id ?? user.id} senderProfile={profile} />
    </div>
  );
}
