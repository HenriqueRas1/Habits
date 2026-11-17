import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from './components/layout/AppShell.tsx'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.tsx'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage.tsx'
import { TodayPage } from './features/today/TodayPage.tsx'

// Telas fora da Hoje carregam sob demanda: o app abre mais rápido (Hoje e login vêm no pacote inicial).
const habitForm = async () => ({
  Component: (await import('./features/habits/HabitFormPage.tsx')).HabitFormPage,
})

export const routes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
  { path: 'reset-password', element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <TodayPage /> },
          { path: 'habits/new', lazy: habitForm },
          {
            path: 'habits/:id',
            lazy: async () => ({
              Component: (await import('./features/habits/detail/HabitDetailPage.tsx'))
                .HabitDetailPage,
            }),
          },
          { path: 'habits/:id/edit', lazy: habitForm },
          {
            path: 'calendar',
            lazy: async () => ({
              Component: (await import('./features/calendar/CalendarPage.tsx')).CalendarPage,
            }),
          },
          {
            path: 'stats',
            // Carrega só ao abrir: o Recharts é grande e não precisa pesar na abertura do app.
            lazy: async () => ({
              Component: (await import('./features/stats/StatsPage.tsx')).StatsPage,
            }),
          },
          {
            path: 'settings',
            lazy: async () => ({
              Component: (await import('./features/settings/SettingsPage.tsx')).SettingsPage,
            }),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
