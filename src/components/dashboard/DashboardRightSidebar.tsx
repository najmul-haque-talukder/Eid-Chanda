"use client";

import { useLanguage } from "@/lib/redux/LanguageSync";
import Link from "next/link";
import { BookOpen, UserPlus, LogOut } from "lucide-react";

export function DashboardRightSidebar() {
    const { t, lang } = useLanguage();

    return (
        <aside className="hidden xl:flex w-72 shrink-0 border-l border-cream-dark bg-white flex-col h-screen sticky top-0 p-6 overflow-y-auto">

            {/* Banner Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 shadow-lg text-white mb-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                <h3 className="font-bold text-xl mb-1 font-bangla">
                    {lang === 'bn' ? 'ঈদ মোবারক!' : 'Eid Mubarak!'}
                </h3>
                <p className="text-sm text-white mb-5 leading-relaxed drop-shadow-sm font-medium">
                    {lang === 'bn'
                        ? 'ডিজিটাল সালামি কার্ড তৈরি করুন এবং বন্ধুদের সাথে আনন্দ ভাগাভাগি করুন।'
                        : 'Create digital Salami cards and share the joy with your friends.'}
                </p>
                <Link href="/send" className="inline-block bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:-translate-y-0.5 transition">
                    {lang === 'bn' ? 'সালামি পাঠান' : 'Send Salami'}
                </Link>
            </div>

            {/* Suggested Actions */}
            <div className="mb-6">
                <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                    {lang === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}
                </h4>
                <div className="space-y-2">
                    <Link href="/dua-wall" className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{lang === 'bn' ? 'দোয়া লিখুন' : 'Write a Dua'}</p>
                            <p className="text-xs text-gray-500">{lang === 'bn' ? 'সবার কল্যাণে দোয়া করুন' : 'Pray for everyone'}</p>
                        </div>
                    </Link>

                    <Link href="/friends" className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition group">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-100 transition">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{lang === 'bn' ? 'নতুন বন্ধু খুঁজুন' : 'Find Friends'}</p>
                            <p className="text-xs text-gray-500">{lang === 'bn' ? 'নেটওয়ার্ক বাড়ান' : 'Grow your network'}</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Footer / Info */}
            <div className="mt-auto pt-4 border-t border-cream-dark">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-400 font-medium">
                        <p>© 2026 Eid Chanda</p>
                        <p className="mt-1 flex gap-2">
                            <a href="#" className="hover:text-primary transition">{lang === 'bn' ? 'গোপনীয়তা' : 'Privacy'}</a>
                            <span>•</span>
                            <a href="#" className="hover:text-primary transition">{lang === 'bn' ? 'শর্তাবলী' : 'Terms'}</a>
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            const { createClient } = await import("@/lib/supabase/client");
                            await createClient().auth.signOut();
                            window.location.href = "/";
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition flex items-center gap-1.5 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                        <LogOut size={14} />
                        {lang === 'bn' ? 'লগআউট' : 'Logout'}
                    </button>
                </div>
            </div>

        </aside>
    );
}
