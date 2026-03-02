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
                <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    The app encountered a critical error. Don't worry, your data is safe. Please click below to refresh and try again.
                </p>
                <button
                    onClick={() => {
                        // Force reload the whole page to clear any memory states
                        window.location.href = "/";
                    }}
                    className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition shadow-2xl shadow-primary/40 active:scale-95"
                >
                    Refresh & Restore
                </button>
                <div className="mt-12 text-xs text-gray-400 font-mono select-all">
                    Error Digest: {error.digest || "Local Session Issue"}
                </div>
            </body>
        </html>
    );
}
