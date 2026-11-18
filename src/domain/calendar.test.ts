import { describe, expect, it } from 'vitest'
import { makeEntry, makeHabit } from '../test/factories.ts'
import type { Entry, Habit } from '../types/domain.ts'
import { addMonths, dayCell, dayCompletion, dayTone, monthGrid } from './calendar.ts'

const TODAY = '2026-03-10' // terça

const done = (habit: Habit, date: string, value = 1): Entry =>
  makeEntry({ habit_id: habit.id, entry_date: date, value })
const skip = (habit: Habit, date: string): Entry =>
  makeEntry({ habit_id: habit.id, entry_date: date, kind: 'skip', value: 0 })

describe('addMonths', () => {
  it('avança e volta meses atravessando o ano', () => {
    expect(addMonths('2026-03', 1)).toBe('2026-04')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })
})

describe('monthGrid', () => {
  it('semanas completas começando na segunda, com dias dos meses vizinhos', () => {
    const weeks = monthGrid('2026-03', 1)
    expect(weeks[0]).toEqual([
      '2026-02-23',
      '2026-02-24',
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
    ])
    expect(weeks.at(-1)?.at(-1)).toBe('2026-04-05')
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })

  it('mês que começa no domingo, com semana começando no domingo', () => {
    const weeks = monthGrid('2026-03', 0)
    expect(weeks[0][0]).toBe('2026-03-01')
    expect(weeks).toHaveLength(5)
  })

  it('fevereiro de ano bissexto inclui o 29', () => {
    expect(monthGrid('2028-02', 1).flat()).toContain('2028-02-29')
  })
})

describe('dayCell (meta diária)', () => {
  it('completed: meta batida', () => {
    const habit = makeHabit()
    expect(dayCell(habit, [done(habit, '2026-03-09')], '2026-03-09', TODAY, 1)).toBe('completed')
  })

  it('partial: teve registro mas não bateu a meta', () => {
    const habit = makeHabit({ goal_kind: 'count', goal_target: 8 })
    expect(dayCell(habit, [done(habit, '2026-03-09', 3)], '2026-03-09', TODAY, 1)).toBe('partial')
  })

  it('partial também vale para hoje ainda em andamento', () => {
    const habit = makeHabit({ goal_kind: 'count', goal_target: 8 })
    expect(dayCell(habit, [done(habit, TODAY, 3)], TODAY, TODAY, 1)).toBe('partial')
  })

  it('hoje sem registro não tem marcação', () => {
    expect(dayCell(makeHabit(), [], TODAY, TODAY, 1)).toBe('none')
  })

  it('skipped: dia pulado', () => {
    const habit = makeHabit()
    expect(dayCell(habit, [skip(habit, '2026-03-09')], '2026-03-09', TODAY, 1)).toBe('skipped')
  })

  it('missed: dia passado sem registro', () => {
    expect(dayCell(makeHabit(), [], '2026-03-09', TODAY, 1)).toBe('missed')
  })

  it('sem marcação: futuro, antes do início e fora da agenda', () => {
    const habit = makeHabit({ start_date: '2026-03-02', schedule_days: [1, 2, 3, 4, 5] })
    expect(dayCell(habit, [], '2026-03-11', TODAY, 1)).toBe('none')
    expect(dayCell(habit, [], '2026-03-01', TODAY, 1)).toBe('none')
    expect(dayCell(habit, [], '2026-03-08', TODAY, 1)).toBe('none') // domingo
  })
})

describe('dayCell (meta semanal)', () => {
  const habit = makeHabit({ goal_period: 'week', goal_target: 3 })

  it('dias feitos numa semana concluída ficam cheios', () => {
    const list = [done(habit, '2026-03-02'), done(habit, '2026-03-04'), done(habit, '2026-03-06')]
    expect(dayCell(habit, list, '2026-03-04', TODAY, 1)).toBe('completed')
    expect(dayCell(habit, list, '2026-03-05', TODAY, 1)).toBe('none')
  })

  it('dias feitos numa semana não concluída ficam parciais', () => {
    const list = [done(habit, '2026-03-02')]
    expect(dayCell(habit, list, '2026-03-02', TODAY, 1)).toBe('partial')
    expect(dayCell(habit, list, '2026-03-03', TODAY, 1)).toBe('none')
  })

  it('semana pulada deixa os dias passados em cinza', () => {
    const list = [skip(habit, '2026-03-03')]
    expect(dayCell(habit, list, '2026-03-05', TODAY, 1)).toBe('skipped')
    expect(dayCell(habit, list, '2026-03-12', '2026-03-12', 1)).toBe('none') // outra semana
  })
})

describe('dayCompletion', () => {
  it('conta hábitos diários agendados e concluídos no dia', () => {
    const a = makeHabit()
    const b = makeHabit({ goal_kind: 'count', goal_target: 8 })
    const off = makeHabit({ schedule_days: [1, 3, 5] }) // terça fora
    const weekly = makeHabit({ goal_period: 'week', goal_target: 3 })
    const entries = [done(a, TODAY), done(b, TODAY, 3), done(weekly, TODAY)]

    expect(dayCompletion([a, b, off, weekly], entries, TODAY)).toEqual({
      done: 1,
      total: 2,
      others: 1,
    })
  })

  it('ignora hábitos que ainda não tinham começado', () => {
    const later = makeHabit({ start_date: '2026-03-11' })
    expect(dayCompletion([later], [], TODAY)).toEqual({ done: 0, total: 0, others: 0 })
  })
})

describe('dayTone', () => {
  it('verde: todos feitos; vermelho: nenhum', () => {
    expect(dayTone({ done: 5, total: 5 })).toBe('all')
    expect(dayTone({ done: 0, total: 3 })).toBe('none')
  })

  it('verde claro a partir de 50%; vermelho claro abaixo', () => {
    expect(dayTone({ done: 2, total: 4 })).toBe('most')
    expect(dayTone({ done: 4, total: 5 })).toBe('most')
    expect(dayTone({ done: 1, total: 3 })).toBe('few')
  })

  it('sem hábitos no dia: neutro', () => {
    expect(dayTone({ done: 0, total: 0 })).toBe('empty')
  })
})
