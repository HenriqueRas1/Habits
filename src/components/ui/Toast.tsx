import { useEffect } from 'react'
import { hideToast, useToastStore } from './toastStore.ts'

export function Toast() {
  const { message, id } = useToastStore()

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(hideToast, 4000)
    return () => window.clearTimeout(timer)
  }, [message, id])

  if (!message) return null
  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg lg:bottom-6"
    >
      {message}
    </div>
  )
}
