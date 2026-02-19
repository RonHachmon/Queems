import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SettingsState } from '@/types'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoMarkEnabled: true,

      setAutoMark(value: boolean) {
        set({ autoMarkEnabled: value })
      },
    }),
    {
      name: 'queems-settings',
    },
  ),
)
