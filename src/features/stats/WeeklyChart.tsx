import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeekBar } from '../../domain/stats.ts'

const label = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`

/** Barras com o percentual de dias concluídos em cada semana. */
export function WeeklyChart({ bars }: { bars: WeekBar[] }) {
  const data = bars.map((b) => ({ week: label(b.start), pct: Math.round(b.rate * 100), ...b }))

  return (
    <div className="h-48" role="img" aria-label="Percentual de dias concluídos por semana">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            unit="%"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(_v, _n, item) => [
              `${item.payload.done} de ${item.payload.total} dias`,
              `Semana de ${item.payload.week}`,
            ]}
            labelFormatter={() => ''}
          />
          <Bar dataKey="pct" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
