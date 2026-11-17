import { useNavigate } from 'react-router'
import type { HeatCell } from '../../domain/stats.ts'
import { formatDayLabel } from '../../lib/dates.ts'

type Props = { weeks: HeatCell[][]; today: string }

/** Heatmap do ano: uma coluna por semana, mais forte quanto mais hábitos diários concluídos. */
export function YearHeatmap({ weeks, today }: Props) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex w-max gap-[3px]" role="grid" aria-label="Dias do último ano">
        {weeks.map((week, i) => (
          <div key={i} role="row" className="flex flex-col gap-[3px]">
            {week.map((cell, j) => {
              if (!cell) return <span key={j} className="size-3" />
              const ratio = cell.total > 0 ? cell.done / cell.total : 0
              return (
                <button
                  key={cell.date}
                  type="button"
                  role="gridcell"
                  aria-label={`${formatDayLabel(cell.date)}: ${cell.done} de ${cell.total}`}
                  title={`${formatDayLabel(cell.date)}: ${cell.done} de ${cell.total}`}
                  onClick={() => void navigate(cell.date === today ? '/' : `/?date=${cell.date}`)}
                  className={`size-3 rounded-[3px] ${cell.done === 0 ? 'bg-slate-100' : ''}`}
                  style={
                    cell.done > 0
                      ? { backgroundColor: `rgb(79 70 229 / ${0.2 + ratio * 0.8})` }
                      : undefined
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
