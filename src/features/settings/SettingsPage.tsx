import { useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { signOut } from '../auth/api.ts'
import { useSession } from '../auth/sessionContext.ts'

export function SettingsPage() {
  const { session } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setBusy(true)
    setError(null)
    try {
      await signOut()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível sair.')
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Ajustes" description="Fuso, início da semana, tema e dados." />
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-500">Conta</h2>
        <p className="mt-1 mb-4 break-all">{session?.user.email}</p>
        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <Button variant="secondary" loading={busy} onClick={() => void handleSignOut()}>
          Sair
        </Button>
      </section>
    </>
  )
}
