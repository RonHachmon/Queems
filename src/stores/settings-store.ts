import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SettingsState } from '@/types'

const getPrefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoMarkEnabled: true,
      darkModeEnabled: getPrefersDark(),

      setAutoMark(value: boolean) {
        set({ autoMarkEnabled: value })
      },
      setDarkMode(value: boolean) {
        set({ darkModeEnabled: value })
      },
    }),
    {
      name: 'queems-settings',
    },
  ),
)
