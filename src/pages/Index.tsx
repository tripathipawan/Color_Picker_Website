import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaletteStore } from '@/store/paletteStore';
import PaletteCard from '@/components/PaletteCard';
import { ALL_TAGS, TAG_EMOJIS, type PaletteTag } from '@/lib/palettes';
import Footer from '@/components/Footer';

const CountUp = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v));
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration: 2, ease: 'easeOut' });
      const unsub = rounded.on('change', v => setDisplay(v.toLocaleString()));
      return () => { controls.stop(); unsub(); };
    }
  }, [isInView, target, count, rounded]);

  return <span ref={ref}>{display}{suffix}</span>;
};

const FloatingShape = ({ color, delay, x, y, size }: { color: string; delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full opacity-20 blur-sm pointer-events-none"
    style={{ backgroundColor: color, width: size, height: size, left: x, top: y }}
    animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const CATEGORY_PICKS: { tag: PaletteTag; color: string }[] = [
  { tag: 'Ocean', color: 'hsl(var(--primary))' },
  { tag: 'Nature', color: 'hsl(120, 40%, 50%)' },
  { tag: 'Retro', color: 'hsl(30, 80%, 55%)' },
  { tag: 'Pastel', color: 'hsl(300, 60%, 70%)' },
  { tag: 'Neon', color: 'hsl(60, 100%, 50%)' },
  { tag: 'Dark', color: 'hsl(0, 0%, 20%)' },
  { tag: 'Cyberpunk', color: 'hsl(280, 80%, 50%)' },
  { tag: 'Sunset', color: 'hsl(15, 90%, 55%)' },
  { tag: 'Tropical', color: 'hsl(160, 60%, 50%)' },
  { tag: 'Luxury', color: 'hsl(45, 70%, 40%)' },
  { tag: 'Synthwave', color: 'hsl(300, 90%, 50%)' },
  { tag: 'Arctic', color: 'hsl(200, 30%, 80%)' },
];

const Index = () => {
  const navigate = useNavigate();
  const { palettes } = usePaletteStore();
  // Get actual top-liked palettes for trending
  const trending = [...palettes].sort((a, b) => b.likes - a.likes).slice(0, 8);
  const [stripHovered, setStripHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient-shift" />
          <FloatingShape color="hsl(252, 85%, 60%)" delay={0} x="10%" y="20%" size={120} />
          <FloatingShape color="hsl(340, 82%, 62%)" delay={1} x="80%" y="15%" size={90} />
          <FloatingShape color="hsl(200, 80%, 60%)" delay={2} x="70%" y="70%" size={100} />
          <FloatingShape color="hsl(45, 90%, 55%)" delay={0.5} x="20%" y="75%" size={80} />
          <FloatingShape color="hsl(160, 70%, 50%)" delay={1.5} x="50%" y="10%" size={70} />
          <FloatingShape color="hsl(300, 70%, 60%)" delay={3} x="40%" y="85%" size={60} />
        </div>

        <div className="container mx-auto px-4 text-center pt-20 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {palettes.length.toLocaleString()}+ curated color palettes
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Discover Beautiful{' '}
            <span className="gradient-hero-text">Color Palettes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Curated palettes for designers, developers, and creators.
            Browse, generate, and export in any format.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="text-base px-8 py-6 gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
              onClick={() => navigate('/explore')}
            >
              <Sparkles className="h-4 w-4" />
              Explore Palettes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 gap-2 hover:scale-[1.03] active:scale-[0.97] transition-transform"
              onClick={() => navigate('/generate')}
            >
              <Wand2 className="h-4 w-4" />
              Generate Your Own
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Auto-scrolling palette strip */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 overflow-hidden max-w-4xl mx-auto"
            onMouseEnter={() => setStripHovered(true)}
            onMouseLeave={() => setStripHovered(false)}
          >
            <motion.div
              className="flex gap-4"
              animate={{ x: stripHovered ? undefined : [0, -600] }}
              transition={stripHovered ? {} : { duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...trending, ...trending].map((p, i) => (
                <div key={`preview-${i}`} className="flex-shrink-0 w-64 rounded-xl overflow-hidden border border-border/30 shadow-md">
                  <div className="flex h-16">
                    {p.colors.map((c, j) => (
                      <div key={j} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="py-1.5 px-3 bg-card/80 backdrop-blur-sm">
                    <span className="text-xs font-medium text-foreground">{p.name}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { value: 2000, suffix: '+', label: 'Palettes' },
              { value: ALL_TAGS.length, suffix: '', label: 'Categories' },
              { value: 10, suffix: '', label: 'Color Formats' },
              { value: 0, suffix: '', label: 'Free Forever', isText: true },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                  {stat.isText ? '🎉' : <CountUp target={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">🔥 Trending This Week</h2>
              <p className="text-muted-foreground mt-1">Most loved palettes by the community</p>
            </div>
            <Link to="/explore?sort=popular" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((palette, i) => (
              <motion.div
                key={palette.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <PaletteCard palette={palette} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY QUICK FILTER */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
          >
            Browse by Category
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORY_PICKS.map((cat, i) => (
              <motion.button
                key={cat.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/explore?tag=${cat.tag}`)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span className="text-lg">{TAG_EMOJIS[cat.tag]}</span>
                <span className="text-sm font-semibold text-foreground">{cat.tag}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-12 sm:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Ready to find your perfect palette?
              </h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
                Generate, explore, and export beautiful color combinations — completely free.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/generate')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-base px-8 py-6 hover:scale-[1.03] active:scale-[0.97] transition-transform"
              >
                Start Generating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
