import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (typeof window !== "undefined") {
      console.warn(
        "DIAGNOSTIC: Supabase environment variables are missing. App may have reduced functionality.",
        "\nURL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing",
        "\nKey:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing"
      );
    }
  }

  return createBrowserClient(url, key);
}
