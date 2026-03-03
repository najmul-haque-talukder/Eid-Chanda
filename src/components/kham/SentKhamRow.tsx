"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { QrCode, Link2, Check } from "lucide-react";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

type Kham = {
  id: string;
  slug: string;
  receiver_name: string;
  amount: string;
  created_at: string;
  scheduled_at: string | null;
  delivered_at: string | null;
  reaction?: string | null;
  letter_text: string | null;
  receiver?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = { kham: Kham; baseUrl: string };

export function SentKhamRow({ kham, baseUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    const currentOrigin = window.location.origin;
    const finalBase = (baseUrl && baseUrl !== "https://digitalkham.vercel.app")
      ? baseUrl
      : currentOrigin;
    setLink(`${finalBase}/k/${kham.slug}`);
  }, [baseUrl, kham.slug]);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group bg-white border border-gray-100 rounded-3xl p-5 transition-all hover:border-[#064e3b]/20 hover:shadow-xl hover:shadow-[#064e3b]/5">
      <div className="flex items-center justify-between gap-4">
        {/* Receiver Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            {kham.receiver?.avatar_url ? (
              <Image
                src={kham.receiver.avatar_url}
                className="w-full h-full object-cover"
                alt="receiver"
                width={48}
                height={48}
                unoptimized
              />
            ) : (
              <span className="text-[#064e3b] font-black text-lg">
                {(kham.receiver?.full_name || kham.receiver_name || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">
              {kham.receiver?.full_name || kham.receiver_name}
              {kham.receiver?.username && (
                <span className="block text-[10px] text-gray-400 font-medium">@{kham.receiver.username}</span>
              )}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-[#064e3b] bg-[#064e3b]/5 px-2 py-0.5 rounded-full border border-[#064e3b]/10">
                {kham.amount === 'Request' ? 'সালামি অনুরোধ' : `৳${kham.amount}`}
              </span>
              <span className="text-[10px] font-medium text-gray-300">
                {new Date(kham.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowQR(!showQR)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showQR ? 'bg-[#064e3b] text-white' : 'text-gray-400 hover:text-[#064e3b] hover:bg-gray-50'}`}
            title="QR Code"
          >
            <QrCode size={18} />
          </button>
          <button
            onClick={copy}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-[#064e3b] hover:bg-gray-50'}`}
            title="Copy Link"
          >
            {copied ? <Check size={18} /> : <Link2 size={18} />}
          </button>
        </div>
      </div>

      {/* Highlighted Message Preview */}
      {kham.letter_text && (
        <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 italic">
          <p className="text-sm md:text-base text-gray-600 font-bangla leading-relaxed italic">
            "{kham.letter_text}"
          </p>
        </div>
      )}

      {/* Footer / Status */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        {kham.delivered_at ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Opened</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent</span>
          </div>
        )}

        <div className="text-[9px] font-black text-gray-200 uppercase tracking-widest">
          Khām
        </div>
      </div>

      {showQR && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col items-center animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xl shadow-[#064e3b]/5">
            <QRCode value={link} size={100} fgColor="#064e3b" />
          </div>
          <p className="text-[9px] font-bold text-gray-300 mt-3 uppercase tracking-widest">Scan to Preview</p>
        </div>
      )}
    </div>
  );
}
