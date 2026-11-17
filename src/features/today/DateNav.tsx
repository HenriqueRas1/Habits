import { addDays, formatDayLabel } from '../../lib/dates.ts'

type Props = {
  date: string
  today: string
  /** Data mais antiga que pode ser escolhida (início do hábito mais antigo). */
  min: string
  onChange: (date: string) => void
}

function label(date: string, today: string) {
  if (date === today) return 'Hoje'
  if (date === addDays(today, -1)) return 'Ontem'
  return formatDayLabel(date)
}

/** ← data → para registrar dias passados. Nunca vai para o futuro. */
export function DateNav({ date, today, min, onChange }: Props) {
  const prev = addDays(date, -1)
  const next = addDays(date, 1)
  return (
    <nav aria-label="Escolher dia" className="mb-4 flex items-center gap-2">
      <NavButton label="Dia anterior" disabled={prev < min} onClick={() => onChange(prev)} back />
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate font-semibold first-letter:uppercase" aria-live="polite">
          {label(date, today)}
        </p>
        {date !== today && (
          <button
            type="button"
            onClick={() => onChange(today)}
            className="text-brand-600 text-sm hover:underline"
          >
            Voltar para hoje
          </button>
        )}
      </div>
      <NavButton label="Próximo dia" disabled={next > today} onClick={() => onChange(next)} />
    </nav>
  )
}

function NavButton(props: {
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
      className="bg-surface flex size-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
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
