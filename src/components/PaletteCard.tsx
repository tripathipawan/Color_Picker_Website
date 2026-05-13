import { useState, useCallback } from 'react';
import { Heart, Bookmark, BookmarkCheck, Share2, Eye, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getContrastColor, hexToRgb, rgbToHsl, getColorName } from '@/lib/colors';
import { type Palette } from '@/lib/palettes';
import { usePaletteStore, type ColorFormat } from '@/store/paletteStore';
import { cn } from '@/lib/utils';

interface PaletteCardProps {
  palette: Palette;
  showDelete?: boolean;
  onDelete?: () => void;
}

function formatColorAs(hex: string, format: ColorFormat): string {
  if (format === 'hex') return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  if (format === 'rgb') return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  if (format === 'hsl') {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }
  if (format === 'name') return getColorName(hex);
  return hex;
}

const FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl', 'name'];

// Heart particle burst component
const HeartParticles = ({ active }: { active: boolean }) => {
  if (!active) return null;
  const particles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const distance = 20 + Math.random() * 15;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0.4 + Math.random() * 0.4,
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: p.scale }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 text-accent"
          style={{ fontSize: 8 }}
        >
          ❤
        </motion.div>
      ))}
    </div>
  );
};

const PaletteCard = ({ palette, showDelete, onDelete }: PaletteCardProps) => {
  const { toggleLike, toggleSave, savedPaletteIds, colorFormat, setColorFormat } = usePaletteStore();
  const [hoveredColor, setHoveredColor] = useState<number | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const navigate = useNavigate();
  const isSaved = savedPaletteIds.includes(palette.id);

  const copyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = formatColorAs(hex, colorFormat);
    navigator.clipboard.writeText(formatted);
    toast.success(`Copied ${formatted}!`);
  };

  const sharePalette = (e: React.MouseEvent) => {
    e.stopPropagation();
    const colors = palette.colors.map(c => c.replace('#', '')).join('-');
    const url = `${window.location.origin}/palette?colors=${colors}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  const handleLike = () => {
    setLiked(true);
    setShowParticles(true);
    toggleLike(palette.id);
    setTimeout(() => { setLiked(false); setShowParticles(false); }, 700);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm"
    >
      {/* Color swatches */}
      <div className="flex h-36 cursor-pointer">
        {palette.colors.map((color, i) => (
          <motion.div
            key={i}
            className="relative flex-1 transition-all duration-300 hover:flex-[1.8]"
            style={{ backgroundColor: color }}
            onMouseEnter={() => setHoveredColor(i)}
            onMouseLeave={() => setHoveredColor(null)}
            onClick={(e) => copyColor(color, e)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <AnimatePresence>
              {hoveredColor === i && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                >
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md"
                    style={{ color: getContrastColor(color), backgroundColor: `${color}88` }}
                  >
                    {formatColorAs(color, colorFormat)}
                  </span>
                  <span className="text-[8px] font-medium opacity-70" style={{ color: getContrastColor(color) }}>
                    Click to copy
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Info section */}
      <div className="px-3.5 pt-2.5 pb-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-semibold text-foreground truncate">{palette.name}</h3>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowFormatMenu(!showFormatMenu); }}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground flex items-center gap-0.5 hover:bg-primary/10 transition-colors"
            >
              {colorFormat.toUpperCase()}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
            <AnimatePresence>
              {showFormatMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      onClick={(e) => { e.stopPropagation(); setColorFormat(f); setShowFormatMenu(false); }}
                      className={cn(
                        'block w-full text-left px-3 py-1.5 text-xs font-medium transition-colors',
                        f === colorFormat ? 'bg-primary/10 text-primary' : 'text-popover-foreground hover:bg-muted'
                      )}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap mb-2">
          {palette.tags.map(tag => (
            <span
              key={tag}
              className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => navigate(`/explore?tag=${tag}`)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3.5 py-2 border-t border-border/50">
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 1.3 }}
              className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-accent/10"
            >
              <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4, type: 'spring' }}>
                <Heart className={cn('h-3.5 w-3.5', liked && 'fill-accent text-accent')} />
              </motion.div>
              <span className="text-xs">{palette.likes}</span>
            </motion.button>
            <HeartParticles active={showParticles} />
          </div>

          <button
            onClick={sharePalette}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
            title="Copy share link"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              toggleSave(palette.id);
              toast.success(isSaved ? 'Removed from saved' : 'Palette saved!');
            }}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
          >
            {isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5 fill-primary text-primary" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            onClick={() => navigate(`/color/${palette.colors[0].replace('#', '')}`)}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>

        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PaletteCard;
