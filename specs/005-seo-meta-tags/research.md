# Research: SEO & Meta Tags (005-seo-meta-tags)

**Generated**: 2026-02-19
**Phase**: Phase 0 — resolves all NEEDS CLARIFICATION from spec and technical context

---

## Decision 1: Meta Tag Injection Approach

**Decision**: Static `index.html` — add all tags directly in the `<head>` element.

**Rationale**:
- Zero new library dependencies (aligns with Constitution V — YAGNI)
- All FR requirements in spec.md are satisfied without dynamic per-route overrides
- Per-route dynamic meta (e.g., per-stage sharing) is explicitly out of scope per spec Assumptions section
- `react-helmet-async` adds ~50 KB and is justified only when routes need different meta content — a future concern, not a present one
- `vite-plugin-html` adds build-time templating complexity with no benefit here

**Alternatives considered**:
- `react-helmet-async` — deferred; re-evaluate only when per-stage sharing becomes a specified requirement
- `vite-plugin-html` — rejected; no template-variable injection needed for static string tags

---

## Decision 2: Production Domain (Canonical URL / og:url / og:image base)

**Decision**: Use `https://queems.app` as a placeholder constant in `index.html` (comment directs developer to update before first production deploy).

**Rationale**:
- The project deploys to Netlify (`netlify.toml` present; `publish = "dist"`) but the exact subdomain/custom domain is unknown at plan time
- The spec explicitly states: "a placeholder is acceptable during development"
- Hardcoding a single placeholder string in one file (`index.html`) costs one edit at deploy time; no environment-variable plumbing is necessary

**Alternatives considered**:
- `VITE_SITE_URL` env variable + `vite-plugin-html` — overkill; requires a plugin, a `.env.production` file, and more CI configuration
- Leave blank — rejected; blank `og:url` breaks sharing validators

---

## Decision 3: Open Graph Image

**Decision**: Create `public/og-image.png` — a single 1200×630 PNG stored as a Vite public asset.

**Rationale**:
- Social platforms (Facebook, WhatsApp, LinkedIn, Twitter/X) require PNG or JPG; SVG is not universally supported
- 1200×630 pixels (16:9) is the universal "safe zone" across all major platforms
- Files placed in Vite's `public/` are copied verbatim to `dist/` and served at the root path (`/og-image.png`)
- A single image for both `og:image` and `twitter:image` reduces asset maintenance
- SVG sources (`public/crown.svg`) can serve as design reference when creating the PNG

**Image design guidance** (for the implementer):
- Dark background to match the game's UI palette
- Centered crown icon (from existing `crown.svg`) + "Queems" wordmark
- Sub-title: "Queens Puzzle Game"
- Safe margins: no critical content within 100px of edges (crop safety)
- The existing `crown.svg` can be opened in Figma, Inkscape, or a browser to create the PNG

**Alternatives considered**:
- SVG as og:image — rejected; WhatsApp and some LinkedIn crawlers don't render SVG previews
- 600×315 half-res image — rejected; 1200×630 is now the platform standard and retina-safe
- Per-stage images — out of scope per spec

---

## Decision 4: Structured Data Schema

**Decision**: `WebApplication` type with `applicationCategory: "GameApplication"`, delivered as a `<script type="application/ld+json">` block in `index.html`.

**Rationale**:
- `WebApplication` is the correct schema.org type for browser-based games (not `Game`, which is for downloadable/physical games)
- JSON-LD is Google's recommended format; inline in `<head>` ensures it's parsed on first crawl
- Fields included: `name`, `description`, `url`, `applicationCategory`, `image`, `creator`, `inLanguage`, `isAccessibleForFree`, `datePublished`
- `aggregateRating` is omitted — Queems has no user rating system in the current spec

**Alternatives considered**:
- Microdata — outdated; JSON-LD is modern standard
- Separate `.jsonld` file linked via `<link>` — no browser/crawler support; must be inline

---

## Decision 5: Twitter Card Type

**Decision**: `summary_large_image` — displays the full 1200×630 image as a card on Twitter/X.

**Rationale**:
- `summary_large_image` is the highest-impact card type for visual content and games
- Requires the same 1200×630 image already planned for Open Graph (shared asset)
- `twitter:site` / `twitter:creator` tags will use a placeholder (`@queems_game`); update with real handle if/when available

**Alternatives considered**:
- `summary` (small square thumbnail) — rejected; poor visual impact for a game
- `app` card — rejected; for native mobile app installs, not web apps

---

## Decision 6: robots Meta Tag

**Decision**: `<meta name="robots" content="index, follow">` — explicit crawl permission.

**Rationale**:
- Default behavior without a robots meta tag is `index, follow`, but explicit declaration signals intent and satisfies FR-007
- `noindex` or `nofollow` would prevent search engine visibility — the opposite of this feature's goal
- No `robots.txt` changes needed (out of scope per spec Assumptions)

---

## Summary Table

| Decision | Chosen Approach | Key Reason |
|----------|-----------------|------------|
| Tag injection | Static `index.html` | Zero deps, YAGNI |
| Production domain | Placeholder `https://queems.app` | Unknown at plan time; one-edit deploy step |
| OG image | `public/og-image.png`, 1200×630 PNG | Platform compatibility, Vite public asset convention |
| Structured data | JSON-LD `WebApplication` in `<head>` | Google-recommended, no runtime cost |
| Twitter card | `summary_large_image` | Maximum visual impact, same image as OG |
| Robots | `index, follow` | Explicit crawl permission |
