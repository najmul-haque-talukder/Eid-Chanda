"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";

export function HeaderHider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    // Pages that should NOT have the dashboard layout (public views)
    const isPublicPage =
        pathname === "/auth/callback" ||
        pathname?.startsWith("/k/") ||
        (pathname !== "/" && !["/send", "/sent", "/received", "/friends", "/messages", "/dua-wall", "/public-dua", "/about", "/card", "/archive"].includes(pathname));

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col md:flex-row pb-16 md:pb-0">
            <DashboardSidebar user={user} />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex justify-center">
                <div className="w-full max-w-2xl mx-auto mt-6 md:mt-10 mb-20">
                    {children}
                </div>
            </main>
            <DashboardRightSidebar />
        </div>
    );
}
