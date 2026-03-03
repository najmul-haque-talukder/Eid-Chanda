"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationListener } from "./NotificationListener";

export function NotificationHandler({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <NotificationListener currentUserId={user?.id} />
            {children}
        </>
    );
}
