import { describe, expect, it } from 'vitest'
import { translateAuthError } from './errors.ts'

describe('translateAuthError', () => {
  it('traduz credenciais inválidas', () => {
    expect(
      translateAuthError({ message: 'Invalid login credentials', code: 'invalid_credentials' }),
    ).toBe('Email ou senha incorretos.')
  })

  it('reconhece falha de rede', () => {
    expect(translateAuthError({ message: 'Failed to fetch' })).toMatch(/Sem conexão/)
  })

  it('tem uma mensagem padrão', () => {
    expect(translateAuthError({ message: 'weird', code: 'unknown_code' })).toBe(
      'Algo deu errado. Tente de novo.',
    )
  })
})
