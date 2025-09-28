import { NextRequest, NextResponse } from 'next/server'
import { TeamsIntegration, type TeamsConversationData } from '@/lib/api/teams-integration'

export async function POST(request: NextRequest) {
  try {
    // Parse the Teams conversation data
    const conversationData: TeamsConversationData = await request.json()

    // Validate required fields
    if (!conversationData.conversation_id || !conversationData.ai_analysis?.summary) {
      return NextResponse.json(
        { error: 'Missing required fields: conversation_id and ai_analysis.summary' },
        { status: 400 }
      )
    }

    // Create issue from Teams conversation
    const result = await TeamsIntegration.createIssueFromTeamsConversation(conversationData)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Issue created successfully from Teams conversation',
      data: {
        issue_id: result.issue_id,
        issue_key: result.issue_key,
        triage_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?issue=${result.issue_key}`
      }
    })

  } catch (error) {
    console.error('Error processing Teams webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process Teams conversation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Teams webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
