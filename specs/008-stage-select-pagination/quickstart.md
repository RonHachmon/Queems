# Quickstart: Stage Select Pagination

**Feature**: 008-stage-select-pagination
**Branch**: `008-stage-select-pagination`

---

## Prerequisites

- Node.js 20+, pnpm installed
- Repo cloned, dependencies installed: `pnpm install`

---

## Running Locally

```bash
pnpm dev
# → http://localhost:5173
```

Navigate to `/` (Stage Select page) and verify the Stages tab shows paginated cards.

---

## Testing the Feature

### Manual smoke test

1. Open `http://localhost:5173`
2. Stages tab is active → confirm **12 cards** visible (not all 23)
3. A page indicator shows **"1 / 2"**
4. **Previous** button is disabled; **Next** button is enabled
5. Click **Next** → 11 remaining cards appear; indicator shows **"2 / 2"**
6. **Next** button is now disabled; **Previous** button is enabled
7. Click **Previous** → returns to first 12 cards; indicator shows **"1 / 2"**
8. Navigate to page 2 → switch to **Settings** tab → switch back to **Stages** → confirm page **1** is shown

### Running unit tests

```bash
pnpm vitest
```

No new game-logic modules are introduced; no TDD tests are required by Constitution IV.
Component smoke tests (if added) run via `pnpm vitest`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/Pagination.tsx` | **NEW** — Prev/Next buttons + page indicator |
| `src/pages/StageSelectPage.tsx` | **MODIFIED** — add `currentPage` state, slice `STAGE_IDS`, render `<Pagination>` |

---

## Key Constants

| Constant | Value | Location |
|----------|-------|----------|
| `PAGE_SIZE` | `12` | `src/components/Pagination.tsx` or co-located constant |
