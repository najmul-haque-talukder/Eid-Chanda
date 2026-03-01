"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";

export function ProfileManager({ initialProfile, user }: { initialProfile: any; user: User | null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signInWithGoogle() {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <div className="mt-8 space-y-6">
                <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-cream-dark flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                    <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-4xl text-gray-300">
                        <i className="fa-solid fa-user-lock"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Your profile is locked</h3>
                        <p className="text-gray-500 max-w-xs mt-2 text-sm leading-relaxed">
                            Log in with Google to create your Salami Request Card and start sending digital Khāms.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 font-bold text-gray-700 disabled:opacity-60 transition shadow-sm group"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {loading ? "Logging in..." : "Login with Google"}
                    </button>
                </div>

                {/* Blank placeholders as requested */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100"></div>
                    <div className="h-40 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100"></div>
                </div>
            </div>
        );
    }

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    // Profile Edit States
    const [fullName, setFullName] = useState(initialProfile?.full_name || "");
    const [username, setUsername] = useState(initialProfile?.username || "");
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");

    // Card Edit States
    const [cardQuote, setCardQuote] = useState(initialProfile?.card_quote || "");
    const [bkash, setBkash] = useState(initialProfile?.bkash_number || "");
    const [nagad, setNagad] = useState(initialProfile?.nagad_number || "");
    const [rocket, setRocket] = useState(initialProfile?.rocket_number || "");
    const [upay, setUpay] = useState(initialProfile?.upay_number || "");
    const [dbbl, setDbbl] = useState(initialProfile?.dbbl_number || "");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMsg("");
        const supabase = createClient();

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName.trim() || null,
                username: username.trim(),
                avatar_url: avatarUrl.trim() || null,
                card_quote: cardQuote.trim() || null,
                bkash_number: bkash.trim() || null,
                nagad_number: nagad.trim() || null,
                rocket_number: rocket.trim() || null,
                upay_number: upay.trim() || null,
                dbbl_number: dbbl.trim() || null,
            })
            .eq("id", initialProfile.id);

        setSaving(false);
        if (error) {
            setMsg(`Error: ${error.message}`);
        } else {
            setMsg("Successfully saved details!");
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 mt-6">
            {/* Edit Profile Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Edit Profile</h2>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center overflow-hidden shrink-0 border">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold text-xl">{fullName?.charAt(0) || username.charAt(0)}</span>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2" placeholder="Rahim Uddin" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray-50" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Image (Upload)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
            </div>

            {/* Add Your Card Feature */}
            <div className="bg-primary/5 p-6 rounded-2xl shadow-sm border border-primary/20 space-y-4">
                <h2 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">Add Your Salami Card 💳</h2>
                <p className="text-sm text-gray-600">Create a beautiful card with a quote and your payment numbers to share on Facebook!</p>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Card Quote / Letter</label>
                    <textarea value={cardQuote} onChange={e => setCardQuote(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 font-bangla" placeholder="Eid Mubarak! Salami din bkash e..." rows={3} />
                </div>
                <div>
                    <label className="block text-sm flex items-center gap-2 font-medium text-pink-600 font-bold"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_logo.svg/1200px-BKash_logo.svg.png" className="h-6 object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> bKash Number</label>
                    <input type="text" value={bkash} onChange={e => setBkash(e.target.value)} className="mt-1 block w-full rounded-xl border border-pink-200 px-4 py-2 focus:ring-pink-500" placeholder="+8801700000000" />
                </div>
                <div>
                    <label className="block text-sm flex items-center gap-2 font-medium text-orange-600 font-bold"><img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="h-6 object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> Nagad Number</label>
                    <input type="text" value={nagad} onChange={e => setNagad(e.target.value)} className="mt-1 block w-full rounded-xl border border-orange-200 px-4 py-2 focus:ring-orange-500" placeholder="+8801600000000" />
                </div>
                <div>
                    <label className="block text-sm flex items-center gap-2 font-medium text-purple-600 font-bold"><img src="https://play-lh.googleusercontent.com/1nIQpQ8hD_PtyYhNIFdCHv8C3g-Uj8u-VdAYC-sU5M5JzNnU0T3y81x-Z1LhK87Gkw" className="h-6 rounded-md object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> Rocket Number</label>
                    <input type="text" value={rocket} onChange={e => setRocket(e.target.value)} className="mt-1 block w-full rounded-xl border border-purple-200 px-4 py-2 focus:ring-purple-500" placeholder="+8801900000000" />
                </div>
                <div>
                    <label className="block text-sm flex items-center gap-2 font-medium text-blue-600 font-bold"><img src="https://play-lh.googleusercontent.com/yv-z0UXXE9m_c0rI_Z-6j2aO2x5n8M8l_qJ7k5R8T_A2K7o_-lK4B_H8-p7h_8A3" className="h-6 rounded-md object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> Upay Number</label>
                    <input type="text" value={upay} onChange={e => setUpay(e.target.value)} className="mt-1 block w-full rounded-xl border border-blue-200 px-4 py-2 focus:ring-blue-500" placeholder="+8801400000000" />
                </div>
                <div>
                    <label className="block text-sm flex items-center gap-2 font-medium text-gray-800 font-bold"><img src="https://www.dutchbanglabank.com/img/dbbl-logo.png" className="h-6 object-contain bg-white rounded-md p-1" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} /> DBBL / Nexus</label>
                    <input type="text" value={dbbl} onChange={e => setDbbl(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-gray-500" placeholder="Account Number" />
                </div>

                <div className="pt-4 flex items-center gap-4 flex-wrap">
                    <button type="submit" disabled={saving} className="rounded-xl bg-primary px-8 py-3 text-white font-bold hover:bg-primary-dark shadow-md transition disabled:opacity-50">
                        {saving ? "Saving..." : "Save Details & Generate Card"}
                    </button>
                    {msg && <p className={`text-sm ${msg.includes("Error") ? "text-red-500" : "text-green-600 font-bold"}`}>{msg}</p>}

                    {/* Show buttons if card exists */}
                    {(cardQuote || bkash || nagad) && msg.includes("Success") && (
                        <div className="w-full mt-4 flex gap-2">
                            <a href={`/${username}`} target="_blank" rel="noreferrer" className="flex-1 text-center bg-gray-900 text-white rounded-xl px-4 py-3 font-medium hover:bg-black transition">View My Card 👀</a>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
