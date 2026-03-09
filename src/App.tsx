import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useSettingsStore } from '@/stores/settings-store'
import AppRoutes from '@/AppRoutes'

export default function App() {
  const darkModeEnabled = useSettingsStore((s) => s.darkModeEnabled)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkModeEnabled)
  }, [darkModeEnabled])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
