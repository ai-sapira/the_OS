"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Users,
  Briefcase,
  UserCircle,
  FolderOpen,
  Crown,
  Sparkles,
  ArrowRight,
  Check,
  Database,
  Chrome,
  CheckCircle2,
  Star,
  Rocket,
  Plus,
  Trash2,
  User,
  X,
  GripVertical,
  ChevronDown,
  Target,
  MoreHorizontal,
  UserPlus,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboarding, InvitedPerson, BusinessUnit, Project } from "../context/onboarding-context"

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
      {/* Animated particles */}
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
      
      {/* Main content - Logos side by side */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center gap-6"
      >
        {/* Organization Logo */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="relative"
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
        
        {/* Connection line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="h-0.5 bg-gradient-to-r from-white/20 via-white/50 to-white/20"
        />
        
        {/* Sapira Logo */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          className="relative"
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
      
      {/* Text below */}
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
        <motion.p
          className="text-white/50 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Let's build something amazing
        </motion.p>
      </motion.div>
      
      {/* Fade out trigger */}
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

// Quick Add Modal - Clean design
function QuickAddModal({
  isOpen,
  onClose,
  type,
  buId,
  onAddManager
}: {
  isOpen: boolean
  onClose: () => void
  type: "person" | "bu" | "project" | "executive" | "manager"
  buId?: string
  onAddManager?: (personId: string) => void
}) {
  const { state, addInvitedPerson, addBusinessUnit, addProject, assignManagerToBU } = useOnboarding()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedManager, setSelectedManager] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const availableManagers = state.invitedPeople.filter(p => 
    p.role === "head_of_bu" || p.role === "executive"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === "executive" && email) {
      addInvitedPerson({ email, name, role: "executive" })
    } else if (type === "manager" && email && buId) {
      // Add as head_of_bu and assign to the BU
      addInvitedPerson({ email, name, role: "head_of_bu", businessUnitId: buId })
    } else if (type === "person" && email) {
      addInvitedPerson({ email, name, role: "employee", businessUnitId: buId })
    } else if (type === "bu" && name) {
      addBusinessUnit(name)
    } else if (type === "project" && name && buId) {
      addProject({ name, businessUnitId: buId })
    }
    
    setName("")
    setEmail("")
    setSelectedManager("")
    onClose()
  }

  if (!isOpen) return null

  const titles: Record<string, string> = {
    person: "Add Team Member",
    bu: "Add Business Unit",
    project: "Add Project",
    executive: "Add Executive",
    manager: "Add Manager"
  }

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
          <h3 className="font-semibold text-gray-900 text-lg">{titles[type]}</h3>
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
                  autoFocus
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
                autoFocus
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

// Assignment Dropdown for unassigned employees
function AssignmentDropdown({
  person,
  onClose
}: {
  person: InvitedPerson
  onClose: () => void
}) {
  const { state, updateInvitedPerson } = useOnboarding()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] z-50"
    >
      <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
        Assign to BU
      </div>
      {state.businessUnits.map(bu => (
        <button
          key={bu.id}
          onClick={() => {
            updateInvitedPerson(person.id, { businessUnitId: bu.id })
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
          {bu.name}
        </button>
      ))}
      {state.businessUnits.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">No BUs available</div>
      )}
    </motion.div>
  )
}

// Organization Node Card - Clean monochrome design
function OrgNodeCard({
  type,
  data,
  onDelete,
  onAddChild,
  onAssignManager,
  childCount,
  isDropTarget,
  manager
}: {
  type: "org" | "executive" | "bu" | "employee"
  data: { id?: string; name: string; email?: string }
  onDelete?: () => void
  onAddChild?: () => void
  onAssignManager?: () => void
  childCount?: number
  isDropTarget?: boolean
  manager?: InvitedPerson | null
}) {
  const [showActions, setShowActions] = useState(false)
  
  const getStyles = () => {
    switch (type) {
      case "org":
        return { bg: "bg-gray-900", text: "text-white", border: "border-gray-800" }
      case "executive":
        return { bg: "bg-gray-800", text: "text-white", border: "border-gray-700" }
      case "bu":
        return { bg: "bg-white", text: "text-gray-900", border: "border-gray-300" }
      case "employee":
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    }
  }
  
  const styles = getStyles()
  const initials = data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`
          relative rounded-xl border-2 ${styles.border} ${styles.bg} ${styles.text}
          shadow-sm hover:shadow-md transition-all duration-200
          ${isDropTarget ? 'ring-2 ring-gray-400 ring-offset-2' : ''}
          ${type === "org" ? 'px-6 py-4' : type === "bu" ? 'px-5 py-4' : 'px-4 py-3'}
        `}
        style={{ minWidth: type === "org" ? 200 : type === "bu" ? 180 : 150 }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar/Icon */}
          <div className={`
            flex items-center justify-center rounded-lg flex-shrink-0
            ${type === "org" ? 'w-12 h-12 bg-white/10' : 
              type === "executive" ? 'w-10 h-10 bg-white/10' :
              type === "bu" ? 'w-10 h-10 bg-gray-100' : 'w-8 h-8 bg-gray-200'}
          `}>
            {type === "org" ? (
              <Building2 className="w-6 h-6" />
            ) : type === "bu" ? (
              <Briefcase className="w-5 h-5 text-gray-600" />
            ) : (
              <span className={`font-semibold ${type === "executive" ? 'text-sm' : 'text-xs'}`}>
                {initials}
              </span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${type === "org" ? 'text-base' : 'text-sm'}`}>
              {data.name}
            </p>
            {data.email && (
              <p className={`text-[11px] truncate ${type === "executive" ? 'text-gray-300' : 'text-gray-500'}`}>
                {data.email}
              </p>
            )}
            {type === "bu" && manager && (
              <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {manager.name || manager.email}
              </p>
            )}
            {type === "bu" && !manager && onAssignManager && (
              <button 
                onClick={onAssignManager}
                className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-0.5"
              >
                <UserPlus className="w-3 h-3" />
                Add manager
              </button>
            )}
          </div>
          
          {/* Count badge */}
          {childCount !== undefined && childCount > 0 && (
            <div className={`
              px-2 py-0.5 rounded-full text-[11px] font-semibold
              ${type === "org" ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
            `}>
              {childCount}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <AnimatePresence>
          {showActions && (onDelete || onAddChild) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-2 -right-2 flex gap-1"
            >
              {onAddChild && (
                <button
                  onClick={onAddChild}
                  className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Main Interactive Org Chart - Full Canvas
function FullOrgChart() {
  const { 
    state, 
    getPersonById, 
    getProjectsByBU, 
    removeBusinessUnit, 
    removeInvitedPerson, 
    removeProject,
    updateInvitedPerson,
    assignManagerToBU
  } = useOnboarding()
  
  const [addModal, setAddModal] = useState<{ 
    type: "person" | "bu" | "project" | "executive" | "manager"
    buId?: string 
  } | null>(null)
  const [assigningPerson, setAssigningPerson] = useState<string | null>(null)
  
  const executives = state.invitedPeople.filter(p => p.role === "executive")
  const unassigned = state.invitedPeople.filter(p => p.role === "employee" && !p.businessUnitId)
  
  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50/50">
        <div className="min-h-full p-8">
          <div className="flex flex-col items-center min-w-max">
            
            {/* Level 1: Organization */}
            <OrgNodeCard
              type="org"
              data={{ name: state.organization.name || "Your Organization" }}
              childCount={state.businessUnits.length + executives.length}
            />
            
            {/* Connector to Level 2 */}
            {(executives.length > 0 || state.businessUnits.length > 0) && (
              <div className="w-px h-8 bg-gray-300" />
            )}
            
            {/* Level 2: Executives */}
            {executives.length > 0 && (
              <>
                <div className="relative pb-8">
                  {/* Horizontal line */}
                  {executives.length > 1 && (
                    <div 
                      className="absolute top-0 h-px bg-gray-300"
                      style={{ 
                        left: '50%',
                        width: `${(executives.length - 1) * 180}px`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  )}
                  
                  <div className="flex items-start gap-6">
                    {executives.map((exec, i) => (
                      <div key={exec.id} className="flex flex-col items-center">
                        <div className="w-px h-6 bg-gray-300" />
                        <OrgNodeCard
                          type="executive"
                          data={{ id: exec.id, name: exec.name || exec.email, email: exec.email }}
                          onDelete={() => removeInvitedPerson(exec.id)}
                        />
                      </div>
                    ))}
                    
                    {/* Add Executive button */}
                    <div className="flex flex-col items-center">
                      <div className="w-px h-6 bg-gray-200 opacity-0" />
                      <button
                        onClick={() => setAddModal({ type: "executive" })}
                        className="w-[150px] h-[60px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Crown className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Add Executive</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Connector to BUs */}
                {state.businessUnits.length > 0 && (
                  <div className="w-px h-6 bg-gray-300" />
                )}
              </>
            )}
            
            {/* No executives - show add button inline */}
            {executives.length === 0 && state.businessUnits.length > 0 && (
              <>
                <div className="flex items-center gap-4 py-4">
                  <button
                    onClick={() => setAddModal({ type: "executive" })}
                    className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 flex items-center gap-2 text-gray-400 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-500 transition-all text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    Add Executive
                  </button>
                </div>
                <div className="w-px h-4 bg-gray-300" />
              </>
            )}
            
            {/* Level 3: Business Units */}
            {state.businessUnits.length > 0 && (
              <div className="relative">
                {/* Horizontal line */}
                {state.businessUnits.length > 1 && (
                  <div 
                    className="absolute top-0 h-px bg-gray-300"
                    style={{ 
                      left: '50%',
                      width: `${(state.businessUnits.length) * 220}px`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
                
                <div className="flex items-start gap-8">
                  {state.businessUnits.map((bu) => {
                    const manager = bu.managerId ? getPersonById(bu.managerId) : null
                    const buEmployees = state.invitedPeople.filter(
                      p => p.role === "employee" && p.businessUnitId === bu.id
                    )
                    const projects = getProjectsByBU(bu.id)
                    
                    return (
                      <div key={bu.id} className="flex flex-col items-center">
                        <div className="w-px h-6 bg-gray-300" />
                        
                        <OrgNodeCard
                          type="bu"
                          data={{ id: bu.id, name: bu.name }}
                          onDelete={() => removeBusinessUnit(bu.id)}
                          onAddChild={() => setAddModal({ type: "person", buId: bu.id })}
                          onAssignManager={() => setAddModal({ type: "manager", buId: bu.id })}
                          childCount={buEmployees.length}
                          manager={manager}
                        />
                        
                        {/* Projects */}
                        {projects.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap justify-center max-w-[200px]">
                            {projects.map(p => (
                              <Badge 
                                key={p.id} 
                                variant="outline" 
                                className="text-[10px] px-2 py-0.5 bg-white text-gray-600 border-gray-200 cursor-pointer hover:bg-gray-50 group"
                              >
                                <Target className="w-2.5 h-2.5 mr-1 text-gray-400" />
                                {p.name}
                                <button 
                                  onClick={() => removeProject(p.id)}
                                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2.5 h-2.5 text-gray-400 hover:text-gray-600" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => setAddModal({ type: "project", buId: bu.id })}
                          className="mt-1 text-[10px] px-2 py-0.5 text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Project
                        </button>
                        
                        {/* Employees */}
                        {buEmployees.length > 0 && (
                          <>
                            <div className="w-px h-5 bg-gray-200 mt-2" />
                            
                            <div className="relative">
                              {buEmployees.length > 1 && (
                                <div 
                                  className="absolute top-0 h-px bg-gray-200"
                                  style={{ 
                                    left: '50%',
                                    width: `${(buEmployees.length - 1) * 160}px`,
                                    transform: 'translateX(-50%)'
                                  }}
                                />
                              )}
                              
                              <div className="flex items-start gap-3">
                                {buEmployees.map(emp => (
                                  <div key={emp.id} className="flex flex-col items-center">
                                    <div className="w-px h-4 bg-gray-200" />
                                    <OrgNodeCard
                                      type="employee"
                                      data={{ id: emp.id, name: emp.name || emp.email, email: emp.email }}
                                      onDelete={() => removeInvitedPerson(emp.id)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Add employee button */}
                        <button
                          onClick={() => setAddModal({ type: "person", buId: bu.id })}
                          className="mt-3 w-[150px] h-[44px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-500 transition-all text-xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add member
                        </button>
                      </div>
                    )
                  })}
                  
                  {/* Add BU button */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-6 bg-gray-200 opacity-0" />
                    <button
                      onClick={() => setAddModal({ type: "bu" })}
                      className="w-[180px] h-[80px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-500 transition-all"
                    >
                      <Briefcase className="w-6 h-6 mb-1" />
                      <span className="text-sm font-medium">Add Business Unit</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty state - no BUs yet */}
            {state.businessUnits.length === 0 && executives.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500">Start building your organization structure</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAddModal({ type: "executive" })}
                    className="px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 flex items-center gap-2 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  >
                    <Crown className="w-5 h-5" />
                    <span className="font-medium">Add Executive</span>
                  </button>
                  <button
                    onClick={() => setAddModal({ type: "bu" })}
                    className="px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 flex items-center gap-2 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Add Business Unit</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Unassigned employees */}
            {unassigned.length > 0 && (
              <div className="mt-12 w-full max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2">
                    Unassigned ({unassigned.length})
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                  {unassigned.map(person => (
                    <div key={person.id} className="relative">
                      <div
                        className={`
                          flex items-center gap-3 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 
                          hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group
                          ${assigningPerson === person.id ? 'ring-2 ring-gray-400' : ''}
                        `}
                        onClick={() => setAssigningPerson(assigningPerson === person.id ? null : person.id)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            {(person.name || person.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {person.name || person.email}
                          </p>
                          {person.name && (
                            <p className="text-[11px] text-gray-500 truncate">{person.email}</p>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${assigningPerson === person.id ? 'rotate-180' : ''}`} />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeInvitedPerson(person.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      
                      {/* Assignment dropdown */}
                      <AnimatePresence>
                        {assigningPerson === person.id && (
                          <AssignmentDropdown 
                            person={person} 
                            onClose={() => setAssigningPerson(null)} 
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Modal */}
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
    { label: "Team Members", value: state.invitedPeople.length, icon: Users, detail: `${executives.length} executives, ${managers.length} managers, ${employees.length} employees` },
    { label: "Business Units", value: state.businessUnits.length, icon: Briefcase, detail: state.businessUnits.map(b => b.name).join(", ") || "None added" },
    { label: "Projects", value: state.projects.length, icon: Target, detail: state.projects.map(p => p.name).join(", ") || "None added" },
    { label: "Integration Lead", value: integrationLead ? "✓" : "—", icon: Database, detail: integrationLead ? (integrationLead.name || integrationLead.email) : "Not assigned" },
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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to org chart
        </button>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs px-3 py-1.5 bg-white border-gray-200">
            Setup {Math.round(progressPercent)}% complete
          </Badge>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
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
          
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                <p className="text-[10px] text-gray-400 mt-2 line-clamp-1">{stat.detail}</p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Two columns: Setup Status + Sapira Partner */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Setup Status */}
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
                    {item.done && (
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Sapira Partner */}
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
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">Forward Deploy Engineer</p>
                  <p className="text-sm text-gray-400">Ready to help you succeed</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your dedicated FDE will guide you through the platform, help you identify automation opportunities, and ensure you get the most out of Sapira.
              </p>
            </motion.div>
          </div>
          
          {/* Organization Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Organization Overview</h3>
              <button 
                onClick={onBack}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                Edit structure
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-start gap-6">
              {/* Org info */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{state.organization.name || "Your Organization"}</p>
                  <p className="text-sm text-gray-500">{state.businessUnits.length} business units</p>
                </div>
              </div>
              
              {/* BU list */}
              <div className="flex-1 flex flex-wrap gap-2">
                {state.businessUnits.map(bu => {
                  const buEmployees = state.invitedPeople.filter(p => p.businessUnitId === bu.id)
                  return (
                    <div 
                      key={bu.id}
                      className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{bu.name}</span>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white">
                        {buEmployees.length}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer CTA */}
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
              className="h-full flex flex-col"
            >
              {/* Minimal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {state.organization.name || "Your Organization"}
                    </h1>
                    <p className="text-xs text-gray-500">Organization Structure</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Stats badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 border-gray-200">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      {state.invitedPeople.length} people
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 border-gray-200">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      {state.businessUnits.length} BUs
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 border-gray-200">
                      <Target className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      {state.projects.length} projects
                    </Badge>
                  </div>
                  
                  <div className="w-px h-8 bg-gray-200" />
                  
                  <Button
                    onClick={() => setShowSummary(true)}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 gap-2 h-10"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Full Org Chart Canvas */}
              <FullOrgChart />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
