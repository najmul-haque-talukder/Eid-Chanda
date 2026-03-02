import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { ToastProvider } from "@/components/ToastContext";
import { LanguageProvider } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { HeaderHider } from "@/components/layout/HeaderHider";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Eid Chanda - Digital Eid Salami & Card Platform",
  description: "Create your digital Eid card, share with friends, and collect Salami in a fun way!",
  appleWebApp: {
    title: "Eid Chanda",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

import { PageTransitionProvider } from "@/components/layout/PageTransitionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${poppins.variable} antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans min-h-screen bg-cream text-gray-900 overflow-x-hidden" suppressHydrationWarning>
        <ToastProvider>
          <LanguageProvider>
            <PageTransitionProvider>
              <DashboardWrapper>
                {children}
              </DashboardWrapper>
            </PageTransitionProvider>
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

// Helper component to handle sidebar visibility
function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <HeaderHider>
      {children}
    </HeaderHider>
  );
}
