import { supabase } from '../../lib/supabase.ts'
import type { Habit, HabitInsert, HabitUpdate } from '../../types/domain.ts'

export type NewHabit = HabitInsert & { id: string }

/** Hábitos ativos (não arquivados), na ordem escolhida pelo usuário. */
export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .is('archived_at', null)
    .order('sort_order')
    .order('created_at')
  if (error) throw error
  return data
}

export async function createHabit(habit: NewHabit): Promise<void> {
  const { error } = await supabase.from('habits').insert(habit)
  if (error) throw error
}

export async function updateHabit(id: string, patch: HabitUpdate): Promise<void> {
  const { error } = await supabase.from('habits').update(patch).eq('id', id)
  if (error) throw error
}

export async function archiveHabit(id: string, archivedAt: string): Promise<void> {
  await updateHabit(id, { archived_at: archivedAt })
}

/** Grava a nova ordem: sort_order = posição na lista. */
export async function reorderHabits(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('habits').update({ sort_order: index }).eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

/** Apaga o hábito de vez. Os registros e o timer dele são apagados junto (on delete cascade). */
export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw error
}
