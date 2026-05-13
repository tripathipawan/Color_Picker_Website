import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cacheLocal, readLocalCache, CLOUD_CACHE_KEYS } from '@/lib/exportData';

const PALETTES_CACHE_KEY = CLOUD_CACHE_KEYS.palettes;
const FOLDERS_CACHE_KEY = CLOUD_CACHE_KEYS.folders;

// Module-level flags so the fallback toasts only show once per session.
let cloudFallbackToastShown = false;
const notifyCloudFallback = () => {
  if (cloudFallbackToastShown) return;
  cloudFallbackToastShown = true;
  toast.info('Showing cached cloud data', {
    description: 'Cloud sync is restricted — displaying data cached on this device.',
  });
};
// Empty-cache fallback is silent — no toast — to avoid spamming users on every page.
const notifyCloudEmptyFallback = () => {};
export const resetCloudFallbackToast = () => {
  cloudFallbackToastShown = false;
};

export interface CloudPalette {
  id: string;
  name: string;
  colors: string[];
  tags: string[];
  folder_id: string | null;
  created_at: string;
}

export interface PaletteFolder {
  id: string;
  name: string;
  created_at: string;
}

export function useCloudPalettes() {
  const [palettes, setPalettes] = useState<CloudPalette[]>([]);
  const [folders, setFolders] = useState<PaletteFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  // Authentication removed — cloud-only UI (e.g. "Save to Cloud") should hide.
  // Cache reads still work via the fetch functions below.
  const user: string | null = null;

  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from('palette_folders')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error(error);
      const cached = readLocalCache<PaletteFolder[]>(FOLDERS_CACHE_KEY, []);
      setFolders(cached);
      if (cached.length > 0) { notifyCloudFallback(); setUsingCache(true); }
      else { notifyCloudEmptyFallback(); }
    } else {
      const list = (data ?? []) as unknown as PaletteFolder[];
      if (list.length === 0) {
        const cached = readLocalCache<PaletteFolder[]>(FOLDERS_CACHE_KEY, []);
        setFolders(cached);
        if (cached.length > 0) { notifyCloudFallback(); setUsingCache(true); }
        else { notifyCloudEmptyFallback(); }
      } else {
        setFolders(list);
        cacheLocal(FOLDERS_CACHE_KEY, list);
      }
    }
  }, [user]);

  const fetchPalettes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_palettes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      const cached = readLocalCache<CloudPalette[]>(PALETTES_CACHE_KEY, []);
      setPalettes(cached);
      if (cached.length > 0) { notifyCloudFallback(); setUsingCache(true); }
      else { notifyCloudEmptyFallback(); }
    } else {
      const list = (data ?? []) as unknown as CloudPalette[];
      if (list.length === 0) {
        const cached = readLocalCache<CloudPalette[]>(PALETTES_CACHE_KEY, []);
        setPalettes(cached);
        if (cached.length > 0) { notifyCloudFallback(); setUsingCache(true); }
        else { notifyCloudEmptyFallback(); }
      } else {
        setPalettes(list);
        cacheLocal(PALETTES_CACHE_KEY, list);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPalettes();
    fetchFolders();
  }, [fetchPalettes, fetchFolders]);

  const savePalette = useCallback(async (name: string, colors: string[], tags: string[] = []) => {
    if (!user) {
      toast.error('Sign in to save palettes to the cloud');
      return false;
    }
    const { error } = await supabase
      .from('saved_palettes')
      .insert({ user_id: user, name, colors, tags } as any);
    if (error) {
      toast.error('Failed to save palette');
      console.error(error);
      return false;
    }
    toast.success('Palette saved to cloud!');
    fetchPalettes();
    return true;
  }, [user, fetchPalettes]);

  const deletePalette = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('saved_palettes')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('Failed to delete palette');
      return false;
    }
    setPalettes(prev => prev.filter(p => p.id !== id));
    toast.success('Palette removed from cloud');
    return true;
  }, []);

  const updatePalette = useCallback(async (id: string, updates: { name?: string; colors?: string[]; folder_id?: string | null }) => {
    const { error } = await supabase
      .from('saved_palettes')
      .update(updates as any)
      .eq('id', id);
    if (error) {
      toast.error('Failed to update palette');
      return false;
    }
    setPalettes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success('Palette updated!');
    return true;
  }, []);

  const duplicatePalette = useCallback(async (id: string) => {
    const original = palettes.find(p => p.id === id);
    if (!original || !user) return false;
    return savePalette(`${original.name} (copy)`, [...original.colors], [...original.tags]);
  }, [palettes, user, savePalette]);

  // Folder CRUD
  const folderNameExists = useCallback((name: string, excludeId?: string) => {
    const trimmed = name.trim().toLowerCase();
    return folders.some(f => f.name.trim().toLowerCase() === trimmed && f.id !== excludeId);
  }, [folders]);

  const createFolder = useCallback(async (name: string) => {
    if (!user) return null;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Folder name cannot be empty');
      return null;
    }
    if (trimmed.length > 60) {
      toast.error('Folder name must be 60 characters or less');
      return null;
    }
    if (folderNameExists(trimmed)) {
      toast.error('A folder with this name already exists');
      return null;
    }
    const { data, error } = await supabase
      .from('palette_folders')
      .insert({ user_id: user, name: trimmed } as any)
      .select()
      .single();
    if (error) {
      toast.error('Failed to create folder');
      return null;
    }
    const folder = data as unknown as PaletteFolder;
    setFolders(prev => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success('Folder created!');
    return folder;
  }, [user, folderNameExists]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Folder name cannot be empty');
      return false;
    }
    if (trimmed.length > 60) {
      toast.error('Folder name must be 60 characters or less');
      return false;
    }
    if (folderNameExists(trimmed, id)) {
      toast.error('A folder with this name already exists');
      return false;
    }
    const { error } = await supabase
      .from('palette_folders')
      .update({ name: trimmed } as any)
      .eq('id', id);
    if (error) {
      toast.error('Failed to rename folder');
      return false;
    }
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f).sort((a, b) => a.name.localeCompare(b.name)));
    toast.success('Folder renamed!');
    return true;
  }, [folderNameExists]);

  const deleteFolder = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('palette_folders')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('Failed to delete folder');
      return false;
    }
    setFolders(prev => prev.filter(f => f.id !== id));
    setPalettes(prev => prev.map(p => p.folder_id === id ? { ...p, folder_id: null } : p));
    toast.success('Folder deleted');
    return true;
  }, []);

  const movePaletteToFolder = useCallback(async (paletteId: string, folderId: string | null) => {
    return updatePalette(paletteId, { folder_id: folderId });
  }, [updatePalette]);

  // Bulk operations
  const bulkMoveToFolder = useCallback(async (ids: string[], folderId: string | null) => {
    if (ids.length === 0) return false;
    const { error } = await supabase
      .from('saved_palettes')
      .update({ folder_id: folderId } as any)
      .in('id', ids);
    if (error) {
      toast.error('Failed to move palettes');
      return false;
    }
    setPalettes(prev => prev.map(p => ids.includes(p.id) ? { ...p, folder_id: folderId } : p));
    toast.success(`Moved ${ids.length} palette${ids.length === 1 ? '' : 's'}`);
    return true;
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return false;
    const { error } = await supabase
      .from('saved_palettes')
      .delete()
      .in('id', ids);
    if (error) {
      toast.error('Failed to delete palettes');
      return false;
    }
    setPalettes(prev => prev.filter(p => !ids.includes(p.id)));
    toast.success(`Deleted ${ids.length} palette${ids.length === 1 ? '' : 's'}`);
    return true;
  }, []);

  const bulkRenamePrefix = useCallback(async (ids: string[], prefix: string) => {
    const trimmed = prefix.trim();
    if (!trimmed || ids.length === 0) return false;
    const targets = palettes.filter(p => ids.includes(p.id));
    const updates = await Promise.all(targets.map(async (p, i) => {
      const newName = targets.length === 1 ? trimmed : `${trimmed} ${i + 1}`;
      const { error } = await supabase
        .from('saved_palettes')
        .update({ name: newName } as any)
        .eq('id', p.id);
      return { id: p.id, name: newName, error };
    }));
    const failed = updates.filter(u => u.error).length;
    if (failed > 0) {
      toast.error(`Failed to rename ${failed} palette${failed === 1 ? '' : 's'}`);
      return false;
    }
    setPalettes(prev => prev.map(p => {
      const upd = updates.find(u => u.id === p.id);
      return upd ? { ...p, name: upd.name } : p;
    }));
    toast.success(`Renamed ${updates.length} palette${updates.length === 1 ? '' : 's'}`);
    return true;
  }, [palettes]);

  return {
    palettes, folders, loading, user, usingCache,
    savePalette, deletePalette, updatePalette, duplicatePalette,
    createFolder, renameFolder, deleteFolder, movePaletteToFolder,
    bulkMoveToFolder, bulkDelete, bulkRenamePrefix, folderNameExists,
    refetch: fetchPalettes,
    refetchFolders: fetchFolders,
    setUsingCache,
  };
}
