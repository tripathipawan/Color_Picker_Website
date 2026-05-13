import { useSearchParams, Link } from 'react-router-dom';
import { Copy, ArrowLeft, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getContrastColor, getColorName } from '@/lib/colors';

const SharedPalette = () => {
  const [searchParams] = useSearchParams();
  const colorsParam = searchParams.get('colors');
  const nameParam = searchParams.get('name');
  const colors = colorsParam ? colorsParam.split('-').map(c => `#${c}`) : [];

  if (colors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Invalid palette link</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">← Back to Explore</Link>
      </div>
    );
  }

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}!`);
  };

  const shareUrl = window.location.href;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">{nameParam || 'Shared Palette'}</h1>
        <p className="text-muted-foreground mb-8">A beautiful color palette shared with you</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex rounded-2xl overflow-hidden border border-border h-48 sm:h-64 mb-6 shadow-lg"
      >
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className="flex-1 flex items-center justify-center cursor-pointer group relative hover:flex-[1.5] transition-all duration-300"
            style={{ backgroundColor: color }}
            onClick={() => copyHex(color)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
              <span className="text-lg font-bold block" style={{ color: getContrastColor(color) }}>{color}</span>
              <span className="text-xs opacity-70" style={{ color: getContrastColor(color) }}>{getColorName(color)}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {colors.map((color, i) => (
          <motion.button
            key={i}
            onClick={() => copyHex(color)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-full aspect-square rounded-lg" style={{ backgroundColor: color }} />
            <span className="text-xs font-mono text-foreground">{color}</span>
            <span className="text-[10px] text-muted-foreground">{getColorName(color)}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={copyLink} className="gap-2">
          <Share2 className="h-4 w-4" /> Copy Share Link
        </Button>
        <Button variant="outline" onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(colors));
          toast.success('Hex array copied!');
        }} className="gap-2">
          <Copy className="h-4 w-4" /> Copy Hex Array
        </Button>
      </div>
    </div>
  );
};

export default SharedPalette;
