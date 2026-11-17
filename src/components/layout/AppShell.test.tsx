import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../test/renderApp.tsx'

describe('AppShell', () => {
  it('abre na tela Hoje', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Hoje' })).toBeInTheDocument()
  })

  it('troca de página ao tocar numa aba', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    const tabBar = screen.getAllByRole('navigation', { name: 'Navegação principal' })[1]
    const links = tabBar.querySelectorAll('a')
    const statsLink = Array.from(links).find((a) => a.textContent === 'Estatísticas')
    if (!statsLink) throw new Error('Aba Estatísticas não encontrada')

    await user.click(statsLink)

    expect(
      // A tela de estatísticas carrega sob demanda (com o Recharts): pode demorar um pouco.
      await screen.findByRole('heading', { level: 1, name: 'Estatísticas' }, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/stats')
  })

  it('marca a aba ativa', async () => {
    renderApp('/calendar')
    const active = await screen.findAllByRole('link', { current: 'page' })
    expect(active.every((a) => a.textContent === 'Calendário')).toBe(true)
  })

  it('redireciona rotas desconhecidas para Hoje', () => {
    const { router } = renderApp('/nao-existe')
    expect(router.state.location.pathname).toBe('/')
  })
})

describe('Sem conexão', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('avisa e desativa os botões de gravar; volta ao normal quando a internet volta', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    renderApp('/')
    const add = await screen.findByRole('button', { name: 'Novo hábito ou tarefa' })

    online.mockReturnValue(false)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/Sem conexão/)).toBeInTheDocument()
    expect(add).toBeDisabled()

    online.mockReturnValue(true)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText(/Sem conexão/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo hábito ou tarefa' })).toBeEnabled()
  })
})
