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
      contractors: {
        Row: {
          address: string | null
          branding_colors: Json | null
          branding_logo_url: string | null
          certification_numbers: string[] | null
          city: string | null
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          is_platform_admin: boolean | null
          phone: string | null
          postal_code: string | null
          province: string | null
          staff_limit: number
          subscription_active: boolean | null
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          tax_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          branding_colors?: Json | null
          branding_logo_url?: string | null
          certification_numbers?: string[] | null
          city?: string | null
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          is_platform_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          staff_limit?: number
          subscription_active?: boolean | null
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          tax_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          branding_colors?: Json | null
          branding_logo_url?: string | null
          certification_numbers?: string[] | null
          city?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          is_platform_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          staff_limit?: number
          subscription_active?: boolean | null
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          tax_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          contractor_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contractor_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contractor_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contractor_id: string
          created_at: string | null
          customer_id: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          job_id: string | null
          line_items: Json
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          title: string
          total: number
          updated_at: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          customer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          title: string
          total?: number
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          title?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_media: {
        Row: {
          caption: string | null
          contractor_id: string
          created_at: string | null
          file_type: string
          file_url: string
          gps_location: Json | null
          id: string
          job_id: string
          staff_id: string
          taken_at: string | null
        }
        Insert: {
          caption?: string | null
          contractor_id: string
          created_at?: string | null
          file_type: string
          file_url: string
          gps_location?: Json | null
          id?: string
          job_id: string
          staff_id: string
          taken_at?: string | null
        }
        Update: {
          caption?: string | null
          contractor_id?: string
          created_at?: string | null
          file_type?: string
          file_url?: string
          gps_location?: Json | null
          id?: string
          job_id?: string
          staff_id?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_media_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_media_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_media_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          assigned_staff: string[] | null
          city: string | null
          contractor_id: string
          created_at: string | null
          customer_id: string
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          fixed_price: number | null
          hourly_rate: number | null
          id: string
          materials_cost: number | null
          notes: string | null
          postal_code: string | null
          province: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_staff?: string[] | null
          city?: string | null
          contractor_id: string
          created_at?: string | null
          customer_id: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          fixed_price?: number | null
          hourly_rate?: number | null
          id?: string
          materials_cost?: number | null
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_staff?: string[] | null
          city?: string | null
          contractor_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          fixed_price?: number | null
          hourly_rate?: number | null
          id?: string
          materials_cost?: number | null
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          contractor_id: string
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          line_items: Json
          notes: string | null
          quote_number: string
          status: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          title: string
          total: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          line_items?: Json
          notes?: string | null
          quote_number: string
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          title: string
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          line_items?: Json
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          title?: string
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          contractor_id: string
          created_at: string | null
          email: string
          first_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          last_name: string
          permissions: Json | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          email: string
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name: string
          permissions?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          permissions?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          break_duration: number | null
          clock_in_time: string
          clock_out_time: string | null
          contractor_id: string
          created_at: string | null
          driving_data: Json | null
          gps_location_in: Json | null
          gps_location_out: Json | null
          id: string
          job_id: string
          notes: string | null
          staff_id: string
          status: Database["public"]["Enums"]["time_entry_status"] | null
          updated_at: string | null
        }
        Insert: {
          break_duration?: number | null
          clock_in_time: string
          clock_out_time?: string | null
          contractor_id: string
          created_at?: string | null
          driving_data?: Json | null
          gps_location_in?: Json | null
          gps_location_out?: Json | null
          id?: string
          job_id: string
          notes?: string | null
          staff_id: string
          status?: Database["public"]["Enums"]["time_entry_status"] | null
          updated_at?: string | null
        }
        Update: {
          break_duration?: number | null
          clock_in_time?: string
          clock_out_time?: string | null
          contractor_id?: string
          created_at?: string | null
          driving_data?: Json | null
          gps_location_in?: Json | null
          gps_location_out?: Json | null
          id?: string
          job_id?: string
          notes?: string | null
          staff_id?: string
          status?: Database["public"]["Enums"]["time_entry_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_contractor_id_for_staff: {
        Args: { user_id: string }
        Returns: string
      }
      get_contractor_id_for_user: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      job_status: "pending" | "in_progress" | "completed" | "cancelled"
      subscription_plan: "starter" | "professional" | "enterprise"
      time_entry_status: "clocked_in" | "clocked_out" | "break"
      user_role: "contractor" | "staff"
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
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      job_status: ["pending", "in_progress", "completed", "cancelled"],
      subscription_plan: ["starter", "professional", "enterprise"],
      time_entry_status: ["clocked_in", "clocked_out", "break"],
      user_role: ["contractor", "staff"],
    },
  },
} as const
