"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";

type Kham = {
  id: string;
  slug: string;
  receiver_name: string;
  amount: string;
  created_at: string;
  scheduled_at: string | null;
  delivered_at: string | null;
  reaction: string | null;
  letter_text: string | null;
};

type Props = { kham: Kham; baseUrl: string };

export function SentKhamRow({ kham, baseUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const link = `${baseUrl}/k/${kham.slug}`;

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl bg-white border border-cream-dark p-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-bold text-gray-900 flex items-center gap-2">
          To: {kham.receiver_name}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
            {kham.amount}
          </p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <i className="fa-solid fa-clock"></i>
            {new Date(kham.created_at).toLocaleDateString()} at {new Date(kham.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {kham.letter_text && (
          <div className="mt-3 p-3 bg-cream rounded-xl border border-cream-dark text-sm text-gray-700 font-bangla relative">
            <i className="fa-solid fa-quote-left text-primary/20 absolute top-2 left-2 text-xs"></i>
            <p className="px-4 leading-relaxed font-bangla">"{kham.letter_text}"</p>
          </div>
        )}

        {kham.reaction && (
          <p className="mt-2 text-xs font-bold animate-pulse flex items-center gap-2 text-primary bg-primary/5 w-max px-2 py-1 rounded-full border border-primary/20">
            Your Khām made someone {
              kham.reaction === '❤️' ? <span>feel loved <i className="fa-solid fa-heart text-red-500"></i></span> :
                kham.reaction === '🥹' ? <span>emotional <i className="fa-solid fa-face-grin-stars text-yellow-500"></i></span> :
                  kham.reaction === '😂' ? <span>laugh <i className="fa-solid fa-face-laugh-squint text-orange-500"></i></span> :
                    kham.reaction === '🤲' ? <span>make dua <i className="fa-solid fa-hands-praying text-primary"></i></span> : 'react!'
            }
          </p>
        )}

        {!kham.delivered_at && kham.scheduled_at && new Date(kham.scheduled_at) <= new Date() && (
          <p className="mt-2 text-[11px] font-bold text-gray-400 flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full border border-gray-200 w-max">
            <i className="fa-solid fa-envelope"></i> Waiting silently... <i className="fa-solid fa-face-smile-wink text-primary"></i>
          </p>
        )}
        {kham.delivered_at && !kham.reaction && (
          <p className="mt-2 text-[11px] font-bold text-green-600 flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-200 w-max">
            <i className="fa-solid fa-circle-check"></i> Opened • {new Date(kham.delivered_at).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-sm hover:bg-gray-200"
        >
          {showQR ? "Hide QR" : "QR Code"}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-sm hover:bg-primary/20"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <Link href={`/k/${kham.slug}`} className="text-sm text-primary underline font-bold">Open</Link>
      </div>

      {showQR && (
        <div className="w-full mt-4 p-4 border-t border-cream-dark flex flex-col items-center justify-center bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600 mb-4 text-center">Scan to open. Print this and attach to a physical envelope! <i className="fa-solid fa-envelope-heart text-primary"></i></p>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <QRCode value={link} size={150} />
          </div>
        </div>
      )}
    </div>
  );
}
