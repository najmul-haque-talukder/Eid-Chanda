"use client";

import Link from "next/link";
import { Ghost } from "lucide-react";

export default function RootNotFound() {
    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl animate-bounce">
                <Ghost size={48} />
            </div>
            <h2 className="text-3xl font-bold font-bangla text-gray-900 mb-4">ক্ষমা করবেন! এই পাতাটি পাওয়া যায়নি।</h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed font-bangla">
                আপনার খোঁজা খাম বা পাতাটি হয়তো মুছে গেছে অথবা আপনি ভুল লিংকে এসেছেন।
            </p>
            <Link
                href="/"
                className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition shadow-2xl shadow-primary/40 active:scale-95"
            >
                হোমপেজে ফিরে যান (Back Home)
            </Link>
        </div>
    );
}
