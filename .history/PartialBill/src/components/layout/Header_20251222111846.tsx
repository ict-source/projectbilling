import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            MediCare<span className="text-primary">Billing</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/patient/login"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/patient/login") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Patient Portal
          </Link>
          <Link
            to="/billing/login"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/billing/login") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Billing Staff
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" asChild>
            <Link to="/patient/login">Sign In</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/patient/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="animate-slide-down border-t bg-background md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/patient/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Patient Portal
            </Link>
            <Link
              to="/billing/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Billing Staff
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/patient/login" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button variant="hero" asChild className="w-full">
                <Link to="/patient/register" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
