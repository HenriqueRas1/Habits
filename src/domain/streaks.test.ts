import { describe, expect, it } from 'vitest'
import { currentDailyStreak } from './streaks.ts'

const done = (...dates: string[]) =>
  dates.map((entry_date) => ({ entry_date, kind: 'done' as const }))

describe('currentDailyStreak (versão simples da fase 2)', () => {
  const today = '2026-03-10'

  it('é zero sem registros', () => {
    expect(currentDailyStreak([], today)).toBe(0)
  })

  it('conta 5 dias seguidos feitos, incluindo hoje', () => {
    expect(
      currentDailyStreak(
        done('2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'),
        today,
      ),
    ).toBe(5)
  })

  it('hoje ainda não feito não quebra o streak', () => {
    expect(currentDailyStreak(done('2026-03-08', '2026-03-09'), today)).toBe(2)
  })

  it('um dia perdido quebra o streak', () => {
    expect(
      currentDailyStreak(done('2026-03-06', '2026-03-07', '2026-03-09', '2026-03-10'), today),
    ).toBe(2)
  })

  it('ontem e hoje sem registro zeram o streak', () => {
    expect(currentDailyStreak(done('2026-03-07', '2026-03-08'), today)).toBe(0)
  })

  it('dois registros no mesmo dia contam como um', () => {
    expect(currentDailyStreak(done('2026-03-10', '2026-03-10', '2026-03-09'), today)).toBe(2)
  })

  it('ignora registros que não são done', () => {
    const entries = [...done('2026-03-09'), { entry_date: '2026-03-10', kind: 'skip' as const }]
    expect(currentDailyStreak(entries, today)).toBe(1)
  })

  it('ignora registros no futuro', () => {
    expect(currentDailyStreak(done('2026-03-10', '2026-03-11'), today)).toBe(1)
  })

  it('atravessa a virada de mês', () => {
    expect(currentDailyStreak(done('2026-02-28', '2026-03-01'), '2026-03-01')).toBe(2)
  })
})
