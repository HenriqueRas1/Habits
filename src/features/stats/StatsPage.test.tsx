import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'

describe('Estatísticas', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-13T18:00:00Z')) // sexta
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra taxa (conta feita à mão), minutos, ranking e o heatmap', async () => {
    const work = makeHabit({
      name: 'Trabalho focado',
      start_date: '2026-03-02',
      schedule_days: [1, 2, 3, 4, 5],
    })
    const read = makeHabit({
      name: 'Ler',
      goal_kind: 'duration',
      goal_target: 20,
      start_date: '2026-03-02',
    })
    const quit = makeHabit({ name: 'Fumar', type: 'quit', start_date: '2026-03-02' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([work, read, quit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      ...['02', '03', '05', '06', '09', '12'].map((d) =>
        makeEntry({ habit_id: work.id, entry_date: `2026-03-${d}` }),
      ),
      makeEntry({ habit_id: work.id, entry_date: '2026-03-10', kind: 'skip', value: 0 }),
      makeEntry({ habit_id: read.id, entry_date: '2026-03-12', value: 25, source: 'timer' }),
      makeEntry({ habit_id: read.id, entry_date: '2026-03-13', value: 50 }),
    ])

    renderApp('/stats')
    const user = userEvent.setup()

    const rates = await screen.findByRole(
      'region',
      { name: 'Taxa de conclusão' },
      { timeout: 5000 },
    )
    // 30 dias: 6 feitos, 2 perdidos (pulado, fim de semana e hoje não contam)
    expect(within(rates).getByText('75% · 6 de 8')).toBeInTheDocument()
    expect(within(rates).queryByText(/Fumar/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '7 dias' }))
    expect(within(rates).getByText('67% · 2 de 3')).toBeInTheDocument()

    const minutes = screen.getByRole('region', { name: 'Minutos' })
    expect(within(minutes).getByText('1 h 15 min nos últimos 7 dias')).toBeInTheDocument()

    const streaks = screen.getByRole('region', { name: 'Sequências' })
    expect(within(streaks).getAllByRole('listitem')).toHaveLength(2)

    expect(
      screen.getByRole('gridcell', { name: 'quinta-feira, 12 de março: 2 de 2' }),
    ).toBeInTheDocument()
  })

  it('sem hábitos, convida a criar um', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([])
    renderApp('/stats')
    expect(
      await screen.findByText('Crie um hábito para ver suas estatísticas aqui.', undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument()
  })
})
