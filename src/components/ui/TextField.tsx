import { useId, type InputHTMLAttributes, type Ref } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function TextField({ label, error, className = '', ...rest }: Props) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
        className={`focus:border-brand-500 focus:ring-brand-100 min-h-11 rounded-lg border bg-white px-3 text-base outline-none focus:ring-2 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
