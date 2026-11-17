/**
 * "Dias sem" para hábitos de parar. Recebe instantes (ISO) e "agora" por parâmetro.
 */
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const MILESTONE_DAYS = [1, 3, 7, 14, 30, 60, 90, 180, 365] as const

export type QuitStats = {
  /** Tempo desde a última recaída (ou desde o início). */
  currentMs: number
  /** Maior intervalo sem recaída, contando o atual. */
  recordMs: number
  /** Início da sequência atual. */
  lastStart: string
}

export function quitStats(startedAt: string, relapses: string[], now: Date): QuitStats {
  const start = new Date(startedAt).getTime()
  const points = relapses
    .map((r) => new Date(r).getTime())
    .filter((r) => r >= start && r <= now.getTime())
    .sort((a, b) => a - b)

  let previous = start
  let record = 0
  for (const point of points) {
    record = Math.max(record, point - previous)
    previous = point
  }
  const current = Math.max(0, now.getTime() - previous)
  return {
    currentMs: current,
    recordMs: Math.max(record, current),
    lastStart: new Date(previous).toISOString(),
  }
}

/** "12 dias, 5 h"; abaixo de um dia, "5 h, 12 min" ou "12 min". */
export function formatQuitDuration(ms: number): string {
  const days = Math.floor(ms / DAY)
  const hours = Math.floor((ms % DAY) / HOUR)
  const minutes = Math.floor((ms % HOUR) / MINUTE)
  if (days > 0) return `${days} ${days === 1 ? 'dia' : 'dias'}, ${hours} h`
  if (hours > 0) return `${hours} h, ${minutes} min`
  return `${minutes} min`
}

/** Último marco atingido, próximo marco e quantos dias (arredondado para cima) faltam. */
export function milestones(currentMs: number) {
  const days = currentMs / DAY
  const reached = [...MILESTONE_DAYS].reverse().find((m) => days >= m) ?? null
  const next = MILESTONE_DAYS.find((m) => days < m) ?? null
  return { reached, next, daysToNext: next === null ? null : Math.ceil(next - days) }
}
