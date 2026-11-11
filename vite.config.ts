import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  test:
    mode === 'rls'
      ? {
          // Teste de segurança contra o banco de verdade (npm run test:rls)
          environment: 'node',
          include: ['tests/rls/**/*.test.ts'],
          env: loadEnv('development', process.cwd(), ''),
          testTimeout: 20_000,
          hookTimeout: 20_000,
        }
      : {
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
          css: false,
          // Valores falsos: os testes de unidade nunca falam com o Supabase.
          env: {
            VITE_SUPABASE_URL: 'http://localhost:54321',
            VITE_SUPABASE_ANON_KEY: 'test-anon-key',
          },
        },
}))
