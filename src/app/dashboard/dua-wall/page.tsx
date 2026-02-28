import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyDuaWallManager } from "@/components/dua-wall/MyDuaWallManager";

export default async function DashboardDuaWallPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">My Dua Wall</h1>
            <p className="text-gray-600 mt-1 mb-8 font-bangla">
                Write prayers and well-wishes for everyone to read on the public Dua Wall.
            </p>
            <MyDuaWallManager currentUserId={user.id} />
        </div>
    );
}
