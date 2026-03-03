"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import NextImage from "next/image";
import { io, Socket } from "socket.io-client";
import {
    Phone,
    MoreVertical,
    Building2,
    User,
    CheckCheck,
    Check,
    Smile,
    Send
} from "lucide-react";

import { useSocket } from "@/lib/socket/SocketProvider";

export function MessageChat({ currentUserId, toUserId, initialToUsername, initialToAvatar, currentUserAvatar }: { currentUserId: string, toUserId: string, initialToUsername: string, initialToAvatar?: string | null, currentUserAvatar?: string | null }) {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [othersTyping, setOthersTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const supabase = createClient();

    useEffect(() => {
        loadMessages();

        if (socket) {
            console.log("[CHAT] Attaching socket listeners for conversation with:", toUserId);
            socket.on("message", handleNewMessage);
            socket.on("user_typing", handleUserTyping);
            socket.on("user_stop_typing", handleUserStopTyping);
        } else {
            console.warn("[CHAT] Socket not available for listeners!");
        }

        return () => {
            if (socket) {
                console.log("[CHAT] Detaching socket listeners");
                socket.off("message", handleNewMessage);
                socket.off("user_typing", handleUserTyping);
                socket.off("user_stop_typing", handleUserStopTyping);
            }
        };
    }, [socket, toUserId]);

    const handleNewMessage = (newMsg: any) => {
        console.log("[CHAT] Received socket message:", newMsg.id);
        if (
            (newMsg.sender_id === toUserId && newMsg.receiver_id === currentUserId) ||
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === toUserId)
        ) {
            console.log("[CHAT] Message is relevant, updating state");
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) {
                    console.log("[CHAT] Duplicate message ignored");
                    return prev;
                }
                return [...prev, newMsg];
            });

            if (newMsg.receiver_id === currentUserId) {
                markAsRead(newMsg.id);
            }
        } else {
            console.log("[CHAT] Message not relevant to this room, ignored");
        }
    };

    const handleUserTyping = ({ sender_id }: { sender_id: string }) => {
        console.log("[CHAT] User typing event:", sender_id);
        if (sender_id === toUserId) setOthersTyping(true);
    };

    const handleUserStopTyping = ({ sender_id }: { sender_id: string }) => {
        console.log("[CHAT] User stop typing event:", sender_id);
        if (sender_id === toUserId) setOthersTyping(false);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, othersTyping]);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    async function markAsRead(msgId: string) {
        await supabase.from("messages").update({ is_read: true }).eq("id", msgId);
    }

    async function loadMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${toUserId}),and(sender_id.eq.${toUserId},receiver_id.eq.${currentUserId})`)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Messages Fetch Error:", error.message);
        }

        if (data) {
            setMessages(data);
            const unreadIds = data.filter(m => m.receiver_id === currentUserId && !m.is_read).map(m => m.id);
            if (unreadIds.length > 0) {
                await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
            }
        }
    }

    const handleContentChange = (val: string) => {
        setContent(val);
        if (!socket) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { sender_id: currentUserId, receiver_id: toUserId });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("stop_typing", { sender_id: currentUserId, receiver_id: toUserId });
        }, 2000);
    };

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const text = content.trim();
        if (!text) return;

        const tempId = "optimistic-" + Math.random().toString(36).substring(7);
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
        setIsTyping(false);
        if (socket) socket.emit("stop_typing", { sender_id: currentUserId, receiver_id: toUserId });
        setSending(true);

        const { data, error } = await supabase.from("messages").insert({
            sender_id: currentUserId,
            receiver_id: toUserId,
            content: text,
        }).select().single();

        if (data && !error) {
            // Emit via socket for instant delivery
            if (socket) socket.emit("send_message", data);
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        } else {
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
                            <NextImage
                                src={initialToAvatar}
                                alt=""
                                className="w-full h-full object-cover"
                                width={40}
                                height={40}
                                unoptimized
                            />
                        ) : (
                            <span className="text-primary font-bold">{initialToUsername.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">@{initialToUsername}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${othersTyping ? 'bg-primary animate-bounce' : 'bg-green-500 animate-pulse'}`}></span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {othersTyping ? 'Typing...' : 'Online'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                    <button className="p-2 hover:bg-white rounded-full transition"><Phone size={18} /></button>
                    <button className="p-2 hover:bg-white rounded-full transition"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7] scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40 select-none">
                        <Building2 size={64} className="mb-4 text-primary" />
                        <p className="font-bangla font-bold">আসসালামু আলাইকুম!</p>
                        <p className="text-sm">Say Assalamualaikum to start chat</p>
                    </div>
                ) : null}

                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUserId;
                    const avatar = isMe ? currentUserAvatar : initialToAvatar;

                    return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-cream border border-primary/10 flex items-center justify-center overflow-hidden shrink-0 self-end mb-5">
                                    {avatar ? (
                                        <NextImage
                                            src={avatar}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            width={32}
                                            height={32}
                                            unoptimized
                                        />
                                    ) : (
                                        <User className="text-primary" size={12} />
                                    )}
                                </div>
                            )}
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
                                            {msg.is_read ? <CheckCheck size={10} /> : <Check size={10} />}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isMe && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 self-end mb-5">
                                    {avatar ? (
                                        <NextImage
                                            src={avatar}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            width={32}
                                            height={32}
                                            unoptimized
                                        />
                                    ) : (
                                        <User className="text-primary" size={12} />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {othersTyping && (
                    <div className="flex justify-start gap-2 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-cream border border-primary/10 flex items-center justify-center overflow-hidden shrink-0 self-end mb-5">
                            {initialToAvatar ? (
                                <NextImage src={initialToAvatar} width={32} height={32} className="w-full h-full object-cover" alt="" unoptimized />
                            ) : (
                                <User className="text-primary" size={12} />
                            )}
                        </div>
                        <div className="bg-white border border-cream-dark px-4 py-2 rounded-2xl flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-cream-dark shadow-inner">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <div className="flex-1 relative flex items-center">
                        <textarea
                            rows={1}
                            value={content}
                            onChange={e => handleContentChange(e.target.value)}
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
                            <Smile size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || sending}
                        className="bg-primary hover:bg-primary-dark w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

