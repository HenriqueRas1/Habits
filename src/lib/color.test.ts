import { describe, expect, it } from 'vitest'
import { readableTextOn, withAlpha } from './color.ts'

describe('withAlpha', () => {
  it('acrescenta a opacidade em hexadecimal', () => {
    expect(withAlpha('#6366f1', 0.2)).toBe('#6366f133')
    expect(withAlpha('#6366F1', 1)).toBe('#6366f1ff')
    expect(withAlpha('#6366f1', 0)).toBe('#6366f100')
  })
})

describe('readableTextOn', () => {
  it('texto escuro em cores claras', () => {
    expect(readableTextOn('#f59e0b')).toBe('#111827') // âmbar
    expect(readableTextOn('#84cc16')).toBe('#111827') // lima
    expect(readableTextOn('#0ea5e9')).toBe('#111827') // azul claro
  })

  it('texto branco em cores escuras', () => {
    expect(readableTextOn('#6366f1')).toBe('#ffffff') // índigo
    expect(readableTextOn('#4338ca')).toBe('#ffffff') // índigo escuro
  })

  it('escolhe o que dá mais contraste (vermelho e rosa ficam com texto escuro)', () => {
    expect(readableTextOn('#ef4444')).toBe('#111827')
    expect(readableTextOn('#ec4899')).toBe('#111827')
  })
})
