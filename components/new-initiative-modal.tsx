"use client"

import { useState, useEffect } from "react"
import { X, Maximize2, ChevronDown, User, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { InitiativesAPI } from "@/lib/api/initiatives"
import { useAuth } from "@/lib/context/auth-context"

interface NewInitiativeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateInitiative?: () => void
}

// PropertyChip component - matching the app's style
interface PropertyChipProps {
  icon: React.ReactNode
  label: string
  value: string
  options: Array<{ name: string; label: string; icon?: React.ReactNode; avatar?: string }>
  onSelect: (value: string) => void
  loading?: boolean
}

function PropertyChip({ icon, label, value, options, onSelect, loading = false }: PropertyChipProps) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")

  const dropdownWidth = "w-[200px]"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg"
        >
          <div className="flex-shrink-0 text-gray-500">
            {icon}
          </div>
          <span className="text-gray-700 whitespace-nowrap">
            {value}
          </span>
          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`${dropdownWidth} p-1 rounded-2xl border-gray-200 shadow-lg`}
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgb(229 229 229)',
          backgroundColor: '#ffffff',
        }}
      >
        <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black">
          <CommandInput
            placeholder="Buscar..."
            className="h-7 border-0 focus:ring-0 text-[14px] placeholder:text-gray-400 pl-0"
            value={commandInput}
            onValueChange={setCommandInput}
          />
          <CommandList>
            <CommandEmpty className="text-gray-400 py-3 text-center text-xs">
              {loading ? "Cargando..." : "No se encontraron opciones."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.name}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.name)
                    setOpen(false)
                    setCommandInput("")
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
                    {option.avatar && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
                        {option.avatar}
                      </div>
                    )}
                    <span className="flex-1 text-sm">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function NewInitiativeModal({ open, onOpenChange, onCreateInitiative }: NewInitiativeModalProps) {
  const { currentOrg } = useAuth()
  const [createMore, setCreateMore] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [managers, setManagers] = useState<any[]>([])
  const [loadingManagers, setLoadingManagers] = useState(true)

  const { refreshData } = useSupabaseData()

  // Load available managers from database
  useEffect(() => {
    const loadManagers = async () => {
      if (!currentOrg?.organization?.id) {
        setLoadingManagers(false)
        return
      }

      try {
        setLoadingManagers(true)
        const availableManagers = await InitiativesAPI.getAvailableManagers(currentOrg.organization.id)
        setManagers(availableManagers)
      } catch (error) {
        console.error('Error loading managers:', error)
      } finally {
        setLoadingManagers(false)
      }
    }
    
    if (open) {
      loadManagers()
    }
  }, [open, currentOrg?.organization?.id])

  const resetForm = () => {
    setName("")
    setDescription("")
    setSelectedManagerId(null)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!currentOrg?.organization?.id) {
        throw new Error('No organization selected')
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

      await InitiativesAPI.createInitiative({
        name: name.trim(),
        slug,
        description: description.trim() || null,
        manager_user_id: selectedManagerId,
        active: true,
      }, currentOrg.organization.id)

      // Refresh data
      await refreshData()
      onCreateInitiative?.()
      
      if (createMore) {
        resetForm()
      } else {
        onOpenChange(false)
        setTimeout(resetForm, 300)
      }
    } catch (error) {
      console.error("Error creating initiative:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 300)
    }
  }, [open])

  const selectedManager = selectedManagerId ? managers.find(m => m.id === selectedManagerId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 border border-gray-200">
        <div className="flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium">{currentOrg?.organization.name || 'Organización'}</span>
                <span className="text-neutral-400">›</span>
                <span className="font-medium text-neutral-900">New business unit</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:bg-gray-100 hover:text-neutral-700">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:bg-gray-100 hover:text-neutral-700"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-5 space-y-3">
            {/* Initiative Name */}
            <input
              type="text"
              placeholder="Business unit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xl font-medium text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0"
              autoFocus
            />

            {/* Description */}
            <textarea
              placeholder="Add a short summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] text-sm text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none"
            />
          </div>

          {/* Action Buttons - Using PropertyChips */}
          <div className="px-6 py-4 flex items-center gap-2 flex-wrap">
            <PropertyChip
              icon={<User className="h-3.5 w-3.5 text-gray-500" />}
              label="Manager"
              value={selectedManager?.name || "Sin asignar"}
              options={[
                { name: "null", label: "Sin asignar", icon: <User className="w-2.5 h-2.5 text-gray-400" /> },
                ...managers.map(manager => ({
                  name: manager.id,
                  label: manager.name,
                  avatar: manager.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                }))
              ]}
              onSelect={(value) => setSelectedManagerId(value === "null" ? null : value)}
              loading={loadingManagers}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={createMore}
                onCheckedChange={setCreateMore}
                className="data-[state=checked]:bg-blue-500"
              />
              <span className="text-sm text-neutral-600">Create more</span>
            </div>

            <Button 
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create business unit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

