import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import type { Task } from '../../types/domain.ts'
import { createTask, deleteTask, fetchTasks, updateTask } from './api.ts'

export const tasksKey = ['tasks'] as const

export function tasksDayKey(date: string) {
  return ['tasks', date] as const
}

export function useTasks(date: string) {
  return useQuery({ queryKey: tasksDayKey(date), queryFn: () => fetchTasks(date) })
}

export type TaskAction =
  | { type: 'add'; id: string; date: string; title: string; sortOrder: number }
  | { type: 'update'; id: string; patch: { title?: string; done_at?: string | null } }
  | { type: 'delete'; id: string }

async function run(action: TaskAction) {
  if (action.type === 'add') {
    await createTask({
      id: action.id,
      task_date: action.date,
      title: action.title,
      sort_order: action.sortOrder,
    })
  } else if (action.type === 'update') {
    await updateTask(action.id, action.patch)
  } else {
    await deleteTask(action.id)
  }
}

function toOptimisticTask(action: Extract<TaskAction, { type: 'add' }>, userId: string): Task {
  const now = new Date().toISOString()
  return {
    id: action.id,
    user_id: userId,
    task_date: action.date,
    title: action.title,
    done_at: null,
    sort_order: action.sortOrder,
    created_at: now,
    updated_at: now,
  }
}

/** Criar, marcar, renomear e apagar tarefas: muda a tela na hora e volta atrás se falhar. */
export function useTaskAction(userId: string) {
  const client = useQueryClient()
  return useMutation({
    scope: { id: 'tasks' },
    mutationFn: (action: TaskAction) => run(action),
    onMutate: (action) =>
      applyOptimistic<Task[]>(client, tasksKey, (old, key) => {
        if (action.type === 'add') {
          return key[1] === action.date ? [...old, toOptimisticTask(action, userId)] : old
        }
        if (action.type === 'delete') return old.filter((t) => t.id !== action.id)
        return old.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t))
      }),
    onError: (_e, _v, ctx) =>
      rollback(client, ctx, 'Não foi possível salvar a tarefa. Tente de novo.'),
    onSettled: () => client.invalidateQueries({ queryKey: tasksKey }),
  })
}

/** Cria uma tarefa no dia informado, no fim da lista daquele dia. */
export function useAddTask(date: string, userId: string) {
  const tasks = useTasks(date)
  const { mutate } = useTaskAction(userId)
  return (title: string) =>
    mutate({
      type: 'add',
      id: crypto.randomUUID(),
      date,
      title,
      sortOrder: Math.max(-1, ...(tasks.data ?? []).map((t) => t.sort_order)) + 1,
    })
}
