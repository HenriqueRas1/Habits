import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

// Mesmas variáveis do app e do teste de RLS (.env.local): URL do Supabase e conta de teste A.
Object.assign(process.env, loadEnv('development', process.cwd(), ''))

/** Testes de ponta a ponta contra o servidor local e o Supabase de verdade (npm run test:e2e). */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
