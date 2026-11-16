import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DEFAULT_TIMEZONE, todayIn } from '../../lib/dates.ts'
import type { WeekStart } from '../../domain/periods.ts'
import { fetchProfile } from './api.ts'

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
