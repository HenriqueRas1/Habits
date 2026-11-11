import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link'
  loading?: boolean
}

const styles = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-500/60',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  link: 'text-brand-600 hover:underline disabled:text-slate-400',
} as const

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    variant === 'link'
      ? 'min-h-11 px-1 text-sm font-medium'
      : 'min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors'
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {loading ? 'Aguarde…' : children}
    </button>
  )
}
