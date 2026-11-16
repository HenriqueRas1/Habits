import type { Database } from './database.ts'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type Habit = Tables['habits']['Row']
export type HabitInsert = Tables['habits']['Insert']
export type HabitUpdate = Tables['habits']['Update']

export type Entry = Tables['entries']['Row']
export type EntryInsert = Tables['entries']['Insert']

export type Profile = Tables['profiles']['Row']

export type EntryKind = Enums['entry_kind']
export type GoalKind = Enums['goal_kind']
export type GoalPeriod = Enums['goal_period']
export type HabitType = Enums['habit_type']
