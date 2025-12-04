"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layers,
  ArrowRight,
  Briefcase,
  FolderKanban,
  Plus,
  X,
  Target,
  ChevronRight,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useOnboarding } from "../context/onboarding-context"

interface OnboardingWorkspaceProps {
  onNext: () => void
  onSkip: () => void
}

type SubStep = "explanation" | "project-intro" | "projects"

// Platform Preview Component - Shows how it looks in real app
function PlatformPreview({ 
  activeEntity, 
  onChangeEntity 
}: { 
  activeEntity: "bu" | "project" | "initiative"
  onChangeEntity: (entity: "bu" | "project" | "initiative") => void
}) {
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Simulated Sidebar + Content */}
      <div className="flex h-[380px]">
        {/* Mini Sidebar */}
        <div className="w-12 bg-gray-50 border-r border-gray-100 py-3 flex flex-col items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <div className="w-full h-px bg-gray-200 my-1" />
          <button 
            onClick={() => onChangeEntity("bu")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              activeEntity === "bu" ? "bg-white shadow-sm border border-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeEntity === "bu" ? "text-gray-900" : "text-gray-400"}`} />
          </button>
          <button 
            onClick={() => onChangeEntity("project")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              activeEntity === "project" ? "bg-white shadow-sm border border-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <FolderKanban className={`w-4 h-4 ${activeEntity === "project" ? "text-gray-900" : "text-gray-400"}`} />
          </button>
          <button 
            onClick={() => onChangeEntity("initiative")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              activeEntity === "initiative" ? "bg-white shadow-sm border border-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <Target className={`w-4 h-4 ${activeEntity === "initiative" ? "text-gray-900" : "text-gray-400"}`} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Business Units View */}
            {activeEntity === "bu" && (
              <motion.div
                key="bu"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Business Units</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">4 units</Badge>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { name: "Finance", manager: "Sarah Chen", projects: 3, color: "bg-gray-100" },
                    { name: "Operations", manager: "Mike Johnson", projects: 5, color: "bg-gray-50" },
                    { name: "Technology", manager: "Ana García", projects: 8, color: "bg-gray-50" },
                    { name: "Human Resources", manager: "Tom Wilson", projects: 2, color: "bg-gray-50" },
                  ].map((bu, i) => (
                    <motion.div
                      key={bu.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-3 rounded-xl border border-gray-100 ${bu.color} cursor-pointer hover:border-gray-200 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{bu.name}</p>
                            <p className="text-[10px] text-gray-500">{bu.manager}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{bu.projects} projects</span>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Projects View */}
            {activeEntity === "project" && (
              <motion.div
                key="project"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Projects</span>
                    <span className="text-xs text-gray-400">/ Finance</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">3 projects</Badge>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { name: "Invoice Automation", status: "Active", progress: 65, initiatives: 12 },
                    { name: "Budget Planning Tool", status: "Planned", progress: 0, initiatives: 4 },
                    { name: "Expense Tracking", status: "Active", progress: 85, initiatives: 8 },
                  ].map((project, i) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                            <p className="text-[10px] text-gray-500">{project.initiatives} initiatives</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${
                          project.status === "Active" ? "bg-gray-100 text-gray-700" : "text-gray-500"
                        }`}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.progress > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-400 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">{project.progress}%</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Initiatives View */}
            {activeEntity === "initiative" && (
              <motion.div
                key="initiative"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900 text-sm">Initiatives</span>
                    <span className="text-xs text-gray-400">/ Invoice Automation</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">12 items</Badge>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    { title: "Implement OCR for invoice scanning", status: "done", assignee: "JD" },
                    { title: "Connect to SAP for auto-posting", status: "in_progress", assignee: "SC" },
                    { title: "Create approval workflow", status: "in_progress", assignee: "MJ" },
                    { title: "Build dashboard for tracking", status: "todo", assignee: "AG" },
                    { title: "Set up email notifications", status: "todo", assignee: "TW" },
                    { title: "Test with Finance team", status: "todo", assignee: "SC" },
                  ].map((initiative, i) => (
                    <motion.div
                      key={initiative.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
                    >
                      {initiative.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      ) : initiative.status === "in_progress" ? (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={`flex-1 text-sm ${
                        initiative.status === "done" ? "text-gray-400 line-through" : "text-gray-700"
                      }`}>
                        {initiative.title}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-[9px] font-medium text-gray-600">{initiative.assignee}</span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Entity Selector - Clean horizontal tabs
function EntityTabs({ active, onChange }: { active: "bu" | "project" | "initiative", onChange: (v: "bu" | "project" | "initiative") => void }) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      {[
        { id: "bu", label: "Business Units", icon: Briefcase },
        { id: "project", label: "Projects", icon: FolderKanban },
        { id: "initiative", label: "Initiatives", icon: Target },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as any)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Entity Description Cards
function EntityDescription({ type }: { type: "bu" | "project" | "initiative" }) {
  const content = {
    bu: {
      title: "Business Units",
      description: "Departments or areas of your organization. Each BU has a manager responsible for their team.",
      features: [
        { icon: Users, text: "Has a dedicated manager" },
        { icon: FolderKanban, text: "Contains multiple projects" },
        { icon: TrendingUp, text: "Tracks department metrics" },
      ]
    },
    project: {
      title: "Projects",
      description: "Strategic initiatives within a BU. Projects have goals, timelines, and ROI targets.",
      features: [
        { icon: Target, text: "Specific goals & outcomes" },
        { icon: Clock, text: "Timeline & milestones" },
        { icon: TrendingUp, text: "ROI & progress tracking" },
      ]
    },
    initiative: {
      title: "Initiatives",
      description: "Individual work items that arrive through Triage. When accepted, assigned to a Project.",
      features: [
        { icon: Target, text: "Automation opportunities" },
        { icon: Users, text: "Assigned to team members" },
        { icon: CheckCircle2, text: "Status tracking" },
      ]
    }
  }
  
  const c = content[type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
    >
      <h4 className="font-semibold text-gray-900 mb-1">{c.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{c.description}</p>
      <div className="flex flex-wrap gap-3">
        {c.features.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
            <f.icon className="w-3.5 h-3.5" />
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function OnboardingWorkspace({ onNext, onSkip }: OnboardingWorkspaceProps) {
  const { state, addProject, removeProject, getProjectsByBU } = useOnboarding()
  
  const [subStep, setSubStep] = useState<SubStep>("explanation")
  const [selectedEntity, setSelectedEntity] = useState<"bu" | "project" | "initiative">("bu")
  const [selectedBU, setSelectedBU] = useState<string>(state.businessUnits[0]?.id || "")
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")

  const handleAddProject = () => {
    if (newProjectName.trim() && selectedBU) {
      addProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        businessUnitId: selectedBU,
      })
      setNewProjectName("")
      setNewProjectDesc("")
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-3 px-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gray-100">
            <Layers className="w-4 h-4 text-gray-600" />
          </div>
        </div>
        <h1 className="text-2xl font-light text-gray-900">
          Your <span className="font-semibold">Workspace</span>
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          {subStep === "explanation" 
            ? "Explore how work is organized in Sapira"
            : "Create strategic projects within your Business Units"
          }
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Explanation Step */}
            {subStep === "explanation" && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Entity Tabs */}
                <EntityTabs active={selectedEntity} onChange={setSelectedEntity} />
                
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left - Platform Preview */}
                  <PlatformPreview 
                    activeEntity={selectedEntity} 
                    onChangeEntity={setSelectedEntity} 
                  />
                  
                  {/* Right - Description + Your BUs */}
                  <div className="space-y-4">
                    <EntityDescription type={selectedEntity} />
                    
                    {/* Your BUs */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">Your Business Units</h4>
                        <Badge variant="outline" className="text-[10px]">{state.businessUnits.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {state.businessUnits.slice(0, 3).map((bu, i) => {
                          const projects = getProjectsByBU(bu.id)
                          return (
                            <motion.div
                              key={bu.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                                  <Briefcase className="w-3 h-3 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{bu.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {projects.length} project{projects.length !== 1 ? 's' : ''}
                              </span>
                            </motion.div>
                          )
                        })}
                        {state.businessUnits.length > 3 && (
                          <p className="text-[10px] text-gray-400 text-center pt-1">
                            +{state.businessUnits.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-3">
                  <Button
                    onClick={() => setSubStep("project-intro")}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 gap-2 h-9"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Project & Initiative Introduction Step */}
            {subStep === "project-intro" && (
              <motion.div
                key="project-intro"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="text-center mb-2">
                  <Badge variant="outline" className="text-xs mb-2">Next step</Badge>
                  <h2 className="text-lg font-semibold text-gray-900">Projects & Initiatives</h2>
                  <p className="text-sm text-gray-500 mt-1">Understanding how work flows in Sapira</p>
                </div>

                {/* Two Column Explanation */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Projects Explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Projects</h3>
                        <p className="text-xs text-gray-500">Strategic containers</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      A <strong>Project</strong> is a strategic effort within a Business Unit. 
                      It groups related work toward a specific goal, like "Invoice Automation" 
                      or "Customer Support Bot".
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Clear goals</p>
                          <p className="text-xs text-gray-500">Define what success looks like</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Timeline & ROI</p>
                          <p className="text-xs text-gray-500">Track progress and value generated</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Team ownership</p>
                          <p className="text-xs text-gray-500">Assign responsible members</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Initiatives Explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Initiatives</h3>
                        <p className="text-xs text-gray-500">Individual work items</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <strong>Initiatives</strong> are the specific tasks or opportunities that arrive 
                      through Triage. When approved, they get assigned to a Project and tracked 
                      until completion.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">From Triage</p>
                          <p className="text-xs text-gray-500">Ideas and opportunities flow in</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Status tracking</p>
                          <p className="text-xs text-gray-500">To do → In progress → Done</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FolderKanban className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Linked to Projects</p>
                          <p className="text-xs text-gray-500">Always part of a bigger effort</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Flow Diagram */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                >
                  <p className="text-xs font-medium text-gray-500 mb-3 text-center">How it all connects</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Business Unit</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200">
                      <FolderKanban className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Projects</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Initiatives</span>
                    </div>
                  </div>
                </motion.div>

                <div className="text-center pt-2">
                  <Button
                    onClick={() => setSubStep("projects")}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 gap-2 h-9"
                  >
                    Create your first Project
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Projects Step */}
            {subStep === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* BU Selector */}
                <div className="flex gap-2 flex-wrap">
                  {state.businessUnits.map((bu) => {
                    const projectCount = getProjectsByBU(bu.id).length
                    return (
                      <button
                        key={bu.id}
                        onClick={() => setSelectedBU(bu.id)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedBU === bu.id
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        {bu.name}
                        {projectCount > 0 && (
                          <Badge variant="outline" className={`text-[10px] h-5 ${selectedBU === bu.id ? "bg-white/20 text-white border-white/30" : ""}`}>
                            {projectCount}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Add Project Form */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <FolderKanban className="w-4 h-4 text-gray-400" />
                    Add project to {state.businessUnits.find(bu => bu.id === selectedBU)?.name}
                  </h3>

                  <div className="space-y-2">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name (e.g., Invoice Automation)"
                      onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                      className="h-9"
                    />
                    <Input
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="h-9"
                    />
                    <Button
                      onClick={handleAddProject}
                      disabled={!newProjectName.trim() || !selectedBU}
                      className="w-full h-9"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Project
                    </Button>
                  </div>
                </div>

                {/* Projects List */}
                {state.businessUnits.map((bu) => {
                  const projects = getProjectsByBU(bu.id)
                  if (projects.length === 0) return null

                  return (
                    <div key={bu.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                          <Briefcase className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{bu.name}</span>
                        <Badge variant="outline" className="text-[10px]">{projects.length}</Badge>
                      </div>

                      <div className="space-y-1.5">
                        {projects.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                                <FolderKanban className="w-3 h-3 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                                {project.description && (
                                  <p className="text-[11px] text-gray-500">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeProject(project.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {state.projects.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No projects yet. Create your first project above!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-3 px-8 border-t border-gray-100 bg-white"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {subStep === "project-intro" && (
              <Button variant="ghost" onClick={() => setSubStep("explanation")} className="text-gray-500 h-9">
                Back
              </Button>
            )}
            {subStep === "projects" && (
              <Button variant="ghost" onClick={() => setSubStep("project-intro")} className="text-gray-500 h-9">
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onSkip} className="text-gray-500 h-9">
              Skip for now
            </Button>
            {subStep === "projects" && (
              <Button
                onClick={onNext}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 gap-2 h-9"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
