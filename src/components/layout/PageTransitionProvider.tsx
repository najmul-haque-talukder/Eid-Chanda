"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // When pathname or searchParams change, the transition is "done"
        setLoading(false);
    }, [pathname, searchParams]);

    // We need a way to detect when a transition *starts*. 
    // In Next.js App Router, this is best done by intercepting clicks or using the 'loading' state.
    // However, a simple way to show activity is to hook into the global navigation.

    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
                const targetUrl = new URL(anchor.href);
                const currentUrl = new URL(window.location.href);

                // Only start loading if it's a different page
                if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
                    setLoading(true);
                }
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div className="h-1 bg-primary w-full animate-progress shadow-[0_0_15px_rgba(226,19,110,0.6)]" />
        </div>
    );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={null}>
                <ProgressBar />
            </Suspense>
            {children}
        </>
    );
}
