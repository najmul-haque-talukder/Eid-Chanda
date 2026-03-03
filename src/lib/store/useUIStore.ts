import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
    lang: "bn" | "en";
    setLang: (lang: "bn" | "en") => void;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            lang: "bn",
            setLang: (lang) => set({ lang }),
            sidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        }),
        {
            name: "eid-chanda-ui",
        }
    )
);
