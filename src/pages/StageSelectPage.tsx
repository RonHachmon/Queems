import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { STAGES, STAGE_IDS } from '@/lib/stages'
import { useBestTimesStore } from '@/stores/best-times-store'
import StageCard from '@/components/StageCard'

export default function StageSelectPage() {
  const navigate = useNavigate()
  const { bestTimes } = useBestTimesStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center min-h-screen bg-gray-50 px-4 sm:px-8 py-10 gap-8"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Queems</h1>
        </div>
        <p className="text-sm text-gray-500">It's Queens, but with an  <span className="font-bold">M.</span></p>
      </div>

      {/* Stage grid — 1 col on mobile, 2 on sm, 3 on lg */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STAGE_IDS.map((stageId) => (
          <StageCard
            key={stageId}
            stage={STAGES[stageId]}
            bestTime={bestTimes[stageId]}
            onSelect={(id) => navigate(`/stage/${id}`)}
          />
        ))}
      </div>
    </motion.div>
  )
}
