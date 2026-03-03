import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info";

interface ToastState {
    message: string;
    content?: string;
    type: ToastType;
}

interface UIState {
    lang: "bn" | "en";
    toast: ToastState | null;
}

const initialState: UIState = {
    lang: "bn",
    toast: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setLang: (state, action: PayloadAction<"bn" | "en">) => {
            state.lang = action.payload;
        },
        showToast: (state, action: PayloadAction<ToastState>) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        },
    },
});

export const { setLang, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
