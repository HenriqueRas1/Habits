import { describe, expect, it } from 'vitest'
import { addDays, DEFAULT_TIMEZONE, formatDayLabel, isDateString, todayIn } from './dates.ts'

describe('todayIn', () => {
  it('usa a data de São Paulo, não a UTC', () => {
    // 23h30 em São Paulo (UTC-3) = 02h30 UTC do dia seguinte
    const now = new Date('2026-03-11T02:30:00Z')
    expect(todayIn(DEFAULT_TIMEZONE, now)).toBe('2026-03-10')
  })

  it('vira o dia à meia-noite de São Paulo', () => {
    expect(todayIn(DEFAULT_TIMEZONE, new Date('2026-03-11T03:00:00Z'))).toBe('2026-03-11')
  })

  it('respeita outro fuso', () => {
    expect(todayIn('Asia/Tokyo', new Date('2026-03-10T16:00:00Z'))).toBe('2026-03-11')
  })
})

describe('addDays', () => {
  it('soma e subtrai dias', () => {
    expect(addDays('2026-03-10', 1)).toBe('2026-03-11')
    expect(addDays('2026-03-10', -10)).toBe('2026-02-28')
  })

  it('atravessa mês, ano e bissexto', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
  })
})

describe('isDateString', () => {
  it('aceita só datas válidas no formato YYYY-MM-DD', () => {
    expect(isDateString('2026-03-10')).toBe(true)
    expect(isDateString('2026-02-30')).toBe(false)
    expect(isDateString('10/03/2026')).toBe(false)
  })
})

describe('formatDayLabel', () => {
  it('escreve o dia em português', () => {
    expect(formatDayLabel('2026-11-16')).toBe('segunda-feira, 16 de novembro')
  })
})
