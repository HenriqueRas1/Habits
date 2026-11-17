import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyOptimistic, rollback } from '../../lib/optimistic.ts'
import type { Habit, HabitUpdate } from '../../types/domain.ts'
import {
  archiveHabit,
  createHabit,
  deleteHabit,
  fetchHabits,
  reorderHabits,
  updateHabit,
  type NewHabit,
} from './api.ts'

export const habitsKey = ['habits'] as const

export function useHabits() {
  return useQuery({ queryKey: habitsKey, queryFn: fetchHabits })
}

export function useHabit(id: string | undefined) {
  const query = useHabits()
  return { ...query, data: query.data?.find((h) => h.id === id) }
}

/** Monta o objeto do cache a partir do que foi enviado, para a atualização otimista. */
function toOptimisticHabit(habit: NewHabit, userId: string): Habit {
  const now = new Date().toISOString()
  return {
    archived_at: null,
    color: '#6366f1',
    created_at: now,
    description: null,
    goal_kind: 'check',
    goal_period: 'day',
    goal_target: 1,
    goal_unit: null,
    icon: '✅',
    quit_started_at: null,
    schedule_days: null,
    sort_order: 0,
    type: 'build',
    updated_at: now,
    user_id: userId,
    ...habit,
  }
}

export function useCreateHabit(userId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (habit: NewHabit) => createHabit(habit),
    onMutate: (habit) =>
      applyOptimistic<Habit[]>(client, habitsKey, (old) => [
        ...old,
        toOptimisticHabit(habit, userId),
      ]),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível criar o hábito.'),
    onSettled: () => client.invalidateQueries({ queryKey: habitsKey }),
  })
}

export function useUpdateHabit() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: HabitUpdate }) => updateHabit(id, patch),
    onMutate: ({ id, patch }) =>
      applyOptimistic<Habit[]>(client, habitsKey, (old) =>
        old.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      ),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível salvar o hábito.'),
    onSettled: () => client.invalidateQueries({ queryKey: habitsKey }),
  })
}

export function useArchiveHabit() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveHabit(id, new Date().toISOString()),
    onMutate: (id) =>
      applyOptimistic<Habit[]>(client, habitsKey, (old) => old.filter((h) => h.id !== id)),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível arquivar o hábito.'),
    onSettled: () => client.invalidateQueries({ queryKey: habitsKey }),
  })
}

export function useReorderHabits() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderHabits(orderedIds),
    onMutate: (orderedIds) =>
      applyOptimistic<Habit[]>(client, habitsKey, (old) =>
        orderedIds
          .map((id, index) => {
            const habit = old.find((h) => h.id === id)
            return habit ? { ...habit, sort_order: index } : undefined
          })
          .filter((h): h is Habit => h !== undefined),
      ),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível mudar a ordem.'),
    onSettled: () => client.invalidateQueries({ queryKey: habitsKey }),
  })
}

/** Apagar de vez: some da lista na hora; registros saem do cache depois da confirmação. */
export function useDeleteHabit() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onMutate: (id) =>
      applyOptimistic<Habit[]>(client, habitsKey, (old) => old.filter((h) => h.id !== id)),
    onError: (_e, _v, ctx) => rollback(client, ctx, 'Não foi possível apagar o hábito.'),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: habitsKey })
      void client.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}
