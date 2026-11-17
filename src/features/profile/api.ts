import { supabase } from '../../lib/supabase.ts'
import type { Theme } from '../../lib/theme.ts'
import type { Profile } from '../../types/domain.ts'

export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) throw error
  return data
}

export type ProfilePatch = { timezone?: string; week_start?: number; theme?: Theme }

export async function updateProfile(id: string, patch: ProfilePatch): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw error
}
