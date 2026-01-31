// apmac-ui/src/app/layout.tsx
import "../lib/crypto-polyfill";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";

const spaceGrotesk = localFont({
  src: [
    {
      path: "./fonts/space-grotesk/SpaceGrotesk-Variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APTECH - AI Tool for Sales Productivity",
  description: "AI-powered sales productivity platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <Header />
            <ConditionalLayout>{children}</ConditionalLayout>

            {/* Add Chatbot Widget */}
            <ChatbotWidget />

            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
