import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays } from '../../lib/dates.ts'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import type { Entry } from '../../types/domain.ts'
import { createEntry, deleteEntries, fetchEntries } from './api.ts'

/** Quantos dias de histórico a tela Hoje carrega (para o streak). */
export const HISTORY_DAYS = 400

export const entriesKey = ['entries'] as const

export function entriesRangeKey(habitId: string, from: string, to: string) {
  return ['entries', habitId, from, to] as const
}

/** Registros de todos os hábitos de (hoje − 400 dias) até hoje. */
export function useRecentEntries(today: string) {
  const from = addDays(today, -HISTORY_DAYS)
  return useQuery({
    queryKey: entriesRangeKey('all', from, today),
    queryFn: () => fetchEntries(from, today),
  })
}

type ToggleInput = { habitId: string; date: string; userId: string; doneIds: string[] }

/**
 * Check diário: se já há registro "done" no dia, apaga; senão, cria um com id do cliente.
 * A tela muda na hora (otimista) e volta atrás se a gravação falhar.
 */
export function useToggleCheck() {
  const client = useQueryClient()
  return useMutation({
    // Roda as gravações em fila: um toque duplo rápido não chega fora de ordem no banco.
    scope: { id: 'toggle-check' },
    mutationFn: async ({ input, newId }: { input: ToggleInput; newId: string }) => {
      if (input.doneIds.length > 0) await deleteEntries(input.doneIds)
      else await createEntry({ id: newId, habit_id: input.habitId, entry_date: input.date })
    },
    onMutate: ({ input, newId }) =>
      applyOptimistic<Entry[]>(client, entriesKey, (old) => {
        if (input.doneIds.length > 0) return old.filter((e) => !input.doneIds.includes(e.id))
        const now = new Date().toISOString()
        const entry: Entry = {
          id: newId,
          habit_id: input.habitId,
          user_id: input.userId,
          entry_date: input.date,
          kind: 'done',
          value: 1,
          source: 'manual',
          note: null,
          started_at: null,
          ended_at: null,
          created_at: now,
          updated_at: now,
        }
        return [...old, entry]
      }),
    onError: (_e, _v, ctx) =>
      rollback(client, ctx, 'Não foi possível salvar o check. Tente de novo.'),
    onSettled: () => client.invalidateQueries({ queryKey: entriesKey }),
  })
}
