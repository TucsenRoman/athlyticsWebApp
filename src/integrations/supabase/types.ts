export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {

      /* -------------------------------------------------------------------------- */
      /*  ledger_entries                                                            */
      /* -------------------------------------------------------------------------- */
      ledger_entries: {
        Row: {
          id: string
          created_at: string
          ledger_id: string
          values: Json | null
          entity_key: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          ledger_id: string
          values?: Json | null
          entity_key?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          ledger_id?: string
          values?: Json | null
          entity_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  ledger_headers                                                            */
      /* -------------------------------------------------------------------------- */
      ledger_headers: {
        Row: {
          id: string
          created_at: string
          ledger_id: string
          name: string | null
          type: string | null
          order_index: number | null
          route_class: "independent" | "primary" | "secondary"
          options: any
          updated_at: string
          locked: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          ledger_id: string
          name?: string | null
          type?: string | null
          order_index?: number | null
          route_class?: "independent" | "primary" | "secondary"
          options?: any
          updated_at?: string
          locked?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          ledger_id?: string
          name?: string | null
          type?: string | null
          order_index?: number | null
          route_class?: "independent" | "primary" | "secondary"
          options?: any
          updated_at?: string
          locked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_headers_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  ledgers                                                                   */
      /* -------------------------------------------------------------------------- */
      ledgers: {
        Row: {
          id: string
          created_at: string
          coach_id: string | null
          program_id: number | null
          template_key: string | null
          name: string | null
          updated_at: string | null
          status: string | null
          data: Json | null
          description: string | null
          icon: string | null
          favorite: boolean | null
          is_system: boolean
          is_protected: boolean
          protection_level: "none" | "basic" | "full"
        }
        Insert: {
          id?: string
          created_at?: string
          coach_id?: string | null
          program_id?: number | null
          template_key?: string | null
          name?: string | null
          updated_at?: string | null
          status?: string | null
          data?: Json | null
          description?: string | null
          icon?: string | null
          favorite?: boolean | null
          is_system?: boolean
          is_protected?: boolean
          protection_level?: "none" | "basic" | "full"
        }
        Update: {
          id?: string
          created_at?: string
          coach_id?: string | null
          program_id?: number | null
          template_key?: string | null
          name?: string | null
          updated_at?: string | null
          status?: string | null
          data?: Json | null
          description?: string | null
          icon?: string | null
          favorite?: boolean | null
          is_system?: boolean
          is_protected?: boolean
          protection_level?: "none" | "basic" | "full"
        }
        Relationships: [
          {
            foreignKeyName: "ledgers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledgers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  ledger_routes                                                             */
      /* -------------------------------------------------------------------------- */
      ledger_routes: {
        Row: {
          id: string
          source_ledger_id: string
          source_column_id: string
          target_ledger_id: string
          target_column_id: string
          created_at: string | null
          updated_at: string | null
          active: boolean
        }
        Insert: {
          id?: string
          source_ledger_id: string
          source_column_id: string
          target_ledger_id: string
          target_column_id: string
          created_at?: string | null
          updated_at?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          source_ledger_id?: string
          source_column_id?: string
          target_ledger_id?: string
          target_column_id?: string
          created_at?: string | null
          updated_at?: string | null
          active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_routes_source_ledger_id_fkey"
            columns: ["source_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_routes_source_column_id_fkey"
            columns: ["source_column_id"]
            isOneToOne: false
            referencedRelation: "ledger_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_routes_target_ledger_id_fkey"
            columns: ["target_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_routes_target_column_id_fkey"
            columns: ["target_column_id"]
            isOneToOne: false
            referencedRelation: "ledger_headers"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  ledger_packages                                                           */
      /* -------------------------------------------------------------------------- */
      ledger_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
          coach_id: string | null
          visibility: "private" | "global"
          icon: string | null
          is_system_package: boolean
          sort_index: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          coach_id?: string | null
          visibility?: "private" | "global"
          icon?: string | null
          is_system_package?: boolean
          sort_index?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          coach_id?: string | null
          visibility?: "private" | "global"
          icon?: string | null
          is_system_package?: boolean
          sort_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "ledger_packages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      ledger_package_ledgers: {
        Row: {
          id: string
          package_id: string
          ledger_name: string
          icon: string | null
          protection_level: "none" | "basic" | "full"
          is_system: boolean
          installed_ledger_id: string | null
        }
        Insert: {
          id?: string
          package_id: string
          ledger_name: string
          icon?: string | null
          protection_level?: "none" | "basic" | "full"
          is_system?: boolean
          installed_ledger_id: string | null
        }
        Update: {
          id?: string
          package_id?: string
          ledger_name?: string
          icon?: string | null
          protection_level?: "none" | "basic" | "full"
          is_system?: boolean
          installed_ledger_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_package_ledgers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ledger_packages"
            referencedColumns: ["id"]
          }
        ]
      }

      ledger_package_headers: {
        Row: {
          id: string
          package_ledger_id: string
          column_name: string
          column_type: string
          options: Json | null
          order_index: number
          route_class: "independent" | "primary" | "secondary"
          locked: boolean
        }
        Insert: {
          id?: string
          package_ledger_id: string
          column_name: string
          column_type: string
          options?: Json | null
          order_index?: number
          route_class?: "independent" | "primary" | "secondary"
          locked?: boolean
        }
        Update: {
          id?: string
          package_ledger_id?: string
          column_name?: string
          column_type?: string
          options?: Json | null
          order_index?: number
          route_class?: "independent" | "primary" | "secondary"
          locked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_package_headers_package_ledger_id_fkey"
            columns: ["package_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledger_package_ledgers"
            referencedColumns: ["id"]
          }
        ]
      }

      ledger_package_routes: {
        Row: {
          id: string
          package_id: string
          source_ledger_name: string
          source_column_name: string
          target_ledger_name: string
          target_column_name: string
          active: boolean
        }
        Insert: {
          id?: string
          package_id: string
          source_ledger_name: string
          source_column_name: string
          target_ledger_name: string
          target_column_name: string
          active?: boolean
        }
        Update: {
          id?: string
          package_id?: string
          source_ledger_name?: string
          source_column_name?: string
          target_ledger_name?: string
          target_column_name?: string
          active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_package_routes_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ledger_packages"
            referencedColumns: ["id"]
          }
        ]
      }
      ledger_package_installs: {
        Row: {
          id: string;
          program_id: number;
          template_id: string;
          installed_ledger_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          program_id: number;
          template_id: string;
          installed_ledger_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          program_id?: number;
          template_id?: string;
          installed_ledger_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_package_installs_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_package_installs_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "ledger_package_ledgers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_package_installs_installed_ledger_id_fkey";
            columns: ["installed_ledger_id"];
            isOneToOne: false;
            referencedRelation: "ledgers";
            referencedColumns: ["id"];
          }
        ];
      };

      /* -------------------------------------------------------------------------- */
      /*  profiles                                                                  */
      /* -------------------------------------------------------------------------- */
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      /* -------------------------------------------------------------------------- */
      /*  programs                                                                  */
      /* -------------------------------------------------------------------------- */
      programs: {
        Row: {
          id: number
          coach_id: string
          description: string | null
          created_at: string | null
          school: string | null
          sport: string | null
          level: string | null
          gender: string | null
          season_year: string | null
        }
        Insert: {
          id?: number
          coach_id: string
          description?: string | null
          created_at?: string | null
          school?: string | null
          sport?: string | null
          level?: string | null
          gender?: string | null
          season_year?: string | null
        }
        Update: {
          id?: number
          coach_id?: string
          description?: string | null
          created_at?: string | null
          school?: string | null
          sport?: string | null
          level?: string | null
          gender?: string | null
          season_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  user_roles                                                                */
      /* -------------------------------------------------------------------------- */
      user_roles: {
        Row: {
          id: number
          user_id: string
          program_id: number
          role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          program_id: number
          role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          program_id?: number
          role?: "admin" | "head_coach" | "assistant_coach" | "viewer"
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  route_permissions                                                         */
      /* -------------------------------------------------------------------------- */
      route_permissions: {
        Row: {
          id: string
          route_id: string
          role: "admin" | "head_coach" | "assistant_coach" | "viewer" | "coach"
          can_create: boolean
          can_read: boolean
          can_update: boolean
          can_delete: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          route_id: string
          role: "admin" | "head_coach" | "assistant_coach" | "viewer" | "coach"
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          route_id?: string
          role?: "admin" | "head_coach" | "assistant_coach" | "viewer" | "coach"
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_permissions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "ledger_routes"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  route_sync_state                                                          */
      /* -------------------------------------------------------------------------- */
      route_sync_state: {
        Row: {
          id: string
          route_id: string
          last_source_version: number
          last_target_version: number
          pending_sync: boolean
          sync_attempts: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          route_id: string
          last_source_version?: number
          last_target_version?: number
          pending_sync?: boolean
          sync_attempts?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          route_id?: string
          last_source_version?: number
          last_target_version?: number
          pending_sync?: boolean
          sync_attempts?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_sync_state_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "ledger_routes"
            referencedColumns: ["id"]
          }
        ]
      }

      /* -------------------------------------------------------------------------- */
      /*  Templates                                                                 */
      /* -------------------------------------------------------------------------- */
      ledger_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          coach_id: string | null
          visibility: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          coach_id?: string | null
          visibility?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          coach_id?: string | null
          visibility?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      ledger_template_headers: {
        Row: {
          id: string
          template_id: string
          column_name: string
          column_type: string
          options: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          template_id: string
          column_name: string
          column_type: string
          options?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          column_name?: string
          column_type?: string
          options?: string[] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_template_headers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ledger_templates"
            referencedColumns: ["id"]
          }
        ]
      }

      ledger_template_entries: {
        Row: {
          id: string
          template_id: string
          values: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          template_id: string
          values?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          values?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_template_entries_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ledger_templates"
            referencedColumns: ["id"]
          }
        ]
      }
    },

    Views: {
      [_ in never]: never
    },

    Functions: {
      has_program_role: {
        Args: {
          _program_id: number
          _role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          _user_id: string
        }
        Returns: boolean
      },
      has_role: {
        Args: {
          _role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          _user_id: string
        }
        Returns: boolean
      },
      shift_ledger_headers_order: {
        Args: { p_ledger_id: string; p_start_index: number }
        Returns: void
      },
      compact_ledger_headers_order: {
        Args: { p_ledger_id: string }
        Returns: void
      }
    },

    Enums: {
      app_role: "admin" | "head_coach" | "assistant_coach" | "viewer"
    },

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
