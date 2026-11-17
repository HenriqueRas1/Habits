import { useSearchParams } from 'react-router'
import { MonthCalendar } from '../../components/calendar/MonthCalendar.tsx'
import { formatQuitDuration, milestones } from '../../domain/quit.ts'
import { formatDayLabel, toDateTimeInput } from '../../lib/dates.ts'
import { useNow } from '../../lib/useNow.ts'
import type { Entry, Habit } from '../../types/domain.ts'
import { useSession } from '../auth/sessionContext.ts'
import { useEntryAction } from '../entries/hooks.ts'
import { useTimezone, useWeekStart } from '../profile/hooks.ts'
import { Stat } from '../habits/detail/BuildDetail.tsx'
import { relapseMoments, statsFor } from './relapses.ts'

type Props = { habit: Habit; entries: Entry[]; today: string }

/** Tela de um hábito de parar: contagem, recorde, calendário de recaídas e lista editável. */
export function QuitDetail({ habit, entries, today }: Props) {
  const now = useNow(60_000)
  const timezone = useTimezone()
  const weekStart = useWeekStart()
  const { session } = useSession()
  const { mutate } = useEntryAction(session?.user.id ?? '')
  const [params, setParams] = useSearchParams()

  const stats = statsFor(habit, entries, timezone, now)
  const { reached, next, daysToNext } = milestones(stats.currentMs)
  const relapses = entries
    .filter((e) => e.kind === 'relapse')
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
  const relapseDays = new Set(relapses.map((e) => e.entry_date))
  const moments = relapseMoments(relapses, timezone)

  const minMonth = habit.start_date.slice(0, 7)
  const maxMonth = today.slice(0, 7)
  const raw = params.get('month') ?? maxMonth
  const month = raw >= minMonth && raw <= maxMonth ? raw : maxMonth

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Sem há" value={formatQuitDuration(stats.currentMs)} />
        <Stat label="Recorde" value={`🏆 ${formatQuitDuration(stats.recordMs)}`} />
      </div>
      <p className="mb-6 text-sm text-slate-600">
        {reached ? `🎉 Marco de ${reached} ${reached === 1 ? 'dia' : 'dias'} atingido. ` : ''}
        {next
          ? `Faltam ${daysToNext} ${daysToNext === 1 ? 'dia' : 'dias'} para ${next}.`
          : 'Todos os marcos atingidos!'}
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <MonthCalendar
          month={month}
          min={minMonth}
          max={maxMonth}
          weekStart={weekStart}
          onMonthChange={(m) => setParams({ month: m }, { replace: true })}
          renderDay={(date, inMonth) =>
            inMonth ? (
              <span
                aria-label={`${formatDayLabel(date)}${relapseDays.has(date) ? ': recaída' : ''}`}
                className={`flex aspect-square w-full items-center justify-center rounded-lg text-sm ${
                  relapseDays.has(date)
                    ? 'bg-red-100 font-semibold text-red-700'
                    : date > today || date < habit.start_date
                      ? 'text-slate-300'
                      : ''
                }`}
              >
                {Number(date.slice(8))}
              </span>
            ) : null
          }
        />
      </div>

      <section
        aria-label="Recaídas"
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-semibold">Recaídas</h2>
        {relapses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nenhuma recaída registrada. 💪</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100">
            {relapses.map((e, i) => (
              <li key={e.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium first-letter:uppercase">
                    {formatDayLabel(e.entry_date)} ·{' '}
                    {toDateTimeInput(moments[i], timezone).slice(11)}
                  </p>
                  {e.note && <p className="truncate text-sm text-slate-500 italic">{e.note}</p>}
                </div>
                <button
                  type="button"
                  aria-label={`Apagar recaída de ${formatDayLabel(e.entry_date)}`}
                  onClick={() =>
                    window.confirm('Apagar esta recaída? A contagem será recalculada.') &&
                    mutate({ type: 'delete', ids: [e.id] })
                  }
                  className="min-h-11 px-2 text-sm font-medium text-red-700 hover:underline"
                >
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
