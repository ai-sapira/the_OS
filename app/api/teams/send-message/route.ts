import { NextRequest, NextResponse } from 'next/server'
import { TeamsMessenger } from '@/lib/api/teams-messenger'

/**
 * POST /api/teams/send-message
 * Sends a proactive message to the Teams conversation linked to an initiative
 * 
 * Request body:
 * {
 *   initiative_id: string (or issue_id for backwards compatibility),
 *   message: string,
 *   message_type?: 'comment' | 'status_update' | 'assignment' | 'info'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both initiative_id and issue_id for backwards compatibility
    const initiativeId = body.initiative_id || body.issue_id
    
    // Validation
    if (!initiativeId || !body.message?.trim()) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Both initiative_id and message are required' 
        },
        { status: 400 }
      )
    }
    
    // Send message to Teams
    const success = await TeamsMessenger.sendMessageToInitiative({
      initiativeId: initiativeId,
      message: body.message.trim(),
      messageType: body.message_type || 'comment'
    })
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Failed to send Teams message',
          details: 'No Teams context found for this issue or API error occurred'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent to Teams successfully'
    })
    
  } catch (error) {
    console.error('Error in send-message endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/teams/send-message?initiative_id=xxx (or issue_id for backwards compatibility)
 * Checks if an initiative has Teams context (can receive messages)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    // Support both initiative_id and issue_id for backwards compatibility
    const initiativeId = searchParams.get('initiative_id') || searchParams.get('issue_id')
    
    if (!initiativeId) {
      return NextResponse.json(
        { error: 'Missing initiative_id parameter' },
        { status: 400 }
      )
    }
    
    const hasContext = await TeamsMessenger.hasTeamsContext(initiativeId)
    
    return NextResponse.json({
      initiative_id: initiativeId,
      issue_id: initiativeId, // Legacy alias
      has_teams_context: hasContext,
      can_send_messages: hasContext
    })
    
  } catch (error) {
    console.error('Error checking Teams context:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
