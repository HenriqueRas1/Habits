import { describe, expect, it } from 'vitest'
import { makeEntry, makeHabit } from '../../test/factories.ts'
import type { Task } from '../../types/domain.ts'
import { buildBackup, entriesCsv, parseBackup, summarize } from './format.ts'

const NOW = new Date('2026-03-10T18:00:00Z')
const profile = { timezone: 'America/Sao_Paulo', week_start: 1, theme: 'light' as const }

function task(): Task {
  return {
    id: crypto.randomUUID(),
    user_id: '00000000-0000-0000-0000-000000000001',
    task_date: '2026-03-10',
    title: 'Pagar a luz',
    done_at: null,
    sort_order: 0,
    created_at: '2026-03-10T12:00:00Z',
    updated_at: '2026-03-10T12:00:00Z',
  }
}

describe('backup JSON', () => {
  const habit = makeHabit({ name: 'Ler', archived_at: '2026-02-01T00:00:00Z' })
  const entry = makeEntry({ habit_id: habit.id, entry_date: '2026-03-09', note: 'cap. 3' })

  it('ida e volta (exportar → importar) não perde nada', () => {
    const backup = buildBackup({ profile, habits: [habit], entries: [entry], tasks: [task()] }, NOW)
    const parsed = parseBackup(JSON.stringify(backup))

    expect(parsed).toEqual(backup)
    expect(parsed.habits[0]).toMatchObject({ id: habit.id, archived_at: habit.archived_at })
    expect(parsed.entries[0]).toMatchObject({ id: entry.id, note: 'cap. 3', value: 1 })
    expect(parsed.exported_at).toBe(NOW.toISOString())
  })

  it('não leva user_id nem updated_at (o dono é quem restaura)', () => {
    const backup = buildBackup({ profile, habits: [habit], entries: [entry], tasks: [] }, NOW)
    expect(backup.habits[0]).not.toHaveProperty('user_id')
    expect(backup.entries[0]).not.toHaveProperty('updated_at')
  })

  it('recusa arquivo que não é JSON', () => {
    expect(() => parseBackup('isso não é json')).toThrow('O arquivo não é um JSON válido.')
  })

  it('recusa JSON que não é backup do app', () => {
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrow(/não é um backup do Hábitos/)
  })

  it('recusa registros de hábitos que não estão no arquivo', () => {
    const backup = buildBackup({ profile, habits: [], entries: [], tasks: [] }, NOW)
    const broken = {
      ...backup,
      entries: [
        {
          ...buildBackup({ profile, habits: [habit], entries: [entry], tasks: [] }, NOW).entries[0],
        },
      ],
    }
    expect(() => parseBackup(JSON.stringify(broken))).toThrow(/registros de hábitos/)
  })

  it('resumo conta o que não existe hoje (hábito apagado volta com o histórico)', () => {
    const other = makeEntry({ habit_id: habit.id, entry_date: '2026-03-08' })
    const backup = buildBackup(
      { profile, habits: [habit], entries: [entry, other], tasks: [] },
      NOW,
    )
    const current = {
      habits: new Set<string>(),
      entries: new Set([entry.id]),
      tasks: new Set<string>(),
    }
    expect(summarize(backup, current)).toEqual({
      habits: 1,
      entries: 2,
      tasks: 0,
      newHabits: 1,
      newEntries: 1,
      newTasks: 0,
    })
  })
})

describe('entriesCsv', () => {
  it('uma linha por registro, com ";" e aspas quando precisa', () => {
    const habit = makeHabit({ name: 'Ler; livros' })
    const csv = entriesCsv(
      [habit],
      [
        makeEntry({
          habit_id: habit.id,
          entry_date: '2026-03-10',
          value: 25,
          source: 'timer',
          note: 'disse "ótimo"',
        }),
        makeEntry({ habit_id: habit.id, entry_date: '2026-03-09', kind: 'skip', value: 0 }),
      ],
    )
    expect(csv.charCodeAt(0)).toBe(0xfeff) // BOM
    expect(csv.slice(1).split('\r\n')).toEqual([
      'data;habito;tipo;valor;origem;nota',
      '2026-03-09;"Ler; livros";pulado;0;manual;',
      '2026-03-10;"Ler; livros";feito;25;timer;"disse ""ótimo"""',
      '',
    ])
  })
})
