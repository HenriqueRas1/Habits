import type { Database } from './database.ts'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type Habit = Tables['habits']['Row']
export type HabitInsert = Tables['habits']['Insert']
export type HabitUpdate = Tables['habits']['Update']

export type Entry = Tables['entries']['Row']
export type EntryInsert = Tables['entries']['Insert']
export type EntryUpdate = Tables['entries']['Update']

export type Profile = Tables['profiles']['Row']

export type ActiveTimer = Tables['active_timers']['Row']
export type ActiveTimerInsert = Tables['active_timers']['Insert']
export type ActiveTimerUpdate = Tables['active_timers']['Update']

export type Task = Tables['tasks']['Row']
export type TaskInsert = Tables['tasks']['Insert']
export type TaskUpdate = Tables['tasks']['Update']

export type EntryKind = Enums['entry_kind']
export type GoalKind = Enums['goal_kind']
export type GoalPeriod = Enums['goal_period']
export type HabitType = Enums['habit_type']
