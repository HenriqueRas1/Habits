import { useId, useState, type FormEvent } from 'react'
import { Button } from './Button.tsx'

type Props = {
  title: string
  label: string
  type?: 'text' | 'number'
  initialValue?: string
  placeholder?: string
  confirmLabel: string
  /** Para campos de número: valor mínimo aceito. */
  min?: number
  onConfirm: (value: string) => void
  onClose: () => void
}

/** Janela simples com um campo (nota, minutos...). Fecha ao confirmar ou cancelar. */
export function PromptDialog({
  title,
  label,
  type = 'text',
  initialValue = '',
  placeholder,
  confirmLabel,
  min,
  onConfirm,
  onClose,
}: Props) {
  const id = useId()
  const [value, setValue] = useState(initialValue)
  const invalid = type === 'number' && !(Number(value) >= (min ?? 0) && value.trim() !== '')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (invalid) return
    onConfirm(value.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onSubmit={submit}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="bg-surface w-full max-w-sm rounded-2xl p-5 shadow-xl"
      >
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        <label htmlFor={id} className="mt-4 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          id={id}
          type={type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          min={min}
          maxLength={type === 'text' ? 500 : undefined}
          autoFocus
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="focus:border-brand-500 focus:ring-brand-100 mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base outline-none focus:ring-2"
        />
        <div className="mt-5 flex gap-3">
          <Button type="submit" disabled={invalid} className="flex-1">
            {confirmLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
