/**
 * Script to import Gonvarri initiatives from CSV to issues table
 * Run with: npx tsx scripts/import-gonvarri-initiatives.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Organization and user IDs (from your existing data)
const ORGANIZATION_ID = '01234567-8901-2345-6789-012345678901'
const AI_AGENT_USER_ID = '11111111-1111-1111-1111-111111111111' // SAP user as reporter

// Priority calculation: difficulty (1-3) + impact_score (1-3) = total (2-6)
// 6: P0, 5: P1, 3-4: P2, 2: P3
function calculatePriority(difficulty: number, impactScore: number): 'P0' | 'P1' | 'P2' | 'P3' {
  const total = difficulty + impactScore
  if (total >= 6) return 'P0'
  if (total >= 5) return 'P1'
  if (total >= 3) return 'P2'
  return 'P3'
}

// Parse CSV line (simple parser for comma-separated values)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

interface GonvarriInitiative {
  initiativeNumber: string
  initiative: string
  businessUnit: string
  project: string
  shortDescription: string
  impact: string
  coreTechnology: string
  difficulty: number
  impactScore: number
}

async function main() {
  console.log('🚀 Starting Gonvarri initiatives import...\n')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'Gonvarri clean initiatives shared - Hoja 1.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  // Skip header
  const dataLines = lines.slice(1)
  
  console.log(`📄 Found ${dataLines.length} initiatives in CSV\n`)

  // Track statistics
  let successCount = 0
  let errorCount = 0
  const createdIssues: any[] = []

  // Process each initiative
  for (const line of dataLines) {
    const fields = parseCSVLine(line)
    
    if (fields.length < 9) {
      console.log(`⚠️  Skipping invalid line: ${line.substring(0, 50)}...`)
      errorCount++
      continue
    }

    const initiative: GonvarriInitiative = {
      initiativeNumber: fields[0],
      initiative: fields[1],
      businessUnit: fields[2],
      project: fields[3],
      shortDescription: fields[4],
      impact: fields[5],
      coreTechnology: fields[6],
      difficulty: parseInt(fields[7]) || 1,
      impactScore: parseInt(fields[8]) || 1
    }

    const priority = calculatePriority(initiative.difficulty, initiative.impactScore)

    try {
      // Generate unique key
      const key = `GON-${initiative.initiativeNumber}`
      
      // Create issue
      const { data: issue, error } = await supabase
        .from('issues')
        .insert({
          organization_id: ORGANIZATION_ID,
          key,
          title: initiative.initiative,
          description: `Business Unit: ${initiative.businessUnit}\nProject: ${initiative.project}\n\n${initiative.shortDescription}\n\nImpact: ${initiative.impact}\nCore Technology: ${initiative.coreTechnology}`,
          short_description: initiative.shortDescription,
          impact: initiative.impact,
          core_technology: initiative.coreTechnology,
          priority,
          state: 'triage',
          origin: 'api',
          reporter_id: AI_AGENT_USER_ID
        })
        .select()
        .single()

      if (error) {
        console.log(`❌ Error creating issue for "${initiative.initiative}": ${error.message}`)
        errorCount++
        continue
      }

      console.log(`✅ Created ${key}: ${initiative.initiative} [${priority}]`)
      successCount++
      createdIssues.push(issue)

    } catch (err: any) {
      console.log(`❌ Exception for "${initiative.initiative}": ${err.message}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Import Summary:')
  console.log('='.repeat(60))
  console.log(`✅ Successfully imported: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📝 Total processed: ${dataLines.length}`)
  console.log('='.repeat(60) + '\n')

  // Save 2 example issues for bot knowledge
  if (createdIssues.length >= 2) {
    console.log('💾 Saving example issues for bot knowledge...\n')
    
    const examples = [
      createdIssues.find(i => i.key === 'GON-6'), // Agile pricing
      createdIssues.find(i => i.key === 'GON-50')  // FraudFinder AI
    ].filter(Boolean)

    const examplesPath = path.join(process.cwd(), 'sapira-teams-bot', 'bot', 'gonvarri-examples.json')
    fs.writeFileSync(examplesPath, JSON.stringify(examples, null, 2))
    
    console.log(`✅ Saved ${examples.length} examples to: ${examplesPath}`)
    console.log('\nExample issues:')
    examples.forEach(ex => {
      console.log(`  - ${ex.key}: ${ex.title}`)
      console.log(`    Priority: ${ex.priority}, Impact: ${ex.impact}`)
      console.log(`    Tech: ${ex.core_technology}\n`)
    })
  }

  console.log('🎉 Import completed!\n')
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
