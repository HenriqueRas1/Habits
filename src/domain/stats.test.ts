import { describe, expect, it } from 'vitest'
import { makeEntry, makeHabit } from '../test/factories.ts'
import type { Entry, Habit } from '../types/domain.ts'
import { completionRate, minutesTotals, streakRanking, weeklyBars, yearHeatmap } from './stats.ts'

const TODAY = '2026-03-13' // sexta

const done = (habit: Habit, date: string, value = 1, extra: Partial<Entry> = {}): Entry =>
  makeEntry({ habit_id: habit.id, entry_date: date, value, ...extra })
const skip = (habit: Habit, date: string): Entry =>
  makeEntry({ habit_id: habit.id, entry_date: date, kind: 'skip', value: 0 })

describe('completionRate (conta feita à mão)', () => {
  // Seg a sex, começou na segunda 02/03.
  // 02 ✓  03 ✓  04 ✗  05 ✓  06 ✓  (07, 08 fim de semana)  09 ✓  10 pulado  11 ✗  12 ✓  13 hoje, ainda não
  const habit = makeHabit({ start_date: '2026-03-02', schedule_days: [1, 2, 3, 4, 5] })
  const entries = [
    ...['02', '03', '05', '06', '09', '12'].map((d) => done(habit, `2026-03-${d}`)),
    skip(habit, '2026-03-10'),
  ]

  it('7 dias: 2 feitos, 1 perdido; pulado, fim de semana e hoje ficam fora', () => {
    expect(completionRate(habit, entries, TODAY, 7, 1)).toEqual({
      completed: 2,
      missed: 1,
      rate: 2 / 3,
    })
  })

  it('30 dias: só conta a partir do início do hábito', () => {
    expect(completionRate(habit, entries, TODAY, 30, 1)).toEqual({
      completed: 6,
      missed: 2,
      rate: 6 / 8,
    })
  })

  it('hoje feito conta como concluído', () => {
    const withToday = [...entries, done(habit, TODAY)]
    expect(completionRate(habit, withToday, TODAY, 7, 1).completed).toBe(3)
  })

  it('sem períodos avaliáveis: taxa nula', () => {
    const fresh = makeHabit({ start_date: TODAY })
    expect(completionRate(fresh, [], TODAY, 7, 1)).toEqual({ completed: 0, missed: 0, rate: null })
  })

  it('meta semanal: conta semanas; a semana atual em andamento fica fora', () => {
    const weekly = makeHabit({ goal_period: 'week', goal_target: 3, start_date: '2026-02-16' })
    const list = ['2026-03-02', '2026-03-04', '2026-03-06', '2026-03-09'].map((d) =>
      done(weekly, d),
    )
    // Semanas: 16–22/02 ✗, 23/02–01/03 ✗, 02–08/03 ✓, 09–15/03 em andamento
    expect(completionRate(weekly, list, TODAY, 30, 1)).toEqual({
      completed: 1,
      missed: 2,
      rate: 1 / 3,
    })
  })
})

describe('weeklyBars', () => {
  it('percentual de dias concluídos por semana, só hábitos diários de construir', () => {
    const a = makeHabit({ start_date: '2026-03-02' })
    const b = makeHabit({ start_date: '2026-03-02', schedule_days: [1, 3, 5] })
    const weekly = makeHabit({ goal_period: 'week', goal_target: 2, start_date: '2026-03-02' })
    const quit = makeHabit({ type: 'quit', start_date: '2026-03-02' })
    const entries = [
      done(a, '2026-03-02'),
      done(a, '2026-03-03'),
      done(b, '2026-03-02'),
      done(weekly, '2026-03-02'),
      done(a, '2026-03-12'),
    ]

    const bars = weeklyBars([a, b, weekly, quit], entries, TODAY, 1, 2)

    expect(bars).toEqual([
      // 02–08/03: a 7 dias + b 3 dias = 10 possíveis; 3 feitos
      { start: '2026-03-02', end: '2026-03-08', done: 3, total: 10, rate: 0.3 },
      // 09–13/03 (até hoje): a 5 + b 3 (seg, qua, sex) = 8; 1 feito
      { start: '2026-03-09', end: '2026-03-15', done: 1, total: 8, rate: 1 / 8 },
    ])
  })
})

describe('yearHeatmap', () => {
  it('semanas completas do último ano, sem dias futuros', () => {
    const habit = makeHabit({ start_date: '2025-01-01' })
    const weeks = yearHeatmap([habit], [done(habit, '2025-12-31')], '2026-01-02', 1)

    expect(weeks[0][0]?.date).toBe('2024-12-30') // segunda da semana de 03/01/2025
    const cells = weeks.flat()
    expect(cells.find((c) => c?.date === '2025-12-31')).toMatchObject({ done: 1, total: 1 })
    expect(cells.find((c) => c?.date === '2026-01-01')).toMatchObject({ done: 0, total: 1 })
    expect(weeks.at(-1)?.slice(5)).toEqual([null, null]) // 03 e 04/01 ainda não chegaram
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })
})

describe('streakRanking', () => {
  it('ordena pelo streak atual e, no empate, pelo melhor', () => {
    const start = '2026-03-01'
    const a = makeHabit({ name: 'A', start_date: start })
    const b = makeHabit({ name: 'B', start_date: start })
    const c = makeHabit({ name: 'C', start_date: start })
    const entries = [
      ...['01', '02', '03', '04', '12'].map((d) => done(a, `2026-03-${d}`)), // atual 1, melhor 4
      ...['11', '12'].map((d) => done(b, `2026-03-${d}`)), // atual 2
      done(c, '2026-03-12'), // atual 1, melhor 1
    ]
    const ranking = streakRanking([c, a, b], entries, TODAY, 1)
    expect(ranking.map((r) => [r.habit.name, r.current, r.best])).toEqual([
      ['B', 2, 2],
      ['A', 1, 4],
      ['C', 1, 1],
    ])
  })
})

describe('minutesTotals', () => {
  it('soma minutos dos hábitos de tempo na janela, com e sem timer', () => {
    const read = makeHabit({ name: 'Ler', goal_kind: 'duration', goal_target: 20 })
    const run = makeHabit({ name: 'Correr', goal_kind: 'duration', goal_target: 30 })
    const water = makeHabit({ goal_kind: 'count', goal_target: 8 })
    const entries = [
      done(read, '2026-03-13', 25, { source: 'timer' }),
      done(read, '2026-03-10', 10),
      done(read, '2026-03-01', 60), // fora dos 7 dias
      done(run, '2026-03-12', 40),
      skip(run, '2026-03-11'),
      done(water, '2026-03-13', 8),
    ]
    expect(minutesTotals([read, run, water], entries, TODAY, 7)).toEqual({
      total: 75,
      byHabit: [
        { habit: run, minutes: 40 },
        { habit: read, minutes: 35 },
      ],
    })
  })
})
