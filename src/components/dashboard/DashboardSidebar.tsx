"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/redux/LanguageSync";
import type { User } from "@supabase/supabase-js";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  User as UserIcon,
  Send,
  PackageOpen,
  Inbox,
  Users,
  MessageSquareDiff,
  BookOpen,
  Info,
  LogOut,
  Bell,
  Languages
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const mainNav = [
  { href: "/", labelKey: "dashboard.profile", icon: <UserIcon size={18} /> },
  { href: "/send", labelKey: "dashboard.send", icon: <Send size={18} /> },
  { href: "/sent", labelKey: "dashboard.sent", icon: <PackageOpen size={18} /> },
  { href: "/received", labelKey: "dashboard.received", icon: <Inbox size={18} /> },
  { href: "/friends", labelKey: "dashboard.friends", icon: <Users size={18} /> },
  { href: "/messages", labelKey: "dashboard.messages", icon: <MessageSquareDiff size={18} /> },
  { href: "/public-dua", labelKey: "dashboard.publicDua", icon: <BookOpen size={18} /> },
];

const auxNav = [
  { href: "/dua-wall", labelKey: "dashboard.duawall", icon: <BookOpen size={18} /> },
  { href: "/about", labelKey: "dashboard.about", icon: <Info size={18} /> },
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
      {/* Mobile Bottom Navigation */}
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
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="text-[10px] font-bold bg-cream px-3 py-1.5 rounded-full border border-cream-dark text-primary flex items-center gap-1.5 shadow-sm">
              <Languages size={14} className="opacity-60" />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            {user && <NotificationCenter currentUserId={user.id} />}
            {user && (
              <button
                onClick={signOut}
                className="text-[10px] font-bold bg-red-50 px-3 py-1.5 rounded-full border border-red-100 text-red-500 flex items-center gap-1.5 shadow-sm"
                title={t["dashboard.logout"]}
              >
                <LogOut size={14} className="opacity-60" />
                <span>{t["dashboard.logout"]}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 pb-3 px-4 overflow-x-auto no-scrollbar">
          {auxNav.map(({ href, labelKey, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 ${pathname === href ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-primary"}`}
            >
              <span className="text-sm opacity-70">{icon}</span>
              <span className="font-bangla">{t[labelKey]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar (Icon + Text) */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-cream-dark bg-white flex-col h-screen sticky top-0 py-6 z-50">
        <div className="px-6 mb-8 relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <p className="font-bold text-primary text-2xl font-bangla tracking-tight select-none mt-1">ঈদ চান্দা</p>
          </Link>
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold bg-cream rounded-lg border border-cream-dark text-primary hover:bg-primary hover:text-white transition shadow-sm group"
            title={t["dashboard.toggleLang"]}
          >
            <Languages size={14} className="opacity-60 group-hover:opacity-100" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
          {user && <NotificationCenter currentUserId={user.id} />}
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

        <div className="mt-auto px-4 w-full py-4 border-t border-cream-dark bg-white">
          {user && (
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-bangla group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="flex-1 text-left">{t["dashboard.logout"]}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
