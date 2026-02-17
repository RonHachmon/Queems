import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── localStorage mock ────────────────────────────────────────────────────────
// Zustand persist uses localStorage; stub it before importing the store.
const localStorageData: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: (key: string) => localStorageData[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageData[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageData[key]
  },
  clear: () => {
    Object.keys(localStorageData).forEach((k) => delete localStorageData[k])
  },
  get length() {
    return Object.keys(localStorageData).length
  },
  key: (index: number) => Object.keys(localStorageData)[index] ?? null,
})

// Import AFTER stubbing globals so persist middleware picks up our mock.
const { useBestTimesStore } = await import('@/stores/best-times-store')

describe('best-times-store', () => {
  beforeEach(() => {
    // Reset store state and localStorage between tests
    localStorage.clear()
    useBestTimesStore.setState({ bestTimes: {} })
  })

  it('records a first completion for a stage', () => {
    const { saveBestTime, getBestTime } = useBestTimesStore.getState()
    saveBestTime('stage-01', 90)
    expect(getBestTime('stage-01')).toBe(90)
  })

  it('updates the best time when a new time is faster', () => {
    const store = useBestTimesStore.getState()
    store.saveBestTime('stage-01', 90)
    store.saveBestTime('stage-01', 75)
    expect(useBestTimesStore.getState().getBestTime('stage-01')).toBe(75)
  })

  it('does NOT update when a new time is slower', () => {
    const store = useBestTimesStore.getState()
    store.saveBestTime('stage-01', 90)
    store.saveBestTime('stage-01', 120)
    expect(useBestTimesStore.getState().getBestTime('stage-01')).toBe(90)
  })

  it('does NOT update when a new time equals the existing best', () => {
    const store = useBestTimesStore.getState()
    store.saveBestTime('stage-01', 90)
    store.saveBestTime('stage-01', 90)
    expect(useBestTimesStore.getState().getBestTime('stage-01')).toBe(90)
  })

  it('returns undefined for stages that have never been played', () => {
    const { getBestTime } = useBestTimesStore.getState()
    expect(getBestTime('stage-99')).toBeUndefined()
  })

  it('stores data under the "queems-best-times" localStorage key', () => {
    useBestTimesStore.getState().saveBestTime('stage-01', 45)
    // Zustand persist stores a JSON string under the configured key
    const raw = localStorage.getItem('queems-best-times')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(parsed?.state?.bestTimes?.['stage-01']).toBe(45)
  })

  it('tracks best times for multiple stages independently', () => {
    const store = useBestTimesStore.getState()
    store.saveBestTime('stage-01', 60)
    store.saveBestTime('stage-02', 120)
    store.saveBestTime('stage-03', 45)

    expect(useBestTimesStore.getState().getBestTime('stage-01')).toBe(60)
    expect(useBestTimesStore.getState().getBestTime('stage-02')).toBe(120)
    expect(useBestTimesStore.getState().getBestTime('stage-03')).toBe(45)
  })
})
