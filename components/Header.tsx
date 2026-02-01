"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "./PageShell";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/targets", label: "Targets" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10, 10, 10, 0.95)"
          : "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: scrolled
          ? "1px solid rgba(31, 31, 31, 0.9)"
          : "1px solid rgba(255, 128, 0, 0.2)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(255, 128, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
          : "0 4px 28px rgba(0, 0, 0, 0.5), 0 0 35px rgba(255, 128, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      <PageShell className="flex h-24 sm:h-28 items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo - Large and prominent, links to landing page */}
        <Link
          href="/landing"
          className="group flex items-center justify-center transition-all duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="PingSlot home"
        >
          <Image
            src="/logo/logo.png"
            alt="PingSlot logo"
            width={400}
            height={120}
            priority
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ width: "auto", height: "100px" }}
          />
        </Link>

        {/* Navigation - Enhanced Design */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${isActive ? "text-[#F8F4F0]" : "text-[#888888]"}
                `}
                style={{
                  background: isActive
                    ? "rgba(255, 128, 0, 0.15)"
                    : "transparent",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(31, 31, 31, 0.5)";
                    e.currentTarget.style.color = "#F8F4F0";
                  } else {
                    e.currentTarget.style.background = "rgba(255, 128, 0, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#888888";
                  } else {
                    e.currentTarget.style.background = "rgba(255, 128, 0, 0.15)";
                  }
                }}
              >
                {link.label}
                {/* Enhanced animated underline */}
                {isActive && (
                  <span
                    className="absolute bottom-1 left-1/2 h-1 rounded-full -translate-x-1/2 w-8"
                    style={{
                      background: "linear-gradient(90deg, #FF8000, #0057B8)",
                      boxShadow: "0 0 16px rgba(255, 128, 0, 0.7), 0 0 24px rgba(0, 87, 184, 0.4)",
                    }}
                  />
                )}
                {!isActive && (
                  <span
                    className="absolute bottom-1 left-1/2 h-1 rounded-full -translate-x-1/2 w-0 transition-all duration-300 group-hover:w-8"
                    style={{
                      background: "linear-gradient(90deg, #FF8000, #0057B8)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side - Status Indicator */}
        <div className="flex items-center gap-4">
          <div 
            className="hidden sm:flex items-center gap-2.5 rounded-full px-4 py-2 border transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(34, 197, 94, 0.3)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" style={{ boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)" }} />
            </span>
            <span className="text-xs font-semibold text-success">Monitoring Active</span>
          </div>
        </div>
      </PageShell>
    </header>
  );
}
