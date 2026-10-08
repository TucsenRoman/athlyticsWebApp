export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          athlete_key: string | null
          created_at: string | null
          date: string
          id: string
          note: string | null
          program_id: number
          status: string
          updated_at: string | null
        }
        Insert: {
          athlete_key?: string | null
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          program_id: number
          status: string
          updated_at?: string | null
        }
        Update: {
          athlete_key?: string | null
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          program_id?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          color: string
          created_at: string
          data: Json | null
          description: string | null
          favorite: boolean | null
          icon: string | null
          id: string
          name: string | null
          program_id: number | null
          pinned: boolean
          status: Database["public"]["Enums"]["file_status"] | null
          template_key: string | null
          type: Database["public"]["Enums"]["file_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          data?: Json | null
          description?: string | null
          favorite?: boolean | null
          icon?: string | null
          id?: string
          name?: string | null
          program_id?: number | null
          pinned?: boolean
          status?: Database["public"]["Enums"]["file_status"] | null
          template_key?: string | null
          type?: Database["public"]["Enums"]["file_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          data?: Json | null
          description?: string | null
          favorite?: boolean | null
          icon?: string | null
          id?: string
          name?: string | null
          program_id?: number | null
          pinned?: boolean
          status?: Database["public"]["Enums"]["file_status"] | null
          template_key?: string | null
          type?: Database["public"]["Enums"]["file_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledgers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledgers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      item_shares: {
        Row: {
          can_edit: string
          can_manage: string
          can_share: string
          can_view: string
          id: string
          ledger_id: string | null
          package_id: string | null
          shared_with_program_id: number | null
          shared_with_role: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: string
          ledger_id?: string | null
          package_id?: string | null
          shared_with_program_id?: number | null
          shared_with_role?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: string
          ledger_id?: string | null
          package_id?: string | null
          shared_with_program_id?: number | null
          shared_with_role?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_shares_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_shares_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_shares_shared_with_program_id_fkey"
            columns: ["shared_with_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      package_items: {
        Row: {
          id: string
          ledger_id: string
          order_index: number
          package_id: string
        }
        Insert: {
          id?: string
          ledger_id: string
          order_index?: number
          package_id: string
        }
        Update: {
          id?: string
          ledger_id?: string
          order_index?: number
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_items_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          program_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          program_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          program_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_overrides: {
        Row: {
          can_edit: string
          can_manage: string
          can_share: string
          can_view: string
          id: string
          package_id: string
          user_id: string
        }
        Insert: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: string
          package_id: string
          user_id: string
        }
        Update: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: string
          package_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_overrides_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string | null
          id: string
          language: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      program_roles: {
        Row: {
          created_at: string | null
          id: number
          program_id: number
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          program_id: number
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          program_id?: number
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          gender: string | null
          id: number
          id_uuid: string | null
          last_used_at: string
          level: string | null
          school: string | null
          season_end: string | null
          season_start: string | null
          sport: string | null
          state: string
          state_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: number
          id_uuid?: string | null
          last_used_at?: string
          level?: string | null
          school?: string | null
          season_end?: string | null
          season_start?: string | null
          sport?: string | null
          state?: string
          state_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: number
          id_uuid?: string | null
          last_used_at?: string
          level?: string | null
          school?: string | null
          season_end?: string | null
          season_start?: string | null
          sport?: string | null
          state?: string
          state_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_edit: string
          can_manage: string
          can_share: string
          can_view: string
          id: number
          program_id: number
          role: string
        }
        Insert: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: never
          program_id: number
          role: string
        }
        Update: {
          can_edit?: string
          can_manage?: string
          can_share?: string
          can_view?: string
          id?: never
          program_id?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_slots: {
        Row: {
          all_day: boolean
          attachment: string | null
          color: string | null
          created_at: string
          day: number
          end_time: number
          icon: string | null
          id: string
          location: string | null
          no_end: boolean
          program_id: number
          start_time: number
          title: string
          week_id: string | null
        }
        Insert: {
          all_day?: boolean
          attachment?: string | null
          color?: string | null
          created_at?: string
          day: number
          end_time: number
          icon?: string | null
          id?: string
          location?: string | null
          no_end?: boolean
          program_id: number
          start_time: number
          title: string
          week_id?: string | null
        }
        Update: {
          all_day?: boolean
          attachment?: string | null
          color?: string | null
          created_at?: string
          day?: number
          end_time?: number
          icon?: string | null
          id?: string
          location?: string | null
          no_end?: boolean
          program_id?: number
          start_time?: number
          title?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_slots_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_slots_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "schedule_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_subslots: {
        Row: {
          created_at: string
          id: string
          slot_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          slot_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          slot_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_subslots_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "schedule_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_weeks: {
        Row: {
          created_at: string
          id: string
          index: number
          program_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          index: number
          program_id: number
        }
        Update: {
          created_at?: string
          id?: string
          index?: number
          program_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      table_columns: {
        Row: {
          created_at: string
          file_id: string
          id: string
          locked: boolean
          name: string | null
          options: Json | null
          order_index: number | null
          route_class: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          locked?: boolean
          name?: string | null
          options?: Json | null
          order_index?: number | null
          route_class?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          locked?: boolean
          name?: string | null
          options?: Json | null
          order_index?: number | null
          route_class?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_columns_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      table_routes: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          source_column_id: string
          source_file_id: string
          target_column_id: string
          target_file_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          source_column_id: string
          source_file_id: string
          target_column_id: string
          target_file_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          source_column_id?: string
          source_file_id?: string
          target_column_id?: string
          target_file_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_routes_source_column_id_fkey"
            columns: ["source_column_id"]
            isOneToOne: false
            referencedRelation: "table_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_routes_target_column_id_fkey"
            columns: ["target_column_id"]
            isOneToOne: false
            referencedRelation: "table_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_routes_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_routes_target_file_id_fkey"
            columns: ["target_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      table_rows: {
        Row: {
          created_at: string
          entity_key: string | null
          file_id: string
          id: string
          values: Json | null
        }
        Insert: {
          created_at?: string
          entity_key?: string | null
          file_id: string
          id?: string
          values?: Json | null
        }
        Update: {
          created_at?: string
          entity_key?: string | null
          file_id?: string
          id?: string
          values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "table_rows_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      template_shares: {
        Row: {
          can_install: string
          id: string
          shared_with_program_id: number | null
          shared_with_user_id: string | null
          template_id: string
        }
        Insert: {
          can_install?: string
          id?: string
          shared_with_program_id?: number | null
          shared_with_user_id?: string | null
          template_id: string
        }
        Update: {
          can_install?: string
          id?: string
          shared_with_program_id?: number | null
          shared_with_user_id?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_shares_shared_with_program_id_fkey"
            columns: ["shared_with_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_shares_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          ledger_json: Json
          name: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          ledger_json: Json
          name: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          ledger_json?: Json
          name?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compact_ledger_headers_order: {
        Args: { p_ledger_id: string }
        Returns: undefined
      }
      get_root_route: { Args: { column_id: string }; Returns: string }
      get_route_chain: { Args: { root_route: string }; Returns: Json }
      is_program_member: {
        Args: { p_program_id: number; p_user_id: string }
        Returns: boolean
      }
      shift_ledger_headers_order: {
        Args: { p_ledger_id: string; p_start_index: number }
        Returns: undefined
      }
    }
    Enums: {
      file_status: "active" | "archived" | "deleted"
      file_type: "table"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      file_status: ["active", "archived", "deleted"],
      file_type: ["table"],
    },
  },
} as const
