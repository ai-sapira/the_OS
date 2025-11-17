"use client"

import { useMemo } from 'react'
import { OrgPerson, ROLE_DESCRIPTIONS } from '@/lib/mock/organization-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Target, Users, ArrowDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth-context'
import Image from 'next/image'

interface OrganizationChartProps {
  data: OrgPerson[]
  view: "strategy" | "execution" | "all"
}

function PersonCard({ person, compact = false }: { person: OrgPerson; compact?: boolean }) {
  const roleInfo = ROLE_DESCRIPTIONS[person.role]
  
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1.5 border rounded bg-background/50 hover:bg-background transition-colors">
        <Avatar className="h-6 w-6">
          <AvatarImage src={person.avatar_url} />
          <AvatarFallback className="text-[10px]">{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{person.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{person.position}</p>
        </div>
      </div>
    )
  }
  
  return (
    <Card className="p-2.5 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={person.avatar_url} />
          <AvatarFallback className="text-xs">{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-xs truncate">{person.name}</h3>
            <Badge 
              variant="secondary" 
              className={cn(roleInfo.color, "text-white text-[10px] px-1 py-0 flex-shrink-0")}
            >
              {person.role}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{person.position}</p>
        </div>

        <div className="flex gap-1.5 flex-shrink-0 ml-auto">
          {person.projects_count !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              <Target className="h-2.5 w-2.5 mr-1" />
              {person.projects_count}
            </Badge>
          )}
          {person.issues_count !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              <Users className="h-2.5 w-2.5 mr-1" />
              {person.issues_count}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

export function OrganizationChart({ data, view }: OrganizationChartProps) {
  const { currentOrg } = useAuth()
  
  // Organize data by layer and side
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

  const showStrategy = view === 'all' || view === 'strategy'
  const showExecution = view === 'all' || view === 'execution'

  return (
    <div className="w-full h-full overflow-auto p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* STRATEGY LAYER */}
        {showStrategy && (
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* SAPIRA - Strategy */}
            <div>
              <div className="bg-black text-white p-2 text-center rounded-t-lg mb-2">
                <h2 className="text-base font-bold">Sapira</h2>
              </div>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
                <div className="bg-black text-white p-2 text-center rounded-md mb-2">
                  <h3 className="text-xs font-semibold">Advisory leads</h3>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-3 leading-relaxed">
                  These are the ones advising on the roadmap, feedback and how we can drive the strategy forward.
                </p>
                <div className="space-y-2">
                  {organized.sapiraStrategy.map(person => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </div>

            {/* GONVARRI - Strategy */}
            <div>
              <div className="bg-black text-white p-2 text-center rounded-t-lg mb-2 flex items-center justify-center gap-2">
                <h2 className="text-base font-bold">Gonvarri</h2>
                {currentOrg?.organization.logo_url ? (
                  <Image 
                    src={currentOrg.organization.logo_url}
                    alt={`${currentOrg.organization.name} Logo`}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full bg-white object-contain"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-semibold text-gray-700">
                    {currentOrg?.organization.name?.substring(0, 2).toUpperCase() || 'GO'}
                  </div>
                )}
              </div>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
                <div className="bg-black text-white p-2 text-center rounded-md mb-2">
                  <h3 className="text-xs font-semibold">Change leaders</h3>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-3 leading-relaxed">
                  These are the ones who drive the AI transformation strategy within the company and draw the roadmap.
                </p>
                <div className="space-y-2">
                  {organized.gonvarriStrategy.map(person => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connector arrows */}
        {view === 'all' && (
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex-1 flex justify-end">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 flex justify-start">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* EXECUTION LAYER */}
        {showExecution && (
          <div className="grid grid-cols-2 gap-8">
            {/* SAPIRA - Execution */}
            <div>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
                <div className="bg-black text-white p-2 text-center rounded-md mb-2">
                  <h3 className="text-xs font-semibold italic">FDEs: forward deployed engineers</h3>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-3 leading-relaxed">
                  Team of fully dedicated hybrid engineers that have direct relationship with BUs and employees, gathering feedback, creating initiatives and tracking performance.
                </p>
                <div className="space-y-2">
                  {organized.sapiraExecution.map(person => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </div>

            {/* GONVARRI - Execution */}
            <div>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-black text-white p-1.5 text-center rounded-md">
                    <h3 className="text-xs font-semibold">Finance</h3>
                  </div>
                  <div className="bg-black text-white p-1.5 text-center rounded-md">
                    <h3 className="text-xs font-semibold">Legal</h3>
                  </div>
                  <div className="bg-black text-white p-1.5 text-center rounded-md">
                    <h3 className="text-xs font-semibold">HR</h3>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground text-center mb-3 leading-relaxed">
                  Squads/BUs with its managers and employees
                </p>

                {/* Group by department */}
                <div className="space-y-3">
                  {['Finance', 'Legal', 'HR'].map(dept => {
                    const manager = organized.gonvarriExecution.find(p => p.department === dept && p.role === 'BU')
                    const employees = organized.gonvarriExecution.filter(p => p.department === dept && p.role === 'EMP')
                    
                    if (!manager) return null
                    
                    return (
                      <div key={dept} className="space-y-1.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <h4 className="font-semibold text-xs">{dept}</h4>
                        </div>
                        <PersonCard person={manager} />
                        {employees.length > 0 && (
                          <div className="ml-4 space-y-1 border-l-2 border-muted pl-2">
                            {employees.map(emp => (
                              <PersonCard key={emp.id} person={emp} compact />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layer label */}
        {view === 'all' && (
          <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-muted-foreground/30" />
              <span>Strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Execution</span>
              <div className="h-px w-8 bg-muted-foreground/30" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

