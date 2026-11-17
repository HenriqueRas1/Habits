import { quitStats } from '../../domain/quit.ts'
import { noonIn } from '../../lib/dates.ts'
import type { Entry, Habit } from '../../types/domain.ts'

/** Instante de cada recaída: o horário gravado, ou meio-dia do dia se foi registrada sem hora. */
export function relapseMoments(entries: Entry[], timezone: string): string[] {
  return entries
    .filter((e) => e.kind === 'relapse')
    .map((e) => e.started_at ?? noonIn(e.entry_date, timezone))
}

/** Contagem do hábito de parar, a partir do "sem desde" (ou do início do hábito). */
export function statsFor(habit: Habit, entries: Entry[], timezone: string, now: Date) {
  const startedAt = habit.quit_started_at ?? noonIn(habit.start_date, timezone)
  return quitStats(startedAt, relapseMoments(entries, timezone), now)
}
