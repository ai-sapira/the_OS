"use client"

import * as React from "react"
import { useState } from "react"
import {
  ResizableAppShell,
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plug,
  RefreshCw,
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Activity,
  Clock,
  MessageSquare,
  FileEdit,
  UserPlus,
  DollarSign,
  Plus,
  Search,
  X,
  Zap,
  MousePointerClick,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, ModalBody } from "@/components/ui/modal"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


// Mock data types
interface PurchaseOrder {
  PO_ID: string
  SKU: string
  totalAmount: number
  pricePerUnit: number
  timestamp: string
}

interface Invoice {
  Invoice_ID: string
  dateEmitted: string
  status: "paid" | "pending" | "overdue"
  datePaid: string | null
  totalAmount: number
  ivaRate: number
  timestamp: string
}

interface Lead {
  companyName: string
  pointOfContact: string
  createdAt: string
  dealGenerated: boolean
  timestamp: string
}

interface Deal {
  companyName: string
  pointOfContact: string
  createdAt: string
  totalAmount: number
  startDate: string
  timestamp: string
}

interface IntegrationEvent {
  id: string
  type: "note_added" | "status_changed" | "created" | "updated" | "assigned"
  user: string
  entity: string
  entityId: string
  description: string
  timestamp: string
}

interface ActiveIntegration {
  id: string
  name: string
  provider: string
  category: "ERP" | "CRM"
  domain: string
  lastSync: string
  isRealTime: boolean
  purchaseOrders?: PurchaseOrder[]
  invoices?: Invoice[]
  leads?: Lead[]
  deals?: Deal[]
  events?: IntegrationEvent[]
}

// Mock data generators
const generatePurchaseOrders = (count: number = 5): PurchaseOrder[] => {
  return Array.from({ length: count }, (_, i) => ({
    PO_ID: `PO-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    SKU: `SKU-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
    totalAmount: Math.floor(Math.random() * 50000) + 1000,
    pricePerUnit: Math.floor(Math.random() * 500) + 10,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }))
}

const generateInvoices = (count: number = 5): Invoice[] => {
  const statuses: ("paid" | "pending" | "overdue")[] = ["paid", "pending", "overdue"]
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      Invoice_ID: `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      dateEmitted: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString().split('T')[0],
      status,
      datePaid: status === "paid" ? new Date(Date.now() - Math.random() * 15 * 24 * 3600000).toISOString().split('T')[0] : null,
      totalAmount: Math.floor(Math.random() * 100000) + 5000,
      ivaRate: 21,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }
  })
}

const generateLeads = (count: number = 5): Lead[] => {
  const companies = ["TechCorp", "InnovateLabs", "DigitalSolutions", "CloudSystems", "DataWorks", "FutureTech", "SmartBiz"]
  const contacts = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown", "Emily Davis"]
  
  return Array.from({ length: count }, (_, i) => ({
    companyName: companies[Math.floor(Math.random() * companies.length)],
    pointOfContact: contacts[Math.floor(Math.random() * contacts.length)],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString().split('T')[0],
    dealGenerated: Math.random() > 0.5,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }))
}

const generateDeals = (count: number = 5): Deal[] => {
  const companies = ["TechCorp", "InnovateLabs", "DigitalSolutions", "CloudSystems", "DataWorks"]
  const contacts = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown"]
  
  return Array.from({ length: count }, (_, i) => ({
    companyName: companies[Math.floor(Math.random() * companies.length)],
    pointOfContact: contacts[Math.floor(Math.random() * contacts.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString().split('T')[0],
    totalAmount: Math.floor(Math.random() * 500000) + 10000,
    startDate: new Date(Date.now() - Math.random() * 60 * 24 * 3600000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }))
}

const generateEvents = (integrationId: string, count: number = 5): IntegrationEvent[] => {
  const users = ["María García", "Carlos López", "Ana Martínez", "Pedro Sánchez", "Laura Fernández"]
  const events: IntegrationEvent[] = []
  
  if (integrationId === "sap") {
    const invoiceIds = Array.from({ length: 5 }, (_, i) => `INV-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`)
    const poIds = Array.from({ length: 5 }, (_, i) => `PO-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`)
    
    events.push(
      {
        id: "1",
        type: "note_added",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Invoice",
        entityId: invoiceIds[0],
        description: `Note added to invoice ${invoiceIds[0]}`,
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      },
      {
        id: "2",
        type: "status_changed",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Invoice",
        entityId: invoiceIds[1],
        description: `Status changed to "Paid"`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      },
      {
        id: "3",
        type: "note_added",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Purchase Order",
        entityId: poIds[0],
        description: `Note added to purchase order ${poIds[0]}`,
        timestamp: new Date(Date.now() - Math.random() * 5400000).toISOString(),
      },
      {
        id: "4",
        type: "updated",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Invoice",
        entityId: invoiceIds[2],
        description: `Invoice ${invoiceIds[2]} updated`,
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      },
      {
        id: "5",
        type: "note_added",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Invoice",
        entityId: invoiceIds[3],
        description: `Nota añadida a factura ${invoiceIds[3]}`,
        timestamp: new Date(Date.now() - Math.random() * 9000000).toISOString(),
      },
    )
  } else if (integrationId === "salesforce") {
    const dealIds = Array.from({ length: 5 }, (_, i) => `DEAL-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`)
    const leadIds = Array.from({ length: 5 }, (_, i) => `LEAD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`)
    
    events.push(
      {
        id: "1",
        type: "note_added",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Deal",
        entityId: dealIds[0],
        description: `Note added to deal ${dealIds[0]}`,
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      },
      {
        id: "2",
        type: "created",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Lead",
        entityId: leadIds[0],
        description: `New lead created: ${leadIds[0]}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      },
      {
        id: "3",
        type: "assigned",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Deal",
        entityId: dealIds[1],
        description: `Deal ${dealIds[1]} assigned`,
        timestamp: new Date(Date.now() - Math.random() * 5400000).toISOString(),
      },
      {
        id: "4",
        type: "note_added",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Lead",
        entityId: leadIds[1],
        description: `Note added to lead ${leadIds[1]}`,
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      },
      {
        id: "5",
        type: "status_changed",
        user: users[Math.floor(Math.random() * users.length)],
        entity: "Deal",
        entityId: dealIds[2],
        description: `Deal ${dealIds[2]} status changed`,
        timestamp: new Date(Date.now() - Math.random() * 9000000).toISOString(),
      },
    )
  }
  
  return events.slice(0, count).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const ACTIVE_INTEGRATIONS: ActiveIntegration[] = [
  {
    id: "sap",
    name: "SAP",
    provider: "SAP",
    category: "ERP",
    domain: "sap.com",
    lastSync: "12 min ago",
    isRealTime: false,
    purchaseOrders: generatePurchaseOrders(8),
    invoices: generateInvoices(8),
    events: generateEvents("sap", 8),
  },
  {
    id: "salesforce",
    name: "Salesforce",
    provider: "Salesforce",
    category: "CRM",
    domain: "salesforce.com",
    lastSync: "Real-time",
    isRealTime: true,
    leads: generateLeads(10),
    deals: generateDeals(8),
    events: generateEvents("salesforce", 10),
  },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function getEventBadge(type: string) {
  const eventConfig = {
    note_added: {
      label: "Note added",
      icon: <MessageSquare className="h-3 w-3" />,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    status_changed: {
      label: "Status changed",
      icon: <Activity className="h-3 w-3" />,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    created: {
      label: "Created",
      icon: <UserPlus className="h-3 w-3" />,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    updated: {
      label: "Updated",
      icon: <FileEdit className="h-3 w-3" />,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
    assigned: {
      label: "Assigned",
      icon: <DollarSign className="h-3 w-3" />,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
  }

  const config = eventConfig[type as keyof typeof eventConfig] || {
    label: type.replace('_', ' '),
    icon: <Activity className="h-3 w-3" />,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border w-[110px] shrink-0", config.className)}>
      {config.icon}
      <span className="truncate">{config.label}</span>
    </span>
  )
}

function PurchaseOrdersTable({ orders }: { orders: PurchaseOrder[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const [displayingOrders, setDisplayingOrders] = React.useState(orders.slice(0, 3))

  React.useEffect(() => {
    if (expanded) {
      setDisplayingOrders(orders)
    } else {
      // Delay hiding rows to allow exit animation
      const timer = setTimeout(() => {
        setDisplayingOrders(orders.slice(0, 3))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, orders])

  const handleEntityClick = (id: string) => {
    // Navigate to entity detail
    console.log('Navigate to:', id)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Purchase Orders</span>
          <span className="text-xs text-gray-500">({orders.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">PO_ID</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">SKU</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total amount</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Price per unit</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Received</th>
            </tr>
          </thead>
          <tbody>
            {displayingOrders.map((order, idx) => {
              const isNewRow = expanded && idx >= 3 && idx < orders.length
              const isRemovedRow = !expanded && idx >= 3
              const animationDelay = idx >= 3 ? (idx - 3) * 30 : 0
              
              return (
              <tr
                key={`${order.PO_ID}-${expanded ? 'expanded' : 'collapsed'}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out"
                style={{
                  animation: isNewRow 
                    ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                    : isRemovedRow
                    ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                    : undefined,
                }}
              >
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEntityClick(order.PO_ID)}
                    className="font-mono text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {order.PO_ID}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-gray-700">{order.SKU}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold text-sm text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-gray-700">{formatCurrency(order.pricePerUnit)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-gray-500">{getTimeAgo(order.timestamp)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const [displayingInvoices, setDisplayingInvoices] = React.useState(invoices.slice(0, 3))

  React.useEffect(() => {
    if (expanded) {
      setDisplayingInvoices(invoices)
    } else {
      // Delay hiding rows to allow exit animation
      const timer = setTimeout(() => {
        setDisplayingInvoices(invoices.slice(0, 3))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, invoices])

  const handleEntityClick = (id: string) => {
    // Navigate to entity detail
    console.log('Navigate to:', id)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      overdue: "bg-red-50 text-red-700 border-red-200",
    }
    const labels = {
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
    }
    return (
      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium border", styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Invoices</span>
          <span className="text-xs text-gray-500">({invoices.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Invoice_ID</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Date emitted</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Date paid</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total amount</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">IVA rate</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Received</th>
            </tr>
          </thead>
          <tbody>
            {displayingInvoices.map((invoice, idx) => {
              const isNewRow = expanded && idx >= 3 && idx < invoices.length
              const isRemovedRow = !expanded && idx >= 3
              const animationDelay = idx >= 3 ? (idx - 3) * 30 : 0
              
              return (
              <tr
                key={`${invoice.Invoice_ID}-${expanded ? 'expanded' : 'collapsed'}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out"
                style={{
                  animation: isNewRow 
                    ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                    : isRemovedRow
                    ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                    : undefined,
                }}
              >
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEntityClick(invoice.Invoice_ID)}
                    className="font-mono text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {invoice.Invoice_ID}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">{formatDate(invoice.dateEmitted)}</span>
                </td>
                <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                <td className="py-3 px-4">
                  {invoice.datePaid ? (
                    <span className="text-sm text-gray-700">{formatDate(invoice.datePaid)}</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold text-sm text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-gray-700">{invoice.ivaRate}%</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-gray-500">{getTimeAgo(invoice.timestamp)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const [displayingLeads, setDisplayingLeads] = React.useState(leads.slice(0, 3))

  React.useEffect(() => {
    if (expanded) {
      setDisplayingLeads(leads)
    } else {
      // Delay hiding rows to allow exit animation
      const timer = setTimeout(() => {
        setDisplayingLeads(leads.slice(0, 3))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, leads])

  const handleUserClick = (user: string) => {
    // Navigate to user profile
    console.log('Navigate to user:', user)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Leads</span>
          <span className="text-xs text-gray-500">({leads.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Company name</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Point of Contact</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Created at</th>
              <th className="text-center py-2 px-4 font-semibold text-gray-700">Deal generated</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Received</th>
            </tr>
          </thead>
          <tbody>
            {displayingLeads.map((lead, idx) => {
              const isNewRow = expanded && idx >= 3 && idx < leads.length
              const isRemovedRow = !expanded && idx >= 3
              const animationDelay = idx >= 3 ? (idx - 3) * 30 : 0
              
              return (
              <tr
                key={`${lead.companyName}-${lead.pointOfContact}-${expanded ? 'expanded' : 'collapsed'}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out"
                style={{
                  animation: isNewRow 
                    ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                    : isRemovedRow
                    ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                    : undefined,
                }}
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-sm text-gray-900">{lead.companyName}</span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleUserClick(lead.pointOfContact)}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {lead.pointOfContact}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">{formatDate(lead.createdAt)}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  {lead.dealGenerated ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-gray-500">{getTimeAgo(lead.timestamp)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DealsTable({ deals }: { deals: Deal[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const [displayingDeals, setDisplayingDeals] = React.useState(deals.slice(0, 3))

  React.useEffect(() => {
    if (expanded) {
      setDisplayingDeals(deals)
    } else {
      // Delay hiding rows to allow exit animation
      const timer = setTimeout(() => {
        setDisplayingDeals(deals.slice(0, 3))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, deals])

  const handleUserClick = (user: string) => {
    // Navigate to user profile
    console.log('Navigate to user:', user)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Deals</span>
          <span className="text-xs text-gray-500">({deals.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Company name</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Point of Contact</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Created at</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Total amount</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Start date</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-700">Received</th>
            </tr>
          </thead>
          <tbody>
            {displayingDeals.map((deal, idx) => {
              const isNewRow = expanded && idx >= 3 && idx < deals.length
              const isRemovedRow = !expanded && idx >= 3
              const animationDelay = idx >= 3 ? (idx - 3) * 30 : 0
              
              return (
              <tr
                key={`${deal.companyName}-${deal.pointOfContact}-${expanded ? 'expanded' : 'collapsed'}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out"
                style={{
                  animation: isNewRow 
                    ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                    : isRemovedRow
                    ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                    : undefined,
                }}
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-sm text-gray-900">{deal.companyName}</span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleUserClick(deal.pointOfContact)}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {deal.pointOfContact}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">{formatDate(deal.createdAt)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold text-sm text-gray-900">{formatCurrency(deal.totalAmount)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">{formatDate(deal.startDate)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-gray-500">{getTimeAgo(deal.timestamp)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EventsTable({ events }: { events: IntegrationEvent[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const [displayingEvents, setDisplayingEvents] = React.useState(events.slice(0, 5))

  React.useEffect(() => {
    if (expanded) {
      setDisplayingEvents(events)
    } else {
      // Delay hiding rows to allow exit animation
      const timer = setTimeout(() => {
        setDisplayingEvents(events.slice(0, 5))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [expanded, events])

  const handleUserClick = (user: string) => {
    // Navigate to user profile
    console.log('Navigate to user:', user)
  }

  const handleEntityClick = (entityId: string, entityType: string) => {
    // Navigate to entity detail
    console.log('Navigate to:', entityType, entityId)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-900">Events</span>
          <span className="text-xs text-gray-500">({events.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Collapse <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Usuario</th>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Evento</th>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Entidad</th>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">Descripción</th>
              <th className="text-right py-2.5 px-4 font-semibold text-gray-700">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {displayingEvents.map((event, idx) => {
              const isNewRow = expanded && idx >= 5 && idx < events.length
              const isRemovedRow = !expanded && idx >= 5
              const animationDelay = idx >= 5 ? (idx - 5) * 30 : 0
              
              return (
              <tr
                key={`${event.id}-${expanded ? 'expanded' : 'collapsed'}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ease-in-out"
                style={{
                  animation: isNewRow 
                    ? `fadeInSlide 0.3s ease-out ${animationDelay}ms both`
                    : isRemovedRow
                    ? `fadeOutSlide 0.3s ease-out ${animationDelay}ms both`
                    : undefined,
                }}
              >
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleUserClick(event.user)}
                    className="font-medium text-sm text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {event.user}
                  </button>
                </td>
                <td className="py-3 px-4">
                  {getEventBadge(event.type)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEntityClick(event.entityId, event.entity)}
                    className="font-mono text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {event.entityId}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-700">{event.description}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-gray-500">{getTimeAgo(event.timestamp)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Events List component similar to user monitoring
function IntegrationEventsList({ events }: { events: Array<IntegrationEvent & { integrationId?: string, integrationName?: string }> }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No events recorded</p>
      </div>
    )
  }

  // Calculate event context info for each event
  const getEventContext = (event: typeof events[0], allEvents: typeof events) => {
    const eventIntegrationName = event.integrationName || "Unknown"
    const sameHourEvents = allEvents.filter(e => {
      const eventHour = new Date(event.timestamp).getHours()
      const eHour = new Date(e.timestamp).getHours()
      const eventDate = format(parseISO(event.timestamp), "yyyy-MM-dd")
      const eDate = format(parseISO(e.timestamp), "yyyy-MM-dd")
      return (e.integrationName || "Unknown") === eventIntegrationName && 
             eHour === eventHour &&
             eDate === eventDate
    }).length

    const sameTypeEvents = allEvents.filter(e => 
      e.type === event.type && 
      format(parseISO(e.timestamp), "yyyy-MM-dd") === format(parseISO(event.timestamp), "yyyy-MM-dd")
    ).length

    return {
      integrationEventsThisHour: sameHourEvents,
      typeEventsToday: sameTypeEvents,
    }
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--stroke)' }}>
      {events.map((event) => {
        const badge = getEventBadge(event.type)
        const integrationName = event.integrationName || "Unknown"
        const context = getEventContext(event, events)
        const eventDate = parseISO(event.timestamp)
        
        return (
          <div
            key={event.id}
            className="px-6 py-3 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {badge}
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">
                      {integrationName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(eventDate, "HH:mm:ss")}
                    </span>
                    {context.integrationEventsThisHour > 1 && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {context.integrationEventsThisHour}x this hour
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">
                      {event.entity} {event.entityId}
                    </div>
                    <div className="text-xs text-gray-900">
                      {event.description}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-[160px]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white text-gray-700 border border-gray-300">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                        {event.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{event.user}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Available integrations data
interface AvailableIntegration {
  id: string
  name: string
  description: string
  category: "ERP" | "CRM" | "Marketing" | "Analytics" | "Communication" | "Finance" | "HR" | "Other"
  domain: string // Domain for logo loading
  icon?: string
  color?: string
  isPopular?: boolean
}

const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  // ERP
  { id: "sap", name: "SAP", description: "Enterprise Resource Planning", category: "ERP", domain: "sap.com", isPopular: true },
  { id: "oracle-erp", name: "Oracle ERP Cloud", description: "Enterprise Resource Planning", category: "ERP", domain: "oracle.com", isPopular: true },
  { id: "microsoft-dynamics", name: "Microsoft Dynamics 365", description: "Enterprise Resource Planning", category: "ERP", domain: "microsoft.com", isPopular: true },
  { id: "netsuite", name: "NetSuite", description: "Cloud ERP Solution", category: "ERP", domain: "netsuite.com" },
  { id: "sage", name: "Sage", description: "Business Management Software", category: "ERP", domain: "sage.com" },
  { id: "infor", name: "Infor", description: "Enterprise Software Solutions", category: "ERP", domain: "infor.com" },
  
  // CRM
  { id: "salesforce", name: "Salesforce", description: "Customer Relationship Management", category: "CRM", domain: "salesforce.com", isPopular: true },
  { id: "hubspot", name: "HubSpot", description: "CRM and Marketing Platform", category: "CRM", domain: "hubspot.com", isPopular: true },
  { id: "microsoft-dynamics-crm", name: "Microsoft Dynamics CRM", description: "Customer Relationship Management", category: "CRM", domain: "microsoft.com" },
  { id: "zoho-crm", name: "Zoho CRM", description: "Cloud-based CRM", category: "CRM", domain: "zoho.com" },
  { id: "pipedrive", name: "Pipedrive", description: "Sales CRM Software", category: "CRM", domain: "pipedrive.com" },
  { id: "freshsales", name: "Freshsales", description: "CRM for High-Velocity Sales", category: "CRM", domain: "freshworks.com" },
  
  // Marketing
  { id: "mailchimp", name: "Mailchimp", description: "Email Marketing Platform", category: "Marketing", domain: "mailchimp.com", isPopular: true },
  { id: "marketo", name: "Marketo", description: "Marketing Automation", category: "Marketing", domain: "marketo.com" },
  { id: "pardot", name: "Pardot", description: "B2B Marketing Automation", category: "Marketing", domain: "salesforce.com" },
  { id: "activecampaign", name: "ActiveCampaign", description: "Email Marketing & Automation", category: "Marketing", domain: "activecampaign.com" },
  
  // Analytics
  { id: "google-analytics", name: "Google Analytics", description: "Web Analytics Service", category: "Analytics", domain: "google.com", isPopular: true },
  { id: "tableau", name: "Tableau", description: "Business Intelligence", category: "Analytics", domain: "tableau.com" },
  { id: "power-bi", name: "Microsoft Power BI", description: "Business Analytics", category: "Analytics", domain: "microsoft.com" },
  { id: "looker", name: "Looker", description: "Business Intelligence Platform", category: "Analytics", domain: "looker.com" },
  
  // Communication
  { id: "slack", name: "Slack", description: "Team Communication", category: "Communication", domain: "slack.com", isPopular: true },
  { id: "microsoft-teams", name: "Microsoft Teams", description: "Collaboration Platform", category: "Communication", domain: "microsoft.com" },
  { id: "zoom", name: "Zoom", description: "Video Conferencing", category: "Communication", domain: "zoom.us" },
  
  // Finance
  { id: "quickbooks", name: "QuickBooks", description: "Accounting Software", category: "Finance", domain: "intuit.com", isPopular: true },
  { id: "xero", name: "Xero", description: "Cloud Accounting", category: "Finance", domain: "xero.com" },
  { id: "stripe", name: "Stripe", description: "Payment Processing", category: "Finance", domain: "stripe.com" },
  { id: "paypal", name: "PayPal", description: "Payment Platform", category: "Finance", domain: "paypal.com" },
  
  // HR
  { id: "workday", name: "Workday", description: "Human Capital Management", category: "HR", domain: "workday.com" },
  { id: "bamboohr", name: "BambooHR", description: "HR Management Software", category: "HR", domain: "bamboohr.com" },
  { id: "adp", name: "ADP", description: "Payroll & HR Solutions", category: "HR", domain: "adp.com" },
]

// Logo component with fallback
function IntegrationLogo({ 
  domain, 
  name, 
  className 
}: { 
  domain: string
  name: string
  className?: string 
}) {
  const [logoError, setLogoError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  
  const logoUrl = `https://logo.clearbit.com/${domain}`
  
  return (
    <div className={cn("relative flex items-center justify-center shrink-0 h-10 w-10", className)}>
      {isLoading && !logoError && (
        <div className="absolute inset-0 rounded-lg bg-gray-100 animate-pulse" />
      )}
      {!logoError ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className={cn(
            "h-10 w-10 rounded-lg object-contain bg-white border border-gray-200 p-1.5 transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setLogoError(true)
            setIsLoading(false)
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold border border-gray-200">
          {name.charAt(0)}
        </div>
      )}
    </div>
  )
}

function AddIntegrationModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  
  // Filter out already connected integrations
  const activeIntegrationIds = ACTIVE_INTEGRATIONS.map(i => i.id)
  const availableIntegrations = AVAILABLE_INTEGRATIONS.filter(
    integration => !activeIntegrationIds.includes(integration.id)
  )
  
  const categories = Array.from(new Set(availableIntegrations.map(i => i.category)))
  
  const filteredIntegrations = availableIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const handleConnect = (integrationId: string) => {
    // TODO: Implement connection logic
    console.log('Connecting to:', integrationId)
    // For now, just show an alert
    alert(`Conectando a ${availableIntegrations.find(i => i.id === integrationId)?.name}...`)
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ERP": return <Building2 className="h-4 w-4" />
      case "CRM": return <Plug className="h-4 w-4" />
      case "Marketing": return <MessageSquare className="h-4 w-4" />
      case "Analytics": return <Activity className="h-4 w-4" />
      case "Communication": return <MessageSquare className="h-4 w-4" />
      case "Finance": return <DollarSign className="h-4 w-4" />
      case "HR": return <UserPlus className="h-4 w-4" />
      default: return <Plug className="h-4 w-4" />
    }
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      }
    }
  }
  
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.4
      }
    }
  }
  
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title="Add Integration"
      subtitle={`${availableIntegrations.length} integrations available`}
      icon={<Plug className="h-5 w-5" />}
      className="data-[state=open]:animate-none data-[state=closed]:animate-none"
    >
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.23, 1, 0.32, 1],
              opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
              y: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <ModalBody className="px-6 py-6">
              {/* Search and Filters */}
              <motion.div 
                className="space-y-4 mb-6"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.25,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                      !selectedCategory
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    All
                  </motion.button>
                  {categories.map((category, index) => (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + index * 0.03 }}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                        selectedCategory === category
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Integrations Grid */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory || 'all'}
              >
                {filteredIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IntegrationLogo 
                          domain={integration.domain}
                          name={integration.name}
                          className="relative"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {integration.name}
                            </h3>
                            {integration.isPopular && (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.03 }}
                                className="px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap"
                              >
                                Popular
                              </motion.span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {getCategoryIcon(integration.category)}
                        {integration.category}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs !border-gray-200 !text-gray-700 hover:!border-gray-300 hover:!text-gray-900 hover:!bg-gray-50 group-hover:!border-gray-300 group-hover:!text-gray-700 group-hover:!bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConnect(integration.id)
                        }}
                      >
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {filteredIntegrations.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-gray-500">No integrations found matching your search.</p>
                </motion.div>
              )}
            </ModalBody>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

export default function IntegrationsPage() {
  const [addIntegrationModalOpen, setAddIntegrationModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = useState<"events" | "integrations">("events")
  
  // Add animation styles and disable default modal animations
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      // Remove existing style if present
      const existingStyle = document.getElementById('integrations-animations')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      const style = document.createElement('style')
      style.id = 'integrations-animations'
      style.textContent = `
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOutSlide {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-8px);
          }
        }
        /* Disable default modal animations for AddIntegrationModal */
        [data-radix-dialog-overlay][data-state="open"],
        [data-radix-dialog-overlay][data-state="closed"] {
          animation: none !important;
        }
        [data-radix-dialog-content][data-state="open"],
        [data-radix-dialog-content][data-state="closed"] {
          animation: none !important;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        const styleToRemove = document.getElementById('integrations-animations')
        if (styleToRemove) {
          styleToRemove.remove()
        }
      }
    }
  }, [])

  const erpIntegrations = ACTIVE_INTEGRATIONS.filter((integration) => integration.category === "ERP")
  const crmIntegrations = ACTIVE_INTEGRATIONS.filter((integration) => integration.category === "CRM")
  
  // Collect all events from all integrations
  const allIntegrationEvents = ACTIVE_INTEGRATIONS.flatMap(integration => 
    (integration.events || []).map(event => ({
      ...event,
      integrationId: integration.id,
      integrationName: integration.name,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Discovery</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Integrations</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1.5 px-3 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setAddIntegrationModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Integration
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          {/* Toolbar with tabs */}
          <div className="bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="flex items-center justify-between h-full gap-4" style={{ height: 'var(--header-h)' }}>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-w-0 h-full flex items-end">
                <div className="flex items-center gap-4 w-full">
                  <TabsList className="relative h-auto w-fit gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                    <TabsTrigger
                      value="events"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      Events & metrics
                    </TabsTrigger>
                    <TabsTrigger
                      value="integrations"
                      className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted h-7 px-2.5 text-xs font-medium data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white whitespace-nowrap flex items-center gap-1.5"
                    >
                      Active integrations
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsContent value="events" className="mt-0 space-y-6">
                {/* Quick Metrics Summary */}
                {allIntegrationEvents.length > 0 && (() => {
                  const eventTypes = allIntegrationEvents.reduce((acc, e) => {
                    acc[e.type] = (acc[e.type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const integrations = allIntegrationEvents.reduce((acc, e) => {
                    const integrationName = e.integrationName || "Unknown"
                    acc[integrationName] = (acc[integrationName] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  const mostUsedIntegration = Object.entries(integrations).sort((a, b) => b[1] - a[1])[0]
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Total Events</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{allIntegrationEvents.length}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Most Used Integration</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">{mostUsedIntegration?.[0] || "—"}</div>
                        <div className="text-xs text-gray-400">{mostUsedIntegration?.[1] || 0} events</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointerClick className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500">Top Event Type</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} occurrences
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Events List */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="bg-gray-50/30 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Events & metrics</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {allIntegrationEvents.length} events recorded
                      </div>
                    </div>
                  </div>
                  <IntegrationEventsList events={allIntegrationEvents} />
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <div className="space-y-8">
                  {/* ERP Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Building2 className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">ERP</h2>
                        <p className="text-xs text-gray-500">{erpIntegrations.length} active integrations</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {erpIntegrations.map((integration) => (
                        <div key={integration.id} className="border border-gray-200 rounded-lg bg-white p-5 space-y-4">
                          {/* Integration Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <IntegrationLogo 
                                domain={integration.domain}
                                name={integration.name}
                              />
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                                <p className="text-xs text-gray-500">{integration.provider}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {integration.isRealTime && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 border border-green-200">
                                  <Activity className="h-3 w-3 text-green-600 animate-pulse" />
                                  <span className="text-xs font-medium text-green-700">Real-time</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span>{integration.lastSync}</span>
                              </div>
                            </div>
                          </div>

                          {/* Data Tables */}
                          <div className="space-y-4">
                            {integration.purchaseOrders && integration.purchaseOrders.length > 0 && (
                              <PurchaseOrdersTable orders={integration.purchaseOrders} />
                            )}
                            {integration.invoices && integration.invoices.length > 0 && (
                              <InvoicesTable invoices={integration.invoices} />
                            )}
                            {integration.events && integration.events.length > 0 && (
                              <EventsTable events={integration.events} />
                            )}
                          </div>

                          <div className="pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                              View all data
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* CRM Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Plug className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">CRM</h2>
                        <p className="text-xs text-gray-500">{crmIntegrations.length} active integrations</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {crmIntegrations.map((integration) => (
                        <div key={integration.id} className="border border-gray-200 rounded-lg bg-white p-5 space-y-4">
                          {/* Integration Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <IntegrationLogo 
                                domain={integration.domain}
                                name={integration.name}
                              />
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                                <p className="text-xs text-gray-500">{integration.provider}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {integration.isRealTime && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 border border-green-200">
                                  <Activity className="h-3 w-3 text-green-600 animate-pulse" />
                                  <span className="text-xs font-medium text-green-700">Real-time</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span>{integration.lastSync}</span>
                              </div>
                            </div>
                          </div>

                          {/* Data Tables */}
                          <div className="space-y-4">
                            {integration.leads && integration.leads.length > 0 && (
                              <LeadsTable leads={integration.leads} />
                            )}
                            {integration.deals && integration.deals.length > 0 && (
                              <DealsTable deals={integration.deals} />
                            )}
                            {integration.events && integration.events.length > 0 && (
                              <EventsTable events={integration.events} />
                            )}
                          </div>

                          <div className="pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 hover:bg-gray-100 hover:text-gray-900">
                              View all data
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ResizablePageSheet>
      
      <AddIntegrationModal 
        open={addIntegrationModalOpen} 
        onOpenChange={setAddIntegrationModalOpen} 
      />
    </ResizableAppShell>
  )
}
