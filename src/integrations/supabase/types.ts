// ============================================================================
// JSON TYPE
// ============================================================================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// DATABASE
// ============================================================================

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }

  public: {
    // =========================================================================
    // TABLES
    // =========================================================================
    Tables: {
      /* ====================================================================== */
      /*  ATTENDANCE                                                            */
      /* ====================================================================== */
      attendance: {
        Row: {
          id: string
          program_id: number
          date: string
          athlete_key: string | null
          status: "absent" | "tardy" | "other" | "all_present"
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: number
          date: string
          athlete_key?: string | null
          status: "absent" | "tardy" | "other" | "all_present"
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: number
          date?: string
          athlete_key?: string | null
          status?: "absent" | "tardy" | "other" | "all_present"
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  ITEM SHARES                                                           */
      /* ====================================================================== */
      item_shares: {
        Row: {
          id: string
          ledger_id: string | null
          package_id: string | null
          shared_with_user_id: string | null
          shared_with_program_id: number | null
          shared_with_role:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | null
          can_view: "inherit" | "allow" | "deny"
          can_edit: "inherit" | "allow" | "deny"
          can_manage: "inherit" | "allow" | "deny"
          can_share: "inherit" | "allow" | "deny"
        }
        Insert: {
          id?: string
          ledger_id?: string | null
          package_id?: string | null
          shared_with_user_id?: string | null
          shared_with_program_id?: number | null
          shared_with_role?:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | null
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Update: {
          id?: string
          ledger_id?: string | null
          package_id?: string | null
          shared_with_user_id?: string | null
          shared_with_program_id?: number | null
          shared_with_role?:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | null
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Relationships: [
          {
            foreignKeyName: "item_shares_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
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
            foreignKeyName: "item_shares_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_shares_shared_with_program_id_fkey"
            columns: ["shared_with_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

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
      /*  LEDGERS                                                               */
      /* ====================================================================== */
      ledgers: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      /*  PACKAGE ITEMS                                                         */
      /* ====================================================================== */
      package_items: {
        Row: {
          id: string
          package_id: string
          ledger_id: string
          order_index: number
        }
        Insert: {
          id?: string
          package_id: string
          ledger_id: string
          order_index?: number
        }
        Update: {
          id?: string
          package_id?: string
          ledger_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_items_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  PACKAGES                                                              */
      /* ====================================================================== */
      packages: {
        Row: {
          id: string
          created_at: string
          program_id: number
          name: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          program_id: number
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          program_id?: number
          name?: string
          description?: string | null
          icon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  PERMISSION OVERRIDES                                                  */
      /* ====================================================================== */
      permission_overrides: {
        Row: {
          id: string
          user_id: string
          package_id: string
          can_view: "inherit" | "allow" | "deny"
          can_edit: "inherit" | "allow" | "deny"
          can_manage: "inherit" | "allow" | "deny"
          can_share: "inherit" | "allow" | "deny"
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Relationships: [
          {
            foreignKeyName: "permission_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_overrides_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
      /*  PROGRAM ROLES                                                         */
      /* ====================================================================== */
      program_roles: {
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
            foreignKeyName: "program_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_roles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  PROGRAMS                                                              */
      /* ====================================================================== */
      programs: {
        Row: {
          id: number
          user_id: string
          description: string | null
          created_at: string | null
          school: string | null
          sport: string | null
          level: string | null
          gender: string | null
          year: string | null
        }
        Insert: {
          id?: number
          user_id: string
          description?: string | null
          created_at?: string | null
          school?: string | null
          sport?: string | null
          level?: string | null
          gender?: string | null
          year?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          description?: string | null
          created_at?: string | null
          school?: string | null
          sport?: string | null
          level?: string | null
          gender?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  ROLE PERMISSIONS                                                      */
      /* ====================================================================== */
      role_permissions: {
        Row: {
          id: number
          program_id: number
          role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          can_view: "inherit" | "allow" | "deny"
          can_edit: "inherit" | "allow" | "deny"
          can_manage: "inherit" | "allow" | "deny"
          can_share: "inherit" | "allow" | "deny"
        }
        Insert: {
          id?: number
          program_id: number
          role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Update: {
          id?: number
          program_id?: number
          role?: "admin" | "head_coach" | "assistant_coach" | "viewer"
          can_view?: "inherit" | "allow" | "deny"
          can_edit?: "inherit" | "allow" | "deny"
          can_manage?: "inherit" | "allow" | "deny"
          can_share?: "inherit" | "allow" | "deny"
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  TEMPLATE SHARES                                                       */
      /* ====================================================================== */
      template_shares: {
        Row: {
          id: string
          template_id: string
          shared_with_user_id: string | null
          shared_with_program_id: number | null
          can_install: "allow" | "deny"
        }
        Insert: {
          id?: string
          template_id: string
          shared_with_user_id?: string | null
          shared_with_program_id?: number | null
          can_install?: "allow" | "deny"
        }
        Update: {
          id?: string
          template_id?: string
          shared_with_user_id?: string | null
          shared_with_program_id?: number | null
          can_install?: "allow" | "deny"
        }
        Relationships: [
          {
            foreignKeyName: "template_shares_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_shares_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_shares_shared_with_program_id_fkey"
            columns: ["shared_with_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      },

      /* ====================================================================== */
      /*  TEMPLATES                                                             */
      /* ====================================================================== */
      templates: {
        Row: {
          id: string
          created_at: string
          created_by: string
          visibility: "private" | "global"
          name: string
          description: string | null
          ledger_json: Json
        }
        Insert: {
          id?: string
          created_at?: string
          created_by: string
          visibility?: "private" | "global"
          name: string
          description?: string | null
          ledger_json: Json
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          visibility?: "private" | "global"
          name?: string
          description?: string | null
          ledger_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          role:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | "coach"
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
          role:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | "coach"
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
          role?:
            | "admin"
            | "head_coach"
            | "assistant_coach"
            | "viewer"
            | "coach"
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
      }
    }

    // =========================================================================
    // VIEWS
    // =========================================================================
    Views: {
      [_ in never]: never
    }

    // =========================================================================
    // FUNCTIONS
    // =========================================================================
    Functions: {
      has_program_role: {
        Args: {
          _program_id: number
          _role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: "admin" | "head_coach" | "assistant_coach" | "viewer"
          _user_id: string
        }
        Returns: boolean
      }
      shift_ledger_headers_order: {
        Args: { p_ledger_id: string; p_start_index: number }
        Returns: void
      }
      compact_ledger_headers_order: {
        Args: { p_ledger_id: string }
        Returns: void
      }
    }

    // =========================================================================
    // ENUMS
    // =========================================================================
    Enums: {
      app_role: "admin" | "head_coach" | "assistant_coach" | "viewer"
    }

    // =========================================================================
    // COMPOSITE TYPES
    // =========================================================================
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// HELPER GENERIC TYPES
// ============================================================================

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
> = DefaultSchema["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof DefaultSchema["Enums"]
> = DefaultSchema["Enums"][EnumName]

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "athletic_director",
        "head_coach",
        "asst_coach",
        "manager",
        "captain",
        "custom"
      ],
    },
  },
} as const
