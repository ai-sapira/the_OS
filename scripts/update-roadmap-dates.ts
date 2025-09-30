#!/usr/bin/env ts-node

/**
 * Script para actualizar las fechas del roadmap de Gonvarri
 * Distribuye los proyectos e issues a lo largo de 2025 de manera coherente
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateRoadmapDates() {
  console.log('🚀 Iniciando actualización de fechas del roadmap...\n')

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'update-roadmap-dates.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Dividir en queries individuales (separadas por ';')
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'))

    console.log(`📝 Ejecutando ${queries.length} actualizaciones...\n`)

    let successCount = 0
    let errorCount = 0

    for (const query of queries) {
      if (query.includes('UPDATE projects')) {
        const match = query.match(/WHERE name = '([^']+)'/)
        const projectName = match ? match[1] : 'unknown'
        
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.error(`❌ Error updating project ${projectName}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Proyecto actualizado: ${projectName}`)
          successCount++
        }
      } else if (query.includes('UPDATE issues')) {
        const match = query.match(/WHERE key = '([^']+)'/)
        const issueKey = match ? match[1] : 'unknown'
        
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.error(`❌ Error updating issue ${issueKey}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Issue actualizado: ${issueKey}`)
          successCount++
        }
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`\n✨ Actualización completada!`)
    console.log(`   ✅ Exitosas: ${successCount}`)
    console.log(`   ❌ Errores: ${errorCount}`)
    console.log('\n📊 Distribución de roadmap:')
    console.log('   • Q1 2025: Finance & Critical Systems (11 issues)')
    console.log('   • Q2 2025: HR & Legal Compliance (10 issues)')
    console.log('   • Q3 2025: Procurement & Sales (6 issues)')
    console.log('   • Q4 2025: Analytics & Development (6 issues)')
    console.log('\n🎯 Próximo paso: Abre el roadmap en /roadmap para verificar')
    console.log('='.repeat(50) + '\n')

  } catch (error) {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  }
}

// Ejecutar
updateRoadmapDates()
