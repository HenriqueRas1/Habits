import { Link } from 'react-router'
import type { Habit } from '../../types/domain.ts'

type Props = {
  habit: Habit
  done: boolean
  streak: number
  onToggle: () => void
  reorder?: { onUp?: () => void; onDown?: () => void }
}

export function HabitCard({ habit, done, streak, onToggle, reorder }: Props) {
  return (
    <li
      className="flex min-h-18 items-center gap-3 rounded-2xl border bg-white p-3 pl-4 transition-colors"
      style={{ borderColor: done ? habit.color : undefined }}
    >
      <span className="text-2xl" aria-hidden>
        {habit.icon}
      </span>

      <Link to={`/habits/${habit.id}/edit`} className="min-w-0 flex-1 py-2">
        <span className="block truncate font-semibold">{habit.name}</span>
        <span className="block text-sm text-slate-500">
          {streak > 0 ? `🔥 ${streak} ${streak === 1 ? 'dia' : 'dias'}` : 'Sem sequência ainda'}
        </span>
      </Link>

      {reorder ? (
        <div className="flex gap-1">
          <ArrowButton label={`Mover ${habit.name} para cima`} onClick={reorder.onUp} up />
          <ArrowButton label={`Mover ${habit.name} para baixo`} onClick={reorder.onDown} />
        </div>
      ) : (
        <button
          type="button"
          aria-pressed={done}
          aria-label={`${habit.name}: ${done ? 'feito hoje, toque para desmarcar' : 'marcar como feito'}`}
          onClick={onToggle}
          className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90"
          style={{
            borderColor: habit.color,
            backgroundColor: done ? habit.color : 'transparent',
          }}
        >
          {done && (
            <svg
              viewBox="0 0 24 24"
              className="size-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden
            >
              <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
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
