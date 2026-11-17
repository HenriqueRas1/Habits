import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { DESKTOP, useMediaQuery } from '../../lib/useMediaQuery.ts'
import { HabitDetail } from '../habits/detail/HabitDetailPage.tsx'

/**
 * No PC, o detalhe do hábito abre num painel à direita da Hoje (?habit=id), sem sair dela.
 * No celular e no tablet, o cartão leva para a tela /habits/:id.
 */
export function WithDetailPanel({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const desktop = useMediaQuery(DESKTOP)
  const habitId = params.get('habit')

  if (!desktop || !habitId) return <>{children}</>

  const close = () =>
    setParams(
      (prev) => {
        prev.delete('habit')
        prev.delete('month')
        return prev
      },
      { replace: true },
    )

  return (
    <div data-wide className="grid grid-cols-[minmax(0,1fr)_26rem] items-start gap-8">
      <div className="min-w-0">{children}</div>
      <aside
        aria-label="Detalhe do hábito"
        className="sticky top-10 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <HabitDetail key={habitId} id={habitId} onClose={close} />
      </aside>
    </div>
  )
}
