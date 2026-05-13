import { useState } from 'react';
import { Check, X, Eye, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getContrastRatio } from '@/lib/colors';
import { simulateCVD, cvdTypes, type CVDType } from '@/lib/colorBlindness';
import { parseColor } from '@/lib/colorParser';

const Badge = ({ pass, label }: { pass: boolean; label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${pass ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'}`}
  >
    {pass ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <X className="h-4 w-4 text-red-500 dark:text-red-400" />}
    <span className={`text-sm font-medium ${pass ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{label}</span>
  </motion.div>
);

const ContrastChecker = () => {
  const [fgInput, setFgInput] = useState('#1A1A2E');
  const [bgInput, setBgInput] = useState('#FFFFFF');
  const [activeCVD, setActiveCVD] = useState<CVDType | null>(null);

  // Parse any format to hex
  const parsedFg = parseColor(fgInput);
  const parsedBg = parseColor(bgInput);
  const fg = parsedFg?.hex || '#1A1A2E';
  const bg = parsedBg?.hex || '#FFFFFF';

  const displayFg = activeCVD ? simulateCVD(fg, activeCVD) : fg;
  const displayBg = activeCVD ? simulateCVD(bg, activeCVD) : bg;

  const ratio = getContrastRatio(displayFg, displayBg);
  const roundedRatio = Math.round(ratio * 100) / 100;

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3;
  const aaaNormal = ratio >= 7;
  const aaaLarge = ratio >= 4.5;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Contrast Checker</h1>
        <p className="text-muted-foreground mb-8">Check WCAG accessibility — supports HEX, RGB, RGBA, HSL, HSLA, and named colors</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Foreground (Text)</label>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover-lift">
            <input type="color" value={fg} onChange={(e) => setFgInput(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
            <input
              type="text"
              value={fgInput}
              onChange={(e) => setFgInput(e.target.value)}
              placeholder="hex, rgb(), hsl(), or name"
              className="flex-1 bg-transparent text-foreground font-mono text-sm focus:outline-none"
            />
            {parsedFg && <span className="text-[10px] text-muted-foreground uppercase">{parsedFg.format}</span>}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Background</label>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover-lift">
            <input type="color" value={bg} onChange={(e) => setBgInput(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
            <input
              type="text"
              value={bgInput}
              onChange={(e) => setBgInput(e.target.value)}
              placeholder="hex, rgb(), hsl(), or name"
              className="flex-1 bg-transparent text-foreground font-mono text-sm focus:outline-none"
            />
            {parsedBg && <span className="text-[10px] text-muted-foreground uppercase">{parsedBg.format}</span>}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-center mb-8"
      >
        <div className="text-5xl font-bold text-foreground">{roundedRatio}:1</div>
        <p className="text-sm text-muted-foreground mt-1">
          Contrast Ratio{activeCVD && ` (${cvdTypes.find(c => c.key === activeCVD)?.label} simulation)`}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Badge pass={aaNormal} label="AA Normal" />
        <Badge pass={aaLarge} label="AA Large" />
        <Badge pass={aaaNormal} label="AAA Normal" />
        <Badge pass={aaaLarge} label="AAA Large" />
      </div>

      {/* Color Blindness Simulator */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Color Blindness Simulator</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveCVD(null)}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${!activeCVD ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/40'}`}
          >
            <div className="flex gap-1 mb-2">
              <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: fg }} />
              <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: bg }} />
            </div>
            <p className="text-xs font-medium text-foreground">Normal</p>
            <p className="text-[10px] text-muted-foreground">No deficiency</p>
          </button>
          {cvdTypes.map(({ key, label, description }) => {
            const simFg = simulateCVD(fg, key);
            const simBg = simulateCVD(bg, key);
            return (
              <button
                key={key}
                onClick={() => setActiveCVD(activeCVD === key ? null : key)}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${activeCVD === key ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/40'}`}
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: simFg }} />
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: simBg }} />
                </div>
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Preview</h2>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-border overflow-hidden">
          <div className="p-8" style={{ backgroundColor: displayBg }}>
            <p className="text-sm mb-2" style={{ color: displayFg }}>Normal text (14px) — The quick brown fox jumps over the lazy dog.</p>
            <p className="text-lg font-bold mb-2" style={{ color: displayFg }}>Large text (18px bold) — The quick brown fox jumps over the lazy dog.</p>
            <p className="text-2xl font-bold" style={{ color: displayFg }}>Heading (24px bold) — PaletteFlow</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-border overflow-hidden">
          <div className="p-8 flex gap-4 flex-wrap" style={{ backgroundColor: displayBg }}>
            <button className="px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-105" style={{ backgroundColor: displayFg, color: displayBg }}>
              Button
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-transform hover:scale-105" style={{ borderColor: displayFg, color: displayFg, backgroundColor: 'transparent' }}>
              Outline Button
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: displayFg, color: displayBg }}>
              Badge
            </span>
            <a href="#" className="text-sm underline" style={{ color: displayFg }}>Link text</a>
          </div>
        </motion.div>
      </div>

      <button
        onClick={() => { setFgInput(bgInput); setBgInput(fgInput); }}
        className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline hover:scale-105 transition-transform"
      >
        <ArrowRightLeft className="h-4 w-4" /> Swap colors
      </button>
    </div>
  );
};

export default ContrastChecker;
