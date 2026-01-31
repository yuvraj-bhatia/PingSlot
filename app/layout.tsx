import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { Fraunces, Inter } from "next/font/google";

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
      className={`${oughter.variable} ${serif.variable} ${sans.variable}`}
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
            <main id="main-content" className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/50">
              <PageShell className="py-6">
                <p className="text-xs text-foreground-muted">
                  PingSlot MVP — Signal-first appointment monitoring
                </p>
              </PageShell>
            </footer>
          </ToastProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
