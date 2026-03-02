"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    const bgColor = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
    }[type];

    const icon = {
        success: <CheckCircle2 size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />,
    }[type];

    return (
        <div className="fixed top-20 right-4 z-[9999] animate-fade-in-right">
            <div className={`${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
                <span className="text-xl">{icon}</span>
                <p className="font-bold font-bangla flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="hover:rotate-90 transition-transform p-1"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
