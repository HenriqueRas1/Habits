import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { hideToast } from '../components/ui/toastStore.ts'

// Testes de unidade nunca abrem conexão Realtime.
vi.mock('../lib/realtime.ts', () => ({
  useRealtimeSync: () => undefined,
  subscribeToChanges: () => () => undefined,
}))

// Testes de unidade nunca falam com o banco: cada teste define o que a API devolve.
vi.mock('../features/habits/api.ts', () => ({
  fetchHabits: vi.fn(async () => []),
  createHabit: vi.fn(async () => undefined),
  updateHabit: vi.fn(async () => undefined),
  archiveHabit: vi.fn(async () => undefined),
  reorderHabits: vi.fn(async () => undefined),
}))

vi.mock('../features/entries/api.ts', () => ({
  fetchEntries: vi.fn(async () => []),
  createEntry: vi.fn(async () => undefined),
  deleteEntries: vi.fn(async () => undefined),
  updateEntry: vi.fn(async () => undefined),
}))

vi.mock('../features/profile/api.ts', () => ({
  fetchProfile: vi.fn(async () => null),
}))

afterEach(() => {
  cleanup()
  hideToast()
  vi.clearAllMocks()
})
