import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import { WRITE_QUEUE } from '../../lib/writeQueue.ts'
import { elapsedSeconds, pauseTimer, resumeTimer, timerMinutes } from '../../domain/timer.ts'
import type { ActiveTimer } from '../../types/domain.ts'
import { useEntryAction } from '../entries/hooks.ts'
import { deleteTimer, fetchTimers, startTimer, updateTimer } from './api.ts'

export const timersKey = ['timers'] as const

export function useTimers() {
  return useQuery({ queryKey: timersKey, queryFn: fetchTimers })
}

type TimerAction =
  | { type: 'start'; timer: ActiveTimer }
  | { type: 'update'; habitId: string; patch: Partial<ActiveTimer> }
  | { type: 'delete'; habitId: string }

async function run(action: TimerAction) {
  if (action.type === 'start') {
    const { habit_id, mode, countdown_seconds, started_at } = action.timer
    await startTimer({ habit_id, mode, countdown_seconds, started_at })
  } else if (action.type === 'update') {
    await updateTimer(action.habitId, action.patch)
  } else {
    await deleteTimer(action.habitId)
  }
}

function useTimerMutation() {
  const client = useQueryClient()
  return useMutation({
    scope: WRITE_QUEUE,
    mutationFn: (action: TimerAction) => run(action),
    onMutate: (action) =>
      applyOptimistic<ActiveTimer[]>(client, timersKey, (old) => {
        if (action.type === 'start') return [...old, action.timer]
        if (action.type === 'delete') return old.filter((t) => t.habit_id !== action.habitId)
        return old.map((t) => (t.habit_id === action.habitId ? { ...t, ...action.patch } : t))
      }),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível salvar o timer.'),
    onSettled: () => client.invalidateQueries({ queryKey: timersKey }),
  })
}

/** Iniciar, pausar, retomar, descartar e parar (parar grava o registro e só então apaga o timer). */
export function useTimerActions(userId: string) {
  const { mutate } = useTimerMutation()
  const entry = useEntryAction(userId)

  return {
    start(habitId: string, mode: 'stopwatch' | 'countdown', countdownSeconds: number | null) {
      mutate({
        type: 'start',
        timer: {
          habit_id: habitId,
          user_id: userId,
          mode,
          countdown_seconds: countdownSeconds,
          started_at: new Date().toISOString(),
          paused_at: null,
          accumulated_seconds: 0,
        },
      })
    },
    pause(timer: ActiveTimer) {
      mutate({ type: 'update', habitId: timer.habit_id, patch: pauseTimer(timer, new Date()) })
    },
    resume(timer: ActiveTimer) {
      mutate({ type: 'update', habitId: timer.habit_id, patch: resumeTimer(new Date()) })
    },
    discard(timer: ActiveTimer) {
      mutate({ type: 'delete', habitId: timer.habit_id })
    },
    /** Cria o registro com os minutos no dia `date` e, se der certo, apaga o timer. */
    stop(timer: ActiveTimer, date: string) {
      const now = new Date()
      const seconds = elapsedSeconds(timer, now)
      entry.mutate(
        {
          type: 'add',
          entry: {
            id: crypto.randomUUID(),
            habit_id: timer.habit_id,
            entry_date: date,
            kind: 'done',
            value: timerMinutes(seconds),
            source: 'timer',
            started_at: new Date(now.getTime() - seconds * 1000).toISOString(),
            ended_at: now.toISOString(),
          },
        },
        { onSuccess: () => mutate({ type: 'delete', habitId: timer.habit_id }) },
      )
    },
  }
}
