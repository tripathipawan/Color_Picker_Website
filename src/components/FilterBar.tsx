import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ALL_TAGS, TAG_EMOJIS, type PaletteTag } from '@/lib/palettes';
import { usePaletteStore } from '@/store/paletteStore';
import { cn } from '@/lib/utils';

const FilterBar = () => {
  const { filterTag, setFilterTag, sortBy, setSortBy, searchQuery, setSearchQuery } = usePaletteStore();
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-4">
      <motion.div
        className="relative"
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by color, name, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </motion.div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setFilterTag(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              !filterTag ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All
          </motion.button>
          {ALL_TAGS.map(tag => (
            <motion.button
              key={tag}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                filterTag === tag ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {TAG_EMOJIS[tag]} {tag}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {(['popular', 'new', 'trending'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                sortBy === sort ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
