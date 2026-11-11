import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../test/renderApp.tsx'

describe('AppShell', () => {
  it('abre na tela Hoje', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Hoje' })).toBeInTheDocument()
  })

  it('troca de página ao tocar numa aba', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    const tabBar = screen.getAllByRole('navigation', { name: 'Navegação principal' })[1]
    const links = tabBar.querySelectorAll('a')
    const statsLink = Array.from(links).find((a) => a.textContent === 'Estatísticas')
    if (!statsLink) throw new Error('Aba Estatísticas não encontrada')

    await user.click(statsLink)

    expect(router.state.location.pathname).toBe('/stats')
    expect(screen.getByRole('heading', { level: 1, name: 'Estatísticas' })).toBeInTheDocument()
  })

  it('marca a aba ativa', () => {
    renderApp('/calendar')
    const active = screen.getAllByRole('link', { current: 'page' })
    expect(active.every((a) => a.textContent === 'Calendário')).toBe(true)
  })

  it('redireciona rotas desconhecidas para Hoje', () => {
    const { router } = renderApp('/nao-existe')
    expect(router.state.location.pathname).toBe('/')
  })
})
