import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                MediCare<span className="text-primary">Billing</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Secure online access to your hospital billing information.
              Manage your healthcare finances with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/patient/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/patient/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/billing/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@medicare-billing.com" className="text-muted-foreground hover:text-primary transition-colors">
                  Email Support
                </a>
              </li>
              <li>
                <a href="tel:1-800-MEDICARE" className="text-muted-foreground hover:text-primary transition-colors">
                  1-800-MEDICARE
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">Mon-Fri: 8AM-8PM EST</span>
              </li>
              <li>
                <span className="text-muted-foreground">Sat-Sun: 9AM-5PM EST</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Medical Center Dr<br />Healthcare City, HC 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@medicare-billing.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 MediCare Billing Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
