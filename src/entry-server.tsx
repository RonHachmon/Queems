import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import AppRoutes from '@/AppRoutes'
import { ALL_STAGES } from '@/lib/stages'

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  )
}

export const stageRoutes = ALL_STAGES.map((s) => ({
  url: `/stage/${s.id}`,
  title: `Queems — ${s.id} (${s.size}×${s.size} Puzzle)`,
  description: `Play the ${s.id} Queems puzzle. A ${s.size}×${s.size} grid — place one queen per color region.`,
}))
