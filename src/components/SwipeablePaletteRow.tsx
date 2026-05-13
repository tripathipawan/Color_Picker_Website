import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PaletteCard from '@/components/PaletteCard';
import type { Palette } from '@/lib/palettes';

interface SwipeablePaletteRowProps {
  palettes: Palette[];
  title?: string;
}

const SwipeablePaletteRow = ({ palettes, title }: SwipeablePaletteRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-3 px-1">{title}</h3>
      )}
      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-1 px-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onPointerDown={() => setIsDragging(false)}
        onPointerMove={() => setIsDragging(true)}
      >
        {palettes.map((palette) => (
          <div
            key={palette.id}
            className="snap-start shrink-0 w-[280px] sm:w-[300px]"
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
          >
            <PaletteCard palette={palette} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SwipeablePaletteRow;
