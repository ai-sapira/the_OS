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
    <div className="space-y-3">
      {/* AI Analysis Section - Combined */}
      {(summary || keyPoints || suggestedAssignee) && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50/30 to-purple-50/30">
          <div className="px-4 py-3 border-b border-gray-200/50 bg-white/50">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-900">Análisis de IA</h3>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Summary */}
            {summary && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Resumen</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {/* Key points */}
            {keyPoints && keyPoints.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Puntos clave</h4>
                <ul className="space-y-1">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested assignee */}
            {suggestedAssignee && (
              <div className="pt-2 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Asignación sugerida:
                  </h4>
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 text-xs">
                    {suggestedAssignee}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversation section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">
                Conversación de Teams
              </h3>
              <span className="text-xs text-gray-500">({messages.length})</span>
            </div>
            {conversationUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs -mr-2"
                onClick={() => window.open(conversationUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir en Teams
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {messages.map((message, index) => {
            const isAI = isAIMessage(message.author)
            
            return (
              <div
                key={index}
                className="flex gap-3 group"
              >
                <div className="flex-shrink-0">
                  {isAI ? (
                    <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.author}
                    </span>
                    <span className="text-xs text-gray-400">
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
    </div>
  )
}


