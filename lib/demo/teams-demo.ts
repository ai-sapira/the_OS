// Demo script para simular Teams + AI Agent integration

export const DEMO_TEAMS_CONVERSATION = {
  conversation_id: "teams_conv_12345",
  conversation_url: "https://teams.microsoft.com/l/message/...",
  participants: [
    "juan.perez@sapira.com",
    "maria.gonzalez@sapira.com", 
    "carlos.rodriguez@sapira.com"
  ],
  messages: [
    {
      author: "juan.perez@sapira.com",
      content: "El dashboard está tardando mucho en cargar, especialmente cuando tenemos muchos proyectos activos. Los usuarios se quejan.",
      timestamp: "2025-09-26T09:30:00Z"
    },
    {
      author: "maria.gonzalez@sapira.com",
      content: "Sí, lo he notado también. Parece que es peor por las mañanas cuando hay más actividad.",
      timestamp: "2025-09-26T09:31:00Z"
    },
    {
      author: "carlos.rodriguez@sapira.com",
      content: "Puedo investigar. Probablemente necesitemos optimizar las queries o implementar caché.",
      timestamp: "2025-09-26T09:32:00Z"
    },
    {
      author: "juan.perez@sapira.com", 
      content: "Perfecto Carlos. Es importante porque afecta la productividad del equipo. ¿Puedes priorizarlo?",
      timestamp: "2025-09-26T09:33:00Z"
    }
  ],
  ai_analysis: {
    summary: "Optimizar rendimiento dashboard - carga lenta con muchos proyectos",
    priority: "P1" as const,
    suggested_labels: ["backend", "performance", "urgent"],
    key_points: [
      "Dashboard tarda mucho en cargar",
      "Problema empeora con muchos proyectos activos",
      "Afecta productividad del equipo",
      "Posibles soluciones: optimizar queries, implementar caché",
      "Carlos Rodríguez se ofrece a investigar"
    ]
  }
}

// Función para simular la demo
export async function simulateTeamsIntegration() {
  try {
    const response = await fetch('/api/webhooks/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DEMO_TEAMS_CONVERSATION)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Teams integration demo successful:', result)
      return result
    } else {
      console.error('❌ Teams integration demo failed:', result)
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('❌ Error in Teams demo:', error)
    throw error
  }
}

// Hook para usar en componentes de demo
export function useTeamsDemo() {
  const runDemo = async () => {
    const result = await simulateTeamsIntegration()
    
    // Mostrar notificación o redirigir al issue creado
    if (result.data?.triage_url) {
      window.open(result.data.triage_url, '_blank')
    }
    
    return result
  }

  return { runDemo }
}
