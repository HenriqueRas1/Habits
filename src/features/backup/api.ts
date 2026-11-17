import { supabase } from '../../lib/supabase.ts'
import type { Entry, Habit, Task } from '../../types/domain.ts'
import type { Backup } from './format.ts'

const PAGE = 1000
const CHUNK = 500

/** Lê uma tabela inteira em páginas (o Supabase devolve no máximo 1000 linhas por vez). */
async function readAll<T>(table: 'habits' | 'entries' | 'tasks'): Promise<T[]> {
  const rows: T[] = []
  for (let page = 0; ; page += 1) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id')
      .range(page * PAGE, (page + 1) * PAGE - 1)
    if (error) throw error
    rows.push(...(data as T[]))
    if (data.length < PAGE) return rows
  }
}

/** Tudo do usuário logado: hábitos (inclusive arquivados), registros e tarefas. */
export async function fetchEverything() {
  const [habits, entries, tasks] = await Promise.all([
    readAll<Habit>('habits'),
    readAll<Entry>('entries'),
    readAll<Task>('tasks'),
  ])
  return { habits, entries, tasks }
}

async function upsertInChunks(
  table: 'habits' | 'entries' | 'tasks',
  rows: Record<string, unknown>[],
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase
      .from(table)
      // Tipos gerados não aceitam união dinâmica de tabelas; o formato já foi validado pelo Zod.
      .upsert(rows.slice(i, i + CHUNK) as never, { onConflict: 'id' })
    if (error) throw error
  }
}

/**
 * Restaura o backup pelo id de cada linha: o que foi apagado volta e o que existe fica igual
 * ao backup. Nada que não está no arquivo é apagado. Hábitos vão antes dos registros (chave).
 */
export async function restoreBackup(backup: Backup, userId: string): Promise<void> {
  const own = <T extends object>(rows: T[]) => rows.map((r) => ({ ...r, user_id: userId }))
  await upsertInChunks('habits', own(backup.habits))
  await upsertInChunks('entries', own(backup.entries))
  await upsertInChunks('tasks', own(backup.tasks))
  const { error } = await supabase.from('profiles').update(backup.profile).eq('id', userId)
  if (error) throw error
}
