"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageContext";
import type { User } from "@supabase/supabase-js";

const nav = [
  { href: "/dashboard", labelKey: "dashboard.profile", icon: <i className="fa-solid fa-user fa-fw"></i> },
  { href: "/dashboard/send", labelKey: "dashboard.send", icon: <i className="fa-solid fa-paper-plane fa-fw"></i> },
  { href: "/dashboard/sent", labelKey: "dashboard.sent", icon: <i className="fa-solid fa-box-open fa-fw"></i> },
  { href: "/dashboard/received", labelKey: "dashboard.received", icon: <i className="fa-solid fa-inbox fa-fw"></i> },
  { href: "/dashboard/friends", labelKey: "dashboard.friends", icon: <i className="fa-solid fa-users fa-fw"></i> },
  { href: "/dashboard/messages", labelKey: "dashboard.messages", icon: <i className="fa-solid fa-comment-dots fa-fw"></i> },
  { href: "/dashboard/dua-wall", labelKey: "dashboard.duawall", icon: <i className="fa-solid fa-person-praying fa-fw"></i> },
];

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    // 1. Fetch initial unread count
    async function fetchUnread() {
      const supabase = createClient();
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      if (count !== null) setUnreadCount(count);
    }
    fetchUnread();

    // 2. Subscribe to realtime changes
    const supabase = createClient();
    const sub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, payload => {
        if (payload.new && !payload.new.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, payload => {
        if (payload.old && payload.new && !payload.old.is_read && payload.new.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user.id]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark flex items-center justify-around z-50 pb-safe">
        {nav.map(({ href, labelKey, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full py-4 transition-all ${pathname === href ? "text-primary border-t-2 border-primary -mt-[2px]" : "text-gray-500 hover:text-gray-900"}`}
          >
            <span className="text-xl relative">
              {icon}
              {href === '/dashboard/messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                  {unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium mt-1 truncate max-w-[60px] text-center">{t[labelKey]}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-cream-dark sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logos/main_logo.png" className="h-8 object-contain" alt="Eid Chanda" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          <p className="font-bold text-primary hidden text-xl font-bangla">ঈদ চান্দা</p>
        </div>
        <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="text-xs font-bold bg-cream px-3 py-1.5 rounded-full border border-cream-dark text-primary">
          {t["dashboard.toggleLang"]}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-cream-dark bg-white flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-cream-dark relative">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logos/main_logo.png" className="h-10 object-contain drop-shadow-sm" alt="Eid Chanda" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <p className="font-bold text-primary hidden text-2xl font-bangla tracking-wide">ঈদ চান্দা</p>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1 bg-cream-dark/30 p-2 rounded-lg font-mono">{user.email}</p>
          <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="absolute top-6 right-4 text-[10px] font-bold bg-cream px-2 py-1 rounded-full border border-cream-dark text-primary hover:bg-primary hover:text-white transition">
            {t["dashboard.toggleLang"]}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(({ href, labelKey, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${pathname === href
                ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                : "text-gray-600 hover:bg-cream hover:text-primary"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span>{t[labelKey]}</span>
              </div>
              {href === '/dashboard/messages' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-cream-dark bg-white">
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>{t["dashboard.logout"]}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
