import type { ActiveTimer } from '../../types/domain.ts'
import type { HabitDay } from './habitDay.ts'
import { HabitCard } from './HabitCard.tsx'
import type { useDayActions } from './useDayActions.ts'

/** Lista de cartões de hábitos de um dia. */
export function DayList({
  days,
  actionsFor,
  isToday,
  timers,
}: {
  days: HabitDay[]
  actionsFor: ReturnType<typeof useDayActions>
  isToday: boolean
  timers: ActiveTimer[]
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {days.map((day) => (
        <HabitCard
          key={day.habit.id}
          day={day}
          actions={actionsFor(day)}
          isToday={isToday}
          timer={timers.find((t) => t.habit_id === day.habit.id)}
        />
      ))}
    </ul>
  )
}
