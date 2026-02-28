"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function MessageChat({ currentUserId, toUserId, initialToUsername, initialToAvatar }: { currentUserId: string, toUserId: string, initialToUsername: string, initialToAvatar?: string | null }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();

        // Subscribe to new messages for realtime MVP
        const supabase = createClient();
        const sub = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async payload => {
                const newMsg = payload.new;
                if ((newMsg.sender_id === currentUserId && newMsg.receiver_id === toUserId) ||
                    (newMsg.sender_id === toUserId && newMsg.receiver_id === currentUserId)) {
                    setMessages(prev => [...prev, newMsg]);
                    scrollToBottom();

                    // If we receive a message in an active open chat, immediately mark it as read
                    if (newMsg.receiver_id === currentUserId) {
                        await supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
                    }
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
                const updatedMsg = payload.new;
                if ((updatedMsg.sender_id === currentUserId && updatedMsg.receiver_id === toUserId) ||
                    (updatedMsg.sender_id === toUserId && updatedMsg.receiver_id === currentUserId)) {
                    setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [currentUserId, toUserId]);

    function scrollToBottom() {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }

    async function loadMessages() {
        const supabase = createClient();
        const { data } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${toUserId}),and(sender_id.eq.${toUserId},receiver_id.eq.${currentUserId})`)
            .order("created_at", { ascending: true })

        if (data) {
            setMessages(data);
            scrollToBottom();
        }

        // Mark as read
        await supabase.from("messages").update({ is_read: true }).eq("receiver_id", currentUserId).eq("sender_id", toUserId).eq("is_read", false);
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        const supabase = createClient();
        await supabase.from("messages").insert({
            sender_id: currentUserId,
            receiver_id: toUserId,
            content: content.trim(),
        });

        setContent("");
    }

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden">
            <div className="bg-primary/5 border-b border-primary/10 p-4">
                <h3 className="font-bold text-primary">Chatting with @{initialToUsername}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-400 mt-20 text-sm flex items-center justify-center gap-2">
                        No messages yet. Say Assalamualaikum! <i className="fa-solid fa-hand text-primary"></i>
                    </p>
                ) : null}

                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id || i} className={`max-w-[85%] flex gap-2 ${isMe ? 'self-end ml-auto flex-row-reverse' : 'self-start mr-auto flex-row'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center overflow-hidden shrink-0 mt-auto mb-5">
                                    {initialToAvatar ? (
                                        <img src={initialToAvatar} alt={initialToUsername} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-primary font-bold text-xs">{initialToUsername.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                                    {msg.content}
                                </div>
                                {isMe && (
                                    <span className={`text-[10px] mt-1 text-right ${msg.is_read ? 'text-primary font-medium' : 'text-gray-400'}`}>
                                        {msg.is_read ? 'Seen' : 'Delivered'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-cream-dark flex gap-2">
                <input
                    type="text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button type="submit" disabled={!content.trim()} className="bg-primary text-white rounded-full px-4 font-medium text-sm hover:bg-primary-dark disabled:opacity-50">
                    Send
                </button>
            </form>
        </div>
    );
}
