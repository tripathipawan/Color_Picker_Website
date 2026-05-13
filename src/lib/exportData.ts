// Lightweight client-side download helpers for JSON / CSV exports.
// Used to let users save Cloud palettes and Harmony history locally even
// when cloud writes are blocked (no auth / RLS denial).

const triggerDownload = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

/** Returns a YYYY-MM-DD timestamp suffix for filenames. */
export const todayStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Inserts a `-YYYY-MM-DD` before the file extension. */
export const withTimestamp = (filename: string) => {
  const stamp = todayStamp();
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return `${filename}-${stamp}`;
  return `${filename.slice(0, dot)}-${stamp}${filename.slice(dot)}`;
};

export interface ExportOptions {
  /** Append a YYYY-MM-DD stamp before the file extension. */
  timestamp?: boolean;
}

export const downloadJson = (data: unknown, filename: string, opts: ExportOptions = {}) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  let name = filename.endsWith('.json') ? filename : `${filename}.json`;
  if (opts.timestamp) name = withTimestamp(name);
  triggerDownload(blob, name);
};

const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('|') : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const downloadCsv = (
  rows: Record<string, unknown>[],
  filename: string,
  headers?: string[],
  opts: ExportOptions = {}
) => {
  const cols = headers ?? (rows[0] ? Object.keys(rows[0]) : []);
  const lines = [
    cols.join(','),
    ...rows.map(row => cols.map(c => escapeCsvCell(row[c])).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  let name = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  if (opts.timestamp) name = withTimestamp(name);
  triggerDownload(blob, name);
};

// --- Local fallback cache -------------------------------------------------
// When cloud reads return zero (e.g. RLS denies anonymous SELECT), we still
// want users to be able to export whatever data was previously cached on
// this device. Hooks call `cacheLocal` after every successful fetch and
// fall back to `readLocalCache` when the fetch returns an empty array.

export const CLOUD_CACHE_KEYS = {
  palettes: 'paletteflow:cache:cloud-palettes',
  folders: 'paletteflow:cache:palette-folders',
  harmony: 'paletteflow:cache:harmony-history',
} as const;

export type CloudCacheKey = typeof CLOUD_CACHE_KEYS[keyof typeof CLOUD_CACHE_KEYS];

const metaKey = (key: string) => `${key}:meta`;

export interface CacheMeta {
  /** Last time this key was successfully refreshed from the cloud. */
  lastSyncAt?: string;
  /** Last time the snapshot was written to localStorage. */
  lastCachedAt?: string;
  /** Number of items in the most recent snapshot. */
  count?: number;
}

export const getCacheMeta = (key: string): CacheMeta => {
  try {
    const raw = localStorage.getItem(metaKey(key));
    return raw ? (JSON.parse(raw) as CacheMeta) : {};
  } catch {
    return {};
  }
};

export const setCacheMeta = (key: string, patch: Partial<CacheMeta>) => {
  try {
    const next = { ...getCacheMeta(key), ...patch };
    localStorage.setItem(metaKey(key), JSON.stringify(next));
  } catch {
    // ignore
  }
};

export const cacheLocal = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    const now = new Date().toISOString();
    setCacheMeta(key, {
      lastSyncAt: now,
      lastCachedAt: now,
      count: Array.isArray(data) ? data.length : undefined,
    });
  } catch {
    // Quota exceeded or storage unavailable — silently ignore.
  }
};

export const readLocalCache = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const hasLocalCache = (key: string): boolean => {
  try {
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
};

// --- Soft delete + restore ------------------------------------------------
// When the user clears cached cloud data, we move the current snapshots into
// a "trash" bucket so they can be restored from the toast Undo action.

const TRASH_KEY = 'paletteflow:cache:trash';

export interface CacheTrash {
  clearedAt: string;
  entries: Record<string, { data: string | null; meta: string | null }>;
}

export const clearAllCloudCache = (): CacheTrash | null => {
  try {
    const trash: CacheTrash = {
      clearedAt: new Date().toISOString(),
      entries: {},
    };
    Object.values(CLOUD_CACHE_KEYS).forEach((k) => {
      trash.entries[k] = {
        data: localStorage.getItem(k),
        meta: localStorage.getItem(metaKey(k)),
      };
      localStorage.removeItem(k);
      localStorage.removeItem(metaKey(k));
    });
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
    return trash;
  } catch {
    return null;
  }
};

export const restoreClearedCloudCache = (): boolean => {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    if (!raw) return false;
    const trash = JSON.parse(raw) as CacheTrash;
    Object.entries(trash.entries).forEach(([k, v]) => {
      if (v.data !== null) localStorage.setItem(k, v.data);
      if (v.meta !== null) localStorage.setItem(metaKey(k), v.meta);
    });
    localStorage.removeItem(TRASH_KEY);
    return true;
  } catch {
    return false;
  }
};

export const discardClearedCloudCache = () => {
  try {
    localStorage.removeItem(TRASH_KEY);
  } catch {
    // ignore
  }
};

export interface CloudCacheStats {
  palettes: { count: number; lastSyncAt?: string; lastCachedAt?: string };
  folders: { count: number; lastSyncAt?: string; lastCachedAt?: string };
  harmony: { count: number; lastSyncAt?: string; lastCachedAt?: string };
}

const statsFor = (key: string) => {
  const meta = getCacheMeta(key);
  const arr = readLocalCache<unknown[]>(key, []);
  return {
    count: meta.count ?? (Array.isArray(arr) ? arr.length : 0),
    lastSyncAt: meta.lastSyncAt,
    lastCachedAt: meta.lastCachedAt,
  };
};

export const getCloudCacheStats = (): CloudCacheStats => ({
  palettes: statsFor(CLOUD_CACHE_KEYS.palettes),
  folders: statsFor(CLOUD_CACHE_KEYS.folders),
  harmony: statsFor(CLOUD_CACHE_KEYS.harmony),
});

export const formatRelativeTime = (iso?: string): string => {
  if (!iso) return 'never';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'never';
  const diff = Date.now() - then;
  if (diff < 0) return 'just now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
};


