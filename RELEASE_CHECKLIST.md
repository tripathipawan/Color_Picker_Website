# PaletteFlow — Release-Ready Checklist

Run through this before clicking **Publish**. Items are grouped so you can hand
off any section to a tester.

## 1. Mobile & responsive

- [ ] Open at 360×800, 390×844 (iPhone), 768×1024 (iPad), 1280×720, 1920×1080.
- [ ] No horizontal scroll on any page (`overflow-x-hidden` respected).
- [ ] Bottom nav (Home / Generate / Saved / More) visible and not overlapping page content.
- [ ] Generator export toolbar (Generate / Add / CVD / Share / Export ▾ / PNG / PDF) is scrollable horizontally on narrow widths and never clips behind the bottom nav.
- [ ] All tap targets ≥ 44×44 px.
- [ ] Safe-area inset honored on iOS (`safe-area-bottom`).

## 2. Keyboard & accessibility

- [ ] `Tab` reaches every interactive element with a visible focus ring.
- [ ] `Space` on Generate page re-rolls unlocked colors.
- [ ] `Esc` closes the Harmony history drawer and the Name-palette modal.
- [ ] Export ▾ dropdown has `role="menu"` / `menuitem`, `aria-expanded`, `aria-haspopup`.
- [ ] Saved page Local/Cloud switcher uses `role="tablist"` / `tab` / `aria-selected`.
- [ ] Harmony drawer uses `role="dialog"` and `aria-modal`.
- [ ] All icon-only buttons have an `aria-label`.
- [ ] `prefers-reduced-motion: reduce` disables animations (verify in OS settings).
- [ ] Toolbar action buttons disable correctly when:
  - Add is disabled at 8 colors (tooltip explains why).
  - PNG / PDF / Export disabled when palette is empty.
  - Clear cached cloud data disabled when no cache exists (tooltip explains why).

## 3. Offline / localStorage behavior

- [ ] DevTools → Network → Offline: app still loads (Vite assets cached by SW or hard reload after first visit).
- [ ] Saved → Cloud tab shows the **Using cached data** banner with item counts and last-sync time when cloud reads return zero.
- [ ] Harmony tab shows the same banner with palette / folder / harmony counts.
- [ ] Clear cached cloud data:
  - Confirmation dialog appears.
  - Action runs without a full page reload.
  - "Restore cleared cache" button + toast Undo both restore the snapshot.
- [ ] Quota-exceeded write to localStorage fails silently (no uncaught error).
- [ ] `Ctrl+K` opens the Saved → Cloud export dropdown.

## 4. Error & empty states

- [ ] Generate: trying to remove a swatch when 2 remain shows "Minimum 2 colors" toast.
- [ ] Generate: trying to add a 9th swatch shows "Maximum 8 colors" toast.
- [ ] Saved: empty Local tab shows the "Generate a palette" CTA card.
- [ ] Saved: empty Cloud tab shows the "Browse Explore" CTA card.
- [ ] Saved: empty folder shows the dashed-border "drop palettes here" hint.
- [ ] Harmony history empty state shows "Try a random base" CTA.
- [ ] 404 route renders the custom NotFound page.
- [ ] Toasts capped (no more than 3 stacked).

## 5. Cross-browser (desktop)

- [ ] Chrome / Edge: navigation, dropdowns, tooltips, dialogs.
- [ ] Firefox: focus rings, drag-and-drop on swatches.
- [ ] Safari (macOS): backdrop-blur, gradient text, sticky toolbar.

## 6. iOS Safari (real device or simulator)

- [ ] Bottom nav respects the home-indicator safe area.
- [ ] Tooltips on tap-and-hold do not break button taps.
- [ ] Modals (Name palette, confirm dialog) lock body scroll.
- [ ] Reduced-motion in iOS Settings → Accessibility actually disables animations.
- [ ] PNG / PDF downloads trigger the share sheet.
- [ ] Spacebar shortcut is desktop-only — no regression on mobile.

## 7. SEO / publish hygiene

- [ ] `<title>` < 60 chars, `<meta description>` < 160 chars.
- [ ] One `<h1>` per page.
- [ ] `og:` and `twitter:` tags set in `index.html`.
- [ ] `public/robots.txt` allows indexing (or restricts intentionally).
- [ ] Canonical tag set.

## 8. Final sanity

- [ ] `bun run build` succeeds with no TypeScript errors.
- [ ] No `console.error` / red network requests on a cold load of `/`, `/generate`, `/explore`, `/saved`, `/harmony`.
- [ ] Share URL round-trip: copy from Generate → open in incognito → palette restores.

When every box is ticked, click **Publish**.
