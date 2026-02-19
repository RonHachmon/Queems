# Quickstart: SEO & Meta Tags (005-seo-meta-tags)

## What was built

- `index.html` — `<head>` updated with: page title, meta description, robots directive, canonical link, Open Graph tags, Twitter Card tags, and a JSON-LD structured data block
- `public/og-image.png` — 1200×630 static preview image for social sharing

## Two steps required before going to production

### Step 1 — Replace the placeholder domain

Search for `https://queems.app` in `index.html` (appears in `og:url`, `og:image`, `twitter:image`, and the JSON-LD block) and replace it with the actual production URL, e.g.:

```
https://queems.netlify.app
https://your-custom-domain.com
```

There are exactly **5 occurrences** — all in `index.html`.

### Step 2 — Replace the placeholder OG image

`public/og-image.png` is a placeholder. Before deploying, replace it with a real branded image:

- Dimensions: **1200 × 630 px** (do not change — affects meta tag values)
- Format: **PNG** (preferred) or JPG
- Design guidance: dark background, Queems crown + wordmark, readable at thumbnail size
- The existing `public/crown.svg` can be used as design source in Figma / Inkscape

## Validate after deployment

| Tool | URL | What to check |
|------|-----|---------------|
| Open Graph preview | https://opengraph.xyz | Title, description, image appear |
| Twitter Card validator | https://cards-dev.twitter.com/validator | Card renders with large image |
| Google Rich Results | https://search.google.com/test/rich-results | WebApplication schema has no errors |
| Meta tags inspector | https://metatags.io | All OG + Twitter tags listed |

## Verify locally (no deployment needed)

To test that all tags are present in the built output:

```bash
pnpm build && pnpm preview
```

Then inspect the page source (`Ctrl+U`) and confirm:
- `<title>` contains "Queems"
- `<meta name="description">` is non-empty
- `<meta property="og:image">` contains an absolute URL
- `<script type="application/ld+json">` block is present and valid JSON
