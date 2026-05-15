import { Link } from "react-router-dom";
import { Palette } from "lucide-react";

const navLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/generate", label: "Generator" },
  { to: "/gradient", label: "Gradients" },
  { to: "/contrast", label: "Contrast" },
  { to: "/harmony", label: "Harmony" },
  { to: "/saved", label: "Saved" },
];

const Footer = () => (
  <footer className="border-t border-border bg-muted/20 py-10">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          PaletteFlow
        </Link>

        {/* Nav links — 3 col grid on mobile, flex row on desktop */}
        <nav className="grid grid-cols-3 gap-x-6 gap-y-3 lg:flex lg:flex-row lg:flex-wrap lg:gap-x-5 lg:gap-y-0">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground shrink-0">
          Made with ❤️ for designers
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
