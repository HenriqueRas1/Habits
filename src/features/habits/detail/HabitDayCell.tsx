import type { DayCell } from '../../../domain/calendar.ts'
import { formatDayLabel } from '../../../lib/dates.ts'

const LABEL: Record<DayCell, string> = {
  completed: 'concluído',
  partial: 'parcial',
  skipped: 'pulado',
  missed: 'perdido',
  none: 'sem registro',
}

type Props = {
  date: string
  cell: DayCell
  color: string
  selected: boolean
  disabled: boolean
  onSelect: (date: string) => void
}

/** Um dia no calendário do hábito, colorido pelo estado. */
export function HabitDayCell({ date, cell, color, selected, disabled, onSelect }: Props) {
  const style =
    cell === 'completed'
      ? { backgroundColor: color, color: 'white' }
      : cell === 'partial'
        ? { backgroundColor: `${color}40` }
        : undefined

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${formatDayLabel(date)}: ${LABEL[cell]}`}
      onClick={() => onSelect(date)}
      style={style}
      className={`relative flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:text-slate-300 ${
        cell === 'skipped' ? 'bg-slate-200 text-slate-500' : ''
      } ${cell === 'missed' ? 'border-2 border-slate-300' : ''} ${
        selected ? 'ring-2 ring-slate-900 ring-offset-1' : ''
      } ${cell === 'none' && !disabled ? 'hover:bg-slate-100' : ''}`}
    >
      {Number(date.slice(8))}
      {cell === 'skipped' && (
        <span aria-hidden className="absolute right-0.5 bottom-0 text-[10px]">
          ⏭
        </span>
      )}
    </button>
  )
}
