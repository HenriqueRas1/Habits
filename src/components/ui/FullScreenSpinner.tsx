export function FullScreenSpinner() {
  return (
    <div
      className="flex min-h-full items-center justify-center"
      role="status"
      aria-label="Carregando"
    >
      <div className="border-brand-100 border-t-brand-600 size-8 animate-spin rounded-full border-4" />
    </div>
  )
}
