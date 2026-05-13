import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaletteStore } from '@/store/paletteStore';
import PaletteCard from '@/components/PaletteCard';
import FilterBar from '@/components/FilterBar';
import type { PaletteTag } from '@/lib/palettes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 24;

const PaletteCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/60">
    <Skeleton className="h-36 w-full rounded-none" />
    <div className="px-3.5 py-3 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
    </div>
    <div className="px-3.5 py-2 border-t border-border/50">
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const Explore = () => {
  const { getFilteredPalettes, setFilterTag } = usePaletteStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const allPalettes = getFilteredPalettes();

  const currentPage = Number(searchParams.get('page') || '1');

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) setFilterTag(tag as PaletteTag);
  }, [searchParams, setFilterTag]);

  const totalPages = Math.ceil(allPalettes.length / ITEMS_PER_PAGE);
  const palettes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allPalettes.slice(start, start + ITEMS_PER_PAGE);
  }, [allPalettes, currentPage]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, allPalettes.length);

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Palettes</h1>
        <p className="text-muted-foreground">Discover {allPalettes.length.toLocaleString()}+ beautiful color combinations</p>
      </motion.div>

      <FilterBar />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8"
        >
          {palettes.map((palette, i) => (
            <motion.div
              key={palette.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <PaletteCard palette={palette} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {palettes.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No palettes found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          <button
            onClick={() => { setFilterTag(null); setSearchParams({}); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 mt-10"
        >
          <p className="text-sm text-muted-foreground">
            Showing {startIdx}–{endIdx} of {allPalettes.length.toLocaleString()} palettes
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                currentPage === 1
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
              ) : (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(p)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-semibold transition-all',
                    currentPage === p
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {p}
                </motion.button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                currentPage === totalPages
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Explore;
