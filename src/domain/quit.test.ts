import { describe, expect, it } from 'vitest'
import { formatQuitDuration, milestones, quitStats } from './quit.ts'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const t = (iso: string) => new Date(iso)

describe('quitStats', () => {
  it('sem recaída: conta desde quit_started_at', () => {
    const stats = quitStats('2026-03-01T08:00:00Z', [], t('2026-03-13T13:00:00Z'))
    expect(stats.currentMs).toBe(12 * DAY + 5 * HOUR)
    expect(stats.recordMs).toBe(12 * DAY + 5 * HOUR)
  })

  it('recaída zera a contagem; recorde = maior intervalo', () => {
    const stats = quitStats(
      '2026-01-01T00:00:00Z',
      ['2026-01-21T00:00:00Z', '2026-02-01T00:00:00Z'],
      t('2026-02-04T00:00:00Z'),
    )
    expect(stats.currentMs).toBe(3 * DAY)
    expect(stats.recordMs).toBe(20 * DAY)
    expect(stats.lastStart).toBe('2026-02-01T00:00:00.000Z')
  })

  it('a sequência atual pode ser o recorde', () => {
    const stats = quitStats(
      '2026-01-01T00:00:00Z',
      ['2026-01-03T00:00:00Z'],
      t('2026-02-01T00:00:00Z'),
    )
    expect(stats.recordMs).toBe(stats.currentMs)
  })

  it('ignora a ordem das recaídas e recaídas antes do início', () => {
    const stats = quitStats(
      '2026-01-10T00:00:00Z',
      ['2026-01-20T00:00:00Z', '2026-01-05T00:00:00Z', '2026-01-15T00:00:00Z'],
      t('2026-01-22T00:00:00Z'),
    )
    expect(stats.currentMs).toBe(2 * DAY)
    expect(stats.recordMs).toBe(5 * DAY)
  })

  it('recaída registrada agora: contagem zero', () => {
    expect(
      quitStats('2026-01-01T00:00:00Z', ['2026-01-10T00:00:00Z'], t('2026-01-10T00:00:00Z'))
        .currentMs,
    ).toBe(0)
  })
})

describe('formatQuitDuration', () => {
  it('dias e horas', () => {
    expect(formatQuitDuration(12 * DAY + 5 * HOUR)).toBe('12 dias, 5 h')
    expect(formatQuitDuration(1 * DAY)).toBe('1 dia, 0 h')
  })

  it('menos de um dia: horas e minutos', () => {
    expect(formatQuitDuration(5 * HOUR + 12 * 60_000)).toBe('5 h, 12 min')
    expect(formatQuitDuration(12 * 60_000 + 59_000)).toBe('12 min')
  })
})

describe('milestones', () => {
  it('próximo marco e quanto falta', () => {
    expect(milestones(12 * DAY + HOUR)).toEqual({ reached: 7, next: 14, daysToNext: 2 })
  })

  it('antes do primeiro marco', () => {
    expect(milestones(5 * HOUR)).toEqual({ reached: null, next: 1, daysToNext: 1 })
  })

  it('depois do último marco', () => {
    expect(milestones(400 * DAY)).toEqual({ reached: 365, next: null, daysToNext: null })
  })
})
