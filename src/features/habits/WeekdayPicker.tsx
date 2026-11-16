const DAYS = [
  { value: 0, short: 'D', name: 'Domingo' },
  { value: 1, short: 'S', name: 'Segunda' },
  { value: 2, short: 'T', name: 'Terça' },
  { value: 3, short: 'Q', name: 'Quarta' },
  { value: 4, short: 'Q', name: 'Quinta' },
  { value: 5, short: 'S', name: 'Sexta' },
  { value: 6, short: 'S', name: 'Sábado' },
]

type Props = { value: number[]; onChange: (days: number[]) => void }

/** Dias da semana do hábito. Nenhum marcado = todo dia. */
export function WeekdayPicker({ value, onChange }: Props) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day])

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">Dias da semana</legend>
      <div className="flex gap-1.5">
        {DAYS.map((d) => {
          const on = value.includes(d.value)
          return (
            <button
              key={d.value}
              type="button"
              aria-label={d.name}
              aria-pressed={on}
              onClick={() => toggle(d.value)}
              className={`size-11 rounded-full border text-sm font-semibold transition-colors ${
                on
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d.short}
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-sm text-slate-500">
        {value.length === 0 || value.length === 7 ? 'Todo dia.' : 'Só nos dias marcados.'}
      </p>
    </fieldset>
  )
}
