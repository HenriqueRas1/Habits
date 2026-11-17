import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as habitsApi from './api.ts'

describe('HabitFormPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exige um nome', async () => {
    renderApp('/habits/new')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Criar hábito' }))

    expect(await screen.findByText('Dê um nome ao hábito.')).toBeInTheDocument()
    expect(habitsApi.createHabit).not.toHaveBeenCalled()
  })

  it('não aceita data de início no futuro', async () => {
    renderApp('/habits/new')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Nome'), 'Ler')
    const date = screen.getByLabelText('Começa em')
    await user.clear(date)
    await user.type(date, '2026-03-11')
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    expect(await screen.findByText('A data de início não pode ser no futuro.')).toBeInTheDocument()
  })

  it('cria o hábito com id do cliente e volta para Hoje', async () => {
    const { router } = renderApp('/habits/new?name=Beber%20%C3%A1gua&icon=%F0%9F%92%A7')
    const user = userEvent.setup()

    expect(await screen.findByLabelText('Nome')).toHaveValue('Beber água')
    await user.click(screen.getByRole('button', { name: 'Verde' }))
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(habitsApi.createHabit).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      name: 'Beber água',
      icon: '💧',
      color: '#10b981',
      type: 'build',
      quit_started_at: null,
      start_date: '2026-03-10',
      goal_kind: 'check',
      goal_period: 'day',
      goal_target: 1,
      goal_unit: null,
      schedule_days: null,
      sort_order: 0,
    })
  })

  it('edita um hábito existente', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])

    renderApp(`/habits/${habit.id}/edit`)
    const user = userEvent.setup()
    const name = await screen.findByLabelText('Nome')
    expect(name).toHaveValue('Ler')
    await user.clear(name)
    await user.type(name, 'Ler 20 min')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await vi.waitFor(() =>
      expect(habitsApi.updateHabit).toHaveBeenCalledWith(
        habit.id,
        expect.objectContaining({ name: 'Ler 20 min' }),
      ),
    )
  })

  it('arquiva depois de confirmar', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderApp(`/habits/${habit.id}/edit`)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Arquivar hábito' }))

    await vi.waitFor(() =>
      expect(habitsApi.archiveHabit).toHaveBeenCalledWith(habit.id, expect.any(String)),
    )
  })

  it('cria meta semanal de 3 dias pela sugestão', async () => {
    renderApp('/habits/new?name=Academia&kind=check&target=3&period=week')
    const user = userEvent.setup()
    expect(await screen.findByLabelText('Quantos dias por semana')).toHaveValue(3)
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    await vi.waitFor(() =>
      expect(habitsApi.createHabit).toHaveBeenCalledWith(
        expect.objectContaining({ goal_kind: 'check', goal_period: 'week', goal_target: 3 }),
      ),
    )
  })

  it('não aceita mais de 7 dias por semana', async () => {
    renderApp('/habits/new?name=Academia')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Semana' }))
    const target = screen.getByLabelText('Quantos dias por semana')
    await user.clear(target)
    await user.type(target, '8')
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    expect(await screen.findByText('No máximo 7 dias por semana.')).toBeInTheDocument()
    expect(habitsApi.createHabit).not.toHaveBeenCalled()
  })

  it('cria meta de quantidade com unidade e dias da semana', async () => {
    renderApp('/habits/new?name=Copos')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Quantidade' }))
    const target = screen.getByLabelText('Quantidade por dia')
    await user.clear(target)
    await user.type(target, '8')
    await user.type(screen.getByLabelText('Unidade'), 'copos')
    await user.click(screen.getByRole('button', { name: 'Quarta' }))
    await user.click(screen.getByRole('button', { name: 'Segunda' }))
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    await vi.waitFor(() =>
      expect(habitsApi.createHabit).toHaveBeenCalledWith(
        expect.objectContaining({
          goal_kind: 'count',
          goal_target: 8,
          goal_unit: 'copos',
          schedule_days: [1, 3],
        }),
      ),
    )
  })

  it('apaga de vez só depois de confirmar', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)

    renderApp(`/habits/${habit.id}/edit`)
    const user = userEvent.setup()
    const button = await screen.findByRole('button', { name: 'Apagar hábito' })

    await user.click(button)
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('não pode ser desfeito'))
    expect(habitsApi.deleteHabit).not.toHaveBeenCalled()

    await user.click(button)
    await vi.waitFor(() => expect(habitsApi.deleteHabit).toHaveBeenCalledWith(habit.id))
  })

  it('cria hábito de parar com "sem desde" no fuso de São Paulo', async () => {
    renderApp('/habits/new?name=Fumar')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Parar' }))
    expect(screen.queryByRole('button', { name: 'Quantidade' })).not.toBeInTheDocument()
    const since = screen.getByLabelText('Sem desde')
    expect(since).toHaveValue('2026-03-10T15:00') // agora, 18h UTC = 15h em São Paulo
    await user.clear(since)
    await user.type(since, '2026-03-01T23:30')
    await user.click(screen.getByRole('button', { name: 'Criar hábito' }))

    await vi.waitFor(() =>
      expect(habitsApi.createHabit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'quit',
          quit_started_at: '2026-03-02T02:30:00.000Z',
          start_date: '2026-03-01',
          goal_kind: 'check',
          goal_period: 'day',
        }),
      ),
    )
  })
})
