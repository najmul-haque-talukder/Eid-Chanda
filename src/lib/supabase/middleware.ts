import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If environment variables are missing, don't crash the middleware.
    // This allows identifying the issue without a blank 500 error.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any) {
        cookiesToSet.forEach(({ name, value }: any) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }: any) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // This will refresh the session if needed
  await supabase.auth.getUser();

  return response;
}
