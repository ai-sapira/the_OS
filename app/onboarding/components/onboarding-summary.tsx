"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with document
const Tree = dynamic(
  () => import("react-organizational-chart").then(mod => mod.Tree),
  { ssr: false }
)
const TreeNode = dynamic(
  () => import("react-organizational-chart").then(mod => mod.TreeNode),
  { ssr: false }
)
import {
  Building2,
  Users,
  Briefcase,
  FolderOpen,
  Sparkles,
  ArrowRight,
  Check,
  Database,
  Chrome,
  CheckCircle2,
  Star,
  Rocket,
  Plus,
  User,
  X,
  Target,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboarding, InvitedPerson } from "../context/onboarding-context"

interface OnboardingSummaryProps {
  onComplete: () => void
}

// Launch transition overlay
function LaunchTransition({ 
  onAnimationComplete,
  orgName,
  orgLogo
}: { 
  onAnimationComplete: () => void
  orgName: string
  orgLogo?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)" }}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          animate={{ 
            scale: [0, 1.5, 2],
            opacity: [0, 0.3, 0],
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
          }}
          transition={{ duration: 1.5, delay: 0.3 + i * 0.05, ease: "easeOut" }}
          style={{ width: 20 + Math.random() * 40, height: 20 + Math.random() * 40 }}
        />
      ))}
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center gap-6"
      >
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        >
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl overflow-hidden">
            {orgLogo ? (
              <img src={orgLogo} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {orgName ? orgName.substring(0, 2).toUpperCase() : "ORG"}
              </span>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="h-0.5 bg-gradient-to-r from-white/20 via-white/50 to-white/20"
        />
        
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-white/20 flex items-center justify-center shadow-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.p 
          className="text-white text-xl font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="font-semibold">{orgName || "Your Organization"}</span>
          <span className="text-white/50 mx-3">×</span>
          <span className="font-semibold">Sapira</span>
        </motion.p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        onAnimationComplete={onAnimationComplete}
        className="absolute inset-0"
      />
    </motion.div>
  )
}

// Quick Add Modal
function QuickAddModal({
  isOpen,
  onClose,
  type,
  buId
}: {
  isOpen: boolean
  onClose: () => void
  type: "person" | "bu" | "project" | "executive" | "manager"
  buId?: string
}) {
  const { state, addInvitedPerson, addBusinessUnit, addProject, addManagerToBU } = useOnboarding()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName("")
      setEmail("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === "executive" && email) {
      addInvitedPerson({ email, name, role: "executive" })
    } else if (type === "manager" && email && buId) {
      addManagerToBU(buId, { email, name, role: "head_of_bu", businessUnitId: buId })
    } else if (type === "person" && email) {
      addInvitedPerson({ email, name, role: "employee", businessUnitId: buId })
    } else if (type === "bu" && name) {
      addBusinessUnit(name)
    } else if (type === "project" && name && buId) {
      addProject({ name, businessUnitId: buId })
    }
    
    setName("")
    setEmail("")
    onClose()
  }

  if (!isOpen) return null

  const titles: Record<string, string> = {
    person: "Add Team Member",
    bu: "Add Business Unit",
    project: "Add Project",
    executive: "Add Executive",
    manager: "Assign Manager"
  }

  const buName = buId ? state.businessUnits.find(b => b.id === buId)?.name : ""

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white rounded-xl shadow-2xl p-6 w-[360px] border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{titles[type]}</h3>
            {buName && type === "manager" && (
              <p className="text-sm text-gray-500 mt-0.5">for {buName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === "person" || type === "executive" || type === "manager") ? (
            <>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block font-medium">Name</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block font-medium">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Name *</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={type === "bu" ? "e.g. Finance, HR, Sales" : "e.g. Q4 Automation"}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                required
              />
            </div>
          )}
          
          <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Styled Node Components for the org chart - Professional design
function OrgNode({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="inline-block">
      <div className="bg-gray-900 text-white rounded-2xl px-8 py-5 shadow-2xl shadow-gray-900/20">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-xl tracking-tight">{name}</p>
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Executive Level - Professional horizontal card
function ExecutivesLevel({ 
  executives, 
  onAdd,
  onDelete 
}: { 
  executives: InvitedPerson[]
  onAdd: () => void
  onDelete: (id: string) => void 
}) {
  return (
    <div className="inline-block">
      <div className="bg-white rounded-2xl px-5 py-4 shadow-lg shadow-gray-200/50 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 pr-4 border-r border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Leadership</span>
          </div>
          
          <div className="flex items-center gap-3">
            {executives.map(exec => (
              <div key={exec.id} className="relative group">
                <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-colors cursor-default">
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-200">
                    <span className="text-sm font-semibold text-white">
                      {(exec.name || exec.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {exec.name || exec.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">Executive</p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(exec.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-200"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
            
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-500 hover:text-gray-700"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Executive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BUNode({ 
  bu,
  manager,
  memberCount,
  projects,
  onDelete,
  onAddManager,
  onAddProject,
  onRemoveProject
}: { 
  bu: { id: string; name: string }
  manager: InvitedPerson | null
  memberCount: number
  projects: { id: string; name: string }[]
  onDelete: () => void
  onAddManager: () => void
  onAddProject: () => void
  onRemoveProject: (id: string) => void
}) {
  return (
    <div className="inline-block relative group">
      <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 min-w-[220px] hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-base truncate">{bu.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Manager */}
        {manager ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {(manager.name || manager.email)[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-800 truncate">
                {manager.name || manager.email}
              </p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onAddManager}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-colors mb-3"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Assign Manager</span>
          </button>
        )}
        
        {/* Projects */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {projects.map(p => (
              <span 
                key={p.id}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg group/badge"
              >
                <Target className="w-3 h-3 text-gray-500" />
                {p.name}
                <button 
                  onClick={() => onRemoveProject(p.id)}
                  className="ml-0.5 opacity-0 group-hover/badge:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <button
          onClick={onAddProject}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>
      
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-200"
      >
        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  )
}

function AddBUNode({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white transition-all text-gray-500 hover:text-gray-700 min-w-[220px] h-[140px] px-6"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <Briefcase className="w-6 h-6 text-gray-500" />
      </div>
      <span className="text-sm font-medium">Add Business Unit</span>
    </button>
  )
}

function EmployeeNode({ 
  person, 
  onDelete 
}: { 
  person: InvitedPerson
  onDelete: () => void 
}) {
  return (
    <div className="inline-block relative group">
      <div className="bg-white rounded-xl p-3 shadow-md shadow-gray-100 border border-gray-100 hover:shadow-lg transition-shadow min-w-[160px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {(person.name || person.email)[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-800 truncate">
              {person.name || person.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{person.email}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-200"
      >
        <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  )
}

function AddMemberNode({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white transition-all text-gray-500 hover:text-gray-700 min-w-[160px] h-[60px] px-4"
    >
      <UserPlus className="w-4 h-4" />
      <span className="text-sm font-medium">Add Member</span>
    </button>
  )
}

// Organization Chart using react-organizational-chart
function OrgChart() {
  const { 
    state, 
    getPersonById, 
    getProjectsByBU, 
    removeBusinessUnit, 
    removeInvitedPerson, 
    removeProject 
  } = useOnboarding()
  
  const [addModal, setAddModal] = useState<{ 
    type: "person" | "bu" | "project" | "executive" | "manager"
    buId?: string 
  } | null>(null)
  
  const [zoom, setZoom] = useState(100)
  
  const executives = state.invitedPeople.filter(p => p.role === "executive")
  const totalEmployees = state.invitedPeople.filter(p => p.role === "employee").length
  
  // Auto-calculate zoom based on content
  useEffect(() => {
    const buCount = state.businessUnits.length
    const execCount = executives.length
    const empCount = totalEmployees
    
    // Reduce zoom if there are many elements
    if (buCount >= 4 || empCount >= 8) {
      setZoom(65)
    } else if (buCount >= 3 || empCount >= 5) {
      setZoom(75)
    } else if (buCount >= 2 || execCount >= 3) {
      setZoom(85)
    } else {
      setZoom(100)
    }
  }, [state.businessUnits.length, executives.length, totalEmployees])
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 40))
  const handleZoomReset = () => setZoom(100)
  
  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-100 relative">
        {/* Zoom controls */}
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <span className="text-lg font-medium">−</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="px-3 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 min-w-[50px]"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <span className="text-lg font-medium">+</span>
          </button>
        </div>
        
        <div className="min-h-full p-10 flex justify-center items-start">
          <style jsx global>{`
            .org-tree ul {
              padding-top: 32px;
            }
            .org-tree ul::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              border-left: 2px solid #9ca3af;
              height: 32px;
            }
            .org-tree li {
              position: relative;
              padding: 32px 16px 0 16px;
            }
            .org-tree li::before,
            .org-tree li::after {
              content: '';
              position: absolute;
              top: 0;
              width: 50%;
              height: 32px;
              border-top: 2px solid #9ca3af;
            }
            .org-tree li::before {
              left: 0;
              border-right: 2px solid #9ca3af;
            }
            .org-tree li::after {
              right: 0;
            }
            .org-tree li:only-child {
              padding-top: 0;
            }
            .org-tree li:only-child::before,
            .org-tree li:only-child::after {
              display: none;
            }
            .org-tree li:first-child::before {
              border-left: none;
              border-top-left-radius: 0;
            }
            .org-tree li:last-child::after {
              border-right: none;
              border-top-right-radius: 0;
            }
            .org-tree li:last-child::before {
              border-right: 2px solid #9ca3af;
              border-top-right-radius: 12px;
            }
            .org-tree li:first-child::after {
              border-top-left-radius: 12px;
            }
          `}</style>
          
          <div 
            className="org-tree transition-transform duration-300 ease-out origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <Tree
              lineWidth="2px"
              lineColor="#9ca3af"
              lineBorderRadius="12px"
              label={
                <OrgNode 
                  name={state.organization.name || "Your Organization"} 
                  subtitle={`${state.businessUnits.length} BUs · ${state.invitedPeople.length} people`}
                />
              }
            >
              {/* Executives Level - contains all execs and has BUs as children */}
              <TreeNode
                label={
                  <ExecutivesLevel 
                    executives={executives}
                    onAdd={() => setAddModal({ type: "executive" })}
                    onDelete={(id) => removeInvitedPerson(id)}
                  />
                }
              >
                {/* Business Units as children of executives level */}
                {state.businessUnits.map(bu => {
                  const manager = bu.managerId ? getPersonById(bu.managerId) : null
                  const buEmployees = state.invitedPeople.filter(
                    p => p.role === "employee" && p.businessUnitId === bu.id
                  )
                  const projects = getProjectsByBU(bu.id)
                  
                  return (
                    <TreeNode
                      key={bu.id}
                      label={
                        <BUNode 
                          bu={bu}
                          manager={manager || null}
                          memberCount={buEmployees.length}
                          projects={projects}
                          onDelete={() => removeBusinessUnit(bu.id)}
                          onAddManager={() => setAddModal({ type: "manager", buId: bu.id })}
                          onAddProject={() => setAddModal({ type: "project", buId: bu.id })}
                          onRemoveProject={(id) => removeProject(id)}
                        />
                      }
                    >
                      {/* Employees under this BU */}
                      {buEmployees.map(emp => (
                        <TreeNode
                          key={emp.id}
                          label={
                            <EmployeeNode 
                              person={emp}
                              onDelete={() => removeInvitedPerson(emp.id)}
                            />
                          }
                        />
                      ))}
                      
                      {/* Add Member Button */}
                      <TreeNode
                        label={
                          <AddMemberNode onClick={() => setAddModal({ type: "person", buId: bu.id })} />
                        }
                      />
                    </TreeNode>
                  )
                })}
                
                {/* Add BU Button */}
                <TreeNode
                  label={<AddBUNode onClick={() => setAddModal({ type: "bu" })} />}
                />
              </TreeNode>
            </Tree>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {addModal && (
          <QuickAddModal
            isOpen={true}
            onClose={() => setAddModal(null)}
            type={addModal.type}
            buId={addModal.buId}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Final Summary Screen
function FinalSummaryScreen({ 
  onBack, 
  onLaunch 
}: { 
  onBack: () => void
  onLaunch: () => void 
}) {
  const { state, getPersonById } = useOnboarding()
  
  const executives = state.invitedPeople.filter(p => p.role === "executive")
  const managers = state.invitedPeople.filter(p => p.role === "head_of_bu")
  const employees = state.invitedPeople.filter(p => p.role === "employee")
  const integrationLead = state.integrationResponsibleId ? getPersonById(state.integrationResponsibleId) : null
  
  const stats = [
    { label: "Team Members", value: state.invitedPeople.length, icon: Users, detail: `${executives.length} exec, ${managers.length} mgrs, ${employees.length} emp` },
    { label: "Business Units", value: state.businessUnits.length, icon: Briefcase, detail: state.businessUnits.map(b => b.name).join(", ") || "None" },
    { label: "Projects", value: state.projects.length, icon: Target, detail: state.projects.map(p => p.name).join(", ") || "None" },
    { label: "Integration Lead", value: integrationLead ? "✓" : "—", icon: Database, detail: integrationLead ? (integrationLead.name || integrationLead.email) : "Not set" },
  ]
  
  const setupItems = [
    { label: "Organization", done: !!state.organization.name, icon: Building2 },
    { label: "Business Units", done: state.businessUnits.length > 0, icon: Briefcase },
    { label: "Team Members", done: state.invitedPeople.length > 0, icon: Users },
    { label: "Projects", done: state.projects.length > 0, icon: FolderOpen },
    { label: "Browser Extension", done: state.extensionSettings.installed, icon: Chrome },
    { label: "Integration Lead", done: !!state.integrationResponsibleId, icon: Database },
  ]
  
  const completedItems = setupItems.filter(i => i.done).length
  const progressPercent = (completedItems / setupItems.length) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to org chart
        </button>
        
        <Badge variant="outline" className="text-xs px-3 py-1.5 bg-white border-gray-200">
          Setup {Math.round(progressPercent)}% complete
        </Badge>
      </div>
      
      <div className="flex-1 overflow-auto py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-light text-gray-900">
              You're all <span className="font-semibold">set!</span>
            </h1>
            <p className="mt-2 text-gray-500">
              Here's a summary of your organization setup
            </p>
          </motion.div>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                <p className="text-[10px] text-gray-400 mt-2 truncate">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Setup Status</h3>
              <div className="space-y-3">
                {setupItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      item.done ? "bg-gray-900" : "bg-gray-100"
                    }`}>
                      {item.done ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <item.icon className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? "text-gray-700" : "text-gray-400"}`}>
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Your Sapira Partner</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  A
                </div>
                <div>
                  <p className="font-medium">Adolfo</p>
                  <p className="text-sm text-gray-400">adolfo@sapira.ai</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your dedicated Forward Deploy Engineer will guide you through the platform and help you identify automation opportunities.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-8 py-6 bg-white border-t border-gray-100"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            You can always update your settings later
          </p>
          <Button
            onClick={onLaunch}
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 gap-3 h-12 text-base shadow-lg"
          >
            <Rocket className="w-5 h-5" />
            Start using Sapira
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function OnboardingSummary({ onComplete }: OnboardingSummaryProps) {
  const { state } = useOnboarding()
  const [isLaunching, setIsLaunching] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleLaunch = () => {
    setIsLaunching(true)
  }

  return (
    <>
      <AnimatePresence>
        {isLaunching && (
          <LaunchTransition 
            onAnimationComplete={onComplete}
            orgName={state.organization.name}
            orgLogo={state.organization.logo}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="h-full w-full flex flex-col bg-white"
        animate={isLaunching ? { scale: 0.95, opacity: 0, filter: "blur(10px)" } : {}}
        transition={{ duration: 0.4, ease: "easeIn" }}
      >
        <AnimatePresence mode="wait">
          {showSummary ? (
            <FinalSummaryScreen 
              key="summary"
              onBack={() => setShowSummary(false)}
              onLaunch={handleLaunch}
            />
          ) : (
            <motion.div
              key="orgchart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full flex flex-col bg-gray-100"
            >
              <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/10">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                      {state.organization.name || "Your Organization"}
                    </h1>
                    <p className="text-sm text-gray-500">Organization Structure</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{state.invitedPeople.length}</span>
                      <span className="text-sm text-gray-500">people</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{state.businessUnits.length}</span>
                      <span className="text-sm text-gray-500">BUs</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{state.projects.length}</span>
                      <span className="text-sm text-gray-500">projects</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-200" />
                  
                  <Button
                    onClick={() => setShowSummary(true)}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 gap-2 h-11 text-sm font-medium shadow-lg shadow-gray-900/10"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <OrgChart />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
