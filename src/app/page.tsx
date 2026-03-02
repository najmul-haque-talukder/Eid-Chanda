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

  // Fetch platform-wide stats
  const [usersCount, duasCount, khamsCount] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("duas").select("*", { count: "exact", head: true }),
    supabase.from("khams").select("*", { count: "exact", head: true }),
  ]);

  let userStats = null;
  if (user) {
    const [sentKhams, receivedKhams] = await Promise.all([
      supabase.from("khams").select("id, delivered_at").eq("sender_id", user.id),
      supabase.from("archive").select("kham_id").eq("user_id", user.id),
    ]);

    userStats = {
      totalSent: sentKhams.data?.length || 0,
      totalReceived: receivedKhams.data?.length || 0,
      unopenedSent: sentKhams.data?.filter(k => !k.delivered_at).length || 0,
    };
  }

  const initialInsights = {
    totalUsers: usersCount.count || 0,
    totalDuas: duasCount.count || 0,
    totalPlatformKhams: khamsCount.count || 0,
    ...(userStats || { totalSent: 0, totalReceived: 0, unopenedSent: 0 })
  };

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

      <EidInsightDashboard userId={user?.id} initialInsights={initialInsights} />
    </div>
  );
}
