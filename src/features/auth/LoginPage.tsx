import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { TextField } from '../../components/ui/TextField.tsx'
import { sendPasswordReset, signIn, signUp } from './api.ts'
import { AuthCard } from './AuthCard.tsx'
import { useSession } from './sessionContext.ts'

type Mode = 'signin' | 'signup' | 'forgot'

const titles: Record<Mode, string> = {
  signin: 'Entrar',
  signup: 'Criar conta',
  forgot: 'Recuperar senha',
}

export function LoginPage() {
  const { session } = useSession()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (session) return <Navigate to={from} replace />

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        const { needsEmailConfirmation } = await signUp(email, password)
        if (needsEmailConfirmation) {
          setNotice('Conta criada. Abra o link que enviamos para o seu email e depois entre aqui.')
          setMode('signin')
        }
      } else {
        await sendPasswordReset(email)
        setNotice(
          'Se existir uma conta com esse email, você vai receber um link para criar uma nova senha.',
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title={titles[mode]}>
      {mode !== 'forgot' && (
        <div role="tablist" className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`min-h-10 rounded-md text-sm font-medium ${
                mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {titles[m]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode !== 'forgot' && (
          <TextField
            label="Senha"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <Button type="submit" loading={busy}>
          {mode === 'forgot' ? 'Enviar link' : titles[mode]}
        </Button>
      </form>

      <div className="mt-4 text-center">
        {mode === 'forgot' ? (
          <Button variant="link" onClick={() => switchMode('signin')}>
            Voltar para entrar
          </Button>
        ) : (
          <Button variant="link" onClick={() => switchMode('forgot')}>
            Esqueci a senha
          </Button>
        )}
      </div>
    </AuthCard>
  )
}
