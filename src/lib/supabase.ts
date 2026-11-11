import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.ts'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Copie .env.example para .env.local e preencha.',
  )
}

/** Cliente único do Supabase. Só deve ser importado por src/features/*\/api.ts e src/lib/. */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
