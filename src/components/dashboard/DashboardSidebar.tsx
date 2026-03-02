"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageContext";
import type { User } from "@supabase/supabase-js";

const mainNav = [
  { href: "/", labelKey: "dashboard.profile", icon: <i className="fa-solid fa-user fa-fw"></i> },
  { href: "/send", labelKey: "dashboard.send", icon: <i className="fa-solid fa-paper-plane fa-fw"></i> },
  { href: "/sent", labelKey: "dashboard.sent", icon: <i className="fa-solid fa-box-open fa-fw"></i> },
  { href: "/received", labelKey: "dashboard.received", icon: <i className="fa-solid fa-inbox fa-fw"></i> },
  { href: "/friends", labelKey: "dashboard.friends", icon: <i className="fa-solid fa-users fa-fw"></i> },
  { href: "/messages", labelKey: "dashboard.messages", icon: <i className="fa-solid fa-comment-dots fa-fw"></i> },
  { href: "/public-dua", labelKey: "dashboard.publicDua", icon: <i className="fa-solid fa-book-quran fa-fw"></i> },
];

const auxNav = [
  { href: "/dua-wall", labelKey: "dashboard.duawall", icon: <i className="fa-solid fa-book-quran fa-fw"></i> },
  { href: "/about", labelKey: "dashboard.about", icon: <i className="fa-solid fa-info-circle fa-fw"></i> },
];

const allNav = [...mainNav, ...auxNav];

export function DashboardSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const { t, lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    let isMounted = true;

    async function fetchCounts() {
      try {
        const [msgRes, friendRes] = await Promise.all([
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user!.id)
            .eq("is_read", false),
          supabase
            .from("friendships")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")
            .or(`user_id1.eq.${user!.id},user_id2.eq.${user!.id}`)
            .neq("action_user_id", user!.id)
        ]);

        if (isMounted) {
          if (msgRes.count !== null) setUnreadCount(msgRes.count);
          if (friendRes.count !== null) setFriendRequestCount(friendRes.count);
        }
      } catch (e) {
        console.error("Sidebar count fetch failed:", e);
      }
    }

    fetchCounts();

    const channel1 = supabase
      .channel('sidebar-messages-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchCounts)
      .subscribe();

    const channel2 = supabase
      .channel('sidebar-friendships-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, fetchCounts)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [user?.id]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!mounted) {
    return (
      <aside className="hidden md:flex w-64 shrink-0 border-r border-cream-dark bg-white flex-col h-screen sticky top-0 py-6">
        <div className="px-6 mb-8 relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-bold text-primary text-2xl font-bangla tracking-tight select-none mt-1">ঈদ চান্দা</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Bottom Navigation (6 Main Items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark flex items-center justify-around z-50 pb-safe">
        {mainNav.map(({ href, labelKey, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full py-3 transition-all ${pathname === href ? "text-primary border-t-2 border-primary -mt-[2px]" : "text-gray-500 hover:text-gray-900"}`}
          >
            <span className="text-lg relative">
              {icon}
              {href === '/messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                  {unreadCount}
                </span>
              )}
              {href === '/friends' && friendRequestCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                  {friendRequestCount}
                </span>
              )}
            </span>
            <span className="text-[9px] font-bold mt-1 truncate max-w-[50px] text-center font-bangla">{t[labelKey]}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Top Header + Aux Nav */}
      <div className="md:hidden flex flex-col bg-white border-b border-cream-dark sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <p className="font-bold text-primary text-2xl font-bangla tracking-tight select-none">ঈদ চান্দা</p>
          </Link>
          <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="text-[10px] font-bold bg-cream px-3 py-1.5 rounded-full border border-cream-dark text-primary flex items-center gap-1.5 shadow-sm">
            <i className="fa-solid fa-language text-xs opacity-60"></i>
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
        {/* Mobile Sub-Header Links for Dua Wall and About */}
        <div className="flex items-center justify-center gap-6 pb-3 px-4">
          {auxNav.map(({ href, labelKey, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${pathname === href ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-primary"}`}
            >
              <span className="text-sm opacity-70">{icon}</span>
              <span className="font-bangla">{t[labelKey]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar (Icon + Text) */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-cream-dark bg-white flex-col h-screen sticky top-0 py-6">
        <div className="px-6 mb-8 relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <p className="font-bold text-primary text-2xl font-bangla tracking-tight select-none mt-1">ঈদ চান্দা</p>
          </Link>
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold bg-cream rounded-lg border border-cream-dark text-primary hover:bg-primary hover:text-white transition shadow-sm group"
            title={t["dashboard.toggleLang"]}
          >
            <i className="fa-solid fa-language text-xs opacity-60 group-hover:opacity-100"></i>
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>

        <nav className="flex-1 w-full px-4 space-y-1 overflow-y-auto">
          {allNav.map(({ href, labelKey, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${pathname === href
                ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1"
                : "text-gray-600 hover:bg-cream hover:text-primary"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="font-bangla">{t[labelKey]}</span>
              </div>
              <div className="flex items-center gap-1">
                {href === '/messages' && unreadCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pathname === href ? "bg-white text-primary" : "bg-red-500 text-white"}`}>
                    {unreadCount}
                  </span>
                )}
                {href === '/friends' && friendRequestCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pathname === href ? "bg-white text-primary" : "bg-primary text-white"}`}>
                    {friendRequestCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 w-full pt-4 border-t border-cream-dark">
          {user && (
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition font-bangla"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
              <span>{t["dashboard.logout"]}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
