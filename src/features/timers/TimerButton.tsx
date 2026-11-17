import { useState } from 'react'
import { elapsedSeconds, formatClock } from '../../domain/timer.ts'
import { useNow } from '../../lib/useNow.ts'
import type { ActiveTimer, Habit } from '../../types/domain.ts'
import { useSession } from '../auth/sessionContext.ts'
import { useTimerActions } from './hooks.ts'
import { TimerScreen } from './TimerScreen.tsx'

type Props = {
  habit: Habit
  timer: ActiveTimer | undefined
  doneToday: number
  date: string
}

/** ▶ no cartão de um hábito de tempo; com timer rodando, mostra o tempo ao vivo. */
export function TimerButton({ habit, timer, doneToday, date }: Props) {
  const { session } = useSession()
  const actions = useTimerActions(session?.user.id ?? '')
  const [open, setOpen] = useState(false)
  const now = useNow(1000, Boolean(timer && !timer.paused_at))
  const elapsed = timer ? elapsedSeconds(timer, now) : 0
  const shown =
    timer?.countdown_seconds != null ? Math.max(0, timer.countdown_seconds - elapsed) : elapsed

  return (
    <>
      <button
        type="button"
        aria-label={
          timer
            ? `${habit.name}: timer em andamento, ${formatClock(shown)}`
            : `${habit.name}: abrir timer`
        }
        onClick={() => setOpen(true)}
        className={`flex h-10 shrink-0 items-center justify-center rounded-full border-2 bg-white/70 font-semibold tabular-nums transition-all active:scale-90 ${
          timer ? 'px-3 text-sm' : 'w-10'
        }`}
        style={{ borderColor: `${habit.color}99` }}
      >
        {timer ? (
          `${timer.paused_at ? '⏸' : '⏱'} ${formatClock(shown)}`
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="ml-0.5 size-4 text-slate-700"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 4.5v15l12-7.5z" />
          </svg>
        )}
      </button>

      {open && (
        <TimerScreen
          habit={habit}
          timer={timer}
          doneToday={doneToday}
          date={date}
          actions={actions}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
