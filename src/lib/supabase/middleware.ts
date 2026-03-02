import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: DO NOT remove done.auth.getUser()
  // This is required for a few reason:
  // 1. Refreshing the session if it is expired
  // 2. Ensuring the user's information is up to date
  // 3. Ensuring that the session is valid
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // If auth fails in middleware, we don't want to crash the whole request
    // The individual pages can handle redirecting to login if needed
    console.error("Middleware auth error:", error);
  }

  return supabaseResponse;
}
