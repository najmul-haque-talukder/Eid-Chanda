"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/redux/ToastSync";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUnreadCount, incrementUnreadCount } from "@/lib/redux/slices/notificationSlice";

import { useSocket } from "@/lib/socket/SocketProvider";

export function NotificationListener({ currentUserId }: { currentUserId: string | null }) {
    const { socket } = useSocket();
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const supabase = createClient();

    useEffect(() => {
        if (!currentUserId || !socket) return;

        // 1. Listen for messages via Socket.io for global alerts
        const handleNewMessage = (msg: any) => {
            // Don't toast if it's our own message
            if (msg.sender_id === currentUserId) return;

            // Don't toast if we are already in the chat with this person
            // Note: This is an approximation. A more perfect version would know the active toUserId.
            if (pathname?.includes(`/messages?to=${msg.sender_id}`)) return;

            showToast(
                "New Message 💬",
                msg.content,
                'info'
            );

            // Refresh to update unread counts in sidebar/list
            router.refresh();
        };

        socket.on("message", handleNewMessage);

        return () => {
            socket.off("message", handleNewMessage);
        };
    }, [socket, currentUserId, pathname, router, showToast]);

    useEffect(() => {
        if (!currentUserId) return;

        // 0. Initial fetch for unread count
        const fetchInitialUnread = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUserId)
                .eq('is_read', false);

            if (count !== null) {
                dispatch(setUnreadCount(count));
            }
        };
        fetchInitialUnread();

        // 1. Listen for private notifications (Messages, Khams)
        const notificationChannel = supabase
            .channel(`private-notifications:${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                (payload) => {
                    const notification = payload.new;

                    // Update Redux count
                    dispatch(incrementUnreadCount());

                    // Don't show toast if user is already on the messages page for this specific conversation
                    if (notification.type === 'message' && pathname === '/messages') return;

                    showToast(
                        notification.title,
                        notification.content,
                        'success'
                    );

                    // Refresh data if needed
                    router.refresh();
                }
            )
            .subscribe();

        // 2. Listen for global Dua broadcasts
        const duaChannel = supabase
            .channel('public:duas')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'duas'
                },
                async (payload) => {
                    const newDua = payload.new;

                    // Get the username of the person who posted the Dua
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('id', newDua.user_id)
                        .single();

                    // Don't toast for your own dua
                    if (newDua.user_id === currentUserId) return;

                    showToast(
                        "New Dua Shared! 🤲",
                        `@${profile?.username || 'Someone'} just posted a new Dua on the wall.`,
                        'info'
                    );

                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(notificationChannel);
            supabase.removeChannel(duaChannel);
        };
    }, [currentUserId, pathname, showToast, router]);

    return null;
}
