import { Link, useLocation } from 'react-router-dom';
import { Home, Wand2, Bookmark, MoreHorizontal, Shapes } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sparkles, Blend, Image, Contrast } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const mainItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/generate', label: 'Generate', icon: Wand2 },
  { to: '/saved', label: 'Saved', icon: Bookmark },
];

const moreItems = [
  { to: '/explore', label: 'Explore', icon: Sparkles },
  { to: '/gradient', label: 'Gradient', icon: Blend },
  { to: '/image-picker', label: 'Image', icon: Image },
  { to: '/contrast', label: 'Contrast', icon: Contrast },
  { to: '/harmony', label: 'Harmony', icon: Shapes },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-20 left-4 right-4 z-50 lg:hidden bg-card border border-border rounded-2xl shadow-xl p-2"
            >
              {moreItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon className={cn('h-5 w-5 transition-colors', active ? 'text-primary' : 'text-muted-foreground')} />
                </motion.div>
                <span className={cn('text-[10px] font-medium', active ? 'text-primary' : 'text-muted-foreground')}>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <motion.div whileTap={{ scale: 0.85 }}>
              <MoreHorizontal className={cn('h-5 w-5', showMore ? 'text-primary' : 'text-muted-foreground')} />
            </motion.div>
            <span className={cn('text-[10px] font-medium', showMore ? 'text-primary' : 'text-muted-foreground')}>More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
