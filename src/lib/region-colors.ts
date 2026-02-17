import type { RegionId } from '@/types'

/**
 * Maps RegionId to CSS background-color class names.
 * Colors use CSS custom properties defined in src/assets/index.css @theme.
 * Tailwind v4: arbitrary property classes reference CSS variables.
 */
export const REGION_COLORS: Record<RegionId, string> = {
  blue:   'bg-[var(--color-region-blue)]',
  green:  'bg-[var(--color-region-green)]',
  red:    'bg-[var(--color-region-red)]',
  purple: 'bg-[var(--color-region-purple)]',
  yellow: 'bg-[var(--color-region-yellow)]',
  orange: 'bg-[var(--color-region-orange)]',
  grey:   'bg-[var(--color-region-grey)]',
  brown:  'bg-[var(--color-region-brown)]',
  pink:   'bg-[var(--color-region-pink)]',
}

/** Returns the background class for a region, with a fallback for unknown IDs. */
export function getRegionClass(regionId: RegionId): string {
  return REGION_COLORS[regionId] ?? 'bg-gray-200'
}
