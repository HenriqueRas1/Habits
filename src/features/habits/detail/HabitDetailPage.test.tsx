import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../../test/factories.ts'
import { renderApp } from '../../../test/renderApp.tsx'
import * as entriesApi from '../../entries/api.ts'
import * as habitsApi from '../api.ts'

const day = (label: string) => screen.findByRole('button', { name: new RegExp(`^${label}:`) })

describe('Tela do hábito', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z')) // terça, 15h em São Paulo
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra meta, streak atual e melhor, e o mês colorido', async () => {
    const habit = makeHabit({ name: 'Ler', start_date: '2026-03-01' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue(
      ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-09'].map((entry_date) =>
        makeEntry({ habit_id: habit.id, entry_date }),
      ),
    )

    renderApp(`/habits/${habit.id}`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Ler' })).toBeInTheDocument()
    expect(screen.getByText('Todo dia')).toBeInTheDocument()
    expect(screen.getByText('🔥 1 dia')).toBeInTheDocument()
    expect(screen.getByText('🏆 3 dias')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'março de 2026' })).toBeInTheDocument()
    expect(await day('segunda-feira, 9 de março')).toHaveAccessibleName(/concluído$/)
    expect(await day('quarta-feira, 4 de março')).toHaveAccessibleName(/perdido$/)
    expect(await day('quarta-feira, 11 de março')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
  })

  it('corrige um dia passado e a cor muda na hora', async () => {
    const habit = makeHabit({ name: 'Ler', start_date: '2026-03-01' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.createEntry).mockReturnValue(new Promise(() => undefined))

    renderApp(`/habits/${habit.id}`)
    const user = userEvent.setup()
    await user.click(await day('quinta-feira, 5 de março'))
    const panel = screen.getByRole('region', { name: 'Registros do dia' })
    expect(within(panel).getByText('Nenhum registro neste dia.')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Marcar como feito' }))

    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ habit_id: habit.id, entry_date: '2026-03-05', kind: 'done' }),
    )
    expect(await day('quinta-feira, 5 de março')).toHaveAccessibleName(/concluído$/)
  })

  it('corrige o valor de um registro de quantidade', async () => {
    const habit = makeHabit({
      name: 'Água',
      goal_kind: 'count',
      goal_target: 8,
      goal_unit: 'copos',
      start_date: '2026-03-01',
    })
    const entry = makeEntry({ habit_id: habit.id, entry_date: '2026-03-09', value: 3 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([entry])
    vi.mocked(entriesApi.updateEntry).mockReturnValue(new Promise(() => undefined))

    renderApp(`/habits/${habit.id}`)
    const user = userEvent.setup()
    expect(await day('segunda-feira, 9 de março')).toHaveAccessibleName(/parcial$/)
    await user.click(await day('segunda-feira, 9 de março'))
    await user.click(screen.getByRole('button', { name: 'Corrigir 3 copos' }))
    const input = screen.getByLabelText('Quantos copos?')
    await user.clear(input)
    await user.type(input, '8')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(entriesApi.updateEntry).toHaveBeenCalledWith(entry.id, { value: 8 })
    expect(await day('segunda-feira, 9 de março')).toHaveAccessibleName(/concluído$/)
  })

  it('apaga um registro e pula a semana', async () => {
    const habit = makeHabit({ name: 'Academia', goal_period: 'week', goal_target: 3 })
    const entry = makeEntry({ habit_id: habit.id, entry_date: '2026-03-10' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([entry])

    renderApp(`/habits/${habit.id}`)
    const user = userEvent.setup()
    expect(await screen.findByText('3x por semana')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Apagar ✓ Feito' }))
    expect(entriesApi.deleteEntries).toHaveBeenCalledWith([entry.id])

    await user.click(screen.getByRole('button', { name: 'Pular esta semana' }))
    await user.click(screen.getByRole('button', { name: 'Pular' }))
    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'skip', entry_date: '2026-03-10', note: null }),
    )
  })

  it('mostra aviso para hábito inexistente', async () => {
    renderApp('/habits/nao-existe')
    expect(await screen.findByText('Hábito não encontrado')).toBeInTheDocument()
  })
})
