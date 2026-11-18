import { dayTone, type Completion, type DayTone } from '../../domain/calendar.ts'
import { formatDayLabel } from '../../lib/dates.ts'

/** Cabeçalho (número do dia) e borda de cada cor. */
const TONE: Record<DayTone, { head: string; border: string }> = {
  all: { head: 'bg-green-600 text-white', border: 'border-green-600' },
  most: {
    head: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    border: 'border-green-300 dark:border-green-800',
  },
  few: {
    head: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
    border: 'border-red-300 dark:border-red-800',
  },
  none: { head: 'bg-red-500 text-white', border: 'border-red-500' },
  empty: { head: 'bg-slate-100 text-slate-500', border: 'border-slate-200' },
}

type Props = {
  date: string
  completion: Completion
  isToday: boolean
  /** Futuro: mostra só quantos hábitos estão previstos. */
  future: boolean
  disabled: boolean
  onOpen: (date: string) => void
}

/**
 * Um dia do calendário geral: número no topo colorido pelo resultado,
 * e embaixo quantos ficaram sem fazer (✕) e quantos foram feitos (✓).
 */
export function DayTile({ date, completion, isToday, future, disabled, onOpen }: Props) {
  const { done, total, others } = completion
  const tone = future ? 'empty' : dayTone(completion)
  const style = TONE[tone]
  const missing = total - done

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(date)}
      aria-label={
        future
          ? `${formatDayLabel(date)}: ${total} hábitos previstos`
          : `${formatDayLabel(date)}: ${done} de ${total} hábitos feitos`
      }
      className={`bg-surface relative flex w-full flex-col overflow-hidden rounded-lg border-2 text-left transition-transform active:scale-95 disabled:cursor-default disabled:active:scale-100 ${future ? '' : 'disabled:opacity-40'} ${style.border} ${
        isToday ? 'ring-brand-500 ring-2 ring-offset-1' : ''
      }`}
    >
      <span
        className={`py-0.5 text-center text-sm font-bold tabular-nums ${style.head} ${isToday ? 'italic' : ''}`}
      >
        {Number(date.slice(8))}
      </span>
      <span className="flex min-h-9 flex-col justify-center px-1.5 py-1 text-[11px] leading-tight font-medium tabular-nums">
        {future ? (
          total > 0 && <span className="text-slate-400">– {total}</span>
        ) : total > 0 ? (
          <>
            <span className="text-red-600 dark:text-red-400">✕ {missing}</span>
            <span className="text-green-700 dark:text-green-400">✓ {done}</span>
          </>
        ) : null}
      </span>
      {others > 0 && (
        <span
          aria-hidden
          className="bg-brand-500 absolute right-1 bottom-1 size-1.5 rounded-full"
        />
      )}
    </button>
  )
}
