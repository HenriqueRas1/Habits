import { Link } from 'react-router'

const suggestions = [
  { name: 'Beber água', icon: '💧' },
  { name: 'Ler 20 min', icon: '📚' },
  { name: 'Meditar', icon: '🧘' },
  { name: 'Academia', icon: '🏋️' },
]

export function EmptyToday() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <p className="text-4xl" aria-hidden>
        🌱
      </p>
      <h2 className="mt-2 text-lg font-semibold">Nenhum hábito ainda</h2>
      <p className="mt-1 text-sm text-slate-500">Comece com uma sugestão ou crie o seu.</p>

      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <li key={s.name}>
            <Link
              to={`/habits/new?name=${encodeURIComponent(s.name)}&icon=${encodeURIComponent(s.icon)}`}
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
