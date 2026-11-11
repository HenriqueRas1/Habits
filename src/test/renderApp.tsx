import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { SessionContext, type SessionState } from '../features/auth/sessionContext.ts'
import { routes } from '../routes.tsx'

export const fakeSession = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'teste@exemplo.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
  },
} as Session

/** Renderiza o app inteiro numa rota, com um estado de sessão controlado pelo teste. */
export function renderApp(path: string, session: Partial<SessionState> = {}) {
  const state: SessionState = {
    session: fakeSession,
    loading: false,
    recovering: false,
    ...session,
  }
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <SessionContext value={state}>
        <RouterProvider router={router} />
      </SessionContext>
    </QueryClientProvider>,
  )
  return { router, ...utils }
}
