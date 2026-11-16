import { z } from 'zod'
import { isDateString } from '../../lib/dates.ts'
import type { GoalKind, GoalPeriod, Habit, HabitUpdate } from '../../types/domain.ts'

export const HABIT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
] as const

export const HABIT_ICONS = [
  '✅',
  '💧',
  '📚',
  '🏋️',
  '🧘',
  '🏃',
  '🥗',
  '😴',
  '🎸',
  '✍️',
  '💊',
  '🧹',
  '🚭',
  '📵',
  '🌱',
  '💰',
] as const

const GOAL_KINDS = ['check', 'count', 'duration'] as const satisfies readonly GoalKind[]
const GOAL_PERIODS = ['day', 'week', 'month'] as const satisfies readonly GoalPeriod[]

/** Máximo de dias que uma meta de check pode pedir em cada período. */
const CHECK_MAX: Record<GoalPeriod, number> = { day: 1, week: 7, month: 31 }

/** Mesmas regras da tabela habits (0001_init.sql), mais as regras de meta. */
export function habitFormSchema(today: string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Dê um nome ao hábito.')
        .max(60, 'Use no máximo 60 caracteres.'),
      icon: z.string().trim().min(1, 'Escolha um emoji.').max(8, 'Use só um emoji.'),
      color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Cor inválida.'),
      start_date: z
        .string()
        .refine(isDateString, 'Data inválida.')
        .refine((d) => d <= today, 'A data de início não pode ser no futuro.'),
      goal_kind: z.enum(GOAL_KINDS),
      goal_period: z.enum(GOAL_PERIODS),
      goal_target: z
        .number({ error: 'Informe um número.' })
        .int('Use um número inteiro.')
        .min(1, 'A meta precisa ser pelo menos 1.')
        .max(100_000, 'Meta grande demais.'),
      goal_unit: z.string().trim().max(20, 'Use no máximo 20 caracteres.'),
      schedule_days: z.array(z.number().int().min(0).max(6)),
    })
    .superRefine((v, ctx) => {
      const max = CHECK_MAX[v.goal_period]
      if (v.goal_kind === 'check' && v.goal_period !== 'day' && v.goal_target > max) {
        ctx.addIssue({
          code: 'custom',
          path: ['goal_target'],
          message: `No máximo ${max} dias ${v.goal_period === 'week' ? 'por semana' : 'por mês'}.`,
        })
      }
    })
}

export type HabitFormValues = z.infer<ReturnType<typeof habitFormSchema>>

/** Converte o formulário nas colunas do banco, normalizando o que não se aplica. */
export function toHabitFields(v: HabitFormValues) {
  const daily = v.goal_period === 'day'
  const days = [...new Set(v.schedule_days)].sort()
  return {
    name: v.name,
    icon: v.icon,
    color: v.color,
    start_date: v.start_date,
    goal_kind: v.goal_kind,
    goal_period: v.goal_period,
    goal_target: v.goal_kind === 'check' && daily ? 1 : v.goal_target,
    goal_unit: v.goal_kind === 'count' && v.goal_unit ? v.goal_unit : null,
    schedule_days: daily && days.length > 0 && days.length < 7 ? days : null,
  } satisfies HabitUpdate
}

export function fromHabit(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    start_date: habit.start_date,
    goal_kind: habit.goal_kind,
    goal_period: habit.goal_period,
    goal_target: habit.goal_target,
    goal_unit: habit.goal_unit ?? '',
    schedule_days: habit.schedule_days ?? [],
  }
}

function pick<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.find((o) => o === value) ?? fallback
}

/** Valores iniciais de um hábito novo; as sugestões da Hoje preenchem pela URL. */
export function newHabitDefaults(params: URLSearchParams, today: string): HabitFormValues {
  const target = Number(params.get('target'))
  return {
    name: params.get('name') ?? '',
    icon: params.get('icon') ?? '✅',
    color: HABIT_COLORS[0],
    start_date: today,
    goal_kind: pick(params.get('kind'), GOAL_KINDS, 'check'),
    goal_period: pick(params.get('period'), GOAL_PERIODS, 'day'),
    goal_target: Number.isInteger(target) && target > 0 ? target : 1,
    goal_unit: params.get('unit') ?? '',
    schedule_days: [],
  }
}
