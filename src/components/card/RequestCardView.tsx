"use client";

import { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";
import {
  Moon,
  Star,
  Quote,
  Banknote,
  Check,
  Copy,
  Building2,
  Camera,
  Loader2,
  Facebook,
  Link2
} from "lucide-react";

type ProfileProps = {
  id?: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  card_quote?: string | null;
  bkash_number?: string | null;
  nagad_number?: string | null;
  rocket_number?: string | null;
  upay_number?: string | null;
  dbbl_number?: string | null;
};

export function RequestCardView({ profile }: { profile: ProfileProps }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("bn");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function downloadJpg() {
    if (!cardRef.current || isSaving) return;
    setIsSaving(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
        skipFonts: false,
      });

      const link = document.createElement("a");
      link.download = `Eid-Card-${profile.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error("Save Image Error:", err);
      alert("Note: If the download fails, please try taking a screenshot! 📸");
    } finally {
      setIsSaving(false);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-center gap-2 mb-2">
        <button onClick={() => setLang('bn')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'bn' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>বাংলা</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'en' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>English</button>
      </div>

      {/* --- THE CARD --- */}
      <div
        ref={cardRef}
        className="rounded-3xl bg-white border-2 border-primary/20 shadow-2xl overflow-hidden relative"
        style={{ background: '#ffffff' }}
      >
        <div className="h-28 bg-primary/5 flex items-center justify-center border-b-2 border-primary/10">
          <h2 className="text-primary font-black text-2xl font-bangla flex items-center gap-2">
            <Moon className="text-primary/40" size={16} />
            {lang === 'bn' ? 'ঈদ মোবারক' : 'Eid Mubarak'}
            <Star className="text-primary/40" size={16} />
          </h2>
        </div>

        <div className="px-6 pb-10 pt-0 text-center relative">
          <div className="relative -mt-12 mb-4 flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-cream flex items-center justify-center z-10">
              {profile.avatar_url ? (
                <NextImage
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover rounded-full"
                  width={96}
                  height={96}
                  unoptimized
                />
              ) : (
                <span className="text-primary text-3xl font-black">{(profile.full_name || profile.username)[0].toUpperCase()}</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 font-bangla tracking-tight mb-4">
            {profile.full_name || `@${profile.username}`}
          </h1>

          {/* QUOTE BLOCK WITH FONT AWESOME ICONS */}
          <div className="mb-6 p-5 rounded-2xl bg-cream/20 border border-cream text-gray-700 font-bangla text-base leading-relaxed relative italic">
            <Quote className="text-primary/10 absolute top-2 left-2 rotate-180" size={32} />
            <span className="relative z-10 px-4 inline-block">
              {profile.card_quote || (lang === 'bn' ? 'ঈদ মোবারক! সালামি পাঠাতে নিচের নম্বরগুলো ব্যবহার করুন।' : 'Eid Mubarak! Use the numbers below to send Salami.')}
            </span>
            <Quote className="text-primary/10 absolute bottom-2 right-2" size={32} />
          </div>

          <div className="space-y-3">
            {profile.bkash_number && (
              <button onClick={() => copyToClipboard(profile.bkash_number!, 'bkash')} className="w-full flex items-center justify-between bg-pink-50/50 border border-pink-100 p-3 rounded-xl hover:bg-pink-100 transition-all relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Banknote className="text-pink-600" size={18} />
                  <span className="font-bold text-pink-700 text-sm">bKash</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-pink-700">{profile.bkash_number}</span>
                  {copiedType === 'bkash' ? <Check className="text-green-500" size={16} /> : <Copy className="text-pink-300 opacity-0 group-hover:opacity-100" size={16} />}
                </div>
                {copiedType === 'bkash' && <span className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-green-700 text-xs tracking-widest uppercase">Copied!</span>}
              </button>
            )}

            {profile.nagad_number && (
              <button onClick={() => copyToClipboard(profile.nagad_number!, 'nagad')} className="w-full flex items-center justify-between bg-orange-50/50 border border-orange-100 p-3 rounded-xl hover:bg-orange-100 transition-all relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Banknote className="text-orange-600" size={18} />
                  <span className="font-bold text-orange-700 text-sm">Nagad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-orange-700">{profile.nagad_number}</span>
                  {copiedType === 'nagad' ? <Check className="text-green-500" size={16} /> : <Copy className="text-orange-300 opacity-0 group-hover:opacity-100" size={16} />}
                </div>
                {copiedType === 'nagad' && <span className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-green-700 text-xs tracking-widest uppercase">Copied!</span>}
              </button>
            )}

            {profile.rocket_number && (
              <button onClick={() => copyToClipboard(profile.rocket_number!, 'rocket')} className="w-full flex items-center justify-between bg-purple-50/50 border border-purple-100 p-3 rounded-xl hover:bg-purple-100 transition-all relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Banknote className="text-purple-600" size={18} />
                  <span className="font-bold text-purple-700 text-sm">Rocket</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-purple-700">{profile.rocket_number}</span>
                  {copiedType === 'rocket' ? <Check className="text-green-500" size={16} /> : <Copy className="text-purple-300 opacity-0 group-hover:opacity-100" size={16} />}
                </div>
                {copiedType === 'rocket' && <span className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-green-700 text-xs tracking-widest uppercase">Copied!</span>}
              </button>
            )}

            {profile.upay_number && (
              <button onClick={() => copyToClipboard(profile.upay_number!, 'upay')} className="w-full flex items-center justify-between bg-blue-50/50 border border-blue-100 p-3 rounded-xl hover:bg-blue-100 transition-all relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Banknote className="text-blue-600" size={18} />
                  <span className="font-bold text-blue-700 text-sm">Upay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-blue-700">{profile.upay_number}</span>
                  {copiedType === 'upay' ? <Check className="text-green-500" size={16} /> : <Copy className="text-blue-300 opacity-0 group-hover:opacity-100" size={16} />}
                </div>
                {copiedType === 'upay' && <span className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-green-700 text-xs tracking-widest uppercase">Copied!</span>}
              </button>
            )}

            {profile.dbbl_number && (
              <button onClick={() => copyToClipboard(profile.dbbl_number!, 'dbbl')} className="w-full flex items-center justify-between bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl hover:bg-emerald-100 transition-all relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <Building2 className="text-emerald-600" size={18} />
                  <span className="font-bold text-emerald-700 text-sm">DBBL / Nexus</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-700">{profile.dbbl_number}</span>
                  {copiedType === 'dbbl' ? <Check className="text-green-500" size={16} /> : <Copy className="text-emerald-300 opacity-0 group-hover:opacity-100" size={16} />}
                </div>
                {copiedType === 'dbbl' && <span className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-green-700 text-xs tracking-widest uppercase">Copied!</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={downloadJpg}
          disabled={isSaving}
          className="w-full rounded-2xl bg-gray-900 text-white px-4 py-4 font-black shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          {isSaving ? (lang === 'bn' ? 'প্রসেসিং...' : 'Processing...') : (lang === 'bn' ? 'কার্ডটি ডাউনলোড করুন' : 'Download Photo')}
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")} className="flex-1 rounded-2xl bg-[#1877F2] text-white px-4 py-3 font-black hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-2">
            <Facebook size={18} /> FACEBOOK
          </button>
          <button onClick={copyLink} className="flex-1 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            {copiedLink ? <Check className="text-green-500" size={18} /> : <Link2 size={18} />}
            {copiedLink ? (lang === 'bn' ? "সফল!" : "Copied!") : (lang === 'bn' ? "লিঙ্ক কপি" : "Copy Link")}
          </button>
        </div>
      </div>
    </div>
  );
}
