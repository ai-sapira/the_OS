"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  Chrome,
  Download,
  Check,
  MousePointerClick,
  Monitor,
  Clock,
  Users,
  FileText,
  Shield,
  Database,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Lightbulb,
  Zap,
  BarChart3,
  Globe,
  X,
  ExternalLink,
  Search,
  Bell,
  Settings,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useOnboarding } from "../context/onboarding-context"

interface OnboardingDiscoveryProps {
  onNext: () => void
  onSkip: () => void
}

type ActiveTab = "extension" | "integrations"

// Tour steps
const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Pharo Discovery",
    description: "Our Chrome extension monitors your daily workflow to automatically identify automation opportunities.",
    highlight: "Discover hidden inefficiencies in real-time",
  },
  {
    id: "popup",
    title: "Extension Popup",
    description: "Access your discovery stats anytime from the browser toolbar. See active tracking and recent insights.",
    highlight: "One-click access to your automation insights",
  },
  {
    id: "tracking",
    title: "Event Tracking",
    description: "Configure what the extension monitors based on your privacy preferences.",
    highlight: "You're in control of your data",
  },
  {
    id: "insights",
    title: "Smart Insights",
    description: "Pharo analyzes patterns and surfaces automation opportunities based on repetitive tasks.",
    highlight: "AI-powered workflow analysis",
  },
  {
    id: "download",
    title: "Get Started",
    description: "Install the extension from Chrome Web Store and start discovering automation opportunities.",
    highlight: "Free to install, powerful to use",
  },
]

// Tracking options
const TRACKING_OPTIONS = [
  { key: "trackClicks", label: "Click Events", desc: "Clicks & interactions", icon: MousePointerClick },
  { key: "trackNavigation", label: "Navigation", desc: "Page switches", icon: Monitor },
  { key: "trackFocusTime", label: "Focus Time", desc: "Time on tasks", icon: Clock },
  { key: "trackMeetings", label: "Meetings", desc: "Transcripts", icon: Users },
  { key: "trackFormInputs", label: "Forms", desc: "Data entry", icon: FileText },
]

// Action types for the simulation
type ActionType = 
  | { type: "move", x: number, y: number }
  | { type: "click" }
  | { type: "tab", tab: "crm" | "gmail" | "calendar" }
  | { type: "scroll", direction: "down" | "up" }
  | { type: "type", text: string }
  | { type: "wait", duration: number }

// Full action sequence - realistic workflow
const ACTION_SEQUENCE: ActionType[] = [
  // Start in CRM, click on first metric
  { type: "move", x: 18, y: 28 },
  { type: "wait", duration: 400 },
  { type: "click" },
  { type: "wait", duration: 600 },
  
  // Click on another metric
  { type: "move", x: 42, y: 28 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 500 },
  
  // Scroll down to see deals
  { type: "move", x: 50, y: 55 },
  { type: "wait", duration: 300 },
  { type: "scroll", direction: "down" },
  { type: "wait", duration: 400 },
  
  // Click on a deal row
  { type: "move", x: 35, y: 58 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 600 },
  
  // Click on another deal
  { type: "move", x: 35, y: 68 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 500 },
  
  // Switch to Gmail tab
  { type: "move", x: 52, y: 3 },
  { type: "wait", duration: 400 },
  { type: "click" },
  { type: "tab", tab: "gmail" },
  { type: "wait", duration: 600 },
  
  // Click on search in Gmail
  { type: "move", x: 50, y: 18 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 300 },
  
  // Type search query
  { type: "type", text: "invoice Q4" },
  { type: "wait", duration: 800 },
  
  // Click on an email
  { type: "move", x: 40, y: 42 },
  { type: "wait", duration: 400 },
  { type: "click" },
  { type: "wait", duration: 600 },
  
  // Click on another email
  { type: "move", x: 40, y: 52 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 500 },
  
  // Switch to Calendar
  { type: "move", x: 62, y: 3 },
  { type: "wait", duration: 400 },
  { type: "click" },
  { type: "tab", tab: "calendar" },
  { type: "wait", duration: 600 },
  
  // Click on a calendar event
  { type: "move", x: 35, y: 45 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 500 },
  
  // Click on another event
  { type: "move", x: 55, y: 55 },
  { type: "wait", duration: 300 },
  { type: "click" },
  { type: "wait", duration: 600 },
  
  // Go back to CRM
  { type: "move", x: 42, y: 3 },
  { type: "wait", duration: 400 },
  { type: "click" },
  { type: "tab", tab: "crm" },
  { type: "wait", duration: 500 },
  
  // Scroll up
  { type: "scroll", direction: "up" },
  { type: "wait", duration: 1000 },
]

// Clean Browser Simulation with real workflow
function BrowserSimulation({ 
  currentStep, 
  extensionSettings,
  onToggleSetting 
}: { 
  currentStep: number
  extensionSettings: Record<string, boolean>
  onToggleSetting: (key: string, value: boolean) => void
}) {
  const [clickCount, setClickCount] = useState(0)
  const [focusTime, setFocusTime] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 })
  const [isClicking, setIsClicking] = useState(false)
  const [activeTab, setActiveTab] = useState<"crm" | "gmail" | "calendar">("crm")
  const [actionIndex, setActionIndex] = useState(0)
  const [searchText, setSearchText] = useState("")
  const [scrollOffset, setScrollOffset] = useState(0)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  
  // Focus timer
  useEffect(() => {
    const interval = setInterval(() => setFocusTime(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Show popup
  useEffect(() => {
    if (currentStep >= 1) {
      setShowPopup(true)
      setIsRunning(true)
    }
  }, [currentStep])

  // Action sequence runner
  useEffect(() => {
    if (!isRunning || currentStep < 1) return
    
    const action = ACTION_SEQUENCE[actionIndex % ACTION_SEQUENCE.length]
    
    let timeout: NodeJS.Timeout
    
    const executeAction = () => {
      switch (action.type) {
        case "move":
          setCursorPos({ x: action.x, y: action.y })
          break
        case "click":
          setIsClicking(true)
          setClickCount(prev => prev + 1)
          setTimeout(() => setIsClicking(false), 150)
          // Highlight clicked row if in table area
          if (cursorPos.y > 45 && cursorPos.y < 85) {
            setSelectedRow(Math.floor((cursorPos.y - 45) / 10))
          }
          break
        case "tab":
          setActiveTab(action.tab)
          setSearchText("")
          setScrollOffset(0)
          setSelectedRow(null)
          break
        case "scroll":
          setScrollOffset(prev => action.direction === "down" ? Math.min(prev + 50, 100) : Math.max(prev - 50, 0))
          break
        case "type":
          // Type letter by letter
          let i = 0
          const typeInterval = setInterval(() => {
            if (i < action.text.length) {
              setSearchText(action.text.slice(0, i + 1))
              i++
            } else {
              clearInterval(typeInterval)
            }
          }, 80)
          break
        case "wait":
          // Just wait
          break
      }
    }
    
    executeAction()
    
    // Move to next action
    const delay = action.type === "wait" ? action.duration : 
                  action.type === "type" ? action.text.length * 80 + 200 :
                  action.type === "move" ? 500 : 300
    
    timeout = setTimeout(() => {
      setActionIndex(prev => (prev + 1) % ACTION_SEQUENCE.length)
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [actionIndex, isRunning, currentStep, cursorPos.y])

  // Get URL based on active tab
  const getUrl = () => {
    switch (activeTab) {
      case "crm": return "app.company-crm.com/dashboard"
      case "gmail": return "mail.google.com/mail/u/0/#inbox"
      case "calendar": return "calendar.google.com/calendar/r/week"
    }
  }

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
      {/* Browser Chrome */}
      <div className="bg-gradient-to-b from-gray-700 to-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 ml-2">
          {[
            { id: "crm", label: "CRM" },
            { id: "gmail", label: "Gmail" },
            { id: "calendar", label: "Calendar" },
          ].map((tab) => (
            <div
              key={tab.id}
              className={`px-3 py-1 rounded-t-lg text-[10px] font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-gray-800" 
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
        
        <div className="flex-1 flex items-center justify-center ml-2">
          <div className="bg-gray-900/50 rounded-lg px-3 py-1 flex items-center gap-2 text-[10px] max-w-[220px] w-full">
            <Shield className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 truncate">{getUrl()}</span>
          </div>
        </div>
        
        {/* Extension icon */}
        <div 
          className="p-1.5 rounded-lg bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
          onClick={() => setShowPopup(!showPopup)}
        >
          <Sparkles className="w-4 h-4 text-gray-300" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative h-[420px] bg-white overflow-hidden">
        <AnimatePresence mode="wait">
          {/* CRM Content */}
          {activeTab === "crm" && (
            <motion.div
              key="crm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* App Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Menu className="w-5 h-5 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-700" />
                    <span className="font-semibold text-gray-800 text-sm">Sales Dashboard</span>
                  </div>
                </div>
                
                <div className="flex-1 max-w-md mx-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <div className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-sm text-gray-400">
                      Search...
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                </div>
              </div>
              
              {/* Dashboard Content */}
              <motion.div 
                className="p-4"
                animate={{ y: -scrollOffset }}
                transition={{ duration: 0.3 }}
              >
                {/* Metrics */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Revenue", value: "$124.5K", change: "+12%" },
                    { label: "Deals", value: "47", change: "+5" },
                    { label: "Conversion", value: "23%", change: "+2%" },
                    { label: "Pipeline", value: "$890K", change: "+18%" },
                  ].map((m, i) => (
                    <motion.div 
                      key={m.label} 
                      className={`p-3 rounded-xl border transition-all ${
                        selectedRow === null && cursorPos.x > (i * 25) && cursorPos.x < ((i + 1) * 25) && cursorPos.y > 20 && cursorPos.y < 35
                          ? "bg-gray-100 border-gray-300"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <p className="text-[10px] text-gray-500">{m.label}</p>
                      <p className="text-lg font-bold text-gray-900">{m.value}</p>
                      <p className="text-[10px] text-gray-500">{m.change}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Recent Deals</span>
                    <span className="text-xs text-gray-500">View all →</span>
                  </div>
                  {[
                    { name: "Acme Corp", amount: "$45,000", status: "Won" },
                    { name: "TechStart Inc", amount: "$28,500", status: "Pending" },
                    { name: "Global Systems", amount: "$67,200", status: "Won" },
                    { name: "DataFlow Ltd", amount: "$15,800", status: "In Progress" },
                    { name: "CloudFirst", amount: "$92,000", status: "Pending" },
                  ].map((deal, i) => (
                    <div
                      key={deal.name}
                      className={`px-4 py-2.5 border-b border-gray-100 flex items-center justify-between transition-all ${
                        selectedRow === i ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {deal.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deal.name}</p>
                          <p className="text-xs text-gray-500">{deal.amount}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        deal.status === "Won" ? "bg-gray-100 text-gray-700" :
                        deal.status === "Pending" ? "bg-gray-100 text-gray-600" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {deal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Gmail Content */}
          {activeTab === "gmail" && (
            <motion.div
              key="gmail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* Gmail Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-4">
                <Menu className="w-5 h-5 text-gray-400" />
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <div className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm">
                      {searchText || <span className="text-gray-400">Search mail</span>}
                      {searchText && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300" />
              </div>
              
              {/* Gmail List */}
              <div className="flex h-[calc(100%-52px)]">
                {/* Sidebar */}
                <div className="w-16 bg-gray-50 border-r border-gray-100 py-2 px-2">
                  {["Inbox", "Starred", "Sent", "Drafts"].map((item) => (
                    <div key={item} className="py-2 px-2 rounded-lg text-[10px] text-gray-600 hover:bg-gray-100">
                      {item}
                    </div>
                  ))}
                </div>
                
                {/* Email List */}
                <div className="flex-1 overflow-hidden">
                  {[
                    { from: "John Smith", subject: "Q4 Invoice Review Required", time: "10:32 AM", unread: true },
                    { from: "Finance Team", subject: "Monthly Report - October", time: "9:15 AM", unread: true },
                    { from: "Sarah Chen", subject: "Re: Project Timeline Update", time: "Yesterday", unread: false },
                    { from: "HR Department", subject: "Benefits Enrollment Reminder", time: "Yesterday", unread: false },
                    { from: "Mike Johnson", subject: "Meeting Notes - Sprint Planning", time: "Nov 28", unread: false },
                    { from: "Acme Corp", subject: "Contract Renewal Discussion", time: "Nov 27", unread: false },
                    { from: "Support", subject: "Ticket #4521 Resolved", time: "Nov 26", unread: false },
                  ].map((email, i) => (
                    <div
                      key={i}
                      className={`px-4 py-3 border-b border-gray-100 flex items-center gap-3 transition-all cursor-pointer ${
                        selectedRow === i ? "bg-gray-100" : "hover:bg-gray-50"
                      } ${email.unread ? "bg-gray-50" : ""}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${email.unread ? "bg-gray-400" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${email.unread ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                            {email.from}
                          </span>
                          <span className="text-[10px] text-gray-400">{email.time}</span>
                        </div>
                        <p className={`text-xs truncate ${email.unread ? "text-gray-800" : "text-gray-500"}`}>
                          {email.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Calendar Content */}
          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* Calendar Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Menu className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-gray-800 text-sm">December 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs bg-gray-200 rounded-lg">Today</button>
                  <button className="p-1"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                  <button className="p-1"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="p-3">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 0 // Starting from Monday Dec 1
                    const isCurrentMonth = day >= 0 && day < 31
                    const hasEvent = [2, 5, 8, 10, 15, 18, 22].includes(day)
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg p-1 text-center transition-all ${
                          !isCurrentMonth ? "text-gray-300" :
                          day === 2 ? "bg-gray-900 text-white" :
                          selectedRow === Math.floor(i / 7) ? "bg-gray-100" :
                          "hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-[10px]">{isCurrentMonth ? day + 1 : ""}</span>
                        {hasEvent && isCurrentMonth && (
                          <div className="mt-0.5 h-1 w-full bg-gray-300 rounded-full" />
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Upcoming */}
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Upcoming</p>
                  {[
                    { title: "Sprint Planning", time: "10:00 AM" },
                    { title: "Client Call - Acme", time: "2:00 PM" },
                    { title: "Team Standup", time: "4:00 PM" },
                  ].map((event, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        selectedRow === i + 5 ? "bg-gray-100" : "bg-gray-50"
                      }`}
                    >
                      <div className="w-1 h-8 bg-gray-400 rounded-full" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{event.title}</p>
                        <p className="text-[10px] text-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Cursor */}
        <motion.div
          className="absolute pointer-events-none z-50"
          animate={{ 
            left: `${cursorPos.x}%`, 
            top: `${cursorPos.y}%`,
            scale: isClicking ? 0.85 : 1
          }}
          transition={{ 
            left: { duration: 0.5, ease: "easeOut" },
            top: { duration: 0.5, ease: "easeOut" },
            scale: { duration: 0.1 }
          }}
          style={{ transform: "translate(-2px, -2px)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
            <path 
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.86a.5.5 0 0 0-.85.35Z" 
              fill="#111827" 
              stroke="#fff" 
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
        
        {/* Extension Popup */}
        <AnimatePresence>
          {showPopup && currentStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-2 right-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-30"
            >
              <div className="bg-gray-900 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-medium text-xs">Pharo Discovery</span>
                  </div>
                  <Badge className="bg-white/10 text-white text-[8px] border-0 h-4">Active</Badge>
                </div>
              </div>
              
              <div className="p-2.5 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MousePointerClick className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[9px] text-gray-500">Clicks</span>
                    </div>
                    <motion.p 
                      key={clickCount}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-gray-900"
                    >
                      {clickCount}
                    </motion.p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[9px] text-gray-500">Focus</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.floor(focusTime / 60)}:{String(focusTime % 60).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                
                {/* Current app indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg">
                  <Globe className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-600 capitalize">{activeTab}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">Tracking</span>
                </div>
                
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <p className="text-[8px] font-medium text-gray-400 uppercase tracking-wider">Tracking</p>
                    {TRACKING_OPTIONS.slice(0, 3).map((opt) => (
                      <div 
                        key={opt.key}
                        className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-gray-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <opt.icon className="w-2.5 h-2.5 text-gray-400" />
                          <span className="text-[10px] text-gray-700">{opt.label}</span>
                        </div>
                        <Switch
                          checked={extensionSettings[opt.key] as boolean}
                          onCheckedChange={(checked) => onToggleSetting(opt.key, checked)}
                          className="scale-[0.6]"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-medium text-gray-400 uppercase">Insight</p>
                      <Badge className="bg-gray-100 text-gray-600 text-[7px] h-3.5 border-gray-200">New</Badge>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-1.5">
                        <Lightbulb className="w-3 h-3 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-medium text-gray-900">Repetitive Task</p>
                          <p className="text-[9px] text-gray-500">Invoice copy-paste 12x</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button size="sm" className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[10px] h-7 gap-1">
                      <Download className="w-3 h-3" />
                      Install Extension
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Tour Step
function TourStep({ 
  step, 
  isActive, 
  stepNumber,
  extensionSettings,
  onToggleSetting
}: { 
  step: typeof TOUR_STEPS[0]
  isActive: boolean 
  stepNumber: number
  extensionSettings: Record<string, boolean>
  onToggleSetting: (key: string, value: boolean) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
      className={`transition-all duration-300 ${isActive ? "" : "pointer-events-none"}`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {stepNumber + 1}
          </div>
          <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed pl-10">{step.description}</p>
        
        <div className="pl-10">
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-normal text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {step.highlight}
          </Badge>
        </div>
        
        {step.id === "tracking" && isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pl-10 pt-1 grid grid-cols-2 gap-1.5"
          >
            {TRACKING_OPTIONS.map((opt) => (
              <div 
                key={opt.key}
                className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-gray-50 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <opt.icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-700">{opt.label}</span>
                </div>
                <Switch
                  checked={extensionSettings[opt.key] as boolean}
                  onCheckedChange={(checked) => onToggleSetting(opt.key, checked)}
                  className="scale-75"
                />
              </div>
            ))}
          </motion.div>
        )}
        
        {step.id === "download" && isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-10 pt-1">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white gap-2 h-9">
              <Chrome className="w-4 h-4" />
              Add to Chrome
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Free • No credit card required
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function OnboardingDiscovery({ onNext, onSkip }: OnboardingDiscoveryProps) {
  const { state, updateExtensionSettings, setIntegrationResponsible, getPersonById } = useOnboarding()
  
  const [activeTab, setActiveTab] = useState<ActiveTab>("extension")
  const [currentTourStep, setCurrentTourStep] = useState(0)
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false)

  const integrationResponsible = state.integrationResponsibleId 
    ? getPersonById(state.integrationResponsibleId)
    : null

  const handleToggleSetting = (key: string, value: boolean) => {
    updateExtensionSettings({ [key]: value })
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 pb-2 px-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gray-100">
            <Sparkles className="w-4 h-4 text-gray-600" />
          </div>
        </div>
        <h1 className="text-2xl font-light text-gray-900">
          Set up <span className="font-semibold">Discovery</span>
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Configure how Sapira discovers automation opportunities
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="px-8 mb-8">
        <div className="max-w-5xl mx-auto">
          <div 
            className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { id: "extension", label: "Browser Extension", icon: Chrome },
              { id: "integrations", label: "Integrations", icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "extension" && (
              <motion.div
                key="extension"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-5 gap-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left - Tour */}
                <div className="col-span-2 space-y-4">
                  <TourStep
                    step={TOUR_STEPS[currentTourStep]}
                    isActive={true}
                    stepNumber={currentTourStep}
                    extensionSettings={state.extensionSettings}
                    onToggleSetting={handleToggleSetting}
                  />
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentTourStep(prev => Math.max(0, prev - 1))}
                      disabled={currentTourStep === 0}
                      className="gap-2 text-gray-500 h-8 text-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1.5">
                      {TOUR_STEPS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentTourStep(i)}
                          className={`transition-all duration-300 rounded-full ${
                            i === currentTourStep
                              ? "w-5 h-1.5 bg-gray-900"
                              : i < currentTourStep
                                ? "w-1.5 h-1.5 bg-gray-400"
                                : "w-1.5 h-1.5 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentTourStep(prev => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                      disabled={currentTourStep === TOUR_STEPS.length - 1}
                      className="gap-2 text-gray-500 h-8 text-sm"
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Right - Browser */}
                <div className="col-span-3">
                  <BrowserSimulation
                    currentStep={currentTourStep}
                    extensionSettings={state.extensionSettings}
                    onToggleSetting={handleToggleSetting}
                  />
                  
                  <div className="flex items-start gap-2 mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Shield className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <p className="text-[11px] text-gray-500">
                      All data is encrypted and processed locally. Only aggregated insights are stored.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "integrations" && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-xl mx-auto space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center py-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Database className="w-7 h-7 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign integration responsible</h3>
                  <p className="text-gray-500 mt-1.5 text-sm">
                    Choose someone from your team to manage integrations.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Select Team Member</h3>
                      <p className="text-xs text-gray-500">From your invited team</p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowResponsibleDropdown(!showResponsibleDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      {integrationResponsible ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {(integrationResponsible.name || integrationResponsible.email)[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {integrationResponsible.name || integrationResponsible.email}
                            </p>
                            <p className="text-xs text-gray-500">{integrationResponsible.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Select a team member</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showResponsibleDropdown ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showResponsibleDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                        >
                          {state.invitedPeople.length > 0 ? (
                            <div className="max-h-48 overflow-auto">
                              {state.invitedPeople.map((person) => (
                                <button
                                  key={person.id}
                                  onClick={() => {
                                    setIntegrationResponsible(person.id)
                                    setShowResponsibleDropdown(false)
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {(person.name || person.email)[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-left flex-1">
                                    <p className="text-sm font-medium text-gray-900">{person.name || person.email}</p>
                                    <p className="text-xs text-gray-500 capitalize">{person.role.replace('_', ' ')}</p>
                                  </div>
                                  {state.integrationResponsibleId === person.id && (
                                    <Check className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No team members invited yet</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {integrationResponsible && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <Check className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {integrationResponsible.name || integrationResponsible.email} is now responsible
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-gray-500" />
                    Why assign a responsible?
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      "Single point of contact for integration issues",
                      "Faster resolution of data sync problems",
                      "Clear ownership for security and compliance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onSkip} className="text-gray-500 h-9">
            Skip for now
          </Button>
          <Button
            onClick={onNext}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 gap-2 h-9"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
