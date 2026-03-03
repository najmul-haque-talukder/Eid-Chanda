import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RequestCardView } from "@/components/card/RequestCardView";

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const slug = username.trim().toLowerCase();
  if (!slug) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, phone, show_phone, card_quote, payment_methods")
    .eq("username", slug)
    .single();

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-cream py-8 px-4 flex justify-center items-start">
      <RequestCardView profile={profile} />
    </div>
  );
}
