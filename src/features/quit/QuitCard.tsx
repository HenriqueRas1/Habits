import { useState } from 'react'
import { Link } from 'react-router'
import { useHabitLink } from '../today/useHabitLink.ts'
import { CardFill } from '../../components/ui/CardFill.tsx'
import { withAlpha } from '../../lib/color.ts'
import { PromptDialog } from '../../components/ui/PromptDialog.tsx'
import { formatQuitDuration, milestones } from '../../domain/quit.ts'
import { useNow } from '../../lib/useNow.ts'
import type { Entry, Habit } from '../../types/domain.ts'
import { useSession } from '../auth/sessionContext.ts'
import { useEntryAction } from '../entries/hooks.ts'
import { useTimezone } from '../profile/hooks.ts'
import { statsFor } from './relapses.ts'

const DAY = 24 * 60 * 60 * 1000

type Props = { habit: Habit; entries: Entry[]; today: string }

/** Cartão de hábito de parar: contador ao vivo, recorde, próximo marco e "Registrar recaída". */
export function QuitCard({ habit, entries, today }: Props) {
  const now = useNow(60_000)
  const habitLink = useHabitLink()
  const timezone = useTimezone()
  const { session } = useSession()
  const { mutate } = useEntryAction(session?.user.id ?? '')
  const [asking, setAsking] = useState(false)

  const stats = statsFor(habit, entries, timezone, now)
  const { reached, next, daysToNext } = milestones(stats.currentMs)
  const ratio = next ? Math.min(1, stats.currentMs / (next * DAY)) : 1
  const record = formatQuitDuration(stats.recordMs).split(',')[0]
  const goal =
    next === null
      ? '🏆 Todos os marcos!'
      : `faltam ${daysToNext} ${daysToNext === 1 ? 'dia' : 'dias'} para ${next}`

  return (
    <li className="bg-surface relative flex min-h-16 items-center gap-3 rounded-full py-2 pr-2 pl-2">
      <CardFill
        base={withAlpha(habit.color, 0.18)}
        fill={withAlpha(habit.color, 0.45)}
        ratio={ratio}
      />
      <span
        aria-hidden
        className="bg-surface/70 relative flex size-11 shrink-0 items-center justify-center rounded-full text-xl"
      >
        {habit.icon}
      </span>

      <Link to={habitLink(habit.id)} className="relative min-w-0 flex-1 py-1">
        <span className="block truncate font-semibold">{habit.name}</span>
        <span className="block truncate text-sm text-slate-700" aria-label="Tempo sem">
          <strong>{formatQuitDuration(stats.currentMs)}</strong> sem
        </span>
        <span className="block truncate text-xs text-slate-600">
          {reached ? `🎉 ${reached} ${reached === 1 ? 'dia' : 'dias'} · ` : ''}
          {goal} · recorde {record}
        </span>
      </Link>

      <button
        type="button"
        onClick={() => setAsking(true)}
        aria-label={`${habit.name}: registrar recaída`}
        className="bg-surface/70 relative min-h-10 shrink-0 rounded-full border-2 px-3 text-sm font-semibold text-slate-700 active:scale-95"
        style={{ borderColor: `${habit.color}99` }}
      >
        Recaída
      </button>

      {asking && (
        <PromptDialog
          title={`Registrar recaída em ${habit.name}?`}
          label="Nota (opcional)"
          placeholder="O que aconteceu?"
          confirmLabel="Registrar recaída"
          onConfirm={(note) =>
            mutate({
              type: 'add',
              entry: {
                id: crypto.randomUUID(),
                habit_id: habit.id,
                entry_date: today,
                kind: 'relapse',
                value: 1,
                note: note || null,
                started_at: new Date().toISOString(),
              },
            })
          }
          onClose={() => setAsking(false)}
        />
      )}
    </li>
  )
}
