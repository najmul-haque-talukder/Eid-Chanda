import { createClient } from "@/lib/supabase/server";

export default async function PublicDuaWallPage() {
    let duas = [];
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from("duas")
            .select(`
                *,
                profiles(full_name, username, avatar_url)
            `)
            .order("created_at", { ascending: false });
        duas = data || [];
    } catch (e) {
        console.error("Public Dua fetch failed:", e);
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-cream-dark shadow-xl text-center">
                <i className="fa-solid fa-book-quran text-primary text-4xl mb-4"></i>
                <h1 className="text-3xl font-black text-gray-900 font-bangla">দোয়া ওয়াল (Public Dua Wall)</h1>
                <p className="text-gray-500 font-bangla mt-2">সবার জন্য নেক দোয়া এবং ভালোবাসা এখানে প্রকাশ করুন।</p>
            </div>

            <div className="space-y-4">
                {duas?.length === 0 && (
                    <div className="bg-white p-12 rounded-[2.5rem] border-2 border-cream-dark shadow-xl text-center text-gray-400 italic">
                        এখনো কোনো দোয়া পোস্ট করা হয়নি। প্রথম দোয়াটি আপনি করুন!
                    </div>
                )}
                {duas?.map((dua) => (
                    <div key={dua.id} className="bg-white p-6 rounded-3xl border-2 border-cream-dark shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-cream-dark">
                                {dua.profiles?.avatar_url ? (
                                    <img src={dua.profiles.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary font-bold">{dua.profiles?.full_name?.charAt(0) || "U"}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{dua.profiles?.full_name || "Unknown User"}</p>
                                <p className="text-[10px] text-gray-400 font-mono">@{dua.profiles?.username || "user"}</p>
                            </div>
                            <span className="ml-auto text-[10px] text-gray-300 font-mono">
                                {new Date(dua.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 font-bangla text-lg leading-relaxed">
                            {dua.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
