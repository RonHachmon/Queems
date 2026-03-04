import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/stores/settings-store'
import StageSelectPage from '@/pages/StageSelectPage'
import PuzzlePage from '@/pages/PuzzlePage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<StageSelectPage />} />
        <Route path="/stage/:stageId" element={<PuzzlePage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const darkModeEnabled = useSettingsStore((s) => s.darkModeEnabled)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkModeEnabled)
  }, [darkModeEnabled])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
