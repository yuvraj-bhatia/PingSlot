import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";

import { QueryProvider } from "../components/QueryProvider";
import { ToastProvider } from "../components/ToastProvider";
import { TooltipProvider } from "../components/ui/Tooltip";
import { PageShell } from "../components/PageShell";
import { Header } from "../components/Header";
import { MobileNav } from "../components/MobileNav";

/**
 * Typography System
 * 
 * Two font families for clarity and performance:
 * - Syne: Display font for headers, hero text, brand elements
 * - Inter: Body font for all UI text, forms, and content
 */

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "PingSlot | Appointment Monitoring",
    template: "%s | PingSlot",
  },
  description: "AI-powered appointment monitoring and auto-booking. Track availability, get instant alerts, and book appointments automatically.",
  keywords: ["appointment monitoring", "availability tracking", "appointment alerts", "auto-booking", "DMV appointments", "passport appointments"],
  authors: [{ name: "PingSlot" }],
  creator: "PingSlot",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PingSlot",
    title: "PingSlot | AI-Powered Appointment Monitoring",
    description: "Never miss an appointment slot again. AI-powered monitoring and auto-booking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PingSlot | AI-Powered Appointment Monitoring",
    description: "Never miss an appointment slot again. AI-powered monitoring and auto-booking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <QueryProvider>
          <TooltipProvider>
          <ToastProvider>
            {/* Skip to content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>

            {/* Header */}
            <Header />

            {/* Main content */}
            <main id="main-content" className="min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-6rem)] pb-20 md:pb-0">
              {children}
            </main>

            {/* Mobile bottom navigation */}
            <MobileNav />

            {/* Footer */}
            <footer className="relative border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              {/* Footer glow effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute -bottom-20 left-1/4 h-[200px] w-[400px] rounded-full blur-[80px]"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 50%, transparent 80%)",
                  }}
                />
                <div 
                  className="absolute -bottom-16 right-1/4 h-[180px] w-[350px] rounded-full blur-[70px]"
                  style={{
                    background: "radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0.04) 50%, transparent 75%)",
                  }}
                />
                {/* Top border glow line */}
                <div 
                  className="absolute top-0 left-0 h-[1px] w-full"
                  style={{
                    background: "linear-gradient(90deg, transparent 10%, rgba(0, 212, 255, 0.3) 30%, rgba(0, 212, 255, 0.5) 50%, rgba(0, 212, 255, 0.3) 70%, transparent 90%)",
                  }}
                />
              </div>
              
              <PageShell className="relative py-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="flex items-center gap-3">
                    {/* Logo icon */}
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center border border-accent/30"
                      style={{ 
                        background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)",
                        boxShadow: "0 0 20px rgba(0, 212, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)" 
                      }}
                    >
                      <span className="text-sm font-bold text-accent">P</span>
                    </div>
                    <span className="text-sm font-medium text-foreground-muted">
                      PingSlot — AI-powered appointment monitoring
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <a 
                      href="#" 
                      className="text-xs text-foreground-muted hover:text-accent transition-colors"
                    >
                      Privacy
                    </a>
                    <a 
                      href="#" 
                      className="text-xs text-foreground-muted hover:text-accent transition-colors"
                    >
                      Terms
                    </a>
                    <span className="text-xs text-foreground-muted/50">
                      © 2026 PingSlot
                    </span>
                  </div>
                </div>
              </PageShell>
            </footer>
          </ToastProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
