import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { isDateString } from '../../lib/dates.ts'
import type { Entry } from '../../types/domain.ts'
import { useSession } from '../auth/sessionContext.ts'
import { useAllEntries } from '../entries/hooks.ts'
import { useHabits, useReorderHabits } from '../habits/hooks.ts'
import { useToday, useWeekStart } from '../profile/hooks.ts'
import { DateNav } from './DateNav.tsx'
import { EmptyToday } from './EmptyToday.tsx'
import { buildHabitDay } from './habitDay.ts'
import { HabitCard } from './HabitCard.tsx'
import { NewHabitFab } from './NewHabitFab.tsx'
import { useDayActions } from './useDayActions.ts'

export function TodayPage() {
  const today = useToday()
  const weekStart = useWeekStart()
  const { session } = useSession()
  const [params, setParams] = useSearchParams()
  const habits = useHabits()
  const list = useMemo(() => habits.data ?? [], [habits.data])
  // Histórico inteiro, para o streak: do início do hábito mais antigo até hoje.
  const from = list.reduce((min, h) => (h.start_date < min ? h.start_date : min), today)
  const entries = useAllEntries(from, today, habits.isSuccess)
  const actionsFor = useDayActions(session?.user.id ?? '')
  const reorder = useReorderHabits()
  const [reordering, setReordering] = useState(false)

  const raw = params.get('date') ?? today
  const date = isDateString(raw) && raw <= today && raw >= from ? raw : today
  const setDate = (d: string) => setParams(d === today ? {} : { date: d }, { replace: true })

  const byHabit = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of entries.data ?? []) map.set(e.habit_id, [...(map.get(e.habit_id) ?? []), e])
    return map
  }, [entries.data])

  if (habits.isPending || (list.length > 0 && entries.isPending)) return <FullScreenSpinner />
  if (habits.isError || entries.isError) {
    return <Alert tone="error">Não foi possível carregar seus hábitos. Verifique a internet.</Alert>
  }

  const days = list
    .filter((h) => h.start_date <= date)
    .map((h) => buildHabitDay(h, byHabit.get(h.id) ?? [], date, today, weekStart))
  const scheduled = days.filter((d) => d.scheduled)
  const offSchedule = days.filter((d) => !d.scheduled)

  const move = (index: number, delta: number) => {
    const ids = list.map((h) => h.id)
    ;[ids[index], ids[index + delta]] = [ids[index + delta], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Hoje</h1>
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
      ) : reordering ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((habit, index) => (
            <HabitCard
              key={habit.id}
              day={buildHabitDay(habit, byHabit.get(habit.id) ?? [], today, today, weekStart)}
              isToday
              reorder={{
                onUp: index > 0 ? () => move(index, -1) : undefined,
                onDown: index < list.length - 1 ? () => move(index, 1) : undefined,
              }}
            />
          ))}
        </ul>
      ) : (
        <>
          <DateNav date={date} today={today} min={from} onChange={setDate} />
          <DayList days={scheduled} actionsFor={actionsFor} isToday={date === today} />
          {offSchedule.length > 0 && (
            <>
              <h2 className="mt-6 mb-3 text-sm font-semibold text-slate-500">
                Fora da agenda neste dia
              </h2>
              <DayList days={offSchedule} actionsFor={actionsFor} isToday={date === today} />
            </>
          )}
        </>
      )}

      <NewHabitFab />
    </>
  )
}

function DayList({
  days,
  actionsFor,
  isToday,
}: {
  days: ReturnType<typeof buildHabitDay>[]
  actionsFor: ReturnType<typeof useDayActions>
  isToday: boolean
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {days.map((day) => (
        <HabitCard key={day.habit.id} day={day} actions={actionsFor(day)} isToday={isToday} />
      ))}
    </ul>
  )
}
