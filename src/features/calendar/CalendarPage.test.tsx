import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'

describe('Calendário geral', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra a fração de hábitos concluídos e abre a Hoje no dia tocado', async () => {
    const a = makeHabit({ name: 'Ler', start_date: '2026-03-01' })
    const b = makeHabit({ name: 'Água', start_date: '2026-03-01' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([a, b])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      makeEntry({ habit_id: a.id, entry_date: '2026-03-09' }),
    ])

    const { router } = renderApp('/calendar')
    const monday = await screen.findByRole('button', {
      name: 'segunda-feira, 9 de março: 1 de 2 hábitos',
    })
    expect(entriesApi.fetchEntries).toHaveBeenCalledWith('2026-03-01', '2026-03-31')
    expect(screen.getByRole('button', { name: /^quarta-feira, 11 de março/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()

    await userEvent.setup().click(monday)

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.search).toBe('?date=2026-03-09')
  })
})
