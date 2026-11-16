import { describe, expect, it } from 'vitest'
import { periodOf, previousPeriod, weekday } from './periods.ts'

describe('weekday', () => {
  it('devolve 0 = domingo ... 6 = sábado', () => {
    expect(weekday('2026-03-15')).toBe(0)
    expect(weekday('2026-03-09')).toBe(1)
    expect(weekday('2028-02-29')).toBe(2)
  })
})

describe('periodOf', () => {
  it('meta diária: o próprio dia', () => {
    expect(periodOf('2026-03-10', 'day', 1)).toEqual({ start: '2026-03-10', end: '2026-03-10' })
  })

  it('semana começando na segunda', () => {
    expect(periodOf('2026-03-10', 'week', 1)).toEqual({ start: '2026-03-09', end: '2026-03-15' })
    expect(periodOf('2026-03-09', 'week', 1)).toEqual({ start: '2026-03-09', end: '2026-03-15' })
  })

  it('semana começando na segunda vs no domingo muda o período do domingo', () => {
    expect(periodOf('2026-03-15', 'week', 1)).toEqual({ start: '2026-03-09', end: '2026-03-15' })
    expect(periodOf('2026-03-15', 'week', 0)).toEqual({ start: '2026-03-15', end: '2026-03-21' })
  })

  it('semana que atravessa a virada do ano', () => {
    expect(periodOf('2026-01-01', 'week', 1)).toEqual({ start: '2025-12-29', end: '2026-01-04' })
  })

  it('mês do calendário', () => {
    expect(periodOf('2026-03-10', 'month', 1)).toEqual({ start: '2026-03-01', end: '2026-03-31' })
    expect(periodOf('2026-02-14', 'month', 1)).toEqual({ start: '2026-02-01', end: '2026-02-28' })
    expect(periodOf('2026-12-31', 'month', 1)).toEqual({ start: '2026-12-01', end: '2026-12-31' })
  })

  it('fevereiro de ano bissexto tem 29 dias', () => {
    expect(periodOf('2028-02-10', 'month', 1)).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })
})

describe('previousPeriod', () => {
  it('volta um dia, atravessando o ano', () => {
    expect(previousPeriod({ start: '2026-01-01', end: '2026-01-01' }, 'day', 1)).toEqual({
      start: '2025-12-31',
      end: '2025-12-31',
    })
  })

  it('volta uma semana', () => {
    expect(previousPeriod({ start: '2026-03-09', end: '2026-03-15' }, 'week', 1)).toEqual({
      start: '2026-03-02',
      end: '2026-03-08',
    })
  })

  it('volta um mês, de janeiro para dezembro', () => {
    expect(previousPeriod({ start: '2026-01-01', end: '2026-01-31' }, 'month', 1)).toEqual({
      start: '2025-12-01',
      end: '2025-12-31',
    })
  })
})
