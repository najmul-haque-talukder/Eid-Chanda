"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Insights = {
    totalSent: number;
    totalReceived: number;
    unopenedSent: number;
    totalAmountSent: number;
    totalAmountReceived: number;
};

export function EidInsightDashboard() {
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInsights() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: sentKhams } = await supabase
                .from("khams")
                .select("id, amount, delivered_at")
                .eq("sender_id", user.id);

            const { data: receivedParams } = await supabase
                .from("archive")
                .select("kham_id, khams(amount)")
                .eq("user_id", user.id);

            let totalSentAmount = 0;
            let unopened = 0;

            sentKhams?.forEach(k => {
                totalSentAmount += parseInt(k.amount) || 0;
                if (!k.delivered_at) unopened++;
            });

            let totalReceivedAmount = 0;
            receivedParams?.forEach(r => {
                // @ts-ignore
                totalReceivedAmount += parseInt(r.khams?.amount) || 0;
            });

            setInsights({
                totalSent: sentKhams?.length || 0,
                totalReceived: receivedParams?.length || 0,
                unopenedSent: unopened,
                totalAmountSent: totalSentAmount,
                totalAmountReceived: totalReceivedAmount,
            });
            setLoading(false);
        }
        loadInsights();
    }, []);

    if (loading) return <div className="animate-pulse bg-gray-100 h-32 rounded-xl mt-6"></div>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Eid Insights Dashboard <i className="fa-solid fa-chart-line text-primary text-sm"></i>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Sent</p>
                    <p className="text-2xl font-bold text-primary">{insights?.totalSent}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Received</p>
                    <p className="text-2xl font-bold text-green-600">{insights?.totalReceived}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Unopened Sent</p>
                    <p className="text-2xl font-bold text-orange-600">{insights?.unopenedSent}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center col-span-2 md:col-span-3 mt-2 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Salami Balance</p>
                    <div className="flex justify-around items-center mt-2">
                        <div>
                            <p className="text-xs text-red-500 line-through">Sent ৳{insights?.totalAmountSent}</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-green-600">Got ৳{insights?.totalAmountReceived}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
