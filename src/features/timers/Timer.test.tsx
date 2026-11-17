import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import type { ActiveTimer } from '../../types/domain.ts'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'
import * as timersApi from './api.ts'

const NOW = new Date('2026-03-10T18:00:00Z') // 15h em São Paulo

function makeTimer(habitId: string, overrides: Partial<ActiveTimer> = {}): ActiveTimer {
  return {
    habit_id: habitId,
    user_id: '00000000-0000-0000-0000-000000000001',
    mode: 'stopwatch',
    countdown_seconds: null,
    started_at: new Date(NOW.getTime() - 25 * 60_000).toISOString(), // há 25 min
    paused_at: null,
    accumulated_seconds: 0,
    ...overrides,
  }
}

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    vi.mocked(timersApi.fetchTimers).mockResolvedValue([])
    vi.mocked(entriesApi.createEntry).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('contagem regressiva parte do que falta da meta de hoje e inicia', async () => {
    const habit = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 30 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      makeEntry({ habit_id: habit.id, entry_date: '2026-03-10', value: 10 }),
    ])

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Ler: abrir timer' }))
    const dialog = screen.getByRole('dialog', { name: 'Timer de Ler' })
    expect(within(dialog).getByLabelText('Minutos')).toHaveValue(20)
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar' }))

    expect(timersApi.startTimer).toHaveBeenCalledWith(
      expect.objectContaining({ habit_id: habit.id, mode: 'countdown', countdown_seconds: 1200 }),
    )
  })

  it('timer de outro aparelho aparece rodando no cartão', async () => {
    const habit = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 30 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(timersApi.fetchTimers).mockResolvedValue([makeTimer(habit.id)])

    renderApp('/')

    expect(
      await screen.findByRole('button', { name: 'Ler: timer em andamento, 25:00' }),
    ).toBeInTheDocument()
  })

  it('parar grava os minutos como registro de timer e depois apaga o timer', async () => {
    const habit = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 30 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(timersApi.fetchTimers).mockResolvedValue([makeTimer(habit.id)])

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Ler: timer em andamento/ }))
    await user.click(screen.getByRole('button', { name: 'Parar e salvar 25 min' }))

    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        habit_id: habit.id,
        entry_date: '2026-03-10',
        kind: 'done',
        value: 25,
        source: 'timer',
        ended_at: NOW.toISOString(),
      }),
    )
    await waitFor(() => expect(timersApi.deleteTimer).toHaveBeenCalledWith(habit.id))
  })

  it('pausar grava o acumulado', async () => {
    const habit = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 30 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(timersApi.fetchTimers).mockResolvedValue([makeTimer(habit.id)])

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Ler: timer em andamento/ }))
    await user.click(screen.getByRole('button', { name: 'Pausar' }))

    expect(timersApi.updateTimer).toHaveBeenCalledWith(habit.id, {
      accumulated_seconds: 1500,
      paused_at: NOW.toISOString(),
    })
  })
})
