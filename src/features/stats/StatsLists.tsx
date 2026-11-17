import { Link } from 'react-router'
import type { Rate, StreakRow } from '../../domain/stats.ts'
import type { GoalPeriod, Habit } from '../../types/domain.ts'
import { formatMinutes } from './format.ts'

const UNITS: Record<GoalPeriod, [string, string]> = {
  day: ['dia', 'dias'],
  week: ['semana', 'semanas'],
  month: ['mês', 'meses'],
}
const plural = (n: number, p: GoalPeriod) => `${n} ${UNITS[p][n === 1 ? 0 : 1]}`

function Bar({ ratio, color }: { ratio: number; color: string }) {
  return (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
      <div
        className="h-full rounded-full"
        style={{ width: `${ratio * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function RatesList({ rows }: { rows: { habit: Habit; rate: Rate }[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map(({ habit, rate }) => (
        <li key={habit.id}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <Link to={`/habits/${habit.id}`} className="truncate font-medium hover:underline">
              <span aria-hidden>{habit.icon} </span>
              {habit.name}
            </Link>
            <span className="shrink-0 text-slate-600 tabular-nums">
              {rate.rate === null
                ? 'sem dados ainda'
                : `${Math.round(rate.rate * 100)}% · ${rate.completed} de ${rate.completed + rate.missed}`}
            </span>
          </div>
          <Bar ratio={rate.rate ?? 0} color={habit.color} />
        </li>
      ))}
    </ul>
  )
}

export function StreakList({ rows }: { rows: StreakRow[] }) {
  return (
    <ol className="divide-y divide-slate-100">
      {rows.map(({ habit, current, best }, i) => (
        <li key={habit.id} className="flex items-center gap-3 py-2 text-sm">
          <span className="w-5 text-right font-semibold text-slate-400 tabular-nums">{i + 1}</span>
          <span className="min-w-0 flex-1 truncate font-medium">
            <span aria-hidden>{habit.icon} </span>
            {habit.name}
          </span>
          <span className="shrink-0 tabular-nums">🔥 {plural(current, habit.goal_period)}</span>
          <span className="w-24 shrink-0 text-right text-slate-500 tabular-nums">
            🏆 {plural(best, habit.goal_period)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function MinutesList({
  rows,
  total,
}: {
  rows: { habit: Habit; minutes: number }[]
  total: number
}) {
  if (rows.length === 0)
    return <p className="text-sm text-slate-500">Nenhum minuto registrado neste período.</p>
  return (
    <ul className="flex flex-col gap-4">
      {rows.map(({ habit, minutes }) => (
        <li key={habit.id}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate font-medium">
              <span aria-hidden>{habit.icon} </span>
              {habit.name}
            </span>
            <span className="shrink-0 text-slate-600 tabular-nums">{formatMinutes(minutes)}</span>
          </div>
          <Bar ratio={minutes / total} color={habit.color} />
        </li>
      ))}
    </ul>
  )
}
