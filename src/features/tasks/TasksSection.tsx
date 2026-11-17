import { useState } from 'react'
import { PromptDialog } from '../../components/ui/PromptDialog.tsx'
import type { Task } from '../../types/domain.ts'
import { useTaskAction, useTasks } from './hooks.ts'
import { TaskCard } from './TaskCard.tsx'

type Props = { date: string; userId: string }

/** Tarefas do dia aberto na Hoje, em cartões. Feitas ficam riscadas. */
export function TasksSection({ date, userId }: Props) {
  const tasks = useTasks(date)
  const { mutate } = useTaskAction(userId)
  const [editing, setEditing] = useState<Task | null>(null)

  if (!tasks.data || tasks.data.length === 0) return null

  return (
    <section aria-labelledby="tasks-heading" className="mb-8">
      <h2 id="tasks-heading" className="mb-3 text-lg font-semibold">
        Tarefas
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tasks.data.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() =>
              mutate({
                type: 'update',
                id: task.id,
                patch: { done_at: task.done_at ? null : new Date().toISOString() },
              })
            }
            onEdit={() => setEditing(task)}
            onDelete={() =>
              window.confirm(`Apagar a tarefa "${task.title}"?`) &&
              mutate({ type: 'delete', id: task.id })
            }
          />
        ))}
      </ul>

      {editing && (
        <PromptDialog
          title="Editar tarefa"
          label="Tarefa"
          initialValue={editing.title}
          confirmLabel="Salvar"
          onConfirm={(title) =>
            title &&
            mutate({ type: 'update', id: editing.id, patch: { title: title.slice(0, 200) } })
          }
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}
