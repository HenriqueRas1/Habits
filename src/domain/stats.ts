import { addDays } from '../lib/dates.ts'
import type { Entry, Habit } from '../types/domain.ts'
import { daysIn, periodOf, previousPeriod, type WeekStart } from './periods.ts'
import {
  indexEntries,
  isScheduled,
  progressFromIndex,
  stateFromIndex,
} from './progress.ts'
import { bestStreak, currentStreak } from './streaks.ts'

/** Estatísticas só olham hábitos de construir (os de parar não têm meta de "fazer"). */
const building = (habits: Habit[]) => habits.filter((h) => h.type === 'build')

function entriesOf(habit: Habit, entries: Entry[]) {
  return entries.filter((e) => e.habit_id === habit.id)
}

export type Rate = { completed: number; missed: number; rate: number | null }

/**
 * Taxa de conclusão dos períodos que tocam os últimos `days` dias.
 * Só entram completed e missed: pulados, não agendados e o período em andamento ficam fora.
 */
export function completionRate(
  habit: Habit,
  entries: Entry[],
  today: string,
  days: number,
  weekStart: WeekStart,
): Rate {
  const windowStart = addDays(today, -(days - 1))
  const index = indexEntries(entriesOf(habit, entries).filter((e) => e.entry_date <= today))
  let completed = 0
  let missed = 0
  for (
    let p = periodOf(today, habit.goal_period, weekStart);
    p.end >= windowStart && p.end >= habit.start_date;
    p = previousPeriod(p, habit.goal_period, weekStart)
  ) {
    const state = stateFromIndex(habit, index, p, today)
    if (state === 'completed') completed += 1
    else if (state === 'missed') missed += 1
  }
  const total = completed + missed
  return { completed, missed, rate: total > 0 ? completed / total : null }
}

/** Para cada data: quantos hábitos diários (agendados) existiam e quantos foram concluídos. */
function dailyCounter(habits: Habit[], entries: Entry[]) {
  const daily = building(habits)
    .filter((h) => h.goal_period === 'day')
    .map((habit) => ({ habit, index: indexEntries(entriesOf(habit, entries)) }))
  return (date: string) => {
    let done = 0
    let total = 0
    for (const { habit, index } of daily) {
      if (!isScheduled(habit, date)) continue
      total += 1
      if (progressFromIndex(habit, index, { start: date, end: date }) >= habit.goal_target) {
        done += 1
      }
    }
    return { done, total }
  }
}

export type WeekBar = { start: string; end: string; done: number; total: number; rate: number }

/** Percentual de dias concluídos (hábitos diários) em cada uma das últimas `weeks` semanas. */
export function weeklyBars(
  habits: Habit[],
  entries: Entry[],
  today: string,
  weekStart: WeekStart,
  weeks = 12,
): WeekBar[] {
  const count = dailyCounter(habits, entries)
  const bars: WeekBar[] = []
  let week = periodOf(today, 'week', weekStart)
  for (let i = 0; i < weeks; i += 1) {
    let done = 0
    let total = 0
    for (const date of daysIn(week)) {
      if (date > today) continue
      const c = count(date)
      done += c.done
      total += c.total
    }
    bars.unshift({ ...week, done, total, rate: total > 0 ? done / total : 0 })
    week = previousPeriod(week, 'week', weekStart)
  }
  return bars
}

export type HeatCell = { date: string; done: number; total: number } | null

/** Semanas (colunas de 7 dias) do último ano até a semana de hoje; dias futuros são null. */
export function yearHeatmap(
  habits: Habit[],
  entries: Entry[],
  today: string,
  weekStart: WeekStart,
): HeatCell[][] {
  const count = dailyCounter(habits, entries)
  const first = periodOf(addDays(today, -364), 'week', weekStart).start
  const weeks: HeatCell[][] = []
  for (let start = first; start <= today; start = addDays(start, 7)) {
    weeks.push(
      daysIn({ start, end: addDays(start, 6) }).map((date) =>
        date > today ? null : { date, ...count(date) },
      ),
    )
  }
  return weeks
}

export type StreakRow = { habit: Habit; current: number; best: number }

export function streakRanking(
  habits: Habit[],
  entries: Entry[],
  today: string,
  weekStart: WeekStart,
): StreakRow[] {
  return building(habits)
    .map((habit) => {
      const own = entriesOf(habit, entries)
      return {
        habit,
        current: currentStreak(habit, own, today, weekStart),
        best: bestStreak(habit, own, today, weekStart),
      }
    })
    .sort((a, b) => b.current - a.current || b.best - a.best)
}

/** Minutos registrados (manual e timer) nos hábitos de tempo, nos últimos `days` dias. */
export function minutesTotals(habits: Habit[], entries: Entry[], today: string, days: number) {
  const from = addDays(today, -(days - 1))
  const byHabit = building(habits)
    .filter((h) => h.goal_kind === 'duration')
    .map((habit) => ({
      habit,
      minutes: entriesOf(habit, entries)
        .filter((e) => e.kind === 'done' && e.entry_date >= from && e.entry_date <= today)
        .reduce((sum, e) => sum + Number(e.value), 0),
    }))
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
  return { total: byHabit.reduce((sum, row) => sum + row.minutes, 0), byHabit }
}
