import type { Entry, Habit } from '../types/domain.ts'
import { daysIn, weekday, type Period } from './periods.ts'

export type GoalHabit = Pick<
  Habit,
  'goal_kind' | 'goal_target' | 'goal_period' | 'schedule_days' | 'start_date'
>
export type ProgressEntry = Pick<Entry, 'entry_date' | 'kind' | 'value'>

export type PeriodState = 'completed' | 'skipped' | 'not_scheduled' | 'in_progress' | 'missed'

/** Resumo dos registros de um dia, para não varrer a lista inteira a cada período. */
type DaySummary = { doneCount: number; doneValue: number; skipped: boolean }
export type EntryIndex = Map<string, DaySummary>

export function indexEntries(entries: ProgressEntry[]): EntryIndex {
  const index: EntryIndex = new Map()
  for (const e of entries) {
    const day = index.get(e.entry_date) ?? { doneCount: 0, doneValue: 0, skipped: false }
    if (e.kind === 'done') {
      day.doneCount += 1
      day.doneValue += Number(e.value)
    } else if (e.kind === 'skip') {
      day.skipped = true
    }
    index.set(e.entry_date, day)
  }
  return index
}

/** O hábito vale nesta data? (depois do início e, para metas diárias, num dia da agenda) */
export function isScheduled(habit: GoalHabit, date: string): boolean {
  if (date < habit.start_date) return false
  const days = habit.schedule_days
  if (habit.goal_period !== 'day' || !days || days.length === 0) return true
  return days.includes(weekday(date))
}

/** check: dias distintos com done; count/duration: soma de value dos done. */
export function progressFromIndex(habit: GoalHabit, index: EntryIndex, period: Period): number {
  let total = 0
  for (const date of daysIn(period)) {
    const day = index.get(date)
    if (!day || day.doneCount === 0) continue
    total += habit.goal_kind === 'check' ? 1 : day.doneValue
  }
  return total
}

export function periodProgress(habit: GoalHabit, entries: ProgressEntry[], period: Period): number {
  return progressFromIndex(habit, indexEntries(entries), period)
}

export function stateFromIndex(
  habit: GoalHabit,
  index: EntryIndex,
  period: Period,
  today: string,
): PeriodState {
  if (period.start > today || period.end < habit.start_date) return 'not_scheduled'
  if (habit.goal_period === 'day' && !isScheduled(habit, period.start)) return 'not_scheduled'
  if (progressFromIndex(habit, index, period) >= habit.goal_target) return 'completed'
  if (daysIn(period).some((d) => index.get(d)?.skipped)) return 'skipped'
  if (period.end >= today) return 'in_progress'
  return 'missed'
}

export function periodState(
  habit: GoalHabit,
  entries: ProgressEntry[],
  period: Period,
  today: string,
): PeriodState {
  return stateFromIndex(habit, indexEntries(entries), period, today)
}
