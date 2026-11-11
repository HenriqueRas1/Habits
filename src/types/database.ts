export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      active_timers: {
        Row: {
          accumulated_seconds: number
          countdown_seconds: number | null
          habit_id: string
          mode: string
          paused_at: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          accumulated_seconds?: number
          countdown_seconds?: number | null
          habit_id: string
          mode?: string
          paused_at?: string | null
          started_at?: string
          user_id?: string
        }
        Update: {
          accumulated_seconds?: number
          countdown_seconds?: number | null
          habit_id?: string
          mode?: string
          paused_at?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'active_timers_habit_id_fkey'
            columns: ['habit_id']
            isOneToOne: true
            referencedRelation: 'habits'
            referencedColumns: ['id']
          },
        ]
      }
      entries: {
        Row: {
          created_at: string
          ended_at: string | null
          entry_date: string
          habit_id: string
          id: string
          kind: Database['public']['Enums']['entry_kind']
          note: string | null
          source: Database['public']['Enums']['entry_source']
          started_at: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          entry_date: string
          habit_id: string
          id?: string
          kind?: Database['public']['Enums']['entry_kind']
          note?: string | null
          source?: Database['public']['Enums']['entry_source']
          started_at?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          entry_date?: string
          habit_id?: string
          id?: string
          kind?: Database['public']['Enums']['entry_kind']
          note?: string | null
          source?: Database['public']['Enums']['entry_source']
          started_at?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'entries_habit_id_fkey'
            columns: ['habit_id']
            isOneToOne: false
            referencedRelation: 'habits'
            referencedColumns: ['id']
          },
        ]
      }
      habits: {
        Row: {
          archived_at: string | null
          color: string
          created_at: string
          description: string | null
          goal_kind: Database['public']['Enums']['goal_kind']
          goal_period: Database['public']['Enums']['goal_period']
          goal_target: number
          goal_unit: string | null
          icon: string
          id: string
          name: string
          quit_started_at: string | null
          schedule_days: number[] | null
          sort_order: number
          start_date: string
          type: Database['public']['Enums']['habit_type']
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: string
          created_at?: string
          description?: string | null
          goal_kind?: Database['public']['Enums']['goal_kind']
          goal_period?: Database['public']['Enums']['goal_period']
          goal_target?: number
          goal_unit?: string | null
          icon?: string
          id?: string
          name: string
          quit_started_at?: string | null
          schedule_days?: number[] | null
          sort_order?: number
          start_date: string
          type?: Database['public']['Enums']['habit_type']
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          color?: string
          created_at?: string
          description?: string | null
          goal_kind?: Database['public']['Enums']['goal_kind']
          goal_period?: Database['public']['Enums']['goal_period']
          goal_target?: number
          goal_unit?: string | null
          icon?: string
          id?: string
          name?: string
          quit_started_at?: string | null
          schedule_days?: number[] | null
          sort_order?: number
          start_date?: string
          type?: Database['public']['Enums']['habit_type']
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          timezone: string
          updated_at: string
          week_start: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          timezone?: string
          updated_at?: string
          week_start?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
          week_start?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entry_kind: 'done' | 'skip' | 'relapse'
      entry_source: 'manual' | 'timer'
      goal_kind: 'check' | 'count' | 'duration'
      goal_period: 'day' | 'week' | 'month'
      habit_type: 'build' | 'quit'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entry_kind: ['done', 'skip', 'relapse'],
      entry_source: ['manual', 'timer'],
      goal_kind: ['check', 'count', 'duration'],
      goal_period: ['day', 'week', 'month'],
      habit_type: ['build', 'quit'],
    },
  },
} as const
