import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReceivedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch khams where this user is the receiver
  const { data: khams } = await supabase
    .from("khams")
    .select("*, sender:profiles!sender_id(*)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Received Salami Requests</h1>
      <p className="text-gray-600 mt-1">Salami requests sent specifically to you!</p>

      <div className="mt-6 space-y-4">
        {!khams?.length && (
          <p className="text-gray-500">
            No received Salami requests yet! When someone requests Salami from you, it will appear here.
          </p>
        )}
        {khams?.map((k) => (
          <div
            key={k.id}
            className="rounded-2xl bg-white border border-cream-dark p-5 flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-primary/20 bg-cream">
                {k.anonymous ? (
                  <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                    <i className="fa-solid fa-user-secret"></i>
                  </div>
                ) : k.sender?.avatar_url ? (
                  <img src={k.sender.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                    {(k.sender?.full_name || "A")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2 transition-colors">
                  {k.anonymous ? (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      Anonymous Sender <i className="fa-solid fa-user-secret text-xs"></i>
                    </span>
                  ) : k.sender?.full_name || "A Friend"}
                  {!k.delivered_at && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">NEW</span>}
                </p>
                <p className="text-lg text-gray-800 line-clamp-1 mt-1 font-bangla">"{k.letter_text}"</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(k.created_at).toLocaleDateString()} • {new Date(k.created_at).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="text-gray-300">
              <i className="fa-solid fa-envelope-open text-xl opacity-20"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
