import { z } from 'zod'
import { isDateString } from '../../lib/dates.ts'

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

/** Mesmas regras da tabela habits (0001_init.sql). */
export function habitFormSchema(today: string) {
  return z.object({
    name: z.string().trim().min(1, 'Dê um nome ao hábito.').max(60, 'Use no máximo 60 caracteres.'),
    icon: z.string().trim().min(1, 'Escolha um emoji.').max(8, 'Use só um emoji.'),
    color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Cor inválida.'),
    start_date: z
      .string()
      .refine(isDateString, 'Data inválida.')
      .refine((d) => d <= today, 'A data de início não pode ser no futuro.'),
  })
}

export type HabitFormValues = z.infer<ReturnType<typeof habitFormSchema>>
