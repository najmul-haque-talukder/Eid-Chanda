"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
    VenetianMask,
    MailOpen,
    Download,
    X,
    MoonStar,
    Loader2
} from "lucide-react";

type Kham = {
    id: string;
    slug: string;
    receiver_name: string;
    amount: string;
    letter_text: string | null;
    anonymous: boolean;
    delivered_at: string | null;
    sender?: {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        payment_methods?: any[] | null;
    } | null;
    payment_method?: string | null;
    payment_number?: string | null;
};

type Props = {
    kham: Kham;
};

export function InteractiveKhamCard({ kham }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleOpen = async () => {
        if (isOpen) return;
        setIsOpen(true);
        if (!kham.delivered_at) {
            const supabase = createClient();
            await supabase.from("khams").update({ delivered_at: new Date().toISOString() }).eq("id", kham.id);
        }
    };

    const downloadCard = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!cardRef.current || isSaving) return;
        setIsSaving(true);
        try {
            const htmlToImage = await import("html-to-image");
            const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
                quality: 1.0,
                backgroundColor: "#ffffff",
                pixelRatio: 3,
                cacheBust: true,
            });
            const link = document.createElement("a");
            link.download = `Eid-Card-${kham.slug}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Download Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            onClick={handleOpen}
            className={`group relative transition-all duration-700 ${isOpen ? 'z-50' : 'z-10'}`}
        >
            <div className={`relative w-full transition-all duration-700 ${isOpen ? 'min-h-[320px]' : 'h-24'}`}>
                {/* Closed State (Envelope Bar) */}
                <div
                    className={`absolute inset-0 bg-white border-2 border-[#E2136E]/10 rounded-[1.5rem] p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between overflow-hidden ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#E2136E]/20 bg-gray-50 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                            {kham.anonymous ? (
                                <div className="w-full h-full flex items-center justify-center text-xl text-[#E2136E]/30">
                                    <VenetianMask size={24} />
                                </div>
                            ) : kham.sender?.avatar_url ? (
                                <Image
                                    src={kham.sender.avatar_url}
                                    className="w-full h-full object-cover rounded-full"
                                    alt="sender"
                                    width={48}
                                    height={48}
                                    unoptimized
                                />
                            ) : (
                                <div className="text-[#E2136E] font-black text-xl">
                                    {(kham.sender?.full_name || "A")[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-[#1a2e1d] flex items-center gap-2 text-sm md:text-base">
                                {kham.anonymous ? "Anonymous Friend" : (kham.sender?.full_name || "A Friend")}
                                {!kham.delivered_at && <span className="bg-[#E2136E] text-white text-[8px] px-2 py-0.5 rounded-full font-bold animate-pulse uppercase tracking-wider">New</span>}
                            </p>
                            <p className="text-[9px] text-[#E2136E]/60 uppercase tracking-[0.2em] font-black">Islamic Greeting Card</p>
                        </div>
                    </div>
                    <div className="text-[#E2136E]/20 group-hover:text-[#E2136E]/60 transition-colors pr-2">
                        <MailOpen size={20} />
                    </div>
                </div>

                {/* Opened State (Full Card) */}
                {isOpen && (
                    <div ref={cardRef} className="absolute inset-0 animate-in fade-in zoom-in duration-500 rounded-[1.5rem] overflow-hidden border-2 border-[#E2136E]/10 shadow-2xl flex flex-col bg-white">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2136E]/5 rounded-bl-full pointer-events-none" />

                        {/* Control Buttons Cluster */}
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            {/* Download Button */}
                            <button
                                onClick={downloadCard}
                                disabled={isSaving}
                                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E2136E]/10 flex items-center justify-center text-[#E2136E] hover:bg-[#E2136E] hover:text-white transition-all shadow-sm"
                                title="Download as JPG"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            </button>

                            {/* Close button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E2136E]/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 p-5 md:p-6 pb-8 flex flex-col items-center justify-center text-center relative z-10">
                            {/* Moon Icon */}
                            <div className="mb-2">
                                <MoonStar size={48} className="text-[#E2136E] opacity-90" />
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-[#E2136E] font-bangla mb-1">ঈদ মোবারক!</h3>

                            <div className="max-w-xs mb-4">
                                <p className="text-base font-bangla text-gray-800 leading-relaxed font-medium">
                                    {kham.letter_text || "ঈদ মোবারক! আপনাকে পবিত্র রমজানের শুভেচ্ছা!"}
                                </p>
                            </div>

                            {/* Info Section */}
                            <div className="w-full mt-auto flex flex-col gap-4">
                                {/* Left Aligned Payment labels */}
                                <div className="flex flex-col gap-2 text-left border-l-4 border-[#E2136E]/10 pl-3 py-1 mt-2">
                                    {kham.sender?.payment_methods?.map((pm: any, idx: number) => (
                                        <p key={idx} className="text-sm font-bold text-gray-700 font-bangla">
                                            {pm.provider} {pm.label ? `(${pm.label})` : ''} : <span className="font-mono text-gray-500">{pm.number}</span>
                                        </p>
                                    ))}
                                    {(!kham.sender?.payment_methods || kham.sender.payment_methods.length === 0) && kham.payment_number && (
                                        <p className="text-sm font-bold text-gray-700 font-bangla">{kham.payment_method} : <span className="font-mono text-gray-500">{kham.payment_number}</span></p>
                                    )}
                                </div>

                                {/* Bottom Right Attribution */}
                                <div className="text-right pb-2">
                                    <p className="text-xs text-gray-500 font-bangla">
                                        পাঠিয়েছেন : <span className="font-black text-[#E2136E] text-base">{kham.anonymous ? "গোপন বন্ধু" : (kham.sender?.full_name || "আপনার আপনজন")}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Community Strip */}
                        <div className="bg-[#e2136e] py-2 text-center w-full mt-auto">
                            <p className="text-white font-bangla text-[10px] md:text-xs font-bold tracking-tight px-4">
                                ঈদ চান্দা কমিউনিটি থেকেও আপনাকে ঈদ মোবারক
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
