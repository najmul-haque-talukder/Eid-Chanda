import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.error(
        "CRITICAL ERROR: Supabase URL and/or Anon Key are missing from environment variables!",
        "\nURL:", url, "\nKey present:", !!key,
        "\n\nMake sure your .env.local file has them and you have restarted 'npm run dev'."
      );
    }
    // Return a proxy or throw a clearer error
    throw new Error("Supabase environment variables are missing! Check your .env.local file.");
  }

  return createBrowserClient(url, key);
}
