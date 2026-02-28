"use client";

import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";

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
  const [lang, setLang] = useState<"en" | "bn">("bn");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function downloadJpg() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#FFF9F5",
        pixelRatio: 2,
        skipFonts: true, // This prevents the SecurityError by stopping the crawler from reading external stylesheets
      });

      const link = document.createElement("a");
      link.download = `Salami-Card-${profile.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error("Save Image Error:", err);
      alert("Note: If the download fails, please ensure you are using a modern browser. You can also take a screenshot!");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-center gap-2 mb-2">
        <button onClick={() => setLang('bn')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'bn' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>বাংলা</button>
        <button onClick={() => setLang('en')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'en' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>English</button>
      </div>

      <div
        ref={cardRef}
        className="rounded-3xl bg-white border-2 border-primary/20 shadow-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fff9f5 100%)'
        }}
      >
        {/* Card Header Pattern */}
        <div className="h-32 bg-primary/10 relative overflow-hidden flex items-center justify-center border-b-4 border-primary/20">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #00A651 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="z-10 bg-white/60 backdrop-blur-md px-8 py-2 rounded-full border-2 border-white shadow-sm font-bold text-primary font-bangla text-2xl tracking-wide">
            {lang === 'bn' ? 'ঈদ মোবারক' : 'Eid Mubarak'}
          </div>
        </div>

        <div className="px-6 pb-8 pt-0 text-center relative">
          <div className="relative -mt-12 mb-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                crossOrigin="anonymous"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg relative z-10 bg-cream"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mx-auto border-4 border-white shadow-lg relative z-10 bg-cream">
                {(profile.full_name || profile.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 font-bangla drop-shadow-sm">
            {profile.full_name || `@${profile.username}`}
          </h1>

          <div className="mt-5 text-gray-800 font-bangla leading-relaxed bg-cream-dark/40 shadow-inner p-5 rounded-2xl text-lg relative">
            <span className="text-primary/30 text-4xl absolute top-2 left-3">"</span>
            <span className="relative z-10">{profile.card_quote || (lang === 'bn' ? 'ঈদ মোবারক! সালামি পাঠাতে নিচের নম্বরগুলো ব্যবহার করুন।' : 'Eid Mubarak! Use the numbers below to send Salami.')}</span>
            <span className="text-primary/30 text-4xl absolute -bottom-4 right-3">"</span>
          </div>

          <div className="mt-6 space-y-3 relative z-10">
            {profile.bkash_number && (
              <div className="flex items-center justify-between bg-pink-50 border border-pink-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_logo.svg/1200px-BKash_logo.svg.png"
                    className="h-6 object-contain"
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-pink-900">bKash</span>
                </div>
                <span className="font-mono font-bold text-pink-700 bg-white px-3 py-1 rounded-lg border border-pink-200">{profile.bkash_number}</span>
              </div>
            )}
            {profile.nagad_number && (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png"
                    className="h-8 -ml-1 object-contain"
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-orange-900">Nagad</span>
                </div>
                <span className="font-mono font-bold text-orange-700 bg-white px-3 py-1 rounded-lg border border-orange-200">{profile.nagad_number}</span>
              </div>
            )}
            {profile.rocket_number && (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://play-lh.googleusercontent.com/1nIQpQ8hD_PtyYhNIFdCHv8C3g-Uj8u-VdAYC-sU5M5JzNnU0T3y81x-Z1LhK87Gkw"
                    className="h-6 rounded-md object-contain"
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-purple-900">Rocket</span>
                </div>
                <span className="font-mono font-bold text-purple-700 bg-white px-3 py-1 rounded-lg border border-purple-200">{profile.rocket_number}</span>
              </div>
            )}
            {profile.upay_number && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://play-lh.googleusercontent.com/yv-z0UXXE9m_c0rI_Z-6j2aO2x5n8M8l_qJ7k5R8T_A2K7o_-lK4B_H8-p7h_8A3"
                    className="h-6 rounded-md object-contain"
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-blue-900">Upay</span>
                </div>
                <span className="font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">{profile.upay_number}</span>
              </div>
            )}
            {profile.dbbl_number && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://www.dutchbanglabank.com/img/dbbl-logo.png"
                    className="h-6 object-contain bg-white rounded-md p-1"
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-gray-900">DBBL</span>
                </div>
                <span className="font-mono font-bold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-300">{profile.dbbl_number}</span>
              </div>
            )}
            {!profile.bkash_number && !profile.nagad_number && !profile.rocket_number && !profile.upay_number && !profile.dbbl_number && (
              <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">{lang === 'bn' ? 'এখনো কোনো পেমেন্ট মেথড যোগ করা হয়নি।' : 'No payment methods added yet.'}</p>
            )}
          </div>

          <div className="mt-8 text-xs text-gray-400 font-mono tracking-wider opacity-60">
            digitalkham.vercel.app/{profile.username}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={downloadJpg}
          className="w-full rounded-2xl bg-gray-900 text-white px-4 py-4 font-bold shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-image"></i>
          {lang === 'bn' ? 'কার্ডটি সেভ করুন' : 'Save as Image'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={shareFacebook}
            className="flex-1 rounded-2xl bg-[#1877F2] text-white px-4 py-3 font-bold hover:bg-[#166fe5] shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-facebook"></i>
            {lang === 'bn' ? 'ফেসবুক' : 'Facebook'}
          </button>
          <button
            onClick={copyLink}
            className="flex-1 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 font-bold hover:bg-gray-50 shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-link'}`}></i>
            {copiedLink ? (lang === 'bn' ? "কপি হয়েছে!" : "Copied!") : (lang === 'bn' ? "লিঙ্ক কপি" : "Copy Link")}
          </button>
        </div>
      </div>
    </div>
  );
}
