import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Segmented } from '../../components/ui/Segmented.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { TextField } from '../../components/ui/TextField.tsx'
import { ColorPicker } from './ColorPicker.tsx'
import { GoalFields } from './GoalFields.tsx'
import { IconPicker } from './IconPicker.tsx'
import { habitFormSchema, type HabitFormValues } from './habitSchema.ts'

type Props = {
  today: string
  defaultValues: HabitFormValues
  submitLabel: string
  onSubmit: (values: HabitFormValues) => void
  onCancel: () => void
}

export function HabitForm({ today, defaultValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema(today)),
    defaultValues,
  })
  const type = useWatch({ control, name: 'type' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <TextField
        label="Nome"
        placeholder="Ex.: Beber água"
        autoComplete="off"
        maxLength={60}
        error={errors.name?.message}
        {...register('name')}
      />

      <Controller
        control={control}
        name="icon"
        render={({ field }) => (
          <IconPicker value={field.value} onChange={field.onChange} error={errors.icon?.message} />
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Segmented
            legend="Tipo"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'build', label: 'Construir' },
              { value: 'quit', label: 'Parar' },
            ]}
          />
        )}
      />

      {type === 'quit' ? (
        <TextField
          label="Sem desde"
          type="datetime-local"
          max={`${today}T23:59`}
          error={errors.quit_started_at?.message}
          {...register('quit_started_at')}
        />
      ) : (
        <>
          <GoalFields control={control} register={register} errors={errors} />
          <TextField
            label="Começa em"
            type="date"
            max={today}
            error={errors.start_date?.message}
            {...register('start_date')}
          />
        </>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
