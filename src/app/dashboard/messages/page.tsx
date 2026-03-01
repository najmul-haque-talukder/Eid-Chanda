import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageChat } from "@/components/messages/MessageChat";
import Link from "next/link";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const toId = (await searchParams).to;

    let toUser = null;
    if (toId) {
        const { data } = await supabase.from("profiles").select("id, username, full_name, avatar_url").eq("id", toId).single();
        toUser = data;
    }

    // If no chat selected, fetch a simple list of friends
    let friendsList: any[] = [];
    if (!toId) {
        const { data: rels } = await supabase
            .from("friendships")
            .select("status, user_id1, user_id2")
            .eq("status", "accepted")
            .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

        if (rels) {
            const friendIds = rels.map(r => r.user_id1 === user.id ? r.user_id2 : r.user_id1);
            if (friendIds.length > 0) {
                const { data: fProfiles } = await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", friendIds);

                const { data: unreadMsgs } = await supabase.from("messages").select("sender_id").eq("receiver_id", user.id).eq("is_read", false);
                const unreadMap: Record<string, number> = {};
                if (unreadMsgs) {
                    unreadMsgs.forEach(m => {
                        unreadMap[m.sender_id] = (unreadMap[m.sender_id] || 0) + 1;
                    });
                }

                if (fProfiles) {
                    friendsList = fProfiles.map(f => ({
                        ...f,
                        unreadCount: unreadMap[f.id] || 0
                    })).sort((a, b) => b.unreadCount - a.unreadCount);
                }
            }
        }
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1 mb-8">
                Chat with your friends.
            </p>

            {!toId ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Select a friend to message</h2>
                    {friendsList.length === 0 ? (
                        <p className="text-gray-500">You don't have any friends yet. <Link href="/dashboard/friends" className="text-primary underline">Find friends</Link></p>
                    ) : (
                        <div className="space-y-2">
                            {friendsList.map(f => (
                                <Link key={f.id} href={`/dashboard/messages?to=${f.id}`} className="block p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                                {f.avatar_url ? (
                                                    <img src={f.avatar_url} alt={f.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-primary font-bold">{f.full_name?.charAt(0) || f.username.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${f.unreadCount > 0 ? "text-primary" : "text-gray-900"}`}>{f.full_name || "No name"}</p>
                                                <p className="text-sm text-gray-500">@{f.username}</p>
                                            </div>
                                        </div>
                                        {f.unreadCount > 0 && (
                                            <div className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-sm shadow-primary/30">
                                                {f.unreadCount} new
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">← Back to Messages</Link>
                    </div>
                    <MessageChat
                        currentUserId={user.id}
                        toUserId={toId}
                        initialToUsername={toUser?.username || "Friend"}
                        initialToAvatar={toUser?.avatar_url || null}
                    />
                </div>
            )}
        </div>
    );
}
