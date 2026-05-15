import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-muted/20 py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          PaletteFlow
        </Link>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <Link to="/generate" className="hover:text-foreground transition-colors">Generator</Link>
          <Link to="/gradient" className="hover:text-foreground transition-colors">Gradients</Link>
          <Link to="/contrast" className="hover:text-foreground transition-colors">Contrast</Link>
          <Link to="/harmony" className="hover:text-foreground transition-colors">Harmony</Link>
          <Link to="/saved" className="hover:text-foreground transition-colors">Saved</Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          Made with ❤️ for designers
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
