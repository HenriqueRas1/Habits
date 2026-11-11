import type { ReactNode } from 'react'

type Props = { title: string; children: ReactNode }

export function AuthCard({ title, children }: Props) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-sm">
        <p className="text-brand-600 mb-6 text-center text-2xl font-bold">Hábitos</p>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold">{title}</h1>
          {children}
        </section>
      </div>
    </main>
  )
}
