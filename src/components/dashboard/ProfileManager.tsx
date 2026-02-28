"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfileManager({ initialProfile }: { initialProfile: any }) {
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
