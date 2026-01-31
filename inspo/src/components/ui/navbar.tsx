import Link from "next/link";
import { AuthButtons } from "../AuthButtons";
import { ThemeToggle } from "./ThemeToggle";
export default function NavbarPlaceholder() {
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="logo">
          APMAC
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link className="nav-link" href="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-link" href="#">
            Features
          </Link>
          <Link className="nav-link" href="#">
            Docs
          </Link>
          <Link className="nav-link" href="/tutorials">
            Tutorials
          </Link>
          <Link className="nav-link" href="/articles">
            Articles
          </Link>
          <Link className="nav-link" href="/chatbot">
            AI Chatbot
          </Link>
          <Link className="nav-link" href="/support">
            Support
          </Link>
        </nav>
        <div className="actions">
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
