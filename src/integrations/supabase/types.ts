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
      athlete_custom_fields: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          field_id: string
          field_value: string | null
          id: string
          program_id: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          field_id: string
          field_value?: string | null
          id?: string
          program_id: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          field_id?: string
          field_value?: string | null
          id?: string
          program_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      athletes: {
        Row: {
          // achievements: string[] | null
          // athlete_of_meet: boolean | null
          // athlete_of_week: boolean | null
          coach_id: string
          created_at: string
          // events: string[] | null
          gender: string | null
          grade: number | null
          id: string
          name: string
          // personal_records: Json | null
          program_id: string | null
          team_position: string | null
          updated_at: string
        }
        Insert: {
          // achievements?: string[] | null
          // athlete_of_meet?: boolean | null
          // athlete_of_week?: boolean | null
          coach_id: string
          created_at?: string
          // events?: string[] | null
          gender?: string | null
          grade?: number | null
          id?: string
          name: string
          // personal_records?: Json | null
          program_id?: string | null
          team_position?: string | null
          updated_at?: string
        }
        Update: {
          // achievements?: string[] | null
          // athlete_of_meet?: boolean | null
          // athlete_of_week?: boolean | null
          coach_id?: string
          created_at?: string
          // events?: string[] | null
          gender?: string | null
          grade?: number | null
          id?: string
          name?: string
          // personal_records?: Json | null
          program_id?: string | null
          team_position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athletes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          program_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_submissions: {
        Row: {
          coach_id: string
          date: string
          program_id: string | null
          submitted_at: string
        }
        Insert: {
          coach_id: string
          date: string
          program_id?: string | null
          submitted_at?: string
        }
        Update: {
          coach_id?: string
          date?: string
          program_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_submissions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      ledgers: {
        Row: {
          id: string
          coach_id: string
          program_id: string
          template_key: string | null
          name: string
          created_at: string
          updated_at: string
          status: string | null
          data: Json | null
        }
        Insert: {
          id?: string
          coach_id: string
          program_id: string
          template_key?: string | null
          name: string
          created_at?: string
          updated_at?: string
          status?: string | null
          data?: Json | null
        }
        Update: {
          id?: string
          coach_id?: string
          program_id?: string
          template_key?: string | null
          name?: string
          created_at?: string
          updated_at?: string
          status?: string | null
          data?: Json | null
        }
        Relationships: []
      },
      ledger_headers: {
        Row: {
          id: string;
          created_at: string;
          ledger_id: string;
          name: string;
          type: string | null;
          is_locked: boolean;
          options: string | null;
          formula: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          ledger_id: string;
          name: string;
          type?: string | null;
          is_locked?: boolean;
          options?: string | null;
          formula?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          ledger_id?: string;
          name?: string;
          type?: string | null;
          is_locked?: boolean;
          options?: string | null;
          formula?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_headers_ledger_id_fkey";
            columns: ["ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["id"];
          }
        ];
      },
      ledger_entries: {
        Row: {
          id: string;
          created_st: string | null;
          ledger_id: string;
          entity_name: string;
          values: Json | null;
        };
        Insert: {
          id?: string;
          created_st?: string | null;
          ledger_id: string;
          entity_name: string;
          values?: Json | null;
        };
        Update: {
          id?: string;
          created_st?: string | null;
          ledger_id?: string;
          entity_name?: string;
          values?: Json | null;
        };
        Relationships: [];
      };
      lockers: {
        Row: {
          athlete_id: string | null
          coach_id: string
          combination: string | null
          created_at: string | null
          id: string
          location: string | null
          locker_number: string
          notes: string | null
          program_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          coach_id: string
          combination?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          locker_number: string
          notes?: string | null
          program_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          coach_id?: string
          combination?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          locker_number?: string
          notes?: string | null
          program_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lockers_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lockers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lockers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      meets: {
        Row: {
          coach_id: string
          created_at: string | null
          date: string
          id: string
          location: string | null
          name: string
          program_id: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          date: string
          id?: string
          location?: string | null
          name: string
          program_id?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          date?: string
          id?: string
          location?: string | null
          name?: string
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          coach_id: string
          created_at: string
          gender: string
          id: string
          level: string
          school: string
          season_end_date: string | null
          season_start_date: string | null
          season_year: string
          sport: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          gender: string
          id?: string
          level: string
          school?: string
          season_end_date?: string | null
          season_start_date?: string | null
          season_year?: string
          sport: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          gender?: string
          id?: string
          level?: string
          school?: string
          season_end_date?: string | null
          season_start_date?: string | null
          season_year?: string
          sport?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          coach_id: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          program_id: string | null
          recurrence: string | null
          time: string | null
          title: string
        }
        Insert: {
          coach_id: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          program_id?: string | null
          recurrence?: string | null
          time?: string | null
          title: string
        }
        Update: {
          coach_id?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          program_id?: string | null
          recurrence?: string | null
          time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string | null
          event: string
          id: string
          is_pr: boolean | null
          mark: string
          meet_id: string
          notes: string | null
          place: number | null
          program_id: string | null
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string | null
          event: string
          id?: string
          is_pr?: boolean | null
          mark: string
          meet_id: string
          notes?: string | null
          place?: number | null
          program_id?: string | null
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string | null
          event?: string
          id?: string
          is_pr?: boolean | null
          mark?: string
          meet_id?: string
          notes?: string | null
          place?: number | null
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_meet_id_fkey"
            columns: ["meet_id"]
            isOneToOne: false
            referencedRelation: "meets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      uniforms: {
        Row: {
          assigned_to: string | null
          athlete_id: string | null
          bottom_id: string
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          program_id: string | null
          status: string
          top_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          athlete_id?: string | null
          bottom_id: string
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status?: string
          top_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          athlete_id?: string | null
          bottom_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status?: string
          top_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uniforms_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniforms_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniforms_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          program_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_program_role: {
        Args: {
          _program_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "head_coach" | "assistant_coach" | "viewer"
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
      app_role: ["admin", "head_coach", "assistant_coach", "viewer"],
    },
  },
} as const
