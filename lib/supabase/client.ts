import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../database/types'

// For client-side, Next.js injects these at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iaazpsvjiltlkhyeakmx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYXpwc3ZqaWx0bGtoeWVha214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Nzk1MTAsImV4cCI6MjA3NDQ1NTUxMH0.kVn7eIZEzNjImOe5yNgqPJOzN-IGUjN2AkzOALflZms'

// Use createBrowserClient for Next.js - it handles cookies correctly
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
