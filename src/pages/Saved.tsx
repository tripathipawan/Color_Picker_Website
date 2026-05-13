import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaletteStore } from '@/store/paletteStore';
import PaletteCard from '@/components/PaletteCard';
import SwipeablePaletteRow from '@/components/SwipeablePaletteRow';
import CloudPaletteCard from '@/components/CloudPaletteCard';
import { Bookmark, Trash2, Download, Cloud, GripVertical, FolderPlus, Folder, ChevronRight, Pencil, X as XIcon, Check, CheckSquare, Square, FolderInput } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCloudPalettes } from '@/hooks/useCloudPalettes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  downloadJson,
  downloadCsv,
  clearAllCloudCache,
  restoreClearedCloudCache,
  discardClearedCloudCache,
  getCloudCacheStats,
  formatRelativeTime,
  type CloudCacheStats,
} from '@/lib/exportData';
import { resetCloudFallbackToast } from '@/hooks/useCloudPalettes';
import { resetHistoryFallbackToast } from '@/hooks/useHarmonyHistory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

type SortMode = 'date' | 'name' | 'likes' | 'custom';

const Saved = () => {
  const { getSavedPalettes, removeSaved, savedPaletteIds, reorderSaved } = usePaletteStore();
  const {
    palettes: cloudPalettes, folders, loading: cloudLoading, user, usingCache,
    deletePalette, updatePalette, duplicatePalette,
    createFolder, renameFolder, deleteFolder, movePaletteToFolder,
    bulkMoveToFolder, bulkDelete, bulkRenamePrefix, folderNameExists,
    refetch: refetchPalettes, refetchFolders, setUsingCache,
  } = useCloudPalettes();
  const isMobile = useIsMobile();
  const [dragOverFolder, setDragOverFolder] = useState<string | 'unorganized' | null>(null);

  const handleFolderDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolder(null);
    const paletteId = e.dataTransfer.getData('application/x-palette-id');
    if (!paletteId) return;
    await movePaletteToFolder(paletteId, folderId);
  };

  const [sortMode, setSortMode] = useState<SortMode>('custom');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [tab, setTab] = useState<'local' | 'cloud'>('local');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Folder UI state
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  // Folder name validation
  const [newFolderError, setNewFolderError] = useState<string | null>(null);
  const [editingFolderError, setEditingFolderError] = useState<string | null>(null);

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRenameOpen, setBulkRenameOpen] = useState(false);
  const [bulkRenameValue, setBulkRenameValue] = useState('');
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [clearCacheConfirm, setClearCacheConfirm] = useState(false);
  const [cacheStats, setCacheStats] = useState<CloudCacheStats>(() => getCloudCacheStats());
  const [undoUntil, setUndoUntil] = useState<number | null>(null);
  const [undoNow, setUndoNow] = useState(0);

  const refreshCacheStats = () => setCacheStats(getCloudCacheStats());

  // Tick every second while an undo window is active so the visible button can show a countdown
  useEffect(() => {
    if (!undoUntil) return;
    const i = setInterval(() => {
      setUndoNow(Date.now());
      if (Date.now() >= undoUntil) {
        setUndoUntil(null);
        discardClearedCloudCache();
      }
    }, 500);
    return () => clearInterval(i);
  }, [undoUntil]);

  const totalCached = cacheStats.palettes.count + cacheStats.folders.count + cacheStats.harmony.count;
  const undoSecondsLeft = undoUntil ? Math.max(0, Math.ceil((undoUntil - undoNow) / 1000)) : 0;

  const handleRestoreCache = () => {
    const ok = restoreClearedCloudCache();
    if (ok) {
      setUndoUntil(null);
      refreshCacheStats();
      refetchPalettes();
      refetchFolders();
      toast.success('Cached cloud data restored');
    } else {
      toast.error('Nothing to restore');
    }
  };

  // Refresh stats whenever palettes/folders change (after a successful fetch)
  useEffect(() => {
    refreshCacheStats();
  }, [cloudPalettes.length, folders.length]);

  // Ctrl/Cmd+K opens the Cloud export dropdown when on the Cloud tab
  useEffect(() => {
    if (tab !== 'cloud') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setExportMenuOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab]);

  const validateFolderName = (name: string, excludeId?: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Folder name cannot be empty';
    if (trimmed.length > 60) return 'Must be 60 characters or less';
    if (folderNameExists(trimmed, excludeId)) return 'A folder with this name already exists';
    return null;
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setBulkRenameOpen(false);
    setBulkDeleteConfirm(false);
  };


  const saved = getSavedPalettes();
  const sorted = sortMode === 'custom' ? saved : [...saved].sort((a, b) => {
    if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'likes') return b.likes - a.likes;
    return b.createdAt - a.createdAt;
  });

  const clearAll = () => {
    savedPaletteIds.forEach(id => removeSaved(id));
    setShowClearConfirm(false);
    toast.success('All saved palettes cleared');
  };

  const exportJson = () => {
    const json = JSON.stringify(saved.map(p => ({ name: p.name, colors: p.colors, tags: p.tags })), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'saved-palettes.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('JSON exported!');
  };

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateFolder = async () => {
    const err = validateFolderName(newFolderName);
    if (err) {
      setNewFolderError(err);
      return;
    }
    const created = await createFolder(newFolderName);
    if (created) {
      setNewFolderName('');
      setShowNewFolder(false);
      setNewFolderError(null);
    }
  };

  const handleRenameFolder = async (id: string) => {
    const err = validateFolderName(editingFolderName, id);
    if (err) {
      setEditingFolderError(err);
      return;
    }
    const ok = await renameFolder(id, editingFolderName);
    if (ok) {
      setEditingFolderId(null);
      setEditingFolderError(null);
    }
  };

  // Group cloud palettes by folder
  const unorganized = cloudPalettes.filter(p => !p.folder_id);
  const palettesByFolder = folders.map(f => ({
    folder: f,
    palettes: cloudPalettes.filter(p => p.folder_id === f.id),
  }));

  const renderCloudPaletteGrid = (items: typeof cloudPalettes) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((cp, i) => {
        const isSelected = selectedIds.has(cp.id);
        return (
          <motion.div
            key={cp.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative"
          >
            {selectionMode && (
              <button
                onClick={() => toggleSelected(cp.id)}
                className={`absolute top-2 left-2 z-20 h-7 w-7 rounded-md flex items-center justify-center backdrop-blur-md border transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background/70 text-foreground border-border hover:border-primary'
                }`}
                aria-label={isSelected ? 'Deselect palette' : 'Select palette'}
              >
                {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </button>
            )}
            <div
              onClick={selectionMode ? () => toggleSelected(cp.id) : undefined}
              className={`${selectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary rounded-2xl' : ''}`}
            >
              <CloudPaletteCard
                palette={cp}
                folders={folders}
                onUpdate={updatePalette}
                onDuplicate={duplicatePalette}
                onDelete={deletePalette}
                onMoveToFolder={movePaletteToFolder}
                disableDrag={selectionMode}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Saved Palettes</h1>
        <p className="text-muted-foreground mb-6">Your collection of favorite color palettes</p>
      </motion.div>

      {/* Tabs */}
      {user && (
        <div role="tablist" aria-label="Saved palettes source" className="flex items-center gap-1 bg-muted rounded-lg p-0.5 mb-6 w-fit">
          <button
            role="tab"
            aria-selected={tab === 'local'}
            aria-controls="saved-local-panel"
            onClick={() => setTab('local')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === 'local' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Bookmark className="h-4 w-4 inline mr-1.5" aria-hidden="true" />Local
          </button>
          <button
            role="tab"
            aria-selected={tab === 'cloud'}
            aria-controls="saved-cloud-panel"
            onClick={() => setTab('cloud')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === 'cloud' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Cloud className="h-4 w-4 inline mr-1.5" aria-hidden="true" />Cloud
          </button>
        </div>
      )}

      {tab === 'local' && (
        <div id="saved-local-panel" role="tabpanel">
          {saved.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                {(['custom', 'date', 'name', 'likes'] as const).map(mode => (
                  <button key={mode} onClick={() => setSortMode(mode)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${sortMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    {mode === 'date' ? 'Newest' : mode === 'likes' ? 'Most Liked' : mode === 'custom' ? 'Custom' : 'Name'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportJson} className="gap-1">
                  <Download className="h-3.5 w-3.5" /> Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)} className="gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Clear All
                </Button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {showClearConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm mx-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Clear all saved palettes?</h3>
                  <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={clearAll}>Clear All</Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isMobile && sorted.length > 0 ? (
            <SwipeablePaletteRow palettes={sorted} />
          ) : sorted.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {sorted.map((palette, i) => (
                  <motion.div
                    key={palette.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, scale: dragOverIdx === i ? 1.02 : 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }}
                    draggable={sortMode === 'custom'}
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
                    onDragLeave={() => setDragOverIdx(null)}
                    onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) { reorderSaved(dragIdx, i); toast.success('Palette reordered'); } setDragIdx(null); setDragOverIdx(null); }}
                    onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                    className={sortMode === 'custom' ? 'cursor-grab active:cursor-grabbing' : ''}
                  >
                    <div className="relative">
                      {sortMode === 'custom' && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                      <PaletteCard palette={palette} showDelete onDelete={() => { removeSaved(palette.id); toast.success('Palette removed'); }} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-4" role="status" aria-live="polite">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <Bookmark className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No saved palettes yet</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                Save palettes to revisit them later. Tap the bookmark icon on any palette in Generate or Explore.
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
      )}

      {tab === 'cloud' && (
        <div id="saved-cloud-panel" role="tabpanel">
          {/* Auth-removed notice */}
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            <div className="text-xs text-foreground/90 leading-relaxed flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="font-medium">Cloud sync is read-only on this device</p>
                {usingCache && (
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0">
                    Using cached data
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Authentication has been removed, so new cloud writes are blocked by access policies and remote reads may return nothing. You can still browse anything previously cached on this device and export it as JSON or CSV below — local exports always work. Press <kbd className="px-1 py-0.5 rounded border border-border text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded border border-border text-[10px] font-mono">K</kbd> to open the Export menu.
              </p>

              {/* Detailed cache status */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {([
                  { label: 'Palettes', s: cacheStats.palettes },
                  { label: 'Folders', s: cacheStats.folders },
                  { label: 'Harmony', s: cacheStats.harmony },
                ] as const).map(({ label, s }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">{s.count}</p>
                    <p className="text-[10px] text-muted-foreground" title={s.lastSyncAt ?? 'never'}>
                      Synced {formatRelativeTime(s.lastSyncAt)}
                    </p>
                    <p className="text-[10px] text-muted-foreground" title={s.lastCachedAt ?? 'never'}>
                      Cached {formatRelativeTime(s.lastCachedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {cloudLoading ? (
            <p className="text-center py-10 text-muted-foreground">Loading cloud palettes…</p>
          ) : (
            <>
              {/* Folder + bulk management bar */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {showNewFolder ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newFolderName}
                        onChange={e => {
                          setNewFolderName(e.target.value);
                          setNewFolderError(validateFolderName(e.target.value));
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="Folder name…"
                        maxLength={60}
                        aria-invalid={!!newFolderError}
                        className={`text-sm px-3 py-1.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 ${
                          newFolderError ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                        }`}
                      />
                      <Button size="sm" variant="default" onClick={handleCreateFolder} disabled={!!newFolderError || !newFolderName.trim()}>Create</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowNewFolder(false); setNewFolderName(''); setNewFolderError(null); }}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {newFolderError && (
                      <p className="text-xs text-destructive ml-1">{newFolderError}</p>
                    )}
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setShowNewFolder(true); setNewFolderError(null); }} className="gap-1.5">
                    <FolderPlus className="h-4 w-4" /> New Folder
                  </Button>
                )}

                {cloudPalettes.length > 0 && (
                  <Button
                    size="sm"
                    variant={selectionMode ? 'default' : 'outline'}
                    onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                    className="gap-1.5"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {selectionMode ? 'Done' : 'Select'}
                  </Button>
                )}

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <DropdownMenu open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
                          <DropdownMenuTrigger asChild disabled={totalCached === 0}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={totalCached === 0}
                              aria-disabled={totalCached === 0}
                            >
                              <Download className="h-3.5 w-3.5" /> Export
                              <kbd className="ml-1 hidden sm:inline-flex items-center text-[10px] font-mono px-1 py-0.5 rounded border border-border/60 text-muted-foreground">⌘K</kbd>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[200px]">
                            <DropdownMenuItem
                              disabled={cacheStats.palettes.count === 0}
                              onClick={() => {
                                const folderMap = new Map(folders.map(f => [f.id, f.name]));
                                const data = cloudPalettes.map(p => ({
                                  id: p.id,
                                  name: p.name,
                                  colors: p.colors,
                                  tags: p.tags,
                                  folder: p.folder_id ? folderMap.get(p.folder_id) ?? null : null,
                                  created_at: p.created_at,
                                }));
                                downloadJson(data, 'cloud-palettes.json', { timestamp: true });
                                toast.success('Cloud palettes exported as JSON');
                              }}
                            >
                              Download JSON (dated) {cacheStats.palettes.count > 0 && <span className="ml-auto text-[10px] text-muted-foreground">{cacheStats.palettes.count}</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={cacheStats.palettes.count === 0}
                              onClick={() => {
                                const folderMap = new Map(folders.map(f => [f.id, f.name]));
                                const rows = cloudPalettes.map(p => ({
                                  name: p.name,
                                  colors: p.colors.join('|'),
                                  tags: p.tags.join('|'),
                                  folder: p.folder_id ? folderMap.get(p.folder_id) ?? '' : '',
                                  created_at: p.created_at,
                                }));
                                downloadCsv(rows, 'cloud-palettes.csv', ['name', 'colors', 'tags', 'folder', 'created_at'], { timestamp: true });
                                toast.success('Cloud palettes exported as CSV');
                              }}
                            >
                              Download CSV (dated)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={cacheStats.palettes.count === 0}
                              onClick={() => {
                                const folderMap = new Map(folders.map(f => [f.id, f.name]));
                                const data = cloudPalettes.map(p => ({
                                  id: p.id,
                                  name: p.name,
                                  colors: p.colors,
                                  tags: p.tags,
                                  folder: p.folder_id ? folderMap.get(p.folder_id) ?? null : null,
                                  created_at: p.created_at,
                                }));
                                downloadJson(data, 'cloud-palettes.json');
                                toast.success('Cloud palettes exported as JSON');
                              }}
                            >
                              Download JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={cacheStats.palettes.count === 0}
                              onClick={() => {
                                const folderMap = new Map(folders.map(f => [f.id, f.name]));
                                const rows = cloudPalettes.map(p => ({
                                  name: p.name,
                                  colors: p.colors.join('|'),
                                  tags: p.tags.join('|'),
                                  folder: p.folder_id ? folderMap.get(p.folder_id) ?? '' : '',
                                  created_at: p.created_at,
                                }));
                                downloadCsv(rows, 'cloud-palettes.csv', ['name', 'colors', 'tags', 'folder', 'created_at']);
                                toast.success('Cloud palettes exported as CSV');
                              }}
                            >
                              Download CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={totalCached === 0}
                              onSelect={(e) => { e.preventDefault(); setExportMenuOpen(false); setClearCacheConfirm(true); }}
                              className="text-destructive focus:text-destructive"
                            >
                              Clear cached cloud data…
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {totalCached === 0
                        ? 'No cached cloud data to export or clear'
                        : `Export ${cacheStats.palettes.count} palette${cacheStats.palettes.count === 1 ? '' : 's'} or clear cache (Ctrl+K)`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {undoUntil && undoSecondsLeft > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRestoreCache}
                    className="gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-400"
                  >
                    Restore cleared cache ({undoSecondsLeft}s)
                  </Button>
                )}
              </div>

              {/* Bulk action toolbar */}
              <AnimatePresence>
                {selectionMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 mb-5 flex-wrap rounded-xl border border-primary/40 bg-primary/5 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {selectedIds.size} selected
                    </span>
                    <button
                      onClick={() => {
                        if (selectedIds.size === cloudPalettes.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(cloudPalettes.map(p => p.id)));
                      }}
                      className="text-xs text-primary hover:underline ml-1"
                    >
                      {selectedIds.size === cloudPalettes.length ? 'Clear' : 'Select all'}
                    </button>

                    <div className="ml-auto flex items-center gap-2 flex-wrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" disabled={selectedIds.size === 0} className="gap-1.5">
                            <FolderInput className="h-3.5 w-3.5" /> Move to…
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[160px]">
                          <DropdownMenuItem onClick={async () => { await bulkMoveToFolder(Array.from(selectedIds), null); exitSelectionMode(); }}>
                            No folder
                          </DropdownMenuItem>
                          {folders.length > 0 && <DropdownMenuSeparator />}
                          {folders.map(f => (
                            <DropdownMenuItem
                              key={f.id}
                              onClick={async () => { await bulkMoveToFolder(Array.from(selectedIds), f.id); exitSelectionMode(); }}
                            >
                              {f.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => { setBulkRenameValue(''); setBulkRenameOpen(true); }} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Rename
                      </Button>
                      <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => setBulkDeleteConfirm(true)} className="gap-1.5 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Folders */}
              {palettesByFolder.map(({ folder, palettes: folderPalettes }) => (
                <Collapsible
                  key={folder.id}
                  open={openFolders.has(folder.id)}
                  onOpenChange={() => toggleFolder(folder.id)}
                  className={`mb-6 rounded-lg transition-colors ${dragOverFolder === folder.id ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
                >
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
                    onDragLeave={() => setDragOverFolder(prev => prev === folder.id ? null : prev)}
                    onDrop={(e) => handleFolderDrop(e, folder.id)}
                  >
                  <div className="flex items-center gap-2 mb-3">
                    <CollapsibleTrigger className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <ChevronRight className={`h-4 w-4 transition-transform ${openFolders.has(folder.id) ? 'rotate-90' : ''}`} />
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      {editingFolderId === folder.id ? (
                        <div className="flex flex-col" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editingFolderName}
                            onChange={e => {
                              setEditingFolderName(e.target.value);
                              setEditingFolderError(validateFolderName(e.target.value, folder.id));
                            }}
                            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') handleRenameFolder(folder.id); }}
                            maxLength={60}
                            aria-invalid={!!editingFolderError}
                            className={`text-sm font-semibold bg-transparent border-b text-foreground focus:outline-none ${
                              editingFolderError ? 'border-destructive' : 'border-primary'
                            }`}
                          />
                          {editingFolderError && (
                            <span className="text-[11px] text-destructive font-normal mt-0.5">{editingFolderError}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-semibold">{folder.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">({folderPalettes.length})</span>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-1 ml-auto">
                      {editingFolderId === folder.id ? (
                        <>
                          <button
                            onClick={() => handleRenameFolder(folder.id)}
                            disabled={!!editingFolderError}
                            className="text-primary hover:text-primary/80 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { setEditingFolderId(null); setEditingFolderError(null); }} className="text-muted-foreground hover:text-foreground p-1"><XIcon className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); setEditingFolderError(null); }} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Rename folder"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteFolder(folder.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Delete folder"><Trash2 className="h-3.5 w-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <CollapsibleContent>
                    {folderPalettes.length > 0 ? renderCloudPaletteGrid(folderPalettes) : (
                      <div className="ml-8 my-3 rounded-lg border border-dashed border-border/60 bg-background/40 px-4 py-5 text-center">
                        <Folder className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/60" aria-hidden="true" />
                        <p className="text-sm text-foreground/80 font-medium">This folder is empty</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Drag a palette card here, or use the folder icon on any palette to move it in.
                        </p>
                      </div>
                    )}
                  </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}

              {/* Unorganized palettes */}
              {unorganized.length > 0 && (
                <div
                  className={`mt-2 rounded-lg p-2 transition-colors ${dragOverFolder === 'unorganized' ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverFolder('unorganized'); }}
                  onDragLeave={() => setDragOverFolder(prev => prev === 'unorganized' ? null : prev)}
                  onDrop={(e) => handleFolderDrop(e, null)}
                >
                  {folders.length > 0 && <h3 className="text-sm font-semibold text-muted-foreground mb-3">Unorganized</h3>}
                  {renderCloudPaletteGrid(unorganized)}
                </div>
              )}

              {cloudPalettes.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-4" role="status" aria-live="polite">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                    <Cloud className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    {totalCached > 0 ? 'Cached cloud data is available' : 'No cloud palettes cached on this device'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                    {totalCached > 0
                      ? `We have ${cacheStats.palettes.count} palette${cacheStats.palettes.count === 1 ? '' : 's'}, ${cacheStats.folders.count} folder${cacheStats.folders.count === 1 ? '' : 's'}, and ${cacheStats.harmony.count} harmony entr${cacheStats.harmony.count === 1 ? 'y' : 'ies'} cached locally. Cloud writes are blocked without authentication, but you can export the cache below.`
                      : 'Cloud sync is read-only here, and nothing has been cached yet. Save palettes locally — they\'ll always be available — or export anything new to JSON/CSV.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {totalCached > 0 ? (
                      <Button size="sm" variant="default" onClick={() => setExportMenuOpen(true)} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Export cached data
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="default">
                        <a href="/generate">Generate a palette</a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setTab('local')}>
                      View local palettes
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bulk rename modal */}
      <AnimatePresence>
        {bulkRenameOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setBulkRenameOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Rename {selectedIds.size} palette{selectedIds.size === 1 ? '' : 's'}</h3>
              <p className="text-xs text-muted-foreground mb-3">{selectedIds.size > 1 ? 'A number will be appended to each palette (e.g. "Brand 1", "Brand 2").' : 'Enter a new name.'}</p>
              <input
                autoFocus
                value={bulkRenameValue}
                onChange={e => setBulkRenameValue(e.target.value)}
                placeholder="New name…"
                maxLength={80}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                onKeyDown={async e => {
                  if (e.key === 'Enter' && bulkRenameValue.trim()) {
                    await bulkRenamePrefix(Array.from(selectedIds), bulkRenameValue);
                    exitSelectionMode();
                  }
                }}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setBulkRenameOpen(false)}>Cancel</Button>
                <Button
                  size="sm"
                  disabled={!bulkRenameValue.trim()}
                  onClick={async () => {
                    await bulkRenamePrefix(Array.from(selectedIds), bulkRenameValue);
                    exitSelectionMode();
                  }}
                >
                  Rename
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk delete confirm */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setBulkDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete {selectedIds.size} palette{selectedIds.size === 1 ? '' : 's'}?</h3>
              <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await bulkDelete(Array.from(selectedIds));
                    exitSelectionMode();
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear cached cloud data confirm */}
      <AlertDialog open={clearCacheConfirm} onOpenChange={setClearCacheConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear cached cloud data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes locally cached cloud palettes, folders, and harmony history from this device. Anything not exported will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const trash = clearAllCloudCache();
                resetCloudFallbackToast();
                resetHistoryFallbackToast();
                setUsingCache(false);
                refreshCacheStats();
                refetchPalettes();
                refetchFolders();
                if (trash) {
                  setUndoUntil(Date.now() + 10000);
                  setUndoNow(Date.now());
                }
                toast.success('Cleared cached cloud data', {
                  description: 'You can restore it within 10 seconds.',
                  duration: 10000,
                  action: trash
                    ? { label: 'Undo', onClick: handleRestoreCache }
                    : undefined,
                  onAutoClose: () => {
                    discardClearedCloudCache();
                    setUndoUntil(null);
                  },
                  onDismiss: () => {
                    discardClearedCloudCache();
                    setUndoUntil(null);
                  },
                });
              }}
            >
              Clear cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Saved;
