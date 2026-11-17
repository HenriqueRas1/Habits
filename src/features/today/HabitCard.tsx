import { Link } from 'react-router'
import { CardFill } from '../../components/ui/CardFill.tsx'
import type { ActiveTimer } from '../../types/domain.ts'
import { CardControl } from './CardControl.tsx'
import { HabitMenu } from './HabitMenu.tsx'
import { progressLabel, streakLabel, type HabitDay } from './habitDay.ts'
import type { DayActions } from './useDayActions.ts'

type Props = {
  day: HabitDay
  /** Ausente no modo de reordenar. */
  actions?: DayActions
  isToday: boolean
  reorder?: { onUp?: () => void; onDown?: () => void }
  timer?: ActiveTimer
}

export function HabitCard({ day, actions, isToday, reorder, timer }: Props) {
  const { habit, state } = day
  const completed = state === 'completed'
  const skipped = state === 'skipped'
  const progress = progressLabel(day)
  const ratio = completed || skipped ? 1 : Math.min(1, day.progress / habit.goal_target)

  return (
    <li
      className={`relative flex min-h-16 items-center gap-3 rounded-full border bg-white py-2 pr-2 pl-2 transition-colors ${
        ratio > 0 ? 'border-transparent' : 'border-slate-200'
      } ${skipped || !day.scheduled ? 'opacity-60' : ''}`}
    >
      <CardFill ratio={ratio} color={skipped ? '#e2e8f0' : `${habit.color}55`} />

      <span
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-xl"
        aria-hidden
      >
        {habit.icon}
      </span>

      <Link to={`/habits/${habit.id}`} className="relative min-w-0 flex-1 py-1">
        <span className="block truncate font-semibold">{habit.name}</span>
        <span className="block truncate text-sm text-slate-600">
          {[progress, skipped ? '⏭ Pulado' : streakLabel(habit.goal_period, day.streak)]
            .filter(Boolean)
            .join(' · ')}
        </span>
        {day.noteEntry?.note && (
          <span className="block truncate text-sm text-slate-500 italic">{day.noteEntry.note}</span>
        )}
      </Link>

      <div className="relative flex items-center gap-1">
        {reorder && (
          <>
            <ArrowButton label={`Mover ${habit.name} para cima`} onClick={reorder.onUp} up />
            <ArrowButton label={`Mover ${habit.name} para baixo`} onClick={reorder.onDown} />
          </>
        )}
        {actions && !reorder && (
          <>
            <HabitMenu day={day} actions={actions} />
            <CardControl day={day} actions={actions} isToday={isToday} timer={timer} />
          </>
        )}
      </div>
    </li>
  )
}

function ArrowButton({
  label,
  onClick,
  up = false,
}: {
  label: string
  onClick?: () => void
  up?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={!onClick}
      className="flex size-10 items-center justify-center rounded-full bg-white/70 text-slate-600 hover:bg-white disabled:opacity-30"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          d={up ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
