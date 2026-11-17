import { supabase } from '../../lib/supabase.ts'
import type { ActiveTimer, ActiveTimerInsert, ActiveTimerUpdate } from '../../types/domain.ts'

/** Timers em andamento (no máximo um por hábito). */
export async function fetchTimers(): Promise<ActiveTimer[]> {
  const { data, error } = await supabase.from('active_timers').select('*')
  if (error) throw error
  return data
}

export async function startTimer(timer: ActiveTimerInsert): Promise<void> {
  const { error } = await supabase.from('active_timers').insert(timer)
  if (error) throw error
}

export async function updateTimer(habitId: string, patch: ActiveTimerUpdate): Promise<void> {
  const { error } = await supabase.from('active_timers').update(patch).eq('habit_id', habitId)
  if (error) throw error
}

export async function deleteTimer(habitId: string): Promise<void> {
  const { error } = await supabase.from('active_timers').delete().eq('habit_id', habitId)
  if (error) throw error
}
