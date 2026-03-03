import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";
import { HeaderHider } from "@/components/layout/HeaderHider";
import { PageTransitionProvider } from "@/components/layout/PageTransitionProvider";
import { NotificationHandler } from "@/components/notifications/NotificationHandler";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";
import { LanguageSync } from "@/lib/redux/LanguageSync";
import { ToastSync } from "@/lib/redux/ToastSync";
import { QueryProvider } from "@/components/providers/QueryProvider";

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

import { SocketProvider } from "@/lib/socket/SocketProvider";
import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${poppins.variable} antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans min-h-screen bg-cream text-gray-900 overflow-x-hidden" suppressHydrationWarning>
        <QueryProvider>
          <ReduxProvider>
            <LanguageSync>
              <PageTransitionProvider>
                <NotificationHandler>
                  <SocketProvider userId={user?.id || null}>
                    <DashboardWrapper>
                      {children}
                    </DashboardWrapper>
                  </SocketProvider>
                </NotificationHandler>
                <ToastSync />
              </PageTransitionProvider>
            </LanguageSync>
          </ReduxProvider>
        </QueryProvider>
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
