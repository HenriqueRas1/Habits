import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string }

export function TextField({ label, className = '', ...rest }: Props) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className={`focus:border-brand-500 focus:ring-brand-100 min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base outline-none focus:ring-2 ${className}`}
      />
    </div>
  )
}
