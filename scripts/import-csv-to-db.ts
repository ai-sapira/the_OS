#!/usr/bin/env tsx

/**
 * Import CSV file with Business Units, Projects and Initiatives to Supabase
 * 
 * Usage:
 *   1. Create your CSV file (see example below)
 *   2. Run: npx tsx scripts/import-csv-to-db.ts path/to/your/file.csv <organization_slug>
 * 
 * CSV Format (comma-separated):
 * business_unit_name,business_unit_slug,project_name,project_slug,initiative_title,initiative_description,priority,status,reporter_email,assignee_email,rise_score,tags
 * 
 * Example:
 * Finance,finance,ERP Migration,erp-migration,Optimize invoice processing,Reduce manual processing,high,backlog,miguel@company.com,ana@company.com,85,"automation,finance"
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Parse CSV (simple parser, handles quoted fields)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }
  
  return rows
}

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

function mapIssueState(status?: string | null): string {
  const normalized = (status || '').toLowerCase()
  switch (normalized) {
    case 'todo':
    case 'backlog':
    case 'to_do':
      return 'todo'
    case 'in_progress':
    case 'progress':
    case 'doing':
      return 'in_progress'
    case 'blocked':
      return 'blocked'
    case 'waiting':
    case 'waiting_info':
      return 'waiting_info'
    case 'done':
    case 'completed':
      return 'done'
    case 'canceled':
    case 'cancelled':
      return 'canceled'
    case 'duplicate':
      return 'duplicate'
    default:
      return 'triage'
  }
}

async function importCSV(csvPath: string, orgSlug: string) {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('📂 Reading CSV file:', csvPath)
  
  // Read and parse CSV
  if (!fs.existsSync(csvPath)) {
    console.error('❌ File not found:', csvPath)
    process.exit(1)
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  
  console.log(`✅ Parsed ${rows.length} rows from CSV\n`)
  
  // Get organization
  console.log('🔍 Finding organization:', orgSlug)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()
  
  if (orgError || !org) {
    console.error('❌ Organization not found:', orgSlug)
    process.exit(1)
  }
  
  console.log(`✅ Found organization: ${org.name} (${org.id})\n`)
  
  // Track created entities
  const businessUnits = new Map<string, string>() // slug -> id
  const projects = new Map<string, string>() // slug -> id
  const users = new Map<string, string>() // email -> id
  
  // Get existing users
  console.log('👥 Loading existing users...')
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id, email')
  
  if (existingUsers) {
    existingUsers.forEach(user => {
      users.set(user.email, user.id)
    })
    console.log(`✅ Found ${users.size} existing users\n`)
  }
  
  // Process rows
  let createdBUs = 0
  let createdProjects = 0
  let createdIssues = 0
  let errors = 0
  
  for (const row of rows) {
    try {
      // 1. Create or get Business Unit (Initiative)
      if (!businessUnits.has(row.business_unit_slug)) {
        console.log(`📦 Creating Business Unit: ${row.business_unit_name}`)
        
        const { data: bu, error: buError } = await supabase
          .from('initiatives')
          .upsert({
            organization_id: org.id,
            name: row.business_unit_name,
            slug: row.business_unit_slug,
            description: `Business Unit: ${row.business_unit_name}`,
            active: true
          }, {
            onConflict: 'slug,organization_id'
          })
          .select()
          .single()
        
        if (buError) {
          // Try to get existing
          const { data: existing } = await supabase
            .from('initiatives')
            .select('id')
            .eq('slug', row.business_unit_slug)
            .eq('organization_id', org.id)
            .single()
          
          if (existing) {
            businessUnits.set(row.business_unit_slug, existing.id)
            console.log(`  ✅ Using existing BU: ${existing.id}`)
          } else {
            throw buError
          }
        } else {
          businessUnits.set(row.business_unit_slug, bu.id)
          createdBUs++
          console.log(`  ✅ Created BU: ${bu.id}`)
        }
      }
      
      const buId = businessUnits.get(row.business_unit_slug)!
      
      // 2. Create or get Project
      const projectKey = `${row.business_unit_slug}:${row.project_slug}`
      if (!projects.has(projectKey)) {
        console.log(`  📁 Creating Project: ${row.project_name}`)
        
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .upsert({
            organization_id: org.id,
            initiative_id: buId,
            name: row.project_name,
            slug: row.project_slug,
            description: row.project_name,
            status: 'active'
          }, {
            onConflict: 'slug,organization_id'
          })
          .select()
          .single()
        
        if (projectError) {
          // Try to get existing
          const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('slug', row.project_slug)
            .eq('organization_id', org.id)
            .single()
          
          if (existing) {
            projects.set(projectKey, existing.id)
            console.log(`    ✅ Using existing Project: ${existing.id}`)
          } else {
            throw projectError
          }
        } else {
          projects.set(projectKey, project.id)
          createdProjects++
          console.log(`    ✅ Created Project: ${project.id}`)
        }
      }
      
      const projectId = projects.get(projectKey)!
      
      // 3. Get or validate users
      const reporterEmail = row.reporter_email?.trim()
      const assigneeEmail = row.assignee_email?.trim()
      
      if (!reporterEmail || !users.has(reporterEmail)) {
        console.warn(`    ⚠️  Reporter email not found: ${reporterEmail}`)
        continue
      }
      
      const reporterId = users.get(reporterEmail)!
      const assigneeId = assigneeEmail && users.has(assigneeEmail) 
        ? users.get(assigneeEmail) 
        : null
      
      // 4. Create Issue (Initiative)
      console.log(`    📝 Creating Issue: ${row.initiative_title}`)
      
      const tagsArray = row.tags 
        ? row.tags.split(',').map(t => t.trim()).filter(Boolean)
        : []
      
      const { data: issue, error: issueError } = await supabase
        .from('issues')
        .insert({
          organization_id: org.id,
          initiative_id: buId,
          project_id: projectId,
          title: row.initiative_title,
          description: row.initiative_description || row.initiative_title,
          priority: row.priority || 'medium',
          state: mapIssueState(row.status),
          reporter_id: reporterId,
          assignee_id: assigneeId,
          rise_score: row.rise_score ? parseInt(row.rise_score) : null,
          tags: tagsArray
        })
        .select()
        .single()
      
      if (issueError) {
        console.error(`    ❌ Error creating issue:`, issueError.message)
        errors++
      } else {
        createdIssues++
        console.log(`    ✅ Created Issue: ${issue.key}`)
      }
      
    } catch (err) {
      console.error(`❌ Error processing row:`, err)
      console.error('   Row data:', row)
      errors++
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Business Units created: ${createdBUs}`)
  console.log(`✅ Projects created: ${createdProjects}`)
  console.log(`✅ Issues created: ${createdIssues}`)
  if (errors > 0) {
    console.log(`❌ Errors: ${errors}`)
  }
  console.log('='.repeat(60))
}

// CLI
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: npx tsx scripts/import-csv-to-db.ts <csv_file> <organization_slug>')
  console.log('')
  console.log('Example:')
  console.log('  npx tsx scripts/import-csv-to-db.ts data/initiatives.csv gonvarri')
  process.exit(1)
}

const [csvPath, orgSlug] = args
importCSV(csvPath, orgSlug).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})




