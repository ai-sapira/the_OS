// Mock data for organization chart
export type OrgPerson = {
  id: string
  name: string
  email: string
  role: "SAP" | "CEO" | "BU" | "EMP"
  position: string // Job title
  avatar_url: string
  layer: "strategy" | "execution"
  side: "sapira" | "gonvarri"
  department?: string // For BU managers and employees
  reports_to?: string // Parent node ID
  responsibilities: string[]
  projects_count?: number
  issues_count?: number
  active: boolean
}

export const MOCK_ORG_DATA: OrgPerson[] = [
  // STRATEGY LAYER - SAPIRA
  {
    id: "sap-1",
    name: "María García",
    email: "maria.garcia@sapira.ai",
    role: "SAP",
    position: "Advisory Lead - Head of Strategy",
    avatar_url: "/placeholder-user.jpg",
    layer: "strategy",
    side: "sapira",
    responsibilities: [
      "Definir roadmap con cliente",
      "Supervisar estrategia de IA",
      "Gestión de feedback global",
      "Alineación estratégica"
    ],
    projects_count: 8,
    issues_count: 45,
    active: true
  },
  {
    id: "sap-2",
    name: "Carlos Martínez",
    email: "carlos.martinez@sapira.ai",
    role: "SAP",
    position: "Advisory Lead - Chief AI Officer",
    avatar_url: "/placeholder-user.jpg",
    layer: "strategy",
    side: "sapira",
    responsibilities: [
      "Arquitectura de soluciones IA",
      "Innovación tecnológica",
      "Roadmap técnico",
      "Consultoría estratégica"
    ],
    projects_count: 6,
    issues_count: 32,
    active: true
  },

  // STRATEGY LAYER - GONVARRI
  {
    id: "ceo-1",
    name: "Ana Fernández",
    email: "ana.fernandez@gonvarri.com",
    role: "CEO",
    position: "CEO - Change Leader",
    avatar_url: "/placeholder-user.jpg",
    layer: "strategy",
    side: "gonvarri",
    responsibilities: [
      "Liderar transformación digital",
      "Aprobar roadmap e iniciativas",
      "Supervisar progreso global",
      "Alinear objetivos de negocio"
    ],
    projects_count: 12,
    issues_count: 89,
    active: true
  },

  // EXECUTION LAYER - SAPIRA (FDEs)
  {
    id: "fde-1",
    name: "Laura Sánchez",
    email: "laura.sanchez@sapira.ai",
    role: "SAP",
    position: "FDE 1 - Forward Deployed Engineer",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "sapira",
    reports_to: "sap-1",
    responsibilities: [
      "Recopilar feedback de Finance",
      "Crear iniciativas y proyectos",
      "Tracking de KPIs",
      "Soporte técnico directo"
    ],
    projects_count: 4,
    issues_count: 28,
    active: true
  },
  {
    id: "fde-2",
    name: "David López",
    email: "david.lopez@sapira.ai",
    role: "SAP",
    position: "FDE 2 - Forward Deployed Engineer",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "sapira",
    reports_to: "sap-1",
    responsibilities: [
      "Recopilar feedback de Legal",
      "Gestión de tickets técnicos",
      "Medición de rendimiento",
      "Implementación de soluciones"
    ],
    projects_count: 3,
    issues_count: 22,
    active: true
  },
  {
    id: "fde-3",
    name: "Sara Rodríguez",
    email: "sara.rodriguez@sapira.ai",
    role: "SAP",
    position: "FDE 3 - Forward Deployed Engineer",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "sapira",
    reports_to: "sap-2",
    responsibilities: [
      "Recopilar feedback de HR",
      "Análisis de procesos",
      "Optimización de workflows",
      "Training y capacitación"
    ],
    projects_count: 5,
    issues_count: 31,
    active: true
  },

  // EXECUTION LAYER - GONVARRI (BU Managers)
  {
    id: "bu-finance",
    name: "Roberto Jiménez",
    email: "roberto.jimenez@gonvarri.com",
    role: "BU",
    position: "Finance Manager",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "Finance",
    reports_to: "ceo-1",
    responsibilities: [
      "Gestionar equipo Finance (5 personas)",
      "Priorizar tickets financieros",
      "Reportar al CEO",
      "Colaborar con FDE 1"
    ],
    projects_count: 3,
    issues_count: 18,
    active: true
  },
  {
    id: "bu-legal",
    name: "Patricia Moreno",
    email: "patricia.moreno@gonvarri.com",
    role: "BU",
    position: "Legal Manager",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "Legal",
    reports_to: "ceo-1",
    responsibilities: [
      "Gestionar equipo Legal (3 personas)",
      "Compliance y regulaciones",
      "Gestión de riesgos legales",
      "Colaborar con FDE 2"
    ],
    projects_count: 2,
    issues_count: 12,
    active: true
  },
  {
    id: "bu-hr",
    name: "Miguel Ángel Torres",
    email: "miguel.torres@gonvarri.com",
    role: "BU",
    position: "HR Manager",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "HR",
    reports_to: "ceo-1",
    responsibilities: [
      "Gestionar equipo HR (4 personas)",
      "Desarrollo de talento",
      "Cultura organizacional",
      "Colaborar con FDE 3"
    ],
    projects_count: 4,
    issues_count: 15,
    active: true
  },

  // EXECUTION LAYER - GONVARRI (Employees)
  {
    id: "emp-finance-1",
    name: "Elena Ruiz",
    email: "elena.ruiz@gonvarri.com",
    role: "EMP",
    position: "Financial Analyst",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "Finance",
    reports_to: "bu-finance",
    responsibilities: [
      "Análisis financiero",
      "Reportes mensuales",
      "Control de costes"
    ],
    issues_count: 8,
    active: true
  },
  {
    id: "emp-finance-2",
    name: "Javier Blanco",
    email: "javier.blanco@gonvarri.com",
    role: "EMP",
    position: "Accountant",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "Finance",
    reports_to: "bu-finance",
    responsibilities: [
      "Contabilidad general",
      "Conciliaciones bancarias",
      "Gestión de facturas"
    ],
    issues_count: 6,
    active: true
  },
  {
    id: "emp-legal-1",
    name: "Cristina Vargas",
    email: "cristina.vargas@gonvarri.com",
    role: "EMP",
    position: "Legal Advisor",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "Legal",
    reports_to: "bu-legal",
    responsibilities: [
      "Asesoría legal",
      "Revisión de contratos",
      "Gestión de compliance"
    ],
    issues_count: 5,
    active: true
  },
  {
    id: "emp-hr-1",
    name: "Fernando Castro",
    email: "fernando.castro@gonvarri.com",
    role: "EMP",
    position: "HR Specialist",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "HR",
    reports_to: "bu-hr",
    responsibilities: [
      "Reclutamiento",
      "Onboarding",
      "Gestión de talento"
    ],
    issues_count: 7,
    active: true
  },
  {
    id: "emp-hr-2",
    name: "Isabel Morales",
    email: "isabel.morales@gonvarri.com",
    role: "EMP",
    position: "Training Coordinator",
    avatar_url: "/placeholder-user.jpg",
    layer: "execution",
    side: "gonvarri",
    department: "HR",
    reports_to: "bu-hr",
    responsibilities: [
      "Coordinación de formación",
      "Desarrollo profesional",
      "Evaluación de desempeño"
    ],
    issues_count: 4,
    active: true
  }
]

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  SAP: {
    title: "Sapira",
    description: "Asesores y equipo técnico que orientan sobre el roadmap, feedback y cómo impulsar la estrategia de transformación AI",
    color: "bg-blue-500",
    layers: {
      strategy: "Advisory Leads - Definen estrategia y roadmap global",
      execution: "FDEs - Ingenieros híbridos dedicados con relación directa con BUs"
    }
  },
  CEO: {
    title: "CEO / Change Leader",
    description: "Líderes que impulsan la transformación AI y definen el roadmap interno de la empresa",
    color: "bg-purple-500",
    layers: {
      strategy: "Liderazgo estratégico y aprobación de iniciativas"
    }
  },
  BU: {
    title: "BU Manager",
    description: "Managers de departamentos funcionales (Finance, Legal, HR, etc.)",
    color: "bg-green-500",
    layers: {
      execution: "Gestión de equipos y priorización de trabajo departamental"
    }
  },
  EMP: {
    title: "Employee",
    description: "Empleados de los Squads/BUs que ejecutan el trabajo diario",
    color: "bg-gray-500",
    layers: {
      execution: "Ejecución de tareas y reporte de feedback"
    }
  }
}

