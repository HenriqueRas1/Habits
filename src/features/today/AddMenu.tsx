import { useState } from 'react'
import { Link } from 'react-router'
import { PromptDialog } from '../../components/ui/PromptDialog.tsx'

type Props = {
  /** Dia que está aberto na Hoje: a tarefa nova vai para ele. */
  dayLabel: string
  onAddTask: (title: string) => void
}

/** Botão "+" no topo da Hoje: escolhe entre criar um Hábito ou uma Tarefa. */
export function AddMenu({ dayLabel, onAddTask }: Props) {
  const [open, setOpen] = useState(false)
  const [askingTask, setAskingTask] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Novo hábito ou tarefa"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="bg-brand-600 hover:bg-brand-700 flex min-h-11 w-20 items-center justify-center rounded-lg text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="absolute top-full right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            <li role="none">
              <Link
                role="menuitem"
                to="/habits/new"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span aria-hidden>🔁</span>
                <span>
                  <span className="block font-medium">Hábito</span>
                  <span className="block text-xs text-slate-500">Algo para repetir</span>
                </span>
              </Link>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  setAskingTask(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span aria-hidden>📝</span>
                <span>
                  <span className="block font-medium">Tarefa</span>
                  <span className="block text-xs text-slate-500">Só para {dayLabel}</span>
                </span>
              </button>
            </li>
          </ul>
        </>
      )}

      {askingTask && (
        <PromptDialog
          title={`Nova tarefa · ${dayLabel}`}
          label="Tarefa"
          placeholder="Ex.: pagar a conta de luz"
          confirmLabel="Adicionar"
          onConfirm={(title) => title && onAddTask(title.slice(0, 200))}
          onClose={() => setAskingTask(false)}
        />
      )}
    </div>
  )
}
