import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from './components/layout/AppShell.tsx'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.tsx'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage.tsx'
import { CalendarPage } from './features/calendar/CalendarPage.tsx'
import { HabitDetailPage } from './features/habits/detail/HabitDetailPage.tsx'
import { HabitFormPage } from './features/habits/HabitFormPage.tsx'
import { SettingsPage } from './features/settings/SettingsPage.tsx'
import { TodayPage } from './features/today/TodayPage.tsx'

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
          { path: 'habits/new', element: <HabitFormPage /> },
          { path: 'habits/:id', element: <HabitDetailPage /> },
          { path: 'habits/:id/edit', element: <HabitFormPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          {
            path: 'stats',
            // Carrega só ao abrir: o Recharts é grande e não precisa pesar na abertura do app.
            lazy: async () => ({
              Component: (await import('./features/stats/StatsPage.tsx')).StatsPage,
            }),
          },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
