"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function MyDuaWallManager({ currentUserId }: { currentUserId: string }) {
    const [duas, setDuas] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [editingDua, setEditingDua] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDuas();
    }, [currentUserId]);

    async function loadDuas() {
        const supabase = createClient();
        const { data } = await supabase
            .from("duas")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false });

        setDuas(data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        const supabase = createClient();

        if (editingDua) {
            await supabase.from("duas").update({ content: content.trim(), updated_at: new Date().toISOString() }).eq("id", editingDua.id);
            setEditingDua(null);
        } else {
            await supabase.from("duas").insert({
                user_id: currentUserId,
                content: content.trim()
            });
        }

        setContent("");
        await loadDuas();
        setLoading(false);
    }

    function startEdit(dua: any) {
        setEditingDua(dua);
        setContent(dua.content);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(duaId: string) {
        if (!window.confirm("Are you sure you want to delete this dua?")) return;
        const supabase = createClient();
        await supabase.from("duas").delete().eq("id", duaId);
        await loadDuas();
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{editingDua ? "Edit Dua" : "Post a new Dua 🤲"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="May Allah bless everyone..."
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-bangla min-h-[100px] focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                    />
                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="rounded-xl bg-primary px-6 py-2 text-white font-medium hover:bg-primary-dark transition disabled:opacity-50">
                            {loading ? "Saving..." : editingDua ? "Update Dua" : "Post to Public Wall"}
                        </button>
                        {editingDua && (
                            <button type="button" onClick={() => { setEditingDua(null); setContent(""); }} className="rounded-xl bg-gray-200 px-6 py-2 text-gray-700 font-medium hover:bg-gray-300 transition">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Your Posted Duas</h2>
                {duas.length === 0 ? (
                    <p className="text-gray-500">You haven't posted any duas yet.</p>
                ) : (
                    duas.map((dua) => (
                        <div key={dua.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                            <p className="text-gray-800 font-bangla whitespace-pre-wrap leading-relaxed">"{dua.content}"</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 border-gray-100">
                                <span>{new Date(dua.created_at).toLocaleDateString()}</span>
                                <div className="flex gap-4">
                                    <button onClick={() => startEdit(dua)} className="text-primary hover:underline font-medium">Edit</button>
                                    <button onClick={() => handleDelete(dua.id)} className="text-red-500 hover:underline font-medium">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
