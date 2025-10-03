"use client"

import { useMemo, useState } from 'react'
import { OrgPerson, ROLE_DESCRIPTIONS } from '@/lib/mock/organization-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Target, Users, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationListProps {
  data: OrgPerson[]
}

function PersonListItem({ person }: { person: OrgPerson }) {
  const roleInfo = ROLE_DESCRIPTIONS[person.role]
  
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={person.avatar_url} />
        <AvatarFallback className="text-xs">{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{person.name}</h4>
          <Badge 
            variant="secondary" 
            className={cn(roleInfo.color, "text-white text-[10px] px-1.5 py-0 flex-shrink-0")}
          >
            {person.role}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{person.position}</p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {person.projects_count !== undefined && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            <Target className="h-3 w-3 mr-1" />
            {person.projects_count}
          </Badge>
        )}
        {person.issues_count !== undefined && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            <Users className="h-3 w-3 mr-1" />
            {person.issues_count}
          </Badge>
        )}
      </div>
    </div>
  )
}

export function OrganizationList({ data }: OrganizationListProps) {
  const [openSections, setOpenSections] = useState<string[]>([
    'sapira-strategy',
    'gonvarri-strategy', 
    'sapira-execution',
    'gonvarri-execution'
  ])

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  // Organize data
  const organized = useMemo(() => {
    const sapiraStrategy = data.filter(p => p.side === 'sapira' && p.layer === 'strategy')
    const gonvarriStrategy = data.filter(p => p.side === 'gonvarri' && p.layer === 'strategy')
    const sapiraExecution = data.filter(p => p.side === 'sapira' && p.layer === 'execution')
    const gonvarriExecution = data.filter(p => p.side === 'gonvarri' && p.layer === 'execution')
    
    return {
      sapiraStrategy,
      gonvarriStrategy,
      sapiraExecution,
      gonvarriExecution,
    }
  }, [data])

  return (
    <div className="w-full h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* STRATEGY LAYER */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">STRATEGY LAYER</h2>
          </div>
          
          <div className="space-y-3 ml-6">
            {/* Sapira - Advisory Leads */}
            <Card className="overflow-hidden">
              <button 
                className="w-full"
                onClick={() => toggleSection('sapira-strategy')}
              >
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {openSections.includes('sapira-strategy') ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">Sapira - Advisory Leads</h3>
                      <p className="text-xs text-muted-foreground">
                        {organized.sapiraStrategy.length} persona{organized.sapiraStrategy.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Strategy
                  </Badge>
                </div>
              </button>
              {openSections.includes('sapira-strategy') && (
                <div className="border-t px-3 py-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    These are the ones advising on the roadmap, feedback and how we can drive the strategy forward.
                  </p>
                  <div className="space-y-1">
                    {organized.sapiraStrategy.map(person => (
                      <PersonListItem key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Gonvarri - Change Leaders */}
            <Card className="overflow-hidden">
              <button 
                className="w-full"
                onClick={() => toggleSection('gonvarri-strategy')}
              >
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {openSections.includes('gonvarri-strategy') ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">Gonvarri - Change Leaders</h3>
                      <p className="text-xs text-muted-foreground">
                        {organized.gonvarriStrategy.length} persona{organized.gonvarriStrategy.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Strategy
                  </Badge>
                </div>
              </button>
              {openSections.includes('gonvarri-strategy') && (
                <div className="border-t px-3 py-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    These are the ones who drive the AI transformation strategy within the company and draw the roadmap.
                  </p>
                  <div className="space-y-1">
                    {organized.gonvarriStrategy.map(person => (
                      <PersonListItem key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* EXECUTION LAYER */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 bg-green-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">EXECUTION LAYER</h2>
          </div>
          
          <div className="space-y-3 ml-6">
            {/* Sapira - FDEs */}
            <Card className="overflow-hidden">
              <button 
                className="w-full"
                onClick={() => toggleSection('sapira-execution')}
              >
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {openSections.includes('sapira-execution') ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">Sapira - FDEs (Forward Deployed Engineers)</h3>
                      <p className="text-xs text-muted-foreground">
                        {organized.sapiraExecution.length} persona{organized.sapiraExecution.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Execution
                  </Badge>
                </div>
              </button>
              {openSections.includes('sapira-execution') && (
                <div className="border-t px-3 py-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    Team of fully dedicated hybrid engineers that have direct relationship with BUs and employees.
                  </p>
                  <div className="space-y-1">
                    {organized.sapiraExecution.map(person => (
                      <PersonListItem key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Gonvarri - Departments */}
            <Card className="overflow-hidden">
              <button 
                className="w-full"
                onClick={() => toggleSection('gonvarri-execution')}
              >
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {openSections.includes('gonvarri-execution') ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">Gonvarri - Departments</h3>
                      <p className="text-xs text-muted-foreground">
                        {organized.gonvarriExecution.length} persona{organized.gonvarriExecution.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Execution
                  </Badge>
                </div>
              </button>
              {openSections.includes('gonvarri-execution') && (
                  <div className="border-t px-3 py-2 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      Squads/BUs with its managers and employees
                    </p>
                    
                    {/* Group by department */}
                    <div className="space-y-4">
                      {['Finance', 'Legal', 'HR'].map(dept => {
                        const deptPeople = organized.gonvarriExecution.filter(p => p.department === dept)
                        const manager = deptPeople.find(p => p.role === 'BU')
                        const employees = deptPeople.filter(p => p.role === 'EMP')
                        
                        if (deptPeople.length === 0) return null
                        
                        return (
                          <div key={dept} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-semibold text-sm">{dept}</h4>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {deptPeople.length}
                              </Badge>
                            </div>
                            
                            {manager && <PersonListItem person={manager} />}
                            
                            {employees.length > 0 && (
                              <div className="ml-6 space-y-1 border-l-2 border-muted pl-4">
                                {employees.map(emp => (
                                  <PersonListItem key={emp.id} person={emp} />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}

