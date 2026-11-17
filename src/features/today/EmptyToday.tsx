import { Link } from 'react-router'

/** Sugestões do primeiro acesso; os parâmetros preenchem o formulário de hábito novo. */
const suggestions = [
  { name: 'Beber água', icon: '💧', kind: 'count', target: 8, unit: 'copos', period: 'day' },
  { name: 'Ler 20 min', icon: '📚', kind: 'duration', target: 20, period: 'day' },
  { name: 'Academia 3x/semana', icon: '🏋️', kind: 'check', target: 3, period: 'week' },
  { name: 'Meditar', icon: '🧘', kind: 'check', target: 1, period: 'day' },
]

function suggestionUrl({ name, icon, kind, target, period, ...rest }: (typeof suggestions)[0]) {
  const params = new URLSearchParams({ name, icon, kind, target: String(target), period })
  if ('unit' in rest && rest.unit) params.set('unit', rest.unit)
  return `/habits/new?${params.toString()}`
}

export function EmptyToday() {
  return (
    <section className="bg-surface rounded-2xl border border-dashed border-slate-300 p-6 text-center">
      <p className="text-4xl" aria-hidden>
        🌱
      </p>
      <h2 className="mt-2 text-lg font-semibold">Nenhum hábito ainda</h2>
      <p className="mt-1 text-sm text-slate-500">Comece com uma sugestão ou crie o seu.</p>

      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <li key={s.name}>
            <Link
              to={suggestionUrl(s)}
              className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50"
            >
              <span aria-hidden>{s.icon}</span>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/habits/new"
        className="bg-brand-600 hover:bg-brand-700 mt-5 inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-white"
      >
        Criar hábito
      </Link>
    </section>
  )
}
