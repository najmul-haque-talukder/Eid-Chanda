"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "bn" | "en";

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: Record<string, string>;
}

const translations: Record<Lang, Record<string, string>> = {
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
    }
};

const LanguageContext = createContext<LanguageContextType>({
    lang: "bn",
    setLang: () => { },
    t: translations.bn,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("bn");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("eid_lang") as Lang;
        if (saved === "en" || saved === "bn") {
            setLangState(saved);
        }
        setMounted(true);
    }, []);

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem("eid_lang", newLang);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
            {mounted ? children : (
                <div className="fixed inset-0 bg-cream flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
