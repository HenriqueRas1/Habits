type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  legend: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Grupo de botões em que só um fica ativo (tipo de meta, período...). */
export function Segmented<T extends string>({ legend, options, value, onChange }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{legend}</legend>
      <div className="flex rounded-lg border border-slate-300 bg-slate-50 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-10 flex-1 rounded-md px-2 text-sm font-medium transition-colors ${
              value === o.value
                ? 'text-brand-700 bg-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
