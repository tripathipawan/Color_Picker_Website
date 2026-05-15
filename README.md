# PaletteFlow Studio

**PaletteFlow Studio** is a complete, browser-based color toolkit for designers and developers. It ships with a library of 2,000+ curated palettes, an interactive generator, a WCAG contrast checker, a CSS gradient builder, an image color extractor, a color harmony explorer, and a full save-and-organize system — all in one place, completely free.

🌐 **Live:** [paletteflow-studio.vercel.app](https://paletteflow-studio.vercel.app)

---

## Pages and Features

### Home (`/`)

The landing page has a hero section with animated floating color blobs and an auto-scrolling strip showing the top-liked palettes. Hovering the strip pauses the scroll. Below the hero is a stats bar with animated count-up numbers: **2,000+ palettes**, **28 categories**, **10 color formats**, and a "Free Forever" indicator. Trending palettes (sorted by most likes) are shown in a 4-column grid. A category quick-filter section lets you jump straight to Ocean, Nature, Retro, Pastel, Neon, Dark, Cyberpunk, Sunset, Tropical, Luxury, Synthwave, and Arctic palettes. A full-width CTA banner at the bottom links to the generator.

---

### Explore (`/explore`)

Displays the entire palette library, paginated at **24 palettes per page** with smart pagination (ellipsis for long page ranges). Scrolls to top on page change.

**Filtering and sorting:**
- Full-text search across palette names, color hex codes, and tags
- Filter by any of the **28 tags**: Pastel, Dark, Neon, Warm, Cool, Vintage, Nature, Minimal, Ocean, Sunset, Forest, Candy, Earth, Monochrome, Retro, Cyberpunk, Earthy, Luxury, Aurora, Desert, Arctic, Tropical, Gothic, Pastel Rainbow, Corporate, Bohemian, Synthwave
- Sort by **Popular** (most likes), **New** (most recent), or **Trending** (likes ÷ age formula)
- Tag + page state synced to the URL via `useSearchParams`

Each palette card shows color swatches, palette name, tags, and like count. Hovering a swatch expands it and shows the color value. Clicking copies it. Cards have like, bookmark, share, and detail-view actions. The format selector (HEX / RGB / HSL / Name) is globally persistent via Zustand.

---

### Generate (`/generate`)

A full-screen interactive palette builder.

**Creating palettes:**
- Starts with **5 random colors**, or pre-loads from URL: `/generate?colors=FF0000,00FF00,...`
- Press **Space** or click **Generate** to randomize all unlocked swatches
- **Lock** any swatch — locked swatches survive regeneration, show a persistent lock icon
- **Drag and drop** swatches left or right to reorder
- Add up to a maximum of **8 swatches**, remove down to a minimum of **2**

**Per-swatch hover info:**
- RGB values, HSL values, and human-readable color name

**Exporting:**
- **CSS Variables** — `:root { --color-1: #HEX; ... }`
- **Tailwind Config** — ready-to-paste `tailwind.config.ts` colors object with keys `palette-1` through `palette-N`
- **SCSS Variables** — `$color-1: #HEX;` format
- **HEX Array** — JSON array of hex strings
- **RGB Array** — JSON array of `rgb(r, g, b)` strings
- **HSL Array** — JSON array of `hsl(h, s%, l%)` strings
- **PNG download** — canvas-rendered image, each swatch at **200×400px** with hex label in contrasting color
- **PDF download** — A4 (595.28×841.89pt) print-ready PDF with labeled color blocks showing hex, RGB, HSL, and color name per swatch, built without any external PDF library
- **Share URL** — encodes all hex values into a URL query string

**CVD Simulator panel (toggleable):**
Preview the current swatches through Protanopia, Deuteranopia, and Tritanopia vision, shown as a strip below the swatches.

**Cloud save:**
When signed in, a "Save to Cloud" button opens a modal with a palette preview strip and a name input. Pressing Enter or clicking the button saves to Supabase.

---

### Color Harmony (`/harmony`)

Pick a base color with a native color picker or type a hex code, and the page instantly generates 4 harmony palettes:

- **Complementary** — base + opposite hue (180°), 2 colors
- **Analogous** — base + two neighboring hues (~30° each side), 3 colors
- **Triadic** — base + two hues at 120° and 240°, 3 colors
- **Split Complementary** — base + two hues at 150° and 210° from base, 3 colors

Each card has a description of the harmony rule. Clicking any swatch copies its hex with a checkmark animation. **Randomize** picks a new base color. All harmonies recalculate with memoization — no lag.

**History panel (signed-in users):**
- Every generated set auto-saves to Supabase with an 800ms debounce
- Stores the last **100 entries**, ordered newest first
- Each entry shows the palette strip, harmony type, base color, and timestamp
- "Use" restores that base color to the picker
- Individual delete, or clear all
- Export as **JSON** or **CSV** with optional dated filename suffix (e.g. `harmony-history-2026-05-13.json`)
- Panel shows cache stats: count of palettes, folders, and harmony entries cached locally with last sync and last cached timestamps

---

### Contrast Checker (`/contrast`)

Enter any two colors — foreground and background — in any format and get the WCAG 2.1 contrast ratio.

**Accepted input formats:** `#RRGGBB`, `#RGB`, `rgb(r, g, b)`, `rgba(r, g, b, a)`, `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`, and **140+ CSS named colors** (e.g. `tomato`, `steelblue`, `lavender`). The detected format label is shown next to each input.

**WCAG results:**
- **AA Normal text** — passes at ≥ 4.5:1
- **AA Large text** — passes at ≥ 3:1
- **AAA Normal text** — passes at ≥ 7:1
- **AAA Large text** — passes at ≥ 4.5:1

Each result shows a green check or red X badge.

**Live preview** renders the color pair as:
- 14px normal text paragraph
- 18px bold large text
- 24px bold heading — "PaletteFlow"
- Filled button, outline button, badge, and link

**Color blindness simulation:**
- 5 modes: Normal, Protanopia, Deuteranopia, Tritanopia, Achromatopsia
- Selecting any mode re-simulates both colors via matrix transforms and recalculates contrast ratio
- Preview updates in real time

**Swap button** swaps foreground and background instantly.

---

### Gradient Generator (`/gradient`)

A real-time CSS gradient builder with a large live preview (up to 320px tall).

**Gradient types:** Linear, Radial, Conic.

**Angle control:** 0–360° range slider for Linear and Conic, with a quick rotate-by-45° button.

**Color stops:**
- Minimum **2 stops**, maximum **8 stops**
- Each stop: native color picker + hex text input + 0–100% position slider
- Stops are sorted by position when building the CSS output
- Add random colors from a preset pool, remove individual stops

**Presets:** 6 built-in gradients — Sunset, Ocean, Purple, Forest, Fire, Cosmic — shown as clickable thumbnail swatches. Hovering shows the name.

**Output (live):**
- `background: linear-gradient(...)` CSS declaration with copy button
- `style={{ background: ... }}` React inline style string with copy button
- Two "Copy" action buttons at the bottom

---

### Image Color Picker (`/image-picker`)

Upload a JPG, PNG, WebP, or GIF image — click or drag-and-drop. The image is scaled down to a max of **200×200px** on an HTML canvas, pixel data is sampled, and the **5 most dominant colors** are extracted using a color clustering algorithm.

**Output:**
- A horizontal palette strip with all 5 colors (hover expands the swatch and shows the hex)
- A 5-card detail grid showing the color swatch, hex code, RGB values, and color name
- Clicking any swatch copies its hex
- **Copy All** copies the full palette as a JSON array
- **Generate from this** navigates to `/generate?colors=...` with the 5 colors pre-loaded

A "Change Image" button lets you swap without leaving the page.

---

### Color Detail (`/color/:hex`)

A deep-dive page for any individual color, reachable from any palette card's eye icon.

**Color formats panel:** All 6 computed formats in copyable cards — HEX, HEX8, RGB, RGBA, HSL, HSLA.

**Visual sections:**
- **9 tints** — progressively lighter (blended toward white)
- **9 shades** — progressively darker (blended toward black)
- **Complementary** — single opposite hue
- **Analogous** — two neighboring hues
- **Triadic** — two hues at 120° and 240°

Every color chip is clickable to copy its hex. Clicking a chip also navigates to that color's own detail page.

**Related palettes:** Up to 6 palettes from the library that contain this exact hex, shown at the bottom.

---

### Saved Palettes (`/saved`)

A two-tab page for managing your palette collection.

**Local tab:**
- All palettes bookmarked via the Bookmark icon anywhere in the app
- Sort by **Custom** (drag-to-reorder), **Newest**, **Name**, or **Most Liked**
- Drag-and-drop reordering persists order in Zustand (splice-and-insert)
- Delete individual palettes with ✕ or **Clear All** (confirmation dialog)
- **Export JSON** downloads all saved palettes as a `.json` file
- On mobile (< 768px), renders as a **horizontal swipeable row** with snap scrolling instead of a grid

**Cloud tab:**
- Palettes saved to Supabase
- Organized into **folders** — collapsible sections with palette counts, drag-and-drop support
- **Create folder** — inline input with live validation (empty, over 60 chars, duplicate)
- **Rename folder** — inline edit on the folder title
- **Delete folder** — removes folder, moves its palettes to "Unorganized"
- **Drag palette to folder** — drag a `CloudPaletteCard` and drop onto any folder row or the Unorganized zone
- **Bulk select mode** — select multiple palettes, then bulk move to folder, bulk rename with prefix numbering (e.g. "Brand 1", "Brand 2"), or bulk delete (with confirmation)
- **Export menu** (`Ctrl+K` / `Cmd+K`): Download as JSON or CSV with optional dated filename
- **Clear cached cloud data** — soft delete with a **10-second undo window** (countdown button visible, Undo action on the toast)
- Cache status panel shows counts and sync/cache timestamps for palettes, folders, and harmony history

Each `CloudPaletteCard`: draggable (DataTransfer carries `application/x-palette-id`). Actions: inline **Edit** (rename + color pickers on each swatch), **Duplicate**, **Share** (URL), **Move to folder** dropdown, **Delete**.

---

### Shared Palette (`/palette`)

When a palette is shared (Share button on any card), the URL encodes all hex values. Opening the URL shows:
- The palette name (from URL param `?name=`)
- A large full-width palette strip with per-swatch hover expand and hex + color name labels
- Clicking a swatch copies its hex
- "Copy share link" button and a back link to Explore

---

## Color Engine

All color math is in `src/lib/colors.ts`, written from scratch with no external color library:

- `hexToRgb` — parses `#RRGGBB` to `{r, g, b}`
- `rgbToHex` — converts RGB integers to `#RRGGBB`
- `rgbToHsl` — converts RGB to HSL with integer rounding
- `hslToRgb` — converts HSL to RGB
- `randomHex` — `Math.random() * 16777215` → padded hex
- `getContrastColor` — luminance-weighted formula (0.299R + 0.587G + 0.114B), threshold at 0.5, returns `#000000` or `#FFFFFF`
- `getContrastRatio` — WCAG relative luminance with sRGB linearization (`c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`), ratio formula `(L1+0.05)/(L2+0.05)`
- `getTints(hex, steps=9)` — blends each channel toward 255
- `getShades(hex, steps=9)` — blends each channel toward 0
- `getComplementary` — adds 180° to the hue in HSL space
- `getAnalogous` — adds ±30° to the hue
- `getTriadic` — adds 120° and 240°
- `getSplitComplementary` — adds 150° and 210°
- `getColorName` — finds the closest CSS named color by Euclidean RGB distance
- `extractColors` — reads pixel data from an `ImageData` object, clusters similar colors, returns the top N dominant hexes

`src/lib/colorParser.ts` — universal color string parser:
- Accepts HEX 3, 4, 6, and 8 digit (4-digit and 8-digit include alpha)
- `rgb()` / `rgba()` — comma and modern space-separated syntax
- `hsl()` / `hsla()` — with or without `%` on S and L values
- **140+ CSS named colors** mapped to exact hex values
- Returns a `ParsedColor` object: `{ hex, r, g, b, a, h, s, l, format }`
- `formatColor(parsed, format)` converts back to any of `hex | hex8 | rgb | rgba | hsl | hsla`
- Exported constant `COLOR_FORMATS = ['hex', 'hex8', 'rgb', 'rgba', 'hsl', 'hsla']`

`src/lib/colorBlindness.ts` — CVD simulation using 3×3 RGB matrix transforms:
- **Protanopia** — red-blind (~1% of males)
- **Deuteranopia** — green-blind (~1% of males)
- **Tritanopia** — blue-blind (rare)
- **Achromatopsia** — full grayscale (luminance weights 0.299 / 0.587 / 0.114)

`src/lib/generatePalettes.ts` — programmatic palette generation:
- Uses a seeded LCG random number generator (seed: 42) for deterministic output
- Runs **2,000 iterations**, each picking a base hue (0–360°), saturation (30–90%), and lightness (25–75%)
- Six generation strategies: `analogous`, `complementary`, `triadic`, `splitComp`, `monochromatic`, `tetradic`
- Names assembled from a **32-word adjective list × 32-word noun list**
- Tags assigned by HSL threshold rules covering all 28 categories, shuffled and limited to 3 per palette
- Each palette gets a random like count (0–800) and a random age (0–90 days)

---

## State Management

Zustand store at `src/store/paletteStore.ts` with `persist` middleware writing to `localStorage` key `paletteflow-storage`.

**Persisted fields:** `savedPaletteIds`, `colorFormat`, `darkMode`

**Non-persisted (runtime only):** `palettes`, `filterTag`, `sortBy`, `searchQuery`

**Actions:**
- `toggleLike(id)` — increments like count in the palette array
- `toggleSave(id)` — adds or removes ID from `savedPaletteIds`
- `removeSaved(id)` — removes from saved list
- `reorderSaved(fromIndex, toIndex)` — splice-and-insert for drag reordering
- `isSaved(id)` — boolean check
- `getFilteredPalettes()` — applies `filterTag`, `searchQuery`, and `sortBy` in order
- `getSavedPalettes()` — filters the palette array by `savedPaletteIds`
- `setDarkMode(dark)` — adds/removes `.dark` on `document.documentElement` + persists

On rehydrate, if `darkMode` was true, the `.dark` class is re-applied synchronously via `onRehydrateStorage`.

---

## Cloud Sync (Supabase)

**`useCloudPalettes`** (`src/hooks/useCloudPalettes.ts`):

Reads from `saved_palettes` and `palette_folders` on mount. After each successful fetch, writes to `localStorage` under `paletteflow:cache:cloud-palettes` and `paletteflow:cache:palette-folders`. If Supabase returns an empty array (e.g. RLS block), falls back to the local cache. A module-level boolean prevents duplicate fallback toasts per session. `resetCloudFallbackToast()` is exported so it can be reset when the cache is cleared.

Cloud operations: `savePalette`, `deletePalette`, `updatePalette` (name + colors + folder), `duplicatePalette`, `createFolder`, `renameFolder`, `deleteFolder`, `movePaletteToFolder`, `bulkMoveToFolder` (Supabase `.in()` filter), `bulkDelete`, `bulkRenamePrefix` (parallel Promise.all updates with numbered suffixes).

Folder name validation is centralized in `folderNameExists(name, excludeId?)` — case-insensitive, trimmed comparison.

**`useHarmonyHistory`** (`src/hooks/useHarmonyHistory.ts`):

Reads `harmony_history` ordered by `created_at DESC LIMIT 100`. Caches to `paletteflow:cache:harmony-history`. Deduplicates: skips saving if the most recent entry has the same base color and harmony type. Supports `saveEntry`, `deleteEntry`, `clearAll`. Exports `resetHistoryFallbackToast()`.

---

## Export and Cache System

`src/lib/exportData.ts` provides the full data portability layer:

**Download helpers:**
- `downloadJson(data, filename, opts?)` — serializes as pretty JSON, triggers browser download
- `downloadCsv(rows, filename, headers?, opts?)` — builds RFC 4180-compliant CSV, handles commas, quotes, and newlines in cell values
- `todayStamp()` — returns `YYYY-MM-DD`
- `withTimestamp(filename)` — inserts the stamp before the extension

**Cache helpers:**
- `cacheLocal(key, data)` — `localStorage.setItem` + writes a `:meta` record with `lastSyncAt`, `lastCachedAt`, `count`
- `readLocalCache(key, fallback)` — `JSON.parse` with try/catch
- `hasLocalCache(key)` — boolean existence check
- `getCacheMeta(key)` / `setCacheMeta(key, patch)` — reads and merges the `:meta` object

**Soft delete and restore:**
- `clearAllCloudCache()` — moves all 3 cache keys + their meta into `paletteflow:cache:trash` as a JSON blob (soft delete)
- `restoreClearedCloudCache()` — reads from trash and restores all entries to their original keys, removes trash key
- `discardClearedCloudCache()` — permanently removes the trash key (called on toast auto-close or dismiss)

**Cache stats:**
- `getCloudCacheStats()` — returns `{ palettes, folders, harmony }` each with `count`, `lastSyncAt`, `lastCachedAt`
- `formatRelativeTime(iso?)` — `"just now"` / `"5m ago"` / `"3h ago"` / `"2d ago"` / full date

---

## Database Schema

Four SQL migrations in `supabase/migrations/`:

**Migration 1** — `saved_palettes` table:
```sql
CREATE TABLE public.saved_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
RLS enabled. SELECT, INSERT, UPDATE, DELETE policies for authenticated users scoped to `auth.uid() = user_id`.

**Migration 2** — Adds the UPDATE policy to `saved_palettes`.

**Migration 3** — `palette_folders` table:
```sql
CREATE TABLE public.palette_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
RLS enabled with all 4 CRUD policies. Adds `folder_id UUID REFERENCES palette_folders(id) ON DELETE SET NULL` to `saved_palettes`.

**Migration 4** — `harmony_history` table:
```sql
CREATE TABLE public.harmony_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  base_color TEXT NOT NULL,
  harmony_type TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_harmony_history_user_created
  ON public.harmony_history (user_id, created_at DESC);
```
RLS with SELECT, INSERT, DELETE policies.

---

## Components

### `AppNavbar`
Sticky top bar with `backdrop-blur-xl`. Links: Explore, Generator, Gradient, Image Picker, Contrast, Harmony, Saved. Active route uses `bg-primary/10 text-primary`. Dark mode toggle animates sun/moon swap using `AnimatePresence mode="wait"`. Hidden on screens below `lg` (mobile uses `MobileBottomNav`).

### `MobileBottomNav`
Fixed bottom bar, `lg:hidden`. Three main tabs — Home, Generate, Saved — plus a "More" button. More opens a floating panel above the nav bar with Explore, Gradient, Image, and Contrast. A semi-transparent backdrop closes the panel on click. All tab icons use `whileTap={{ scale: 0.85 }}`.

### `PaletteCard`
The reusable palette display used in Explore, Home, and Saved. Swatches expand on hover (`flex: 1.8` spring animation). Hovering shows the color value in the active global format. Clicking copies. Format dropdown (HEX / RGB / HSL / NAME) persists globally. Tags are clickable and navigate to Explore filtered by that tag. Actions: Like (with a 6-particle heart burst animation), Share (copies URL), Bookmark (filled when saved), Detail eye. `showDelete` prop adds a ✕ button for the Saved page.

### `CloudPaletteCard`
Card for Supabase-backed palettes. Draggable via HTML5 drag-and-drop (sets `application/x-palette-id` on `DataTransfer`). In edit mode: native color pickers on each swatch, editable name input, save/cancel buttons. Actions: Edit, Duplicate, Share, Move to folder (Radix DropdownMenu), Delete. `disableDrag` prop disables dragging during bulk selection mode.

### `PaletteCVDSimulator`
Embedded in the Generate page. Toggles between Normal, Protanopia, Deuteranopia, and Tritanopia (not Achromatopsia — this is the inline version; the full version in ContrastChecker also includes Achromatopsia). The palette strip uses Framer Motion `layout` animation.

### `FilterBar`
Used on Explore. Search input scales slightly on focus. Tag pills use `whileTap` and `whileHover` spring animations. Active tag uses `bg-primary text-primary-foreground`. Sort toggle (Popular / New / Trending) is a segmented control. All state via Zustand.

### `SwipeablePaletteRow`
Used on Saved (Local) on mobile. Horizontal scroll with `snap-x snap-mandatory`, `-webkit-overflow-scrolling: touch`. Tracks pointer movement to distinguish drag vs. tap, preventing accidental card clicks mid-scroll.

### `PageTransition`
Wraps every route. `y: 12 → 0` on enter, `y: 0 → -12` on exit, 0.25s easeInOut, driven by `AnimatePresence mode="wait"` in `App.tsx`.

### `Footer`
Minimal footer with logo, 5 nav links, and a tagline. Only rendered on the home page.

---

## Theming

**Fonts:** DM Sans (400–800) for all UI, Inter (400–600) for body, imported from Google Fonts in `index.css`.

**Design tokens** (CSS custom properties, consumed via Tailwind's `hsl(var(...))` pattern):

| Token | Light | Dark |
|---|---|---|
| `--primary` | `252 85% 60%` (violet) | `252 85% 65%` |
| `--accent` | `340 82% 62%` (pink-red) | `340 82% 65%` |
| `--background` | `0 0% 98%` (near white) | `240 10% 4%` (near black) |
| `--card` | `0 0% 100%` | `240 10% 7%` |
| `--border` | `240 6% 90%` | `240 5% 18%` |
| `--muted` | `240 5% 96%` | `240 5% 15%` |
| `--destructive` | `0 84% 60%` (red) | `0 62% 30%` |
| `--radius` | `0.75rem` | `0.75rem` |

Dark mode toggles `.dark` on `<html>` directly via Zustand — no `next-themes` provider.

---

## Tech Stack

| Area | Library / Tool | Version |
|---|---|---|
| UI Framework | React | 18.3.1 |
| Language | TypeScript | 5.8 |
| Build tool | Vite | 8.0 |
| Dev server port | — | 8080 |
| Routing | React Router DOM | 6.30 |
| Styling | Tailwind CSS | 3.4 |
| UI primitives | Radix UI (full set, 20+ packages) | latest |
| Component system | shadcn/ui | — |
| Animation | Framer Motion | 12.38 |
| Global state | Zustand (with persist middleware) | 5.0 |
| Server state | TanStack React Query | 5.83 |
| Backend / DB | Supabase | 2.99 |
| Notifications | Sonner | 1.7 |
| Forms + validation | React Hook Form + Zod | 7.61 / 3.25 |
| Icons | Lucide React | 0.462 |
| Unit tests | Vitest + Testing Library | 4.1 / 16.0 |
| E2E tests | Playwright | 1.57 |
| Linting | ESLint 9 + TypeScript ESLint + React Hooks plugin | 9.32 |
| Package managers | npm / bun | — |
| Deployment | Vercel | — |

---

## Project Structure

```
Color_Pic/
├── public/
│   ├── Favicon.png                  # App favicon
│   └── robots.txt                   # Search engine directives
│
├── src/
│   ├── components/
│   │   ├── ui/                      # 45 Radix UI / shadcn/ui primitives
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── AppNavbar.tsx            # Sticky top nav — 7 links, dark mode toggle, backdrop-blur
│   │   ├── CloudPaletteCard.tsx     # Cloud palette card — inline edit, duplicate, share, folder move, delete, drag-and-drop
│   │   ├── CTASection.tsx           # Reusable call-to-action banner
│   │   ├── FeaturesSection.tsx      # Reusable features grid
│   │   ├── FilterBar.tsx            # Search + 28 tag pills + sort segmented control
│   │   ├── Footer.tsx               # Footer with logo and nav links
│   │   ├── HeroSection.tsx          # Reusable animated hero section with blobs
│   │   ├── MobileBottomNav.tsx      # Fixed bottom nav — 3 tabs + More modal overlay
│   │   ├── Navbar.tsx               # Alternative navbar variant
│   │   ├── NavLink.tsx              # Styled router link with active state
│   │   ├── PageTransition.tsx       # Framer Motion y-fade wrapper for all routes
│   │   ├── PaletteCard.tsx          # Main palette card — swatch expand, format picker, like burst, bookmark, share
│   │   ├── PaletteCVDSimulator.tsx  # Inline CVD strip (Protanopia / Deuteranopia / Tritanopia)
│   │   ├── PricingSection.tsx       # Reusable pricing section
│   │   └── SwipeablePaletteRow.tsx  # Snap-scroll horizontal row for mobile saved palettes
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx           # useIsMobile() — matchMedia hook, breakpoint at 768px
│   │   ├── use-toast.ts             # Toast hook (shadcn/ui)
│   │   ├── useCloudPalettes.ts      # Supabase sync — palettes, folders, bulk ops, local cache fallback
│   │   └── useHarmonyHistory.ts     # Supabase sync — harmony history, dedup, local cache fallback
│   │
│   ├── integrations/
│   │   ├── lovable/
│   │   │   └── index.ts             # Lovable platform integration
│   │   └── supabase/
│   │       ├── client.ts            # Supabase JS client initialized with VITE_ env vars
│   │       └── types.ts             # Auto-generated TypeScript types for harmony_history, palette_folders, saved_palettes
│   │
│   ├── lib/
│   │   ├── colorBlindness.ts        # 3×3 matrix transforms — Protanopia, Deuteranopia, Tritanopia, Achromatopsia
│   │   ├── colorParser.ts           # Universal parser — HEX/HEX8/RGB/RGBA/HSL/HSLA/140+ named colors → ParsedColor
│   │   ├── colors.ts                # Full color math — conversions, contrast ratio (WCAG), tints, shades, harmony angles, name lookup, pixel extraction
│   │   ├── exportData.ts            # JSON/CSV download, localStorage cache system, soft-delete with 10s undo, cache stats
│   │   ├── generatePalettes.ts      # Seeded LCG generator — 2000 palettes, 6 strategies, 28-tag auto-tagging, procedural names
│   │   ├── palettes.ts              # 38 hand-picked palettes + PaletteTag union type + TAG_EMOJIS map + seedPalettes export
│   │   └── utils.ts                 # cn() — clsx + tailwind-merge
│   │
│   ├── pages/
│   │   ├── ColorDetail.tsx          # /color/:hex — all formats, 9 tints, 9 shades, 3 harmony sections, related palettes
│   │   ├── ContrastChecker.tsx      # /contrast — WCAG 4-badge, live preview, full CVD simulator (5 modes)
│   │   ├── Explore.tsx              # /explore — 24/page pagination, search, 28 tags, 3 sort modes, skeleton loading
│   │   ├── Generate.tsx             # /generate — lock, drag, add/remove, 6 code exports, PNG, PDF, share URL, cloud save, CVD
│   │   ├── GradientGenerator.tsx    # /gradient — linear/radial/conic, 8 stops, angle slider, 6 presets, CSS + React output
│   │   ├── Harmony.tsx              # /harmony — 4 harmony types, randomize, auto-save history, export JSON/CSV, cache stats
│   │   ├── ImagePicker.tsx          # /image-picker — drag-drop upload, canvas pixel sampling, 5 dominant colors
│   │   ├── Index.tsx                # / — hero, count-up stats, trending grid, category quick-filter, CTA section
│   │   ├── NotFound.tsx             # /* — 404 page
│   │   ├── Saved.tsx                # /saved — local (drag-sort, export) + cloud (folders, bulk, cache management, undo)
│   │   └── SharedPalette.tsx        # /palette — URL-encoded shared palette viewer
│   │
│   ├── store/
│   │   └── paletteStore.ts          # Zustand store — palettes, savedPaletteIds, filterTag, sortBy, searchQuery, colorFormat, darkMode
│   │
│   ├── test/
│   │   ├── example.test.ts          # Sample Vitest unit test
│   │   └── setup.ts                 # jsdom environment + @testing-library/jest-dom matchers
│   │
│   ├── App.css                      # Global app styles
│   ├── App.tsx                      # Root — QueryClientProvider → TooltipProvider → BrowserRouter → AppNavbar + AnimatedRoutes + MobileBottomNav
│   ├── index.css                    # Google Fonts import, Tailwind directives, light + dark CSS custom properties
│   ├── main.tsx                     # ReactDOM.createRoot entry point
│   └── vite-env.d.ts                # Vite env type declarations
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260403073430_...sql    # Creates saved_palettes + SELECT/INSERT/DELETE RLS policies
│   │   ├── 20260406072533_...sql    # Adds UPDATE policy to saved_palettes
│   │   ├── 20260408023359_...sql    # Creates palette_folders + RLS + adds folder_id to saved_palettes
│   │   └── 20260501030142_...sql    # Creates harmony_history + RLS + compound index (user_id, created_at DESC)
│   └── config.toml                  # Supabase local development config
│
├── .env                             # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .gitignore
├── bun.lock                         # Bun lockfile
├── components.json                  # shadcn/ui configuration
├── eslint.config.js                 # ESLint flat config — JS, TypeScript ESLint, React Hooks, React Refresh
├── index.html                       # Vite HTML entry — mounts #root
├── package-lock.json
├── package.json                     # All dependencies and npm scripts
├── playwright-fixture.ts            # Playwright custom test fixtures
├── playwright.config.ts             # E2E test configuration
├── postcss.config.js                # PostCSS with Tailwind + autoprefixer
├── README.md
├── RELEASE_CHECKLIST.md             # Pre-release deployment checklist
├── tailwind.config.ts               # darkMode: class, HSL token mapping, DM Sans font family, 1400px 2xl container
├── tsconfig.app.json                # TypeScript — src/, strict mode, bundler resolution
├── tsconfig.json                    # Root TypeScript config — references app + node
├── tsconfig.node.json               # TypeScript for vite.config.ts and other config files
├── vite.config.ts                   # Vite — React plugin, @/ alias → src/, host "::", port 8080, HMR overlay off
└── vitest.config.ts                 # Vitest — jsdom environment, extends vite config
```

---

## Getting Started Locally

**Requirements:** Node.js 18+ or Bun

**1. Clone the repository**

```bash
git clone https://github.com/your-username/paletteflow-studio.git
cd paletteflow-studio
```

**2. Install dependencies**

```bash
npm install
# or
bun install
```

**3. Set up environment variables**

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

All features except cloud saving (Cloud tab in Saved, "Save to Cloud" in Generate, Harmony history sync) work without Supabase credentials.

**4. Start the dev server**

```bash
npm run dev
```

Opens at [http://localhost:8080](http://localhost:8080)

**5. Production build**

```bash
npm run build
```

Output goes to `dist/`, ready to serve from any static host.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 8080 with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint across the whole project |
| `npm run test` | Run all Vitest unit tests once |
| `npm run test:watch` | Vitest in watch mode |

---

## Keyboard Shortcuts

| Shortcut | Page | Action |
|---|---|---|
| `Space` | Generate | Regenerate all unlocked swatches |
| `Ctrl+K` / `Cmd+K` | Saved → Cloud tab | Open the Export menu |
| `Enter` | Generate → Name Modal | Save palette to cloud |
| `Enter` | Harmony → New Folder input | Create the folder |
| `Escape` | Harmony → History drawer | Close the drawer |

---

## Deployment

The project is live on Vercel. To deploy your own:

1. Push the repo to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project → Settings → Environment Variables
4. Deploy

To apply the Supabase migrations:

```bash
supabase db push
```

This runs all 4 migration files in chronological order and creates the `saved_palettes`, `palette_folders`, and `harmony_history` tables with their RLS policies and indexes.

---

## License

MIT
