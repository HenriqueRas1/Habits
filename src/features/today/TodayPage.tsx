import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { currentStreak } from '../../domain/streaks.ts'
import { formatDayLabel } from '../../lib/dates.ts'
import type { Entry } from '../../types/domain.ts'
import { useSession } from '../auth/sessionContext.ts'
import { useRecentEntries, useToggleCheck } from '../entries/hooks.ts'
import { useHabits, useReorderHabits } from '../habits/hooks.ts'
import { useToday } from '../profile/hooks.ts'
import { EmptyToday } from './EmptyToday.tsx'
import { HabitCard } from './HabitCard.tsx'
import { NewHabitFab } from './NewHabitFab.tsx'

export function TodayPage() {
  const today = useToday()
  const { session } = useSession()
  const habits = useHabits()
  const entries = useRecentEntries(today)
  const toggle = useToggleCheck()
  const reorder = useReorderHabits()
  const [reordering, setReordering] = useState(false)

  const byHabit = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of entries.data ?? []) map.set(e.habit_id, [...(map.get(e.habit_id) ?? []), e])
    return map
  }, [entries.data])

  if (habits.isPending || entries.isPending) return <FullScreenSpinner />
  if (habits.isError || entries.isError) {
    return <Alert tone="error">Não foi possível carregar seus hábitos. Verifique a internet.</Alert>
  }

  const list = habits.data
  const move = (index: number, delta: number) => {
    const ids = list.map((h) => h.id)
    ;[ids[index], ids[index + delta]] = [ids[index + delta], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <>
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hoje</h1>
          <p className="mt-1 text-sm text-slate-500 first-letter:uppercase">
            {formatDayLabel(today)}
          </p>
        </div>
        {list.length > 0 && (
          <div className="flex items-center gap-2">
            {list.length > 1 && (
              <Button variant="secondary" onClick={() => setReordering((r) => !r)}>
                {reordering ? 'Concluir' : 'Reordenar'}
              </Button>
            )}
            <Link
              to="/habits/new"
              className="bg-brand-600 hover:bg-brand-700 hidden min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-white lg:inline-flex"
            >
              Novo hábito
            </Link>
          </div>
        )}
      </header>

      {list.length === 0 ? (
        <EmptyToday />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((habit, index) => {
            const habitEntries = byHabit.get(habit.id) ?? []
            const doneIds = habitEntries
              .filter((e) => e.entry_date === today && e.kind === 'done')
              .map((e) => e.id)
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                done={doneIds.length > 0}
                streak={currentStreak(habit, habitEntries, today, 1)}
                onToggle={() =>
                  toggle.mutate({
                    input: {
                      habitId: habit.id,
                      date: today,
                      userId: session?.user.id ?? '',
                      doneIds,
                    },
                    newId: crypto.randomUUID(),
                  })
                }
                reorder={
                  reordering
                    ? {
                        onUp: index > 0 ? () => move(index, -1) : undefined,
                        onDown: index < list.length - 1 ? () => move(index, 1) : undefined,
                      }
                    : undefined
                }
              />
            )
          })}
        </ul>
      )}

      <NewHabitFab />
    </>
  )
}
