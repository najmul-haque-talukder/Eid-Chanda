"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bug } from "lucide-react";

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical Render Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6">
                <Bug size={40} />
            </div>
            <h2 className="text-2xl font-bold font-bangla text-gray-900 mb-2">দুঃখিত, কোনো সমস্যা হয়েছে!</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
                A system error occurred. We are refreshing the connection.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark shadow-lg transition"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="px-8 py-3 bg-white text-gray-700 font-bold border-2 border-cream-dark rounded-2xl hover:bg-gray-50 transition"
                >
                    Back Home
                </Link>
            </div>
        </div>
    );
}
