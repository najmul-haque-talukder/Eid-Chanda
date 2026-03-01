import { createClient } from "@/lib/supabase/server";
import { ProfileManager } from "@/components/dashboard/ProfileManager";
import { EidInsightDashboard } from "@/components/dashboard/EidInsightDashboard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        {user ? "My Profile" : "Guest Profile"}
      </h1>
      <p className="text-gray-600 mt-1">
        {user
          ? "Manage your username and request card details."
          : "Please log in to manage your profile and request cards."}
      </p>

      <ProfileManager initialProfile={profile} user={user} />

      {user && <EidInsightDashboard />}
    </div>
  );
}
