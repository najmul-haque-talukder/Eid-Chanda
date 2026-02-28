import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EidInsightDashboard } from "@/components/dashboard/EidInsightDashboard";
import { ProfileManager } from "@/components/dashboard/ProfileManager";

export default async function DashboardPage() {
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
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="text-gray-600 mt-1">
        Manage your username and request card details.
      </p>

      <ProfileManager initialProfile={profile} />

      <EidInsightDashboard />
    </div>
  );
}
