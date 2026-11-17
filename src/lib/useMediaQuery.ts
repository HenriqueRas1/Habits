import { useSyncExternalStore } from 'react'

/** true enquanto a media query casa (ex.: '(min-width: 1024px)' para o layout de PC). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia?.(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  )
}

export const DESKTOP = '(min-width: 1024px)'
