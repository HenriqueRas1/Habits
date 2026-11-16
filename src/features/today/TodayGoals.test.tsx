import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import * as entriesApi from '../entries/api.ts'
import * as habitsApi from '../habits/api.ts'

const TODAY = '2026-03-10' // terça

describe('Hoje: metas, pulos e dias passados', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('"Academia 3x/semana" mostra "2/3 esta semana"', async () => {
    const habit = makeHabit({ name: 'Academia', goal_period: 'week', goal_target: 3 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([
      makeEntry({ habit_id: habit.id, entry_date: '2026-03-08' }), // domingo: semana passada
      makeEntry({ habit_id: habit.id, entry_date: '2026-03-09' }),
      makeEntry({ habit_id: habit.id, entry_date: TODAY }),
      makeEntry({ habit_id: habit.id, entry_date: TODAY }), // mesmo dia conta uma vez
    ])

    renderApp('/')

    expect(await screen.findByText(/2\/3 esta semana/)).toBeInTheDocument()
  })

  it('quantidade: + grava 1 e − apaga o último registro do dia', async () => {
    const habit = makeHabit({
      name: 'Água',
      goal_kind: 'count',
      goal_target: 8,
      goal_unit: 'copos',
    })
    const older = makeEntry({
      habit_id: habit.id,
      entry_date: TODAY,
      created_at: '2026-03-10T12:00:00Z',
    })
    const newer = makeEntry({
      habit_id: habit.id,
      entry_date: TODAY,
      created_at: '2026-03-10T13:00:00Z',
    })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([newer, older])

    renderApp('/')
    const user = userEvent.setup()
    expect(await screen.findByText(/2\/8 copos/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Água: desfazer o último registro' }))
    expect(entriesApi.deleteEntries).toHaveBeenCalledWith([newer.id])

    await user.click(screen.getByRole('button', { name: 'Água: adicionar 1' }))
    await vi.waitFor(() =>
      expect(entriesApi.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({ habit_id: habit.id, kind: 'done', value: 1 }),
      ),
    )
  })

  it('tempo: + pergunta os minutos e grava o valor', async () => {
    const habit = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 30 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])

    // Gravação pendente: confere a atualização otimista antes da resposta do banco.
    vi.mocked(entriesApi.createEntry).mockReturnValue(new Promise(() => undefined))

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Ler: adicionar minutos' }))
    await user.type(screen.getByLabelText('Quantos minutos?'), '25')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'done', value: 25, entry_date: TODAY }),
    )
    expect(await screen.findByText(/25\/30 min/)).toBeInTheDocument()
  })

  it('registra num dia passado pelo seletor de data, nunca no futuro', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])

    const { router } = renderApp('/')
    const user = userEvent.setup()
    expect(await screen.findByRole('button', { name: 'Próximo dia' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Dia anterior' }))
    expect(screen.getByText('Ontem')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?date=2026-03-09')

    await user.click(screen.getByRole('button', { name: /Ler: marcar como feito/ }))
    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ entry_date: '2026-03-09' }),
    )
  })

  it('ignora uma data no futuro vinda da URL', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([makeHabit()])
    renderApp('/?date=2026-03-11')
    expect(await screen.findByText('Hoje', { selector: 'p' })).toBeInTheDocument()
  })

  it('pula o dia com motivo e mostra "Pulado"', async () => {
    const habit = makeHabit({ name: 'Ler' })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])

    // Gravação pendente: confere a atualização otimista antes da resposta do banco.
    vi.mocked(entriesApi.createEntry).mockReturnValue(new Promise(() => undefined))

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Mais opções de Ler' }))
    await user.click(screen.getByRole('menuitem', { name: 'Pular este dia' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Motivo (opcional)'), 'doente')
    await user.click(within(dialog).getByRole('button', { name: 'Pular' }))

    expect(entriesApi.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'skip', value: 0, note: 'doente', entry_date: TODAY }),
    )
    expect(await screen.findByText(/Pulado/)).toBeInTheDocument()
  })

  it('pular de novo desfaz o pulo da semana', async () => {
    const habit = makeHabit({ name: 'Academia', goal_period: 'week', goal_target: 3 })
    const skip = makeEntry({ habit_id: habit.id, entry_date: '2026-03-09', kind: 'skip', value: 0 })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([skip])

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Mais opções de Academia' }))
    await user.click(screen.getByRole('menuitem', { name: 'Desfazer pulo' }))

    expect(entriesApi.deleteEntries).toHaveBeenCalledWith([skip.id])
  })

  it('edita a nota do registro do dia', async () => {
    const habit = makeHabit({ name: 'Ler' })
    const entry = makeEntry({ habit_id: habit.id, entry_date: TODAY })
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([habit])
    vi.mocked(entriesApi.fetchEntries).mockResolvedValue([entry])

    // Gravação pendente: confere a atualização otimista antes da resposta do banco.
    vi.mocked(entriesApi.updateEntry).mockReturnValue(new Promise(() => undefined))

    renderApp('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Mais opções de Ler' }))
    await user.click(screen.getByRole('menuitem', { name: 'Adicionar nota' }))
    await user.type(screen.getByLabelText('Nota'), 'capítulo 3')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(entriesApi.updateEntry).toHaveBeenCalledWith(entry.id, { note: 'capítulo 3' })
    expect(await screen.findByText('capítulo 3')).toBeInTheDocument()
  })

  it('separa os hábitos fora da agenda do dia', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([
      makeHabit({ name: 'Trabalho', schedule_days: [1, 3, 5] }), // terça fica de fora
      makeHabit({ name: 'Ler', sort_order: 1 }),
    ])

    renderApp('/')

    const heading = await screen.findByRole('heading', { name: 'Fora da agenda neste dia' })
    const offList = heading.nextElementSibling
    if (!(offList instanceof HTMLElement)) throw new Error('lista não encontrada')
    expect(within(offList).getByText('Trabalho')).toBeInTheDocument()
    expect(within(offList).queryByText('Ler')).not.toBeInTheDocument()
  })
})
