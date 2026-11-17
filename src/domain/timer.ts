/**
 * Timer de hábitos de tempo. O estado vive em active_timers; "agora" sempre chega por parâmetro.
 * Rodando: tempo = acumulado + (agora − started_at). Pausado: só o acumulado.
 */
export type TimerState = {
  started_at: string
  paused_at: string | null
  accumulated_seconds: number
}

export function elapsedSeconds(timer: TimerState, now: Date): number {
  if (timer.paused_at) return timer.accumulated_seconds
  const running = Math.floor((now.getTime() - new Date(timer.started_at).getTime()) / 1000)
  return Math.max(0, timer.accumulated_seconds + running)
}

/** O que gravar ao pausar: o acumulado até agora e o horário da pausa. */
export function pauseTimer(timer: TimerState, now: Date) {
  return { accumulated_seconds: elapsedSeconds(timer, now), paused_at: now.toISOString() }
}

/** O que gravar ao retomar: o trecho novo começa agora. */
export function resumeTimer(now: Date) {
  return { started_at: now.toISOString(), paused_at: null }
}

/** Minutos do registro criado ao parar: arredondado, mínimo 1. */
export function timerMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60))
}

/** Contagem regressiva parte do que falta da meta de hoje, em segundos. */
export function countdownStart(targetMinutes: number, doneMinutes: number): number {
  return Math.max(0, targetMinutes - doneMinutes) * 60
}

/** 65 → "01:05"; 3723 → "1:02:03". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}
