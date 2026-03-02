"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to a service if necessary
        console.error("Global Error captured:", error);
    }, [error]);

    return (
        <html>
            <body className="font-sans min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl animate-bounce">
                    <AlertTriangle size={48} />
                </div>
                <h1 className="text-3xl font-bold font-bangla text-gray-900 mb-4">ক্ষমা করবেন! একটি সমস্যা দেখা দিয়েছে।</h1>
                <p className="text-gray-600 mb-2 font-medium">
                    {error.message || "A critical error occurred."}
                </p>
                <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    If you just deployed, please ensure you have added the Supabase environment variables in your hosting provider (Vercel).
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                        className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition shadow-2xl shadow-primary/40 active:scale-95"
                    >
                        Refresh & Restore
                    </button>
                    <button
                        onClick={() => reset()}
                        className="text-sm text-gray-500 hover:text-primary transition"
                    >
                        Try Again (Soft Reset)
                    </button>
                </div>
                <div className="mt-12 text-[10px] text-gray-400 font-mono select-all bg-white/50 p-2 rounded border border-gray-100">
                    ID: {error.digest || "N/A"}
                </div>
            </body>
        </html>
    );
}
