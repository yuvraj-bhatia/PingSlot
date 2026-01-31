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

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg"
          : "bg-background/80 backdrop-blur-xl border-b border-border/50"
      }`}
    >
      <PageShell className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          aria-label="PingSlot home"
        >
          <div className="relative h-9 w-9 flex-shrink-0">
            <Image
              src="/logo/logo.png"
              alt="PingSlot logo"
              width={36}
              height={36}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span
              className="text-lg font-medium tracking-tight"
              style={{ fontFamily: "var(--font-oughter)" }}
            >
              PingSlot
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1"
        >
          <Link
            href="/"
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Targets
          </Link>
        </nav>
      </PageShell>
    </header>
  );
}
