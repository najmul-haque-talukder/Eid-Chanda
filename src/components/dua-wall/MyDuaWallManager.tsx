"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import NextImage from "next/image";

export function MyDuaWallManager({ currentUserId }: { currentUserId: string }) {
    const [duas, setDuas] = useState<any[]>([]);
    const [publicDuas, setPublicDuas] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [editingDua, setEditingDua] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"public" | "my">("public");

    useEffect(() => {
        loadMyDuas();
        loadPublicDuas();
    }, [currentUserId]);

    async function loadMyDuas() {
        const supabase = createClient();
        const { data } = await supabase
            .from("duas")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false });

        setDuas(data || []);
    }

    async function loadPublicDuas() {
        const supabase = createClient();
        const { data } = await supabase
            .from("duas")
            .select(`
                *,
                profiles (
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .order("created_at", { ascending: false })
            .limit(50);

        setPublicDuas(data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        const supabase = createClient();

        if (editingDua) {
            await supabase.from("duas").update({
                content: content.trim(),
                updated_at: new Date().toISOString()
            }).eq("id", editingDua.id);
            setEditingDua(null);
        } else {
            await supabase.from("duas").insert({
                user_id: currentUserId,
                content: content.trim()
            });
        }

        setContent("");
        await loadMyDuas();
        await loadPublicDuas();
        setLoading(false);
    }

    function startEdit(dua: any) {
        setEditingDua(dua);
        setContent(dua.content);
        setActiveTab("my");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(duaId: string) {
        if (!window.confirm("Are you sure you want to delete this dua?")) return;
        const supabase = createClient();
        await supabase.from("duas").delete().eq("id", duaId);
        await loadMyDuas();
        await loadPublicDuas();
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Post Box */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-cream-dark relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 transition-transform group-hover:scale-125"></div>

                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                    <span className="text-2xl">🤲</span>
                    {editingDua ? "Edit Your Dua" : "Share a new Dua"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="আপনার দোয়া এখানে লিখুন... (Write your prayer here)"
                        className="w-full rounded-2xl border-2 border-cream-dark bg-cream/20 px-4 py-4 font-bangla min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                        required
                    />
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-primary px-6 py-3 text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
                        >
                            {loading ? "Saving..." : editingDua ? "Update Dua" : "Post to Public Wall"}
                        </button>
                        {editingDua && (
                            <button
                                type="button"
                                onClick={() => { setEditingDua(null); setContent(""); }}
                                className="rounded-xl bg-gray-100 px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-cream-dark w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab("public")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "public" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-gray-900"}`}
                >
                    Public Wall
                </button>
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "my" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-gray-900"}`}
                >
                    Your History
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {activeTab === "public" ? (
                    <div className="grid grid-cols-1 gap-6">
                        {publicDuas.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">No public duas yet. Be the first!</p>
                        ) : (
                            publicDuas.map((dua) => (
                                <div key={dua.id} className="bg-white p-6 rounded-3xl border border-cream-dark shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-cream border border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {dua.profiles?.avatar_url ? (
                                                <NextImage
                                                    src={dua.profiles.avatar_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    width={40}
                                                    height={40}
                                                    unoptimized
                                                />
                                            ) : (
                                                <span className="text-primary font-bold">{dua.profiles?.username?.[0]?.toUpperCase() || "?"}</span>
                                            )}
                                        </div>
                                        <div className="leading-tight">
                                            <p className="font-bold text-gray-900">@{dua.profiles?.username || "anonymous"}</p>
                                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                                {new Date(dua.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-gray-800 font-bangla text-lg whitespace-pre-wrap leading-relaxed pl-2">
                                        "{dua.content}"
                                    </p>

                                    {dua.user_id === currentUserId && (
                                        <div className="mt-4 flex gap-3 pt-3 border-t border-gray-50">
                                            <button onClick={() => startEdit(dua)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(dua.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {duas.length === 0 ? (
                            <div className="text-center py-10 bg-cream/10 rounded-3xl border-2 border-dashed border-cream-dark">
                                <p className="text-gray-400 font-medium">You haven't posted any duas yet.</p>
                            </div>
                        ) : (
                            duas.map((dua) => (
                                <div key={dua.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3 group">
                                    <p className="text-gray-800 font-bangla whitespace-pre-wrap">"{dua.content}"</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                                        <span className="font-mono">{new Date(dua.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(dua)} className="text-primary font-bold">Edit</button>
                                            <button onClick={() => handleDelete(dua.id)} className="text-red-500 font-bold">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

