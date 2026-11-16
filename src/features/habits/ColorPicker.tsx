import { HABIT_COLORS } from './habitSchema.ts'

const names: Record<string, string> = {
  '#6366f1': 'Índigo',
  '#0ea5e9': 'Azul',
  '#10b981': 'Verde',
  '#84cc16': 'Lima',
  '#f59e0b': 'Âmbar',
  '#f97316': 'Laranja',
  '#ef4444': 'Vermelho',
  '#ec4899': 'Rosa',
}

type Props = { value: string; onChange: (color: string) => void }

export function ColorPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">Cor</legend>
      <div className="flex flex-wrap gap-2">
        {HABIT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={names[color]}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={`size-11 rounded-full ${
              value === color ? 'ring-2 ring-slate-900 ring-offset-2' : ''
            }`}
          />
        ))}
      </div>
    </fieldset>
  )
}
