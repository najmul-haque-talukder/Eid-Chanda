import { createClient } from "@/lib/supabase/server";
import { ProfileManager } from "@/components/dashboard/ProfileManager";
import { EidInsightDashboard } from "@/components/dashboard/EidInsightDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  let profile = null;
  if (user) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    } catch (e) {
      console.warn("Failed to fetch user profile:", e);
    }
  }

  // Fetch platform-wide stats with error handling
  let usersCount = { count: 0 };
  let duasCount = { count: 0 };
  let khamsCount = { count: 0 };
  let userStats = { totalSent: 0, totalReceived: 0, unopenedSent: 0 };

  try {
    const [uCount, dCount, kCount] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("duas").select("*", { count: "exact", head: true }),
      supabase.from("khams").select("*", { count: "exact", head: true }),
    ]);

    usersCount = uCount as any;
    duasCount = dCount as any;
    khamsCount = kCount as any;

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
  } catch (e) {
    console.warn("Failed to fetch dashboard stats:", e);
  }

  const initialInsights = {
    totalUsers: usersCount?.count || 0,
    totalDuas: duasCount?.count || 0,
    totalPlatformKhams: khamsCount?.count || 0,
    ...userStats
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
