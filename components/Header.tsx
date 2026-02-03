"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PageShell } from "./PageShell";
import { cn } from "../lib/cn";

// Logo uses symlink from public/logo -> logo/ folder
// Add timestamp to bust browser cache on every page load during development
const LOGO_CACHE_BUSTER = process.env.NODE_ENV === "development" ? Date.now() : "v1";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/targets", label: "Targets" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(10, 10, 10, 0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          borderBottom: "none",
          boxShadow: scrolled
            ? "0 8px 40px rgba(0, 0, 0, 0.6)"
            : "none",
        }}
      >
        <PageShell className="flex h-16 sm:h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo - Links to landing page */}
          <Link
            href="/landing"
            className="group flex items-center gap-1.5 transition-all duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="PingSlot home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logo/logo.png?${LOGO_CACHE_BUSTER}`}
              alt="PingSlot logo"
              width={52}
              height={52}
              className="object-contain transition-transform duration-300 group-hover:scale-105 rounded-xl"
              style={{ width: "52px", height: "52px" }}
            />
            <span 
              className="text-xl sm:text-2xl font-bold tracking-tight font-display"
              style={{
                color: "#4FC3F7",
                background: "linear-gradient(135deg, #4FC3F7 0%, #81D4FA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PingSlot
            </span>
          </Link>

          {/* Desktop Navigation */}
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
                  className={cn(
                    "relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive 
                      ? "text-foreground bg-accent/10" 
                      : "text-foreground-muted hover:text-foreground hover:bg-white/[0.05]"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 h-0.5 w-6 rounded-full -translate-x-1/2"
                      style={{
                        background: "linear-gradient(90deg, #00D4FF, #7C3AED)",
                        boxShadow: "0 0 12px rgba(0, 212, 255, 0.6)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Status Indicator + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Status Indicator - Hidden on small mobile */}
            <div 
              className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all duration-300"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderColor: "rgba(34, 197, 94, 0.25)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(34, 197, 94, 0.08)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span 
                  className="relative inline-flex rounded-full h-2 w-2 bg-success" 
                  style={{ boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)" }} 
                />
              </span>
              <span className="text-xs font-medium text-success">Active</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={cn(
                "md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                "border border-white/[0.1] bg-white/[0.04]",
                "hover:bg-white/[0.08] hover:border-white/[0.15]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                mobileMenuOpen && "bg-accent/10 border-accent/30"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-accent" />
              ) : (
                <Menu className="h-5 w-5 text-foreground-muted" />
              )}
            </button>
          </div>
        </PageShell>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            className="absolute top-16 left-0 right-0 bg-background border-b border-white/[0.08]"
            style={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
            }}
          >
            <nav className="p-4 space-y-2" aria-label="Mobile menu">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isActive
                        ? "bg-accent/10 text-foreground border border-accent/20"
                        : "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                        style={{ boxShadow: "0 0 8px rgba(0, 212, 255, 0.6)" }}
                      />
                    )}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}

              {/* Status in mobile menu */}
              <div className="pt-4 mt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span>Monitoring Active</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
