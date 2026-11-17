import { useNavigate, useSearchParams } from 'react-router'
import { MonthCalendar } from '../../components/calendar/MonthCalendar.tsx'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Alert } from '../../components/ui/Alert.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { dayCompletion } from '../../domain/calendar.ts'
import { periodOf } from '../../domain/periods.ts'
import { formatDayLabel } from '../../lib/dates.ts'
import { useAllEntries } from '../entries/hooks.ts'
import { useHabits } from '../habits/hooks.ts'
import { useToday, useWeekStart } from '../profile/hooks.ts'

/** /calendar — o mês inteiro, com quantos hábitos diários foram concluídos em cada dia. */
export function CalendarPage() {
  const today = useToday()
  const weekStart = useWeekStart()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const habits = useHabits()
  const list = habits.data ?? []
  const firstDay = list.reduce((min, h) => (h.start_date < min ? h.start_date : min), today)

  const maxMonth = today.slice(0, 7)
  const minMonth = firstDay.slice(0, 7)
  const raw = params.get('month') ?? maxMonth
  const month = raw >= minMonth && raw <= maxMonth ? raw : maxMonth
  const { start, end } = periodOf(`${month}-01`, 'month', weekStart)
  const entries = useAllEntries(start, end, habits.isSuccess)

  if (habits.isPending || (list.length > 0 && entries.isPending)) return <FullScreenSpinner />
  if (habits.isError || entries.isError) {
    return <Alert tone="error">Não foi possível carregar o calendário. Verifique a internet.</Alert>
  }

  return (
    <>
      <PageHeader title="Calendário" description="Toque num dia para abrir a Hoje naquela data." />
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <MonthCalendar
          month={month}
          min={minMonth}
          max={maxMonth}
          weekStart={weekStart}
          onMonthChange={(m) => setParams({ month: m }, { replace: true })}
          renderDay={(date, inMonth) => {
            if (!inMonth) return null
            const locked = date > today || date < firstDay
            const c = dayCompletion(list, entries.data ?? [], date)
            const ratio = c.total > 0 ? c.done / c.total : 0
            return (
              <button
                type="button"
                disabled={locked}
                onClick={() => void navigate(date === today ? '/' : `/?date=${date}`)}
                aria-label={`${formatDayLabel(date)}: ${c.done} de ${c.total} hábitos`}
                style={
                  !locked && c.done > 0
                    ? { backgroundColor: `rgb(79 70 229 / ${0.15 + ratio * 0.75})` }
                    : undefined
                }
                className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-sm transition-colors disabled:text-slate-300 ${
                  ratio > 0.5 ? 'text-white' : ''
                } ${date === today ? 'ring-brand-500 ring-2' : ''} ${
                  !locked && c.done === 0 ? 'hover:bg-slate-100' : ''
                }`}
              >
                <span className="font-medium">{Number(date.slice(8))}</span>
                {!locked && c.total > 0 && (
                  <span className="text-[10px] leading-none opacity-80">
                    {c.done}/{c.total}
                  </span>
                )}
                {!locked && c.others > 0 && (
                  <span
                    aria-hidden
                    className="bg-brand-500 absolute top-1 right-1 size-1.5 rounded-full"
                  />
                )}
              </button>
            )
          }}
        />
      </div>
    </>
  )
}
