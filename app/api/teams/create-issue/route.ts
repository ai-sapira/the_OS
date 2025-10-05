import { NextRequest, NextResponse } from 'next/server'
import { TeamsIntegration, type TeamsConversationData, type TeamsConversationReference } from '@/lib/api/teams-integration'

/**
 * API endpoint for Teams bot to create issues
 * POST /api/teams/create-issue
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] /api/teams/create-issue called')
    
    const body = await request.json()
    console.log('[API] Request body keys:', Object.keys(body))
    console.log('[API] conversation_id:', body.conversation_id)
    console.log('[API] ai_analysis:', body.ai_analysis ? 'present' : 'missing')
    
    // Validate request body
    if (!body.conversation_id || !body.ai_analysis) {
      console.error('[API] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: conversation_id, ai_analysis' },
        { status: 400 }
      )
    }

    console.log('[API] Building conversation reference...')
    // Build conversation reference if provided (for proactive messaging)
    let conversationReference: TeamsConversationReference | undefined
    if (body.conversation_reference) {
      conversationReference = {
        service_url: body.conversation_reference.serviceUrl || body.conversation_reference.service_url,
        tenant_id: body.conversation_reference.conversation?.tenantId,
        channel_id: body.conversation_reference.channelId || body.conversation_reference.channel_id,
        conversation: {
          id: body.conversation_reference.conversation?.id || body.conversation_id,
          isGroup: body.conversation_reference.conversation?.isGroup,
          conversationType: body.conversation_reference.conversation?.conversationType,
          tenantId: body.conversation_reference.conversation?.tenantId
        },
        bot: {
          id: body.conversation_reference.bot?.id || '',
          name: body.conversation_reference.bot?.name || 'Sapira'
        },
        user: {
          id: body.conversation_reference.user?.id || '',
          name: body.conversation_reference.user?.name || body.user_name || 'Usuario',
          aadObjectId: body.conversation_reference.user?.aadObjectId
        }
      }
      console.log('[API] Conversation reference built successfully')
    }

    console.log('[API] Building conversation data...')
    // Convert bot data to TeamsConversationData format
    const conversationData: TeamsConversationData = {
      conversation_id: body.conversation_id,
      conversation_url: body.conversation_url || `https://teams.microsoft.com/l/chat/0/0?users=${body.user_id}`,
      participants: body.participants || [body.user_name, 'Sapira AI'],
      messages: body.messages || [],
      ai_analysis: {
        summary: body.ai_analysis.summary,
        short_description: body.ai_analysis.short_description,
        impact: body.ai_analysis.impact,
        core_technology: body.ai_analysis.core_technology,
        difficulty: body.ai_analysis.difficulty,
        impact_score: body.ai_analysis.impact_score,
        priority: body.ai_analysis.priority,
        business_unit: body.ai_analysis.business_unit,
        project: body.ai_analysis.project,
        suggested_labels: body.ai_analysis.suggested_labels || [],
        key_points: body.ai_analysis.key_points || [],
        suggested_assignee: body.ai_analysis.suggested_assignee
      },
      conversation_reference: conversationReference
    }
    
    console.log('[API] Conversation data built:', {
      conversation_id: conversationData.conversation_id,
      messages_count: conversationData.messages.length,
      summary: conversationData.ai_analysis.summary?.substring(0, 100),
      business_unit: conversationData.ai_analysis.business_unit,
      project: conversationData.ai_analysis.project
    })

    console.log('[API] Calling TeamsIntegration.createIssueFromTeamsConversation...')
    // Create issue using TeamsIntegration
    const result = await TeamsIntegration.createIssueFromTeamsConversation(conversationData)
    
    console.log('[API] Issue created successfully:', result)

    // Return success response
    return NextResponse.json({
      success: true,
      issue_id: result.issue_id,
      issue_key: result.issue_key,
      issue_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/triage-new?issue=${result.issue_id}`
    })

  } catch (error) {
    console.error('[API] ❌ ERROR creating issue from Teams:', error)
    console.error('[API] Error type:', error?.constructor?.name)
    console.error('[API] Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Log more details if it's a Supabase error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('[API] Supabase error code:', (error as any).code)
      console.error('[API] Supabase error details:', (error as any).details)
      console.error('[API] Supabase error hint:', (error as any).hint)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create issue',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
        // Only include stack in development
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error instanceof Error ? error.stack : undefined 
        })
      },
      { status: 500 }
    )
  }
}



