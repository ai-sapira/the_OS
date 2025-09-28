"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AcceptIssueModal, 
  ConfirmModal, 
  DrawerModal 
} from "@/components/ui/modal"

// Ejemplo de uso del nuevo sistema de modales
export function ModalExamples() {
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [dangerModalOpen, setDangerModalOpen] = useState(false)
  const [drawerModalOpen, setDrawerModalOpen] = useState(false)

  // Datos de ejemplo para el issue
  const exampleIssue = {
    id: "1",
    key: "SAI-123",
    title: "Implement dark mode toggle",
    description: "Users have requested the ability to toggle between light and dark themes",
    status: "triage",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Modal Design System Examples</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => setAcceptModalOpen(true)}>
          Open Accept Issue Modal
        </Button>
        
        <Button onClick={() => setConfirmModalOpen(true)}>
          Open Confirm Modal
        </Button>
        
        <Button 
          onClick={() => setDangerModalOpen(true)}
          variant="destructive"
        >
          Open Danger Modal
        </Button>
        
        <Button onClick={() => setDrawerModalOpen(true)}>
          Open Drawer Modal
        </Button>
      </div>

      {/* Accept Issue Modal */}
      <AcceptIssueModal
        issue={exampleIssue}
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
        onAccept={(data) => {
          console.log('Accept:', data)
        }}
        onDuplicate={(data) => {
          console.log('Duplicate:', data)
        }}
        onDecline={(data) => {
          console.log('Decline:', data)
        }}
        onSnooze={(data) => {
          console.log('Snooze:', data)
        }}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        title="Save changes?"
        description="Your changes will be saved permanently. This action cannot be undone."
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          console.log('Confirmed')
        }}
        onCancel={() => {
          console.log('Cancelled')
        }}
      />

      {/* Danger Modal */}
      <ConfirmModal
        open={dangerModalOpen}
        onOpenChange={setDangerModalOpen}
        title="Delete project?"
        description="This action cannot be undone. All data associated with this project will be permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          console.log('Deleted')
        }}
        onCancel={() => {
          console.log('Cancelled delete')
        }}
      />

      {/* Drawer Modal */}
      <DrawerModal
        open={drawerModalOpen}
        onOpenChange={setDrawerModalOpen}
        title="Project Settings"
        subtitle="Configure your project preferences"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-[13px] border border-[color:var(--stroke)] rounded-lg bg-[color:var(--surface-3)] focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)]"
              placeholder="Enter project name..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              className="w-full px-3 py-2 text-[13px] border border-[color:var(--stroke)] rounded-lg bg-[color:var(--surface-3)] focus:outline-none focus:ring-2 focus:ring-[color:var(--modal-accent)] min-h-[100px] resize-none"
              placeholder="Project description..."
            />
          </div>
        </div>
      </DrawerModal>
    </div>
  )
}
