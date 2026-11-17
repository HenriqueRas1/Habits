import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { showToast } from '../components/ui/toastStore.ts'

type Snapshot = [QueryKey, unknown][]

/**
 * Aplica uma mudança otimista em todas as consultas que começam com `key`.
 * Devolve o que precisa para desfazer se a gravação falhar.
 */
export async function applyOptimistic<T>(
  client: QueryClient,
  key: QueryKey,
  update: (old: T, key: QueryKey) => T,
): Promise<{ snapshot: Snapshot }> {
  await client.cancelQueries({ queryKey: key })
  const snapshot = client.getQueriesData({ queryKey: key })
  for (const [queryKey, old] of snapshot) {
    if (old !== undefined) client.setQueryData<T>(queryKey, update(old as T, queryKey))
  }
  return { snapshot }
}

/** Desfaz a mudança otimista e avisa o usuário. */
export function rollback(
  client: QueryClient,
  context: { snapshot: Snapshot } | undefined,
  message: string,
) {
  context?.snapshot.forEach(([key, data]) => client.setQueryData(key, data))
  showToast(message)
}
