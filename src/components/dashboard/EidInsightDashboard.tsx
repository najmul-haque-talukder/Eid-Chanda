"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Insights = {
    totalSent: number;
    totalReceived: number;
    unopenedSent: number;
    totalUsers: number;
    totalDuas: number;
    totalPlatformKhams: number;
};

export function EidInsightDashboard({ userId }: { userId?: string }) {
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInsights() {
            const supabase = createClient();

            // Prepare promises for data fetching
            const promises: Promise<any>[] = [
                supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true }),
                supabase
                    .from("duas")
                    .select("id", { count: "exact", head: true }),
                supabase
                    .from("khams")
                    .select("id", { count: "exact", head: true })
            ];

            // Only fetch user-specific stats if userId is provided
            if (userId) {
                promises.push(
                    supabase
                        .from("khams")
                        .select("id, amount, delivered_at")
                        .eq("sender_id", userId),
                    supabase
                        .from("archive")
                        .select("kham_id")
                        .eq("user_id", userId)
                );
            }

            const results = await Promise.all(promises);

            const usersRes = results[0];
            const duasRes = results[1];
            const platformKhamsRes = results[2];

            let userStats = { totalSent: 0, totalReceived: 0, unopenedSent: 0 };

            if (userId && results.length >= 5) {
                const sentRes = results[3];
                const receivedRes = results[4];
                const sentKhams = sentRes.data || [];
                const receivedParams = receivedRes.data || [];

                let unopened = 0;
                sentKhams.forEach((k: any) => {
                    if (!k.delivered_at) unopened++;
                });

                userStats = {
                    totalSent: sentKhams.length,
                    totalReceived: receivedParams.length,
                    unopenedSent: unopened
                };
            }

            setInsights({
                ...userStats,
                totalUsers: usersRes.count || 0,
                totalDuas: duasRes.count || 0,
                totalPlatformKhams: platformKhamsRes.count || 0,
            });
            setLoading(false);
        }
        loadInsights();
    }, [userId]);

    if (loading) return (
        <div className="mt-8 space-y-4">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Platform Overview - Visible to everyone */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <i className="fa-solid fa-earth-asia text-[#E2136E] text-sm"></i>
                    Platform Insights
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-pink-50 text-[#E2136E] rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-users text-xs"></i>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{insights?.totalUsers.toLocaleString()}</p>
                    </div>

                    {/* Total Duas */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-person-praying text-xs"></i>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Duas</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{insights?.totalDuas.toLocaleString()}</p>
                    </div>

                    {/* Cards Shared */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cards Shared</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{insights?.totalPlatformKhams.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* User Specific Activity - Only visible if logged in */}
            {userId && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line text-primary text-sm"></i>
                        Your Stats
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white border border-primary/10 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Total Sent</p>
                            <p className="text-2xl font-black text-primary">{insights?.totalSent}</p>
                        </div>
                        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-black text-green-600/60 uppercase tracking-widest mb-1">Received</p>
                            <p className="text-2xl font-black text-green-600">{insights?.totalReceived}</p>
                        </div>
                        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm col-span-2 lg:col-span-1">
                            <p className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest mb-1">Unopened</p>
                            <p className="text-2xl font-black text-orange-600">{insights?.unopenedSent}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
