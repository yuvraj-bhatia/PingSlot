"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Only show footer on landing page (home page "/")
  // Hide on all other pages
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="site-footer-modern">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              APTECH
            </Link>
            <p className="footer-copyright">
              © {currentYear} APTECH. All rights reserved.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms
            </Link>
            <Link href="/support" className="footer-link">
              Contact / Support
            </Link>
          </nav>
        </div>
      </div>

      <style jsx>{`
        .site-footer-modern {
          width: 100%;
          background: rgba(5, 7, 20, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0070f3, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .footer-logo:hover {
          transform: scale(1.05);
        }

        .footer-copyright {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
        }

        .footer-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .footer-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #0070f3, #9333ea);
          transition: width 0.3s ease;
        }

        .footer-link:hover::after {
          width: 100%;
        }

        @media (max-width: 768px) {
          .site-footer-modern {
            padding: 2rem 0;
          }

          .footer-container {
            padding: 0 1rem;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .footer-nav {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}
