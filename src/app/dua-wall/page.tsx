import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyDuaWallManager } from "@/components/dua-wall/MyDuaWallManager";

export default async function DuaWallPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900 font-bangla">
                দোয়া ওয়াল (Dua Wall)
            </h1>
            <p className="text-gray-500 mt-2 mb-8 font-bangla text-lg">
                আপনার প্রিয়জনদের জন্য দোয়া করুন এবং সবার দোয়া দেখুন।
            </p>
            <MyDuaWallManager currentUserId={user.id} />
        </div>
    );
}
