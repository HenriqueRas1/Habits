import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'
import { Segmented } from '../../components/ui/Segmented.tsx'
import { TextField } from '../../components/ui/TextField.tsx'
import type { HabitFormValues } from './habitSchema.ts'
import { WeekdayPicker } from './WeekdayPicker.tsx'

type Props = {
  control: Control<HabitFormValues>
  register: UseFormRegister<HabitFormValues>
  errors: FieldErrors<HabitFormValues>
}

const PERIOD_WORD = { day: 'por dia', week: 'por semana', month: 'por mês' } as const

/** Tipo de meta, valor, unidade, período e dias da semana. */
export function GoalFields({ control, register, errors }: Props) {
  const kind = useWatch({ control, name: 'goal_kind' })
  const period = useWatch({ control, name: 'goal_period' })
  const showTarget = kind !== 'check' || period !== 'day'

  const targetLabel =
    kind === 'check'
      ? `Quantos dias ${PERIOD_WORD[period]}`
      : kind === 'duration'
        ? `Minutos ${PERIOD_WORD[period]}`
        : `Quantidade ${PERIOD_WORD[period]}`

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="goal_kind"
        render={({ field }) => (
          <Segmented
            legend="Meta"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'check', label: 'Feito / não' },
              { value: 'count', label: 'Quantidade' },
              { value: 'duration', label: 'Tempo' },
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="goal_period"
        render={({ field }) => (
          <Segmented
            legend="Período"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'day', label: 'Dia' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
            ]}
          />
        )}
      />

      {showTarget && (
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={targetLabel}
            type="number"
            inputMode="numeric"
            min={1}
            error={errors.goal_target?.message}
            {...register('goal_target', { valueAsNumber: true })}
          />
          {kind === 'count' && (
            <TextField
              label="Unidade"
              placeholder="Ex.: copos"
              maxLength={20}
              error={errors.goal_unit?.message}
              {...register('goal_unit')}
            />
          )}
        </div>
      )}

      {period === 'day' && (
        <Controller
          control={control}
          name="schedule_days"
          render={({ field }) => <WeekdayPicker value={field.value} onChange={field.onChange} />}
        />
      )}
    </div>
  )
}
