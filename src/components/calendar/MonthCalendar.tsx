import type { ReactNode } from 'react'
import { addMonths, monthGrid } from '../../domain/calendar.ts'
import type { WeekStart } from '../../domain/periods.ts'
import { formatMonthLabel } from '../../lib/dates.ts'

const LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

type Props = {
  /** YYYY-MM */
  month: string
  /** Meses permitidos (YYYY-MM), inclusive. */
  min: string
  max: string
  weekStart: WeekStart
  onMonthChange: (month: string) => void
  /** Conteúdo de cada dia; `inMonth` é falso para os dias dos meses vizinhos. */
  renderDay: (date: string, inMonth: boolean) => ReactNode
}

/** Grade de um mês com navegação ‹ mês ›. Quem usa decide como cada dia aparece. */
export function MonthCalendar({ month, min, max, weekStart, onMonthChange, renderDay }: Props) {
  const letters = [...LETTERS.slice(weekStart), ...LETTERS.slice(0, weekStart)]
  const prev = addMonths(month, -1)
  const next = addMonths(month, 1)

  return (
    <section aria-label={`Calendário de ${formatMonthLabel(month)}`}>
      <div className="mb-3 flex items-center justify-between">
        <MonthButton
          label="Mês anterior"
          disabled={prev < min}
          onClick={() => onMonthChange(prev)}
          back
        />
        <h2 className="font-semibold first-letter:uppercase" aria-live="polite">
          {formatMonthLabel(month)}
        </h2>
        <MonthButton
          label="Próximo mês"
          disabled={next > max}
          onClick={() => onMonthChange(next)}
        />
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {letters.map((l, i) => (
          <span key={i} className="pb-1 text-xs font-semibold text-slate-400" aria-hidden>
            {l}
          </span>
        ))}
        {monthGrid(month, weekStart)
          .flat()
          .map((date) => (
            <div key={date}>{renderDay(date, date.startsWith(month))}</div>
          ))}
      </div>
    </section>
  )
}

function MonthButton(props: {
  label: string
  disabled: boolean
  onClick: () => void
  back?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
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
          d={props.back ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
