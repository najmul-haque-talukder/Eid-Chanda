import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { LanguageProvider } from "@/components/LanguageContext";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-cream flex flex-col md:flex-row pb-16 md:pb-0">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex justify-center">
          <div className="w-full max-w-2xl mx-auto mt-6 md:mt-10 mb-20">
            {children}
          </div>
        </main>
        <DashboardRightSidebar />
      </div>
    </LanguageProvider>
  );
}
