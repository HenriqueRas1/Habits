import { Link, useParams } from 'react-router'
import { PageHeader } from '../../../components/layout/PageHeader.tsx'
import { Alert } from '../../../components/ui/Alert.tsx'
import { FullScreenSpinner } from '../../../components/ui/FullScreenSpinner.tsx'
import { useSession } from '../../auth/sessionContext.ts'
import { useHabitEntries } from '../../entries/hooks.ts'
import { useToday, useWeekStart } from '../../profile/hooks.ts'
import { QuitDetail } from '../../quit/QuitDetail.tsx'
import { goalText } from '../goalText.ts'
import { useHabit } from '../hooks.ts'
import { BuildDetail } from './BuildDetail.tsx'

/** /habits/:id — tela inteira no celular. */
export function HabitDetailPage() {
  const { id = '' } = useParams()
  return <HabitDetail id={id} />
}

/**
 * Cabeçalho do hábito e o detalhe do tipo dele (construir ou parar).
 * Usado na tela /habits/:id e no painel lateral da Hoje no PC.
 */
export function HabitDetail({ id, onClose }: { id: string; onClose?: () => void }) {
  const today = useToday()
  const weekStart = useWeekStart()
  const { session } = useSession()
  const { data: habit, isPending } = useHabit(id)
  const entries = useHabitEntries(id, habit?.start_date ?? today, today, Boolean(habit))

  if (isPending || (habit && entries.isPending)) return <FullScreenSpinner />
  if (!habit) {
    return (
      <>
        <PageHeader title="Hábito não encontrado" />
        <Link to="/" className="text-brand-600 hover:underline">
          Voltar para Hoje
        </Link>
      </>
    )
  }
  if (entries.isError) {
    return <Alert tone="error">Não foi possível carregar o histórico. Verifique a internet.</Alert>
  }

  const list = entries.data ?? []

  return (
    <>
      <header className="mb-6 flex items-start gap-3">
        <span className="text-4xl" aria-hidden>
          {habit.icon}
        </span>
        <div className="min-w-0 flex-1">
          {onClose ? (
            <h2 className="truncate text-2xl font-bold tracking-tight">{habit.name}</h2>
          ) : (
            <h1 className="truncate text-2xl font-bold tracking-tight">{habit.name}</h1>
          )}
          <p className="mt-1 text-sm text-slate-500">
            {habit.type === 'quit' ? 'Hábito para parar' : goalText(habit)}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhe"
            className="flex size-11 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        )}
        <Link
          to={`/habits/${habit.id}/edit`}
          className="bg-surface flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Editar
        </Link>
      </header>

      {habit.type === 'quit' ? (
        <QuitDetail habit={habit} entries={list} today={today} />
      ) : (
        <BuildDetail
          habit={habit}
          entries={list}
          today={today}
          weekStart={weekStart}
          userId={session?.user.id ?? ''}
        />
      )}
    </>
  )
}
