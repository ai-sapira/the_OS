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
      business_unit_activity: {
        Row: {
          action: Database["public"]["Enums"]["business_unit_activity_action"]
          actor_user_id: string | null
          created_at: string | null
          id: string
          business_unit_id: string
          organization_id: string
          payload: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["business_unit_activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          business_unit_id: string
          organization_id: string
          payload?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["business_unit_activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          business_unit_id?: string
          organization_id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "business_unit_activity_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_unit_activity_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_unit_activity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
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
            foreignKeyName: "business_units_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_activity: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_user_id: string | null
          created_at: string | null
          id: string
          initiative_id: string
          organization_id: string
          payload: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          initiative_id: string
          organization_id: string
          payload?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
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
      initiative_labels: {
        Row: {
          initiative_id: string
          label_id: string
        }
        Insert: {
          initiative_id: string
          label_id: string
        }
        Update: {
          initiative_id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_labels_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_links: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          initiative_id: string
          provider: Database["public"]["Enums"]["link_provider"]
          synced_at: string | null
          teams_context: Json | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          initiative_id: string
          provider: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          teams_context?: Json | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          initiative_id?: string
          provider?: Database["public"]["Enums"]["link_provider"]
          synced_at?: string | null
          teams_context?: Json | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_links_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          assignee_id: string | null
          blocked_by_initiative_id: string | null
          blocker_reason: string | null
          core_technology: string | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          due_at: string | null
          duplicate_of_initiative_id: string | null
          estimated_hours: number | null
          id: string
          impact: string | null
          impact_score: number | null
          business_unit_id: string | null
          key: string
          organization_id: string
          origin: Database["public"]["Enums"]["initiative_origin"] | null
          parent_initiative_id: string | null
          planned_start_at: string | null
          priority: Database["public"]["Enums"]["initiative_priority"] | null
          project_id: string | null
          reporter_id: string | null
          rice_score: number | null
          rise_score: number | null
          short_description: string | null
          sla_due_date: string | null
          snooze_until: string | null
          state: Database["public"]["Enums"]["initiative_state"] | null
          title: string
          triaged_at: string | null
          triaged_by_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          blocked_by_initiative_id?: string | null
          blocker_reason?: string | null
          core_technology?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          due_at?: string | null
          duplicate_of_initiative_id?: string | null
          estimated_hours?: number | null
          id?: string
          impact?: string | null
          impact_score?: number | null
          business_unit_id?: string | null
          key: string
          organization_id: string
          origin?: Database["public"]["Enums"]["initiative_origin"] | null
          parent_initiative_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["initiative_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          rice_score?: number | null
          rise_score?: number | null
          short_description?: string | null
          sla_due_date?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["initiative_state"] | null
          title: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          blocked_by_initiative_id?: string | null
          blocker_reason?: string | null
          core_technology?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          due_at?: string | null
          duplicate_of_initiative_id?: string | null
          estimated_hours?: number | null
          id?: string
          impact?: string | null
          impact_score?: number | null
          business_unit_id?: string | null
          key?: string
          organization_id?: string
          origin?: Database["public"]["Enums"]["initiative_origin"] | null
          parent_initiative_id?: string | null
          planned_start_at?: string | null
          priority?: Database["public"]["Enums"]["initiative_priority"] | null
          project_id?: string | null
          reporter_id?: string | null
          rice_score?: number | null
          rise_score?: number | null
          short_description?: string | null
          sla_due_date?: string | null
          snooze_until?: string | null
          state?: Database["public"]["Enums"]["initiative_state"] | null
          title?: string
          triaged_at?: string | null
          triaged_by_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_blocked_by_initiative_id_fkey"
            columns: ["blocked_by_initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_duplicate_of_initiative_id_fkey"
            columns: ["duplicate_of_initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_parent_initiative_id_fkey"
            columns: ["parent_initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_triaged_by_user_id_fkey"
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
          business_unit_id: string | null
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
          business_unit_id?: string | null
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
          business_unit_id?: string | null
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
            foreignKeyName: "projects_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
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
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          business_unit_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by_user_id: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          business_unit_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by_user_id?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          business_unit_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by_user_id?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          business_unit_id: string | null
          organization_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          auth_user_id: string
          created_at?: string | null
          id?: string
          business_unit_id?: string | null
          organization_id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string
          created_at?: string | null
          id?: string
          business_unit_id?: string | null
          organization_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
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
      get_user_business_unit: {
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
      business_unit_activity_action:
        | "created"
        | "updated"
        | "status_changed"
        | "manager_assigned"
        | "manager_changed"
        | "manager_removed"
        | "description_updated"
        | "project_added"
        | "project_removed"
        | "initiative_accepted"
        | "archived"
        | "restored"
      initiative_origin: "teams" | "email" | "slack" | "api" | "url"
      initiative_priority: "P0" | "P1" | "P2" | "P3"
      initiative_state:
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

// Type aliases for convenience
export type Initiative = Database['public']['Tables']['initiatives']['Row']
export type InitiativeState = Database['public']['Enums']['initiative_state']
export type InitiativePriority = Database['public']['Enums']['initiative_priority']
export type InitiativeOrigin = Database['public']['Enums']['initiative_origin']
export type BusinessUnit = Database['public']['Tables']['business_units']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Label = Database['public']['Tables']['labels']['Row']

// Legacy aliases for backwards compatibility during migration
// TODO: Remove these after full codebase migration
export type Issue = Initiative
export type IssueState = InitiativeState
export type IssuePriority = InitiativePriority
export type IssueOrigin = InitiativeOrigin

// FDE Meetings and Messages types
export interface FDEMeeting {
  id: string
  organization_id: string
  title: string
  meeting_date: string | null
  duration_minutes: number | null
  attendees: string[] | null
  notes: string | null
  attachments: { name: string; url: string; type: string; size?: number }[] | null
  meeting_type: 'weekly' | 'quarterly' | 'ad_hoc' | 'kickoff' | 'review' | null
  with_fde: boolean
  created_by: string | null
  created_at: string
  updated_at: string | null
}

export interface FDEMessage {
  id: string
  organization_id: string
  conversation_id: string | null
  slack_channel_id: string | null
  slack_thread_ts: string | null
  slack_message_ts: string | null
  sender_type: 'user' | 'fde' | 'system'
  sender_user_id: string | null
  sender_name: string
  sender_avatar_url: string | null
  content: string
  attachments: { name: string; url: string; type: string }[] | null
  is_read: boolean
  created_at: string
}

// FDE Conversations types (threads)
export type FDEConversationStatus = 'active' | 'pending' | 'resolved' | 'archived'

export interface FDEConversation {
  id: string
  organization_id: string
  slack_thread_ts: string | null
  slack_channel_id: string | null
  title: string
  topic: string | null
  status: FDEConversationStatus
  created_by: string | null
  participant_ids: string[]
  last_message: string | null
  last_message_at: string | null
  last_message_sender: string | null
  unread_count: number
  message_count: number
  created_at: string
  updated_at: string
}
