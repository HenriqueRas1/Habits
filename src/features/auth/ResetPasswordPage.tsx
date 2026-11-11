import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { TextField } from '../../components/ui/TextField.tsx'
import { signOut, updatePassword } from './api.ts'
import { AuthCard } from './AuthCard.tsx'
import { useSession } from './sessionContext.ts'

/** Página aberta pelo link do email de "esqueci a senha". */
export function ResetPasswordPage() {
  const { session, loading } = useSession()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return <FullScreenSpinner />

  if (!session) {
    return (
      <AuthCard title="Link inválido">
        <p className="mb-4 text-sm text-slate-600">
          Esse link expirou ou já foi usado. Peça um novo na tela de login.
        </p>
        <Button className="w-full" onClick={() => void navigate('/login', { replace: true })}>
          Ir para o login
        </Button>
      </AuthCard>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirm) {
      setError('As senhas não são iguais.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updatePassword(password)
      // Sai e volta para o login, para entrar com a senha nova (também limpa o modo de recuperação).
      await signOut()
      await navigate('/login', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.')
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Nova senha">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Repita a nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={busy}>
          Salvar senha
        </Button>
      </form>
    </AuthCard>
  )
}
