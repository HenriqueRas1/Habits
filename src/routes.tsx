import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from './components/layout/AppShell.tsx'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.tsx'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage.tsx'
import { CalendarPage } from './features/calendar/CalendarPage.tsx'
import { SettingsPage } from './features/settings/SettingsPage.tsx'
import { StatsPage } from './features/stats/StatsPage.tsx'
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
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'stats', element: <StatsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
