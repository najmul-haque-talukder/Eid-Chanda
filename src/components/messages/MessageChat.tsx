"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function MessageChat({ currentUserId, toUserId, initialToUsername, initialToAvatar }: { currentUserId: string, toUserId: string, initialToUsername: string, initialToAvatar?: string | null }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        loadMessages();

        // Optimized realtime subscription
        const channel = supabase
            .channel(`chat:${currentUserId}:${toUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUserId}`
                },
                (payload) => {
                    const newMsg = payload.new;
                    if (newMsg.sender_id === toUserId) {
                        setMessages(prev => {
                            // Prevent double messages
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        markAsRead(newMsg.id);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${currentUserId}`
                },
                (payload) => {
                    const updated = payload.new;
                    setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, toUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    async function markAsRead(msgId: string) {
        await supabase.from("messages").update({ is_read: true }).eq("id", msgId);
    }

    async function loadMessages() {
        const { data } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${toUserId}),and(sender_id.eq.${toUserId},receiver_id.eq.${currentUserId})`)
            .order("created_at", { ascending: true });

        if (data) {
            setMessages(data);
            // Mark all received as read instantly
            const unreadIds = data.filter(m => m.receiver_id === currentUserId && !m.is_read).map(m => m.id);
            if (unreadIds.length > 0) {
                await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
            }
        }
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const text = content.trim();
        if (!text) return;

        // Optimistic Update: Add message immediately for "Zero Latency" feel
        const tempId = Math.random().toString(36).substring(7);
        const optimisticMsg = {
            id: tempId,
            sender_id: currentUserId,
            receiver_id: toUserId,
            content: text,
            is_read: false,
            created_at: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setContent("");
        setSending(true);

        const { data, error } = await supabase.from("messages").insert({
            sender_id: currentUserId,
            receiver_id: toUserId,
            content: text,
        }).select().single();

        if (data && !error) {
            // Replace optimistic message with real message
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        } else {
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Message failed to send. Please try again.");
        }
        setSending(false);
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-cream-dark overflow-hidden transition-all">
            {/* Header */}
            <div className="bg-primary/5 border-b border-primary/10 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cream border border-primary/20 flex items-center justify-center overflow-hidden">
                        {initialToAvatar ? (
                            <img src={initialToAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold">{initialToUsername.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">@{initialToUsername}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                    <button className="p-2 hover:bg-white rounded-full transition"><i className="fa-solid fa-phone"></i></button>
                    <button className="p-2 hover:bg-white rounded-full transition"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7] scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 select-none">
                        <i className="fa-solid fa-mosque text-6xl mb-4 text-primary"></i>
                        <p className="font-bangla font-bold">আসসালামু আলাইকুম!</p>
                        <p className="text-sm">Say Assalamualaikum to start chat</p>
                    </div>
                ) : null}

                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[75%] group`}>
                                <div className={`relative px-4 py-3 rounded-3xl text-sm shadow-sm ${isMe
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white border border-cream-dark text-gray-800 rounded-bl-none'
                                    } ${msg.isOptimistic ? 'opacity-60 grayscale' : ''}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 font-mono text-[9px] ${isMe ? 'justify-end text-gray-400' : 'justify-start text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && !msg.isOptimistic && (
                                        <span className={msg.is_read ? 'text-primary' : ''}>
                                            <i className={`fa-solid ${msg.is_read ? 'fa-check-double' : 'fa-check'}`}></i>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-cream-dark shadow-inner">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <div className="flex-1 relative flex items-center">
                        <textarea
                            rows={1}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full rounded-2xl border-2 border-cream-dark bg-cream/20 px-4 py-3 pr-10 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none max-h-32"
                        />
                        <button type="button" className="absolute right-3 text-gray-400 hover:text-primary transition">
                            <i className="fa-regular fa-face-smile"></i>
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || sending}
                        className="bg-primary hover:bg-primary-dark w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    );
}

