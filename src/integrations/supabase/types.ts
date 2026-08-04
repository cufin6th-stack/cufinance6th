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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          link_url: string | null
          message: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          message: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          created_at: string
          event_id: string | null
          id: string
          method: string
          note: string | null
          profile_id: string | null
          proof_url: string | null
          status: string
          trx_id: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          event_id?: string | null
          id?: string
          method?: string
          note?: string | null
          profile_id?: string | null
          proof_url?: string | null
          status?: string
          trx_id?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          event_id?: string | null
          id?: string
          method?: string
          note?: string | null
          profile_id?: string | null
          proof_url?: string | null
          status?: string
          trx_id?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "members_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attend_type: string
          created_at: string
          event_id: string
          food_pref: string | null
          guests: number
          id: string
          notes: string | null
          profile_id: string | null
          total_amount: number
          tshirt_size: string | null
          user_id: string | null
        }
        Insert: {
          attend_type?: string
          created_at?: string
          event_id: string
          food_pref?: string | null
          guests?: number
          id?: string
          notes?: string | null
          profile_id?: string | null
          total_amount?: number
          tshirt_size?: string | null
          user_id?: string | null
        }
        Update: {
          attend_type?: string
          created_at?: string
          event_id?: string
          food_pref?: string | null
          guests?: number
          id?: string
          notes?: string | null
          profile_id?: string | null
          total_amount?: number
          tshirt_size?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "members_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          contact_info: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          event_date: string
          fee_child: number | null
          fee_couple: number | null
          fee_single: number | null
          finance_note: string | null
          finance_published: boolean
          goal_amount: number | null
          id: string
          map_url: string | null
          slug: string
          status: string
          summary: string | null
          title: string
          venue: string | null
        }
        Insert: {
          contact_info?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          fee_child?: number | null
          fee_couple?: number | null
          fee_single?: number | null
          finance_note?: string | null
          finance_published?: boolean
          goal_amount?: number | null
          id?: string
          map_url?: string | null
          slug: string
          status?: string
          summary?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          contact_info?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          fee_child?: number | null
          fee_couple?: number | null
          fee_single?: number | null
          finance_note?: string | null
          finance_published?: boolean
          goal_amount?: number | null
          id?: string
          map_url?: string | null
          slug?: string
          status?: string
          summary?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          receipt_url: string | null
          spent_on: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          receipt_url?: string | null
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          receipt_url?: string | null
          spent_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_albums: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          album_id: string
          caption: string | null
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          album_id: string
          caption?: string | null
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          album_id?: string
          caption?: string | null
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      home_slider: {
        Row: {
          cta_label: string | null
          cta_url: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          kicker: string | null
          sort_order: number
          title: string
        }
        Insert: {
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kicker?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kicker?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_url: string | null
          body: string | null
          id: string
          is_pinned: boolean
          published_at: string
          status: string
          title: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          id?: string
          is_pinned?: boolean
          published_at?: string
          status?: string
          title: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          id?: string
          is_pinned?: boolean
          published_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          title: string
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          title: string
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          category: string | null
          cover_url: string | null
          excerpt: string | null
          id: string
          published_at: string
          slug: string
          status: string
          title: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string
          slug: string
          status?: string
          title: string
        }
        Update: {
          body?: string | null
          category?: string | null
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string
          slug?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_day: number | null
          birth_month: number | null
          blood_group: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          field: string | null
          full_name: string
          hide_phone: boolean
          id: string
          is_approved: boolean
          job_title: string | null
          linkedin_url: string | null
          nickname: string | null
          organization: string | null
          phone: string | null
          roll: string | null
          section: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          field?: string | null
          full_name: string
          hide_phone?: boolean
          id?: string
          is_approved?: boolean
          job_title?: string | null
          linkedin_url?: string | null
          nickname?: string | null
          organization?: string | null
          phone?: string | null
          roll?: string | null
          section?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          blood_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          field?: string | null
          full_name?: string
          hide_phone?: boolean
          id?: string
          is_approved?: boolean
          job_title?: string | null
          linkedin_url?: string | null
          nickname?: string | null
          organization?: string | null
          phone?: string | null
          roll?: string | null
          section?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      members_public: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          field: string | null
          full_name: string | null
          id: string | null
          job_title: string | null
          nickname: string | null
          organization: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          field?: string | null
          full_name?: string | null
          id?: string | null
          job_title?: string | null
          nickname?: string | null
          organization?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          field?: string | null
          full_name?: string | null
          id?: string | null
          job_title?: string | null
          nickname?: string | null
          organization?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      public_stats: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
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
      app_role: ["admin", "moderator", "member"],
    },
  },
} as const
