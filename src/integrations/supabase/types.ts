// ------------------------------------------------------------
// JSON TYPE
// ------------------------------------------------------------
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ------------------------------------------------------------
// DATABASE
// ------------------------------------------------------------
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }

  public: {
    Tables: {

      /* ====================================================================== */
      /*  LEDGER ENTRIES                                                        */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  LEDGER HEADERS                                                        */
      /* ====================================================================== */
      ledger_headers: {
        Row: {
          id: string
          created_at: string
          ledger_id: string
          name: string | null
          type: string | null
          order_index: number | null
          route_class: "independent" | "primary" | "secondary"
          options: Json
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
          options?: Json
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
          options?: Json
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
      },

      /* ====================================================================== */
      /*  LEDGERS (NO package_id ANYMORE)                                       */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  LEDGER ROUTES                                                         */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  LEDGER PACKAGES                                                       */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  LEDGER PACKAGE LEDGERS                                                */
      /* ====================================================================== */
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
          installed_ledger_id?: string | null
        }
        Update: {
          id?: string
          package_id?: string
          ledger_name?: string
          icon?: string | null
          protection_level?: "none" | "basic" | "full"
          is_system?: boolean
          installed_ledger_id?: string | null
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
      },

      /* ====================================================================== */
      /*  LEDGER PACKAGE HEADERS                                                */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  PACKAGE INSTALL INSTANCES (NEW TABLE)                                 */
      /* ====================================================================== */
      package_install_instances: {
        Row: {
          id: string
          program_id: number
          package_id: string
          name: string | null
          tags: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          program_id: number
          package_id: string
          name?: string | null
          tags?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          program_id?: number
          package_id?: string
          name?: string | null
          tags?: string[] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_install_instances_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_install_instances_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ledger_packages"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  LEDGER PACKAGE INSTALLS (NOW WITH install_instance_id)                */
      /* ====================================================================== */
      ledger_package_installs: {
        Row: {
          id: string
          program_id: number
          template_id: string
          installed_ledger_id: string
          created_at: string | null
          install_instance_id: string | null
        }
        Insert: {
          id?: string
          program_id: number
          template_id: string
          installed_ledger_id: string
          created_at?: string | null
          install_instance_id?: string | null
        }
        Update: {
          id?: string
          program_id?: number
          template_id?: string
          installed_ledger_id?: string
          created_at?: string | null
          install_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_package_installs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_package_installs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ledger_package_ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_package_installs_installed_ledger_id_fkey"
            columns: ["installed_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName:
              "ledger_package_installs_install_instance_id_fkey"
            columns: ["install_instance_id"]
            isOneToOne: false
            referencedRelation: "package_install_instances"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  PROFILES                                                              */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  PROGRAMS                                                              */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  USER ROLES                                                            */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  ROUTE PERMISSIONS                                                     */
      /* ====================================================================== */
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
      },

      /* ====================================================================== */
      /*  ROUTE SYNC STATE                                                      */
      /* ====================================================================== */
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
      },
    },

    /* ======================================================================== */
    /*  Views (none)                                                            */
    /* ======================================================================== */
    Views: {
      [_ in never]: never
    },

    /* ======================================================================== */
    /*  Functions                                                               */
    /* ======================================================================== */
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

    /* ======================================================================== */
    /*  Enums                                                                   */
    /* ======================================================================== */
    Enums: {
      app_role: "admin" | "head_coach" | "assistant_coach" | "viewer"
    },

    /* ======================================================================== */
    /*  Composite Types (none)                                                  */
    /* ======================================================================== */
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper generic types
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName]["Row"]

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"]
> =
  DefaultSchema["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof DefaultSchema["Enums"]
> = DefaultSchema["Enums"][EnumName]

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "head_coach", "assistant_coach", "viewer"],
    },
  },
} as const
