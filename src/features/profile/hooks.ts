import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DEFAULT_TIMEZONE, todayIn } from '../../lib/dates.ts'
import type { WeekStart } from '../../domain/periods.ts'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import {
  applyTheme,
  readThemeHint,
  saveThemeHint,
  watchSystemTheme,
  type Theme,
} from '../../lib/theme.ts'
import type { Profile } from '../../types/domain.ts'
import { fetchProfile, updateProfile, type ProfilePatch } from './api.ts'

export const profileKey = ['profile'] as const

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: fetchProfile, staleTime: 5 * 60_000 })
}

export function useTimezone(): string {
  return useProfile().data?.timezone ?? DEFAULT_TIMEZONE
}

/** "Hoje" no fuso do perfil. Reavalia a cada minuto e ao voltar para a aba (vira à meia-noite). */
export function useToday(): string {
  const timezone = useTimezone()
  const [today, setToday] = useState(() => todayIn(timezone, new Date()))

  useEffect(() => {
    const update = () => setToday(todayIn(timezone, new Date()))
    update()
    const timer = window.setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [timezone])

  return today
}

/** Início da semana do perfil: 1 = segunda (padrão), 0 = domingo. */
export function useWeekStart(): WeekStart {
  return useProfile().data?.week_start === 0 ? 0 : 1
}

/** Tema do perfil (padrão: claro). Enquanto o perfil carrega, usa o último tema deste aparelho. */
export function useTheme(): Theme {
  const theme = useProfile().data?.theme
  return theme === 'dark' || theme === 'system' || theme === 'light' ? theme : readThemeHint()
}

/** Aplica o tema no <html> e acompanha o sistema quando o tema é "Sistema". */
export function useThemeSync() {
  const theme = useTheme()
  useEffect(() => {
    applyTheme(theme)
    saveThemeHint(theme)
    return watchSystemTheme(theme)
  }, [theme])
}

/** Salva fuso, início da semana ou tema; a tela muda na hora. */
export function useUpdateProfile(userId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (patch: ProfilePatch) => updateProfile(userId, patch),
    onMutate: (patch) =>
      applyOptimistic<Profile | null>(client, profileKey, (old) =>
        old ? { ...old, ...patch } : old,
      ),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível salvar o ajuste.'),
    onSettled: () => client.invalidateQueries({ queryKey: profileKey }),
  })
}
