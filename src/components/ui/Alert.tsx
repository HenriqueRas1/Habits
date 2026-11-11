import type { ReactNode } from 'react'

type Props = { tone: 'error' | 'success'; children: ReactNode }

export function Alert({ tone, children }: Props) {
  const style =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm ${style}`}
    >
      {children}
    </p>
  )
}
