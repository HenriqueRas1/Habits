import type { Entry, Habit } from '../types/domain.ts'

const USER = '00000000-0000-0000-0000-000000000001'

export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: crypto.randomUUID(),
    user_id: USER,
    name: 'Beber água',
    description: null,
    icon: '💧',
    color: '#0ea5e9',
    type: 'build',
    goal_kind: 'check',
    goal_target: 1,
    goal_unit: null,
    goal_period: 'day',
    schedule_days: null,
    start_date: '2026-01-01',
    quit_started_at: null,
    sort_order: 0,
    archived_at: null,
    created_at: '2026-01-01T12:00:00Z',
    updated_at: '2026-01-01T12:00:00Z',
    ...overrides,
  }
}

export function makeEntry(
  overrides: Partial<Entry> & Pick<Entry, 'habit_id' | 'entry_date'>,
): Entry {
  return {
    id: crypto.randomUUID(),
    user_id: USER,
    kind: 'done',
    value: 1,
    source: 'manual',
    note: null,
    started_at: null,
    ended_at: null,
    created_at: '2026-01-01T12:00:00Z',
    updated_at: '2026-01-01T12:00:00Z',
    ...overrides,
  }
}
