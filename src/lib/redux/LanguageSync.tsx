"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setLang } from "@/lib/redux/slices/uiSlice";
import { useEffect, useState, ReactNode } from "react";

export const translations: Record<string, Record<string, string>> = {
    en: {
        "dashboard.profile": "My Profile",
        "dashboard.send": "Send Khām",
        "dashboard.sent": "Sent",
        "dashboard.received": "Received",
        "dashboard.friends": "Friends",
        "dashboard.messages": "Messages",
        "dashboard.duawall": "My Dua Wall",
        "dashboard.logout": "Logout",
        "dashboard.toggleLang": "বাংলা",
        "dashboard.about": "About",
        "dashboard.publicDua": "Public Dua",
        "dashboard.notifications": "Notifications",
        "about.devTitle": "Developer Info",
        "about.devName": "Najmul Haque Talukder",
        "about.devStudies": "Department of Computer Science & Technology, Cumilla Polytechnic Institute",
        "about.portfolio": "Portfolio",
        "about.facebook": "Facebook",
        "about.devBio": "I constantly strive for academic excellence and self-improvement with future goals in mind. Alongside my studies, I am passionate about creative work and traveling. I created the Eid Chanda platform as a fun way to share Eid greetings and collect Salami digitally. Building new things and gaining new experiences always inspires me.",
    },
    bn: {
        "dashboard.profile": "আমার প্রোফাইল",
        "dashboard.send": "খাম পাঠান",
        "dashboard.sent": "পাঠানো খাম",
        "dashboard.received": "প্রাপ্ত খাম",
        "dashboard.friends": "বন্ধুরা",
        "dashboard.messages": "বার্তা",
        "dashboard.duawall": "আমার দোয়া ওয়াল",
        "dashboard.logout": "লগআউট",
        "dashboard.toggleLang": "English",
        "dashboard.about": "সম্পর্কে",
        "dashboard.publicDua": "দোয়া ওয়াল",
        "dashboard.notifications": "নোটিফিকেশন",
        "about.devTitle": "ডেভেলপার সম্পর্কে",
        "about.devName": "নাজমুল হক তালুকদার",
        "about.devStudies": "কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি বিভাগ, কুমিল্লা পলিটেকনিক ইনস্টিটিউট",
        "about.portfolio": "পোর্টফোলিও",
        "about.facebook": "ফেসবুক",
        "about.devBio": "আমি ভবিষ্যৎ লক্ষ্যকে সামনে রেখে নিয়মিত পড়াশোনা ও আত্মউন্নয়নের চেষ্টা করি। পড়াশোনার পাশাপাশি সৃজনশীল কাজ ও ভ্রমণ আমার খুব প্রিয়। মজার ছলে Eid Chanda ওয়েব প্ল্যাটফর্মটি তৈরি করেছি, যেখানে ডিজিটালি ঈদের সালামি পাঠানো যায়। নতুন কিছু বানানো ও নতুন অভিজ্ঞতা অর্জন সবসময় আমাকে অনুপ্রাণিত করে।",
    }
};

export function LanguageSync({ children }: { children: ReactNode }) {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("eid_lang") as "en" | "bn";
        if (saved === "en" || saved === "bn") {
            dispatch(setLang(saved));
        }
        setMounted(true);
    }, [dispatch]);

    if (!mounted) {
        return (
            <div className="fixed inset-0 bg-cream flex items-center justify-center z-[9999]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}

export function useLanguage() {
    const dispatch = useDispatch();
    const lang = useSelector((state: RootState) => state.ui.lang);
    const t = translations[lang] || translations.bn;

    const updateLang = (newLang: "bn" | "en") => {
        dispatch(setLang(newLang));
        localStorage.setItem("eid_lang", newLang);
    };

    return { lang, setLang: updateLang, t };
}
