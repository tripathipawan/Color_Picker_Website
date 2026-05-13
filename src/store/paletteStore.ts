import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedPalettes, type Palette, type PaletteTag } from '@/lib/palettes';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'name';

interface PaletteState {
  palettes: Palette[];
  savedPaletteIds: string[];
  filterTag: PaletteTag | null;
  sortBy: 'new' | 'popular' | 'trending';
  searchQuery: string;
  colorFormat: ColorFormat;
  darkMode: boolean;

  setFilterTag: (tag: PaletteTag | null) => void;
  setSortBy: (sort: 'new' | 'popular' | 'trending') => void;
  setSearchQuery: (query: string) => void;
  setColorFormat: (format: ColorFormat) => void;
  setDarkMode: (dark: boolean) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  removeSaved: (id: string) => void;
  reorderSaved: (fromIndex: number, toIndex: number) => void;
  isSaved: (id: string) => boolean;
  getFilteredPalettes: () => Palette[];
  getSavedPalettes: () => Palette[];
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      palettes: seedPalettes,
      savedPaletteIds: [],
      filterTag: null,
      sortBy: 'popular',
      searchQuery: '',
      colorFormat: 'hex',
      darkMode: false,

      setFilterTag: (tag) => set({ filterTag: tag }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setColorFormat: (format) => set({ colorFormat: format }),
      setDarkMode: (dark) => {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: dark });
      },

      toggleLike: (id) => set(state => ({
        palettes: state.palettes.map(p =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p
        ),
      })),

      toggleSave: (id) => set(state => ({
        savedPaletteIds: state.savedPaletteIds.includes(id)
          ? state.savedPaletteIds.filter(sid => sid !== id)
          : [...state.savedPaletteIds, id],
      })),

      removeSaved: (id) => set(state => ({
        savedPaletteIds: state.savedPaletteIds.filter(sid => sid !== id),
      })),

      reorderSaved: (fromIndex, toIndex) => set(state => {
        const ids = [...state.savedPaletteIds];
        const [moved] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, moved);
        return { savedPaletteIds: ids };
      }),

      isSaved: (id) => get().savedPaletteIds.includes(id),

      getFilteredPalettes: () => {
        const { palettes, filterTag, sortBy, searchQuery } = get();
        let filtered = palettes;

        if (filterTag) {
          filtered = filtered.filter(p => p.tags.includes(filterTag));
        }

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(p =>
            p.colors.some(c => c.toLowerCase().includes(q)) ||
            p.tags.some(t => t.toLowerCase().includes(q)) ||
            p.name.toLowerCase().includes(q)
          );
        }

        const sorted = [...filtered];
        switch (sortBy) {
          case 'new':
            sorted.sort((a, b) => b.createdAt - a.createdAt);
            break;
          case 'popular':
            sorted.sort((a, b) => b.likes - a.likes);
            break;
          case 'trending':
            sorted.sort((a, b) => (b.likes / Math.max(1, Date.now() - b.createdAt)) - (a.likes / Math.max(1, Date.now() - a.createdAt)));
            break;
        }

        return sorted;
      },

      getSavedPalettes: () => {
        const { palettes, savedPaletteIds } = get();
        return palettes.filter(p => savedPaletteIds.includes(p.id));
      },
    }),
    {
      name: 'paletteflow-storage',
      partialize: (state) => ({
        savedPaletteIds: state.savedPaletteIds,
        colorFormat: state.colorFormat,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
