import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import StageSelectPage from '@/pages/StageSelectPage'
import PuzzlePage from '@/pages/PuzzlePage'

export default function AppRoutes() {
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
