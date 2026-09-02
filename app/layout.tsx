import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { BridgeProvider } from "@/components/bridge-provider";
import { Toaster } from "@/components/ui/sonner";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { SiteFooter } from "@/components/site-footer";
import { MaintenanceGuard } from "@/components/maintenance-guard";
import { CosmicBackgroundWrapper } from "@/components/cosmic-background-wrapper";
import { ChatWidget } from "@/components/chat-widget";

const appName = "AdEarn";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: appName,
  description:
    "Зарабатывай на просмотре рекламы и выполнении заданий в соцсетях",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans dark", inter.variable)}>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <BridgeProvider />
        <CosmicBackgroundWrapper />
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
              {appName}
            </Link>
            <HeaderUserMenu />
          </div>
        </header>
        <main className="flex-1">
          <MaintenanceGuard>{children}</MaintenanceGuard>
        </main>
        <SiteFooter />
        <ChatWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}


    

