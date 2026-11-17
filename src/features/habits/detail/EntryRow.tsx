import type { Entry, Habit } from '../../../types/domain.ts'

type Props = {
  entry: Entry
  habit: Habit
  onEditValue?: () => void
  onEditNote: () => void
  onDelete: () => void
}

function describe(entry: Entry, habit: Habit): string {
  if (entry.kind === 'skip') return '⏭ Pulado'
  const value = Number(entry.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  if (habit.goal_kind === 'duration')
    return `${value} min${entry.source === 'timer' ? ' (timer)' : ''}`
  if (habit.goal_kind === 'count') return `${value}${habit.goal_unit ? ` ${habit.goal_unit}` : ''}`
  return '✓ Feito'
}

/** Uma linha do histórico do dia, com corrigir valor, nota e apagar. */
export function EntryRow({ entry, habit, onEditValue, onEditNote, onDelete }: Props) {
  const what = describe(entry, habit)
  const link = 'min-h-11 px-2 text-sm font-medium text-brand-600 hover:underline'
  return (
    <li className="flex flex-wrap items-center gap-x-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{what}</p>
        {entry.note && <p className="truncate text-sm text-slate-500 italic">{entry.note}</p>}
      </div>
      {onEditValue && entry.kind === 'done' && (
        <button
          type="button"
          onClick={onEditValue}
          className={link}
          aria-label={`Corrigir ${what}`}
        >
          Corrigir
        </button>
      )}
      <button type="button" onClick={onEditNote} className={link} aria-label={`Nota de ${what}`}>
        Nota
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="min-h-11 px-2 text-sm font-medium text-red-700 hover:underline"
        aria-label={`Apagar ${what}`}
      >
        Apagar
      </button>
    </li>
  )
}
