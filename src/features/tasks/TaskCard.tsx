import { useState } from 'react'
import type { Task } from '../../types/domain.ts'
import { CardFill } from '../../components/ui/CardFill.tsx'
import { readableTextOn, withAlpha } from '../../lib/color.ts'

/** Tarefas usam a cor do app (índigo): fraca enquanto pendente, cheia quando feita. */
const TASK_COLOR = '#6366f1'

type Props = {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

/** Cartão de tarefa, no mesmo formato do cartão de hábito: título, menu ⋯ e check quadrado. */
export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const done = task.done_at !== null
  const [menu, setMenu] = useState(false)
  const choose = (fn: () => void) => () => {
    setMenu(false)
    fn()
  }

  return (
    <li
      className="bg-surface relative flex min-h-16 items-center gap-3 rounded-full py-2 pr-2 pl-2 transition-colors"
      style={done ? { color: readableTextOn(TASK_COLOR) } : undefined}
    >
      <CardFill base={withAlpha(TASK_COLOR, 0.18)} fill={TASK_COLOR} ratio={done ? 1 : 0} />
      <span
        aria-hidden
        className="bg-surface/70 relative flex size-11 shrink-0 items-center justify-center rounded-full text-xl"
      >
        📝
      </span>
      <span
        className={`relative min-w-0 flex-1 truncate font-semibold ${done ? 'line-through opacity-80' : ''}`}
      >
        {task.title}
      </span>

      <div className="relative">
        <button
          type="button"
          aria-label={`Mais opções da tarefa ${task.title}`}
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
          className="flex size-11 items-center justify-center rounded-full text-xl opacity-60 hover:bg-black/10"
        >
          ⋯
        </button>
        {menu && (
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenu(false)}
            />
            <ul
              role="menu"
              className="bg-surface absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 py-1 text-slate-900 shadow-lg"
            >
              <MenuItem onClick={choose(onEdit)}>Editar tarefa</MenuItem>
              <MenuItem onClick={choose(onDelete)} danger>
                Apagar tarefa
              </MenuItem>
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        aria-pressed={done}
        aria-label={`${task.title}: ${done ? 'feita, toque para desmarcar' : 'marcar como feita'}`}
        onClick={onToggle}
        className={`relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
          done ? 'border-current' : 'border-brand-500/60 bg-surface/70'
        }`}
      >
        {done && (
          <svg
            viewBox="0 0 24 24"
            className="animate-pop size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden
          >
            <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </li>
  )
}

function MenuItem(props: { onClick: () => void; danger?: boolean; children: string }) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={props.onClick}
        className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${
          props.danger ? 'text-red-700' : ''
        }`}
      >
        {props.children}
      </button>
    </li>
  )
}
