import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { KhamEnvelopeExperience } from "@/components/kham/KhamEnvelopeExperience";

type Props = { params: Promise<{ slug: string }> };

export default async function KhamOpenPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: kham, error } = await supabase
    .from("khams")
    .select("id, receiver_name, amount, letter_text, anonymous, voice_url, location, scheduled_at, delivered_at, created_at, sender_id, auto_destruct, payment_method, payment_number, slug")
    .eq("slug", slug)
    .single();

  if (error || !kham) {
    if (error) console.error("Kham Fetch Error Details:", JSON.stringify(error, null, 2));
    notFound();
  }

  let senderProfile: any = null;
  if (!kham.anonymous && kham.sender_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url, payment_methods")
      .eq("id", kham.sender_id)
      .single();
    senderProfile = data;
  }

  return (
    <KhamEnvelopeExperience
      kham={{
        ...kham,
        sender_name: senderProfile?.full_name || senderProfile?.username || null,
        sender_avatar: senderProfile?.avatar_url || null,
        sender_payment_methods: senderProfile?.payment_methods || null
      }}
    />
  );
}
