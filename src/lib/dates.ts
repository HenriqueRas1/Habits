import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

/**
 * Único lugar do app que lida com fuso horário.
 * Datas de calendário circulam como texto YYYY-MM-DD; horários, como ISO com fuso.
 */

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** "Hoje" no fuso informado, como YYYY-MM-DD. */
export function todayIn(timezone: string, now: Date): string {
  return format(new TZDate(now, timezone), 'yyyy-MM-dd')
}

/** Lê YYYY-MM-DD como meia-noite UTC, para contas de calendário sem efeito de fuso. */
function parseUtc(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function formatUtc(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const d = parseUtc(date)
  d.setUTCDate(d.getUTCDate() + days)
  return formatUtc(d)
}

export function isDateString(value: string): boolean {
  return DATE_RE.test(value) && formatUtc(parseUtc(value)) === value
}

/** "segunda-feira, 16 de novembro" */
export function formatDayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return format(new Date(y, m - 1, d), "EEEE, d 'de' MMMM", { locale: ptBR })
}

/** "março de 2026" a partir de YYYY-MM */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return format(new Date(y, m - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })
}

/** Meio-dia de uma data no fuso, como ISO (horário padrão de recaídas registradas sem hora). */
export function noonIn(date: string, timezone: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(new TZDate(y, m - 1, d, 12, 0, 0, timezone).getTime()).toISOString()
}

/** ISO → valor de <input type="datetime-local"> no fuso ("2026-03-10T08:30"). */
export function toDateTimeInput(iso: string, timezone: string): string {
  return format(new TZDate(new Date(iso), timezone), "yyyy-MM-dd'T'HH:mm")
}

/** Valor de <input type="datetime-local"> interpretado no fuso → ISO. */
export function fromDateTimeInput(value: string, timezone: string): string {
  const [date, time] = value.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(new TZDate(y, m - 1, d, hh, mm, 0, timezone).getTime()).toISOString()
}
