"use client"

import { MessageSquare, ExternalLink, Bot, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Message {
  author: string
  content: string
  timestamp: string
}

interface TeamsConversationProps {
  messages: Message[]
  conversationUrl?: string
  summary?: string
  keyPoints?: string[]
  suggestedAssignee?: string
}

export function TeamsConversation({ 
  messages, 
  conversationUrl, 
  summary,
  keyPoints,
  suggestedAssignee 
}: TeamsConversationProps) {
  if (!messages || messages.length === 0) {
    return null
  }

  // Determine if message is from AI or user
  const isAIMessage = (author: string) => {
    return author.toLowerCase().includes('sapira') || author.toLowerCase().includes('ai') || author.toLowerCase().includes('bot')
  }

  return (
    <div className="space-y-4">
      {/* Summary section */}
      {summary && (
        <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Resumen IA
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="border border-purple-100 bg-purple-50/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">
            Puntos clave identificados
          </h3>
          <ul className="space-y-1.5">
            {keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span className="flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested assignee */}
      {suggestedAssignee && (
        <div className="border border-green-100 bg-green-50/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-green-900">
              Asignación sugerida:
            </h3>
            <Badge variant="outline" className="bg-white border-green-200 text-green-700">
              {suggestedAssignee}
            </Badge>
          </div>
        </div>
      )}

      {/* Conversation header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">
            Conversación original ({messages.length} mensajes)
          </h3>
        </div>
        {conversationUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => window.open(conversationUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Abrir en Teams
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {messages.map((message, index) => {
          const isAI = isAIMessage(message.author)
          
          return (
            <div
              key={index}
              className={`flex gap-3 ${isAI ? 'bg-gray-50/50' : ''} rounded-lg p-3`}
            >
              <div className="flex-shrink-0">
                {isAI ? (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
