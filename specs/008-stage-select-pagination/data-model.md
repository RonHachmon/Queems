# Data Model: Stage Select Pagination

**Feature**: 008-stage-select-pagination
**Date**: 2026-03-04

---

## Overview

This feature involves no persistent data. All state is ephemeral UI state confined to `StageSelectPage`. No new stores, no localStorage keys, no schema changes.

---

## Component State

### `StageSelectPage` — added state

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentPage` | `number` | `1` | 1-based index of the currently visible page |

**Reset triggers**:
- Page/component mount
- User switches away from Stages tab (any tab change resets to `1`)

### Constants

| Name | Value | Description |
|------|-------|-------------|
| `PAGE_SIZE` | `12` | Maximum stage cards displayed per page |

---

## Derived Values (no new stored state)

These are computed inline from `STAGE_IDS`, `currentPage`, and `PAGE_SIZE`:

| Derived | Formula | Example (23 stages, page 1) |
|---------|---------|------------------------------|
| `totalPages` | `Math.ceil(STAGE_IDS.length / PAGE_SIZE)` | `2` |
| `visibleStageIds` | `STAGE_IDS.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE)` | indices 0–11 |
| `hasPrev` | `currentPage > 1` | `false` |
| `hasNext` | `currentPage < totalPages` | `true` |

---

## New Component: `Pagination`

**Props interface**:

```
PaginationProps {
  currentPage: number       // 1-based current page
  totalPages: number        // total page count
  onPrev: () => void        // called when user clicks Previous
  onNext: () => void        // called when user clicks Next
}
```

**Rendering rule**: The component renders `null` when `totalPages <= 1` (FR-006).

---

## Existing Entities (unchanged)

- `Stage` — no changes
- `StageCardProps` — no changes
- `STAGE_IDS: string[]` — consumed but not modified
- `STAGES: Record<string, Stage>` — consumed but not modified
- `best-times-store` — no changes
- `settings-store` — no changes
