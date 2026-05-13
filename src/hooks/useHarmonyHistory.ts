import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cacheLocal, readLocalCache, CLOUD_CACHE_KEYS } from '@/lib/exportData';

const HISTORY_CACHE_KEY = CLOUD_CACHE_KEYS.harmony;

let historyFallbackToastShown = false;
const notifyHistoryFallback = () => {
  if (historyFallbackToastShown) return;
  historyFallbackToastShown = true;
  toast.info('Showing cached harmony history', {
    description: 'Cloud sync is restricted — displaying entries cached on this device.',
  });
};
// Empty-cache fallback is silent — no toast — to avoid spamming users.
const notifyHistoryEmptyFallback = () => {};
export const resetHistoryFallbackToast = () => {
  historyFallbackToastShown = false;
};

export interface HarmonyEntry {
  id: string;
  base_color: string;
  harmony_type: string;
  colors: string[];
  created_at: string;
}

export function useHarmonyHistory() {
  const [entries, setEntries] = useState<HarmonyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  // Authentication removed — history UI remains visible but operates without a session.
  const user = 'anonymous';

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('harmony_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error(error);
      const cached = readLocalCache<HarmonyEntry[]>(HISTORY_CACHE_KEY, []);
      setEntries(cached);
      if (cached.length > 0) { notifyHistoryFallback(); setUsingCache(true); }
      else { notifyHistoryEmptyFallback(); }
    } else {
      const list = (data ?? []) as unknown as HarmonyEntry[];
      if (list.length === 0) {
        const cached = readLocalCache<HarmonyEntry[]>(HISTORY_CACHE_KEY, []);
        setEntries(cached);
        if (cached.length > 0) { notifyHistoryFallback(); setUsingCache(true); }
        else { notifyHistoryEmptyFallback(); }
      } else {
        setEntries(list);
        cacheLocal(HISTORY_CACHE_KEY, list);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = useCallback(async (baseColor: string, harmonyType: string, colors: string[]) => {
    if (!user) return false;
    // Avoid duplicate consecutive entries
    if (entries[0] && entries[0].base_color === baseColor && entries[0].harmony_type === harmonyType) {
      return false;
    }
    const { data, error } = await supabase
      .from('harmony_history')
      .insert({ user_id: user, base_color: baseColor, harmony_type: harmonyType, colors } as any)
      .select()
      .single();
    if (error) {
      console.error(error);
      return false;
    }
    setEntries(prev => [data as unknown as HarmonyEntry, ...prev].slice(0, 100));
    return true;
  }, [user, entries]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('harmony_history').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete entry');
      return false;
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    return true;
  }, []);

  const clearAll = useCallback(async () => {
    if (!user) return false;
    const { error } = await supabase.from('harmony_history').delete().eq('user_id', user);
    if (error) {
      toast.error('Failed to clear history');
      return false;
    }
    setEntries([]);
    toast.success('History cleared');
    return true;
  }, [user]);

  return { entries, loading, user, usingCache, saveEntry, deleteEntry, clearAll, refetch: fetchEntries };
}
