import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestCardEditor } from "@/components/card/RequestCardEditor";

export default async function RequestCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Request Card</h1>
      <p className="text-gray-600 mt-1">
        Edit your card. Share the link so people can send you Salami.
      </p>
      <RequestCardEditor profile={profile} userId={user.id} />
    </div>
  );
}
