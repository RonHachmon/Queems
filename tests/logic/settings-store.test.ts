import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/stores/settings-store'

function resetStore() {
  useSettingsStore.setState({ autoMarkEnabled: true })
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('defaults autoMarkEnabled to true', () => {
    const { autoMarkEnabled } = useSettingsStore.getState()
    expect(autoMarkEnabled).toBe(true)
  })

  it('setAutoMark(false) sets autoMarkEnabled to false', () => {
    useSettingsStore.getState().setAutoMark(false)
    expect(useSettingsStore.getState().autoMarkEnabled).toBe(false)
  })

  it('setAutoMark(true) restores autoMarkEnabled to true after it was false', () => {
    useSettingsStore.setState({ autoMarkEnabled: false })
    useSettingsStore.getState().setAutoMark(true)
    expect(useSettingsStore.getState().autoMarkEnabled).toBe(true)
  })

  it('setAutoMark is idempotent — calling with the same value leaves state unchanged', () => {
    useSettingsStore.getState().setAutoMark(true)
    expect(useSettingsStore.getState().autoMarkEnabled).toBe(true)

    useSettingsStore.getState().setAutoMark(false)
    useSettingsStore.getState().setAutoMark(false)
    expect(useSettingsStore.getState().autoMarkEnabled).toBe(false)
  })
})
