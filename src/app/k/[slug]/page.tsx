import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { KhamEnvelopeExperience } from "@/components/kham/KhamEnvelopeExperience";

type Props = { params: Promise<{ slug: string }> };

export default async function KhamOpenPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: kham } = await supabase
    .from("khams")
    .select("id, receiver_name, amount, letter_text, anonymous, voice_url, location, scheduled_at, delivered_at, created_at, sender_id, reaction, auto_destruct, payment_method, payment_number")
    .eq("slug", slug)
    .single();

  if (!kham) notFound();

  let senderName: string | null = null;
  let senderAvatar: string | null = null;
  if (!kham.anonymous && kham.sender_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url")
      .eq("id", kham.sender_id)
      .single();
    senderName = data?.full_name || data?.username || null;
    senderAvatar = data?.avatar_url || null;
  }

  return (
    <KhamEnvelopeExperience
      kham={{
        ...kham,
        sender_name: senderName,
        sender_avatar: senderAvatar,
      }}
    />
  );
}
