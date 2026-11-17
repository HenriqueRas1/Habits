import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'

const NOW = new Date('2026-03-13T13:00:00Z')

describe('Hábitos para parar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const smoking = () =>
    makeHabit({
      name: 'Fumar',
      type: 'quit',
      start_date: '2026-03-01',
      quit_started_at: '2026-03-01T08:00:00Z',
    })

  it('mostra o contador, o marco e fica fora dos hábitos de construir', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([smoking()])

    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Parar' })).toBeInTheDocument()
    expect(screen.getByText('12 dias, 5 h')).toBeInTheDocument()
    expect(screen.getByText(/🎉 7 dias · faltam 2 dias para 14/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Fumar: marcar como feito/ }),
    ).not.toBeInTheDocument()
  })

  it('registrar recaída grava o horário e zera a contagem', async () => {
    const habit = smoking()
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.createEntry).mockReturnValue(new Promise(() => undefined))

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Fumar: registrar recaída' }))
    await user.type(screen.getByLabelText('Nota (opcional)'), 'festa')
    await user.click(screen.getByRole('button', { name: 'Registrar recaída' }))

    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        habit_id: habit.id,
        kind: 'relapse',
        entry_date: '2026-03-13',
        started_at: NOW.toISOString(),
        note: 'festa',
      }),
    )
    expect(await screen.findByText('0 min')).toBeInTheDocument()
  })

  it('a tela do hábito mostra recorde e lista de recaídas', async () => {
    const habit = smoking()
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      makeEntry({
        habit_id: habit.id,
        entry_date: '2026-03-11',
        kind: 'relapse',
        started_at: '2026-03-11T13:00:00Z',
      }),
    ])

    renderApp(`/habits/${habit.id}`)

    expect(await screen.findByText('Hábito para parar')).toBeInTheDocument()
    expect(screen.getByText('2 dias, 0 h')).toBeInTheDocument() // desde a recaída
    expect(screen.getByText('🏆 10 dias, 5 h')).toBeInTheDocument() // 01/03 08h → 11/03 13h
    expect(screen.getByText(/quarta-feira, 11 de março · 10:00/)).toBeInTheDocument()
    expect(screen.getByLabelText('quarta-feira, 11 de março: recaída')).toBeInTheDocument()
  })
})
