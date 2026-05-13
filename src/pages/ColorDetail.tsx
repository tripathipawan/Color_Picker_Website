import { useParams, Link } from 'react-router-dom';
import { Copy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  hexToRgb, rgbToHsl, getContrastColor, getColorName,
  getTints, getShades, getComplementary, getAnalogous, getTriadic,
} from '@/lib/colors';
import { parseColor, formatColor, COLOR_FORMATS } from '@/lib/colorParser';
import { usePaletteStore } from '@/store/paletteStore';
import PaletteCard from '@/components/PaletteCard';

const ColorDetail = () => {
  const { hex } = useParams<{ hex: string }>();
  const color = `#${hex?.toUpperCase() || '000000'}`;
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const contrast = getContrastColor(color);
  const name = getColorName(color);
  const tints = getTints(color);
  const shades = getShades(color);
  const complementary = getComplementary(color);
  const analogous = getAnalogous(color);
  const triadic = getTriadic(color);
  const parsed = parseColor(color);

  const { palettes } = usePaletteStore();
  const related = palettes.filter(p => p.colors.some(c => c.toUpperCase() === color)).slice(0, 6);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}!`);
  };

  const ColorChip = ({ c, label }: { c: string; label?: string }) => (
    <motion.button
      onClick={() => copy(c)}
      className="flex flex-col items-center gap-1 group"
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <Link to={`/color/${c.replace('#', '')}`}>
        <div className="w-16 h-16 rounded-xl border border-border shadow-sm transition-shadow group-hover:shadow-lg" style={{ backgroundColor: c }} />
      </Link>
      <span className="text-[10px] font-mono text-muted-foreground">{label || c}</span>
    </motion.button>
  );

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 hover:-translate-x-1 transition-transform">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden border border-border mb-8"
        style={{ backgroundColor: color }}
      >
        <div className="h-48 flex items-center justify-center">
          <div className="text-center" style={{ color: contrast }}>
            <h1 className="text-4xl font-bold">{name}</h1>
            <p className="text-lg mt-1 opacity-80">{color}</p>
          </div>
        </div>
      </motion.div>

      {/* All color formats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {parsed && COLOR_FORMATS.map(fmt => {
          const value = formatColor(parsed, fmt);
          return (
            <motion.button
              key={fmt}
              variants={fadeUp}
              onClick={() => copy(value)}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="text-left">
                <span className="text-xs text-muted-foreground uppercase">{fmt}</span>
                <p className="text-sm font-mono font-medium text-foreground">{value}</p>
              </div>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </motion.div>

      <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Tints</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <ColorChip c={color} label="Base" />
          {tints.map((t, i) => <ColorChip key={i} c={t} />)}
        </div>
      </motion.section>

      <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Shades</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <ColorChip c={color} label="Base" />
          {shades.map((s, i) => <ColorChip key={i} c={s} />)}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Color Harmonies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Complementary</p>
            <div className="flex gap-2">
              <ColorChip c={color} />
              <ColorChip c={complementary} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">Analogous</p>
            <div className="flex gap-2">
              <ColorChip c={analogous[0]} />
              <ColorChip c={color} />
              <ColorChip c={analogous[1]} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">Triadic</p>
            <div className="flex gap-2">
              <ColorChip c={color} />
              {triadic.map((t, i) => <ColorChip key={i} c={t} />)}
            </div>
          </div>
        </div>
      </motion.section>

      {related.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Palettes with this color</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map(p => <PaletteCard key={p.id} palette={p} />)}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default ColorDetail;
