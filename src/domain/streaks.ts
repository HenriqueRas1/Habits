import { addDays } from '../lib/dates.ts'
import type { EntryKind } from '../types/domain.ts'

type StreakEntry = { entry_date: string; kind: EntryKind }

/**
 * Streak simples da fase 2: dias seguidos com registro "done", terminando hoje ou ontem.
 * Hoje ainda sem registro não quebra o streak. A fase 3 troca por currentStreak completo
 * (períodos, pulos e dias não agendados).
 */
export function currentDailyStreak(entries: StreakEntry[], today: string): number {
  const doneDays = new Set(
    entries.filter((e) => e.kind === 'done' && e.entry_date <= today).map((e) => e.entry_date),
  )

  let day = doneDays.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (doneDays.has(day)) {
    streak += 1
    day = addDays(day, -1)
  }
  return streak
}
