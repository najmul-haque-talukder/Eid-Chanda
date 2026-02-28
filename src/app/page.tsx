import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-cream to-white overflow-hidden relative">

      {/* Background Decorative Elements - Removed for Performance */}

      <div className="max-w-3xl text-center space-y-10 z-10 font-bangla">

        {/* Banner Logo Title */}
        <div className="inline-block relative">
          <h1 className="relative font-bold text-5xl md:text-7xl text-primary tracking-tight">
            ঈদ চান্দা
          </h1>
        </div>

        {/* Poetic Landing Page Typography */}
        <div className="space-y-2 text-gray-500 leading-snug text-base text-center select-none w-full max-w-xl mx-auto">
          <p>
            ঈদ মানেই ছিল নতুন জামার গন্ধ, চাঁদ দেখার উত্তেজনা, আর সকালবেলা সালামি পাওয়ার আশায় দৌড়ঝাঁপ। নামাজ শেষে বড়দের সামনে দাঁড়িয়ে থাকা, মনের ভিতর লুকানো আশা—আজ কে কত টাকা দেবে?  মোবাইল ছিল না, ছিল না বিকাশ—ছিল শুধু হাতে ভাঁজ করা নোট, আর সেই নোটের সাথে জড়িয়ে থাকা ভালোবাসা।
          </p>

          <p className="font-bold text-gray-700 text-lg mt-5">
            “ঈদ চান্দা” সেই ছোটবেলার স্মৃতিগুলোকে ডিজিটাল করে তোলার একটা মজার চেষ্টা।
          </p>
          <p>
            এখানে সালামি শুধু টাকা না—এটা স্মৃতি, সম্পর্ক আর ঈদের খুনসুটির নতুন রূপ। একটা ক্লিক, একটা রিকোয়েস্ট— আর ফিরে পাওয়া সেই পুরোনো ঈদের হাসি।
          </p>
        </div>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            শুরু করুন <i className="fa-solid fa-rocket"></i>
          </Link>
          <Link
            href="/dua-wall"
            className="px-8 py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-hands-praying fa-fw"></i> দোয়া ওয়াল
          </Link>
        </div>
      </div>

    </main>
  );
}
