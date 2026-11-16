import { useEntryAction } from '../entries/hooks.ts'
import type { HabitDay } from './habitDay.ts'

/** Ações de um cartão da Hoje, todas gravadas na data do cartão. */
export type DayActions = {
  toggleCheck: () => void
  add: (value: number) => void
  removeLast: () => void
  skip: (note: string) => void
  unskip: () => void
  setNote: (note: string) => void
}

export function useDayActions(userId: string) {
  const { mutate } = useEntryAction(userId)

  return (day: HabitDay): DayActions => {
    const base = { habit_id: day.habit.id, entry_date: day.date }
    const add = (value: number) =>
      mutate({ type: 'add', entry: { id: crypto.randomUUID(), ...base, kind: 'done', value } })
    const last = day.doneEntries.at(-1)

    return {
      toggleCheck: () =>
        day.doneEntries.length > 0
          ? mutate({ type: 'delete', ids: day.doneEntries.map((e) => e.id) })
          : add(1),
      add,
      removeLast: () => last && mutate({ type: 'delete', ids: [last.id] }),
      skip: (note) =>
        mutate({
          type: 'add',
          entry: { id: crypto.randomUUID(), ...base, kind: 'skip', value: 0, note: note || null },
        }),
      unskip: () => day.skipEntry && mutate({ type: 'delete', ids: [day.skipEntry.id] }),
      setNote: (note) =>
        day.noteEntry && mutate({ type: 'note', id: day.noteEntry.id, note: note || null }),
    }
  }
}
