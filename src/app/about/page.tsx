"use client";

import { useLanguage } from "@/lib/redux/LanguageSync";
import {
    Contact,
    MailOpen,
    Clock,
    Archive,
    Code,
    Globe,
    Facebook
} from "lucide-react";

export default function AboutPage() {
    const { lang, t } = useLanguage();

    return (
        <div className="max-w-2xl animate-fade-in pb-20">
            <div className="bg-white rounded-3xl border border-cream-dark shadow-xl p-8 md:p-12 space-y-10 relative overflow-hidden">
                {/* Decorative Header */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-light"></div>

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary font-bangla">
                        {lang === "bn" ? "ঈদ চান্দা সম্পর্কে" : "About Eid Chanda"}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {lang === "bn"
                            ? "ডিজিটাল ঈদ অভিজ্ঞতার এক নতুন দিগন্ত"
                            : "A new horizon for Digital Eid experiences"}
                    </p>
                </div>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                            {lang === "bn" ? "মূল ধারণা" : "The Core Idea"}
                        </h2>
                        <p>
                            {lang === "bn"
                                ? "ঈদ চান্দা হলো একটি ডিজিটাল প্লাটফর্ম যেখানে আপনি আপনার প্রিয়জনদের কাছ থেকে সালামি চাইতে পারেন অথবা ডিজিটাল খাম (বার্তা ও উপহার) পাঠাতে পারেন।"
                                : "Eid Chanda is a digital platform where you can request Salami from your loved ones or send Digital Khāms (messages + gifts)."}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                            {lang === "bn" ? "মূল ফিচারসমূহ" : "Key Features"}
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                {
                                    bn: "সালামি রিকোয়েস্ট কার্ড",
                                    en: "Salami Request Card",
                                    icon: <Contact className="text-primary" />
                                },
                                {
                                    bn: "ডিজিটাল খাম (এনিমেটেড)",
                                    en: "Digital Khām (Animated)",
                                    icon: <MailOpen className="text-primary" />
                                },
                                {
                                    bn: "সালামি শিডিউলিং",
                                    en: "Salami Scheduling",
                                    icon: <Clock className="text-primary" />
                                },
                                {
                                    bn: "ঈদ আর্কাইভ (স্মৃতি)",
                                    en: "Eid Archive (Memories)",
                                    icon: <Archive className="text-primary" />
                                },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 bg-cream/30 p-3 rounded-xl border border-cream-dark/50">
                                    {item.icon}
                                    <span className="font-medium">{lang === "bn" ? item.bn : item.en}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                            {lang === "bn" ? "আমাদের লক্ষ্য" : "Our Goal"}
                        </h2>
                        <p className="text-gray-600">
                            {lang === "bn"
                                ? "আমাদের লক্ষ্য স্রেফ টাকা আদান-প্রদান নয়, বরং ডিজিটাল যুগে ঈদের আনন্দ এবং আবেগকে আরো বাড়িয়ে তোলা।"
                                : "Our goal is not just digital transactions, but enhancing the joy and emotions of Eid in the digital era."}
                        </p>
                    </section>
                </div>

                <section className="pt-12 border-t border-cream-dark space-y-8 mt-4">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4 tracking-tight uppercase">
                            {t["about.devTitle"]}
                        </h2>
                    </div>

                    <div className="bg-white p-0 rounded-none transition-all">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {t["about.devName"]}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    <p className="text-primary font-bold text-sm tracking-wide">
                                        {t["about.devStudies"]}
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-xl">
                                <p className="text-gray-600 font-medium leading-[1.8] text-[0.95rem]">
                                    {t["about.devBio"]}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <a
                                    href="https://najmul-haque-talukder-41.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-700 bg-gray-50 px-5 py-3 rounded-full border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                >
                                    <Globe size={16} />
                                    {t["about.portfolio"]}
                                </a>
                                <a
                                    href="https://www.facebook.com/najmul.9341"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1877F2] bg-[#1877F2]/5 px-5 py-3 rounded-full border border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300"
                                >
                                    <Facebook size={16} />
                                    {t["about.facebook"]}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-8 border-t border-cream-dark text-center">
                    <p className="text-xs text-gray-400 font-mono">
                        v1.0.0 • Developed with ❤️ for the community
                    </p>
                </div>
            </div>
        </div>
    );
}
