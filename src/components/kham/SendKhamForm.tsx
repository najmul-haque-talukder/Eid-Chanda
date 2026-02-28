"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import { useEffect, useRef } from "react";

export function SendKhamForm({ senderId, senderProfile }: { senderId: string, senderProfile: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const USERS_PER_PAGE = 5;

  // Form state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [message, setMessage] = useState("Eid Mubarak! Salami din bkash e...");
  const [platform, setPlatform] = useState("bKash");
  const [number, setNumber] = useState(senderProfile?.bkash_number || senderProfile?.nagad_number || senderProfile?.rocket_number || senderProfile?.upay_number || senderProfile?.dbbl_number || "");
  const [anonymous, setAnonymous] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  // Status
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch all users on mount
  useEffect(() => {
    async function fetchAllUsers() {
      setLoadingUsers(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", senderId)
        .order("username", { ascending: true })
        .range(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE - 1);

      if (data) setAllUsers(data);
      setLoadingUsers(false);
    }
    fetchAllUsers();
  }, [senderId]);

  // Re-fetch on page change
  const fetchPage = async (p: number) => {
    setPage(p);
    setLoadingUsers(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .neq("id", senderId)
      .order("username", { ascending: true })
      .range(p * USERS_PER_PAGE, (p + 1) * USERS_PER_PAGE - 1);

    if (data) setAllUsers(data);
    setLoadingUsers(false);
  };

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("username", `%${query}%`)
        .neq("id", senderId)
        .limit(5);
      setSearchResults(data || []);
      setSearching(false);
    }, 400); // 400ms debounce
  }

  async function sendCard(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !message || !number) return;
    setSending(true);

    const supabase = createClient();
    const slug = Math.random().toString(36).substring(2, 10);

    const { error } = await supabase.from("khams").insert({
      sender_id: senderId,
      receiver_id: selectedUser.id,
      receiver_name: selectedUser.full_name || selectedUser.username,
      amount: "Request", // reusing amount column for MVP schema constraints
      letter_text: message,
      payment_method: platform,
      payment_number: number,
      anonymous,
      scheduled_at: scheduledAt || null,
      slug
    });

    if (error) {
      showToast("Operation failed! Please try again.", "error");
      setSending(false);
      return;
    }

    router.push("/dashboard/sent?created=" + slug);
  }

  if (selectedUser) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="font-bold text-lg">Send Request to @{selectedUser.username}</h2>
          <button onClick={() => setSelectedUser(null)} className="text-sm text-primary hover:underline">Change User</button>
        </div>

        <div className="mb-6 flex gap-4 p-4 bg-gray-50 rounded-xl items-center border border-gray-100">
          <img src={selectedUser.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="font-bold text-gray-900">{selectedUser.full_name || "No name"}</p>
            <p className="text-sm text-gray-500">@{selectedUser.username}</p>
          </div>
        </div>

        <form onSubmit={sendCard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Message / Quote</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 font-bangla"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Platform</label>
              <select value={platform} onChange={e => {
                setPlatform(e.target.value);
                if (e.target.value === 'bKash') setNumber(senderProfile?.bkash_number || "");
                else if (e.target.value === 'Nagad') setNumber(senderProfile?.nagad_number || "");
                else if (e.target.value === 'Rocket') setNumber(senderProfile?.rocket_number || "");
                else if (e.target.value === 'Upay') setNumber(senderProfile?.upay_number || "");
                else if (e.target.value === 'DBBL') setNumber(senderProfile?.dbbl_number || "");
                else setNumber("");
              }} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2">
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>Upay</option>
                <option>DBBL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Number</label>
              <input type="text" required value={number} onChange={e => setNumber(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Schedule Send</label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 mt-7 cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded border-gray-300 text-primary w-5 h-5" />
              <span className="text-sm text-gray-700">Send Anonymously 🥷</span>
            </label>
          </div>

          {/* generated card preview */}
          <div className="mt-6 p-6 rounded-2xl bg-cream border-2 border-primary/20 shadow-inner">
            <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-widest">Card Preview</p>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-3 relative overflow-hidden">
              {!anonymous && senderProfile?.avatar_url && (
                <img src={senderProfile.avatar_url} className="w-16 h-16 rounded-full mx-auto border-2 border-primary" />
              )}
              <p className="font-bangla font-medium text-lg leading-relaxed text-gray-800">"{message}"</p>
              {!anonymous && (
                <p className="text-sm text-gray-500">- {senderProfile?.full_name || senderProfile?.username}</p>
              )}
              <div className={`mt-4 mx-auto inline-block px-4 py-2 rounded-lg border font-mono font-bold 
                ${platform === 'bKash' ? 'bg-pink-50 text-pink-700 border-pink-200'
                  : platform === 'Nagad' ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : platform === 'Rocket' ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : platform === 'Upay' ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {platform}: {number}
              </div>
            </div>
          </div>

          <button disabled={sending} type="submit" className="w-full mt-4 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 text-lg shadow-md flex items-center justify-center gap-3">
            {sending ? "Sending..." : (
              <>
                <span>Send Request Card</span>
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        Search user to send a request <i className="fa-solid fa-magnifying-glass text-primary text-sm"></i>
      </h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
        placeholder="Search username to send a card..."
        autoFocus
      />

      {searchQuery ? (
        <div className="mt-4 space-y-2 border rounded-xl overflow-hidden shadow-sm">
          {searching ? (
            <p className="p-4 text-gray-500 text-sm">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No users found.</p>
          ) : (
            searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full text-left p-4 hover:bg-primary/5 transition flex items-center justify-between border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream shrink-0 overflow-hidden">
                    <img src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.full_name || "No name"}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Select</span>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">All Users</p>
          <div className="space-y-2 border rounded-2xl overflow-hidden shadow-sm bg-white">
            {loadingUsers ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-primary mr-2"></div>
                <span className="text-sm text-gray-400">Loading users...</span>
              </div>
            ) : allUsers.length === 0 ? (
              <p className="p-8 text-center text-gray-400 text-sm">No users available yet.</p>
            ) : (
              allUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full text-left p-4 hover:bg-primary/5 transition flex items-center justify-between border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cream shrink-0 overflow-hidden border-2 border-primary/5">
                      <img src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.full_name || "No name"}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm hover:scale-105 transition">
                    Send Salami Card
                  </div>
                </button>
              ))
            )}
          </div>

          {!loadingUsers && allUsers.length > 0 && (
            <div className="mt-6 flex items-center justify-between px-2">
              <button
                onClick={() => fetchPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i> Previous
              </button>
              <div className="text-sm font-bold text-gray-400">Page {page + 1}</div>
              <button
                onClick={() => fetchPage(page + 1)}
                disabled={allUsers.length < USERS_PER_PAGE}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50"
              >
                Next <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
