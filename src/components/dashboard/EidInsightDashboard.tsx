"use client";

import { useState } from "react";
import { Globe, Users, Send, TrendingUp, Inbox, MailOpen } from "lucide-react";

type Insights = {
    totalSent: number;
    totalReceived: number;
    unopenedSent: number;
    totalUsers: number;
    totalDuas: number;
    totalPlatformKhams: number;
};

export function EidInsightDashboard({
    userId,
    initialInsights
}: {
    userId?: string;
    initialInsights: Insights;
}) {
    // We use the initialInsights from the server for instant load
    const insights = initialInsights;

    return (
        <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Platform Overview - Visible to everyone */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Globe size={18} className="text-[#E2136E]" />
                    Platform Insights
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-pink-50 text-[#E2136E] rounded-lg flex items-center justify-center">
                                <Users size={14} />
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{insights?.totalUsers.toLocaleString()}</p>
                    </div>

                    {/* Total Duas */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold">🤲</span>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Duas</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{insights?.totalDuas.toLocaleString()}</p>
                    </div>

                    {/* Cards Shared */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <Send size={14} />
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
                        <TrendingUp size={18} className="text-primary" />
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
