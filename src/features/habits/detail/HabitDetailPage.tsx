import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { MonthCalendar } from '../../../components/calendar/MonthCalendar.tsx'
import { PageHeader } from '../../../components/layout/PageHeader.tsx'
import { Alert } from '../../../components/ui/Alert.tsx'
import { FullScreenSpinner } from '../../../components/ui/FullScreenSpinner.tsx'
import { dayCell } from '../../../domain/calendar.ts'
import { bestStreak, currentStreak } from '../../../domain/streaks.ts'
import type { GoalPeriod } from '../../../types/domain.ts'
import { useSession } from '../../auth/sessionContext.ts'
import { useHabitEntries } from '../../entries/hooks.ts'
import { useToday, useWeekStart } from '../../profile/hooks.ts'
import { goalText } from '../goalText.ts'
import { useHabit } from '../hooks.ts'
import { DayPanel } from './DayPanel.tsx'
import { HabitDayCell } from './HabitDayCell.tsx'

const UNITS: Record<GoalPeriod, [string, string]> = {
  day: ['dia', 'dias'],
  week: ['semana', 'semanas'],
  month: ['mês', 'meses'],
}

/** /habits/:id — streaks, calendário do mês e histórico editável. */
export function HabitDetailPage() {
  const { id = '' } = useParams()
  const today = useToday()
  const weekStart = useWeekStart()
  const { session } = useSession()
  const { data: habit, isPending } = useHabit(id)
  const entries = useHabitEntries(id, habit?.start_date ?? today, today, Boolean(habit))
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState(today)

  if (isPending || (habit && entries.isPending)) return <FullScreenSpinner />
  if (!habit) {
    return (
      <>
        <PageHeader title="Hábito não encontrado" />
        <Link to="/" className="text-brand-600 hover:underline">
          Voltar para Hoje
        </Link>
      </>
    )
  }
  if (entries.isError) {
    return <Alert tone="error">Não foi possível carregar o histórico. Verifique a internet.</Alert>
  }

  const list = entries.data ?? []
  const minMonth = habit.start_date.slice(0, 7)
  const maxMonth = today.slice(0, 7)
  const rawMonth = params.get('month') ?? selected.slice(0, 7)
  const month = rawMonth >= minMonth && rawMonth <= maxMonth ? rawMonth : maxMonth
  const units = UNITS[habit.goal_period]
  const plural = (n: number) => `${n} ${units[n === 1 ? 0 : 1]}`

  return (
    <>
      <header className="mb-6 flex items-start gap-3">
        <span className="text-4xl" aria-hidden>
          {habit.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{habit.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{goalText(habit)}</p>
        </div>
        <Link
          to={`/habits/${habit.id}/edit`}
          className="flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Editar
        </Link>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat
          label="Sequência atual"
          value={`🔥 ${plural(currentStreak(habit, list, today, weekStart))}`}
        />
        <Stat
          label="Melhor sequência"
          value={`🏆 ${plural(bestStreak(habit, list, today, weekStart))}`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <MonthCalendar
          month={month}
          min={minMonth}
          max={maxMonth}
          weekStart={weekStart}
          onMonthChange={(m) => setParams({ month: m }, { replace: true })}
          renderDay={(date, inMonth) =>
            inMonth ? (
              <HabitDayCell
                date={date}
                cell={dayCell(habit, list, date, today, weekStart)}
                color={habit.color}
                selected={date === selected}
                disabled={date > today || date < habit.start_date}
                onSelect={setSelected}
              />
            ) : null
          }
        />
      </div>

      <DayPanel
        habit={habit}
        date={selected}
        entries={list}
        weekStart={weekStart}
        userId={session?.user.id ?? ''}
      />
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}
