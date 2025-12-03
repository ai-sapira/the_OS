"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Plus,
  X,
  Users,
  Briefcase,
  UserCircle,
  Mail,
  ArrowRight,
  Check,
  Upload,
  Crown,
  ChevronRight,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useOnboarding, InvitedPerson } from "../context/onboarding-context"

interface OnboardingCreateOrgProps {
  onNext: () => void
  onSkip: () => void
}

type SubStep = "organization" | "business-units" | "invite-team"

// Suggested BU names
const SUGGESTED_BUS = ["Finance", "Operations", "Human Resources", "Technology", "Sales", "Marketing", "Legal"]

// Role config
const ROLE_CONFIG = {
  executive: {
    label: "Executive",
    description: "Strategic leaders and change champions",
    icon: Crown,
    color: "purple",
  },
  head_of_bu: {
    label: "Head of BU",
    description: "Department managers",
    icon: Briefcase,
    color: "blue",
  },
  employee: {
    label: "Employee",
    description: "Team members",
    icon: UserCircle,
    color: "gray",
  },
}

export function OnboardingCreateOrg({ onNext, onSkip }: OnboardingCreateOrgProps) {
  const { 
    state, 
    setOrganizationName, 
    addBusinessUnit, 
    removeBusinessUnit,
    addInvitedPerson,
    removeInvitedPerson,
    assignManagerToBU,
    updateInvitedPerson
  } = useOnboarding()
  
  const [subStep, setSubStep] = useState<SubStep>("organization")
  const [newBUName, setNewBUName] = useState("")
  const [newPersonEmail, setNewPersonEmail] = useState("")
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonRole, setNewPersonRole] = useState<InvitedPerson["role"]>("employee")
  const [selectedBUForPerson, setSelectedBUForPerson] = useState<string>("")

  const canProceedFromOrg = state.organization.name.trim().length > 0
  const canProceedFromBUs = state.businessUnits.length > 0
  const canFinish = state.invitedPeople.length > 0 || true // Allow skipping invites

  const handleAddBU = () => {
    if (newBUName.trim()) {
      addBusinessUnit(newBUName.trim())
      setNewBUName("")
    }
  }

  const handleAddPerson = () => {
    if (newPersonEmail.trim() && newPersonEmail.includes("@")) {
      addInvitedPerson({
        email: newPersonEmail.trim(),
        name: newPersonName.trim() || undefined,
        role: newPersonRole,
        businessUnitId: newPersonRole === "head_of_bu" || newPersonRole === "employee" 
          ? selectedBUForPerson || undefined 
          : undefined,
      })
      
      // If adding head_of_bu and selected a BU, assign as manager
      if (newPersonRole === "head_of_bu" && selectedBUForPerson) {
        const newPerson = state.invitedPeople[state.invitedPeople.length - 1]
        if (newPerson) {
          assignManagerToBU(selectedBUForPerson, newPerson.id)
        }
      }
      
      setNewPersonEmail("")
      setNewPersonName("")
      setSelectedBUForPerson("")
    }
  }

  const handleNextSubStep = () => {
    if (subStep === "organization" && canProceedFromOrg) {
      setSubStep("business-units")
    } else if (subStep === "business-units" && canProceedFromBUs) {
      setSubStep("invite-team")
    } else if (subStep === "invite-team") {
      onNext()
    }
  }

  const handleBack = () => {
    if (subStep === "business-units") {
      setSubStep("organization")
    } else if (subStep === "invite-team") {
      setSubStep("business-units")
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4 px-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(["organization", "business-units", "invite-team"] as SubStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    subStep === step
                      ? "bg-gray-900 text-white"
                      : (["organization", "business-units", "invite-team"].indexOf(subStep) > index)
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {(["organization", "business-units", "invite-team"].indexOf(subStep) > index) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </motion.div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 mx-1 ${
                    (["organization", "business-units", "invite-team"].indexOf(subStep) > index)
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step title */}
          <div className="text-center">
            <h1 className="text-3xl font-light text-gray-900">
              {subStep === "organization" && (
                <>Set up your <span className="font-semibold">organization</span></>
              )}
              {subStep === "business-units" && (
                <>Create <span className="font-semibold">Business Units</span></>
              )}
              {subStep === "invite-team" && (
                <>Invite your <span className="font-semibold">team</span></>
              )}
            </h1>
            <p className="mt-2 text-gray-500">
              {subStep === "organization" && "Start by naming your organization"}
              {subStep === "business-units" && "Define the departments in your organization"}
              {subStep === "invite-team" && "Invite executives, managers, and employees"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Organization Name */}
            {subStep === "organization" && (
              <motion.div
                key="organization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gray-100">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Organization Name</h3>
                      <p className="text-sm text-gray-500">This will be visible to all team members</p>
                    </div>
                  </div>
                  
                  <Input
                    value={state.organization.name}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter your organization name"
                    className="text-lg h-12"
                    autoFocus
                  />

                  {/* Logo upload (optional) */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload logo (optional)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Business Units */}
            {subStep === "business-units" && (
              <motion.div
                key="business-units"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Add new BU */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex gap-2">
                    <Input
                      value={newBUName}
                      onChange={(e) => setNewBUName(e.target.value)}
                      placeholder="Enter Business Unit name"
                      onKeyDown={(e) => e.key === "Enter" && handleAddBU()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddBU} disabled={!newBUName.trim()}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTED_BUS.filter(bu => 
                      !state.businessUnits.some(existing => existing.name.toLowerCase() === bu.toLowerCase())
                    ).map((bu) => (
                      <button
                        key={bu}
                        onClick={() => addBusinessUnit(bu)}
                        className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        + {bu}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BU List */}
                <div className="space-y-2">
                  {state.businessUnits.map((bu, index) => (
                    <motion.div
                      key={bu.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between group hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bu.name}</p>
                          {bu.managerEmail ? (
                            <p className="text-xs text-gray-500">Manager: {bu.managerName || bu.managerEmail}</p>
                          ) : (
                            <p className="text-xs text-gray-400">No manager assigned</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeBusinessUnit(bu.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {state.businessUnits.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Add at least one Business Unit to continue</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Invite Team */}
            {subStep === "invite-team" && (
              <motion.div
                key="invite-team"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Add new person */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={newPersonEmail}
                      onChange={(e) => setNewPersonEmail(e.target.value)}
                      placeholder="Email address"
                      type="email"
                    />
                    <Input
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="Name (optional)"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Role selector */}
                    <div className="flex-1 flex gap-1 p-1 bg-gray-100 rounded-lg">
                      {(Object.entries(ROLE_CONFIG) as [InvitedPerson["role"], typeof ROLE_CONFIG.executive][]).map(([role, config]) => (
                        <button
                          key={role}
                          onClick={() => setNewPersonRole(role)}
                          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                            newPersonRole === role
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BU selector for managers and employees */}
                  {(newPersonRole === "head_of_bu" || newPersonRole === "employee") && (
                    <div className="flex gap-2 flex-wrap">
                      {state.businessUnits.map((bu) => (
                        <button
                          key={bu.id}
                          onClick={() => setSelectedBUForPerson(selectedBUForPerson === bu.id ? "" : bu.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedBUForPerson === bu.id
                              ? "bg-gray-900 text-white border-2 border-gray-900"
                              : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                          }`}
                        >
                          {bu.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={handleAddPerson} 
                    disabled={!newPersonEmail.trim() || !newPersonEmail.includes("@")}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Team Member
                  </Button>
                </div>

                {/* Invited people by role */}
                {(["executive", "head_of_bu", "employee"] as const).map((role) => {
                  const people = state.invitedPeople.filter(p => p.role === role)
                  if (people.length === 0) return null
                  
                  const config = ROLE_CONFIG[role]
                  
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-sm font-medium text-gray-700">{config.label}s</span>
                        <Badge variant="outline" className="text-xs">{people.length}</Badge>
                      </div>
                      
                      {people.map((person, index) => {
                        const bu = person.businessUnitId 
                          ? state.businessUnits.find(b => b.id === person.businessUnitId)
                          : null
                        
                        return (
                          <motion.div
                            key={person.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between group hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-${config.color}-100 flex items-center justify-center`}>
                                <span className="text-xs font-medium text-gray-600">
                                  {(person.name || person.email)[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {person.name || person.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {person.email}
                                  {bu && <span className="text-gray-400"> · {bu.name}</span>}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeInvitedPerson(person.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                })}

                {state.invitedPeople.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Invite team members or skip for now</p>
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
        className="py-4 px-8 border-t border-gray-100 bg-white"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {subStep !== "organization" && (
              <Button variant="ghost" onClick={handleBack} className="text-gray-500">
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onSkip} className="text-gray-500">
              Skip for now
            </Button>
            <Button
              onClick={handleNextSubStep}
              disabled={
                (subStep === "organization" && !canProceedFromOrg) ||
                (subStep === "business-units" && !canProceedFromBUs)
              }
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 gap-2"
            >
              {subStep === "invite-team" ? "Continue" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

