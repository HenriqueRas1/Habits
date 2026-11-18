import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { hideToast } from '../components/ui/toastStore.ts'

// Telas carregam sob demanda (import dinâmico): com a máquina ocupada, 1 s de espera é pouco.
configure({ asyncUtilTimeout: 4000 })

// O jsdom não tem ResizeObserver; os gráficos (Recharts) precisam dele para existir.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Testes de unidade nunca abrem conexão Realtime.
vi.mock('../lib/realtime.ts', () => ({
  useRealtimeSync: () => undefined,
  subscribeToChanges: () => () => undefined,
}))

// Testes de unidade nunca falam com o banco: cada teste define o que a API devolve.
// Service worker do PWA não existe no jsdom.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: async () => undefined,
  }),
}))

vi.mock('../features/habits/api.ts', () => ({
  fetchHabits: vi.fn(async () => []),
  createHabit: vi.fn(async () => undefined),
  updateHabit: vi.fn(async () => undefined),
  archiveHabit: vi.fn(async () => undefined),
  deleteHabit: vi.fn(async () => undefined),
  fetchArchivedHabits: vi.fn(async () => []),
  reorderHabits: vi.fn(async () => undefined),
}))

vi.mock('../features/entries/api.ts', () => ({
  fetchEntries: vi.fn(async () => []),
  createEntry: vi.fn(async () => undefined),
  deleteEntries: vi.fn(async () => undefined),
  updateEntry: vi.fn(async () => undefined),
}))

vi.mock('../features/tasks/api.ts', () => ({
  fetchTasks: vi.fn(async () => []),
  createTask: vi.fn(async () => undefined),
  updateTask: vi.fn(async () => undefined),
  deleteTask: vi.fn(async () => undefined),
}))

vi.mock('../features/timers/api.ts', () => ({
  fetchTimers: vi.fn(async () => []),
  startTimer: vi.fn(async () => undefined),
  updateTimer: vi.fn(async () => undefined),
  deleteTimer: vi.fn(async () => undefined),
}))

vi.mock('../features/backup/api.ts', () => ({
  fetchEverything: vi.fn(async () => ({ habits: [], entries: [], tasks: [] })),
  restoreBackup: vi.fn(async () => undefined),
}))

vi.mock('../features/profile/api.ts', () => ({
  fetchProfile: vi.fn(async () => null),
  updateProfile: vi.fn(async () => undefined),
}))

afterEach(() => {
  cleanup()
  hideToast()
  vi.clearAllMocks()
})
