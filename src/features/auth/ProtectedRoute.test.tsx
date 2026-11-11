import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../test/renderApp.tsx'

describe('ProtectedRoute', () => {
  it('manda para /login quem não está logado', () => {
    const { router } = renderApp('/stats', { session: null })
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('mostra carregando enquanto a sessão é lida', () => {
    renderApp('/', { session: null, loading: true })
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })

  it('manda para /reset-password quando veio pelo link de recuperação', () => {
    const { router } = renderApp('/', { recovering: true })
    expect(router.state.location.pathname).toBe('/reset-password')
    expect(screen.getByRole('heading', { name: 'Nova senha' })).toBeInTheDocument()
  })

  it('tira da tela de login quem já está logado', () => {
    const { router } = renderApp('/login')
    expect(router.state.location.pathname).toBe('/')
  })
})
