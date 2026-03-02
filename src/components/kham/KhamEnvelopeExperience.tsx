"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import * as htmlToImage from "html-to-image";

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
  reaction?: string | null;
  auto_destruct: boolean;
  payment_method?: string | null;
  payment_number?: string | null;
  sender_payments?: {
    bkash?: string | null;
    nagad?: string | null;
    rocket?: string | null;
    upay?: string | null;
    dbbl?: string | null;
  } | null;
};

type Props = { kham: KhamData };

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
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  async function markDelivered() {
    const supabase = createClient();
    await supabase.from("khams").update({ delivered_at: new Date().toISOString() }).eq("id", kham.id);
  }

  async function handleReact(emoji: string) {
    // Temporarily disabled as the column is missing in DB
    return;
  }

  function handleOpen() {
    if (!canOpen) return;
    markDelivered();
    setPhase("reveal");
  }

  async function downloadCard() {
    if (!cardRef.current || isSaving) return;
    setIsSaving(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `Eid-Chithi-${kham.id}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download Error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function copyCurrentLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (!mounted) return <div className="min-h-screen bg-cream"></div>;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 font-bangla transition-all duration-700">
      <div className="fixed top-6 right-6 flex gap-2 z-50">
        <button
          onClick={() => setLang("bn")}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${lang === "bn" ? "bg-primary text-white shadow-lg ring-2 ring-primary/20" : "bg-white text-gray-400 hover:bg-gray-50 border"}`}
        >
          বং
        </button>
        <button
          onClick={() => setLang("en")}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${lang === "en" ? "bg-primary text-white shadow-lg ring-2 ring-primary/20" : "bg-white text-gray-400 hover:bg-gray-50 border"}`}
        >
          EN
        </button>
      </div>

      {isDestructed ? (
        <div className="text-center animate-in fade-in zoom-in duration-500 max-w-sm">
          <div className="text-7xl mb-6 text-gray-200">
            <i className="fa-solid fa-burst animate-pulse"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">{lang === "bn" ? "খামটি মুছে গেছে!" : "Kham Expired!"}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {lang === "bn" ? "এটি ২৪ ঘণ্টা আগে খোলা হয়েছিল এবং নিয়ম অনুযায়ী মুছে গেছে।" : "This Khām self-destructed 24 hours after being opened."}
          </p>
          <Link href="/" className="inline-block rounded-3xl bg-gray-900 px-10 py-4 text-white font-black shadow-xl hover:-translate-y-1 transition-all">
            {lang === "bn" ? "হোমপেজে যান" : "Back to Home"}
          </Link>
        </div>
      ) : phase === "envelope" ? (
        <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="relative w-72 h-44 mx-auto group cursor-pointer" onClick={handleOpen}>
            <div className="absolute inset-0 bg-gradient-to-br from-white to-cream rounded-[2rem] shadow-2xl border-2 border-primary/20 paper-texture overflow-hidden group-hover:scale-110 transition-transform duration-500">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            </div>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-primary/20 rounded-t-[2rem] border-b border-white/40" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-envelope-heart text-5xl text-primary animate-bounce-short"></i>
            </div>
          </div>
          <h2 className="mt-12 text-3xl font-black text-gray-900 drop-shadow-sm font-bangla">
            {lang === "bn" ? "একটি সুন্দর ঈদ খাম!" : "A Wonderful Eid Kham!"}
          </h2>
          <p className="text-primary font-black mt-2 tracking-widest uppercase text-xs">For: {kham.receiver_name}</p>

          <button
            type="button"
            onClick={handleOpen}
            disabled={!canOpen}
            className={`mt-10 rounded-3xl px-12 py-5 text-white font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto
                ${canOpen ? "bg-primary hover:scale-105 hover:-translate-y-1" : "bg-gray-400 cursor-not-allowed opacity-50"}`}
          >
            {canOpen ? (
              <>
                <i className="fa-solid fa-envelope-open-text"></i>
                {lang === "bn" ? "খামটি খুলে দেখুন" : "Open Kham Now"}
              </>
            ) : (
              <>
                <i className="fa-solid fa-clock"></i>
                {countdown}
              </>
            )}
          </button>
        </div>
      ) : phase === "reveal" ? (
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-20 duration-1000">
          <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-3 px-5 rounded-[2rem] border-2 border-primary/10 shadow-lg">
            <Link href="/received" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-xs font-black">
              <i className="fa-solid fa-circle-left text-lg"></i> {lang === "bn" ? "তালিকায় ফিরে যান" : "Received List"}
            </Link>
            <div className="flex items-center gap-2">
              <button title="Copy Link" onClick={copyCurrentLink} className="p-2.5 bg-gray-50 rounded-full text-gray-500 hover:text-primary transition-all border border-gray-100">
                <i className={`fa-solid ${copiedLink ? "fa-check text-green-500" : "fa-link"}`}></i>
              </button>
              <button title="Toggle Sound" onClick={() => setPlayMusic(!playMusic)} className="p-2.5 bg-gray-50 rounded-full text-gray-500 hover:text-primary transition-all border border-gray-100">
                {playMusic ? <i className="fa-solid fa-volume-high"></i> : <i className="fa-solid fa-volume-xmark"></i>}
              </button>
            </div>
          </div>

          <div ref={cardRef} className="w-full aspect-square bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative flex flex-col overflow-hidden" style={{ borderRadius: "0px" }}>
            {/* Decorative Corner Element */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2136E]/5 rounded-bl-[100%] pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 relative z-10">
              {/* Top Icon */}
              <div className="mb-8 relative h-24 flex items-center justify-center">
                <i className="fa-solid fa-star-and-crescent text-[#E2136E] text-8xl transform -rotate-12 opacity-90 animate-pulse"></i>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl font-black text-[#E2136E] font-bangla mb-10 tracking-tighter drop-shadow-sm">
                {lang === "bn" ? "ঈদ মোবারক" : "Eid Mubarak"}
              </h1>

              {/* Message Block */}
              <div className="max-w-sm text-center mb-12">
                <p className="text-xl md:text-2xl font-bangla text-gray-800 leading-relaxed font-medium">
                  {kham.letter_text || (lang === "bn"
                    ? "আপনাকে পবিত্র রমজানের শুভেচ্ছা! পরিবার ও প্রিয়জন নিয়ে আপনার ঈদ হয়ে উঠুক আনন্দের!"
                    : "Best wishes for a holy Ramadan! May your Eid be filled with joy with family and loved ones!")}
                </p>
                {kham.amount && kham.amount !== "Request" && (
                  <p className="mt-6 text-4xl font-black text-[#E2136E] drop-shadow-sm font-serif italic">
                    ৳{kham.amount}
                  </p>
                )}
              </div>

              {/* Content Grid for Payment and Sender */}
              <div className="w-full mt-auto flex flex-col gap-4">
                {/* All Payment Methods (Left Aligned) */}
                <div className="flex flex-col gap-0.5 text-left border-l-4 border-[#E2136E]/20 pl-4 py-1">
                  {kham.sender_payments ? (
                    <>
                      {kham.sender_payments.bkash && (
                        <p className="text-base font-bold text-gray-800 font-bangla">
                          বিকাশ : <span className="font-mono text-gray-500 ml-1">{kham.sender_payments.bkash}</span>
                        </p>
                      )}
                      {kham.sender_payments.nagad && (
                        <p className="text-base font-bold text-gray-800 font-bangla">
                          নগদ : <span className="font-mono text-gray-500 ml-1">{kham.sender_payments.nagad}</span>
                        </p>
                      )}
                      {kham.sender_payments.rocket && (
                        <p className="text-base font-bold text-gray-800 font-bangla">
                          রকেট : <span className="font-mono text-gray-500 ml-1">{kham.sender_payments.rocket}</span>
                        </p>
                      )}
                      {kham.sender_payments.upay && (
                        <p className="text-base font-bold text-gray-800 font-bangla">
                          উপায় : <span className="font-mono text-gray-500 ml-1">{kham.sender_payments.upay}</span>
                        </p>
                      )}
                      {kham.sender_payments.dbbl && (
                        <p className="text-base font-bold text-gray-800 font-bangla">
                          ডাচ-বাংলা : <span className="font-mono text-gray-500 ml-1">{kham.sender_payments.dbbl}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-base font-bold text-gray-800 font-bangla">
                      {kham.payment_method}ঃ <span className="font-mono text-gray-500 ml-1">{kham.payment_number}</span>
                    </p>
                  )}
                </div>

                {/* Sender Attribution (Bottom Right) */}
                <div className="flex justify-end items-baseline gap-2">
                  <p className="text-lg text-gray-600 font-bangla">
                    পাঠিয়েছেন :  <span className="font-black text-[#E2136E] text-2xl ml-1">
                      {kham.anonymous ? (lang === "bn" ? "গোপন বন্ধু" : "Anonymous") : (kham.sender_name || (lang === "bn" ? "আপনার আপনজন" : "A Friend"))}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Community Strip */}
            <div className="bg-[#e2136e] py-4 text-center w-full mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
              <p className="text-white font-bangla text-base md:text-lg font-bold tracking-tight px-4 opacity-95">
                {lang === "bn" ? "ঈদ চান্দা কমিউনিটি থেকেও আপনাকে ঈদ মোবারক" : "Eid Mubarak from the Eid Chanda Community"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 py-4">
            <button
              onClick={downloadCard}
              disabled={isSaving}
              className="w-full bg-gray-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all text-xl"
            >
              {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>}
              {lang === "bn" ? "কার্ডটি গ্যালারিতে সেভ করুন" : "Save This Chithi"}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  const text = lang === "bn"
                    ? "আমি একটি সুন্দর ডিজিটাল ঈদ খাম পেয়েছি! দেখুন এখানে: " + url
                    : "Check out this wonderful Digital Eid Kham I received! See here: " + url;
                  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
                }}
                className="bg-[#25D366] text-white py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 text-sm shadow-xl hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i> WHATSAPP
              </button>
              <button
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank");
                }}
                className="bg-[#1877F2] text-white py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 text-sm shadow-xl hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                <i className="fa-brands fa-facebook-f text-xl"></i> FACEBOOK
              </button>
            </div>
          </div>

          <div className="text-center pt-6 pb-12">
            <p className="text-[10px] text-gray-400 font-black tracking-[0.3em] uppercase">
              Powered by{" "}
              <Link href="/" className="text-primary hover:underline">
                Eid Chanda
              </Link>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
