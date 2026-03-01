"use client";

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bangla font-bold text-gray-500 animate-pulse">লোড হচ্ছে...</p>
        </div>
    );
}
