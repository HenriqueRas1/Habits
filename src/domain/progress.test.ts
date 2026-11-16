import { describe, expect, it } from 'vitest'
import { makeEntry, makeHabit } from '../test/factories.ts'
import type { Entry, Habit } from '../types/domain.ts'
import { isScheduled, periodProgress, periodState } from './progress.ts'

const TODAY = '2026-03-10' // terça

function entries(habit: Habit, items: [string, Partial<Entry>?][]): Entry[] {
  return items.map(([entry_date, rest]) => makeEntry({ habit_id: habit.id, entry_date, ...rest }))
}

describe('periodProgress', () => {
  it('check: dois checks no mesmo dia contam como um', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3 })
    const list = entries(habit, [['2026-03-09'], ['2026-03-09'], ['2026-03-10']])
    expect(periodProgress(habit, list, { start: '2026-03-09', end: '2026-03-15' })).toBe(2)
  })

  it('duration: 10 + 25 min no mesmo dia somam 35', () => {
    const habit = makeHabit({ goal_kind: 'duration', goal_target: 30 })
    const list = entries(habit, [
      ['2026-03-10', { value: 10 }],
      ['2026-03-10', { value: 25 }],
    ])
    expect(periodProgress(habit, list, { start: TODAY, end: TODAY })).toBe(35)
  })

  it('count: soma os valores do período e ignora os de fora', () => {
    const habit = makeHabit({ goal_kind: 'count', goal_target: 8 })
    const list = entries(habit, [
      ['2026-03-10', { value: 3 }],
      ['2026-03-10', { value: 2 }],
      ['2026-03-09', { value: 5 }],
    ])
    expect(periodProgress(habit, list, { start: TODAY, end: TODAY })).toBe(5)
  })

  it('pulos e recaídas não contam como progresso', () => {
    const habit = makeHabit({ goal_kind: 'count', goal_target: 8 })
    const list = entries(habit, [
      ['2026-03-10', { kind: 'skip', value: 4 }],
      ['2026-03-10', { kind: 'relapse', value: 4 }],
    ])
    expect(periodProgress(habit, list, { start: TODAY, end: TODAY })).toBe(0)
  })
})

describe('isScheduled', () => {
  it('datas antes de start_date não são agendadas', () => {
    const habit = makeHabit({ start_date: '2026-03-10' })
    expect(isScheduled(habit, '2026-03-09')).toBe(false)
    expect(isScheduled(habit, '2026-03-10')).toBe(true)
  })

  it('respeita schedule_days (só de seg a sex)', () => {
    const habit = makeHabit({ schedule_days: [1, 2, 3, 4, 5] })
    expect(isScheduled(habit, '2026-03-13')).toBe(true) // sexta
    expect(isScheduled(habit, '2026-03-14')).toBe(false) // sábado
    expect(isScheduled(habit, '2026-03-15')).toBe(false) // domingo
  })

  it('schedule_days vazio ou nulo = todo dia', () => {
    expect(isScheduled(makeHabit({ schedule_days: [] }), '2026-03-14')).toBe(true)
    expect(isScheduled(makeHabit({ schedule_days: null }), '2026-03-14')).toBe(true)
  })
})

describe('periodState', () => {
  const day = (date: string) => ({ start: date, end: date })
  const week = { start: '2026-03-02', end: '2026-03-08' } // semana passada (seg a dom)
  const thisWeek = { start: '2026-03-09', end: '2026-03-15' }

  it('completed quando a meta é batida', () => {
    const habit = makeHabit()
    expect(periodState(habit, entries(habit, [['2026-03-09']]), day('2026-03-09'), TODAY)).toBe(
      'completed',
    )
  })

  it('missed: dia passado sem registro', () => {
    expect(periodState(makeHabit(), [], day('2026-03-09'), TODAY)).toBe('missed')
  })

  it('in_progress: hoje ainda não feito', () => {
    expect(periodState(makeHabit(), [], day(TODAY), TODAY)).toBe('in_progress')
  })

  it('skipped: há pulo e a meta não foi batida', () => {
    const habit = makeHabit()
    const list = entries(habit, [['2026-03-09', { kind: 'skip', value: 0 }]])
    expect(periodState(habit, list, day('2026-03-09'), TODAY)).toBe('skipped')
  })

  it('done depois de pular: se a meta foi batida, é completed', () => {
    const habit = makeHabit()
    const list = entries(habit, [['2026-03-09', { kind: 'skip', value: 0 }], ['2026-03-09']])
    expect(periodState(habit, list, day('2026-03-09'), TODAY)).toBe('completed')
  })

  it('datas antes de start_date são not_scheduled', () => {
    const habit = makeHabit({ start_date: '2026-03-10' })
    expect(periodState(habit, [], day('2026-03-09'), TODAY)).toBe('not_scheduled')
  })

  it('dia fora de schedule_days é not_scheduled', () => {
    const habit = makeHabit({ schedule_days: [1, 2, 3, 4, 5] })
    expect(periodState(habit, [], day('2026-03-08'), TODAY)).toBe('not_scheduled')
  })

  it('futuro é not_scheduled', () => {
    expect(periodState(makeHabit(), [], day('2026-03-11'), TODAY)).toBe('not_scheduled')
  })

  it('3x/semana: 3 dias feitos na semana → completed', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3 })
    const list = entries(habit, [['2026-03-02'], ['2026-03-04'], ['2026-03-06']])
    expect(periodState(habit, list, week, TODAY)).toBe('completed')
  })

  it('3x/semana: 2 dias numa semana que já passou → missed', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3 })
    const list = entries(habit, [['2026-03-02'], ['2026-03-04']])
    expect(periodState(habit, list, week, TODAY)).toBe('missed')
  })

  it('3x/semana: 2 dias na semana atual → in_progress', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 3 })
    const list = entries(habit, [['2026-03-09'], ['2026-03-10']])
    expect(periodState(habit, list, thisWeek, TODAY)).toBe('in_progress')
  })

  it('semana em que o hábito começou conta normalmente', () => {
    const habit = makeHabit({ goal_period: 'week', goal_target: 1, start_date: '2026-03-05' })
    const list = entries(habit, [['2026-03-06']])
    expect(periodState(habit, list, week, TODAY)).toBe('completed')
  })
})
