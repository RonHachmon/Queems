# Feature Specification: SEO & Meta Tags

**Feature Branch**: `005-seo-meta-tags`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "make my project have SEO & Meta Tags. Ensuring your website is understandable to search engines and social media by using proper meta tags and optimization techniques. On a high level that user could easily share my website or find it on search engines"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Social Media Sharing with Rich Preview (Priority: P1)

A user who has played Queems wants to share the game with a friend. They copy the website URL and paste it into WhatsApp, Twitter/X, Facebook, or LinkedIn. Instead of seeing a bare link, the recipient sees a rich preview card showing the Queems game title, a short description, and a preview image — making the link visually appealing and informative enough to click.

**Why this priority**: Rich social previews are the single most impactful way users spread the game virally. Without Open Graph tags, shared links appear as plain unformatted URLs, reducing click-through and discoverability.

**Independent Test**: Paste the site URL into a social media post preview tool (e.g., opengraph.xyz) and verify a card with title, description, and image appears.

**Acceptance Scenarios**:

1. **Given** a user copies the Queems homepage URL, **When** they paste it into a WhatsApp chat, **Then** WhatsApp shows a preview card with the game's title, description, and image.
2. **Given** a user shares the URL on Twitter/X, **When** the tweet is composed, **Then** a Twitter Card with summary and image renders in the preview.
3. **Given** a user shares on Facebook or LinkedIn, **When** the post is created, **Then** a large Open Graph image card with title and description appears.
4. **Given** the preview image fails to load, **When** the link is shared, **Then** the title and description still appear (image is supplementary, not required for basic sharing).

---

### User Story 2 - Search Engine Discovery (Priority: P2)

A person has never heard of Queems but searches Google or Bing for terms like "queens puzzle game", "N-queens browser game", or "color region queen placement puzzle". The Queems site appears in search results with a clear, informative title and description snippet — telling the user what the game is about and enticing them to click.

**Why this priority**: Organic search is a sustainable acquisition channel. Proper meta titles and descriptions directly control how the site is presented in search result pages.

**Independent Test**: Inspect the page HTML `<head>` and confirm a `<title>`, `<meta name="description">`, and canonical link tag are present with meaningful content.

**Acceptance Scenarios**:

1. **Given** the site is crawled by a search engine, **When** it appears in search results, **Then** the title displayed is the game's name with a short tagline (e.g., "Queems — Queens Puzzle Game").
2. **Given** the site is indexed, **When** the search snippet is generated, **Then** the meta description (under 160 characters) explains what the game is about.
3. **Given** a canonical URL is defined, **When** the same content is accessible at multiple paths, **Then** search engines attribute ranking signals to a single authoritative URL.

---

### User Story 3 - Structured Data for Rich Results (Priority: P3)

When Queems appears in Google search results, it may be eligible for enhanced "rich result" features (such as a game card or breadcrumbs) because the page includes structured data describing it as a web-based game. This boosts visual prominence in search results and improves click-through rate.

**Why this priority**: Structured data provides an incremental improvement over basic meta tags but requires more effort to implement and validate. It amplifies discoverability without being a prerequisite for basic SEO.

**Independent Test**: Run the site URL through Google's Rich Results Test tool and confirm no structured data errors are reported.

**Acceptance Scenarios**:

1. **Given** the homepage contains structured data, **When** it is validated by an online structured data testing tool, **Then** no critical errors are reported and the content type (WebApplication or Game) is recognized.
2. **Given** the game's name, description, and category are declared in structured data, **When** Google indexes the page, **Then** the data is correctly parsed (visible in search console or testing tool).

---

### Edge Cases

- What happens when a stage-specific URL (e.g., `/stage/3`) is shared — does the preview still show meaningful content, or does it fall back gracefully to the site's global title and description?
- What if the Open Graph image URL is relative rather than absolute — do social platforms resolve it correctly?
- What if the user's browser language or locale is non-English — do meta tags still render the correct content (assumed: English-only for now)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The website MUST have a descriptive `<title>` tag that identifies it as the Queems puzzle game, visible in the browser tab and search result titles.
- **FR-002**: The website MUST include a `<meta name="description">` tag of 120–160 characters that summarizes the game's purpose for search engine snippets.
- **FR-003**: The website MUST include Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`) to enable rich social media previews on Facebook, LinkedIn, and WhatsApp.
- **FR-004**: The website MUST include Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) to enable preview cards on Twitter/X.
- **FR-005**: The website MUST provide a static preview image (minimum 1200×630 pixels) referenced by both `og:image` and `twitter:image`, stored as a project asset.
- **FR-006**: The website MUST include a `<link rel="canonical">` tag pointing to the canonical homepage URL to prevent duplicate-content penalties.
- **FR-007**: The website MUST include a `<meta name="robots" content="index, follow">` tag to explicitly permit search engine crawling and indexing.
- **FR-008**: The website MUST include structured data (WebApplication or Game schema) describing the game's name, description, and category.
- **FR-009**: The stage/puzzle pages (`/stage/:stageId`) SHOULD fall back to the global site title and description if no page-specific overrides are defined, ensuring no page is meta-tag-less.
- **FR-010**: All absolute URLs used in meta tags (canonical, og:url, og:image) MUST reference the production domain rather than localhost or relative paths.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the site URL is pasted into WhatsApp, Twitter/X, Facebook, or LinkedIn, a rich preview card containing at minimum the game title and description appears — verified via manual test or a social preview validation tool.
- **SC-002**: Inspecting the page's `<head>` HTML confirms all 10 functional requirements (FR-001–FR-010) are present and non-empty.
- **SC-003**: Running the site URL through an Open Graph validation tool (e.g., opengraph.xyz) produces zero missing-tag errors for title, description, image, and URL.
- **SC-004**: Running the site URL through Google's Rich Results Test (or equivalent structured data validator) reports zero critical errors for the structured data block.
- **SC-005**: The meta description accurately describes Queems in 160 characters or fewer — confirmed by character count.

## Assumptions

- The project will use a single global set of meta tags (not per-stage dynamic tags), with stage pages falling back to global values. Dynamic per-stage meta is out of scope.
- The production domain (used in canonical and og:url) will be configured as a constant or environment variable before deployment; a placeholder is acceptable during development.
- The preview image will be a newly created static asset (PNG or JPG) designed to represent the Queems brand — artwork details are left to the developer.
- "Structured data" means a JSON-LD block using schema.org vocabulary embedded in the `<head>` — no third-party SEO library is required.
- Robots.txt configuration is out of scope for this feature; the meta robots tag alone is sufficient.
- Sitemap generation is out of scope for this feature.
