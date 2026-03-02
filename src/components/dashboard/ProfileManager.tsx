"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ToastContext";

export function ProfileManager({
  initialProfile,
  user,
}: {
  initialProfile: any;
  user: User | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth UI States
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginId, setLoginId] = useState("");

  // Profile & Card Data
  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [cardQuote, setCardQuote] = useState(initialProfile?.card_quote || "");
  const [bkash, setBkash] = useState(initialProfile?.bkash_number || "");
  const [nagad, setNagad] = useState(initialProfile?.nagad_number || "");
  const [rocket, setRocket] = useState(initialProfile?.rocket_number || "");
  const [upay, setUpay] = useState(initialProfile?.upay_number || "");
  const [dbbl, setDbbl] = useState(initialProfile?.dbbl_number || "");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // --- AUTH HANDLER ---
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            username: regUsername.toLowerCase().trim(),
          },
        },
      });
      if (signUpError) setError(signUpError.message);
      else if (data.user) {
        setIsSignUp(false);
        setLoginId(regEmail);
      }
    } else {
      let email = loginId.trim();
      if (!email.includes("@")) {
        const { data: p } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", email.toLowerCase())
          .single();
        if (p?.email) email = p.email;
      }
      const { error: signInError, data: signInData } =
        await supabase.auth.signInWithPassword({
          email,
          password: regPassword,
        });
      if (signInError) setError(signInError.message);
      else if (signInData.session) router.refresh();
    }
    setLoading(false);
  }

  // --- PROFILE SAVE ---
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    const supabase = createClient();

    const { error } = await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: fullName,
      username: username.toLowerCase().trim(),
      avatar_url: avatarUrl,
      card_quote: cardQuote,
      bkash_number: bkash,
      nagad_number: nagad,
      rocket_number: rocket,
      upay_number: upay,
      dbbl_number: dbbl,
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setSavedSuccess(true);
      router.refresh();
    }
    setSaving(false);
  }

  // --- IMAGE UPLOAD & COMPRESSION ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
        setAvatarUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- SHARE LOGIC ---
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`;
  const shareText = `সালামি দিন এইখানে! আমার ঈদ কার্ড দেখুন: ${shareUrl}`;

  const handleShare = (platform: "fb" | "wa" | "copy") => {
    if (platform === "fb")
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    if (platform === "wa")
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        "_blank",
      );
    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      showToast("Link Copied Successfully! 🎉", "success");
    }
  };

  if (!user) {
    return (
      <div className="mt-8 bg-white p-8 rounded-[2.5rem] border-2 border-cream-dark shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            <i
              className={`fa-solid ${isSignUp ? "fa-user-plus" : "fa-lock"}`}
            ></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            {isSignUp ? "Create Card" : "Sign In"}
          </h2>
          <p className="text-gray-500 font-bangla">
            {isSignUp
              ? "সহজেই অ্যাকাউন্ট তৈরি করুন"
              : "আপনার কার্ড ম্যানেজ করতে লগইন করুন"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-cream-dark focus:border-primary outline-none font-semibold"
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-cream-dark focus:border-primary outline-none font-semibold"
                required
              />
            </div>
          )}
          <input
            type={isSignUp ? "email" : "text"}
            placeholder={isSignUp ? "Email Address" : "Username or Email"}
            value={isSignUp ? regEmail : loginId}
            onChange={(e) =>
              isSignUp
                ? setRegEmail(e.target.value)
                : setLoginId(e.target.value)
            }
            className="w-full px-5 py-4 rounded-2xl border-2 border-cream-dark focus:border-primary outline-none font-semibold"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-cream-dark focus:border-primary outline-none font-semibold pr-14"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary"
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-primary-dark transition-all"
          >
            {loading
              ? "AUTHENTICATING..."
              : isSignUp
                ? "JOIN EID CHANDA"
                : "LOG IN NOW"}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-primary font-bold hover:underline"
        >
          {isSignUp ? "Already a member? Sign In" : "New? Create an account"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      {/* --- TOP PROFILE HEADER --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-cream-dark shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-primary/5"></div>
        <div className="relative z-10">
          <div
            className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl bg-cream flex items-center justify-center overflow-hidden mb-4 group cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-3xl font-black text-primary">
                {fullName.charAt(0) || "U"}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
              <i className="fa-solid fa-camera text-white text-xl"></i>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {fullName || "Your Name"}
          </h2>
          <p className="text-primary font-bold text-sm bg-primary/5 px-4 py-1 rounded-full inline-block">
            @{username}
          </p>
        </div>
        <button
          onClick={async () => {
            await createClient().auth.signOut();
            router.refresh();
          }}
          className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
        >
          <i className="fa-solid fa-sign-out text-xl"></i>
        </button>
      </div>

      {/* --- CARD EDIT FORM --- */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white p-8 rounded-[2.5rem] border-2 border-cream-dark shadow-xl space-y-6"
      >
        <div className="border-b-2 border-cream pb-4 mb-4">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-primary"></i> Edit Card
            Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-cream/30 border-2 border-cream focus:border-primary outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Username (URL)
            </label>
            <input
              type="text"
              value={username}
              className="w-full px-5 py-3 rounded-2xl bg-cream/30 border-2 border-cream focus:border-primary outline-none font-bold opacity-50 cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Eid Quote / Message
          </label>
          <textarea
            value={cardQuote}
            onChange={(e) => setCardQuote(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-cream/30 border-2 border-cream focus:border-primary outline-none font-medium font-bangla h-24"
            placeholder="ঈদ মোবারক! এই ঈদে সালামি দিন এখানে..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* bKash */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-pink-600 flex items-center gap-1 uppercase ml-1">
              <i className="fa-solid fa-mobile-screen"></i> bKash
            </label>
            <input
              type="text"
              value={bkash}
              onChange={(e) => setBkash(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-500 outline-none font-bold text-sm"
              placeholder="Number"
            />
          </div>
          {/* Nagad */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-orange-600 flex items-center gap-1 uppercase ml-1">
              <i className="fa-solid fa-mobile-screen"></i> Nagad
            </label>
            <input
              type="text"
              value={nagad}
              onChange={(e) => setNagad(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-orange-100 focus:border-orange-500 outline-none font-bold text-sm"
              placeholder="Number"
            />
          </div>
          {/* Rocket */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-purple-600 flex items-center gap-1 uppercase ml-1">
              <i className="fa-solid fa-mobile-screen"></i> Rocket
            </label>
            <input
              type="text"
              value={rocket}
              onChange={(e) => setRocket(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-purple-100 focus:border-purple-500 outline-none font-bold text-sm"
              placeholder="Number"
            />
          </div>
          {/* Upay */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-600 flex items-center gap-1 uppercase ml-1">
              <i className="fa-solid fa-mobile-screen"></i> Upay
            </label>
            <input
              type="text"
              value={upay}
              onChange={(e) => setUpay(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-blue-100 focus:border-blue-500 outline-none font-bold text-sm"
              placeholder="Number"
            />
          </div>
          {/* DBBL */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-xs font-bold text-red-600 flex items-center gap-1 uppercase ml-1">
              <i className="fa-solid fa-building-columns"></i> Dutch Bangla Bank
              / Nexus
            </label>
            <input
              type="text"
              value={dbbl}
              onChange={(e) => setDbbl(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-red-100 focus:border-red-500 outline-none font-bold text-sm"
              placeholder="Account Number"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            "SAVING..."
          ) : (
            <>
              <i className="fa-solid fa-circle-check"></i> Save & Update My Card
            </>
          )}
        </button>
      </form>

      {/* --- SHARE SECTION --- */}
      {(savedSuccess || cardQuote) && (
        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-xl space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-primary">
              <i className="fa-solid fa-bullhorn mr-2"></i> Card is Live!
            </h3>
            <p className="text-sm font-bold text-primary/60 mt-1">
              Share your link to receive Salami
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 flex items-center gap-3">
            <div className="flex-1 truncate font-bold text-sm text-gray-500">
              {shareUrl}
            </div>
            <button
              onClick={() => handleShare("copy")}
              className="bg-primary text-white p-2 px-4 rounded-xl text-xs font-black"
            >
              COPY
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleShare("fb")}
              className="bg-[#1877F2] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <i className="fa-brands fa-facebook-f"></i> FACEBOOK
            </button>
            <button
              onClick={() => handleShare("wa")}
              className="bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <i className="fa-brands fa-whatsapp"></i> WHATSAPP
            </button>
          </div>

          <a
            href={`/${username}`}
            target="_blank"
            className="block text-center text-primary font-black hover:underline"
          >
            VIEW MY LIVE CARD <i className="fa-solid fa-eye ml-2"></i>
          </a>
        </div>
      )}
    </div>
  );
}
