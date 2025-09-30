import { NextRequest, NextResponse } from 'next/server'
import { TeamsIntegration, type TeamsConversationData, type TeamsConversationReference } from '@/lib/api/teams-integration'

/**
 * API endpoint for Teams bot to create issues
 * POST /api/teams/create-issue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.conversation_id || !body.ai_analysis) {
      return NextResponse.json(
        { error: 'Missing required fields: conversation_id, ai_analysis' },
        { status: 400 }
      )
    }

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
    }

    // Convert bot data to TeamsConversationData format
    const conversationData: TeamsConversationData = {
      conversation_id: body.conversation_id,
      conversation_url: body.conversation_url || `https://teams.microsoft.com/l/chat/0/0?users=${body.user_id}`,
      participants: body.participants || [body.user_name, 'Sapira AI'],
      messages: body.messages || [],
      ai_analysis: {
        summary: body.ai_analysis.summary,
        priority: body.ai_analysis.priority,
        suggested_labels: body.ai_analysis.suggested_labels || [],
        key_points: body.ai_analysis.key_points || []
      },
      conversation_reference: conversationReference
    }

    // Create issue using TeamsIntegration
    const result = await TeamsIntegration.createIssueFromTeamsConversation(conversationData)

    // Return success response
    return NextResponse.json({
      success: true,
      issue_id: result.issue_id,
      issue_key: result.issue_key,
      issue_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/triage-new?issue=${result.issue_id}`
    })

  } catch (error) {
    console.error('Error creating issue from Teams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create issue',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



