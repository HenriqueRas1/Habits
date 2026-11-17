import { useArchivedHabits, useUnarchiveHabit } from '../habits/hooks.ts'

/** Hábitos arquivados, com "Desarquivar" (volta para a Hoje com todo o histórico). */
export function ArchivedCard() {
  const archived = useArchivedHabits()
  const unarchive = useUnarchiveHabit()
  const list = archived.data ?? []

  return (
    <section
      aria-label="Hábitos arquivados"
      className="bg-surface mb-6 rounded-2xl border border-slate-200 p-5"
    >
      <h2 className="text-sm font-semibold text-slate-500">Hábitos arquivados</h2>
      {archived.isPending ? (
        <p className="mt-2 text-sm text-slate-500">Carregando…</p>
      ) : list.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nenhum hábito arquivado.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {list.map((habit) => (
            <li key={habit.id} className="flex items-center gap-3 py-2">
              <span aria-hidden className="text-xl">
                {habit.icon}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{habit.name}</span>
              <button
                type="button"
                onClick={() => unarchive.mutate(habit.id)}
                className="text-brand-600 min-h-11 px-2 text-sm font-medium hover:underline"
                aria-label={`Desarquivar ${habit.name}`}
              >
                Desarquivar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
