import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import type { Entry, EntryKind } from '../../types/domain.ts'
import { createEntry, deleteEntries, fetchEntries, updateEntry } from './api.ts'

export const entriesKey = ['entries'] as const

export function entriesRangeKey(habitId: string, from: string, to: string) {
  return ['entries', habitId, from, to] as const
}

/** Registros de todos os hábitos entre duas datas (a Hoje usa do início mais antigo até hoje). */
export function useAllEntries(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: entriesRangeKey('all', from, to),
    queryFn: () => fetchEntries(from, to),
    enabled,
  })
}

export type NewEntryFields = {
  id: string
  habit_id: string
  entry_date: string
  kind: EntryKind
  value: number
  note?: string | null
}

export type EntryAction =
  | { type: 'add'; entry: NewEntryFields }
  | { type: 'delete'; ids: string[] }
  | { type: 'note'; id: string; note: string | null }

function toOptimisticEntry(fields: NewEntryFields, userId: string): Entry {
  const now = new Date().toISOString()
  return {
    user_id: userId,
    source: 'manual',
    note: null,
    started_at: null,
    ended_at: null,
    created_at: now,
    updated_at: now,
    ...fields,
  }
}

async function run(action: EntryAction) {
  if (action.type === 'add') await createEntry(action.entry)
  else if (action.type === 'delete') await deleteEntries(action.ids)
  else await updateEntry(action.id, { note: action.note })
}

/**
 * Toda gravação de registro (check, +/−, pulo, nota) passa por aqui: muda a tela na hora,
 * grava com o id do cliente e volta atrás com aviso se falhar.
 */
export function useEntryAction(userId: string) {
  const client = useQueryClient()
  return useMutation({
    // Em fila: toques rápidos (+ + −) chegam ao banco na ordem em que foram feitos.
    scope: { id: 'entries' },
    mutationFn: (action: EntryAction) => run(action),
    onMutate: (action) =>
      applyOptimistic<Entry[]>(client, entriesKey, (old) => {
        if (action.type === 'add') return [...old, toOptimisticEntry(action.entry, userId)]
        if (action.type === 'delete') return old.filter((e) => !action.ids.includes(e.id))
        return old.map((e) => (e.id === action.id ? { ...e, note: action.note } : e))
      }),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível salvar. Tente de novo.'),
    onSettled: () => client.invalidateQueries({ queryKey: entriesKey }),
  })
}
