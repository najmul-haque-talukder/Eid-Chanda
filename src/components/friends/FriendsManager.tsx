"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastContext";

export function FriendsManager({ currentUserId }: { currentUserId: string }) {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFriends();
    }, [currentUserId]);

    async function loadFriends() {
        const supabase = createClient();

        // For MVP, we fetch friendships and join the profile info
        // Fetch pending requests sent to us
        const { data: reqs } = await supabase
            .from("friendships")
            .select("*, profile1:profiles!user_id1(id, full_name, username, avatar_url), profile2:profiles!user_id2(id, full_name, username, avatar_url)")
            .eq("status", "pending")
            .eq("user_id2", currentUserId)
            .eq("action_user_id", "user_id1"); // if action_user_id is the sender, we need to check this logic. Actually, let's just show all pending where we are not the action_user_id

        // Better logic: Fetch friendships where we are user1 or user2
        const { data: allRels } = await supabase
            .from("friendships")
            .select("id, status, user_id1, user_id2, action_user_id")
            .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);

        // Fetch "All Users" to show as suggestions (excluding ourselves and existing friends/requests)
        const { data: allProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, username")
            .neq("id", currentUserId)
            .limit(20);

        if (!allRels) {
            setAllUsers(allProfiles || []);
            setSearchResults(allProfiles || []);
            return;
        }

        const accepted = allRels.filter(f => f.status === 'accepted');
        const pendingRequests = allRels.filter(f => f.status === 'pending' && f.action_user_id !== currentUserId);

        // Hydrate profiles for accepted
        const friendIds = accepted.map(f => f.user_id1 === currentUserId ? f.user_id2 : f.user_id1);
        if (friendIds.length > 0) {
            const { data: friendProfiles } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", friendIds);
            setFriends(friendProfiles || []);
        }

        // Hydrate profiles for requests
        const reqIds = pendingRequests.map(f => f.user_id1 === currentUserId ? f.user_id2 : f.user_id1);
        if (reqIds.length > 0) {
            const { data: reqProfiles } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", reqIds);
            setRequests(reqProfiles || []);
        } else {
            setRequests([]);
        }
        // Filter out existing friends/requests from allUsers
        if (allProfiles) {
            const relIds = allRels.flatMap(r => [r.user_id1, r.user_id2]);
            const suggested = allProfiles.filter(p => !relIds.includes(p.id));
            setAllUsers(suggested);
            if (!searchQuery.trim()) {
                setSearchResults(suggested);
            }
        }
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(allUsers);
            return;
        }
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from("profiles")
            .select("id, full_name, username")
            .ilike("username", `%${searchQuery}%`)
            .neq("id", currentUserId)
            .limit(10);

        // Filter out existing friends/requests so we don't show "Add Friend" for people already connected
        // For simplicity in MVP, we just show them.
        setSearchResults(data || []);
        setLoading(false);
    }

    async function sendRequest(targetUserId: string) {
        const supabase = createClient();
        const u1 = currentUserId < targetUserId ? currentUserId : targetUserId;
        const u2 = currentUserId < targetUserId ? targetUserId : currentUserId;

        await supabase.from("friendships").insert({
            user_id1: u1,
            user_id2: u2,
            status: "pending",
            action_user_id: currentUserId,
        }).select().single();

        showToast("Friend request sent!", "success");

        // Remove the user from local state lists instead of clearing the whole search!
        setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
        setAllUsers(prev => prev.filter(u => u.id !== targetUserId));
    }

    async function respondRequest(targetUserId: string, accept: boolean) {
        const supabase = createClient();
        const u1 = currentUserId < targetUserId ? currentUserId : targetUserId;
        const u2 = currentUserId < targetUserId ? targetUserId : currentUserId;

        if (accept) {
            await supabase.from("friendships").update({ status: "accepted", action_user_id: currentUserId }).match({ user_id1: u1, user_id2: u2 });
        } else {
            await supabase.from("friendships").update({ status: "declined", action_user_id: currentUserId }).match({ user_id1: u1, user_id2: u2 });
        }
        loadFriends();
    }

    return (
        <div className="space-y-8">

            {/* Search & Add */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Find Friends</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!e.target.value.trim()) setSearchResults(allUsers);
                        }}
                        placeholder="Search username... (e.g. najmul)"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button type="submit" disabled={loading} className="rounded-xl bg-primary px-6 py-2 text-white font-medium hover:bg-primary-dark">
                        Search
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {searchResults.map((user) => (
                            <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold">{user.full_name?.charAt(0) || user.username.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.full_name || "No name"}</p>
                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => sendRequest(user.id)}
                                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark shadow-sm transition-all whitespace-nowrap ml-auto sm:ml-0"
                                >
                                    Add Friend
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {requests.length > 0 && (
                <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-200">
                    <h2 className="text-lg font-bold text-orange-800 mb-4">Friend Requests ({requests.length})</h2>
                    <div className="space-y-2">
                        {requests.map((user) => (
                            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-lg shadow-sm border border-orange-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-orange-600 font-bold">{user.full_name?.charAt(0) || user.username.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.full_name || "No name"}</p>
                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => respondRequest(user.id, true)} className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark">Accept</button>
                                    <button onClick={() => respondRequest(user.id, false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Friends</h2>
                {friends.length === 0 ? (
                    <p className="text-gray-500 text-sm">No friends yet. Search above to add some!</p>
                ) : (
                    <div className="space-y-2">
                        {friends.map((user) => (
                            <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-cream/30 rounded-xl border border-cream-dark">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold">{user.full_name?.charAt(0) || user.username.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.full_name || "No name"}</p>
                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <a
                                    href={`/dashboard/messages?to=${user.id}`}
                                    className="px-4 py-2 bg-white border border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white shadow-sm transition-all whitespace-nowrap ml-auto sm:ml-0"
                                >
                                    Message
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
