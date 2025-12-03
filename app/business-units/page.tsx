"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  Target,
} from "lucide-react";
import { 
  ResizableAppShell, 
  ResizablePageSheet, 
  PageHeader
} from "@/components/layout";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerButton } from "@/components/ui/manager-button";
import { Spinner } from "@/components/ui/spinner";

// API and Types
import { BusinessUnitsAPI, BusinessUnitWithManager } from "@/lib/api/business-units";
import { useAuth } from "@/lib/context/auth-context";

// Filters Component
import { InitiativesFiltersBar } from "@/components/ui/initiatives-filters";

// Editable Components
import { EditableManagerDropdown } from "@/components/ui/editable-manager-dropdown";
import { EditableStatusDropdown } from "@/components/ui/editable-status-dropdown";
import { NewInitiativeModal } from "@/components/new-initiative-modal";

// Card List Component  
function BusinessUnitsCardList({ 
  filters, 
  globalFilter,
  onDataChange,
  refreshKey
}: { 
  filters?: any[], 
  globalFilter?: string,
  onDataChange?: () => void,
  refreshKey?: number
}) {
  const router = useRouter();
  const { currentOrg } = useAuth();
  const [data, setData] = useState<BusinessUnitWithManager[]>([]);
  const [filteredData, setFilteredData] = useState<BusinessUnitWithManager[]>([]);
  const [loading, setLoading] = useState(true);

  // Load business units data
  useEffect(() => {
    const loadBusinessUnits = async () => {
      if (!currentOrg?.organization?.id) {
        setLoading(false);
        setData([]);
        return;
      }

      try {
        setLoading(true);
        const businessUnits = await BusinessUnitsAPI.getBusinessUnits(currentOrg.organization.id, { includeInactive: true });
        console.log('[BusinessUnitsCardList] Loaded business units:', businessUnits.map(bu => ({ name: bu.name, slug: bu.slug })));
        setData(businessUnits);
      } catch (error) {
        console.error('Error loading business units:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessUnits();
  }, [refreshKey, currentOrg?.organization?.id]);

  // Apply filters when data, filters, or globalFilter changes
  useEffect(() => {
    let filtered = [...data];

    // Apply global filter (search)
    if (globalFilter) {
      filtered = filtered.filter(initiative => 
        initiative.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        initiative.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        initiative.manager?.name.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Apply specific filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (filter.value && filter.value.length > 0) {
          const filterValue = filter.value[0];
          
          switch (filter.type) {
            case "Status":
              filtered = filtered.filter(initiative => {
                const isActive = initiative.active;
                return (filterValue === "Active" && isActive) || (filterValue === "Inactive" && !isActive);
              });
              break;
            case "Assignee":
            case "Manager":
              filtered = filtered.filter(initiative => {
                if (filterValue === "No Manager") {
                  return !initiative.manager;
                } else {
                  return initiative.manager?.name === filterValue;
                }
              });
              break;
            case "Labels": // Issue Count
              filtered = filtered.filter(initiative => {
                const issueCount = initiative._count?.issues || 0;
                switch (filterValue) {
                  case "No issues":
                    return issueCount === 0;
                  case "1-5 issues":
                    return issueCount >= 1 && issueCount <= 5;
                  case "6-15 issues":
                    return issueCount >= 6 && issueCount <= 15;
                  case "16+ issues":
                    return issueCount >= 16;
                  default:
                    return true;
                }
              });
              break;
          }
        }
      });
    }

    setFilteredData(filtered);
  }, [data, filters, globalFilter]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-12"
        >
          <Spinner size="md" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {filteredData.length > 0 ? (
            filteredData.map((initiative, index) => (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-[1fr_120px_180px_200px] gap-4 items-center">
                  {/* Initiative Column */}
                  <motion.div 
                    className="flex items-center space-x-3"
                    onClick={() => router.push(`/business-units/${initiative.slug}`)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Target className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{initiative.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {initiative.description}
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Column */}
                  <div>
                    <EditableStatusDropdown
                      currentStatus={initiative.active}
                      initiativeId={initiative.id}
                      onStatusChange={(newStatus) => {
                        // Update local state immediately for optimistic UI
                        const updatedData = data.map(item => 
                          item.id === initiative.id 
                            ? { ...item, active: newStatus }
                            : item
                        );
                        setData(updatedData);
                        
                        // Call parent refresh if needed
                        onDataChange?.();
                      }}
                    />
                  </div>

                  {/* Manager Column */}
                  <div>
                    <EditableManagerDropdown
                      currentManager={initiative.manager}
                      initiativeId={initiative.id}
                      onManagerChange={(newManager) => {
                        // Update local state immediately for optimistic UI
                        const updatedData = data.map(item => 
                          item.id === initiative.id 
                            ? { ...item, manager: newManager }
                            : item
                        );
                        setData(updatedData);
                        
                        // Call parent refresh if needed
                        onDataChange?.();
                      }}
                    />
                  </div>

                  {/* Issues Column */}
                  <div>
                    {initiative._count && initiative._count.issues > 0 ? (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-gray-900">{initiative._count.issues}</span>
                          <span className="text-gray-500">total</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-blue-600">{initiative._count.active_issues}</span>
                          <span className="text-gray-500">active</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-green-600">{initiative._count.completed_issues}</span>
                          <span className="text-gray-500">done</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No issues</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No business units found</p>
              <p className="text-sm">Get started by creating your first business unit</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function BusinessUnitsPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dataVersion, setDataVersion] = useState(0)

  const handleFiltersChange = (newFilters: any[], newGlobalFilter: string) => {
    setFilters(newFilters)
    setGlobalFilter(newGlobalFilter)
  }

  const handleBusinessUnitCreated = () => {
    // Force refresh by incrementing data version
    setDataVersion(v => v + 1)
  }

  return (
    <ResizableAppShell
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
    >
      <ResizablePageSheet
        header={
          <div>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Workspace</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">Business Units</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        }
        toolbar={
          <div className="bg-white border-b border-stroke" style={{ height: 'var(--header-h)' }}>
            <div className="flex items-center justify-between h-full" style={{ paddingLeft: '18px', paddingRight: '20px', paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}>
              <InitiativesFiltersBar onFiltersChange={handleFiltersChange} />
            </div>
          </div>
        }
      >
        {/* Container that goes to edges - compensate sheet padding exactly */}
        <div className="-mx-5 -mt-4">
          {/* Level 1: Column Names - border goes edge to edge */}
          <div className="py-2 border-b border-stroke bg-gray-50/30" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <div className="grid grid-cols-[1fr_120px_180px_200px] gap-4">
              <div className="text-[13px] font-medium text-gray-500">Business unit</div>
              <div className="text-[13px] font-medium text-gray-500">Status</div>
              <div className="text-[13px] font-medium text-gray-500">Manager</div>
              <div className="text-[13px] font-medium text-gray-500">Issues</div>
            </div>
          </div>

          {/* Content: Business Units List */}
          <div className="bg-white" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
            <BusinessUnitsCardList 
              filters={filters} 
              globalFilter={globalFilter}
              refreshKey={dataVersion}
              onDataChange={() => {
                // Refresh data if needed
                console.log('Data updated, could refresh here');
              }}
            />
          </div>
        </div>
      </ResizablePageSheet>

      {/* Create Initiative Modal */}
      <NewInitiativeModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onCreateInitiative={handleBusinessUnitCreated}
      />
    </ResizableAppShell>
  );
}
