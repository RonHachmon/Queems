import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, LayoutGrid, Settings } from 'lucide-react'
import { STAGES, STAGE_IDS } from '@/lib/stages'
import { useBestTimesStore } from '@/stores/best-times-store'
import { useSettingsStore } from '@/stores/settings-store'
import StageCard from '@/components/StageCard'
import { cn } from '@/lib/cn'

type ActiveTab = 'stages' | 'settings'

export default function StageSelectPage() {
  const navigate = useNavigate()
  const { bestTimes } = useBestTimesStore()
  const { autoMarkEnabled, setAutoMark } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>('stages')

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
        <p className="text-sm text-gray-500">
          It's Queens, but with an <span className="text-2xl font-extrabold text-amber-400">m</span>.
        </p>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Page sections"
        className="flex items-center gap-1 bg-gray-100 rounded-full p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stages'}
          aria-controls="panel-stages"
          id="tab-stages"
          onClick={() => setActiveTab('stages')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
            activeTab === 'stages'
              ? 'bg-amber-400 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
          Stages
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'settings'}
          aria-controls="panel-settings"
          id="tab-settings"
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
            activeTab === 'settings'
              ? 'bg-amber-400 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <Settings className="w-3.5 h-3.5" strokeWidth={2} />
          Settings
        </button>
      </div>

      {/* Tab panels */}
      {activeTab === 'stages' && (
        <div
          id="panel-stages"
          role="tabpanel"
          aria-labelledby="tab-stages"
          className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {STAGE_IDS.map((stageId) => (
            <StageCard
              key={stageId}
              stage={STAGES[stageId]}
              bestTime={bestTimes[stageId]}
              onSelect={(id) => navigate(`/stage/${id}`)}
            />
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div
          id="panel-settings"
          role="tabpanel"
          aria-labelledby="tab-settings"
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {/* Setting row — Auto-mark */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 min-h-[64px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-800">Auto-mark invalid cells</span>
                <span className="text-xs text-gray-400 leading-snug">
                  Marks cells that would break the rules when you place a queen
                </span>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={autoMarkEnabled}
                aria-label="Auto-mark invalid cells"
                onClick={() => setAutoMark(!autoMarkEnabled)}
                className={cn(
                  'relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400',
                  autoMarkEnabled ? 'bg-amber-400' : 'bg-gray-200',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    autoMarkEnabled ? 'translate-x-6' : 'translate-x-1',
                  )}
                />
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400 text-center px-2">
            Settings are saved automatically
          </p>
        </div>
      )}
    </motion.div>
  )
}
