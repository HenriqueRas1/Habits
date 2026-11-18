import { addDays } from '../lib/dates.ts'
import { daysIn, periodOf, type WeekStart } from './periods.ts'
import {
  indexEntries,
  isScheduled,
  progressFromIndex,
  stateFromIndex,
  type GoalHabit,
  type ProgressEntry,
} from './progress.ts'

/** Como um dia aparece no calendário de um hábito. */
export type DayCell = 'completed' | 'partial' | 'skipped' | 'missed' | 'none'

/** Mês como YYYY-MM. */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

/** Semanas completas (7 datas cada) que cobrem o mês, incluindo dias dos meses vizinhos. */
export function monthGrid(month: string, weekStart: WeekStart): string[][] {
  const { start, end } = periodOf(`${month}-01`, 'month', weekStart)
  const first = periodOf(start, 'week', weekStart).start
  const last = periodOf(end, 'week', weekStart).end
  const weeks: string[][] = []
  for (let d = first; d <= last; d = addDays(d, 7)) {
    weeks.push(daysIn({ start: d, end: addDays(d, 6) }))
  }
  return weeks
}

export function dayCell(
  habit: GoalHabit,
  entries: ProgressEntry[],
  date: string,
  today: string,
  weekStart: WeekStart,
): DayCell {
  if (date > today || date < habit.start_date) return 'none'
  const index = indexEntries(entries)
  const hasDone = (index.get(date)?.doneCount ?? 0) > 0
  const period = periodOf(date, habit.goal_period, weekStart)
  const state = stateFromIndex(habit, index, period, today)

  if (habit.goal_period === 'day') {
    if (state === 'not_scheduled') return 'none'
    if (state === 'completed' || state === 'skipped') return state
    if (hasDone) return 'partial'
    return state === 'missed' ? 'missed' : 'none'
  }

  // Semana/mês: o dia mostra se contribuiu para um período concluído ou não.
  if (hasDone) return state === 'completed' ? 'completed' : 'partial'
  return state === 'skipped' ? 'skipped' : 'none'
}

export type Completion = { done: number; total: number; others: number }

/**
 * Fração de hábitos diários concluídos no dia (calendário geral).
 * Hábitos semanais/mensais não entram na fração; `others` conta os que tiveram registro.
 */
export function dayCompletion(
  habits: (GoalHabit & { id: string })[],
  entries: (ProgressEntry & { habit_id: string })[],
  date: string,
): Completion {
  const result: Completion = { done: 0, total: 0, others: 0 }
  for (const habit of habits) {
    if (date < habit.start_date) continue
    const index = indexEntries(entries.filter((e) => e.habit_id === habit.id))
    if (habit.goal_period !== 'day') {
      if ((index.get(date)?.doneCount ?? 0) > 0) result.others += 1
      continue
    }
    if (!isScheduled(habit, date)) continue
    result.total += 1
    if (progressFromIndex(habit, index, { start: date, end: date }) >= habit.goal_target) {
      result.done += 1
    }
  }
  return result
}

/**
 * Cor do dia no calendário geral:
 * all = todos feitos (verde), most = 50% ou mais (verde claro),
 * few = abaixo de 50% (vermelho claro), none = nenhum (vermelho), empty = sem hábitos no dia.
 */
export type DayTone = 'all' | 'most' | 'few' | 'none' | 'empty'

export function dayTone({ done, total }: Pick<Completion, 'done' | 'total'>): DayTone {
  if (total === 0) return 'empty'
  if (done >= total) return 'all'
  if (done === 0) return 'none'
  return done / total >= 0.5 ? 'most' : 'few'
}
