"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckSquare, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
    setRecentNotifications,
    setUnreadCount,
    markAsRead as markAsReadAction,
    markAllAsRead as markAllAsReadAction,
    deleteNotification as deleteNotificationAction
} from "@/lib/redux/slices/notificationSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function NotificationCenter({ currentUserId }: { currentUserId: string }) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const notifications = useSelector((state: RootState) => state.notifications.recentNotifications || []);
    const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount || 0);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();

    const { isLoading: loading } = useQuery({
        queryKey: ["notifications", currentUserId],
        queryFn: async () => {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false })
                .limit(20);

            if (data) {
                dispatch(setRecentNotifications(data));
                dispatch(setUnreadCount(data.filter(n => !n.is_read).length));
            }
            return data || [];
        },
        enabled: !!currentUserId,
    });

    useEffect(() => {
        const channel = supabase
            .channel(`notification-center:${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["notifications", currentUserId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, supabase, queryClient]);

    async function markAsRead(id: string) {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        dispatch(markAsReadAction(id));
    }

    async function markAllAsRead() {
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", currentUserId);
        dispatch(markAllAsReadAction());
    }

    async function deleteNotification(id: string) {
        await supabase.from("notifications").delete().eq("id", id);
        dispatch(deleteNotificationAction(id));
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-cream transition-all group"
            >
                <Bell size={22} className={`${unreadCount > 0 ? 'text-primary animate-swing' : 'text-gray-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-red-500/20">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[998] bg-black/5" onClick={() => setIsOpen(false)} />
                    <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-3 w-auto sm:w-80 bg-white rounded-3xl shadow-2xl border border-cream-dark z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                            <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                            </h3>
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                            >
                                Mark all read
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-10 text-center space-y-3">
                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center opacity-40 grayscale">
                                    <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm font-bold font-bangla">কোন নোটিফিকেশন নেই</p>
                                    <p className="text-[10px] uppercase tracking-widest mt-1">Inbox clear!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-cream">
                                    {notifications.map((n: any) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 hover:bg-cream/30 transition-all group relative ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-transparent'}`} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="text-sm font-bold text-gray-900 leading-tight font-bangla">{n.title}</p>
                                                        <span className="text-[9px] text-gray-400 font-mono whitespace-nowrap shrink-0 uppercase">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-bangla leading-relaxed">{n.content}</p>

                                                    <div className="flex items-center gap-4 mt-3">
                                                        {n.link && (
                                                            <Link
                                                                href={n.link}
                                                                onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                                                                className="flex items-center gap-1 text-[10px] font-black text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-all border border-primary/10"
                                                            >
                                                                {n.type === 'message' ? 'মেসেজ দেখুন' : 'দেখুন'} <ExternalLink size={10} />
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n.id)}
                                                            className="text-[10px] font-bold text-gray-300 hover:text-red-500 transition-colors flex items-center gap-1 ml-auto"
                                                        >
                                                            <Trash2 size={10} /> Delete
                                                        </button>
                                                        {!n.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(n.id)}
                                                                className="text-[10px] font-bold text-gray-300 hover:text-primary transition-colors flex items-center gap-1"
                                                            >
                                                                <CheckSquare size={10} /> Read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
