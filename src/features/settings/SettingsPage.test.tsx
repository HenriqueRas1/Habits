import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeHabit } from '../../test/factories.ts'
import { fakeSession, renderApp } from '../../test/renderApp.tsx'
import type { Profile } from '../../types/domain.ts'
import * as habitsApi from '../habits/api.ts'
import * as profileApi from '../profile/api.ts'

const profile: Profile = {
  id: fakeSession.user.id,
  display_name: null,
  timezone: 'America/Sao_Paulo',
  week_start: 1,
  theme: 'light',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('Ajustes', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    vi.mocked(profileApi.fetchProfile).mockResolvedValue(null)
  })

  it('troca o tema e aplica na hora', async () => {
    vi.mocked(profileApi.fetchProfile).mockResolvedValue(profile)
    vi.mocked(profileApi.updateProfile).mockReturnValue(new Promise(() => undefined))
    renderApp('/settings')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Escuro' }))

    expect(profileApi.updateProfile).toHaveBeenCalledWith(profile.id, { theme: 'dark' })
    await vi.waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('muda o início da semana e o fuso', async () => {
    vi.mocked(profileApi.fetchProfile).mockResolvedValue(profile)
    renderApp('/settings')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Domingo' }))
    expect(profileApi.updateProfile).toHaveBeenCalledWith(profile.id, { week_start: 0 })

    await user.selectOptions(screen.getByLabelText('Fuso horário'), 'Europe/Lisbon')
    expect(profileApi.updateProfile).toHaveBeenCalledWith(profile.id, {
      timezone: 'Europe/Lisbon',
    })
  })

  it('lista os arquivados e desarquiva', async () => {
    const habit = makeHabit({ name: 'Violão', archived_at: '2026-02-01T00:00:00Z' })
    vi.mocked(habitsApi.fetchArchivedHabits).mockResolvedValue([habit])
    // Gravação pendente: confere a atualização otimista antes da resposta do banco.
    vi.mocked(habitsApi.updateHabit).mockReturnValue(new Promise(() => undefined))
    renderApp('/settings')

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Desarquivar Violão' }))

    expect(habitsApi.updateHabit).toHaveBeenCalledWith(habit.id, { archived_at: null })
    expect(await screen.findByText('Nenhum hábito arquivado.')).toBeInTheDocument()
  })
})
