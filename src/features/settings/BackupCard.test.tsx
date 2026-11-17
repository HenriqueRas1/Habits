import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import { fakeSession, renderApp } from '../../test/renderApp.tsx'
import * as backupApi from '../backup/api.ts'
import { buildBackup } from '../backup/format.ts'

const profile = { timezone: 'America/Sao_Paulo', week_start: 1, theme: 'light' as const }

describe('Restaurar backup', () => {
  it('mostra o resumo, confirma e restaura um hábito apagado com o histórico', async () => {
    const habit = makeHabit({ name: 'Teste de backup' })
    const entry = makeEntry({ habit_id: habit.id, entry_date: '2026-03-09' })
    const backup = buildBackup(
      { profile, habits: [habit], entries: [entry], tasks: [] },
      new Date('2026-03-10T12:00:00Z'),
    )
    // Hoje o hábito não existe mais (foi apagado).
    vi.mocked(backupApi.fetchEverything).mockResolvedValue({ habits: [], entries: [], tasks: [] })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderApp('/settings')
    const user = userEvent.setup()
    const file = new File([JSON.stringify(backup)], 'habitos-backup.json', {
      type: 'application/json',
    })
    await user.upload(await screen.findByLabelText('Arquivo de backup'), file)

    await vi.waitFor(() =>
      expect(confirm).toHaveBeenCalledWith(
        expect.stringContaining('Não existem hoje: 1 hábitos, 1 registros, 0 tarefas.'),
      ),
    )
    expect(backupApi.restoreBackup).toHaveBeenCalledWith(backup, fakeSession.user.id)
    expect(
      await screen.findByText('Backup restaurado: 1 hábitos e 1 registros voltaram.'),
    ).toBeInTheDocument()
  })

  it('recusa um arquivo que não é backup', async () => {
    renderApp('/settings')
    const user = userEvent.setup()
    const file = new File(['{"foo":1}'], 'outro.json', { type: 'application/json' })
    await user.upload(await screen.findByLabelText('Arquivo de backup'), file)

    expect(await screen.findByRole('alert')).toHaveTextContent(/não é um backup do Hábitos/)
    expect(backupApi.restoreBackup).not.toHaveBeenCalled()
  })
})
