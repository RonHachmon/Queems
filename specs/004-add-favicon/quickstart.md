# Quickstart: App Favicon (004-add-favicon)

## What this feature does

Creates `public/crown.svg` — a simple amber crown silhouette that the browser displays in the tab bar. The HTML wiring already exists in `index.html`.

## Files changed

| Action   | Path               | Description                          |
|----------|--------------------|--------------------------------------|
| Create   | `public/crown.svg` | SVG favicon — amber crown silhouette |

No other files are modified.

## Design spec for crown.svg

- **viewBox**: `0 0 32 32`
- **Background**: transparent
- **Fill colour**: `#f59e0b` (Tailwind amber-400)
- **Shape**: crown silhouette — three points at the top, rectangular base, filled paths only
- **No strokes, no text, no gradients** — ensures crisp rendering at 16×16

## Verification steps

1. Run `pnpm dev`
2. Open `http://localhost:5173` in Chrome, Firefox, and Edge
3. Confirm the amber crown icon appears in the browser tab
4. Bookmark the page and confirm the icon appears in the bookmarks bar
5. On a high-DPI display, confirm the icon is sharp (SVG scales without blur)
