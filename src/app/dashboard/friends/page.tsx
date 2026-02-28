import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FriendsManager } from "@/components/friends/FriendsManager";

export default async function FriendsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
            <p className="text-gray-600 mt-1 mb-8">
                Search, add, and connect with friends on Eid Chanda.
            </p>

            <FriendsManager currentUserId={user.id} />
        </div>
    );
}
