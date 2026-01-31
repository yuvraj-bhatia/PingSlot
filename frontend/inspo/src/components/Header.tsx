"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthButtons } from "./AuthButtons";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const brandStyle = {
    fontFamily:
      'var(--font-space-grotesk, "Space Grotesk", ui-sans-serif, system-ui, sans-serif)',
    fontSize: "1.375rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "#ffffff",
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    display: "inline-block",
  } as const;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only show header on landing page (home page "/")
  // Hide on all other pages
  if (pathname !== "/") {
    return null;
  }

  return (
    <header className={`site-header-modern ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <Link
          href="/"
          className="header-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            gridColumn: "1",
          }}
        >
          <Image
            src="/logo/APTECH.png"
            alt="APTECH Logo"
            width={30}
            height={30}
            style={{ objectFit: "contain" }}
          />
          <h1 style={brandStyle}>APTECH</h1>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link href="#" className="nav-link">
            Features
          </Link>
          <Link href="#" className="nav-link">
            Docs
          </Link>
          <Link href="/tutorials" className="nav-link">
            Tutorials
          </Link>
          <Link href="/articles" className="nav-link">
            Articles
          </Link>
        </nav>

        <div className="header-actions">
          <AuthButtons />
        </div>
      </div>

      <style jsx>{`
        .site-header-modern {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(5, 7, 20, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .site-header-modern.scrolled {
          background: rgba(5, 7, 20, 0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 2rem;
        }

        .header-logo {
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .header-logo h1 {
          font-family: var(--font-space-grotesk, "Space Grotesk", ui-sans-serif, system-ui, sans-serif) !important;
          font-size: 1.375rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px;
          color: #ffffff;
          line-height: 1.1;
          margin: 0 !important;
          padding: 0 !important;
        }

        .header-logo:hover {
          transform: scale(1.02);
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
          justify-content: center;
          grid-column: 2;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          padding: 0.5rem 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #0070f3, #9333ea);
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 1);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: flex-end;
          grid-column: 3;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 1rem;
            gap: 1rem;
          }

          .header-nav {
            display: none;
          }

          .header-logo h1 {
            font-size: 1.375rem !important;
            font-weight: 700 !important;
          }
        }
      `}</style>
    </header>
  );
}
