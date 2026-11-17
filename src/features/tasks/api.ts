import { supabase } from '../../lib/supabase.ts'
import type { Task, TaskInsert, TaskUpdate } from '../../types/domain.ts'

export type NewTask = TaskInsert & { id: string }

/** Tarefas de um dia, na ordem em que foram criadas. */
export async function fetchTasks(date: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('task_date', date)
    .order('sort_order')
    .order('created_at')
  if (error) throw error
  return data
}

export async function createTask(task: NewTask): Promise<void> {
  const { error } = await supabase.from('tasks').insert(task)
  if (error) throw error
}

export async function updateTask(id: string, patch: TaskUpdate): Promise<void> {
  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
