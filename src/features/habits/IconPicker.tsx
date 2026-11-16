import { HABIT_ICONS } from './habitSchema.ts'

type Props = { value: string; onChange: (icon: string) => void; error?: string }

export function IconPicker({ value, onChange, error }: Props) {
  const isCustom = !HABIT_ICONS.some((i) => i === value)
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">Emoji</legend>
      <div className="grid grid-cols-8 gap-1.5">
        {HABIT_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            aria-label={icon}
            aria-pressed={value === icon}
            onClick={() => onChange(icon)}
            className={`flex aspect-square min-h-11 items-center justify-center rounded-lg text-xl ${
              value === icon ? 'bg-brand-100 ring-brand-500 ring-2' : 'bg-white hover:bg-slate-100'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        Outro:
        <input
          value={isCustom ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="cole um emoji"
          aria-label="Outro emoji"
          className="min-h-11 w-28 rounded-lg border border-slate-300 bg-white px-3 text-center text-base"
        />
      </label>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}
