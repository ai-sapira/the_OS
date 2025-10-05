export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      initiative_activity: {
        Row: {
          action: Database["public"]["Enums"]["initiative_activity_action"]
          actor_user_id: string | null
          created_at: string | null
          id: string
          initiative_id: string
          organization_id: string
          payload: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["initiative_activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          initiative_id: string
          organization_id: string
          payload?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["initiative_activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          initiative_id?: string
          organization_id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_activity_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_activity_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          teams_context: Json | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          issue_id: string
          provider: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          teams_context?: Json | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          issue_id?: string
          provider?: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          teams_context?: Json | null
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
          blocked_by_issue_id: string | null
          blocker_reason: string | null
          core_technology: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          duplicate_of_id: string | null
          estimated_hours: number | null
          id: string
          impact: string | null
          initiative_id: string | null
          key: string
          organization_id: string
          origin: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id: string | null
          planned_start_at: string | null
          priority: Database["public"]["Enums"]["issue_priority"] | null
          project_id: string | null
          reporter_id: string | null
          rise_score: number | null
          short_description: string | null
          sla_due_date: string | null
          snooze_until: string | null
          state: Database["public"]["Enums"]["issue_state"] | null
          title: string
          triaged_at: string | null
          triaged_by_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          blocked_by_issue_id?: string | null
          blocker_reason?: string | null
          core_technology?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          duplicate_of_id?: string | null
          estimated_hours?: number | null
          id?: string
          impact?: string | null
          initiative_id?: string | null
          key: string
          organization_id: string
          origin?: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          rise_score?: number | null
          short_description?: string | null
          sla_due_date?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["issue_state"] | null
          title: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          blocked_by_issue_id?: string | null
          blocker_reason?: string | null
          core_technology?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          duplicate_of_id?: string | null
          estimated_hours?: number | null
          id?: string
          impact?: string | null
          initiative_id?: string | null
          key?: string
          organization_id?: string
          origin?: Database["public"]["Enums"]["issue_origin"] | null
          parent_issue_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["issue_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          rise_score?: number | null
          short_description?: string | null
          sla_due_date?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["issue_state"] | null
          title?: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
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
      survey_questions: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          survey_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          survey_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          responder_user_id: string | null
          response_data: Json | null
          response_value: string | null
          survey_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          responder_user_id?: string | null
          response_data?: Json | null
          response_value?: string | null
          survey_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          responder_user_id?: string | null
          response_data?: Json | null
          response_value?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_responder_user_id_fkey"
            columns: ["responder_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          allow_anonymous: boolean | null
          allow_multiple_responses: boolean | null
          created_at: string | null
          creator_user_id: string
          description: string | null
          ends_at: string | null
          id: string
          organization_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["survey_status"]
          target_audience: Database["public"]["Enums"]["survey_audience"]
          target_bu_id: string | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_anonymous?: boolean | null
          allow_multiple_responses?: boolean | null
          created_at?: string | null
          creator_user_id: string
          description?: string | null
          ends_at?: string | null
          id?: string
          organization_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          target_audience?: Database["public"]["Enums"]["survey_audience"]
          target_bu_id?: string | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_anonymous?: boolean | null
          allow_multiple_responses?: boolean | null
          created_at?: string | null
          creator_user_id?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          organization_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          target_audience?: Database["public"]["Enums"]["survey_audience"]
          target_bu_id?: string | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_target_bu_id_fkey"
            columns: ["target_bu_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          active: boolean | null
          auth_user_id: string
          created_at: string | null
          id: string
          initiative_id: string | null
          organization_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          auth_user_id: string
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          organization_id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          organization_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          auth_user_id: string | null
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
          auth_user_id?: string | null
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
          auth_user_id?: string | null
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
      get_user_initiative: {
        Args: { org_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { org_id: string }
        Returns: string
      }
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
      initiative_activity_action:
        | "created"
        | "updated"
        | "status_changed"
        | "manager_assigned"
        | "manager_changed"
        | "manager_removed"
        | "description_updated"
        | "project_added"
        | "project_removed"
        | "issue_accepted"
        | "archived"
        | "restored"
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
      question_type: "multiple_choice" | "rating" | "text" | "yes_no"
      survey_audience: "all" | "bu_specific" | "role_specific"
      survey_status: "draft" | "active" | "closed" | "archived"
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
export type Organization = Tables<'organizations'>
export type Initiative = Tables<'initiatives'>
export type Project = Tables<'projects'>
export type Issue = Tables<'issues'>
export type User = Tables<'users'>
export type InitiativeActivity = Tables<'initiative_activity'>
