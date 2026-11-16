import { supabase } from '../../lib/supabase.ts'
import type { Profile } from '../../types/domain.ts'

export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) throw error
  return data
}
