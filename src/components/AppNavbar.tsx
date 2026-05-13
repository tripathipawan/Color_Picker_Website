import { Link, useLocation } from 'react-router-dom';
import { Palette, Sparkles, Image, Contrast, Bookmark, Moon, Sun, Blend, Wand2, Shapes } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePaletteStore } from '@/store/paletteStore';

const links = [
  { to: '/explore', label: 'Explore', icon: Sparkles },
  { to: '/generate', label: 'Generator', icon: Wand2 },
  { to: '/gradient', label: 'Gradient', icon: Blend },
  { to: '/image-picker', label: 'Image Picker', icon: Image },
  { to: '/contrast', label: 'Contrast', icon: Contrast },
  { to: '/harmony', label: 'Harmony', icon: Shapes },
  { to: '/saved', label: 'Saved', icon: Bookmark },
];

const AppNavbar = () => {
  const { darkMode, setDarkMode } = usePaletteStore();
  const location = useLocation();

  const toggleDark = () => setDarkMode(!darkMode);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <Palette className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span>PaletteFlow</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                location.pathname === to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:-translate-y-0.5'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.9, rotate: 20 }}>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-lg" aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
