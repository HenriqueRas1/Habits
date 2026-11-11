import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { queryClient } from './lib/queryClient.ts'
import { routes } from './routes.tsx'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
