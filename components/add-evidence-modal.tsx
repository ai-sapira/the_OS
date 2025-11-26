"use client"

import * as React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Link2,
  FileText,
  Image,
  File,
  X,
  Check,
  Loader2,
  Globe,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// File type icons mapping
const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  default: File,
}

// Predefined compliance tags
const COMPLIANCE_TAGS = [
  { id: "dora", label: "DORA" },
  { id: "iso27001", label: "ISO27001" },
  { id: "soc2", label: "SOC 2" },
  { id: "gdpr", label: "GDPR" },
  { id: "legal", label: "Legal" },
  { id: "audit", label: "Auditoría" },
  { id: "policy", label: "Política" },
  { id: "security", label: "Seguridad" },
]

interface FilePreview {
  name: string
  size: number
  type: string
  preview?: string
}

interface AddEvidenceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: {
    type: "file" | "link"
    title: string
    description: string
    tags: string[]
    file?: File
    url?: string
  }) => void
}

export function AddEvidenceModal({ open, onOpenChange, onSubmit }: AddEvidenceModalProps) {
  const [evidenceType, setEvidenceType] = useState<"file" | "link">("file")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [file, setFile] = useState<FilePreview | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [urlValid, setUrlValid] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setEvidenceType("file")
      setTitle("")
      setDescription("")
      setUrl("")
      setSelectedTags([])
      setFile(null)
      setUrlValid(null)
    }
  }, [open])

  // Handle URL validation
  useEffect(() => {
    if (evidenceType !== "link" || !url) {
      setUrlValid(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        new URL(url)
        setIsValidating(true)
        await new Promise(r => setTimeout(r, 500))
        setUrlValid(true)
      } catch {
        setUrlValid(false)
      } finally {
        setIsValidating(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [url, evidenceType])

  // File handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [])

  const processFile = (f: File) => {
    const preview: FilePreview = {
      name: f.name,
      size: f.size,
      type: f.type,
    }
    
    if (f.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        preview.preview = reader.result as string
        setFile(preview)
      }
      reader.readAsDataURL(f)
    } else {
      setFile(preview)
    }

    if (!title) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt.replace(/[_-]/g, " "))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "default"
    return fileTypeIcons[ext] || fileTypeIcons.default
  }

  const handleSubmit = () => {
    onSubmit?.({
      type: evidenceType,
      title,
      description,
      tags: selectedTags,
      url: evidenceType === "link" ? url : undefined,
    })
    onOpenChange(false)
  }

  const isValid = title.trim() && (
    (evidenceType === "file" && file) || 
    (evidenceType === "link" && urlValid)
  )

  const displayTitle = title.trim() || "Evidence"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="overflow-visible p-0 sm:max-w-2xl gap-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.2 }
              }}
            >
              <DialogHeader className="border-b px-6 py-4 mb-0">
                <DialogTitle>Add evidence</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Document compliance with files or links.
                </p>
              </DialogHeader>

              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>

              <div className="flex flex-col-reverse md:flex-row">
                {/* Left Panel */}
                <div className="md:w-72 md:border-r">
                  <div className="border-t p-6 md:border-none">
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted p-3">
                        <Paperclip className="size-5 text-foreground" aria-hidden />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium text-foreground">{displayTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {evidenceType === "file" ? "File upload" : "External link"}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <h4 className="text-sm font-medium text-foreground">Description</h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Evidence helps document compliance and supports audit processes.
                    </p>
                    
                    {selectedTags.length > 0 && (
                      <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected tags</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map(tagId => {
                            const tag = COMPLIANCE_TAGS.find(t => t.id === tagId)
                            return tag ? (
                              <span key={tagId} className="text-xs bg-background px-2 py-0.5 rounded border">
                                {tag.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex flex-1 flex-col p-6 md:px-6 md:pb-8 md:pt-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="flex-1 space-y-6"
                  >
                    {/* Step 1: Type */}
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.25 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                          1
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            Evidence type
                          </Label>
                          <p className="text-xs text-muted-foreground">Choose file upload or external link.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEvidenceType("file")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                            evidenceType === "file"
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                          )}
                        >
                          <FolderOpen className="h-4 w-4" />
                          File
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvidenceType("link")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                            evidenceType === "link"
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                          )}
                        >
                          <Globe className="h-4 w-4" />
                          Link
                        </button>
                      </div>
                    </motion.div>

                    {/* Step 2: Upload/URL */}
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                          2
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            {evidenceType === "file" ? "Upload file" : "Enter URL"}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {evidenceType === "file" ? "PDF, Word, Excel, Images — Up to 10MB" : "Paste the full URL to the resource."}
                          </p>
                        </div>
                      </div>

                      {evidenceType === "file" ? (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                            className="hidden"
                          />
                          
                          {!file ? (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={cn(
                                "border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                isDragging
                                  ? "border-foreground bg-muted"
                                  : "border-border hover:border-foreground/50 hover:bg-muted/50"
                              )}
                            >
                              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Drop file here or click to browse
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt="Preview"
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                  {React.createElement(getFileIcon(file.name), {
                                    className: "h-5 w-5 text-muted-foreground"
                                  })}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFile(null)
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {isValidating ? (
                              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : urlValid === true ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : urlValid === false ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Link2 className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/document"
                            className={cn(
                              "pl-10 h-11 rounded-lg border bg-background/70 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30",
                              urlValid === true && "border-emerald-200",
                              urlValid === false && "border-red-200"
                            )}
                          />
                        </div>
                      )}
                    </motion.div>

                    {/* Step 3: Title */}
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.25 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                          3
                        </div>
                        <div>
                          <Label htmlFor="evidence-title" className="text-sm font-medium text-foreground">
                            Title & description
                          </Label>
                          <p className="text-xs text-muted-foreground">Give the evidence a clear name.</p>
                        </div>
                      </div>
                      <Input
                        id="evidence-title"
                        placeholder="Evidence title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-11 rounded-lg border border-border bg-background/70 px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                      <Textarea
                        placeholder="Add context or notes (optional)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[80px] rounded-lg border border-border bg-background/70 px-4 py-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                    </motion.div>

                    {/* Step 4: Tags */}
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.25 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex size-6 items-center justify-center rounded-sm bg-muted text-sm text-foreground">
                          4
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            Compliance tags
                          </Label>
                          <p className="text-xs text-muted-foreground">Select relevant compliance frameworks.</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {COMPLIANCE_TAGS.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                              selectedTags.includes(tag.id)
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                            )}
                          >
                            {selectedTags.includes(tag.id) && (
                              <Check className="h-3 w-3 inline mr-1" />
                            )}
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.2 }}
                    className="mt-6 flex items-center justify-end pt-4"
                  >
                    <Button 
                      type="button" 
                      size="sm" 
                      disabled={!isValid}
                      onClick={handleSubmit}
                    >
                      {evidenceType === "file" ? "Upload evidence" : "Save link"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
