import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/bot/gemini.service';
import { ConversationManager } from '@/lib/bot/types';
import { TicketCreationService } from '@/lib/bot/ticket-creation.service';

// Servicios del bot
const geminiService = new GeminiService();
const ticketService = new TicketCreationService();
const conversations = new Map<string, ConversationManager>();

/**
 * POST /api/messages
 * Endpoint simplificado para Teams que funciona sin CloudAdapter
 */
export async function POST(request: NextRequest) {
  let activity: any;
  
  try {
    // Parse activity from Teams
    activity = await request.json();
    console.log('📩 Received Teams message:', {
      type: activity.type,
      text: activity.text,
      from: activity.from?.name,
      conversationId: activity.conversation?.id
    });

    // Solo procesar mensajes de texto
    if (activity.type !== 'message' || !activity.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Extraer información del usuario
    const userId = activity.from.id;
    const userName = activity.from.name || 'Usuario';
    const userEmail = activity.from.aadObjectId;
    const conversationId = activity.conversation.id;
    const serviceUrl = activity.serviceUrl;

    // Obtener o crear conversación
    const conversation = getOrCreateConversation(
      conversationId,
      userId,
      userName,
      userEmail
    );

    // Añadir mensaje del usuario
    conversation.addMessage(activity.text, 'user');
    console.log('💬 User message added to conversation');

    // Decidir si crear ticket o continuar conversación
    const shouldCreateTicket = await geminiService.shouldCreateTicket(conversation);
    
    let responseText = '';
    
    if (shouldCreateTicket && conversation.state !== 'awaiting_confirmation') {
      // Generar propuesta de ticket
      const proposal = await geminiService.generateTicketProposal(conversation);
      conversation.setTicketProposal(proposal);
      
      responseText = `He analizado tu problema y preparé este ticket:

📋 **${proposal.title}**
🔍 Prioridad: ${proposal.priority}
👥 Equipo: ${proposal.assignee_suggestion}
🏷️ Etiquetas: ${proposal.suggested_labels.join(', ')}

📝 **Descripción:**
${proposal.description}

¿Te parece correcto? Responde "sí" para crear el ticket o "no" si quieres hacer cambios.`;
      
    } else if (conversation.isWaitingForConfirmation()) {
      // Analizar respuesta del usuario
      const feedback = await geminiService.analyzeTicketFeedback(
        activity.text,
        conversation.ticketProposal!
      );
      
      if (feedback.action === 'confirm') {
        try {
          // Crear ticket
          const result = await ticketService.createTicketFromConversation(
            conversation,
            conversation.ticketProposal!
          );
          
          responseText = `🎉 ¡Perfecto! Tu ticket **${result.ticket_key}** ha sido creado exitosamente.

🔗 Ver ticket: ${result.ticket_url}

El equipo de soporte lo revisará y te contactará si necesita información adicional.`;
          
          conversation.setState('completed');
          
        } catch (error) {
          console.error('Error creating ticket:', error);
          responseText = 'Lo siento, hubo un error al crear el ticket. ¿Puedes intentarlo de nuevo?';
        }
      } else if (feedback.action === 'cancel') {
        responseText = 'Entendido, no se creará el ticket. Si necesitas ayuda en el futuro, no dudes en escribirme.';
        conversation.setState('completed');
      } else {
        responseText = feedback.followUpQuestion || '¿Qué te gustaría cambiar del ticket propuesto?';
      }
      
    } else {
      // Continuar conversación normal
      responseText = await geminiService.continueConversation(conversation);
    }

    // Añadir respuesta del bot a la conversación
    conversation.addMessage(responseText, 'bot');
    console.log('🤖 Bot response prepared');

    // Responder a Teams
    const response = await sendTeamsMessage(
      activity.serviceUrl,
      activity.conversation,
      activity.from,
      responseText,
      activity.id // Pasar el ID del mensaje para responder directamente
    );

    console.log('✅ Response sent to Teams');
    return NextResponse.json({ status: 'ok', sent: true });

  } catch (error) {
    console.error('❌ Bot error:', error);
    
    // Respuesta de fallback - solo si tenemos la actividad parseada
    if (activity) {
      try {
        await sendTeamsMessage(
          activity.serviceUrl,
          activity.conversation,
          activity.from,
          'Lo siento, hubo un error interno. Por favor inténtalo de nuevo.',
          activity.id
        );
      } catch (fallbackError) {
        console.error('Failed to send fallback message:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Bot processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Sapira Teams Bot is running (direct mode)',
    configured: true,
    gemini: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
}

// Helper functions
function getOrCreateConversation(
  conversationId: string,
  userId: string,
  userName: string,
  userEmail?: string
): ConversationManager {
  const key = `${conversationId}:${userId}`;
  
  if (!conversations.has(key)) {
    const conversation = new ConversationManager({
      id: conversationId,
      userId,
      userName,
      userEmail,
      channelId: conversationId,
    });
    conversations.set(key, conversation);
  }
  
  return conversations.get(key)!;
}

async function sendTeamsMessage(
  serviceUrl: string,
  conversation: any,
  recipient: any,
  text: string,
  replyToId?: string
) {
  const token = await getAccessToken();
  
  // Si tenemos un replyToId, usar la URL de respuesta específica
  const url = replyToId 
    ? `${serviceUrl}v3/conversations/${conversation.id}/activities/${replyToId}`
    : `${serviceUrl}v3/conversations/${conversation.id}/activities`;
  
  console.log('📤 Sending Teams message to:', url);
  
  const payload = {
    type: 'message',
    text: text,
    from: {
      id: `28:${process.env.MICROSOFT_APP_ID}`,
      name: 'Sapira Soporte'
    },
    ...(replyToId ? {} : { recipient: recipient }) // Solo incluir recipient si no es una respuesta
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to send Teams message:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      url,
      payload
    });
    throw new Error(`Failed to send Teams message: ${response.status} - ${errorText}`);
  }

  console.log('✅ Teams message sent successfully');
  return response.json();
}

async function getAccessToken(): Promise<string> {
  const tokenUrl = 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token';
  
  console.log('🔑 Requesting access token with:', {
    client_id: process.env.MICROSOFT_APP_ID,
    has_secret: !!process.env.MICROSOFT_APP_PASSWORD
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.MICROSOFT_APP_ID!,
      client_secret: process.env.MICROSOFT_APP_PASSWORD!,
      scope: 'https://api.botframework.com/.default'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to get access token:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Access token obtained successfully');
  return data.access_token;
}