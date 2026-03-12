import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import StageSelectPage from '@/pages/StageSelectPage'
import PuzzlePage from '@/pages/PuzzlePage'

export default function AppRoutes() {
  const location = useLocation()
  if (import.meta.env.DEV) console.log('[AppRoutes] render — pathname:', location.pathname, 'key:', location.key)
  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => { if (import.meta.env.DEV) console.log('[AppRoutes] onExitComplete — exit animation finished') }}
    >
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<StageSelectPage />} />
        <Route path="/stage/:stageId" element={<PuzzlePage />} />
      </Routes>
    </AnimatePresence>
  )
}
