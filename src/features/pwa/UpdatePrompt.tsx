import { useRegisterSW } from 'virtual:pwa-register/react'

/** Aviso de nova versão: o app só troca quando você toca em "Atualizar". */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      <span className="flex-1">Nova versão disponível.</span>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="min-h-10 px-2 text-gray-300 hover:text-white"
      >
        Depois
      </button>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="min-h-10 rounded-lg bg-white px-3 font-semibold text-gray-900"
      >
        Atualizar
      </button>
    </div>
  )
}
