import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { useSession } from '../auth/sessionContext.ts'
import { toDateTimeInput } from '../../lib/dates.ts'
import { useTimezone, useToday } from '../profile/hooks.ts'
import { HabitForm } from './HabitForm.tsx'
import { fromHabit, newHabitDefaults, toHabitFields, type HabitFormValues } from './habitSchema.ts'
import {
  useArchiveHabit,
  useCreateHabit,
  useDeleteHabit,
  useHabit,
  useHabits,
  useUpdateHabit,
} from './hooks.ts'

/** /habits/new e /habits/:id/edit */
export function HabitFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const today = useToday()
  const timezone = useTimezone()
  // "Agora" fixado ao abrir o formulário: padrão do "Sem desde" de hábitos de parar.
  const [nowInput] = useState(() => toDateTimeInput(new Date().toISOString(), timezone))
  const { session } = useSession()
  const habits = useHabits()
  const { data: habit, isPending } = useHabit(id)
  const create = useCreateHabit(session?.user.id ?? '')
  const update = useUpdateHabit()
  const archive = useArchiveHabit()
  const remove = useDeleteHabit()

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

  const defaults = habit ? fromHabit(habit, timezone) : newHabitDefaults(params, today, nowInput)

  function handleSubmit(values: HabitFormValues) {
    const fields = toHabitFields(values, timezone)
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

  function handleDelete() {
    if (!habit) return
    if (
      !window.confirm(
        `Apagar "${habit.name}" de vez? Todo o histórico dele também será apagado, e isso não pode ser desfeito. Se quiser só tirar da tela Hoje, use Arquivar.`,
      )
    )
      return
    remove.mutate(habit.id)
    goHome()
  }

  return (
    <>
      <PageHeader title={habit ? 'Editar hábito' : 'Novo hábito'} />
      <section className="bg-surface rounded-2xl border border-slate-200 p-5">
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
        <div className="mt-6 flex justify-center gap-6">
          <Button variant="dangerLink" onClick={handleArchive}>
            Arquivar hábito
          </Button>
          <Button variant="dangerLink" onClick={handleDelete}>
            Apagar hábito
          </Button>
        </div>
      )}
    </>
  )
}
