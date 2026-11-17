import { describe, expect, it } from 'vitest'
import {
  countdownStart,
  elapsedSeconds,
  formatClock,
  pauseTimer,
  resumeTimer,
  timerMinutes,
  type TimerState,
} from './timer.ts'

const at = (time: string) => new Date(`2026-03-10T${time}Z`)

const running = (started: string, accumulated = 0): TimerState => ({
  started_at: at(started).toISOString(),
  paused_at: null,
  accumulated_seconds: accumulated,
})

describe('elapsedSeconds', () => {
  it('rodando: acumulado + (agora − início)', () => {
    expect(elapsedSeconds(running('10:00:00'), at('10:05:30'))).toBe(330)
    expect(elapsedSeconds(running('10:00:00', 60), at('10:00:30'))).toBe(90)
  })

  it('pausado: só o acumulado', () => {
    const paused = { ...running('10:00:00', 200), paused_at: at('10:10:00').toISOString() }
    expect(elapsedSeconds(paused, at('11:00:00'))).toBe(200)
  })

  it('nunca é negativo (relógio do aparelho atrasado)', () => {
    expect(elapsedSeconds(running('10:00:00'), at('09:59:00'))).toBe(0)
  })
})

describe('pausar e retomar', () => {
  it('pausado e retomado soma os dois trechos', () => {
    let timer = running('10:00:00')
    timer = { ...timer, ...pauseTimer(timer, at('10:10:00')) } // 10 min
    expect(timer.paused_at).not.toBeNull()
    timer = { ...timer, ...resumeTimer(at('10:30:00')) } // 20 min parado não conta
    expect(elapsedSeconds(timer, at('10:35:00'))).toBe(15 * 60)
  })
})

describe('timerMinutes', () => {
  it('arredonda para o minuto mais próximo', () => {
    expect(timerMinutes(25 * 60 + 29)).toBe(25)
    expect(timerMinutes(25 * 60 + 30)).toBe(26)
  })

  it('mínimo de 1 minuto', () => {
    expect(timerMinutes(0)).toBe(1)
    expect(timerMinutes(20)).toBe(1)
  })
})

describe('countdownStart', () => {
  it('parte do que falta da meta de hoje', () => {
    expect(countdownStart(30, 10)).toBe(20 * 60)
  })

  it('meta já batida: zero', () => {
    expect(countdownStart(30, 45)).toBe(0)
  })
})

describe('formatClock', () => {
  it('mm:ss e h:mm:ss', () => {
    expect(formatClock(65)).toBe('01:05')
    expect(formatClock(3600 + 2 * 60 + 3)).toBe('1:02:03')
  })

  it('negativo vira zero', () => {
    expect(formatClock(-5)).toBe('00:00')
  })
})
