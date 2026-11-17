import { useEffect, useState } from 'react'

/** "Agora", atualizado a cada `intervalMs` enquanto `active` (para contadores ao vivo). */
export function useNow(intervalMs = 1000, active = true): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, active])
  return now
}
