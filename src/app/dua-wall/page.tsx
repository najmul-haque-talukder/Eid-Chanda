import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DuaWallPage() {
    const supabase = await createClient();

    // Fetch public duas, newest first. 
    const { data: duas } = await supabase
        .from("duas")
        .select("id, content, created_at, user_id, profile:profiles!user_id(full_name, avatar_url, username)")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="min-h-screen bg-cream font-bangla pb-20">
            <header className="px-6 py-6 max-w-2xl mx-auto flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Dua Wall</h1>
                    <p className="text-gray-600 mt-1">Community prayers & well wishes.</p>
                </div>
                <Link href="/" className="text-primary hover:underline text-sm font-medium">Home</Link>
            </header>

            <main className="max-w-2xl mx-auto px-6 space-y-6">
                {!duas?.length && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-cream-dark">
                        <p className="text-xl mb-2 text-primary">
                            <i className="fa-solid fa-hands-praying"></i>
                        </p>
                        <p>No public Duas yet. Be the first to share one!</p>
                    </div>
                )}

                <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                    {duas?.map((dua: any, i: number) => {
                        const pastelColors = [
                            'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
                            'bg-blue-50 hover:bg-blue-100 border-blue-200',
                            'bg-pink-50 hover:bg-pink-100 border-pink-200',
                            'bg-green-50 hover:bg-green-100 border-green-200',
                            'bg-purple-50 hover:bg-purple-100 border-purple-200',
                        ];
                        const cardStyle = pastelColors[i % pastelColors.length];
                        const rotation = i % 2 === 0 ? '-rotate-1 hover:rotate-1' : 'rotate-1 hover:-rotate-1';

                        return (
                            <div key={dua.id} className={`break-inside-avoid rounded-2xl shadow-sm border p-6 transition-all duration-300 relative ${cardStyle} ${rotation}`}>
                                {/* Pin */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/10 shadow-inner flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                </div>
                                <p className="text-gray-800 leading-relaxed font-bangla whitespace-pre-wrap mt-4 text-center">
                                    "{dua.content}"
                                </p>
                                <div className="mt-8 pt-4 border-t border-black/5 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-white shrink-0 overflow-hidden border shadow-sm">
                                            {dua.profile?.avatar_url ? (
                                                <img src={dua.profile.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-[10px]">
                                                    {(dua.profile?.full_name || dua.profile?.username || "A")[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-700">
                                            {dua.profile?.full_name || dua.profile?.username || "Community Member"}
                                        </p>
                                    </div>
                                    <p className="opacity-70">{formatDistanceToNow(new Date(dua.created_at), { addSuffix: true })}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
