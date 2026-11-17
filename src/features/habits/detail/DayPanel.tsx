import { useState } from 'react'
import { Button } from '../../../components/ui/Button.tsx'
import { PromptDialog } from '../../../components/ui/PromptDialog.tsx'
import { periodOf, type WeekStart } from '../../../domain/periods.ts'
import { formatDayLabel } from '../../../lib/dates.ts'
import type { Entry, Habit } from '../../../types/domain.ts'
import { useEntryAction } from '../../entries/hooks.ts'
import { EntryRow } from './EntryRow.tsx'

const SKIP_LABEL = { day: 'Pular este dia', week: 'Pular esta semana', month: 'Pular este mês' }

type Dialog = { kind: 'add' } | { kind: 'skip' } | { kind: 'value' | 'note'; entry: Entry } | null

type Props = {
  habit: Habit
  date: string
  entries: Entry[]
  weekStart: WeekStart
  userId: string
}

/** Registros de um dia, com tudo editável: valor, nota, apagar, adicionar e pular. */
export function DayPanel({ habit, date, entries, weekStart, userId }: Props) {
  const { mutate } = useEntryAction(userId)
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)

  const ofDay = entries
    .filter((e) => e.entry_date === date && e.kind !== 'relapse')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const period = periodOf(date, habit.goal_period, weekStart)
  const skip = entries.find(
    (e) => e.kind === 'skip' && e.entry_date >= period.start && e.entry_date <= period.end,
  )
  const numeric = habit.goal_kind !== 'check'
  const hasDone = ofDay.some((e) => e.kind === 'done')
  const unit = habit.goal_kind === 'duration' ? 'minutos' : habit.goal_unit || 'vezes'

  const add = (kind: 'done' | 'skip', value: number, note: string | null = null) =>
    mutate({
      type: 'add',
      entry: { id: crypto.randomUUID(), habit_id: habit.id, entry_date: date, kind, value, note },
    })

  return (
    <section
      aria-label="Registros do dia"
      className="bg-surface mt-6 rounded-2xl border border-slate-200 p-4"
    >
      <h2 className="font-semibold first-letter:uppercase">{formatDayLabel(date)}</h2>

      {ofDay.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nenhum registro neste dia.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {ofDay.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              habit={habit}
              onEditValue={numeric ? () => setDialog({ kind: 'value', entry }) : undefined}
              onEditNote={() => setDialog({ kind: 'note', entry })}
              onDelete={() => mutate({ type: 'delete', ids: [entry.id] })}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(numeric || !hasDone) && (
          <Button onClick={() => (numeric ? setDialog({ kind: 'add' }) : add('done', 1))}>
            {numeric ? 'Adicionar registro' : 'Marcar como feito'}
          </Button>
        )}
        {skip ? (
          <Button variant="secondary" onClick={() => mutate({ type: 'delete', ids: [skip.id] })}>
            Desfazer pulo
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setDialog({ kind: 'skip' })}>
            {SKIP_LABEL[habit.goal_period]}
          </Button>
        )}
      </div>

      {dialog?.kind === 'add' && (
        <PromptDialog
          title={habit.name}
          label={`Quantos ${unit}?`}
          type="number"
          min={1}
          confirmLabel="Adicionar"
          onConfirm={(v) => add('done', Number(v))}
          onClose={close}
        />
      )}
      {dialog?.kind === 'skip' && (
        <PromptDialog
          title={SKIP_LABEL[habit.goal_period]}
          label="Motivo (opcional)"
          placeholder="Ex.: doente, viagem"
          confirmLabel="Pular"
          onConfirm={(note) => add('skip', 0, note || null)}
          onClose={close}
        />
      )}
      {dialog?.kind === 'value' && (
        <PromptDialog
          title={habit.name}
          label={`Quantos ${unit}?`}
          type="number"
          min={1}
          initialValue={String(dialog.entry.value)}
          confirmLabel="Salvar"
          onConfirm={(v) =>
            mutate({ type: 'update', id: dialog.entry.id, patch: { value: Number(v) } })
          }
          onClose={close}
        />
      )}
      {dialog?.kind === 'note' && (
        <PromptDialog
          title={`Nota em ${habit.name}`}
          label="Nota"
          initialValue={dialog.entry.note ?? ''}
          confirmLabel="Salvar"
          onConfirm={(note) =>
            mutate({ type: 'update', id: dialog.entry.id, patch: { note: note || null } })
          }
          onClose={close}
        />
      )}
    </section>
  )
}
