"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type KhamData = {
  id: string;
  receiver_name: string;
  amount: string;
  letter_text: string | null;
  anonymous: boolean;
  voice_url: string | null;
  location: string | null;
  scheduled_at: string | null;
  delivered_at: string | null;
  created_at: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_avatar?: string | null;
  reaction: string | null;
  auto_destruct: boolean;
  payment_method?: string | null;
  payment_number?: string | null;
};

type Props = { kham: KhamData };

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

export function KhamEnvelopeExperience({ kham }: Props) {
  const [phase, setPhase] = useState<"envelope" | "countdown" | "reveal">("envelope");
  const [countdown, setCountdown] = useState("");
  const [canOpen, setCanOpen] = useState(false);
  const [isDestructed, setIsDestructed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reaction, setReaction] = useState<string | null>(kham.reaction);
  const [isReacting, setIsReacting] = useState(false);
  const [playMusic, setPlayMusic] = useState(true);
  const [lang, setLang] = useState<"en" | "bn">("bn");

  const scheduled = kham.scheduled_at ? new Date(kham.scheduled_at) : null;

  useEffect(() => {
    setMounted(true);
    if (!kham.scheduled_at || new Date(kham.scheduled_at) <= new Date()) {
      setCanOpen(true);
    }
    if (kham.auto_destruct && kham.delivered_at) {
      setIsDestructed(new Date().getTime() - new Date(kham.delivered_at).getTime() > 24 * 60 * 60 * 1000);
    }
  }, [kham]);

  useEffect(() => {
    if (!scheduled) {
      setCanOpen(true);
      return;
    }
    const tick = () => {
      const now = new Date();
      if (now >= scheduled) {
        setCanOpen(true);
        setCountdown("Now!");
        return;
      }
      const ms = scheduled.getTime() - now.getTime();
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [scheduled]);

  useEffect(() => {
    if (scheduled && !canOpen) setPhase("countdown");
  }, [scheduled, canOpen]);

  async function markDelivered() {
    const supabase = createClient();
    await supabase
      .from("khams")
      .update({ delivered_at: new Date().toISOString() })
      .eq("id", kham.id);
  }

  async function handleReact(emoji: string) {
    if (isReacting || reaction === emoji) return;
    setIsReacting(true);
    setReaction(emoji);

    // Optimistic UI, call db update
    const supabase = createClient();
    await supabase.from("khams").update({ reaction: emoji }).eq("id", kham.id);
    setIsReacting(false);
  }

  function handleOpen() {
    if (!canOpen) return;
    markDelivered();
    setPhase("reveal");
  }

  if (!mounted) return <div className="min-h-screen bg-cream"></div>;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 font-bangla">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setLang('bn')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'bn' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>বাংলা</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'en' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border'}`}>EN</button>
      </div>

      {isDestructed && (
        <div className="text-center animate-fade-in max-w-sm">
          <div className="text-6xl mb-4 animate-bounce text-gray-300">
            <i className="fa-solid fa-burst"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{lang === 'bn' ? 'পুফ! এটি গায়েব হয়ে গেছে।' : "Poof! It's gone."}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {lang === 'bn' ? 'এই খামটি খোলার ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে যাওয়ার জন্য সেট করা ছিল। স্মৃতি রয়ে গেছে, কিন্তু বার্তা মুছে গেছে।' : 'This Khām was set to self-destruct 24 hours after being opened. The memory remains, but the message has disappeared.'}
          </p>
          <Link href="/" className="inline-block rounded-2xl bg-gray-900 px-8 py-3 text-white font-bold shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all">
            {lang === 'bn' ? 'ঈদ চান্দায় ফিরে যান' : 'Back to Eid Chanda'}
          </Link>
        </div>
      )}

      {!isDestructed && phase === "envelope" && (
        <div className="text-center animate-envelope-flutter">
          <div className="relative w-72 h-44 mx-auto drop-shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-cream rounded-xl shadow-inner border-2 border-primary/40 paper-texture overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full transform translate-x-10 -translate-y-10" />
            </div>
            <div className="absolute inset-0 envelope-flap bg-primary/20 rounded-t-xl border-b border-white/40" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-primary/30 to-transparent rounded-b-xl" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-gray-800 drop-shadow-sm">{lang === 'bn' ? 'আপনার জন্য একটি খাম এসেছে' : 'You have a Khām'}</h2>
          <p className="text-md text-primary font-medium mt-1">~ {kham.receiver_name}</p>
          {canOpen ? (
            <button
              type="button"
              onClick={handleOpen}
              className="mt-8 rounded-full bg-primary px-10 py-4 text-white font-bold text-lg shadow-[0_10px_20px_rgba(226,19,110,0.3)] hover:shadow-[0_15px_30px_rgba(226,19,110,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <i className="fa-solid fa-envelope"></i>
              {lang === 'bn' ? 'খামটি খুলুন' : 'Open Envelope'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPhase("countdown")}
              className="mt-8 rounded-full bg-gray-800 px-10 py-4 text-white font-bold text-lg shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <i className="fa-solid fa-hourglass-half"></i>
              {lang === 'bn' ? 'কখন খুলবে দেখুন' : 'See when it unlocks'}
            </button>
          )}
        </div>
      )}

      {!isDestructed && phase === "countdown" && (
        <div className="text-center bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary/10">
          <div className="text-5xl font-bold text-primary mb-4 drop-shadow-sm">{countdown}</div>
          <p className="text-gray-600 text-lg">{lang === 'bn' ? 'এই খামটি খোলা যাবে:' : 'This Khām will open at:'}</p>
          <p className="text-xl font-bold text-gray-800 mt-2 bg-cream py-2 px-4 rounded-xl">
            {scheduled?.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <button
            type="button"
            onClick={() => setPhase("envelope")}
            className="mt-8 text-gray-500 font-bold hover:text-primary transition-colors underline"
          >
            {lang === 'bn' ? 'খামে ফিরে যান' : 'Back to envelope'}
          </button>
        </div>
      )}

      {!isDestructed && phase === "reveal" && (
        <div className="w-full max-w-md space-y-6 animate-letter-reveal">

          {/* Subtle Background Audio (Autoplay may be blocked by browsers, so toggle is nice) */}
          {playMusic && (
            <audio src="https://assets.mixkit.co/active_storage/sfx/223/223-preview.mp3" autoPlay loop className="hidden" />
          )}

          <div className="flex justify-end">
            <button title="Toggle Sound" onClick={() => setPlayMusic(!playMusic)} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-primary transition-colors text-lg">
              {playMusic ? <i className="fa-solid fa-volume-high"></i> : <i className="fa-solid fa-volume-xmark"></i>}
            </button>
          </div>

          <div className="rounded-none bg-[#f4ecd8] border border-[#d2b48c] shadow-[4px_8px_15px_rgba(0,0,0,0.2)] p-8 md:p-12 relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#d3c1a3 1px, transparent 0)',
              backgroundSize: '24px 24px',
              backgroundColor: '#f4ecd8'
            }}>

            {/* Vintage Postal Stamps */}
            <div className="absolute top-6 right-6 w-14 h-20 border-2 border-[#c26a6a] bg-[#e8dcc4] shadow-sm flex flex-col items-center justify-center -rotate-6 z-0">
              <span className="text-[#c26a6a] text-[10px] font-bold tracking-widest uppercase border border-[#c26a6a] px-1 text-center font-bangla">ডাক<br />টিকিট</span>
              <span className="text-[#c26a6a] font-mono text-[8px] mt-1 font-bold">10 P.</span>
            </div>
            <div className="absolute top-10 right-14 w-24 h-24 rounded-full border-[5px] border-[#3a5a40] opacity-20 flex items-center justify-center rotate-12 flex-col z-0">
              <span className="text-[#3a5a40] text-[9px] font-bold tracking-widest uppercase">POST OFFICE</span>
              <span className="text-[#3a5a40] text-xl font-bold font-serif">DHAKA</span>
              <span className="text-[#3a5a40] text-[8px] mt-1">{new Date().getFullYear()}</span>
            </div>

            <p className="text-xs text-[#8b7355] font-medium text-left mb-8 font-mono border-b border-[#d2b48c] pb-2 relative z-10 w-max">
              তারিখ: {new Date(kham.created_at).toLocaleDateString('en-GB')}
            </p>

            <div className="flex flex-col mb-8 relative z-10">
              <p className="text-[#5c4a3d] font-bangla text-lg font-bold tracking-wide">
                প্রেরক:
              </p>
              <div className="flex items-center gap-3 mt-2">
                {kham.sender_avatar && !kham.anonymous ? (
                  <img src={kham.sender_avatar} className="w-14 h-14 rounded-full border-2 border-[#d2b48c] grayscale-[30%] sepia-[40%]" />
                ) : !kham.anonymous ? (
                  <div className="w-14 h-14 rounded-full bg-[#e3d1b6] border-2 border-[#d2b48c] flex items-center justify-center text-[#5c4a3d] text-2xl font-bold">
                    {(kham.sender_name || "?")[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#5c4a3d] border-2 border-[#d2b48c] flex items-center justify-center text-[#f4ecd8] text-2xl">
                    <i className="fa-solid fa-user-secret"></i>
                  </div>
                )}
                {kham.sender_name && (
                  <p className="text-2xl text-[#3e3229] font-bold font-bangla border-b-[1.5px] border-dotted border-[#8b7355] pb-1 inline-block flex items-center gap-2">
                    {kham.anonymous ?
                      <span className="flex items-center gap-2">{lang === 'bn' ? "বেনামী" : "Anonymous"} <i className="fa-solid fa-user-secret text-sm"></i></span>
                      : kham.sender_name}
                  </p>
                )}
              </div>
            </div>

            {kham.letter_text && (
              <div className="text-[#2a241f] text-xl leading-[2.5] mb-12 font-bangla whitespace-pre-wrap relative z-10">
                <span className="text-[#b09677] text-3xl font-serif mr-2">❝</span>
                {kham.letter_text}
                <span className="text-[#b09677] text-3xl font-serif ml-2">❞</span>
              </div>
            )}

            {kham.voice_url && (
              <audio controls src={kham.voice_url} className="w-full my-4" />
            )}

            <div className="pt-6 border-t-2 border-dashed border-gray-200">
              <p className="text-sm font-bold tracking-widest text-primary uppercase mb-4 text-center bg-cream py-1 px-4 rounded-full inline-block mx-auto flex justify-center w-max">
                {lang === 'bn' ? 'সালামি রিকোয়েস্ট' : 'Salami Request Details'}
              </p>

              {kham.payment_method && kham.payment_number ? (
                <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm
                    ${kham.payment_method.toLowerCase() === 'bkash' ? 'bg-pink-50 border-pink-200'
                    : kham.payment_method.toLowerCase() === 'nagad' ? 'bg-orange-50 border-orange-200'
                      : kham.payment_method.toLowerCase() === 'rocket' ? 'bg-purple-50 border-purple-200'
                        : kham.payment_method.toLowerCase() === 'upay' ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    {kham.payment_method.toLowerCase() === 'bkash' ? (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BKash_logo.svg/1200px-BKash_logo.svg.png" className="h-6 object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : kham.payment_method.toLowerCase() === 'nagad' ? (
                      <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="h-8 -ml-1 object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : kham.payment_method.toLowerCase() === 'rocket' ? (
                      <img src="https://play-lh.googleusercontent.com/1nIQpQ8hD_PtyYhNIFdCHv8C3g-Uj8u-VdAYC-sU5M5JzNnU0T3y81x-Z1LhK87Gkw" className="h-6 rounded-md object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : kham.payment_method.toLowerCase() === 'upay' ? (
                      <img src="https://play-lh.googleusercontent.com/yv-z0UXXE9m_c0rI_Z-6j2aO2x5n8M8l_qJ7k5R8T_A2K7o_-lK4B_H8-p7h_8A3" className="h-6 rounded-md object-contain" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <img src="https://www.dutchbanglabank.com/img/dbbl-logo.png" className="h-6 object-contain bg-white rounded-md p-1" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                    <span className={`font-medium 
                        ${kham.payment_method.toLowerCase() === 'bkash' ? 'text-pink-900'
                        : kham.payment_method.toLowerCase() === 'nagad' ? 'text-orange-900'
                          : kham.payment_method.toLowerCase() === 'rocket' ? 'text-purple-900'
                            : kham.payment_method.toLowerCase() === 'upay' ? 'text-blue-900'
                              : 'text-gray-900'}`}
                    >
                      {kham.payment_method}
                    </span>
                  </div>
                  <span className={`font-mono font-bold bg-white px-3 py-1 rounded-lg shadow-sm border 
                        ${kham.payment_method.toLowerCase() === 'bkash' ? 'text-pink-700 border-pink-100'
                      : kham.payment_method.toLowerCase() === 'nagad' ? 'text-orange-700 border-orange-100'
                        : kham.payment_method.toLowerCase() === 'rocket' ? 'text-purple-700 border-purple-100'
                          : kham.payment_method.toLowerCase() === 'upay' ? 'text-blue-700 border-blue-100'
                            : 'text-gray-700 border-gray-300'}`}
                  >
                    {kham.payment_number}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary animate-amount-pop">
                    {kham.amount}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center bg-white p-6 rounded-3xl shadow-lg border-2 border-primary/10">
            <p className="text-md font-bold text-gray-600 mb-4">{lang === 'bn' ? 'খামটিতে রিয়েক্ট করুন' : 'React to this Khām'}</p>
            <div className="flex justify-center gap-6 text-3xl">
              {[
                { emoji: '❤️', icon: 'fa-heart text-red-500' },
                { emoji: '🥹', icon: 'fa-face-grin-stars text-yellow-500' },
                { emoji: '😂', icon: 'fa-face-laugh-squint text-orange-500' },
                { emoji: '🤲', icon: 'fa-person-praying text-primary' }
              ].map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReact(item.emoji)}
                  disabled={isReacting}
                  className={`hover:scale-125 hover:-translate-y-2 transition-all duration-300 ${reaction === item.emoji ? 'scale-125 ring-4 ring-primary bg-primary/10 rounded-full' : 'filter grayscale hover:grayscale-0'} p-3 flex items-center justify-center`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                </button>
              ))}
            </div>
            {reaction && <p className="text-sm font-bold text-primary mt-4 animate-fade-in">{lang === 'bn' ? 'প্রেরকের কাছে রিয়েকশন পৌঁছেছে!' : 'Reaction sent to sender!'}</p>}
          </div>

          <div className="text-center pb-6">
            <p className="text-sm text-gray-500 font-medium">
              <Link href="/" className="text-primary font-bold hover:underline transition-all">Eid Chanda</Link> — {lang === 'bn' ? 'ডিজিটাল ঈদ অভিজ্ঞতা' : 'Digital Eid Experience'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
