import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button.tsx'
import { Segmented } from '../../components/ui/Segmented.tsx'
import { countdownStart, elapsedSeconds, formatClock, timerMinutes } from '../../domain/timer.ts'
import { useNow } from '../../lib/useNow.ts'
import type { ActiveTimer, Habit } from '../../types/domain.ts'
import { beep } from './beep.ts'
import type { useTimerActions } from './hooks.ts'

type Props = {
  habit: Habit
  timer: ActiveTimer | undefined
  /** Minutos já feitos hoje (para a contagem regressiva partir do que falta). */
  doneToday: number
  /** Dia em que o registro será criado ao parar. */
  date: string
  actions: ReturnType<typeof useTimerActions>
  onClose: () => void
}

/** Timer em tela cheia: cronômetro ou contagem regressiva, sincronizado entre aparelhos. */
export function TimerScreen({ habit, timer, doneToday, date, actions, onClose }: Props) {
  const now = useNow(1000, Boolean(timer && !timer.paused_at))
  const remainingGoal = countdownStart(habit.goal_target, doneToday) / 60
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>(
    remainingGoal > 0 ? 'countdown' : 'stopwatch',
  )
  const [minutes, setMinutes] = useState(String(remainingGoal || habit.goal_target))

  const elapsed = timer ? elapsedSeconds(timer, now) : 0
  const remaining = timer?.countdown_seconds != null ? timer.countdown_seconds - elapsed : null
  const finished = remaining !== null && remaining <= 0

  // Bipe uma vez quando a contagem regressiva chega a zero com o app aberto.
  const beeped = useRef(finished)
  useEffect(() => {
    if (finished && !beeped.current) beep()
    beeped.current = finished
  }, [finished])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Timer de ${habit.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-white px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>{habit.icon}</span>
          {habit.name}
        </p>
        <Button variant="link" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {timer ? (
          <>
            <p className="text-sm font-medium text-slate-500">
              {timer.mode === 'countdown' ? 'Contagem regressiva' : 'Cronômetro'}
              {timer.paused_at ? ' · pausado' : ''}
            </p>
            <p className="text-7xl font-bold tabular-nums" aria-live="off" role="timer">
              {formatClock(remaining !== null ? Math.max(0, remaining) : elapsed)}
            </p>
            {finished && (
              <p role="status" className="text-lg font-semibold" style={{ color: habit.color }}>
                Tempo esgotado! 🎉
              </p>
            )}
            {remaining !== null && (
              <p className="text-sm text-slate-500">Total: {formatClock(elapsed)}</p>
            )}
          </>
        ) : (
          <div className="flex w-full max-w-xs flex-col gap-4">
            <Segmented
              legend="Modo"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'stopwatch', label: 'Cronômetro' },
                { value: 'countdown', label: 'Regressiva' },
              ]}
            />
            {mode === 'countdown' && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Minutos
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        {!timer ? (
          <Button
            disabled={mode === 'countdown' && !(Number(minutes) >= 1)}
            onClick={() =>
              actions.start(
                habit.id,
                mode,
                mode === 'countdown' ? Math.round(Number(minutes) * 60) : null,
              )
            }
          >
            Iniciar
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                actions.stop(timer, date)
                onClose()
              }}
            >
              Parar e salvar {timerMinutes(elapsed)} min
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => (timer.paused_at ? actions.resume(timer) : actions.pause(timer))}
              >
                {timer.paused_at ? 'Retomar' : 'Pausar'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  window.confirm('Descartar este timer sem salvar?') && actions.discard(timer)
                }
              >
                Descartar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
