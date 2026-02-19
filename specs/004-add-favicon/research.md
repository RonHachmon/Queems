# Research: App Favicon (004-add-favicon)

## Finding 1 — Existing favicon wiring

**Decision**: The `index.html` `<head>` already contains:
```html
<link rel="icon" type="image/svg+xml" href="/crown.svg" />
```
The file `crown.svg` is never created, so every browser currently shows the blank-page default icon.

**Rationale**: No change to `index.html` is required. The implementation is limited to creating `public/crown.svg`.

**Alternatives considered**: Adding PNG fallbacks (`favicon-32x32.png`, `apple-touch-icon.png`) for older browsers and iOS home-screen bookmarks. Deferred — SVG favicon support covers Chrome 80+, Firefox 41+, Edge 80+, Safari 17+. An `.ico` fallback is not needed for modern browsers.

---

## Finding 2 — Vite static asset delivery

**Decision**: Vite serves files in the `public/` directory at the site root without hashing. `public/crown.svg` is served as `/crown.svg`, matching the existing `href`.

**Rationale**: No build configuration changes needed. Creating the directory and placing the SVG there is sufficient.

**Alternatives considered**: Importing the SVG as a module src — rejected because `index.html` `<link>` tags reference public paths, not JS module paths.

---

## Finding 3 — SVG favicon design constraints

**Decision**: Design a crown silhouette SVG using the app's amber accent (`#f59e0b`), on a transparent background, sized at `viewBox="0 0 32 32"`. The crown shape uses filled paths only (no strokes, no text) so it renders clearly at 16×16 pixels.

**Rationale**: The app's primary brand element is the crown (already used in `StageSelectPage` via `<Crown>` Lucide icon). The amber-400 colour (`#f59e0b`) is the consistent accent across the UI. Filled path-only shapes avoid anti-aliasing artefacts at small sizes. Transparent background integrates cleanly with both light and dark browser chrome.

**Alternatives considered**:
- Letter "Q" glyph — less distinctive at 16×16 and requires font embedding.
- White background circle — adds visual noise; transparent is preferred.
- Multi-colour design — too complex to read at favicon sizes.
