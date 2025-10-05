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
      initiatives: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          manager_user_id: string | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_activity: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_user_id: string | null
          created_at: string | null
          id: string
          issue_id: string
          organization_id: string
          payload: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          issue_id: string
          organization_id: string
          payload?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          issue_id?: string
          organization_id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_activity_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_activity_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_labels: {
        Row: {
          issue_id: string
          label_id: string
        }
        Insert: {
          issue_id: string
          label_id: string
        }
        Update: {
          issue_id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_labels_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_links: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          issue_id: string
          provider: Database["public"]["Enums"]["link_provider"]
          synced_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          issue_id: string
          provider: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          issue_id?: string
          provider?: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_links_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          duplicate_of_id: string | null
          id: string
          initiative_id: string | null
          key: string
          organization_id: string
          origin: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id: string | null
          planned_start_at: string | null
          priority: Database["public"]["Enums"]["issue_priority"] | null
          project_id: string | null
          reporter_id: string | null
          snooze_until: string | null
          state: Database["public"]["Enums"]["issue_state"] | null
          title: string
          triaged_at: string | null
          triaged_by_user_id: string | null
          updated_at: string | null
          short_description: string | null
          impact: string | null
          core_technology: string | null
          sla_due_date: string | null
          estimated_hours: number | null
          blocker_reason: string | null
          blocked_by_issue_id: string | null
          rise_score: number | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          duplicate_of_id?: string | null
          id?: string
          initiative_id?: string | null
          key: string
          organization_id: string
          origin?: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["issue_state"] | null
          title: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
          short_description?: string | null
          impact?: string | null
          core_technology?: string | null
          sla_due_date?: string | null
          estimated_hours?: number | null
          blocker_reason?: string | null
          blocked_by_issue_id?: string | null
          rise_score?: number | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          duplicate_of_id?: string | null
          id?: string
          initiative_id?: string | null
          key?: string
          organization_id?: string
          origin?: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["issue_state"] | null
          title?: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
          short_description?: string | null
          impact?: string | null
          core_technology?: string | null
          sla_due_date?: string | null
          estimated_hours?: number | null
          blocker_reason?: string | null
          blocked_by_issue_id?: string | null
          rise_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_blocked_by_issue_id_fkey"
            columns: ["blocked_by_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_duplicate_of_id_fkey"
            columns: ["duplicate_of_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_parent_issue_id_fkey"
            columns: ["parent_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_triaged_by_user_id_fkey"
            columns: ["triaged_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          initiative_id: string | null
          name: string
          organization_id: string
          owner_user_id: string | null
          planned_end_at: string | null
          planned_start_at: string | null
          progress: number | null
          slug: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          name: string
          organization_id: string
          owner_user_id?: string | null
          planned_end_at?: string | null
          planned_start_at?: string | null
          progress?: number | null
          slug: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          name?: string
          organization_id?: string
          owner_user_id?: string | null
          planned_end_at?: string | null
          planned_start_at?: string | null
          progress?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_action:
        | "created"
        | "accepted"
        | "declined"
        | "duplicated"
        | "snoozed"
        | "unsnoozed"
        | "updated"
        | "commented"
        | "labeled"
        | "assigned"
        | "state_changed"
      issue_origin: "teams" | "email" | "slack" | "api" | "url"
      issue_priority: "P0" | "P1" | "P2" | "P3"
      issue_state:
        | "triage"
        | "todo"
        | "in_progress"
        | "blocked"
        | "waiting_info"
        | "done"
        | "canceled"
        | "duplicate"
      link_provider: "teams" | "slack" | "email" | "url"
      project_status: "planned" | "active" | "paused" | "done"
      user_role: "SAP" | "CEO" | "BU" | "EMP"
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

// Helper types for easier usage
export type User = Tables<'users'>
export type Organization = Tables<'organizations'>
export type Initiative = Tables<'initiatives'>
export type Project = Tables<'projects'>
export type Issue = Tables<'issues'>
export type Label = Tables<'labels'>
export type IssueActivity = Tables<'issue_activity'>
export type IssueLink = Tables<'issue_links'>

export type UserRole = Database['public']['Enums']['user_role']
export type IssueState = Database['public']['Enums']['issue_state']
export type IssuePriority = Database['public']['Enums']['issue_priority']
export type IssueOrigin = Database['public']['Enums']['issue_origin']
export type ProjectStatus = Database['public']['Enums']['project_status']
export type ActivityAction = Database['public']['Enums']['activity_action']
export type LinkProvider = Database['public']['Enums']['link_provider']

// Survey types
export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'
export type SurveyAudience = 'all' | 'bu_specific' | 'role_specific'
export type QuestionType = 'multiple_choice' | 'rating' | 'text' | 'yes_no'

export type Survey = {
  id: string
  organization_id: string
  title: string
  description: string | null
  creator_user_id: string
  target_audience: SurveyAudience
  target_bu_id: string | null
  target_roles: string[] | null
  status: SurveyStatus
  starts_at: string | null
  ends_at: string | null
  allow_anonymous: boolean
  allow_multiple_responses: boolean
  created_at: string
  updated_at: string
}

export type SurveyQuestion = {
  id: string
  survey_id: string
  question_text: string
  question_type: QuestionType
  options: string[] | null
  is_required: boolean
  order_index: number
  created_at: string
}

export type SurveyResponse = {
  id: string
  survey_id: string
  question_id: string
  responder_user_id: string | null
  response_value: string | null
  response_data: any | null
  created_at: string
}

// Survey with relations (for API responses)
export type SurveyWithRelations = Survey & {
  creator?: User
  target_bu?: Initiative
  questions?: SurveyQuestion[]
  response_count?: number
  my_response_status?: 'pending' | 'completed'
  completion_rate?: number
}
