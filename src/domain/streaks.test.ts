import { describe, expect, it } from 'vitest'
import { addDays } from '../lib/dates.ts'
import { makeEntry, makeHabit } from '../test/factories.ts'
import type { Entry, Habit } from '../types/domain.ts'
import { bestStreak, currentStreak } from './streaks.ts'

const TODAY = '2026-03-10' // terça

const done = (habit: Habit, ...dates: string[]): Entry[] =>
  dates.map((entry_date) => makeEntry({ habit_id: habit.id, entry_date }))

const skip = (habit: Habit, entry_date: string): Entry =>
  makeEntry({ habit_id: habit.id, entry_date, kind: 'skip', value: 0 })

/** Os últimos n dias terminando em `end`, do mais antigo ao mais novo. */
const daysUntil = (end: string, n: number) =>
  Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))

describe('currentStreak', () => {
  it('é zero sem registros', () => {
    expect(currentStreak(makeHabit(), [], TODAY, 1)).toBe(0)
  })

  it('check diário: 5 dias seguidos feitos → 5', () => {
    const habit = makeHabit()
    expect(currentStreak(habit, done(habit, ...daysUntil(TODAY, 5)), TODAY, 1)).toBe(5)
  })

  it('dia atual ainda não feito não quebra o streak', () => {
    const habit = makeHabit()
    expect(currentStreak(habit, done(habit, '2026-03-08', '2026-03-09'), TODAY, 1)).toBe(2)
  })

  it('um dia perdido no meio quebra o streak', () => {
    const habit = makeHabit()
    const list = done(habit, '2026-03-06', '2026-03-07', '2026-03-09', TODAY)
    expect(currentStreak(habit, list, TODAY, 1)).toBe(2)
  })

  it('dia pulado no meio não soma e não quebra', () => {
    // seg feito, ter pulado, qua feito, qui (hoje) ainda não → 2
    const habit = makeHabit()
    const list = [...done(habit, '2026-03-09', '2026-03-11'), skip(habit, '2026-03-10')]
    expect(currentStreak(habit, list, '2026-03-12', 1)).toBe(2)
  })

  it('fim de semana fora de schedule_days é neutro', () => {
    const habit = makeHabit({ schedule_days: [1, 2, 3, 4, 5] })
    // qui, sex, (sáb, dom fora), seg, ter = 4
    const list = done(habit, '2026-03-05', '2026-03-06', '2026-03-09', TODAY)
    expect(currentStreak(habit, list, TODAY, 1)).toBe(4)
  })

  it('datas antes de start_date não quebram o streak', () => {
    const habit = makeHabit({ start_date: '2026-03-08' })
    expect(currentStreak(habit, done(habit, '2026-03-08', '2026-03-09'), TODAY, 1)).toBe(2)
  })

  it('dois checks no mesmo dia contam como um', () => {
    const habit = makeHabit()
    expect(currentStreak(habit, done(habit, TODAY, TODAY, '2026-03-09'), TODAY, 1)).toBe(2)
  })

  it('ignora registros no futuro', () => {
    const habit = makeHabit()
    expect(currentStreak(habit, done(habit, TODAY, '2026-03-11'), TODAY, 1)).toBe(1)
  })

  it('atravessa a virada do ano (31/12 → 01/01)', () => {
    const habit = makeHabit({ start_date: '2025-12-01' })
    const list = done(habit, '2025-12-30', '2025-12-31', '2026-01-01')
    expect(currentStreak(habit, list, '2026-01-01', 1)).toBe(3)
  })

  it('atravessa o 29/02 de ano bissexto', () => {
    const habit = makeHabit({ start_date: '2028-02-01' })
    const list = done(habit, '2028-02-28', '2028-02-29', '2028-03-01')
    expect(currentStreak(habit, list, '2028-03-01', 1)).toBe(3)
  })

  it('3x/semana conta semanas; a semana atual em andamento é neutra', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3, start_date: '2026-02-01' })
    const list = done(
      habit,
      ...['2026-02-23', '2026-02-25', '2026-02-27'], // semana completa
      ...['2026-03-02', '2026-03-03', '2026-03-05'], // semana completa
      '2026-03-09', // semana atual: 1/3
    )
    expect(currentStreak(habit, list, TODAY, 1)).toBe(2)
  })

  it('3x/semana: uma semana passada com 2 dias quebra', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3, start_date: '2026-02-01' })
    const list = done(
      habit,
      ...['2026-02-23', '2026-02-25', '2026-02-27'],
      ...['2026-03-02', '2026-03-03'], // só 2
    )
    expect(currentStreak(habit, list, TODAY, 1)).toBe(0)
  })

  it('o início da semana muda qual semana o domingo completa', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 2, start_date: '2026-02-01' })
    const list = done(habit, '2026-03-07', '2026-03-08') // sáb e dom
    // Semana seg–dom: as duas datas caem em 02–08/03 → completa.
    expect(currentStreak(habit, list, TODAY, 1)).toBe(1)
    // Semana dom–sáb: sáb fica em 01–07/03, dom em 08–14/03 (atual) → nenhuma completa.
    expect(currentStreak(habit, list, TODAY, 0)).toBe(0)
  })

  it('meta mensal de duração soma o mês inteiro', () => {
    const habit = makeHabit({
      goal_kind: 'duration',
      goal_target: 60,
      goal_period: 'month',
      start_date: '2026-01-01',
    })
    const list = [
      makeEntry({ habit_id: habit.id, entry_date: '2026-01-05', value: 30 }),
      makeEntry({ habit_id: habit.id, entry_date: '2026-01-20', value: 30 }),
      makeEntry({ habit_id: habit.id, entry_date: '2026-02-28', value: 90 }),
    ]
    expect(currentStreak(habit, list, TODAY, 1)).toBe(2)
  })
})

describe('bestStreak', () => {
  it('guarda a sequência antiga depois de um dia perdido', () => {
    const habit = makeHabit({ start_date: '2026-03-01' })
    const list = done(habit, '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', TODAY)
    expect(bestStreak(habit, list, TODAY, 1)).toBe(3)
    expect(currentStreak(habit, list, TODAY, 1)).toBe(1)
  })

  it('atravessa pulos e dias fora da agenda', () => {
    const habit = makeHabit({ start_date: '2026-03-01', schedule_days: [1, 2, 3, 4, 5] })
    // seg 02, ter 03 (pulo), qua 04, qui 05, sex 06, (fim de semana), seg 09
    const list = [
      ...done(habit, '2026-03-02', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-09'),
      skip(habit, '2026-03-03'),
    ]
    expect(bestStreak(habit, list, TODAY, 1)).toBe(5)
  })

  it('é zero sem registros', () => {
    expect(bestStreak(makeHabit(), [], TODAY, 1)).toBe(0)
  })
})
