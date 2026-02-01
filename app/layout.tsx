import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Inter, Space_Grotesk, Syne } from "next/font/google";

import { QueryProvider } from "../components/QueryProvider";
import { ToastProvider } from "../components/ToastProvider";
import { TooltipProvider } from "../components/ui/Tooltip";
import { PageShell } from "../components/PageShell";
import { Header } from "../components/Header";

const oughter = localFont({
  src: "../fonts/Oughter.otf",
  variable: "--font-oughter",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PingSlot | Appointment Monitoring",
    template: "%s | PingSlot",
  },
  description: "Signal-first appointment monitoring dashboard. Track availability, run checks, and manage alerts for appointment slots.",
  keywords: ["appointment monitoring", "availability tracking", "appointment alerts"],
  authors: [{ name: "PingSlot" }],
  creator: "PingSlot",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PingSlot",
    title: "PingSlot | Appointment Monitoring",
    description: "Signal-first appointment monitoring dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "PingSlot | Appointment Monitoring",
    description: "Signal-first appointment monitoring dashboard",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
      className={`${oughter.variable} ${serif.variable} ${sans.variable} ${display.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
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
            <main id="main-content" className="min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-6rem)]">
              {children}
            </main>

            {/* Footer with blue glow background but orange text theme */}
            <footer className="relative border-t border-blue-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              {/* Footer blue glow effects - KEEP AS IS */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute -bottom-20 left-1/4 h-[200px] w-[400px] rounded-full blur-[80px]"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0, 119, 255, 0.25) 0%, rgba(0, 87, 184, 0.1) 50%, transparent 80%)",
                  }}
                />
                <div 
                  className="absolute -bottom-16 right-1/4 h-[180px] w-[350px] rounded-full blur-[70px]"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0, 180, 255, 0.2) 0%, rgba(0, 140, 220, 0.08) 50%, transparent 75%)",
                  }}
                />
                {/* Top border glow line */}
                <div 
                  className="absolute top-0 left-0 h-[1px] w-full"
                  style={{
                    background: "linear-gradient(90deg, transparent 5%, rgba(0, 150, 255, 0.5) 30%, rgba(0, 200, 255, 0.7) 50%, rgba(0, 150, 255, 0.5) 70%, transparent 95%)",
                  }}
                />
              </div>
              
              <PageShell className="relative py-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="flex items-center gap-3">
                    {/* Logo icon with blue glow but orange "P" */}
                    <div
                      className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/40 via-blue-400/25 to-cyan-400/15 flex items-center justify-center border border-blue-500/50"
                      style={{ 
                        boxShadow: "0 0 25px rgba(0, 119, 255, 0.5), 0 0 50px rgba(0, 150, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)" 
                      }}
                    >
                      <span className="text-sm font-bold text-accent">P</span>
                    </div>
                    <span className="text-sm font-medium text-foreground-muted">
                      PingSlot — Signal-first appointment monitoring
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
