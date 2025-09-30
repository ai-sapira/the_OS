import { NextRequest, NextResponse } from 'next/server'
import { TeamsMessenger } from '@/lib/api/teams-messenger'

/**
 * POST /api/teams/send-message
 * Sends a proactive message to the Teams conversation linked to an issue
 * 
 * Request body:
 * {
 *   issue_id: string,
 *   message: string,
 *   message_type?: 'comment' | 'status_update' | 'assignment' | 'info'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.issue_id || !body.message?.trim()) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Both issue_id and message are required' 
        },
        { status: 400 }
      )
    }
    
    // Send message to Teams
    const success = await TeamsMessenger.sendMessageToIssue({
      issueId: body.issue_id,
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
 * GET /api/teams/send-message?issue_id=xxx
 * Checks if an issue has Teams context (can receive messages)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const issueId = searchParams.get('issue_id')
    
    if (!issueId) {
      return NextResponse.json(
        { error: 'Missing issue_id parameter' },
        { status: 400 }
      )
    }
    
    const hasContext = await TeamsMessenger.hasTeamsContext(issueId)
    
    return NextResponse.json({
      issue_id: issueId,
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
