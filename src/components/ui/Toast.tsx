"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
    message: string;
    content?: string;
    type: "success" | "error" | "info";
    onClose: () => void;
}

export function Toast({ message, content, type, onClose }: ToastProps) {
    const bgColor = {
        success: "bg-white border-green-500",
        error: "bg-white border-red-500",
        info: "bg-white border-blue-500",
    }[type];

    const icon = {
        success: <CheckCircle2 className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    }[type];

    return (
        <div className="fixed top-20 right-4 z-[9999] animate-fade-in-right max-w-sm w-full">
            <div className={`bg-white border-l-4 ${bgColor} p-4 rounded-xl shadow-2xl flex gap-3 items-start backdrop-blur-sm bg-white/95`}>
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                    <h5 className="font-bold text-gray-900 text-sm font-bangla">{message}</h5>
                    {content && <p className="text-xs text-gray-500 mt-1 font-bangla line-clamp-2">{content}</p>}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
