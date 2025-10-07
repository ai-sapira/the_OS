import { supabase } from '../supabase/client'
import { 
  Survey, 
  SurveyQuestion, 
  SurveyResponse, 
  SurveyStatus,
  SurveyAudience,
  QuestionType,
  User,
  Initiative
} from '../database/types'

// Extended Survey type with relations
export type SurveyWithRelations = Survey & {
  creator_user_id?: string | null
  creator?: User | null
  target_bu?: Initiative | null
  questions?: SurveyQuestion[] | null
  response_count?: number
  my_response_status?: 'pending' | 'completed'
  completion_rate?: number
}

// Input types for creating surveys
export interface CreateSurveyInput {
  title: string
  description?: string
  target_audience: SurveyAudience
  target_bu_id?: string | null
  target_roles?: string[] | null
  starts_at?: string | null
  ends_at?: string | null
  allow_anonymous?: boolean
  allow_multiple_responses?: boolean
  questions: CreateQuestionInput[]
}

export interface CreateQuestionInput {
  question_text: string
  question_type: QuestionType
  options?: string[] | null
  is_required?: boolean
  order_index: number
}

// Input types for updating surveys
export interface UpdateSurveyInput {
  title?: string
  description?: string
  target_audience?: SurveyAudience
  target_bu_id?: string | null
  target_roles?: string[] | null
  starts_at?: string | null
  ends_at?: string | null
  allow_anonymous?: boolean
  allow_multiple_responses?: boolean
}

// Input types for submitting responses
export interface SubmitResponseInput {
  question_id: string
  response_value?: string
  response_data?: any
}

export class SurveysAPI {
  // Get all surveys with filters
  static async getSurveys(
    organizationId?: string,
    filters?: {
      status?: SurveyStatus
      creator_id?: string
      target_bu_id?: string
    }
  ): Promise<SurveyWithRelations[]> {
    let query = supabase
      .from('surveys')
      .select(`
        *,
        creator:users!surveys_creator_user_id_fkey(id, name, email, avatar_url, role),
        target_bu:initiatives!surveys_target_bu_id_fkey(id, name, slug, description),
        questions:survey_questions(*)
      `)
    
    // Only filter by organization if provided
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    query = query.order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.creator_id) {
      query = query.eq('creator_user_id', filters.creator_id)
    }
    if (filters?.target_bu_id) {
      query = query.eq('target_bu_id', filters.target_bu_id)
    }

    const { data, error } = await query

    if (error) throw error

    // Get response counts and my response status for each survey
    const surveysWithStats = await Promise.all(
      (data || []).map(async (survey) => {
        const response_count = await this.getResponseCount(survey.id)
        const my_response_status = await this.getMyResponseStatus(survey.id)
        const completion_rate = await this.calculateCompletionRate(survey.id)

        return {
          ...survey,
          response_count,
          my_response_status,
          completion_rate
        } as SurveyWithRelations
      })
    )

    return surveysWithStats
  }

  // Get a single survey by ID
  static async getSurveyById(id: string): Promise<SurveyWithRelations | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        creator:users!surveys_creator_user_id_fkey(id, name, email, avatar_url, role),
        target_bu:initiatives!surveys_target_bu_id_fkey(id, name, slug, description),
        questions:survey_questions(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    // Get stats
    const response_count = await this.getResponseCount(data.id)
    const my_response_status = await this.getMyResponseStatus(data.id)
    const completion_rate = await this.calculateCompletionRate(data.id)

    return {
      ...data,
      response_count,
      my_response_status,
      completion_rate
    } as SurveyWithRelations
  }

  // Create a new survey
  static async createSurvey(
    input: CreateSurveyInput, 
    creatorUserId: string,
    organizationId: string
  ): Promise<Survey> {
    // Create the survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        organization_id: organizationId,
        creator_user_id: creatorUserId,
        title: input.title,
        description: input.description || null,
        target_audience: input.target_audience,
        target_bu_id: input.target_bu_id || null,
        target_roles: input.target_roles || null,
        starts_at: input.starts_at || null,
        ends_at: input.ends_at || null,
        allow_anonymous: input.allow_anonymous || false,
        allow_multiple_responses: input.allow_multiple_responses || false,
        status: 'active' // Publish immediately
      })
      .select()
      .single()

    if (surveyError) throw surveyError

    // Create the questions
    if (input.questions && input.questions.length > 0) {
      const questionsToInsert = input.questions.map(q => ({
        survey_id: survey.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        is_required: q.is_required || false,
        order_index: q.order_index
      }))

      const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError
    }

    return survey
  }

  // Update a survey
  static async updateSurvey(id: string, input: UpdateSurveyInput): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a survey
  static async deleteSurvey(id: string): Promise<void> {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Publish a survey (change status from draft to active)
  static async publishSurvey(id: string): Promise<Survey> {
    return this.updateSurvey(id, { status: 'active' })
  }

  // Close a survey (change status to closed)
  static async closeSurvey(id: string): Promise<Survey> {
    return this.updateSurvey(id, { status: 'closed' })
  }

  // Archive a survey
  static async archiveSurvey(id: string): Promise<Survey> {
    return this.updateSurvey(id, { status: 'archived' })
  }

  // Submit a response to a survey
  static async submitResponse(
    surveyId: string, 
    responses: SubmitResponseInput[],
    responderUserId?: string
  ): Promise<void> {
    const responsesToInsert = responses.map(r => ({
      survey_id: surveyId,
      question_id: r.question_id,
      responder_user_id: responderUserId || null,
      response_value: r.response_value || null,
      response_data: r.response_data || null
    }))

    const { error } = await supabase
      .from('survey_responses')
      .insert(responsesToInsert)

    if (error) throw error
  }

  // Get my responses for a survey
  static async getMyResponses(surveyId: string, userId: string): Promise<SurveyResponse[]> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('responder_user_id', userId)

    if (error) throw error
    return data || []
  }

  // Get all responses for a survey (for creators/admins)
  static async getSurveyResults(surveyId: string): Promise<{
    questions: SurveyQuestion[]
    responses: SurveyResponse[]
    stats: {
      total_responses: number
      completion_rate: number
      avg_time?: number
    }
  }> {
    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true })

    if (questionsError) throw questionsError

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)

    if (responsesError) throw responsesError

    // Calculate stats
    const total_responses = await this.getResponseCount(surveyId)
    const completion_rate = await this.calculateCompletionRate(surveyId)

    return {
      questions: questions || [],
      responses: responses || [],
      stats: {
        total_responses,
        completion_rate
      }
    }
  }

  // Helper: Get response count for a survey
  private static async getResponseCount(surveyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('survey_responses')
      .select('responder_user_id', { count: 'exact', head: true })
      .eq('survey_id', surveyId)

    if (error) throw error
    return count || 0
  }

  // Helper: Get my response status (pending or completed)
  private static async getMyResponseStatus(
    surveyId: string
  ): Promise<'pending' | 'completed'> {
    // TODO: Get actual user ID from auth context
    const mockUserId = 'b8023796-e4c8-4752-9f5c-5b140c990f06' // Guillermo (guillermo@sapira.ai)
    
    const { count, error } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .eq('responder_user_id', mockUserId)

    if (error) throw error
    return (count || 0) > 0 ? 'completed' : 'pending'
  }

  // Helper: Calculate completion rate
  private static async calculateCompletionRate(surveyId: string): Promise<number> {
    // Get total questions
    const { count: totalQuestions } = await supabase
      .from('survey_questions')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', surveyId)

    // Get total responses
    const { count: totalResponses } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', surveyId)

    if (!totalQuestions || totalQuestions === 0) return 0

    // Calculate completion rate as percentage
    const rate = ((totalResponses || 0) / totalQuestions) * 100
    return Math.min(100, Math.round(rate))
  }

  // Get available users for targeting (helper for UI)
  static async getAvailableUsers(organizationId?: string): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get available BUs for targeting (helper for UI)
  static async getAvailableBUs(organizationId?: string): Promise<Initiative[]> {
    let query = supabase
      .from('initiatives')
      .select('*')
      .eq('active', true)
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }
}

