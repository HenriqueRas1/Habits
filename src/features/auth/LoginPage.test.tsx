import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../test/renderApp.tsx'
import * as api from './api.ts'

vi.mock('./api.ts', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  sendPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthChange: vi.fn(),
}))

async function fill(email: string, password?: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  if (password !== undefined) await user.type(screen.getByLabelText('Senha'), password)
  return user
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('entra com email e senha', async () => {
    vi.mocked(api.signIn).mockResolvedValue()
    renderApp('/login', { session: null })

    const user = await fill('eu@exemplo.com', 'segredo123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(api.signIn).toHaveBeenCalledWith('eu@exemplo.com', 'segredo123')
  })

  it('mostra o erro quando a senha está errada', async () => {
    vi.mocked(api.signIn).mockRejectedValue(new Error('Email ou senha incorretos.'))
    renderApp('/login', { session: null })

    const user = await fill('eu@exemplo.com', 'errada1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha incorretos.')
  })

  it('cria conta e pede para confirmar o email', async () => {
    vi.mocked(api.signUp).mockResolvedValue({ needsEmailConfirmation: true })
    renderApp('/login', { session: null })

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Criar conta' }))
    const user = await fill('novo@exemplo.com', 'segredo123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(api.signUp).toHaveBeenCalledWith('novo@exemplo.com', 'segredo123')
    expect(await screen.findByRole('status')).toHaveTextContent('Conta criada')
  })

  it('envia o link de recuperação de senha', async () => {
    vi.mocked(api.sendPasswordReset).mockResolvedValue()
    renderApp('/login', { session: null })

    await userEvent.setup().click(screen.getByRole('button', { name: 'Esqueci a senha' }))
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument()

    const user = await fill('eu@exemplo.com')
    await user.click(screen.getByRole('button', { name: 'Enviar link' }))

    expect(api.sendPasswordReset).toHaveBeenCalledWith('eu@exemplo.com')
    expect(await screen.findByRole('status')).toHaveTextContent('você vai receber um link')
  })
})
