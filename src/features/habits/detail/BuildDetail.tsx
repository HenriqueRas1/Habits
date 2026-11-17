import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { MonthCalendar } from '../../../components/calendar/MonthCalendar.tsx'
import { dayCell } from '../../../domain/calendar.ts'
import type { WeekStart } from '../../../domain/periods.ts'
import { bestStreak, currentStreak } from '../../../domain/streaks.ts'
import type { Entry, GoalPeriod, Habit } from '../../../types/domain.ts'
import { DayPanel } from './DayPanel.tsx'
import { HabitDayCell } from './HabitDayCell.tsx'

const UNITS: Record<GoalPeriod, [string, string]> = {
  day: ['dia', 'dias'],
  week: ['semana', 'semanas'],
  month: ['mês', 'meses'],
}

type Props = {
  habit: Habit
  entries: Entry[]
  today: string
  weekStart: WeekStart
  userId: string
}

/** Hábito de construir: streaks, calendário colorido e histórico editável do dia escolhido. */
export function BuildDetail({ habit, entries, today, weekStart, userId }: Props) {
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState(today)

  const minMonth = habit.start_date.slice(0, 7)
  const maxMonth = today.slice(0, 7)
  const rawMonth = params.get('month') ?? selected.slice(0, 7)
  const month = rawMonth >= minMonth && rawMonth <= maxMonth ? rawMonth : maxMonth
  const units = UNITS[habit.goal_period]
  const plural = (n: number) => `${n} ${units[n === 1 ? 0 : 1]}`

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat
          label="Sequência atual"
          value={`🔥 ${plural(currentStreak(habit, entries, today, weekStart))}`}
        />
        <Stat
          label="Melhor sequência"
          value={`🏆 ${plural(bestStreak(habit, entries, today, weekStart))}`}
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
                cell={dayCell(habit, entries, date, today, weekStart)}
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
        entries={entries}
        weekStart={weekStart}
        userId={userId}
      />
    </>
  )
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}
