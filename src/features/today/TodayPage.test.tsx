import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays } from '../../lib/dates.ts'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'

const TODAY = '2026-03-10'

describe('TodayPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    // 15h em São Paulo
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra sugestões quando não há hábitos', async () => {
    renderApp('/')
    expect(await screen.findByText('Nenhum hábito ainda')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Beber água/ })).toHaveAttribute(
      'href',
      '/habits/new?name=Beber%20%C3%A1gua&icon=%F0%9F%92%A7',
    )
  })

  it('mostra o hábito com o streak', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      makeEntry({ habit_id: habit.id, entry_date: addDays(TODAY, -2) }),
      makeEntry({ habit_id: habit.id, entry_date: addDays(TODAY, -1) }),
    ])

    renderApp('/')

    expect(await screen.findByText('Ler')).toBeInTheDocument()
    expect(screen.getByText('🔥 2 dias')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ler: marcar como feito/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('marca o check na hora e grava com id do cliente', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.createEntry).mockReturnValue(new Promise(() => undefined)) // nunca responde

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Ler: marcar como feito/ }))

    // Atualização otimista: aparece marcado antes de o banco responder.
    expect(screen.getByRole('button', { name: /Ler: feito hoje/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('🔥 1 dia')).toBeInTheDocument()
    expect(entriesApi.createEntry).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      habit_id: habit.id,
      entry_date: TODAY,
    })
  })

  it('desmarca apagando o registro do dia', async () => {
    const habit = makeHabit({ name: 'Ler' })
    const entry = makeEntry({ habit_id: habit.id, entry_date: TODAY })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([entry])

    renderApp('/')
    await userEvent.setup().click(await screen.findByRole('button', { name: /Ler: feito hoje/ }))

    expect(entriesApi.deleteEntries).toHaveBeenCalledWith([entry.id])
  })

  it('volta atrás e avisa quando a gravação falha', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.createEntry).mockRejectedValue(new Error('offline'))

    renderApp('/')
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: /Ler: marcar como feito/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar o check')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Ler: marcar como feito/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      ),
    )
  })

  it('reordena com as setas', async () => {
    const a = makeHabit({ name: 'A', sort_order: 0 })
    const b = makeHabit({ name: 'B', sort_order: 1 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([a, b])
    // Depois de gravar, o banco devolve a nova ordem.
    vi.mocked(habitsApi.reorderHabits).mockImplementation(async () => {
      vi.mocked(habitsApi.fetchHabits).mockResolvedValue([
        { ...b, sort_order: 0 },
        { ...a, sort_order: 1 },
      ])
    })

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Reordenar' }))
    await user.click(screen.getByRole('button', { name: 'Mover B para cima' }))

    expect(habitsApi.reorderHabits).toHaveBeenCalledWith([b.id, a.id])
    // B virou o primeiro: não pode mais subir; A pode.
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mover B para cima' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Mover A para cima' })).toBeEnabled()
    })
  })
})
