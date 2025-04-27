export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          category: Database["public"]["Enums"]["log_category"]
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: Database["public"]["Enums"]["log_category"]
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: Database["public"]["Enums"]["log_category"]
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          key: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["news_category"]
          content: string | null
          created_at: string
          id: string
          published: boolean
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          id?: string
          published?: boolean
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          levels: Json | null
          name: string
          price: number
          rewards: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          levels?: Json | null
          name: string
          price?: number
          rewards?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          levels?: Json | null
          name?: string
          price?: number
          rewards?: Json | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          pass_id: string | null
          phone_number: string
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          pass_id?: string | null
          phone_number: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          pass_id?: string | null
          phone_number?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "passes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          free_points: number | null
          has_pass: boolean | null
          id: string
          is_blocked: boolean | null
          level: number | null
          phone_number: string | null
          points: number | null
          rewards: Json | null
          status: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          free_points?: number | null
          has_pass?: boolean | null
          id: string
          is_blocked?: boolean | null
          level?: number | null
          phone_number?: string | null
          points?: number | null
          rewards?: Json | null
          status?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          free_points?: number | null
          has_pass?: boolean | null
          id?: string
          is_blocked?: boolean | null
          level?: number | null
          phone_number?: string | null
          points?: number | null
          rewards?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          is_archived: boolean | null
          message: string
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          message: string
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_short_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_category: Database["public"]["Enums"]["log_category"]
          p_action: string
          p_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      api_key_status: "active" | "revoked" | "expired"
      log_category:
        | "auth"
        | "admin"
        | "points"
        | "rewards"
        | "shop"
        | "passes"
        | "user"
        | "system"
      news_category: "update" | "event" | "promo"
      payment_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      api_key_status: ["active", "revoked", "expired"],
      log_category: [
        "auth",
        "admin",
        "points",
        "rewards",
        "shop",
        "passes",
        "user",
        "system",
      ],
      news_category: ["update", "event", "promo"],
      payment_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "user"],
    },
  },
} as const
