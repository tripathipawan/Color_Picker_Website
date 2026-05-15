import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaletteStore } from "@/store/paletteStore";
import PaletteCard from "@/components/PaletteCard";
import SwipeablePaletteRow from "@/components/SwipeablePaletteRow";
import { Bookmark, Trash2, Download, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

type SortMode = "date" | "name" | "likes" | "custom";

const Saved = () => {
  const { getSavedPalettes, removeSaved, savedPaletteIds, reorderSaved } =
    usePaletteStore();
  const isMobile = useIsMobile();
  const [sortMode, setSortMode] = useState<SortMode>("custom");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const saved = getSavedPalettes();
  const sorted =
    sortMode === "custom"
      ? saved
      : [...saved].sort((a, b) => {
          if (sortMode === "name") return a.name.localeCompare(b.name);
          if (sortMode === "likes") return b.likes - a.likes;
          return b.createdAt - a.createdAt;
        });

  const clearAll = () => {
    savedPaletteIds.forEach((id) => removeSaved(id));
    setShowClearConfirm(false);
    toast.success("All saved palettes cleared");
  };

  const exportJson = () => {
    const json = JSON.stringify(
      saved.map((p) => ({ name: p.name, colors: p.colors, tags: p.tags })),
      null,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "saved-palettes.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("JSON exported!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Saved Palettes
        </h1>
        <p className="text-muted-foreground mb-6">
          Your collection of favorite color palettes
        </p>
      </motion.div>

      {saved.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6 flex-wrap gap-3"
        >
          {/* Sort controls */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(["custom", "date", "name", "likes"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  sortMode === mode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "date"
                  ? "Newest"
                  : mode === "likes"
                    ? "Most Liked"
                    : mode === "custom"
                      ? "Custom"
                      : "Name"}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportJson}
              className="gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </Button>
          </div>
        </motion.div>
      )}

      {/* Clear confirm modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm mx-4"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Clear all saved palettes?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palette list */}
      {isMobile && sorted.length > 0 ? (
        <SwipeablePaletteRow palettes={sorted} />
      ) : sorted.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {sorted.map((palette, i) => (
              <motion.div
                key={palette.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: dragOverIdx === i ? 1.02 : 1,
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                draggable={sortMode === "custom"}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(i);
                }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIdx !== null && dragIdx !== i) {
                    reorderSaved(dragIdx, i);
                    toast.success("Palette reordered");
                  }
                  setDragIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDragOverIdx(null);
                }}
                className={
                  sortMode === "custom"
                    ? "cursor-grab active:cursor-grabbing"
                    : ""
                }
              >
                <div className="relative">
                  {sortMode === "custom" && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}
                  <PaletteCard
                    palette={palette}
                    showDelete
                    onDelete={() => {
                      removeSaved(palette.id);
                      toast.success("Palette removed");
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4"
          role="status"
          aria-live="polite"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <Bookmark
              className="h-10 w-10 text-muted-foreground/40"
              aria-hidden="true"
            />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            No saved palettes yet
          </p>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Save palettes to revisit them later. Tap the bookmark icon on any
            palette in Generate or Explore.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button asChild size="sm" variant="default">
              <a href="/generate">Generate a palette</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/explore">Browse Explore</a>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Saved;
