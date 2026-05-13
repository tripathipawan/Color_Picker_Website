import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, Unlock, Copy, Trash2, Plus, RefreshCw, Download, FileText, Share2, Code, CloudUpload, Eye } from 'lucide-react';
import PaletteCVDSimulator from '@/components/PaletteCVDSimulator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { randomHex, getContrastColor, hexToRgb, rgbToHsl, getColorName } from '@/lib/colors';
import { usePaletteStore } from '@/store/paletteStore';
import { useCloudPalettes } from '@/hooks/useCloudPalettes';

interface Swatch {
  id: string;
  color: string;
  locked: boolean;
}

function buildMinimalPdf(w: number, h: number, stream: string): string {
  const objs = [
    `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj`,
    `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj`,
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${w} ${h}]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`,
    `4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream\nendobj`,
    `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj`,
  ];
  let body = '';
  const offsets: number[] = [];
  const header = '%PDF-1.4\n';
  let pos = header.length;
  objs.forEach(o => { offsets.push(pos); body += o + '\n'; pos += o.length + 1; });
  const xrefPos = pos;
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => { xref += off.toString().padStart(10, '0') + ' 00000 n \n'; });
  xref += `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
  return header + body + xref;
}

const Generate = () => {
  const [searchParams] = useSearchParams();
  const { toggleSave, savedPaletteIds } = usePaletteStore();
  const { savePalette, user } = useCloudPalettes();
  const [showExport, setShowExport] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [showCVD, setShowCVD] = useState(false);

  const [swatches, setSwatches] = useState<Swatch[]>(() => {
    const urlColors = searchParams.get('colors');
    if (urlColors) {
      const cols = urlColors.split(',').map(c => `#${c.replace('#', '').toUpperCase()}`);
      return cols.map((color, i) => ({ id: `s-${i}`, color, locked: false }));
    }
    return Array.from({ length: 5 }, (_, i) => ({ id: `s-${i}`, color: randomHex(), locked: false }));
  });

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [genKey, setGenKey] = useState(0);

  const generate = useCallback(() => {
    setSwatches(prev => prev.map(s => s.locked ? s : { ...s, color: randomHex() }));
    setGenKey(k => k + 1);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target === document.body || e.target === document.documentElement)) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  const toggleLock = (id: string) => {
    setSwatches(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s));
  };

  const removeSwatch = (id: string) => {
    if (swatches.length <= 2) return toast.error('Minimum 2 colors');
    setSwatches(prev => prev.filter(s => s.id !== id));
  };

  const addSwatch = () => {
    if (swatches.length >= 8) return toast.error('Maximum 8 colors');
    setSwatches(prev => [...prev, { id: `s-${Date.now()}`, color: randomHex(), locked: false }]);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}!`);
  };

  const copyCssVars = () => {
    const css = swatches.map((s, i) => `  --color-${i + 1}: ${s.color};`).join('\n');
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    toast.success('CSS variables copied!');
  };

  const copyTailwindConfig = () => {
    const colors: Record<string, string> = {};
    swatches.forEach((s, i) => { colors[`palette-${i + 1}`] = s.color; });
    const config = `// tailwind.config.ts\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 8).replace(/"/g, "'")}\n    }\n  }\n}`;
    navigator.clipboard.writeText(config);
    toast.success('Tailwind config copied!');
  };

  const copyScssVars = () => {
    const scss = swatches.map((s, i) => `$color-${i + 1}: ${s.color};`).join('\n');
    navigator.clipboard.writeText(scss);
    toast.success('SCSS variables copied!');
  };

  const copyHexArray = () => {
    navigator.clipboard.writeText(JSON.stringify(swatches.map(s => s.color)));
    toast.success('HEX array copied!');
  };

  const copyRgbArray = () => {
    const arr = swatches.map(s => {
      const rgb = hexToRgb(s.color);
      return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : s.color;
    });
    navigator.clipboard.writeText(JSON.stringify(arr));
    toast.success('RGB array copied!');
  };

  const copyHslArray = () => {
    const arr = swatches.map(s => {
      const rgb = hexToRgb(s.color);
      if (!rgb) return s.color;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    });
    navigator.clipboard.writeText(JSON.stringify(arr));
    toast.success('HSL array copied!');
  };

  const shareUrl = () => {
    const colors = swatches.map(s => s.color.replace('#', '')).join(',');
    const url = `${window.location.origin}/generate?colors=${colors}`;
    navigator.clipboard.writeText(url);
    toast.success('Share URL copied!');
  };

  const downloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = swatches.length * 200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    swatches.forEach((s, i) => {
      ctx.fillStyle = s.color;
      ctx.fillRect(i * 200, 0, 200, 400);
      ctx.fillStyle = getContrastColor(s.color);
      ctx.font = 'bold 16px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.color, i * 200 + 100, 210);
    });
    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('PNG downloaded!');
  };

  const downloadPdf = () => {
    const w = 595.28;
    const h = 841.89;
    const margin = 40;
    const swatchH = 140;
    const swatchW = (w - margin * 2) / swatches.length;
    let stream = '';
    stream += `BT /F1 22 Tf ${margin} ${h - margin - 22} Td (PaletteFlow - Color Palette) Tj ET\n`;
    stream += `BT /F1 10 Tf ${margin} ${h - margin - 40} Td (Exported Palette) Tj ET\n`;
    const swatchY = h - margin - 70 - swatchH;
    swatches.forEach((s, i) => {
      const rgb = hexToRgb(s.color);
      if (!rgb) return;
      const x = margin + i * swatchW;
      stream += `${(rgb.r / 255).toFixed(3)} ${(rgb.g / 255).toFixed(3)} ${(rgb.b / 255).toFixed(3)} rg\n`;
      stream += `${x.toFixed(2)} ${swatchY.toFixed(2)} ${swatchW.toFixed(2)} ${swatchH} re f\n`;
    });
    swatches.forEach((s, i) => {
      const rgb = hexToRgb(s.color);
      if (!rgb) return;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const name = getColorName(s.color);
      const x = margin + i * swatchW + 4;
      const textY = swatchY - 18;
      stream += `0 0 0 rg\n`;
      stream += `BT /F1 8 Tf ${x.toFixed(2)} ${textY} Td (${s.color}) Tj ET\n`;
      stream += `BT /F1 7 Tf ${x.toFixed(2)} ${textY - 13} Td (RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}) Tj ET\n`;
      stream += `BT /F1 7 Tf ${x.toFixed(2)} ${textY - 24} Td (HSL: ${hsl.h}, ${hsl.s}%, ${hsl.l}%) Tj ET\n`;
      stream += `BT /F1 7 Tf ${x.toFixed(2)} ${textY - 35} Td (${name}) Tj ET\n`;
    });
    const pdf = buildMinimalPdf(w, h, stream);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.download = 'palette.pdf';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('PDF downloaded!');
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setSwatches(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-1 flex-col sm:flex-row min-h-0">
        <AnimatePresence mode="popLayout">
          {swatches.map((swatch, idx) => {
            const contrast = getContrastColor(swatch.color);
            return (
              <motion.div
                key={swatch.id}
                layout
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0, width: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 cursor-grab active:cursor-grabbing relative group min-h-[100px]"
                style={{ backgroundColor: swatch.color }}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDragIdx(null)}
              >
                <motion.span
                  key={`${swatch.color}-${genKey}`}
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="text-xl sm:text-2xl font-bold select-all"
                  style={{ color: contrast }}
                >
                  {swatch.color}
                </motion.span>

                {/* Color info on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {(() => {
                    const rgb = hexToRgb(swatch.color);
                    if (!rgb) return null;
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    return (
                      <div className="text-[10px] font-mono space-y-0.5" style={{ color: contrast }}>
                        <div>rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                        <div>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
                        <div>{getColorName(swatch.color)}</div>
                      </div>
                    );
                  })()}
                </motion.div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    onClick={() => toggleLock(swatch.id)}
                    whileTap={{ rotate: swatch.locked ? -20 : 20 }}
                    className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                    style={{ color: contrast }}
                  >
                    {swatch.locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                  </motion.button>
                  <button onClick={() => copyHex(swatch.color)} className="p-2 rounded-lg hover:bg-black/10 transition-colors" style={{ color: contrast }}>
                    <Copy className="h-5 w-5" />
                  </button>
                  <button onClick={() => removeSwatch(swatch.id)} className="p-2 rounded-lg hover:bg-black/10 transition-colors" style={{ color: contrast }}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                {swatch.locked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <Lock className="h-4 w-4" style={{ color: contrast }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showCVD && (
        <div className="px-4 py-3 border-t border-border bg-card/50">
          <PaletteCVDSimulator colors={swatches.map(s => s.color)} />
        </div>
      )}

      <div className="border-t border-border bg-card px-3 sm:px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button onClick={generate} className="gap-2" aria-label="Generate new palette (Space)">
            <RefreshCw className="h-4 w-4" />
            Generate
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" onClick={addSwatch} className="gap-2" disabled={swatches.length >= 8} aria-label="Add color">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{swatches.length >= 8 ? 'Maximum 8 colors' : 'Add a new color (max 8)'}</TooltipContent>
          </Tooltip>
          <span className="text-xs text-muted-foreground hidden md:inline">Press SPACE to generate</span>
        </div>
        <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide max-w-full">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setPaletteName(''); setShowNameModal(true); }}
              className="gap-1 shrink-0"
              aria-label="Save palette to cloud"
            >
              <CloudUpload className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save to Cloud</span>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showCVD ? "default" : "outline"} size="sm" onClick={() => setShowCVD(!showCVD)} className="gap-1 shrink-0" aria-pressed={showCVD} aria-label="Toggle color blindness simulator">
                <Eye className="h-3.5 w-3.5" /> CVD
              </Button>
            </TooltipTrigger>
            <TooltipContent>Color blindness simulator</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={shareUrl} className="gap-1 shrink-0" aria-label="Copy share URL">
                <Share2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy a share URL with these colors</TooltipContent>
          </Tooltip>
          <div className="relative shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExport(!showExport)}
                  className="gap-1"
                  aria-haspopup="menu"
                  aria-expanded={showExport}
                  aria-label="Export code formats"
                  disabled={swatches.length === 0}
                >
                  <Code className="h-3.5 w-3.5" /> Export ▾
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy as CSS / Tailwind / SCSS / arrays</TooltipContent>
            </Tooltip>
            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  role="menu"
                  className="absolute bottom-full mb-2 right-0 z-30 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
                >
                  {[
                    { label: 'CSS Variables', fn: copyCssVars },
                    { label: 'Tailwind Config', fn: copyTailwindConfig },
                    { label: 'SCSS Variables', fn: copyScssVars },
                    { label: 'HEX Array', fn: copyHexArray },
                    { label: 'RGB Array', fn: copyRgbArray },
                    { label: 'HSL Array', fn: copyHslArray },
                  ].map(({ label, fn }) => (
                    <button
                      key={label}
                      role="menuitem"
                      onClick={() => { fn(); setShowExport(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={downloadPng} className="gap-1 shrink-0" disabled={swatches.length === 0} aria-label="Download palette as PNG">
                <Download className="h-3.5 w-3.5" /> PNG
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download a PNG image</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={downloadPdf} className="gap-1 shrink-0" disabled={swatches.length === 0} aria-label="Download palette as PDF">
                <FileText className="h-3.5 w-3.5" /> PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download a print-ready PDF</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Name palette modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowNameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-foreground mb-1">Name Your Palette</h3>
              <p className="text-sm text-muted-foreground mb-4">Give your palette a memorable name before saving.</p>
              <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                {swatches.map((s, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: s.color }} />
                ))}
              </div>
              <input
                autoFocus
                value={paletteName}
                onChange={e => setPaletteName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && paletteName.trim()) {
                    savePalette(paletteName.trim(), swatches.map(s => s.color));
                    setShowNameModal(false);
                  }
                }}
                placeholder="e.g. Sunset Vibes"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowNameModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  disabled={!paletteName.trim()}
                  onClick={() => {
                    savePalette(paletteName.trim(), swatches.map(s => s.color));
                    setShowNameModal(false);
                  }}
                >
                  Save to Cloud
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Generate;
