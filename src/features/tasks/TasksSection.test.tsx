import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeHabit } from '../../test/factories.ts'
import { renderApp } from '../../test/renderApp.tsx'
import type { Task } from '../../types/domain.ts'
import * as habitsApi from '../habits/api.ts'
import * as tasksApi from './api.ts'

const TODAY = '2026-03-10'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    user_id: '00000000-0000-0000-0000-000000000001',
    task_date: TODAY,
    title: 'Pagar a luz',
    done_at: null,
    sort_order: 0,
    created_at: '2026-03-10T12:00:00Z',
    updated_at: '2026-03-10T12:00:00Z',
    ...overrides,
  }
}

/** Abre o "+" (versão do celular) e escolhe uma opção. */
async function chooseAdd(user: ReturnType<typeof userEvent.setup>, option: RegExp) {
  await user.click(await screen.findByRole('button', { name: 'Novo hábito ou tarefa' }))
  await user.click(screen.getByRole('menuitem', { name: option }))
}

describe('Tarefas do dia', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T18:00:00Z'))
    // clearAllMocks não desfaz mockResolvedValue de outros testes: volta ao padrão aqui.
    vi.mocked(tasksApi.fetchTasks).mockResolvedValue([])
    vi.mocked(tasksApi.createTask).mockResolvedValue(undefined)
    vi.mocked(tasksApi.updateTask).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('o + oferece Hábito, que abre o formulário', async () => {
    const { router } = renderApp('/')
    const user = userEvent.setup()
    await chooseAdd(user, /Hábito/)
    expect(router.state.location.pathname).toBe('/habits/new')
  })

  it('cria uma tarefa no dia aberto e mostra na hora', async () => {
    vi.mocked(tasksApi.createTask).mockReturnValue(new Promise(() => undefined))
    renderApp('/')
    const user = userEvent.setup()

    await chooseAdd(user, /Tarefa/)
    await user.type(screen.getByLabelText('Tarefa'), 'Cancelar Netflix')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(tasksApi.createTask).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      task_date: TODAY,
      title: 'Cancelar Netflix',
      sort_order: 0,
    })
    const section = await screen.findByRole('region', { name: 'Tarefas' })
    expect(within(section).getByText('Cancelar Netflix')).toBeInTheDocument()
  })

  it('cria a tarefa no dia passado que estiver aberto', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([makeHabit()])
    renderApp('/?date=2026-03-09')
    const user = userEvent.setup()

    await chooseAdd(user, /Tarefa/)
    expect(screen.getByRole('heading', { name: 'Nova tarefa · ontem' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Tarefa'), 'Buscar água')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(tasksApi.fetchTasks).toHaveBeenCalledWith('2026-03-09')
    expect(tasksApi.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ task_date: '2026-03-09' }),
    )
  })

  it('marca como feita (riscada) e desmarca', async () => {
    const task = makeTask()
    vi.mocked(tasksApi.fetchTasks).mockResolvedValue([task])
    vi.mocked(tasksApi.updateTask).mockReturnValue(new Promise(() => undefined))
    renderApp('/')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: /Pagar a luz: marcar como feita/ }))

    expect(tasksApi.updateTask).toHaveBeenCalledWith(task.id, { done_at: expect.any(String) })
    expect(screen.getByRole('button', { name: /Pagar a luz: feita/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Pagar a luz')).toHaveClass('line-through')
  })

  it('edita o título e apaga depois de confirmar', async () => {
    const task = makeTask({ done_at: '2026-03-10T13:00:00Z' })
    vi.mocked(tasksApi.fetchTasks).mockResolvedValue([task])
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp('/')
    const user = userEvent.setup()

    await user.click(
      await screen.findByRole('button', { name: 'Mais opções da tarefa Pagar a luz' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Editar tarefa' }))
    const input = screen.getByLabelText('Tarefa')
    await user.clear(input)
    await user.type(input, 'Pagar a água')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(tasksApi.updateTask).toHaveBeenCalledWith(task.id, { title: 'Pagar a água' })

    await user.click(screen.getByRole('button', { name: /Mais opções da tarefa/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Apagar tarefa' }))
    expect(tasksApi.deleteTask).toHaveBeenCalledWith(task.id)
  })

  it('não mostra a seção quando o dia não tem tarefas', async () => {
    vi.mocked(habitsApi.fetchHabits).mockResolvedValue([makeHabit()])
    renderApp('/')
    expect(await screen.findByText('Beber água')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Tarefas' })).not.toBeInTheDocument()
  })
})
