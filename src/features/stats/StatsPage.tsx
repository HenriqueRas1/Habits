import { useState, type ReactNode } from 'react'
import { PageHeader } from '../../components/layout/PageHeader.tsx'
import { Alert } from '../../components/ui/Alert.tsx'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { Segmented } from '../../components/ui/Segmented.tsx'
import {
  completionRate,
  minutesTotals,
  streakRanking,
  weeklyBars,
  yearHeatmap,
} from '../../domain/stats.ts'
import { addDays } from '../../lib/dates.ts'
import { useAllEntries } from '../entries/hooks.ts'
import { useHabits } from '../habits/hooks.ts'
import { useToday, useWeekStart } from '../profile/hooks.ts'
import { formatMinutes } from './format.ts'
import { MinutesList, RatesList, StreakList } from './StatsLists.tsx'
import { WeeklyChart } from './WeeklyChart.tsx'
import { YearHeatmap } from './YearHeatmap.tsx'

type Range = '7' | '30' | '90'

/** /stats — heatmap do ano, barras por semana, taxas, ranking de streaks e minutos. */
export function StatsPage() {
  const today = useToday()
  const weekStart = useWeekStart()
  const habits = useHabits()
  const list = (habits.data ?? []).filter((h) => h.type === 'build')
  // Histórico inteiro (para os streaks), ou pelo menos o último ano (para o heatmap).
  const yearAgo = addDays(today, -370)
  const from = list.reduce((min, h) => (h.start_date < min ? h.start_date : min), yearAgo)
  const entries = useAllEntries(from, today, habits.isSuccess)
  const [range, setRange] = useState<Range>('30')

  if (habits.isPending || (list.length > 0 && entries.isPending)) return <FullScreenSpinner />
  if (habits.isError || entries.isError) {
    return (
      <Alert tone="error">Não foi possível carregar as estatísticas. Verifique a internet.</Alert>
    )
  }
  if (list.length === 0) {
    return (
      <>
        <PageHeader title="Estatísticas" />
        <p className="text-slate-500">Crie um hábito para ver suas estatísticas aqui.</p>
      </>
    )
  }

  const all = entries.data ?? []
  const days = Number(range)
  const rates = list.map((habit) => ({
    habit,
    rate: completionRate(habit, all, today, days, weekStart),
  }))
  const minutes = minutesTotals(list, all, today, days)
  const windowLabel = `nos últimos ${days} dias`

  return (
    <>
      <PageHeader title="Estatísticas" />

      <Card title="Último ano">
        <YearHeatmap weeks={yearHeatmap(list, all, today, weekStart)} today={today} />
      </Card>

      <Card title="Por semana" subtitle="Dias concluídos dos hábitos diários">
        <WeeklyChart bars={weeklyBars(list, all, today, weekStart)} />
      </Card>

      <div className="mb-4">
        <Segmented
          legend="Período"
          value={range}
          onChange={setRange}
          options={[
            { value: '7', label: '7 dias' },
            { value: '30', label: '30 dias' },
            { value: '90', label: '90 dias' },
          ]}
        />
      </div>

      <Card
        title="Taxa de conclusão"
        subtitle={`Pulados e dias fora da agenda não contam · ${windowLabel}`}
      >
        <RatesList rows={rates} />
      </Card>

      <Card
        title="Minutos"
        subtitle={
          minutes.total > 0 ? `${formatMinutes(minutes.total)} ${windowLabel}` : windowLabel
        }
      >
        <MinutesList rows={minutes.byHabit} total={minutes.total} />
      </Card>

      <Card title="Sequências">
        <StreakList rows={streakRanking(list, all, today, weekStart)} />
      </Card>
    </>
  )
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section aria-label={title} className="bg-surface mb-6 rounded-2xl border border-slate-200 p-4">
      <h2 className="font-semibold">{title}</h2>
      {subtitle && <p className="mb-3 text-sm text-slate-500">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-3'}>{children}</div>
    </section>
  )
}
