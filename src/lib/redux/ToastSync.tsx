"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { hideToast, showToast as showToastAction, ToastType } from "@/lib/redux/slices/uiSlice";
import { useCallback } from "react";
import { Toast } from "@/components/ui/Toast";

export function ToastSync() {
    const dispatch = useDispatch();
    const toast = useSelector((state: RootState) => state.ui.toast);

    if (!toast) return null;

    return (
        <Toast
            message={toast.message}
            content={toast.content}
            type={toast.type}
            onClose={() => dispatch(hideToast())}
        />
    );
}

export function useToast() {
    const dispatch = useDispatch();

    const showToast = useCallback((message: string, content?: string, type: ToastType = "success") => {
        dispatch(showToastAction({ message, content, type }));
        setTimeout(() => {
            dispatch(hideToast());
        }, 4000);
    }, [dispatch]);

    return { showToast };
}
