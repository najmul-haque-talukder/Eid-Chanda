"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        router.push("/dashboard");
      }
    }
    checkUser();

    const err = searchParams.get("error");
    if (err) setError(err);
  }, [searchParams, router]);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Don't set loading to false here to avoid UI flicker before redirect
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cream to-white relative overflow-hidden">

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2136e 0.5px, transparent 0.5px)', backgroundSize: '30px 30px', opacity: 0.1 }} />
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white rounded-3xl border border-cream-dark shadow-2xl p-8 md:p-10 space-y-8 relative overflow-hidden">
          {/* Subtle header accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary"></div>

          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-bangla text-primary tracking-tight select-none">
              ঈদ চান্দা
            </h1>
            <p className="text-gray-600 leading-relaxed font-bangla text-sm sm:text-base select-none">
              “ঈদ চাঁদা” হলো একদম মজার ছলে বানানো একটি অনলাইন প্ল্যাটফর্ম, যেখানে বন্ধু-বান্ধব, ভাই-বোন বা আত্মীয়দের কাছে ঈদের সালামি চাওয়া বা পাঠানো যায় ডিজিটালি।
            </p>
          </div>

          <div className="pt-2">
            {error && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-6">
                <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isAuthenticated ? (
              <div className="animate-fade-in space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center space-y-1">
                  <p className="font-bold text-green-700">Login Successful! ✅</p>
                  <p className="text-sm text-green-600">If you are not redirected automatically, please click below.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-primary bg-primary text-white hover:bg-primary-dark font-medium transition shadow-lg shadow-primary/20"
                >
                  <i className="fa-solid fa-arrow-right"></i> Go to Dashboard
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-bold text-gray-700 disabled:opacity-60 transition shadow-sm group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? "Signing in…" : "Continue with Google"}
              </button>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col items-center gap-2">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <i className="fa-solid fa-shield-halved text-gray-400"></i> No password needed
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <i className="fa-solid fa-bolt text-yellow-500"></i> Instant OTP-less login
            </span>
            <Link
              href="/dua-wall"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white font-bold transition-all group"
            >
              <i className="fa-solid fa-person-praying fa-fw group-hover:animate-bounce"></i>
              পাবলিক দোয়া ওয়াল দেখুন
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
