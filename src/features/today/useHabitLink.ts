import { useSearchParams } from 'react-router'
import { DESKTOP, useMediaQuery } from '../../lib/useMediaQuery.ts'

/** Para onde o nome do hábito leva: painel no PC, tela própria no celular. */
export function useHabitLink() {
  const [params] = useSearchParams()
  const desktop = useMediaQuery(DESKTOP)
  return (habitId: string) => {
    if (!desktop) return `/habits/${habitId}`
    const next = new URLSearchParams(params)
    next.set('habit', habitId)
    next.delete('month')
    return `/?${next.toString()}`
  }
}
