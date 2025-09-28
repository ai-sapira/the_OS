"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle,
  User,
  Calendar,
  CalendarPlus,
  TrendingUp,
  ListFilter,
  Settings as SettingsIcon,
  X
} from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { AnimateChangeInHeight } from "@/components/ui/filters";
// We'll create our own Filters component for initiatives
import {
  DueDate,
  Filter,
  FilterOperator,
  FilterOption,
  FilterType,
  filterViewOptions,
  filterViewToFilterOptions,
  Status,
  Assignee,
  Labels,
  Priority,
} from "@/components/ui/filters";

// Extended filter types for initiatives
export enum InitiativeFilterType {
  STATUS = "Status",
  MANAGER = "Manager",
  NAME = "Name",
  DESCRIPTION = "Description",
  SLUG = "Slug",
  CREATED_DATE = "Created Date",
  UPDATED_DATE = "Updated Date",
  ISSUE_COUNT = "Issue Count",
  ACTIVE_ISSUES = "Active Issues",
  COMPLETED_ISSUES = "Completed Issues",
}

export enum InitiativeStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum InitiativeManager {
  ANA_MARTINEZ = "Ana Martínez",
  LAURA_GARCIA = "Laura García",
  CARLOS_RODRIGUEZ = "Carlos Rodríguez",
  MIGUEL_LOPEZ = "Miguel López",
  NO_MANAGER = "No Manager",
}

export enum IssueCountRange {
  NONE = "No issues",
  LOW = "1-5 issues",
  MEDIUM = "6-15 issues",
  HIGH = "16+ issues",
}

// Extended FilterOption type for initiatives
type InitiativeFilterOption = {
  name: FilterType | Status | Assignee | Labels | Priority | DueDate | InitiativeStatus | InitiativeManager | IssueCountRange | string;
  icon: React.ReactNode | undefined;
  label?: string;
};

// Custom filter options for initiatives with minimalist gray icons
const initiativeStatusOptions: InitiativeFilterOption[] = Object.values(InitiativeStatus).map(
  (status) => ({
    name: status,
    icon: <CheckCircle className={`w-3.5 h-3.5 ${status === InitiativeStatus.ACTIVE ? 'text-green-600' : 'text-gray-400'}`} />,
  })
);

const initiativeManagerOptions: InitiativeFilterOption[] = Object.values(InitiativeManager).map(
  (manager) => ({
    name: manager,
    icon: <User className="w-3.5 h-3.5 text-gray-600" />,
  })
);

const issueCountOptions: InitiativeFilterOption[] = Object.values(IssueCountRange).map(
  (range) => ({
    name: range,
    icon: <TrendingUp className="w-3.5 h-3.5 text-gray-600" />,
  })
);

const dateOptions: InitiativeFilterOption[] = [
  { name: "Last 7 days", icon: <Calendar className="w-3.5 h-3.5 text-gray-600" /> },
  { name: "Last 30 days", icon: <Calendar className="w-3.5 h-3.5 text-gray-600" /> },
  { name: "Last 90 days", icon: <Calendar className="w-3.5 h-3.5 text-gray-600" /> },
  { name: "This year", icon: <Calendar className="w-3.5 h-3.5 text-gray-600" /> },
];

// Extended filter mapping for initiatives
const initiativeFilterViewToFilterOptions: Record<FilterType, InitiativeFilterOption[]> = {
  [FilterType.STATUS]: initiativeStatusOptions,
  [FilterType.ASSIGNEE]: initiativeManagerOptions,
  [FilterType.LABELS]: issueCountOptions, // Repurposing for issue counts
  [FilterType.PRIORITY]: [], // Not used for initiatives
  [FilterType.DUE_DATE]: [], // Not used for initiatives
  [FilterType.CREATED_DATE]: dateOptions,
  [FilterType.UPDATED_DATE]: dateOptions,
};

// Extended filter view options for initiatives with minimalist icons
const initiativeFilterViewOptions: InitiativeFilterOption[][] = [
  [
    {
      name: FilterType.STATUS,
      icon: <CheckCircle className="w-3.5 h-3.5 text-gray-600" />,
    },
    {
      name: FilterType.ASSIGNEE,
      icon: <User className="w-3.5 h-3.5 text-gray-600" />,
      label: "Manager",
    },
    {
      name: FilterType.LABELS,
      icon: <TrendingUp className="w-3.5 h-3.5 text-gray-600" />,
      label: "Issue Count",
    },
  ],
  [
    {
      name: FilterType.CREATED_DATE,
      icon: <CalendarPlus className="w-3.5 h-3.5 text-gray-600" />,
    },
    {
      name: FilterType.UPDATED_DATE,
      icon: <Calendar className="w-3.5 h-3.5 text-gray-600" />,
    },
  ],
];

// Custom Filters component for initiatives with minimalist styling
function InitiativeFilters({
  filters,
  setFilters,
}: {
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}) {
  return (
    <div className="flex gap-2">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => {
          const options = initiativeFilterViewToFilterOptions[filter.type] || [];
          const filterValue = filter.value[0];
          const matchingOption = options.find(option => option.name === filterValue);

          // Get the display name (use label if available, otherwise use the filter type)
          const displayName = filter.type === FilterType.ASSIGNEE ? "Manager" :
                             filter.type === FilterType.LABELS ? "Issue Count" :
                             filter.type;

          return (
            <div key={filter.id} className="flex items-center text-xs h-7 rounded-lg overflow-hidden border-dashed border border-gray-200 bg-gray-50">
              <div className="flex gap-1.5 shrink-0 hover:bg-gray-100 px-3 h-full items-center transition-colors">
                {matchingOption?.icon}
                <span className="text-gray-600 font-medium text-xs">{displayName}</span>
              </div>
              <div className="hover:bg-gray-100 px-2 h-full flex items-center text-gray-600 transition-colors shrink-0 text-xs border-l border-gray-200">
                {filter.operator}
              </div>
              <div className="hover:bg-gray-100 px-3 h-full flex items-center text-gray-600 transition-colors shrink-0 border-l border-gray-200">
                <div className="flex gap-1.5 items-center">
                  {matchingOption?.icon}
                  <span className="text-gray-600 text-xs">{filterValue}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFilters((prev) => prev.filter((f) => f.id !== filter.id));
                }}
                className="hover:bg-gray-100 h-full w-8 text-gray-500 hover:text-gray-700 transition-colors shrink-0 border-l border-gray-200"
              >
                <span className="text-xs">×</span>
              </Button>
            </div>
          );
        })}
    </div>
  );
}

export function InitiativesFiltersBar({
  onFiltersChange
}: {
  onFiltersChange?: (filters: Filter[], globalFilter: string) => void
}) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(null);
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>([]);

  // Notify parent when filters change
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters, globalFilter);
    }
  }, [filters, globalFilter, onFiltersChange]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* Filters Component */}
        <div className="flex gap-2 flex-wrap items-center">
          <InitiativeFilters filters={filters} setFilters={setFilters} />
          {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition flex gap-1.5 items-center rounded-lg px-3 text-xs"
              onClick={() => setFilters([])}
            >
              Clear
            </Button>
          )}
          <Popover
            open={open}
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) {
                setTimeout(() => {
                  setSelectedView(null);
                  setCommandInput("");
                }, 200);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                size="sm"
                className={cn(
                  "h-7 border-dashed bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 gap-1.5 px-3 text-xs rounded-lg",
                  filters.length > 0 && "w-8 px-0"
                )}
              >
                <ListFilter className="h-3 w-3 shrink-0 transition-all text-gray-500" />
                {!filters.length && <span className="text-xs">Filter</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[200px] p-1 rounded-2xl border-gray-200 shadow-lg"
              style={{
                // Force override of command item styles
                ['--cmdk-item-selected-bg' as any]: 'rgb(245 245 245)',
                ['--cmdk-item-selected-color' as any]: 'rgb(0 0 0)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgb(229 229 229)',
                backgroundColor: '#ffffff',
              }}
            >
              <AnimateChangeInHeight>
                <Command className="[&_[cmdk-item][data-selected='true']]:!bg-gray-100 [&_[cmdk-item][data-selected='true']]:!text-black [&_[cmdk-item]:hover]:!bg-gray-100 [&_[cmdk-item]:hover]:!text-black [&_[cmdk-item][aria-selected='true']]:!bg-gray-100 [&_[cmdk-item][aria-selected='true']]:!text-black [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:mx-1 [&_[cmdk-input-wrapper]]:px-3 [&_[cmdk-input-wrapper]]:py-1.5 [&_[cmdk-input-wrapper]_svg]:!text-black [&_[cmdk-input-wrapper]_svg]:!opacity-100 [&_[cmdk-input-wrapper]_svg]:!w-3.5 [&_[cmdk-input-wrapper]_svg]:!h-3.5 [&_[cmdk-input-wrapper]_svg]:!mr-2 [&_[cmdk-input-wrapper]]:!flex [&_[cmdk-input-wrapper]]:!items-center [&_[cmdk-input-wrapper]_svg]:!stroke-2">
                  <CommandInput
                    placeholder={selectedView ? selectedView : "Search..."}
                    className="h-8 border-0 focus:ring-0 text-sm placeholder:text-gray-400 pl-0"
                    value={commandInput}
                    onInputCapture={(e) => {
                      setCommandInput(e.currentTarget.value);
                    }}
                    ref={commandInputRef}
                  />
                  <CommandList>
                    <CommandEmpty className="text-gray-400 py-4 text-center text-sm">No filters found.</CommandEmpty>
                    {selectedView ? (
                      <CommandGroup>
                        {initiativeFilterViewToFilterOptions[selectedView].map(
                          (filter: InitiativeFilterOption) => (
                            <CommandItem
                              className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black aria-selected:!bg-gray-100 aria-selected:!text-black flex items-center px-3 py-1.5 cursor-pointer [&[data-selected='true']]:!bg-gray-100 [&[data-selected='true']]:!text-black mx-1 rounded-xl transition-all duration-150"
                              key={filter.name}
                              value={filter.name}
                              onSelect={(currentValue) => {
                                setFilters((prev) => [
                                  ...prev,
                                  {
                                    id: nanoid(),
                                    type: selectedView,
                                    operator: FilterOperator.IS,
                                    value: [currentValue],
                                  },
                                ]);
                                setTimeout(() => {
                                  setSelectedView(null);
                                  setCommandInput("");
                                }, 200);
                                setOpen(false);
                              }}
                            >
                              <div className="w-4 h-4 flex items-center justify-center text-black font-bold">
                                {filter.icon}
                              </div>
                              <span className="text-black font-normal ml-2 flex-1">
                                {filter.name}
                              </span>
                              {filter.label && (
                                <span className="text-gray-400 text-xs ml-auto">
                                  {filter.label}
                                </span>
                              )}
                            </CommandItem>
                          )
                        )}
                      </CommandGroup>
                    ) : (
                      initiativeFilterViewOptions.map(
                        (group: InitiativeFilterOption[], index: number) => (
                          <React.Fragment key={index}>
                            <CommandGroup>
                              {group.map((filter: InitiativeFilterOption) => (
                                <CommandItem
                                  className="group text-gray-600 hover:!text-black hover:!bg-gray-100 data-[selected=true]:!bg-gray-100 data-[selected=true]:!text-black aria-selected:!bg-gray-100 aria-selected:!text-black flex items-center px-3 py-1.5 cursor-pointer [&[data-selected='true']]:!bg-gray-100 [&[data-selected='true']]:!text-black mx-1 rounded-xl transition-all duration-150"
                                  key={filter.name}
                                  value={filter.name}
                                  onSelect={(currentValue) => {
                                    setSelectedView(currentValue as FilterType);
                                    setCommandInput("");
                                    commandInputRef.current?.focus();
                                  }}
                                >
                                  <div className="w-4 h-4 flex items-center justify-center text-black font-bold">
                                    {filter.icon}
                                  </div>
                                  <span className="text-black font-normal ml-2 flex-1">
                                    {filter.label || filter.name}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            {index < initiativeFilterViewOptions.length - 1 && (
                              <CommandSeparator className="border-gray-100 my-0.5" />
                            )}
                          </React.Fragment>
                        )
                      )
                    )}
                  </CommandList>
                </Command>
              </AnimateChangeInHeight>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Display Settings */}
      <div className="flex items-center space-x-2">
         <Button variant="outline" size="sm" className="h-7 bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-700 border-dashed px-3 text-xs rounded-lg">
          <SettingsIcon className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
          Display
        </Button>
      </div>
    </div>
  );
}