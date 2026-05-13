import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
      >
        <span className="text-4xl font-black text-primary-foreground">404</span>
      </motion.div>
      <h1 className="text-3xl font-bold text-foreground mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Explore Palettes
          </Button>
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
