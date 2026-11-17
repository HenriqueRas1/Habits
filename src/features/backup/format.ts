import { z } from 'zod'
import type { Entry, Habit, Task } from '../../types/domain.ts'

/** Formato do arquivo de backup. Suba a versão se o formato mudar de um jeito incompatível. */
export const BACKUP_VERSION = 1

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const nullableText = z.string().nullable()

const habitSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(60),
  description: nullableText,
  icon: z.string(),
  color: z.string(),
  type: z.enum(['build', 'quit']),
  goal_kind: z.enum(['check', 'count', 'duration']),
  goal_target: z.number().int().positive(),
  goal_unit: nullableText,
  goal_period: z.enum(['day', 'week', 'month']),
  schedule_days: z.array(z.number().int().min(0).max(6)).nullable(),
  start_date: date,
  quit_started_at: nullableText,
  sort_order: z.number().int(),
  archived_at: nullableText,
  created_at: z.string(),
})

const entrySchema = z.object({
  id: z.uuid(),
  habit_id: z.uuid(),
  entry_date: date,
  kind: z.enum(['done', 'skip', 'relapse']),
  value: z.number().min(0),
  source: z.enum(['manual', 'timer']),
  started_at: nullableText,
  ended_at: nullableText,
  note: nullableText,
  created_at: z.string(),
})

const taskSchema = z.object({
  id: z.uuid(),
  task_date: date,
  title: z.string().min(1).max(200),
  done_at: nullableText,
  sort_order: z.number().int(),
  created_at: z.string(),
})

const backupSchema = z.object({
  app: z.literal('habitos'),
  version: z.literal(BACKUP_VERSION),
  exported_at: z.string(),
  profile: z.object({
    timezone: z.string(),
    week_start: z.number().int().min(0).max(1),
    theme: z.enum(['light', 'dark', 'system']),
  }),
  habits: z.array(habitSchema),
  entries: z.array(entrySchema),
  tasks: z.array(taskSchema),
})

export type Backup = z.infer<typeof backupSchema>
export type BackupHabit = z.infer<typeof habitSchema>
export type BackupEntry = z.infer<typeof entrySchema>
export type BackupTask = z.infer<typeof taskSchema>

type Source = {
  profile: Backup['profile']
  habits: Habit[]
  entries: Entry[]
  tasks: Task[]
}

/** Monta o backup. Sem user_id nem updated_at: ao restaurar, o dono é quem está logado. */
export function buildBackup(source: Source, now: Date): Backup {
  return {
    app: 'habitos',
    version: BACKUP_VERSION,
    exported_at: now.toISOString(),
    profile: source.profile,
    habits: source.habits.map((h) => habitSchema.parse(h)),
    entries: source.entries.map((e) => entrySchema.parse({ ...e, value: Number(e.value) })),
    tasks: source.tasks.map((t) => taskSchema.parse(t)),
  }
}

/** Lê e confere um arquivo de backup. Lança erro com mensagem em português se não servir. */
export function parseBackup(text: string): Backup {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }
  const result = backupSchema.safeParse(json)
  if (!result.success) {
    throw new Error('Este arquivo não é um backup do Hábitos (ou é de uma versão incompatível).')
  }
  const habitIds = new Set(result.data.habits.map((h) => h.id))
  if (result.data.entries.some((e) => !habitIds.has(e.habit_id))) {
    throw new Error('O backup tem registros de hábitos que não estão no arquivo.')
  }
  return result.data
}

export type CurrentIds = { habits: Set<string>; entries: Set<string>; tasks: Set<string> }

/** Resumo para confirmar antes de restaurar: quanto há no arquivo e quanto não existe hoje. */
export function summarize(backup: Backup, current: CurrentIds) {
  return {
    habits: backup.habits.length,
    entries: backup.entries.length,
    tasks: backup.tasks.length,
    newHabits: backup.habits.filter((h) => !current.habits.has(h.id)).length,
    newEntries: backup.entries.filter((e) => !current.entries.has(e.id)).length,
    newTasks: backup.tasks.filter((t) => !current.tasks.has(t.id)).length,
  }
}

/** Marca de ordem de bytes: faz o Excel abrir o CSV como UTF-8 (acentos certos). */
const BOM = String.fromCharCode(0xfeff)

const KIND_LABEL = { done: 'feito', skip: 'pulado', relapse: 'recaída' } as const

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value)
  return /[";\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/**
 * Registros em CSV (separador ";", como o Excel em português espera), um por linha.
 * Começa com BOM para o Excel reconhecer os acentos.
 */
export function entriesCsv(habits: Habit[], entries: Entry[]): string {
  const names = new Map(habits.map((h) => [h.id, h.name]))
  const header = ['data', 'habito', 'tipo', 'valor', 'origem', 'nota']
  const rows = [...entries]
    .sort(
      (a, b) =>
        a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at),
    )
    .map((e) => [
      e.entry_date,
      names.get(e.habit_id) ?? '',
      KIND_LABEL[e.kind],
      Number(e.value),
      e.source,
      e.note,
    ])
  return BOM + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n'
}
