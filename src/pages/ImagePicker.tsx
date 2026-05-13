import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Copy, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { extractColors, getContrastColor, hexToRgb, rgbToHsl, getColorName } from '@/lib/colors';
import { usePaletteStore } from '@/store/paletteStore';

const ImagePicker = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleSave } = usePaletteStore();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLoading(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(200 / img.width, 200 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extracted = extractColors(imageData, 5);
      setColors(extracted);
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
      toast.error('Failed to load image');
    };
    img.src = url;
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}!`);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(colors));
    toast.success('Palette copied!');
  };

  const generateFromPalette = () => {
    const colorsParam = colors.map(c => c.replace('#', '')).join(',');
    navigate(`/generate?colors=${colorsParam}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Image Color Picker</h1>
        <p className="text-muted-foreground mb-8">Upload an image to extract its dominant colors</p>
      </motion.div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <AnimatePresence mode="wait">
        {!imageUrl ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-primary')}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Drop an image here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP, GIF</p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img src={imageUrl} alt="Uploaded image for color extraction" className="w-full max-h-[400px] object-contain bg-muted" />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3"
                onClick={() => { setImageUrl(null); setColors([]); }}
              >
                Change Image
              </Button>
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 py-8 text-muted-foreground"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Extracting colors...</span>
              </motion.div>
            ) : colors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Extracted Palette</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyAll} className="gap-1">
                      <Copy className="h-3.5 w-3.5" /> Copy All
                    </Button>
                    <Button size="sm" onClick={generateFromPalette} className="gap-1">
                      <Wand2 className="h-3.5 w-3.5" /> Generate from this
                    </Button>
                  </div>
                </div>

                <div className="flex rounded-xl overflow-hidden border border-border h-32">
                  {colors.map((color, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 flex items-center justify-center cursor-pointer hover:flex-[1.5] transition-all group"
                      style={{ backgroundColor: color }}
                      onClick={() => copyColor(color)}
                    >
                      <span
                        className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md"
                        style={{ color: getContrastColor(color), backgroundColor: `${color}88` }}
                      >
                        {color}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {colors.map((color, i) => {
                    const rgb = hexToRgb(color);
                    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        onClick={() => copyColor(color)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-all hover:-translate-y-1"
                      >
                        <div className="w-full aspect-square rounded-lg" style={{ backgroundColor: color }} />
                        <span className="text-xs font-mono text-foreground">{color}</span>
                        {rgb && <span className="text-[10px] text-muted-foreground">rgb({rgb.r},{rgb.g},{rgb.b})</span>}
                        <span className="text-[10px] text-muted-foreground">{getColorName(color)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImagePicker;
