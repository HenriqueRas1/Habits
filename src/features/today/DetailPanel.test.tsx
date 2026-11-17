import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as habitsApi from '../habits/api.ts'

/** Simula a largura de tela: `desktop` faz a media query de PC casar. */
function setDesktop(desktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: desktop && query.includes('min-width: 1024px'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  )
}

describe('Detalhe do hábito a partir da Hoje', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('no PC abre num painel à direita, sem sair da Hoje', async () => {
    setDesktop(true)
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    const { router } = renderApp('/')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('link', { name: /^Ler/ }))

    const panel = await screen.findByRole('complementary', { name: 'Detalhe do hábito' })
    expect(within(panel).getByRole('heading', { name: 'Ler' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Hoje' })).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Fechar detalhe' }))
    expect(
      screen.queryByRole('complementary', { name: 'Detalhe do hábito' }),
    ).not.toBeInTheDocument()
  })

  it('no celular abre a tela do hábito', async () => {
    setDesktop(false)
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    const { router } = renderApp('/')

    await userEvent.setup().click(await screen.findByRole('link', { name: /^Ler/ }))

    await vi.waitFor(() => expect(router.state.location.pathname).toBe(`/habits/${habit.id}`))
  })
})
