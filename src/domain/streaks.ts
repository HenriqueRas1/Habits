import { nextPeriod, periodOf, previousPeriod, type WeekStart } from './periods.ts'
import { indexEntries, stateFromIndex, type GoalHabit, type ProgressEntry } from './progress.ts'

/**
 * Streak atual, na unidade do período da meta (dias, semanas ou meses).
 * Anda do período atual para trás: completed soma, skipped / not_scheduled / in_progress
 * são neutros, e o primeiro missed para a contagem.
 */
export function currentStreak(
  habit: GoalHabit,
  entries: ProgressEntry[],
  today: string,
  weekStart: WeekStart,
): number {
  const index = indexEntries(entries.filter((e) => e.entry_date <= today))
  let streak = 0
  for (
    let p = periodOf(today, habit.goal_period, weekStart);
    p.end >= habit.start_date;
    p = previousPeriod(p, habit.goal_period, weekStart)
  ) {
    const state = stateFromIndex(habit, index, p, today)
    if (state === 'missed') break
    if (state === 'completed') streak += 1
  }
  return streak
}

/** Maior sequência da história do hábito, com as mesmas regras do streak atual. */
export function bestStreak(
  habit: GoalHabit,
  entries: ProgressEntry[],
  today: string,
  weekStart: WeekStart,
): number {
  if (habit.start_date > today) return 0
  const index = indexEntries(entries.filter((e) => e.entry_date <= today))
  let best = 0
  let run = 0
  for (
    let p = periodOf(habit.start_date, habit.goal_period, weekStart);
    p.start <= today;
    p = nextPeriod(p, habit.goal_period, weekStart)
  ) {
    const state = stateFromIndex(habit, index, p, today)
    if (state === 'missed') run = 0
    else if (state === 'completed') best = Math.max(best, (run += 1))
  }
  return best
}
