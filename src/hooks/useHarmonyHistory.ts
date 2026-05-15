import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface HarmonyEntry {
  id: string;
  base_color: string;
  harmony_type: string;
  colors: string[];
  created_at: string;
}

const STORAGE_KEY = 'harmony_history_local';

function loadFromStorage(): HarmonyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: HarmonyEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full ya unavailable
  }
}

export function useHarmonyHistory() {
  const [entries, setEntries] = useState<HarmonyEntry[]>(() => loadFromStorage());

  const saveEntry = useCallback((baseColor: string, harmonyType: string, colors: string[]) => {
    setEntries(prev => {
      // Duplicate consecutive entry avoid karo
      if (prev[0]?.base_color === baseColor && prev[0]?.harmony_type === harmonyType) {
        return prev;
      }
      const newEntry: HarmonyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        base_color: baseColor,
        harmony_type: harmonyType,
        colors,
        created_at: new Date().toISOString(),
      };
      const updated = [newEntry, ...prev].slice(0, 100);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    saveToStorage([]);
    toast.success('History cleared');
  }, []);

  return { entries, deleteEntry, clearAll, saveEntry };
}