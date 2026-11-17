import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from './supabase.ts'

const TABLE_KEYS = {
  habits: ['habits'],
  entries: ['entries'],
  active_timers: ['timers'],
  tasks: ['tasks'],
} as const

type Table = keyof typeof TABLE_KEYS

/**
 * Uma única assinatura Realtime por sessão. Os eventos só invalidam as query keys;
 * o TanStack Query busca os dados de novo. Nunca editamos o cache a partir do evento.
 */
export function subscribeToChanges(userId: string, client: QueryClient): () => void {
  const invalidate = (table: Table) =>
    void client.invalidateQueries({ queryKey: TABLE_KEYS[table] })
  const channel = supabase.channel(`sync-${userId}`)

  for (const table of Object.keys(TABLE_KEYS) as Table[]) {
    for (const event of ['INSERT', 'UPDATE'] as const) {
      channel.on(
        'postgres_changes',
        { event, schema: 'public', table, filter: `user_id=eq.${userId}` },
        () => invalidate(table),
      )
    }
    // O Supabase não filtra DELETE por coluna; o evento só traz o id, então basta invalidar.
    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table }, () =>
      invalidate(table),
    )
  }

  let connectedOnce = false
  channel.subscribe((status) => {
    if (status !== 'SUBSCRIBED') return
    // Reconectou depois de cair: pode ter perdido eventos, então recarrega tudo.
    if (connectedOnce) void client.invalidateQueries()
    connectedOnce = true
  })

  return () => {
    void supabase.removeChannel(channel)
  }
}

/** Liga a sincronização enquanto houver usuário logado. */
export function useRealtimeSync(userId: string | undefined) {
  const client = useQueryClient()
  useEffect(() => {
    if (!userId) return
    return subscribeToChanges(userId, client)
  }, [userId, client])
}
