import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { getSession, onAuthChange } from './api.ts'
import { SessionContext, type SessionState } from './sessionContext.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<SessionState>({
    session: null,
    loading: true,
    recovering: false,
  })

  useEffect(() => {
    let active = true

    void getSession().then((session) => {
      if (active) setState((s) => ({ ...s, session, loading: false }))
    })

    const unsubscribe = onAuthChange((event, session) => {
      if (event === 'SIGNED_OUT') queryClient.clear()
      setState((s) => ({
        session,
        loading: false,
        recovering:
          event === 'PASSWORD_RECOVERY' ? true : event === 'SIGNED_OUT' ? false : s.recovering,
      }))
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  return <SessionContext value={state}>{children}</SessionContext>
}
