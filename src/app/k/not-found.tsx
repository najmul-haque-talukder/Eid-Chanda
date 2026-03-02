import Link from "next/link";
import { MailOpen } from "lucide-react";

export default function KhamNotFound() {
    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl mb-6">
                <MailOpen size={48} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 font-bangla">খামটি পাওয়া যায়নি!</h1>
            <p className="text-gray-500 mb-8 max-w-xs font-bangla">
                দুঃখিত, আপনি যে লিংকটি খুঁজছেন সেটি সঠিক নয় অথবা খামটি মুছে ফেলা হয়েছে।
            </p>
            <Link href="/" className="bg-primary text-white font-black px-10 py-4 rounded-3xl shadow-xl hover:-translate-y-1 transition-all">
                হোমপেজে ফিরে যান
            </Link>
        </div>
    );
}
