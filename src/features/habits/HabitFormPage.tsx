import { useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { useSession } from '../auth/sessionContext.ts'
import { useToday } from '../profile/hooks.ts'
import { HabitForm } from './HabitForm.tsx'
import { fromHabit, newHabitDefaults, toHabitFields, type HabitFormValues } from './habitSchema.ts'
import { useArchiveHabit, useCreateHabit, useHabit, useHabits, useUpdateHabit } from './hooks.ts'

/** /habits/new e /habits/:id/edit */
export function HabitFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const today = useToday()
  const { session } = useSession()
  const habits = useHabits()
  const { data: habit, isPending } = useHabit(id)
  const create = useCreateHabit(session?.user.id ?? '')
  const update = useUpdateHabit()
  const archive = useArchiveHabit()

  const goHome = () => void navigate('/', { replace: true })

  if (id && isPending) return <FullScreenSpinner />
  if (id && !habit) {
    return (
      <>
        <PageHeader title="Hábito não encontrado" />
        <Button onClick={goHome}>Voltar para Hoje</Button>
      </>
    )
  }

  const defaults = habit ? fromHabit(habit) : newHabitDefaults(params, today)

  function handleSubmit(values: HabitFormValues) {
    const fields = toHabitFields(values)
    if (habit) {
      update.mutate({ id: habit.id, patch: fields })
    } else {
      const maxOrder = Math.max(-1, ...(habits.data ?? []).map((h) => h.sort_order))
      create.mutate({ id: crypto.randomUUID(), ...fields, sort_order: maxOrder + 1 })
    }
    goHome()
  }

  function handleArchive() {
    if (!habit) return
    if (
      !window.confirm(
        `Arquivar "${habit.name}"? Ele sai da tela Hoje, mas o histórico fica guardado.`,
      )
    )
      return
    archive.mutate(habit.id)
    goHome()
  }

  return (
    <>
      <PageHeader title={habit ? 'Editar hábito' : 'Novo hábito'} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <HabitForm
          key={habit?.id ?? 'new'}
          today={today}
          defaultValues={defaults}
          submitLabel={habit ? 'Salvar' : 'Criar hábito'}
          onSubmit={handleSubmit}
          onCancel={() => void navigate(-1)}
        />
      </section>
      {habit && (
        <div className="mt-6 text-center">
          <Button variant="dangerLink" onClick={handleArchive}>
            Arquivar hábito
          </Button>
        </div>
      )}
    </>
  )
}
