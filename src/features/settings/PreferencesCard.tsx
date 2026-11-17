import { useId } from 'react'
import { Segmented } from '../../components/ui/Segmented.tsx'
import type { Theme } from '../../lib/theme.ts'
import { useTheme, useTimezone, useUpdateProfile, useWeekStart } from '../profile/hooks.ts'

/** Todos os fusos que o navegador conhece; o atual entra mesmo se não estiver na lista. */
function timezones(current: string): string[] {
  const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  return all.includes(current) ? all : [current, ...all]
}

/** Fuso, início da semana e tema: salvos no perfil, valem em todos os aparelhos. */
export function PreferencesCard({ userId }: { userId: string }) {
  const timezone = useTimezone()
  const weekStart = useWeekStart()
  const theme = useTheme()
  const { mutate } = useUpdateProfile(userId)
  const tzId = useId()

  return (
    <section
      aria-label="Preferências"
      className="bg-surface mb-6 flex flex-col gap-5 rounded-2xl border border-slate-200 p-5"
    >
      <h2 className="text-sm font-semibold text-slate-500">Preferências</h2>

      <Segmented<Theme>
        legend="Tema"
        value={theme}
        onChange={(t) => mutate({ theme: t })}
        options={[
          { value: 'light', label: 'Claro' },
          { value: 'dark', label: 'Escuro' },
          { value: 'system', label: 'Sistema' },
        ]}
      />

      <Segmented<'1' | '0'>
        legend="A semana começa no"
        value={weekStart === 0 ? '0' : '1'}
        onChange={(v) => mutate({ week_start: Number(v) })}
        options={[
          { value: '1', label: 'Segunda' },
          { value: '0', label: 'Domingo' },
        ]}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={tzId} className="text-sm font-medium text-slate-700">
          Fuso horário
        </label>
        <select
          id={tzId}
          value={timezone}
          onChange={(e) => mutate({ timezone: e.target.value })}
          className="bg-surface min-h-11 rounded-lg border border-slate-300 px-3 text-base"
        >
          {timezones(timezone).map((tz) => (
            <option key={tz} value={tz}>
              {tz.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
        <p className="text-sm text-slate-500">Define quando o dia vira para os seus hábitos.</p>
      </div>
    </section>
  )
}
