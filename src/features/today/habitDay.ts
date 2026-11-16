import { periodOf, type WeekStart } from '../../domain/periods.ts'
import {
  isScheduled,
  periodProgress,
  periodState,
  type PeriodState,
} from '../../domain/progress.ts'
import { currentStreak } from '../../domain/streaks.ts'
import type { Entry, GoalPeriod, Habit } from '../../types/domain.ts'

/** Tudo o que o cartão de um hábito precisa mostrar numa data. */
export type HabitDay = {
  habit: Habit
  date: string
  state: PeriodState
  progress: number
  scheduled: boolean
  /** O período da data contém hoje? ("esta semana" vs. "na semana") */
  current: boolean
  /** Registros "done" da data, do mais antigo ao mais novo. */
  doneEntries: Entry[]
  /** Pulo do período, se houver. */
  skipEntry: Entry | undefined
  /** Registro que guarda a nota mostrada no cartão. */
  noteEntry: Entry | undefined
  streak: number
}

export function buildHabitDay(
  habit: Habit,
  entries: Entry[],
  date: string,
  today: string,
  weekStart: WeekStart,
): HabitDay {
  const period = periodOf(date, habit.goal_period, weekStart)
  const doneEntries = entries
    .filter((e) => e.entry_date === date && e.kind === 'done')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const skipEntry = entries.find(
    (e) => e.kind === 'skip' && e.entry_date >= period.start && e.entry_date <= period.end,
  )
  return {
    habit,
    date,
    state: periodState(habit, entries, period, today),
    progress: periodProgress(habit, entries, period),
    scheduled: isScheduled(habit, date),
    current: period.end >= today,
    doneEntries,
    skipEntry,
    noteEntry: doneEntries.at(-1) ?? (skipEntry?.entry_date === date ? skipEntry : undefined),
    streak: currentStreak(habit, entries, today, weekStart),
  }
}

const UNITS: Record<GoalPeriod, [string, string]> = {
  day: ['dia', 'dias'],
  week: ['semana', 'semanas'],
  month: ['mês', 'meses'],
}

export function streakLabel(period: GoalPeriod, streak: number): string {
  if (streak === 0) return 'Sem sequência ainda'
  return `🔥 ${streak} ${UNITS[period][streak === 1 ? 0 : 1]}`
}

const PERIOD_WORD: Record<GoalPeriod, [string, string]> = {
  day: ['', ''],
  week: ['esta semana', 'na semana'],
  month: ['este mês', 'no mês'],
}

const number = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

/** "2/3 esta semana", "5/8 copos", "10/30 min". Vazio para check diário. */
export function progressLabel(day: HabitDay): string {
  const { habit, progress, current } = day
  if (habit.goal_kind === 'check' && habit.goal_period === 'day') return ''
  const unit =
    habit.goal_kind === 'duration' ? ' min' : habit.goal_unit ? ` ${habit.goal_unit}` : ''
  const when = PERIOD_WORD[habit.goal_period][current ? 0 : 1]
  return `${number(progress)}/${number(habit.goal_target)}${unit}${when ? ` ${when}` : ''}`
}
