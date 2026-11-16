import { useState } from 'react'
import { Link } from 'react-router'
import { PromptDialog } from '../../components/ui/PromptDialog.tsx'
import type { HabitDay } from './habitDay.ts'
import type { DayActions } from './useDayActions.ts'

const SKIP_LABEL = { day: 'Pular este dia', week: 'Pular esta semana', month: 'Pular este mês' }

type Dialog = 'skip' | 'note' | null

/** Menu ⋯ do cartão: pular o período, nota no registro, editar. */
export function HabitMenu({ day, actions }: { day: HabitDay; actions: DayActions }) {
  const { habit } = day
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)

  const choose = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Mais opções de ${habit.name}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100"
      >
        ⋯
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {day.skipEntry ? (
              <MenuItem onClick={choose(actions.unskip)}>Desfazer pulo</MenuItem>
            ) : (
              <MenuItem onClick={choose(() => setDialog('skip'))}>
                {SKIP_LABEL[habit.goal_period]}
              </MenuItem>
            )}
            {day.noteEntry && (
              <MenuItem onClick={choose(() => setDialog('note'))}>
                {day.noteEntry.note ? 'Editar nota' : 'Adicionar nota'}
              </MenuItem>
            )}
            <li role="none">
              <Link
                role="menuitem"
                to={`/habits/${habit.id}/edit`}
                className="block px-4 py-3 text-sm hover:bg-slate-50"
              >
                Editar hábito
              </Link>
            </li>
          </ul>
        </>
      )}

      {dialog === 'skip' && (
        <PromptDialog
          title={SKIP_LABEL[habit.goal_period]}
          label="Motivo (opcional)"
          placeholder="Ex.: doente, viagem"
          confirmLabel="Pular"
          onConfirm={actions.skip}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'note' && (
        <PromptDialog
          title={`Nota em ${habit.name}`}
          label="Nota"
          initialValue={day.noteEntry?.note ?? ''}
          confirmLabel="Salvar"
          onConfirm={actions.setNote}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

function MenuItem({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
      >
        {children}
      </button>
    </li>
  )
}
