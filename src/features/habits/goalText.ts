import type { Habit } from '../../types/domain.ts'

const PERIOD = { day: 'por dia', week: 'por semana', month: 'por mês' } as const
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** "Todo dia", "3x por semana", "8 copos por dia · Seg, Qua, Sex", "30 min por dia". */
export function goalText(habit: Habit): string {
  const { goal_kind: kind, goal_period: period, goal_target: target } = habit
  const base =
    kind === 'check'
      ? period === 'day'
        ? 'Todo dia'
        : `${target}x ${PERIOD[period]}`
      : kind === 'duration'
        ? `${target} min ${PERIOD[period]}`
        : `${target}${habit.goal_unit ? ` ${habit.goal_unit}` : 'x'} ${PERIOD[period]}`
  const days = habit.schedule_days
  if (period !== 'day' || !days || days.length === 0 || days.length === 7) return base
  const list = [...days]
    .sort()
    .map((d) => DAY_NAMES[d])
    .join(', ')
  return kind === 'check' ? list : `${base} · ${list}`
}
