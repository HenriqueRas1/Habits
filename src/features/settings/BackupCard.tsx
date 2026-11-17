import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ChangeEvent } from 'react'
import { Alert } from '../../components/ui/Alert.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { downloadText } from '../../lib/download.ts'
import { useTheme, useTimezone, useToday, useWeekStart } from '../profile/hooks.ts'
import { fetchEverything, restoreBackup } from '../backup/api.ts'
import { buildBackup, entriesCsv, parseBackup, summarize } from '../backup/format.ts'

type Status = { tone: 'success' | 'error'; text: string } | null

/** Exportar (JSON e CSV) e importar o backup JSON. */
export function BackupCard({ userId }: { userId: string }) {
  const client = useQueryClient()
  const today = useToday()
  const profile = { timezone: useTimezone(), week_start: useWeekStart(), theme: useTheme() }
  const [busy, setBusy] = useState<'json' | 'csv' | 'import' | null>(null)
  const [status, setStatus] = useState<Status>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function run(kind: 'json' | 'csv' | 'import', task: () => Promise<Status>) {
    setBusy(kind)
    setStatus(null)
    try {
      setStatus(await task())
    } catch (e) {
      setStatus({ tone: 'error', text: e instanceof Error ? e.message : 'Algo deu errado.' })
    } finally {
      setBusy(null)
    }
  }

  const exportJson = () =>
    run('json', async () => {
      const backup = buildBackup({ profile, ...(await fetchEverything()) }, new Date())
      downloadText(
        `habitos-backup-${today}.json`,
        JSON.stringify(backup, null, 2),
        'application/json',
      )
      return {
        tone: 'success',
        text: `Backup baixado: ${backup.habits.length} hábitos, ${backup.entries.length} registros.`,
      }
    })

  const exportCsv = () =>
    run('csv', async () => {
      const { habits, entries } = await fetchEverything()
      downloadText(
        `habitos-registros-${today}.csv`,
        entriesCsv(habits, entries),
        'text/csv;charset=utf-8',
      )
      return { tone: 'success', text: `Planilha baixada com ${entries.length} registros.` }
    })

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await run('import', async () => {
      const backup = parseBackup(await file.text())
      const now = await fetchEverything()
      const s = summarize(backup, {
        habits: new Set(now.habits.map((h) => h.id)),
        entries: new Set(now.entries.map((e) => e.id)),
        tasks: new Set(now.tasks.map((t) => t.id)),
      })
      const ok = window.confirm(
        `Restaurar backup de ${backup.exported_at.slice(0, 10)}?\n\n` +
          `${s.habits} hábitos, ${s.entries} registros, ${s.tasks} tarefas no arquivo.\n` +
          `Não existem hoje: ${s.newHabits} hábitos, ${s.newEntries} registros, ${s.newTasks} tarefas.\n\n` +
          'O que existe volta a ficar igual ao backup. Nada que você tem hoje é apagado.',
      )
      if (!ok) return null
      await restoreBackup(backup, userId)
      await client.invalidateQueries()
      return {
        tone: 'success',
        text: `Backup restaurado: ${s.newHabits} hábitos e ${s.newEntries} registros voltaram.`,
      }
    })
  }

  return (
    <section
      aria-label="Dados"
      className="bg-surface mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 p-5"
    >
      <h2 className="text-sm font-semibold text-slate-500">Dados</h2>
      <p className="text-sm text-slate-600">
        O backup JSON guarda tudo e pode ser importado de volta. A planilha CSV traz os registros
        para abrir no Excel.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button loading={busy === 'json'} onClick={() => void exportJson()}>
          Exportar JSON
        </Button>
        <Button variant="secondary" loading={busy === 'csv'} onClick={() => void exportCsv()}>
          Exportar CSV
        </Button>
        <Button
          variant="secondary"
          loading={busy === 'import'}
          onClick={() => fileInput.current?.click()}
        >
          Importar backup
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          aria-label="Arquivo de backup"
          className="hidden"
          onChange={(e) => void importFile(e)}
        />
      </div>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
    </section>
  )
}
