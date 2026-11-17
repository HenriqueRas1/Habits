import { Link } from 'react-router'
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
}

export function HabitCard({ day, actions, isToday, reorder }: Props) {
  const { habit, state } = day
  const completed = state === 'completed'
  const skipped = state === 'skipped'
  const progress = progressLabel(day)
  const ratio = Math.min(1, day.progress / habit.goal_target)

  return (
    <li
      className={`relative flex min-h-18 flex-col rounded-2xl border bg-white transition-colors ${
        skipped || !day.scheduled ? 'opacity-60' : ''
      }`}
      style={{ borderColor: completed ? habit.color : undefined }}
    >
      <div className="flex items-center gap-2 p-3 pl-4">
        <span className="text-2xl" aria-hidden>
          {habit.icon}
        </span>

        <Link to={`/habits/${habit.id}`} className="min-w-0 flex-1 py-1">
          <span className="block truncate font-semibold">{habit.name}</span>
          <span className="block text-sm text-slate-500">
            {[progress, skipped ? '⏭ Pulado' : streakLabel(habit.goal_period, day.streak)]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {day.noteEntry?.note && (
            <span className="block truncate text-sm text-slate-400 italic">
              {day.noteEntry.note}
            </span>
          )}
        </Link>

        {reorder && (
          <div className="flex gap-1">
            <ArrowButton label={`Mover ${habit.name} para cima`} onClick={reorder.onUp} up />
            <ArrowButton label={`Mover ${habit.name} para baixo`} onClick={reorder.onDown} />
          </div>
        )}
        {actions && !reorder && (
          <>
            <HabitMenu day={day} actions={actions} />
            <CardControl day={day} actions={actions} isToday={isToday} />
          </>
        )}
      </div>

      {progress && (
        <div className="mx-4 mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div
            className="h-full transition-all"
            style={{ width: `${ratio * 100}%`, backgroundColor: habit.color }}
          />
        </div>
      )}
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
      className="flex size-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
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
