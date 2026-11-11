/**
 * Teste de segurança (RLS) contra o banco de verdade.
 *
 * Usa duas contas de teste já criadas e confirmadas no Supabase, configuradas no .env.local:
 *   RLS_USER_A_EMAIL, RLS_USER_A_PASSWORD, RLS_USER_B_EMAIL, RLS_USER_B_PASSWORD
 *
 * Rode com: npm run test:rls
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Database } from '../../src/types/database.ts'

type Client = SupabaseClient<Database>

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Defina ${name} no .env.local para rodar o teste de RLS.`)
  return value
}

async function login(email: string, password: string): Promise<{ client: Client; userId: string }> {
  const client = createClient<Database>(env('VITE_SUPABASE_URL'), env('VITE_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Login de ${email} falhou: ${error.message}`)
  return { client, userId: data.user.id }
}

describe('RLS: um usuário não acessa dados de outro', () => {
  let a: { client: Client; userId: string }
  let b: { client: Client; userId: string }
  let habitId: string

  beforeAll(async () => {
    a = await login(env('RLS_USER_A_EMAIL'), env('RLS_USER_A_PASSWORD'))
    b = await login(env('RLS_USER_B_EMAIL'), env('RLS_USER_B_PASSWORD'))

    habitId = crypto.randomUUID()
    const { error } = await a.client
      .from('habits')
      .insert({ id: habitId, name: 'Teste RLS', start_date: '2026-01-01' })
    if (error) throw new Error(`A não conseguiu criar o hábito: ${error.message}`)
  })

  afterAll(async () => {
    if (habitId) await a.client.from('habits').delete().eq('id', habitId)
    await a?.client.auth.signOut()
    await b?.client.auth.signOut()
  })

  it('A enxerga o próprio hábito', async () => {
    const { data, error } = await a.client.from('habits').select('id').eq('id', habitId)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('B não lê os hábitos de A', async () => {
    const { data, error } = await b.client.from('habits').select('id').eq('id', habitId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('B não lê o perfil de A', async () => {
    const { data } = await b.client.from('profiles').select('id').eq('id', a.userId)
    expect(data).toEqual([])
  })

  it('B não altera nem apaga o hábito de A', async () => {
    const updated = await b.client
      .from('habits')
      .update({ name: 'invadido' })
      .eq('id', habitId)
      .select()
    expect(updated.data).toEqual([])

    const deleted = await b.client.from('habits').delete().eq('id', habitId).select()
    expect(deleted.data).toEqual([])

    const { data } = await a.client.from('habits').select('name').eq('id', habitId).single()
    expect(data?.name).toBe('Teste RLS')
  })

  it('B não cria registro no hábito de A', async () => {
    const { error } = await b.client
      .from('entries')
      .insert({ habit_id: habitId, entry_date: '2026-01-02' })
    expect(error).not.toBeNull()
  })

  it('B não cria hábito em nome de A', async () => {
    const { error } = await b.client
      .from('habits')
      .insert({ name: 'falso', start_date: '2026-01-01', user_id: a.userId })
    expect(error).not.toBeNull()
  })
})
