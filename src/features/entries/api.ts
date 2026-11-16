import { supabase } from '../../lib/supabase.ts'
import type { Entry, EntryInsert } from '../../types/domain.ts'

export type NewEntry = EntryInsert & { id: string }

const PAGE_SIZE = 1000

/**
 * Registros entre duas datas (inclusive), de todos os hábitos ou de um só.
 * Busca em páginas, porque o Supabase devolve no máximo 1000 linhas por consulta.
 */
export async function fetchEntries(from: string, to: string, habitId?: string): Promise<Entry[]> {
  const rows: Entry[] = []
  for (let page = 0; ; page += 1) {
    let query = supabase
      .from('entries')
      .select('*')
      .gte('entry_date', from)
      .lte('entry_date', to)
      .order('entry_date')
      .order('id')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    if (habitId) query = query.eq('habit_id', habitId)

    const { data, error } = await query
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export async function createEntry(entry: NewEntry): Promise<void> {
  const { error } = await supabase.from('entries').insert(entry)
  if (error) throw error
}

export async function deleteEntries(ids: string[]): Promise<void> {
  const { error } = await supabase.from('entries').delete().in('id', ids)
  if (error) throw error
}
