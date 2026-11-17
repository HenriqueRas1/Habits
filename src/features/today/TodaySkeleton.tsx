/** Esqueleto da Hoje enquanto os dados carregam (no lugar do spinner de tela cheia). */
export function TodaySkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando hábitos" className="animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-24 rounded-lg bg-slate-200" />
        <div className="h-11 w-20 rounded-lg bg-slate-200" />
      </div>
      <div className="mb-6 h-11 rounded-full bg-slate-100" />
      <div className="mb-3 h-6 w-28 rounded bg-slate-200" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="bg-surface flex h-16 items-center gap-3 rounded-full px-2">
            <span className="size-11 rounded-full bg-slate-100" />
            <span className="h-4 flex-1 rounded bg-slate-100" />
            <span className="size-10 rounded-full bg-slate-100" />
          </li>
        ))}
      </ul>
    </div>
  )
}
