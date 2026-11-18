import { useNavigate, useSearchParams } from 'react-router'
import { MonthCalendar } from '../../components/calendar/MonthCalendar.tsx'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Alert } from '../../components/ui/Alert.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { dayCompletion } from '../../domain/calendar.ts'
import { periodOf } from '../../domain/periods.ts'
import { useAllEntries } from '../entries/hooks.ts'
import { useHabits } from '../habits/hooks.ts'
import { useToday, useWeekStart } from '../profile/hooks.ts'
import { DayTile } from './DayTile.tsx'

/** /calendar — o mês inteiro, com quantos hábitos diários foram concluídos em cada dia. */
export function CalendarPage() {
  const today = useToday()
  const weekStart = useWeekStart()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const habits = useHabits()
  const list = habits.data ?? []
  // Hábitos de parar não têm meta de "fazer": ficam fora da fração do dia.
  const building = list.filter((h) => h.type === 'build')
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
      <PageHeader
        title="Calendário"
        description="Verde: todos feitos · verde claro: metade ou mais · vermelho claro: menos da metade · vermelho: nenhum. Toque num dia para abrir a Hoje."
      />
      <div className="bg-surface rounded-2xl border border-slate-200 p-4">
        <MonthCalendar
          month={month}
          min={minMonth}
          max={maxMonth}
          weekStart={weekStart}
          onMonthChange={(m) => setParams({ month: m }, { replace: true })}
          renderDay={(date, inMonth) =>
            inMonth ? (
              <DayTile
                date={date}
                completion={dayCompletion(building, entries.data ?? [], date)}
                isToday={date === today}
                future={date > today}
                disabled={date > today || date < firstDay}
                onOpen={(d) => void navigate(d === today ? '/' : `/?date=${d}`)}
              />
            ) : null
          }
        />
      </div>
    </>
  )
}
