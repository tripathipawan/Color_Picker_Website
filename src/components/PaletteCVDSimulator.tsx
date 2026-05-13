import { useState } from 'react';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { simulateCVD, cvdTypes, type CVDType } from '@/lib/colorBlindness';
import { getContrastColor } from '@/lib/colors';

interface Props {
  colors: string[];
}

const PaletteCVDSimulator = ({ colors }: Props) => {
  const [activeCVD, setActiveCVD] = useState<CVDType | null>(null);

  const displayColors = activeCVD ? colors.map(c => simulateCVD(c, activeCVD)) : colors;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Color Vision Simulator</h3>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveCVD(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeCVD ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          Normal
        </button>
        {cvdTypes.filter(c => c.key !== 'achromatopsia').map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCVD(activeCVD === key ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCVD === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div layout className="flex rounded-lg overflow-hidden h-16">
        {displayColors.map((color, i) => (
          <motion.div
            key={i}
            layout
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-[10px] font-mono font-bold" style={{ color: getContrastColor(color) }}>
              {color}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {activeCVD && (
        <p className="text-[11px] text-muted-foreground mt-2">
          Simulating {cvdTypes.find(c => c.key === activeCVD)?.label} — {cvdTypes.find(c => c.key === activeCVD)?.description}
        </p>
      )}
    </div>
  );
};

export default PaletteCVDSimulator;
