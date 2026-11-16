import { addDays } from '../lib/dates.ts'
import type { GoalPeriod } from '../types/domain.ts'

/** Início da semana no perfil: 0 = domingo, 1 = segunda. */
export type WeekStart = 0 | 1

/** Intervalo de datas YYYY-MM-DD, inclusive nas duas pontas. */
export type Period = { start: string; end: string }

function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number)
  return [y, m, d]
}

/** Dia da semana de uma data de calendário: 0 = domingo ... 6 = sábado. */
export function weekday(date: string): number {
  const [y, m, d] = parts(date)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function monthOf(date: string): Period {
  const [y, m] = parts(date)
  const start = `${date.slice(0, 7)}-01`
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { start, end: `${date.slice(0, 7)}-${String(lastDay).padStart(2, '0')}` }
}

/** Período da meta que contém a data. */
export function periodOf(date: string, period: GoalPeriod, weekStart: WeekStart): Period {
  if (period === 'day') return { start: date, end: date }
  if (period === 'month') return monthOf(date)
  const offset = (weekday(date) - weekStart + 7) % 7
  const start = addDays(date, -offset)
  return { start, end: addDays(start, 6) }
}

export function previousPeriod(current: Period, period: GoalPeriod, weekStart: WeekStart): Period {
  return periodOf(addDays(current.start, -1), period, weekStart)
}

export function nextPeriod(current: Period, period: GoalPeriod, weekStart: WeekStart): Period {
  return periodOf(addDays(current.end, 1), period, weekStart)
}

/** Todas as datas do período, em ordem. */
export function daysIn(period: Period): string[] {
  const days: string[] = []
  for (let d = period.start; d <= period.end; d = addDays(d, 1)) days.push(d)
  return days
}
