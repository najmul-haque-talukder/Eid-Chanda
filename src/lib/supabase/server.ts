import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase environment variables are missing!");
    return createServerClient("https://missing.supabase.co", "missing", {
      cookies: { getAll() { return [] }, setAll() { } }
    });
  }

  try {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch (e) {
            // Safe to ignore in middleware or server actions
          }
        },
      },
    });
  } catch (e) {
    console.error("Failed to initialize Supabase server client:", e);
    throw e;
  }
}
